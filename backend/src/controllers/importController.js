const mongoose = require('mongoose');
const Location = require('../models/Location');
const Product = require('../models/Product');
const Movement = require('../models/Movement');
const { asyncHandler } = require('../middleware/errorHandler');
const { validateImportPayload } = require('../utils/validateImportPayload');

const importJson = asyncHandler(async (req, res) => {
  let payload;
  try {
    payload = JSON.parse(req.file ? req.file.buffer.toString('utf-8') : JSON.stringify(req.body));
  } catch (err) {
    return res.status(400).json({ error: 'Il file non è un JSON valido' });
  }

  const result = validateImportPayload(payload);
  if (!result.valid) {
    return res.status(400).json({ error: result.error });
  }
  const { locations, products, movements } = result.data;

  const session = await mongoose.startSession();
  let counts = { locations: 0, products: 0, movements: 0 };

  try {
    await session.withTransaction(async () => {
      const locationIdMap = new Map();
      const productIdMap = new Map();

      for (const loc of locations) {
        const created = await Location.create(
          [
            {
              workspaceId: req.workspaceId,
              name: loc.name,
              type: loc.type || 'altro',
              description: loc.description || '',
              address: loc.address || '',
              active: loc.active !== false
            }
          ],
          { session }
        );
        locationIdMap.set(loc.id, created[0]._id);
        counts.locations++;
      }

      for (const p of products) {
        const inventory = (p.inventory || [])
          .filter((i) => locationIdMap.has(String(i.locationId)))
          .map((i) => ({ locationId: locationIdMap.get(String(i.locationId)), quantity: i.quantity }));

        const created = await Product.create(
          [
            {
              workspaceId: req.workspaceId,
              title: p.title,
              unit: p.unit || 'pezzi',
              inventory,
              category: p.category || '',
              subcategory: p.subcategory || '',
              brand: p.brand || '',
              model: p.model || '',
              color: p.color || '',
              size: p.size || '',
              internalCode: p.internalCode || '',
              barcode: p.barcode || '',
              purchasePrice: p.purchasePrice ?? null,
              minQuantity: p.minQuantity ?? null,
              notes: p.notes || '',
              tags: p.tags || [],
              archived: !!p.archived,
              createdBy: req.userId,
              updatedBy: req.userId
            }
          ],
          { session }
        );
        productIdMap.set(p.id, created[0]._id);
        counts.products++;
      }

      for (const m of movements) {
        const productId = productIdMap.get(String(m.productId));
        const locationId = locationIdMap.get(String(m.locationId));
        if (!productId || !locationId) continue;

        await Movement.create(
          [
            {
              workspaceId: req.workspaceId,
              productId,
              locationId,
              toLocationId: m.toLocationId ? locationIdMap.get(String(m.toLocationId)) || null : null,
              type: m.type || 'rettifica',
              delta: m.delta,
              quantityAfter: m.quantityAfter,
              userId: req.userId,
              reason: m.reason || 'Importato da backup',
              note: m.note || '',
              clientOpId: `import-${new mongoose.Types.ObjectId()}`,
              createdAt: m.createdAt ? new Date(m.createdAt) : new Date()
            }
          ],
          { session }
        );
        counts.movements++;
      }
    });
  } catch (err) {
    await session.endSession();
    throw err;
  }

  await session.endSession();
  res.status(201).json({ imported: counts });
});

module.exports = { importJson };
