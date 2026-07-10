const Workspace = require('../models/Workspace');
const { asyncHandler } = require('./errorHandler');

// In MVP ogni utente ha esattamente un workspace (creato alla registrazione).
// Questo middleware lo risolve una volta e lo attacca a req, così tutte le
// route "operative" (ubicazioni, prodotti, movimenti...) possono fidarsi di
// req.workspaceId senza ripetere la query. Quando arriverà il multi-utente
// (Fase 10/V1) qui si aggiungerà la logica di selezione tra più workspace
// e la verifica dei permessi tramite il modello Member.
const requireWorkspace = asyncHandler(async (req, res, next) => {
  const workspace = await Workspace.findOne({ ownerId: req.userId });
  if (!workspace) {
    return res.status(404).json({ error: 'Nessuno spazio trovato per questo utente' });
  }
  req.workspaceId = workspace._id;
  next();
});

module.exports = { requireWorkspace };
