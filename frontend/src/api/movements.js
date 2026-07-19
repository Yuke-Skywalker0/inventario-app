import { apiJson } from './client';

export async function listMovements(productId) {
  const data = await apiJson(`/products/${productId}/movements`);
  return data.movements;
}
