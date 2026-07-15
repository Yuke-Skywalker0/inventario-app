import { listQueue, removeFromQueue, cacheProduct } from './db';
import { apiJson } from '../api/client';

// Esegue una singola operazione in coda contro il vero backend. Riusa
// esattamente gli stessi endpoint idempotenti già costruiti nelle Fasi
// 12-18 (clientOpId incluso): un retry non applica l'effetto due volte.
async function runOperation(op) {
  switch (op.type) {
    case 'adjust':
      return apiJson(`/products/${op.productId}/adjust`, {
        method: 'POST',
        body: JSON.stringify(op.body)
      });
    case 'transfer':
      return apiJson(`/products/${op.productId}/transfer`, {
        method: 'POST',
        body: JSON.stringify(op.body)
      });
    default:
      throw new Error(`Tipo di operazione sconosciuto: ${op.type}`);
  }
}

let syncing = false;

// Elabora la coda in ordine (Sezione 25: "evita duplicazioni... gestisce
// errori"). Si ferma al primo errore di rete genuino (probabile che
// siamo di nuovo offline) ma scarta le operazioni che falliscono per un
// motivo applicativo reale (es. quantità diventata insufficiente nel
// frattempo) — riprovarle all'infinito non le farebbe mai riuscire.
export async function syncQueue(onChange) {
  if (syncing) return;
  syncing = true;
  try {
    const ops = await listQueue();
    // Ordine di creazione, così i movimenti si applicano nella sequenza
    // in cui l'utente li ha fatti mentre era offline.
    ops.sort((a, b) => a.createdAt - b.createdAt);

    for (const op of ops) {
      try {
        const data = await runOperation(op);
        if (data.product) {
          await cacheProduct(data.product);
        }
        await removeFromQueue(op.clientOpId);
        onChange?.();
      } catch (err) {
        if (err.status && err.status !== 401) {
          // Il server ha risposto con un errore applicativo genuino (es.
          // quantità insufficiente perché nel frattempo qualcun altro ha
          // consumato la scorta): non ha senso ritentarlo per sempre,
          // lo scartiamo e continuiamo con le operazioni successive.
          console.warn('[sync] operazione scartata:', op, err.message);
          await removeFromQueue(op.clientOpId);
          onChange?.();
        } else {
          // 401 (token scaduto proprio ora, si risolverà da solo al
          // prossimo refresh) o errore di rete vero: ci fermiamo,
          // riproveremo tutta la coda residua al prossimo tentativo.
          // Non scartare mai un'operazione valida per un problema
          // transitorio di autenticazione.
          break;
        }
      }
    }
  } finally {
    syncing = false;
  }
}
