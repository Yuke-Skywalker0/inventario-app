const SEARCHABLE_TEXT_FIELDS = [
  'title',
  'category',
  'subcategory',
  'brand',
  'model',
  'color',
  'size',
  'notes',
  'internalCode',
  'barcode',
  'tags'
];

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Costruisce il filtro Mongo per la ricerca prodotti (Sezione 18/19).
// Funzione pura: prende query params già estratti, ritorna un oggetto
// filtro Mongo. Separata dal controller per essere testabile senza DB.
function buildProductSearchFilter({ workspaceId, q, locationId, category, includeArchived }) {
  const filter = { workspaceId };

  if (includeArchived !== 'true') {
    filter.archived = false;
  }
  if (locationId) {
    filter['inventory.locationId'] = locationId;
  }
  if (category) {
    filter.category = category;
  }
  if (q && q.trim()) {
    const regex = { $regex: escapeRegex(q.trim()), $options: 'i' };
    filter.$or = SEARCHABLE_TEXT_FIELDS.map((field) => ({ [field]: regex }));
  }

  return filter;
}

// Filtro di stato scorta: non è esprimibile come query Mongo semplice
// perché la quantità totale è la somma di un array (inventory), quindi
// si applica dopo il fetch (Sezione 39: dataset comunque limitato dalla
// paginazione a monte).
function matchesStatus(product, status) {
  if (!status) return true;
  const total = product.inventory.reduce((sum, i) => sum + i.quantity, 0);
  if (status === 'out') return total === 0;
  if (status === 'low') {
    return product.minQuantity != null && total > 0 && total <= product.minQuantity;
  }
  return true;
}

module.exports = { buildProductSearchFilter, matchesStatus, SEARCHABLE_TEXT_FIELDS };
