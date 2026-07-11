function validateTransferInput(body = {}) {
  const fromLocationId = typeof body.fromLocationId === 'string' ? body.fromLocationId.trim() : '';
  const toLocationId = typeof body.toLocationId === 'string' ? body.toLocationId.trim() : '';

  if (!fromLocationId || !toLocationId) {
    return { valid: false, error: 'Origine e destinazione sono obbligatorie' };
  }
  if (fromLocationId === toLocationId) {
    return { valid: false, error: "L'origine e la destinazione devono essere diverse" };
  }

  const quantity = Number(body.quantity);
  if (Number.isNaN(quantity) || quantity <= 0) {
    return { valid: false, error: 'La quantità da trasferire deve essere maggiore di 0' };
  }

  const clientOpId = typeof body.clientOpId === 'string' ? body.clientOpId.trim() : '';
  if (!clientOpId) {
    return { valid: false, error: 'clientOpId mancante (richiesto per evitare duplicazioni)' };
  }

  const note = typeof body.note === 'string' ? body.note.trim() : '';

  return { valid: true, data: { fromLocationId, toLocationId, quantity, clientOpId, note } };
}

module.exports = { validateTransferInput };
