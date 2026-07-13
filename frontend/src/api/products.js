import { apiJson } from './client';

export async function listProducts({ q = '', locationId = '', category = '', status = '' } = {}) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (locationId) params.set('locationId', locationId);
  if (category) params.set('category', category);
  if (status) params.set('status', status);
  const qs = params.toString() ? `?${params.toString()}` : '';
  const data = await apiJson(`/products${qs}`);
  return data.products;
}

export async function listCategories() {
  const data = await apiJson('/products/meta/categories');
  return data.categories;
}

export async function getProduct(id) {
  const data = await apiJson(`/products/${id}`);
  return data.product;
}

export async function createProduct(payload) {
  const data = await apiJson('/products', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return data.product;
}

export async function updateProduct(id, payload) {
  const data = await apiJson(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
  return data.product;
}

export async function toggleProductArchived(id) {
  const data = await apiJson(`/products/${id}/toggle-archived`, { method: 'PATCH' });
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
  return data.product;
}
// clientOpId generato lato client: è la chiave che rende ogni operazione
// idempotente (Sezione 38) — fondamentale già da ora, e ancora di più
// quando arriverà la coda offline (Fase 21) che potrà fare retry.
export async function adjustQuantity(productId, { locationId, delta, type, reason, note }) {
  const clientOpId =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const data = await apiJson(`/products/${productId}/adjust`, {
    method: 'POST',
    body: JSON.stringify({ locationId, delta, type, reason, note, clientOpId })
  });
  return data.product;
}
