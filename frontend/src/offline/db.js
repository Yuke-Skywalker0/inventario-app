import { openDB } from 'idb';

const DB_NAME = 'inventario-offline';
const DB_VERSION = 1;

let dbPromise = null;

// Un solo database IndexedDB per tutta l'app, aperto una volta sola e
// riusato (idb gestisce la connessione internamente).
function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('products')) {
          db.createObjectStore('products', { keyPath: '_id' });
        }
        if (!db.objectStoreNames.contains('locations')) {
          db.createObjectStore('locations', { keyPath: '_id' });
        }
        // La coda: ogni operazione in attesa di sincronizzazione, chiave
        // = lo stesso clientOpId usato per l'idempotenza lato server
        // (Sezione 25/38) — se la sincronizzazione viene ritentata due
        // volte per errore, non crea comunque un duplicato.
        if (!db.objectStoreNames.contains('queue')) {
          db.createObjectStore('queue', { keyPath: 'clientOpId' });
        }
      }
    });
  }
  return dbPromise;
}

// --- Cache prodotti ---

export async function cacheProducts(products) {
  const db = await getDB();
  const tx = db.transaction('products', 'readwrite');
  await Promise.all(products.map((p) => tx.store.put(p)));
  await tx.done;
}

export async function cacheProduct(product) {
  const db = await getDB();
  await db.put('products', product);
}

export async function getCachedProducts() {
  const db = await getDB();
  return db.getAll('products');
}

export async function getCachedProduct(id) {
  const db = await getDB();
  return db.get('products', id);
}

// --- Cache ubicazioni ---

export async function cacheLocations(locations) {
  const db = await getDB();
  const tx = db.transaction('locations', 'readwrite');
  await Promise.all(locations.map((l) => tx.store.put(l)));
  await tx.done;
}

export async function getCachedLocations() {
  const db = await getDB();
  return db.getAll('locations');
}

// --- Coda di sincronizzazione ---

export async function enqueueOperation(op) {
  const db = await getDB();
  await db.put('queue', op);
}

export async function listQueue() {
  const db = await getDB();
  return db.getAll('queue');
}

export async function removeFromQueue(clientOpId) {
  const db = await getDB();
  await db.delete('queue', clientOpId);
}

export async function queueCount() {
  const db = await getDB();
  return db.count('queue');
}
