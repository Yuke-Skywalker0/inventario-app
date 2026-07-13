const test = require('node:test');
const assert = require('node:assert/strict');
const { buildProductSearchFilter, matchesStatus } = require('../src/utils/productSearch');

test('buildProductSearchFilter: base esclude gli archiviati di default', () => {
  const filter = buildProductSearchFilter({ workspaceId: 'w1' });
  assert.equal(filter.archived, false);
});

test('buildProductSearchFilter: includeArchived=true rimuove il filtro archived', () => {
  const filter = buildProductSearchFilter({ workspaceId: 'w1', includeArchived: 'true' });
  assert.equal(filter.archived, undefined);
});

test('buildProductSearchFilter: q genera una ricerca $or su più campi', () => {
  const filter = buildProductSearchFilter({ workspaceId: 'w1', q: 'raccordo 20' });
  assert.ok(Array.isArray(filter.$or));
  assert.ok(filter.$or.length >= 10);
  assert.ok(filter.$or.some((clause) => clause.title));
  assert.ok(filter.$or.some((clause) => clause.barcode));
});

test('buildProductSearchFilter: q vuota non aggiunge $or', () => {
  const filter = buildProductSearchFilter({ workspaceId: 'w1', q: '   ' });
  assert.equal(filter.$or, undefined);
});

test('buildProductSearchFilter: caratteri regex speciali nella query non rompono la ricerca', () => {
  const filter = buildProductSearchFilter({ workspaceId: 'w1', q: 'tubo (20mm)' });
  const titleClause = filter.$or.find((c) => c.title);
  assert.ok(titleClause.title.$regex.includes('\\('));
});

test('buildProductSearchFilter: locationId e category filtrano direttamente', () => {
  const filter = buildProductSearchFilter({ workspaceId: 'w1', locationId: 'loc1', category: 'idraulica' });
  assert.equal(filter['inventory.locationId'], 'loc1');
  assert.equal(filter.category, 'idraulica');
});

test('matchesStatus: senza status accetta sempre', () => {
  const product = { inventory: [], minQuantity: null };
  assert.equal(matchesStatus(product, undefined), true);
});

test('matchesStatus "out": vero solo se la quantità totale è 0', () => {
  assert.equal(matchesStatus({ inventory: [{ quantity: 0 }] }, 'out'), true);
  assert.equal(matchesStatus({ inventory: [{ quantity: 3 }] }, 'out'), false);
});

test('matchesStatus "low": richiede minQuantity impostata e quantità tra 1 e la soglia', () => {
  assert.equal(matchesStatus({ inventory: [{ quantity: 2 }], minQuantity: 5 }, 'low'), true);
  assert.equal(matchesStatus({ inventory: [{ quantity: 10 }], minQuantity: 5 }, 'low'), false);
  assert.equal(matchesStatus({ inventory: [{ quantity: 0 }], minQuantity: 5 }, 'low'), false);
  assert.equal(matchesStatus({ inventory: [{ quantity: 2 }], minQuantity: null }, 'low'), false);
});
