const mongoose = require('mongoose');
const Product = require('../models/Product');
const Movement = require('../models/Movement');
const Location = require('../models/Location');
const { asyncHandler } = require('../middleware/errorHandler');
const { validateProductInput } = require('../utils/validateProductInput');
const { validateAdjustInput } = require('../utils/validateAdjustInput');

const MAX_PAGE_SIZE = 200;
const DEFAULT_PAGE_SIZE = 50;

// GET /api/products?q=&locationId=&includeArchived=&limit=&skip=
const list = asyncHandler(async (req, res) => {
  const filter = { workspaceId: req.workspaceId };

  if (req.query.includeArchived !== 'true') {
    filter.archived = false;
  }
  if (req.query.locationId) {
    filter['inventory.locationId'] = req.query.locationId;
  }
  if (req.query.q && req.query.q.trim()) {
    const q = req.query.q.trim();
    filter.title = { $regex: escapeRegex(q), $options: 'i' };
  }

  const limit = Math.min(Number(req.query.limit) || DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
  const skip = Number(req.query.skip) || 0;

  const products = await Product.find(filter)
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({ products });
});

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// GET /api/products/:id
const getOne = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, workspaceId: req.workspaceId });
  if (!product) {
    return res.status(404).json({ error: 'Prodotto non trovato' });
  }
  res.json({ product });
});

// POST /api/products
const create = asyncHandler(async (req, res) => {
  const result = validateProductInput(req.body);
  if (!result.valid) {
    return res.status(400).json({ error: result.error });
  }
  const { title, unit, initialQuantity, locationId, ...detail } = result.data;

  if (locationId) {
    const location = await Location.findOne({ _id: locationId, workspaceId: req.workspaceId });
    if (!location) {
      return res.status(400).json({ error: 'Ubicazione non valida' });
    }
  }

  const inventory = locationId ? [{ locationId, quantity: initialQuantity }] : [];

  const product = await Product.create({
    workspaceId: req.workspaceId,
    title,
    unit,
    inventory,
    ...detail,
    createdBy: req.userId,
    updatedBy: req.userId
  });

  // Prodotto appena creato: nessuna concorrenza possibile su di esso,
  // quindi non serve una transazione per il movimento iniziale.
  if (initialQuantity > 0) {
    await Movement.create({
      workspaceId: req.workspaceId,
      productId: product._id,
      locationId,
      type: 'entrata',
      delta: initialQuantity,
      quantityAfter: initialQuantity,
      userId: req.userId,
      reason: 'Quantità iniziale',
      clientOpId: `create-${product._id}`
    });
  }

  res.status(201).json({ product });
});

// PUT /api/products/:id — aggiorna solo i campi anagrafici, MAI la quantità
// (quella passa sempre da /adjust, per garantire cronologia e atomicità).
const update = asyncHandler(async (req, res) => {
  const result = validateProductInput({ ...req.body, quantity: 0 });
  if (!result.valid) {
    return res.status(400).json({ error: result.error });
  }
  const { title, unit, ...detail } = result.data;
  delete detail.initialQuantity;
  delete detail.locationId;

  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, workspaceId: req.workspaceId },
    { title, unit, ...detail, updatedBy: req.userId },
    { new: true }
  );

  if (!product) {
    return res.status(404).json({ error: 'Prodotto non trovato' });
  }
  res.json({ product });
});

// PATCH /api/products/:id/toggle-archived
const toggleArchived = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, workspaceId: req.workspaceId });
  if (!product) {
    return res.status(404).json({ error: 'Prodotto non trovato' });
  }
  product.archived = !product.archived;
  product.updatedBy = req.userId;
  await product.save();
  res.json({ product });
});

// Usata solo internamente per interrompere la transazione in modo pulito
// quando l'esito non è un errore di sistema ma una condizione applicativa
// prevista (prodotto non trovato, quantità insufficiente).
class AbortTransaction extends Error {}

// POST /api/products/:id/adjust — cuore del sistema (Sezione 15, 16, 38).
// Atomico (transazione MongoDB) e idempotente (clientOpId univoco):
// se la stessa richiesta arriva due volte (retry di rete dopo offline),
// la seconda volta non applica l'effetto una seconda volta.
const adjust = asyncHandler(async (req, res) => {
  const result = validateAdjustInput(req.body);
  if (!result.valid) {
    return res.status(400).json({ error: result.error });
  }
  const { locationId, delta, type, reason, note, clientOpId } = result.data;

  const session = await mongoose.startSession();
  let outcome;

  try {
    await session.withTransaction(async () => {
      const product = await Product.findOne({
        _id: req.params.id,
        workspaceId: req.workspaceId
      }).session(session);

      if (!product) {
        outcome = { status: 404, body: { error: 'Prodotto non trovato' } };
        throw new AbortTransaction();
      }

      const entry = product.inventory.find((i) => i.locationId.toString() === locationId);
      const currentQuantity = entry ? entry.quantity : 0;
      const quantityAfter = currentQuantity + delta;

      if (quantityAfter < 0) {
        outcome = {
          status: 409,
          body: { error: 'Quantità insufficiente: disponibili ' + currentQuantity }
        };
        throw new AbortTransaction();
      }

      // L'unique index su clientOpId fa da guardia per l'idempotenza:
      // se questa chiamata è un retry, l'insert fallisce con codice 11000
      // e la transazione viene abortita SENZA toccare il prodotto.
      await Movement.create(
        [
          {
            workspaceId: req.workspaceId,
            productId: product._id,
            locationId,
            type,
            delta,
            quantityAfter,
            userId: req.userId,
            reason,
            note,
            clientOpId
          }
        ],
        { session }
      );

      if (entry) {
        entry.quantity = quantityAfter;
      } else {
        product.inventory.push({ locationId, quantity: quantityAfter });
      }
      product.updatedBy = req.userId;
      await product.save({ session });

      outcome = { status: 200, body: { product } };
    });
  } catch (err) {
    if (err instanceof AbortTransaction) {
      // outcome già impostato sopra (404 o 409)
    } else if (err.code === 11000) {
      // Retry idempotente: l'operazione era già stata applicata in
      // precedenza. Non è un errore per il client: ritorniamo lo stato
      // attuale del prodotto, così l'interfaccia resta coerente.
      const current = await Product.findOne({
        _id: req.params.id,
        workspaceId: req.workspaceId
      });
      outcome = { status: 200, body: { product: current, idempotentReplay: true } };
    } else {
      await session.endSession();
      throw err;
    }
  }

  await session.endSession();
  res.status(outcome.status).json(outcome.body);
});

module.exports = { list, getOne, create, update, toggleArchived, adjust };
