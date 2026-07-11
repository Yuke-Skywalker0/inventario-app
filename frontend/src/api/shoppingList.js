import { apiJson } from './client';

export async function listShoppingList() {
  const data = await apiJson('/shopping-list');
  return data.items;
}

export async function addManualItem({ productId, quantityToBuy }) {
  const data = await apiJson('/shopping-list', {
    method: 'POST',
    body: JSON.stringify({ productId, quantityToBuy })
  });
  return data.item;
}

export async function removeManualItem(itemId) {
  await apiJson(`/shopping-list/${itemId}`, { method: 'DELETE' });
}

export async function purchaseItem({ productId, itemId, locationId, quantity }) {
  const clientOpId =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const data = await apiJson('/shopping-list/purchase', {
    method: 'POST',
    body: JSON.stringify({ productId, itemId, locationId, quantity, clientOpId })
  });
  return data.product;
}
