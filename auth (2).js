const VALID_TYPES = [
  'entrata',
  'uscita',
  'rettifica',
  'trasferimento',
  'utilizzo',
  'danneggiato',
  'perso',
  'restituzione'
];

function validateAdjustInput(body = {}) {
  const locationId = typeof body.locationId === 'string' ? body.locationId.trim() : '';
  if (!locationId) {
    return { valid: false, error: "L'ubicazione è obbligatoria" };
  }

  const delta = Number(body.delta);
  if (Number.isNaN(delta) || delta === 0) {
    return { valid: false, error: 'La variazione deve essere un numero diverso da zero' };
  }

  const clientOpId = typeof body.clientOpId === 'string' ? body.clientOpId.trim() : '';
  if (!clientOpId) {
    return { valid: false, error: 'clientOpId mancante (richiesto per evitare duplicazioni)' };
  }

  let type = VALID_TYPES.includes(body.type) ? body.type : delta > 0 ? 'entrata' : 'uscita';

  const reason = typeof body.reason === 'string' ? body.reason.trim() : '';
  const note = typeof body.note === 'string' ? body.note.trim() : '';

  return { valid: true, data: { locationId, delta, type, reason, note, clientOpId } };
}

module.exports = { validateAdjustInput, VALID_TYPES };
