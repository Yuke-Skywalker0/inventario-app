import { apiFetch } from './client';

export async function uploadProductImage(productId, blob) {
  const formData = new FormData();
  formData.append('image', blob, 'photo.webp');

  const res = await apiFetch(`/products/${productId}/images`, {
    method: 'POST',
    body: formData,
    isFormData: true
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Caricamento immagine fallito');
  }
  return data.product;
}

export async function deleteProductImage(productId) {
  const res = await apiFetch(`/products/${productId}/images`, { method: 'DELETE' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Eliminazione immagine fallita');
  }
  return data.product;
}
