const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Workspace = require('../models/Workspace');
const Member = require('../models/Member');
const RefreshSession = require('../models/RefreshSession');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken
} = require('../utils/jwt');
const { asyncHandler } = require('../middleware/errorHandler');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_DAYS = 30;

function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    // SameSite=None è necessario perché frontend (Cloudflare Pages) e
    // backend (Render) vivono su domini diversi. Richiede Secure=true,
    // quindi in produzione il backend deve essere servito su HTTPS
    // (Render lo garantisce di default).
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: REFRESH_COOKIE_DAYS * 24 * 60 * 60 * 1000,
    path: '/api/auth'
  };
}

async function issueTokensAndSession(user, req, res) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  await RefreshSession.create({
    userId: user._id,
    tokenHash: hashToken(refreshToken),
    userAgent: req.headers['user-agent'] || '',
    expiresAt: new Date(Date.now() + REFRESH_COOKIE_DAYS * 24 * 60 * 60 * 1000)
  });

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
  return accessToken;
}

const register = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: 'Email non valida' });
  }
  if (!password || password.length < 8) {
    return res.status(400).json({ error: 'La password deve avere almeno 8 caratteri' });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ error: 'Esiste già un account con questa email' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ email: email.toLowerCase(), passwordHash, name: name || '' });

  // Ogni utente ha automaticamente il proprio workspace personale,
  // pronto per essere condiviso con altri utenti in futuro (Fase 10/V1)
  // senza bisogno di migrare i dati esistenti.
  const workspace = await Workspace.create({
    name: `Spazio di ${user.name || user.email}`,
    ownerId: user._id
  });
  await Member.create({ workspaceId: workspace._id, userId: user._id, role: 'owner' });

  const accessToken = await issueTokensAndSession(user, req, res);

  res.status(201).json({
    accessToken,
    user: { id: user._id, email: user.email, name: user.name },
    workspace: { id: workspace._id, name: workspace.name }
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e password sono obbligatorie' });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  // Messaggio identico per email inesistente o password errata:
  // evita di rivelare quali email sono registrate.
  const genericError = { error: 'Credenziali non valide' };

  if (!user) {
    return res.status(401).json(genericError);
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json(genericError);
  }

  const accessToken = await issueTokensAndSession(user, req, res);
  const workspace = await Workspace.findOne({ ownerId: user._id });

  res.json({
    accessToken,
    user: { id: user._id, email: user.email, name: user.name },
    workspace: workspace ? { id: workspace._id, name: workspace.name } : null
  });
});

const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ error: 'Sessione non presente' });
  }

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch (err) {
    return res.status(401).json({ error: 'Sessione scaduta, effettua di nuovo il login' });
  }

  const tokenHash = hashToken(token);
  const session = await RefreshSession.findOne({ tokenHash, revoked: false });
  if (!session) {
    return res.status(401).json({ error: 'Sessione revocata o non valida' });
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    return res.status(401).json({ error: 'Utente non trovato' });
  }

  // Rotazione: la vecchia sessione viene revocata e ne viene emessa una nuova.
  session.revoked = true;
  await session.save();

  const accessToken = await issueTokensAndSession(user, req, res);
  res.json({ accessToken });
});

const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  if (token) {
    const tokenHash = hashToken(token);
    await RefreshSession.updateOne({ tokenHash }, { revoked: true });
  }
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
  res.json({ ok: true });
});

// Logout globale: revoca tutte le sessioni attive dell'utente autenticato
// (utile in caso di sospetto accesso non autorizzato).
const logoutAll = asyncHandler(async (req, res) => {
  await RefreshSession.updateMany({ userId: req.userId, revoked: false }, { revoked: true });
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
  res.json({ ok: true });
});

module.exports = { register, login, refresh, logout, logoutAll };
