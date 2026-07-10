import { apiJson } from './client';

export async function listLocations({ includeInactive = false } = {}) {
  const qs = includeInactive ? '?includeInactive=true' : '';
  const data = await apiJson(`/locations${qs}`);
  return data.locations;
}

export async function createLocation(payload) {
  const data = await apiJson('/locations', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return data.location;
}

export async function updateLocation(id, payload) {
  const data = await apiJson(`/locations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
  return data.location;
}

export async function toggleLocationActive(id) {
  const data = await apiJson(`/locations/${id}/toggle-active`, {
    method: 'PATCH'
  });
  return data.location;
}
