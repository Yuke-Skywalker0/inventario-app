// Funzione pura: costruisce il testo CSV dei prodotti. Nessuna gestione
// speciale di virgole/virgolette lasciata al caso (Sezione 59): ogni
// campo passa da escapeCsvField.
function escapeCsvField(value) {
  const str = value === null || value === undefined ? '' : String(value);
  if (/[",\n;]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const HEADERS = [
  'Titolo',
  'Categoria',
  'Marca',
  'Modello',
  'Colore',
  'Misura',
  'Unità',
  'Quantità totale',
  'Quantità minima',
  'Barcode',
  'Ubicazioni (nome: quantità)',
  'Archiviato'
];

function buildProductsCsv(products, locationsById = {}) {
  const rows = [HEADERS.join(',')];

  for (const p of products) {
    const total = (p.inventory || []).reduce((sum, i) => sum + i.quantity, 0);
    const perLocation = (p.inventory || [])
      .map((i) => {
        const name = locationsById[i.locationId]?.name || i.locationId;
        return `${name}: ${i.quantity}`;
      })
      .join('; ');

    const row = [
      p.title,
      p.category,
      p.brand,
      p.model,
      p.color,
      p.size,
      p.unit,
      total,
      p.minQuantity ?? '',
      p.barcode,
      perLocation,
      p.archived ? 'sì' : 'no'
    ].map(escapeCsvField);

    rows.push(row.join(','));
  }

  // \r\n: massima compatibilità con Excel (Sezione 59: pensato per un
  // export utilizzabile davvero, non solo tecnicamente corretto).
  return rows.join('\r\n');
}

module.exports = { buildProductsCsv, escapeCsvField };
