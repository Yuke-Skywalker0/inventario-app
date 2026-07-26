const User = require('../models/User');
const Workspace = require('../models/Workspace');
const Member = require('../models/Member');
const { asyncHandler } = require('./errorHandler');

// Risolve il workspace ATTIVO dell'utente (Fase 10: un utente può
// appartenere a più workspace — il proprio + quelli a cui è stato
// invitato — ma ne ha sempre uno solo "attivo" alla volta, cambiabile
// dal Profilo). Attacca anche il ruolo dell'utente in quel workspace,
// usato da requireMinRole per i controlli di permesso.
const requireWorkspace = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(401).json({ error: 'Utente non trovato' });
  }

  let workspaceId = user.defaultWorkspaceId;
  let member = workspaceId
    ? await Member.findOne({ workspaceId, userId: req.userId })
    : null;

  // Ripiego di sicurezza: se il workspace di default non è (più) valido
  // per qualche motivo, usa la prima appartenenza trovata.
  if (!member) {
    member = await Member.findOne({ userId: req.userId }).sort({ createdAt: 1 });
    if (!member) {
      return res.status(404).json({ error: 'Nessuno spazio trovato per questo utente' });
    }
    workspaceId = member.workspaceId;
  }

  req.workspaceId = workspaceId;
  req.memberRole = member.role;
  next();
});

module.exports = { requireWorkspace };
