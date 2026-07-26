// Verifica che il file caricato sia davvero un backup generato da questa
// app (Sezione 59): struttura minima, non un controllo esaustivo di ogni
// campo — l'obiettivo è evitare un crash su un file completamente
// sbagliato, non validare ogni singolo dato (quello lo fanno comunque i
// modelli Mongoose in fase di creazione).
function validateImportPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, error: 'File non valido: non è un backup JSON riconoscibile' };
  }

  if (!Array.isArray(payload.locations) || !Array.isArray(payload.products)) {
    return { valid: false, error: 'File non valido: mancano le sezioni "locations" o "products"' };
  }

  for (const loc of payload.locations) {
    if (!loc || typeof loc.name !== 'string' || !loc.name.trim()) {
      return { valid: false, error: 'Una ubicazione nel file non ha un nome valido' };
    }
    if (!loc.id) {
      return { valid: false, error: 'Una ubicazione nel file non ha un id di riferimento' };
    }
  }

  for (const p of payload.products) {
    if (!p || typeof p.title !== 'string' || !p.title.trim()) {
      return { valid: false, error: 'Un prodotto nel file non ha un titolo valido' };
    }
    if (!p.id) {
      return { valid: false, error: 'Un prodotto nel file non ha un id di riferimento' };
    }
  }

  const movements = Array.isArray(payload.movements) ? payload.movements : [];

  return { valid: true, data: { locations: payload.locations, products: payload.products, movements } };
}

module.exports = { validateImportPayload };
