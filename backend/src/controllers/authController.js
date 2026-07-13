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

// "Ricordami" attivo: sessione lunga (90 giorni), sopravvive alla chiusura
// del browser/app. "Ricordami" disattivo: cookie di sessione (nessun
// maxAge — il browser lo elimina alla chiusura) + token con vita breve
// (1 giorno) come rete di sicurezza aggiuntiva.
const REMEMBER_ME_DAYS = 90;
const SHORT_SESSION_DAYS = 1;

function refreshCookieOptions(rememberMe) {
  const base = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    // SameSite=None è necessario perché frontend (Cloudflare Pages) e
    // backend (Render) vivono su domini diversi. Richiede Secure=true,
    // quindi in produzione il backend deve essere servito su HTTPS
    // (Render lo garantisce di default).
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/api/auth'
  };
  if (rememberMe) {
    base.maxAge = REMEMBER_ME_DAYS * 24 * 60 * 60 * 1000;
  }
  // Se rememberMe è false, niente maxAge: è un cookie di sessione, il
  // browser lo cancella da solo alla chiusura completa dell'app/scheda.
  return base;
}

async function issueTokensAndSession(user, req, res, rememberMe = true) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user, rememberMe);
  const days = rememberMe ? REMEMBER_ME_DAYS : SHORT_SESSION_DAYS;

  await RefreshSession.create({
    userId: user._id,
    tokenHash: hashToken(refreshToken),
    userAgent: req.headers['user-agent'] || '',
    rememberMe,
    expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000)
  });

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions(rememberMe));
  return accessToken;
}

const register = asyncHandler(async (req, res) => {
  const { email, password, name, rememberMe = true } = req.body;

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

  const accessToken = await issueTokensAndSession(user, req, res, !!rememberMe);

  res.status(201).json({
    accessToken,
    user: { id: user._id, email: user.email, name: user.name },
    workspace: { id: workspace._id, name: workspace.name }
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password, rememberMe = true } = req.body;

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

  const accessToken = await issueTokensAndSession(user, req, res, !!rememberMe);
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

  // Rotazione: la vecchia sessione viene revocata e ne viene emessa una
  // nuova, mantenendo la stessa preferenza "ricordami" scelta al login.
  session.revoked = true;
  await session.save();

  const accessToken = await issueTokensAndSession(user, req, res, session.rememberMe);
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
