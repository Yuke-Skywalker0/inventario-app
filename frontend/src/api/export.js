import { apiFetch } from './client';

// I download autenticati non possono essere un semplice <a href="...">
// (servirebbe passare l'Authorization header): scarichiamo il contenuto
// come blob tramite apiFetch, poi lo trasformiamo in un finto click su
// un link temporaneo per far partire il download del browser.
async function downloadViaBlob(path, fallbackFilename) {
  const res = await apiFetch(path);
  if (!res.ok) {
    throw new Error('Esportazione non riuscita');
  }
  const blob = await res.blob();

  const disposition = res.headers.get('content-disposition') || '';
  const match = disposition.match(/filename="(.+)"/);
  const filename = match ? match[1] : fallbackFilename;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function downloadJsonBackup() {
  return downloadViaBlob('/export/json', 'inventario-backup.json');
}

export function downloadCsvExport() {
  return downloadViaBlob('/export/csv', 'inventario-prodotti.csv');
}
