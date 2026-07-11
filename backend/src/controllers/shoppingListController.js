const Product = require('../models/Product');
const ShoppingListItem = require('../models/ShoppingListItem');
const { asyncHandler } = require('../middleware/errorHandler');
const { validateShoppingListInput, validatePurchaseInput } = require('../utils/validateShoppingListInput');
const { applyAdjustment } = require('../services/inventoryService');

// GET /api/shopping-list — unisce le voci automatiche (scorta bassa/esaurito,
// Sezione 24 punto 1) con quelle aggiunte manualmente (punto 2), senza
// duplicare un prodotto che comparisse in entrambe le categorie.
const list = asyncHandler(async (req, res) => {
  const manualItems = await ShoppingListItem.find({ workspaceId: req.workspaceId }).populate(
    'productId'
  );
  const manualProductIds = new Set(manualItems.map((i) => i.productId?._id?.toString()));

  const lowStockProducts = await Product.find({
    workspaceId: req.workspaceId,
    archived: false,
    minQuantity: { $ne: null }
  });

  const autoItems = lowStockProducts
    .filter((p) => {
      const total = p.inventory.reduce((sum, i) => sum + i.quantity, 0);
      return total <= p.minQuantity && !manualProductIds.has(p._id.toString());
    })
    .map((p) => {
      const total = p.inventory.reduce((sum, i) => sum + i.quantity, 0);
      return {
        type: 'auto',
        product: p,
        suggestedQuantity: Math.max(p.minQuantity - total, 1)
      };
    });

  const manual = manualItems
    .filter((i) => i.productId) // esclude voci orfane (prodotto eliminato nel frattempo)
    .map((i) => ({
      type: 'manual',
      id: i._id,
      product: i.productId,
      suggestedQuantity: i.quantityToBuy || 1
    }));

  res.json({ items: [...manual, ...autoItems] });
});

// POST /api/shopping-list — aggiunge (o aggiorna la quantità di) una voce
// manuale. Upsert: riaggiungere lo stesso prodotto aggiorna la riga
// esistente invece di duplicarla (vedi unique index sul modello).
const addManual = asyncHandler(async (req, res) => {
  const result = validateShoppingListInput(req.body);
  if (!result.valid) {
    return res.status(400).json({ error: result.error });
  }
  const { productId, quantityToBuy } = result.data;

  const product = await Product.findOne({ _id: productId, workspaceId: req.workspaceId });
  if (!product) {
    return res.status(400).json({ error: 'Prodotto non valido' });
  }

  const item = await ShoppingListItem.findOneAndUpdate(
    { workspaceId: req.workspaceId, productId },
    { quantityToBuy },
    { new: true, upsert: true }
  ).populate('productId');

  res.status(201).json({
    item: {
      type: 'manual',
      id: item._id,
      product: item.productId,
      suggestedQuantity: item.quantityToBuy || 1
    }
  });
});

// DELETE /api/shopping-list/:id — rimuove una voce manuale. Le voci
// automatiche non hanno un id da eliminare: si "risolvono" da sole
// facendo rifornimento (vedi commento sul modello).
const removeManual = asyncHandler(async (req, res) => {
  const deleted = await ShoppingListItem.findOneAndDelete({
    _id: req.params.id,
    workspaceId: req.workspaceId
  });
  if (!deleted) {
    return res.status(404).json({ error: 'Voce non trovata' });
  }
  res.json({ ok: true });
});

// POST /api/shopping-list/purchase — Sezione 24: "Compro 20 raccordi. Premo
// AGGIUNGI AL MAGAZZINO... il sistema aggiunge 20, registra il movimento,
// aggiorna la lista". Riusa la stessa operazione atomica/idempotente di
// /products/:id/adjust (Sezione 56: un solo posto per questa logica).
const purchase = asyncHandler(async (req, res) => {
  const result = validatePurchaseInput(req.body);
  if (!result.valid) {
    return res.status(400).json({ error: result.error });
  }
  const { productId, locationId, quantity, clientOpId, itemId } = result.data;

  const outcome = await applyAdjustment({
    workspaceId: req.workspaceId,
    productId,
    locationId,
    delta: quantity,
    type: 'entrata',
    reason: 'Acquistato',
    note: '',
    userId: req.userId,
    clientOpId
  });

  // Se l'aggiunta al magazzino è andata a buon fine e la voce era
  // manuale, la rimuoviamo dalla lista: è stata "risolta". Le voci
  // automatiche si risolvono da sole al prossimo GET (quantità aggiornata).
  if (outcome.status === 200 && itemId) {
    await ShoppingListItem.deleteOne({ _id: itemId, workspaceId: req.workspaceId });
  }

  res.status(outcome.status).json(outcome.body);
});

module.exports = { list, addManual, removeManual, purchase };
