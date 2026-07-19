const Movement = require('../models/Movement');
const { asyncHandler } = require('../middleware/errorHandler');

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

// GET /api/products/:id/movements — Sezione 17: cronologia leggibile.
// I dati esistono già dalla Fase 12 (ogni /adjust e /transfer crea un
// Movement): qui li rendiamo solo visibili, nessuna nuova scrittura.
const listForProduct = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || DEFAULT_LIMIT, MAX_LIMIT);

  const movements = await Movement.find({
    productId: req.params.id,
    workspaceId: req.workspaceId
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'name email');

  res.json({ movements });
});

module.exports = { listForProduct };
