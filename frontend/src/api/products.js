import { apiJson } from './client';
import { cacheProducts, getCachedProducts, cacheProduct, getCachedProduct } from '../offline/db';

// Sezione 25: "Offline devo poter almeno... cercare, filtrare, vedere
// prodotti". Quando la rete c'è, la risposta del server è sempre la
// fonte di verità e viene anche salvata in cache per la prossima volta
// che servirà offline. Quando la rete manca (fetch fallisce senza uno
// status HTTP, segno che non ha nemmeno raggiunto il server), si
// ripiega sulla cache locale, applicando lo stesso filtro alla meglio.
export async function listProducts({ q = '', locationId = '', category = '', status = '' } = {}) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (locationId) params.set('locationId', locationId);
  if (category) params.set('category', category);
  if (status) params.set('status', status);
  const qs = params.toString() ? `?${params.toString()}` : '';

  try {
    const data = await apiJson(`/products${qs}`);
    cacheProducts(data.products).catch(() => {});
    return data.products;
  } catch (err) {
    if (err.status) throw err; // errore applicativo reale (es. 401): non è un problema di cache
    return filterCached(await getCachedProducts(), { q, locationId, category, status });
  }
}

function filterCached(products, { q, locationId, category, status }) {
  return products.filter((p) => {
    if (p.archived) return false;
    if (q && !matchesQuery(p, q.toLowerCase())) return false;
    if (locationId && !p.inventory.some((i) => i.locationId === locationId)) return false;
    if (category && p.category !== category) return false;
    if (status) {
      const total = p.inventory.reduce((sum, i) => sum + i.quantity, 0);
      if (status === 'out' && total !== 0) return false;
      if (status === 'low' && !(p.minQuantity != null && total > 0 && total <= p.minQuantity)) return false;
    }
    return true;
  });
}

function matchesQuery(product, q) {
  const fields = [
    product.title,
    product.category,
    product.subcategory,
    product.brand,
    product.model,
    product.color,
    product.size,
    product.notes,
    product.internalCode,
    product.barcode
  ];
  return fields.some((f) => f && f.toLowerCase().includes(q));
}

export async function listCategories() {
  const data = await apiJson('/products/meta/categories');
  return data.categories;
}

export async function getProduct(id) {
  try {
    const data = await apiJson(`/products/${id}`);
    cacheProduct(data.product).catch(() => {});
    return data.product;
  } catch (err) {
    if (err.status) throw err;
    const cached = await getCachedProduct(id);
    if (!cached) throw new Error('Prodotto non disponibile offline (non ancora scaricato in questo dispositivo)');
    return cached;
  }
}

export async function createProduct(payload) {
  const data = await apiJson('/products', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  cacheProduct(data.product).catch(() => {});
  return data.product;
}

export async function updateProduct(id, payload) {
  const data = await apiJson(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
  cacheProduct(data.product).catch(() => {});
  return data.product;
}

export async function toggleProductArchived(id) {
  const data = await apiJson(`/products/${id}/toggle-archived`, { method: 'PATCH' });
  cacheProduct(data.product).catch(() => {});
  return data.product;
}

export async function transferProduct(productId, { fromLocationId, toLocationId, quantity, note }) {
  const clientOpId =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const data = await apiJson(`/products/${productId}/transfer`, {
    method: 'POST',
    body: JSON.stringify({ fromLocationId, toLocationId, quantity, note, clientOpId })
  });
  cacheProduct(data.product).catch(() => {});
  return data.product;
}

// clientOpId generato lato client: è la chiave che rende ogni operazione
// idempotente (Sezione 38). Questa funzione presume la rete disponibile
// (chiamata diretta all'API); per l'uso normale nell'app passa invece da
// offline/offlineActions.js, che sceglie da sola se andare online o
// mettere in coda (Fase 21).
export async function adjustQuantity(productId, { locationId, delta, type, reason, note }) {
  const clientOpId =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const data = await apiJson(`/products/${productId}/adjust`, {
    method: 'POST',
    body: JSON.stringify({ locationId, delta, type, reason, note, clientOpId })
  });
  cacheProduct(data.product).catch(() => {});
  return data.product;
}
