const test = require('node:test');
const assert = require('node:assert/strict');
const { validateLocationInput } = require('../src/utils/validateLocationInput');

test('rifiuta nome mancante', () => {
  const result = validateLocationInput({ type: 'magazzino' });
  assert.equal(result.valid, false);
});

test('rifiuta nome vuoto dopo trim', () => {
  const result = validateLocationInput({ name: '   ' });
  assert.equal(result.valid, false);
});

test('rifiuta nome troppo lungo', () => {
  const result = validateLocationInput({ name: 'a'.repeat(81) });
  assert.equal(result.valid, false);
});

test('accetta un nome valido e applica il trim', () => {
  const result = validateLocationInput({ name: '  Magazzino principale  ' });
  assert.equal(result.valid, true);
  assert.equal(result.data.name, 'Magazzino principale');
});

test('un tipo non riconosciuto ricade su "altro" invece di fallire', () => {
  const result = validateLocationInput({ name: 'Test', type: 'astronave' });
  assert.equal(result.valid, true);
  assert.equal(result.data.type, 'altro');
});

test('accetta un tipo valido tra quelli previsti', () => {
  const result = validateLocationInput({ name: 'Furgone 1', type: 'furgone' });
  assert.equal(result.data.type, 'furgone');
});

test('i campi opzionali di default sono stringhe vuote, non undefined', () => {
  const result = validateLocationInput({ name: 'Test' });
  assert.equal(result.data.description, '');
  assert.equal(result.data.address, '');
  assert.equal(result.data.icon, '');
});
