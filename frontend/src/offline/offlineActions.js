import { adjustQuantity as apiAdjust, transferProduct as apiTransfer } from '../api/products';
import { enqueueOperation, cacheProduct } from './db';

function makeClientOpId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function applyDelta(product, locationId, delta) {
  const entry = product.inventory.find((i) => i.locationId === locationId);
  const currentQty = entry ? entry.quantity : 0;
  const quantityAfter = currentQty + delta;

  if (quantityAfter < 0) {
    throw Object.assign(new Error(`Quantità insufficiente: disponibili ${currentQty}`), {
      status: 409
    });
  }

  const inventory = entry
    ? product.inventory.map((i) => (i.locationId === locationId ? { ...i, quantity: quantityAfter } : i))
    : [...product.inventory, { locationId, quantity: quantityAfter }];

  // _pendingSync: usato dalla UI per mostrare un piccolo indicatore
  // "in attesa di sincronizzazione" sul prodotto (Sezione 42).
  return { ...product, inventory, _pendingSync: true };
}

// Modifica quantità (Sezione 15/16/25/38). Online: passa dall'endpoint
// reale, atomico e idempotente lato server. Offline: applica lo stesso
// calcolo delta in locale, salva in cache, mette in coda per quando
// torna la connessione — stesso clientOpId usato nei due casi, quindi
// se la richiesta fosse comunque arrivata al server prima di cadere
// offline, il retry non duplica l'effetto (idempotenza server-side).
export async function offlineAwareAdjust(product, { locationId, delta, type, reason, note }) {
  if (navigator.onLine) {
    try {
      const updated = await apiAdjust(product._id, { locationId, delta, type, reason, note });
      await cacheProduct(updated);
      return updated;
    } catch (err) {
      if (err.status) throw err; // errore applicativo reale (es. quantità insufficiente): va mostrato subito, non in coda
      // altrimenti: navigator.onLine mentiva (capita), proseguiamo sul percorso offline sotto
    }
  }

  const clientOpId = makeClientOpId();
  const updatedProduct = applyDelta(product, locationId, delta);

  await cacheProduct(updatedProduct);
  await enqueueOperation({
    clientOpId,
    type: 'adjust',
    productId: product._id,
    body: { locationId, delta, type, reason, note, clientOpId },
    createdAt: Date.now()
  });

  return updatedProduct;
}

// Trasferimento (Sezione 8/15): stessa logica, ma tocca due ubicazioni
// in un'unica operazione locale prima di mettere in coda.
export async function offlineAwareTransfer(product, { fromLocationId, toLocationId, quantity, note }) {
  if (navigator.onLine) {
    try {
      const updated = await apiTransfer(product._id, { fromLocationId, toLocationId, quantity, note });
      await cacheProduct(updated);
      return updated;
    } catch (err) {
      if (err.status) throw err;
    }
  }

  const clientOpId = makeClientOpId();
  const afterOut = applyDelta(product, fromLocationId, -quantity);
  const updatedProduct = applyDelta(afterOut, toLocationId, quantity);

  await cacheProduct(updatedProduct);
  await enqueueOperation({
    clientOpId,
    type: 'transfer',
    productId: product._id,
    body: { fromLocationId, toLocationId, quantity, note, clientOpId },
    createdAt: Date.now()
  });

  return updatedProduct;
}
