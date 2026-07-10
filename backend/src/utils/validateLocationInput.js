const VALID_TYPES = ['magazzino', 'furgone', 'deposito', 'garage', 'altro'];

// Funzione pura: nessuna dipendenza da DB o rete, facile da testare.
// Ritorna { valid: true, data } oppure { valid: false, error }.
function validateLocationInput(body = {}) {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name) {
    return { valid: false, error: 'Il nome è obbligatorio' };
  }
  if (name.length > 80) {
    return { valid: false, error: 'Il nome è troppo lungo (massimo 80 caratteri)' };
  }

  const type = VALID_TYPES.includes(body.type) ? body.type : 'altro';

  const description = typeof body.description === 'string' ? body.description.trim() : '';
  const address = typeof body.address === 'string' ? body.address.trim() : '';
  const icon = typeof body.icon === 'string' ? body.icon.trim() : '';

  return {
    valid: true,
    data: { name, type, description, address, icon }
  };
}

module.exports = { validateLocationInput, VALID_TYPES };
