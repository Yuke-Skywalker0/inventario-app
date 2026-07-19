const Location = require('../models/Location');
const Product = require('../models/Product');
const Movement = require('../models/Movement');
const { asyncHandler } = require('../middleware/errorHandler');
const { buildProductsCsv } = require('../utils/buildProductsCsv');

// GET /api/export/json — Sezione 59: "voglio evitare di essere bloccato
// per sempre su un singolo servizio". Backup completo e leggibile, non
// legato al formato interno di MongoDB.
const exportJson = asyncHandler(async (req, res) => {
  const [locations, products, movements] = await Promise.all([
    Location.find({ workspaceId: req.workspaceId }).lean(),
    Product.find({ workspaceId: req.workspaceId }).lean(),
    Movement.find({ workspaceId: req.workspaceId }).sort({ createdAt: -1 }).lean()
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    locations: locations.map((l) => ({
      id: l._id,
      name: l.name,
      type: l.type,
      description: l.description,
      address: l.address,
      active: l.active
    })),
    products: products.map((p) => ({
      id: p._id,
      title: p.title,
      unit: p.unit,
      category: p.category,
      subcategory: p.subcategory,
      brand: p.brand,
      model: p.model,
      color: p.color,
      size: p.size,
      internalCode: p.internalCode,
      barcode: p.barcode,
      purchasePrice: p.purchasePrice,
      minQuantity: p.minQuantity,
      notes: p.notes,
      tags: p.tags,
      inventory: p.inventory,
      archived: p.archived,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    })),
    movements: movements.map((m) => ({
      productId: m.productId,
      locationId: m.locationId,
      toLocationId: m.toLocationId,
      type: m.type,
      delta: m.delta,
      quantityAfter: m.quantityAfter,
      reason: m.reason,
      note: m.note,
      createdAt: m.createdAt
    }))
  };

  const filename = `inventario-backup-${new Date().toISOString().slice(0, 10)}.json`;
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.json(payload);
});

// GET /api/export/csv — export prodotti in formato foglio di calcolo.
const exportCsv = asyncHandler(async (req, res) => {
  const [locations, products] = await Promise.all([
    Location.find({ workspaceId: req.workspaceId }).lean(),
    Product.find({ workspaceId: req.workspaceId }).lean()
  ]);

  const locationsById = Object.fromEntries(locations.map((l) => [l._id.toString(), l]));
  const csv = buildProductsCsv(
    products.map((p) => ({
      ...p,
      inventory: p.inventory.map((i) => ({ ...i, locationId: i.locationId.toString() }))
    })),
    locationsById
  );

  const filename = `inventario-prodotti-${new Date().toISOString().slice(0, 10)}.csv`;
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  // BOM UTF-8: senza, Excel su Windows interpreta male gli accenti.
  res.send('\uFEFF' + csv);
});

module.exports = { exportJson, exportCsv };
