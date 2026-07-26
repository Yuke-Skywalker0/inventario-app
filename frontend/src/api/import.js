import { apiFetch } from './client';

export async function importJsonBackup(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await apiFetch('/import/json', {
    method: 'POST',
    body: formData,
    isFormData: true
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Import non riuscito');
  }
  return data.imported;
}
