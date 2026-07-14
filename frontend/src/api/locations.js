import { apiJson } from './client';
import { cacheLocations, getCachedLocations } from '../offline/db';

export async function listLocations({ includeInactive = false } = {}) {
  const qs = includeInactive ? '?includeInactive=true' : '';
  try {
    const data = await apiJson(`/locations${qs}`);
    cacheLocations(data.locations).catch(() => {});
    return data.locations;
  } catch (err) {
    if (err.status) throw err;
    const cached = await getCachedLocations();
    return includeInactive ? cached : cached.filter((l) => l.active);
  }
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
