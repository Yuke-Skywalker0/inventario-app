const mongoose = require('mongoose');
const Product = require('../models/Product');
const Movement = require('../models/Movement');

// Usata solo internamente per interrompere la transazione in modo pulito
// quando l'esito non è un errore di sistema ma una condizione applicativa
// prevista (prodotto non trovato, quantità insufficiente).
class AbortTransaction extends Error {}

// Cuore del sistema (Sezione 15, 16, 38): applica un delta di quantità a
// un prodotto/ubicazione in modo atomico (transazione MongoDB reale) e
// idempotente (clientOpId univoco). Usata sia da POST /products/:id/adjust
// sia dall'azione "aggiungi al magazzino" della Lista da comprare
// (Sezione 24): stessa garanzia di correttezza, un solo posto da mantenere.
async function applyAdjustment({ workspaceId, productId, locationId, delta, type, reason, note, userId, clientOpId }) {
  const session = await mongoose.startSession();
  let outcome;

  try {
    await session.withTransaction(async () => {
      const product = await Product.findOne({ _id: productId, workspaceId }).session(session);

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

      await Movement.create(
        [
          {
            workspaceId,
            productId: product._id,
            locationId,
            type,
            delta,
            quantityAfter,
            userId,
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
      product.updatedBy = userId;
      await product.save({ session });

      outcome = { status: 200, body: { product } };
    });
  } catch (err) {
    if (err instanceof AbortTransaction) {
      // outcome già impostato sopra (404 o 409)
    } else if (err.code === 11000) {
      // Retry idempotente: l'operazione era già stata applicata prima.
      const current = await Product.findOne({ _id: productId, workspaceId });
      outcome = { status: 200, body: { product: current, idempotentReplay: true } };
    } else {
      await session.endSession();
      throw err;
    }
  }

  await session.endSession();
  return outcome;
}

module.exports = { applyAdjustment };
