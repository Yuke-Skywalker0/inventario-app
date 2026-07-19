import {
  adjustQuantity as apiAdjust,
  transferProduct as apiTransfer,
  createProduct as apiCreateProduct
} from '../api/products';
import { enqueueOperation, cacheProduct } from './db';

function makeClientOpId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function isTempProduct(product) {
  return typeof product._id === 'string' && product._id.startsWith('temp-');
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
  // Un prodotto creato offline e non ancora sincronizzato non esiste
  // ancora sul server, indipendentemente dal fatto che la rete sia
  // tornata: va sempre in coda, mai chiamato online direttamente.
  if (navigator.onLine && !isTempProduct(product)) {
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
  if (navigator.onLine && !isTempProduct(product)) {
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

// Creazione prodotto (Sezione 25: "aggiungere prodotti, se possibile").
// Online: passa dal server come sempre. Offline: crea un prodotto
// "temporaneo" (id locale, mai esistito sul server) visibile subito
// nell'app, e mette in coda la vera creazione. Quando la sincronizzazione
// riesce, l'id temporaneo viene sostituito con quello reale ovunque
// serva (vedi remapQueueProductId in db.js e sync.js).
export async function offlineAwareCreateProduct(payload) {
  if (navigator.onLine) {
    try {
      return await apiCreateProduct(payload);
    } catch (err) {
      if (err.status) throw err;
      // altrimenti: rete assente nonostante navigator.onLine, procedi offline sotto
    }
  }

  const clientOpId = makeClientOpId();
  const tempId = `temp-${clientOpId}`;
  const now = new Date().toISOString();
  const quantity = payload.quantity ? Number(payload.quantity) : 0;
  const inventory = payload.locationId && quantity > 0 ? [{ locationId: payload.locationId, quantity }] : [];

  const tempProduct = {
    _id: tempId,
    title: payload.title,
    unit: payload.unit || 'pezzi',
    inventory,
    category: payload.category || '',
    brand: payload.brand || '',
    color: payload.color || '',
    size: payload.size || '',
    notes: payload.notes || '',
    barcode: payload.barcode || '',
    minQuantity: payload.minQuantity ?? null,
    mainImage: '',
    mainImageUrl: null,
    archived: false,
    createdAt: now,
    updatedAt: now,
    // _pendingSync guida il badge "in attesa" già usato per adjust/transfer;
    // _tempId serve alla UI per sapere che non può ancora, ad esempio,
    // caricare una foto (serve un id reale).
    _pendingSync: true,
    _tempId: true
  };

  await cacheProduct(tempProduct);
  await enqueueOperation({
    clientOpId,
    type: 'createProduct',
    productId: tempId,
    body: payload,
    createdAt: Date.now()
  });

  return tempProduct;
}
