const test = require('node:test');
const assert = require('node:assert/strict');
const { validateImportPayload } = require('../src/utils/validateImportPayload');

test('rifiuta un payload nullo o non oggetto', () => {
  assert.equal(validateImportPayload(null).valid, false);
  assert.equal(validateImportPayload('stringa').valid, false);
});

test('rifiuta se manca la sezione locations', () => {
  const result = validateImportPayload({ products: [] });
  assert.equal(result.valid, false);
});

test('rifiuta se manca la sezione products', () => {
  const result = validateImportPayload({ locations: [] });
  assert.equal(result.valid, false);
});

test('accetta un backup minimo vuoto (solo array vuoti)', () => {
  const result = validateImportPayload({ locations: [], products: [] });
  assert.equal(result.valid, true);
  assert.deepEqual(result.data.movements, []);
});

test('rifiuta una ubicazione senza nome', () => {
  const result = validateImportPayload({ locations: [{ id: '1' }], products: [] });
  assert.equal(result.valid, false);
});

test('rifiuta una ubicazione senza id', () => {
  const result = validateImportPayload({ locations: [{ name: 'Magazzino' }], products: [] });
  assert.equal(result.valid, false);
});

test('rifiuta un prodotto senza titolo', () => {
  const result = validateImportPayload({ locations: [], products: [{ id: '1' }] });
  assert.equal(result.valid, false);
});

test('accetta un backup completo valido', () => {
  const result = validateImportPayload({
    locations: [{ id: 'l1', name: 'Magazzino' }],
    products: [{ id: 'p1', title: 'Raccordo' }],
    movements: [{ productId: 'p1', locationId: 'l1', delta: 5 }]
  });
  assert.equal(result.valid, true);
  assert.equal(result.data.movements.length, 1);
});

test('movements mancante ricade su array vuoto invece di fallire', () => {
  const result = validateImportPayload({
    locations: [{ id: 'l1', name: 'Magazzino' }],
    products: []
  });
  assert.equal(result.valid, true);
  assert.deepEqual(result.data.movements, []);
});
