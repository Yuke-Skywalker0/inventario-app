const { resolveActiveWorkspace } = require('../services/workspaceResolver');
const { asyncHandler } = require('./errorHandler');

// Risolve il workspace ATTIVO dell'utente (Fase 10: un utente può
// appartenere a più workspace — il proprio + quelli a cui è stato
// invitato — ma ne ha sempre uno solo "attivo" alla volta, cambiabile
// dal Profilo). Attacca anche il ruolo dell'utente in quel workspace,
// usato da requireMinRole per i controlli di permesso.
const requireWorkspace = asyncHandler(async (req, res, next) => {
  const { workspace, role } = await resolveActiveWorkspace(req.userId);

  if (!workspace) {
    return res.status(404).json({ error: 'Nessuno spazio trovato per questo utente' });
  }

  req.workspaceId = workspace._id;
  req.memberRole = role;
  next();
});

module.exports = { requireWorkspace };
