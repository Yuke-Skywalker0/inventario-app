const Member = require('../models/Member');
const Invitation = require('../models/Invitation');
const { asyncHandler } = require('../middleware/errorHandler');
const { validateInviteInput } = require('../utils/validateInviteInput');

const INVITE_EXPIRY_DAYS = 7;

function buildInviteUrl(token) {
  const origin = process.env.FRONTEND_ORIGIN || '';
  return `${origin}/invito/${token}`;
}

// GET /api/members — team + inviti in attesa. Visibile a chiunque sia
// membro (anche viewer): sapere chi c'è nel team non è un'azione
// distruttiva, solo invitare/rimuovere lo è (protetto a parte).
const list = asyncHandler(async (req, res) => {
  const [members, invitations] = await Promise.all([
    Member.find({ workspaceId: req.workspaceId }).populate('userId', 'name email').sort({ createdAt: 1 }),
    Invitation.find({ workspaceId: req.workspaceId, status: 'pending' }).sort({ createdAt: -1 })
  ]);

  res.json({
    members: members.map((m) => ({
      id: m._id,
      role: m.role,
      user: m.userId ? { id: m.userId._id, name: m.userId.name, email: m.userId.email } : null
    })),
    invitations: invitations.map((i) => ({
      id: i._id,
      email: i.email,
      role: i.role,
      expiresAt: i.expiresAt,
      inviteUrl: buildInviteUrl(i.token)
    }))
  });
});

// POST /api/members/invite — crea un link di invito (Sezione 36). Nessun
// invio email: il proprietario/admin lo condivide come preferisce.
const invite = asyncHandler(async (req, res) => {
  const result = validateInviteInput(req.body);
  if (!result.valid) {
    return res.status(400).json({ error: result.error });
  }
  const { email, role } = result.data;

  const invitation = await Invitation.create({
    workspaceId: req.workspaceId,
    email,
    role,
    createdBy: req.userId,
    expiresAt: new Date(Date.now() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
  });

  res.status(201).json({
    invitation: {
      id: invitation._id,
      email: invitation.email,
      role: invitation.role,
      expiresAt: invitation.expiresAt,
      inviteUrl: buildInviteUrl(invitation.token)
    }
  });
});

// DELETE /api/members/invitations/:id — revoca un invito non ancora accettato.
const revokeInvitation = asyncHandler(async (req, res) => {
  const invitation = await Invitation.findOneAndUpdate(
    { _id: req.params.id, workspaceId: req.workspaceId, status: 'pending' },
    { status: 'revoked' }
  );
  if (!invitation) {
    return res.status(404).json({ error: 'Invito non trovato' });
  }
  res.json({ ok: true });
});

// PUT /api/members/:id — cambia il ruolo di un membro.
const updateRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['admin', 'technician', 'viewer'].includes(role)) {
    return res.status(400).json({ error: 'Ruolo non valido' });
  }

  const member = await Member.findOne({ _id: req.params.id, workspaceId: req.workspaceId });
  if (!member) {
    return res.status(404).json({ error: 'Membro non trovato' });
  }
  if (member.role === 'owner' && req.memberRole !== 'owner') {
    return res.status(403).json({ error: 'Solo il proprietario può modificare questo membro' });
  }
  if (member.userId.toString() === req.userId) {
    return res.status(400).json({ error: 'Non puoi modificare il tuo stesso ruolo' });
  }

  member.role = role;
  await member.save();
  res.json({ ok: true });
});

// DELETE /api/members/:id — rimuove un membro dal workspace.
const removeMember = asyncHandler(async (req, res) => {
  const member = await Member.findOne({ _id: req.params.id, workspaceId: req.workspaceId });
  if (!member) {
    return res.status(404).json({ error: 'Membro non trovato' });
  }
  if (member.role === 'owner') {
    return res.status(400).json({ error: 'Il proprietario non può essere rimosso' });
  }
  if (member.userId.toString() === req.userId) {
    return res.status(400).json({ error: 'Non puoi rimuovere te stesso' });
  }

  await member.deleteOne();
  res.json({ ok: true });
});

module.exports = { list, invite, revokeInvitation, updateRole, removeMember };
