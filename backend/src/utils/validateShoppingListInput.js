function validateShoppingListInput(body = {}) {
  const productId = typeof body.productId === 'string' ? body.productId.trim() : '';
  if (!productId) {
    return { valid: false, error: 'Il prodotto è obbligatorio' };
  }

  let quantityToBuy = null;
  if (body.quantityToBuy !== undefined && body.quantityToBuy !== null && body.quantityToBuy !== '') {
    quantityToBuy = Number(body.quantityToBuy);
    if (Number.isNaN(quantityToBuy) || quantityToBuy <= 0) {
      return { valid: false, error: 'La quantità da comprare deve essere maggiore di 0' };
    }
  }

  return { valid: true, data: { productId, quantityToBuy } };
}

function validatePurchaseInput(body = {}) {
  const productId = typeof body.productId === 'string' ? body.productId.trim() : '';
  const locationId = typeof body.locationId === 'string' ? body.locationId.trim() : '';
  if (!productId || !locationId) {
    return { valid: false, error: 'Prodotto e ubicazione sono obbligatori' };
  }

  const quantity = Number(body.quantity);
  if (Number.isNaN(quantity) || quantity <= 0) {
    return { valid: false, error: 'La quantità deve essere maggiore di 0' };
  }

  const clientOpId = typeof body.clientOpId === 'string' ? body.clientOpId.trim() : '';
  if (!clientOpId) {
    return { valid: false, error: 'clientOpId mancante (richiesto per evitare duplicazioni)' };
  }

  const itemId = typeof body.itemId === 'string' ? body.itemId.trim() : '';

  return { valid: true, data: { productId, locationId, quantity, clientOpId, itemId } };
}

module.exports = { validateShoppingListInput, validatePurchaseInput };
