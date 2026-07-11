const test = require('node:test');
const assert = require('node:assert/strict');
const { validateTransferInput } = require('../src/utils/validateTransferInput');

const validBase = {
  fromLocationId: '507f1f77bcf86cd799439011',
  toLocationId: '507f1f77bcf86cd799439022',
  quantity: 5,
  clientOpId: 'transfer-abc'
};

test('rifiuta origine mancante', () => {
  const result = validateTransferInput({ ...validBase, fromLocationId: '' });
  assert.equal(result.valid, false);
});

test('rifiuta destinazione mancante', () => {
  const result = validateTransferInput({ ...validBase, toLocationId: '' });
  assert.equal(result.valid, false);
});

test('rifiuta origine e destinazione uguali', () => {
  const result = validateTransferInput({ ...validBase, toLocationId: validBase.fromLocationId });
  assert.equal(result.valid, false);
});

test('rifiuta quantità zero', () => {
  const result = validateTransferInput({ ...validBase, quantity: 0 });
  assert.equal(result.valid, false);
});

test('rifiuta quantità negativa', () => {
  const result = validateTransferInput({ ...validBase, quantity: -3 });
  assert.equal(result.valid, false);
});

test('rifiuta clientOpId mancante', () => {
  const result = validateTransferInput({ ...validBase, clientOpId: '' });
  assert.equal(result.valid, false);
});

test('accetta un trasferimento valido', () => {
  const result = validateTransferInput(validBase);
  assert.equal(result.valid, true);
  assert.equal(result.data.quantity, 5);
});

test('accetta quantità decimale', () => {
  const result = validateTransferInput({ ...validBase, quantity: 2.5 });
  assert.equal(result.valid, true);
  assert.equal(result.data.quantity, 2.5);
});
