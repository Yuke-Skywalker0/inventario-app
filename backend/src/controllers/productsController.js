const mongoose = require('mongoose');
const Product = require('../models/Product');
const Movement = require('../models/Movement');
const Location = require('../models/Location');
const { asyncHandler } = require('../middleware/errorHandler');
const { validateProductInput } = require('../utils/validateProductInput');
const { validateAdjustInput } = require('../utils/validateAdjustInput');
const { validateTransferInput } = require('../utils/validateTransferInput');
const { applyAdjustment } = require('../services/inventoryService');
const { withImageUrl, withImageUrls } = require('../services/imageUrlService');
const { buildProductSearchFilter, matchesStatus } = require('../utils/productSearch');

const MAX_PAGE_SIZE = 200;
const DEFAULT_PAGE_SIZE = 50;
// Quando è attivo un filtro di stato (scorta bassa/esaurito), che si
// applica dopo il fetch, prendiamo un lotto più ampio prima di
// paginare, altrimenti rischieremmo di paginare "nel vuoto" scartando
// risultati validi già oltre il limit. Compromesso ragionevole per la
// scala di questo progetto (Sezione 39: fino a 10.000 prodotti).
const STATUS_FILTER_FETCH_SIZE = 500;

// GET /api/products?q=&locationId=&category=&status=&includeArchived=&limit=&skip=
const list = asyncHandler(async (req, res) => {
  const filter = buildProductSearchFilter({
    workspaceId: req.workspaceId,
    q: req.query.q,
    locationId: req.query.locationId,
    category: req.query.category,
    includeArchived: req.query.includeArchived
  });

  const limit = Math.min(Number(req.query.limit) || DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
  const skip = Number(req.query.skip) || 0;
  const status = req.query.status; // 'low' | 'out' | undefined

  let products;
  if (status) {
    const batch = await Product.find(filter)
      .sort({ updatedAt: -1 })
      .limit(STATUS_FILTER_FETCH_SIZE);
    products = batch.filter((p) => matchesStatus(p, status)).slice(skip, skip + limit);
  } else {
    products = await Product.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit);
  }

  res.json({ products: await withImageUrls(products) });
});

// GET /api/products/meta/categories — elenco categorie già usate nel
// workspace, per popolare il filtro (Sezione 19) senza dover digitare
// a memoria una categoria esistente.
const listCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct('category', {
    workspaceId: req.workspaceId,
    archived: false,
    category: { $ne: '' }
  });
  res.json({ categories: categories.sort() });
});

// GET /api/products/:id
const getOne = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, workspaceId: req.workspaceId });
  if (!product) {
    return res.status(404).json({ error: 'Prodotto non trovato' });
  }
  res.json({ product: await withImageUrl(product) });
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

  res.status(201).json({ product: await withImageUrl(product) });
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
  res.json({ product: await withImageUrl(product) });
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
  res.json({ product: await withImageUrl(product) });
});

// Usata solo internamente per interrompere la transazione in modo pulito
// (rimane qui anche per transfer, sotto).
class AbortTransaction extends Error {}

// POST /api/products/:id/adjust — cuore del sistema (Sezione 15, 16, 38).
// La logica atomica/idempotente vive in services/inventoryService.js,
// riusata anche dalla Lista da comprare (Sezione 56: niente duplicati).
const adjust = asyncHandler(async (req, res) => {
  const result = validateAdjustInput(req.body);
  if (!result.valid) {
    return res.status(400).json({ error: result.error });
  }
  const { locationId, delta, type, reason, note, clientOpId } = result.data;

  const outcome = await applyAdjustment({
    workspaceId: req.workspaceId,
    productId: req.params.id,
    locationId,
    delta,
    type,
    reason,
    note,
    userId: req.userId,
    clientOpId
  });

  if (outcome.body.product) {
    outcome.body.product = await withImageUrl(outcome.body.product);
  }

  res.status(outcome.status).json(outcome.body);
});

// POST /api/products/:id/transfer — Sezione 8: "Un trasferimento deve essere
// una singola operazione logica": non deve poter succedere che la
// sottrazione riesca e l'aggiunta fallisca lasciando dati incoerenti.
// Stessa garanzia di /adjust: transazione MongoDB reale + idempotenza
// tramite clientOpId. Viene registrato UN SOLO movimento (tipo
// 'trasferimento', con locationId=origine e toLocationId=destinazione),
// non due movimenti separati: rispecchia che è una singola operazione.
const transfer = asyncHandler(async (req, res) => {
  const result = validateTransferInput(req.body);
  if (!result.valid) {
    return res.status(400).json({ error: result.error });
  }
  const { fromLocationId, toLocationId, quantity, clientOpId, note } = result.data;

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

      const fromEntry = product.inventory.find((i) => i.locationId.toString() === fromLocationId);
      const fromQuantity = fromEntry ? fromEntry.quantity : 0;

      if (fromQuantity < quantity) {
        outcome = {
          status: 409,
          body: { error: 'Quantità insufficiente nell\'ubicazione di origine: disponibili ' + fromQuantity }
        };
        throw new AbortTransaction();
      }

      const toEntry = product.inventory.find((i) => i.locationId.toString() === toLocationId);
      const toQuantityAfter = (toEntry ? toEntry.quantity : 0) + quantity;
      const fromQuantityAfter = fromQuantity - quantity;

      // Guardia di idempotenza: se questo clientOpId è già stato usato
      // (retry), l'insert fallisce con 11000 e la transazione abortisce
      // SENZA toccare l'inventario — vedi il catch sotto.
      await Movement.create(
        [
          {
            workspaceId: req.workspaceId,
            productId: product._id,
            locationId: fromLocationId,
            toLocationId,
            type: 'trasferimento',
            delta: -quantity,
            quantityAfter: fromQuantityAfter,
            userId: req.userId,
            note,
            clientOpId
          }
        ],
        { session }
      );

      fromEntry.quantity = fromQuantityAfter;
      if (toEntry) {
        toEntry.quantity = toQuantityAfter;
      } else {
        product.inventory.push({ locationId: toLocationId, quantity: toQuantityAfter });
      }
      product.updatedBy = req.userId;
      await product.save({ session });

      outcome = { status: 200, body: { product } };
    });
  } catch (err) {
    if (err instanceof AbortTransaction) {
      // outcome già impostato sopra
    } else if (err.code === 11000) {
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
  if (outcome.body.product) {
    outcome.body.product = await withImageUrl(outcome.body.product);
  }
  res.status(outcome.status).json(outcome.body);
});

module.exports = { list, listCategories, getOne, create, update, toggleArchived, adjust, transfer };
