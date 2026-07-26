const Invitation = require('../models/Invitation');
const Member = require('../models/Member');
const User = require('../models/User');
const Workspace = require('../models/Workspace');
const { asyncHandler } = require('../middleware/errorHandler');

// GET /api/invitations/:token — pubblica (no login richiesto): serve a
// mostrare "sei stato invitato a X spazio" anche a chi deve ancora
// registrarsi, prima di chiedergli di autenticarsi.
const preview = asyncHandler(async (req, res) => {
  const invitation = await Invitation.findOne({ token: req.params.token }).populate('workspaceId', 'name');

  if (!invitation || invitation.status !== 'pending' || invitation.expiresAt < new Date()) {
    return res.status(404).json({ error: 'Invito non valido o scaduto' });
  }

  res.json({
    workspaceName: invitation.workspaceId?.name || 'Spazio',
    role: invitation.role,
    email: invitation.email
  });
});

// POST /api/invitations/:token/accept — richiede login. L'utente
// autenticato diventa membro del workspace con il ruolo indicato
// nell'invito, che diventa anche il suo workspace attivo.
const accept = asyncHandler(async (req, res) => {
  const invitation = await Invitation.findOne({ token: req.params.token });

  if (!invitation || invitation.status !== 'pending' || invitation.expiresAt < new Date()) {
    return res.status(404).json({ error: 'Invito non valido o scaduto' });
  }

  const existingMember = await Member.findOne({ workspaceId: invitation.workspaceId, userId: req.userId });
  if (!existingMember) {
    await Member.create({
      workspaceId: invitation.workspaceId,
      userId: req.userId,
      role: invitation.role
    });
  }

  invitation.status = 'accepted';
  await invitation.save();

  const user = await User.findById(req.userId);
  user.defaultWorkspaceId = invitation.workspaceId;
  await user.save();

  const workspace = await Workspace.findById(invitation.workspaceId);

  res.json({
    workspace: { id: workspace._id, name: workspace.name },
    role: existingMember?.role || invitation.role
  });
});

module.exports = { preview, accept };
