const test = require('node:test');
const assert = require('node:assert/strict');
const { validateShoppingListInput, validatePurchaseInput } = require('../src/utils/validateShoppingListInput');

test('validateShoppingListInput: rifiuta productId mancante', () => {
  const result = validateShoppingListInput({});
  assert.equal(result.valid, false);
});

test('validateShoppingListInput: accetta senza quantityToBuy (opzionale)', () => {
  const result = validateShoppingListInput({ productId: 'abc' });
  assert.equal(result.valid, true);
  assert.equal(result.data.quantityToBuy, null);
});

test('validateShoppingListInput: rifiuta quantityToBuy zero o negativa', () => {
  assert.equal(validateShoppingListInput({ productId: 'abc', quantityToBuy: 0 }).valid, false);
  assert.equal(validateShoppingListInput({ productId: 'abc', quantityToBuy: -2 }).valid, false);
});

test('validateShoppingListInput: accetta una quantityToBuy valida', () => {
  const result = validateShoppingListInput({ productId: 'abc', quantityToBuy: 10 });
  assert.equal(result.valid, true);
  assert.equal(result.data.quantityToBuy, 10);
});

const validPurchase = {
  productId: 'p1',
  locationId: 'l1',
  quantity: 5,
  clientOpId: 'op-1'
};

test('validatePurchaseInput: rifiuta productId o locationId mancanti', () => {
  assert.equal(validatePurchaseInput({ ...validPurchase, productId: '' }).valid, false);
  assert.equal(validatePurchaseInput({ ...validPurchase, locationId: '' }).valid, false);
});

test('validatePurchaseInput: rifiuta quantità non positiva', () => {
  assert.equal(validatePurchaseInput({ ...validPurchase, quantity: 0 }).valid, false);
  assert.equal(validatePurchaseInput({ ...validPurchase, quantity: -1 }).valid, false);
});

test('validatePurchaseInput: rifiuta clientOpId mancante', () => {
  const result = validatePurchaseInput({ ...validPurchase, clientOpId: '' });
  assert.equal(result.valid, false);
});

test("validatePurchaseInput: itemId è opzionale (voce automatica non ce l'ha)", () => {
  const result = validatePurchaseInput(validPurchase);
  assert.equal(result.valid, true);
  assert.equal(result.data.itemId, '');
});

test('validatePurchaseInput: accetta un acquisto valido con itemId', () => {
  const result = validatePurchaseInput({ ...validPurchase, itemId: 'item-1' });
  assert.equal(result.valid, true);
  assert.equal(result.data.itemId, 'item-1');
});
