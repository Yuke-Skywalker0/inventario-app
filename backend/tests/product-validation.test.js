const test = require('node:test');
const assert = require('node:assert/strict');
const { validateProductInput } = require('../src/utils/validateProductInput');

test('rifiuta titolo mancante', () => {
  const result = validateProductInput({});
  assert.equal(result.valid, false);
});

test('rifiuta titolo vuoto dopo trim', () => {
  const result = validateProductInput({ title: '   ' });
  assert.equal(result.valid, false);
});

test('accetta il flusso minimo: solo titolo', () => {
  const result = validateProductInput({ title: 'Raccordo 20mm' });
  assert.equal(result.valid, true);
  assert.equal(result.data.unit, 'pezzi');
  assert.equal(result.data.initialQuantity, 0);
});

test('rifiuta quantità negativa', () => {
  const result = validateProductInput({ title: 'Test', quantity: -5 });
  assert.equal(result.valid, false);
});

test('rifiuta quantità non numerica', () => {
  const result = validateProductInput({ title: 'Test', quantity: 'abc' });
  assert.equal(result.valid, false);
});

test('accetta quantità decimale (Sezione 13)', () => {
  const result = validateProductInput({
    title: 'Tubo',
    quantity: 32.5,
    unit: 'metri',
    locationId: '507f1f77bcf86cd799439011'
  });
  assert.equal(result.valid, true);
  assert.equal(result.data.initialQuantity, 32.5);
});

test('richiede locationId se la quantità iniziale è maggiore di 0', () => {
  const result = validateProductInput({ title: 'Test', quantity: 5 });
  assert.equal(result.valid, false);
});

test('non richiede locationId se la quantità è 0 (prodotto aggiunto senza scorta)', () => {
  const result = validateProductInput({ title: 'Test', quantity: 0 });
  assert.equal(result.valid, true);
});

test('rifiuta un titolo troppo lungo', () => {
  const result = validateProductInput({ title: 'a'.repeat(121) });
  assert.equal(result.valid, false);
});

test('rifiuta minQuantity negativa', () => {
  const result = validateProductInput({ title: 'Test', minQuantity: -1 });
  assert.equal(result.valid, false);
});

test('rifiuta purchasePrice negativo', () => {
  const result = validateProductInput({ title: 'Test', purchasePrice: -1 });
  assert.equal(result.valid, false);
});

test('i campi di dettaglio opzionali di default sono stringhe vuote', () => {
  const result = validateProductInput({ title: 'Test' });
  assert.equal(result.data.category, '');
  assert.equal(result.data.brand, '');
});
