// Funzione pura, nessuna dipendenza da DB. Valida solo i dati "essenziali"
// del flusso rapido (Sezione 31): titolo, unità, quantità iniziale,
// ubicazione iniziale. I campi di dettaglio (Sezione 12) sono tutti
// opzionali e vengono passati così come sono, senza bloccare il salvataggio.
function validateProductInput(body = {}) {
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  if (!title) {
    return { valid: false, error: 'Il titolo è obbligatorio' };
  }
  if (title.length > 120) {
    return { valid: false, error: 'Il titolo è troppo lungo (massimo 120 caratteri)' };
  }

  const unit = typeof body.unit === 'string' && body.unit.trim() ? body.unit.trim() : 'pezzi';

  let initialQuantity = 0;
  if (body.quantity !== undefined && body.quantity !== null && body.quantity !== '') {
    initialQuantity = Number(body.quantity);
    if (Number.isNaN(initialQuantity) || initialQuantity < 0) {
      return { valid: false, error: 'La quantità deve essere un numero maggiore o uguale a 0' };
    }
  }

  const locationId = typeof body.locationId === 'string' ? body.locationId.trim() : '';
  if (initialQuantity > 0 && !locationId) {
    return { valid: false, error: 'Seleziona una ubicazione per la quantità iniziale' };
  }

  // Campi di dettaglio: tutti opzionali, passati così come sono (stringa
  // vuota se assenti) — la UX progressiva li rende disponibili dopo.
  const detail = {
    description: str(body.description),
    category: str(body.category),
    subcategory: str(body.subcategory),
    brand: str(body.brand),
    model: str(body.model),
    color: str(body.color),
    size: str(body.size),
    internalCode: str(body.internalCode),
    barcode: str(body.barcode),
    notes: str(body.notes),
    freeTextLocation: str(body.freeTextLocation)
  };

  if (body.minQuantity !== undefined && body.minQuantity !== null && body.minQuantity !== '') {
    const min = Number(body.minQuantity);
    if (Number.isNaN(min) || min < 0) {
      return { valid: false, error: 'La quantità minima deve essere un numero maggiore o uguale a 0' };
    }
    detail.minQuantity = min;
  }

  if (body.purchasePrice !== undefined && body.purchasePrice !== null && body.purchasePrice !== '') {
    const price = Number(body.purchasePrice);
    if (Number.isNaN(price) || price < 0) {
      return { valid: false, error: 'Il prezzo deve essere un numero maggiore o uguale a 0' };
    }
    detail.purchasePrice = price;
  }

  return {
    valid: true,
    data: { title, unit, initialQuantity, locationId, ...detail }
  };
}

function str(value) {
  return typeof value === 'string' ? value.trim() : '';
}

module.exports = { validateProductInput };
