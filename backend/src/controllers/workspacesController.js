const Member = require('../models/Member');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

// GET /api/workspaces/mine — tutti gli spazi a cui l'utente appartiene
// (il proprio + eventuali altri accettati tramite invito).
const listMine = asyncHandler(async (req, res) => {
  const memberships = await Member.find({ userId: req.userId }).populate('workspaceId', 'name');

  res.json({
    workspaces: memberships
      .filter((m) => m.workspaceId)
      .map((m) => ({
        id: m.workspaceId._id,
        name: m.workspaceId.name,
        role: m.role
      }))
  });
});

// POST /api/workspaces/switch — cambia lo spazio attivo dell'utente.
const switchWorkspace = asyncHandler(async (req, res) => {
  const { workspaceId } = req.body;
  const member = await Member.findOne({ workspaceId, userId: req.userId });
  if (!member) {
    return res.status(403).json({ error: 'Non fai parte di questo spazio' });
  }

  const user = await User.findById(req.userId);
  user.defaultWorkspaceId = workspaceId;
  await user.save();

  res.json({ ok: true });
});

module.exports = { listMine, switchWorkspace };
