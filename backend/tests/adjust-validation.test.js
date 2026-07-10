const test = require('node:test');
const assert = require('node:assert/strict');
const { validateAdjustInput } = require('../src/utils/validateAdjustInput');

const validBase = { locationId: '507f1f77bcf86cd799439011', delta: 1, clientOpId: 'abc-123' };

test('rifiuta locationId mancante', () => {
  const result = validateAdjustInput({ ...validBase, locationId: '' });
  assert.equal(result.valid, false);
});

test('rifiuta delta zero', () => {
  const result = validateAdjustInput({ ...validBase, delta: 0 });
  assert.equal(result.valid, false);
});

test('rifiuta delta non numerico', () => {
  const result = validateAdjustInput({ ...validBase, delta: 'due' });
  assert.equal(result.valid, false);
});

test('rifiuta clientOpId mancante (idempotenza obbligatoria)', () => {
  const result = validateAdjustInput({ ...validBase, clientOpId: '' });
  assert.equal(result.valid, false);
});

test('accetta un delta positivo e deduce il tipo "entrata"', () => {
  const result = validateAdjustInput({ ...validBase, delta: 5 });
  assert.equal(result.valid, true);
  assert.equal(result.data.type, 'entrata');
});

test('accetta un delta negativo e deduce il tipo "uscita"', () => {
  const result = validateAdjustInput({ ...validBase, delta: -3 });
  assert.equal(result.valid, true);
  assert.equal(result.data.type, 'uscita');
});

test('un tipo esplicito valido ha priorità sulla deduzione automatica', () => {
  const result = validateAdjustInput({ ...validBase, delta: -3, type: 'danneggiato' });
  assert.equal(result.data.type, 'danneggiato');
});

test('un tipo esplicito non riconosciuto ricade sulla deduzione automatica', () => {
  const result = validateAdjustInput({ ...validBase, delta: 2, type: 'tipo-inventato' });
  assert.equal(result.data.type, 'entrata');
});

test('accetta delta decimale (unità come metri/litri)', () => {
  const result = validateAdjustInput({ ...validBase, delta: 2.5 });
  assert.equal(result.valid, true);
  assert.equal(result.data.delta, 2.5);
});
