const test = require('node:test');
const assert = require('node:assert/strict');
const { buildProductsCsv, escapeCsvField } = require('../src/utils/buildProductsCsv');

test('escapeCsvField: racchiude tra virgolette un valore con virgola', () => {
  assert.equal(escapeCsvField('Rosso, opaco'), '"Rosso, opaco"');
});

test('escapeCsvField: raddoppia le virgolette interne', () => {
  assert.equal(escapeCsvField('Misura 20"'), '"Misura 20"""');
});

test('escapeCsvField: valore semplice non viene modificato', () => {
  assert.equal(escapeCsvField('Raccordo'), 'Raccordo');
});

test('escapeCsvField: null/undefined diventano stringa vuota', () => {
  assert.equal(escapeCsvField(null), '');
  assert.equal(escapeCsvField(undefined), '');
});

test('buildProductsCsv: produce un header e una riga per prodotto', () => {
  const products = [
    { title: 'Raccordo 20mm', unit: 'pezzi', inventory: [{ locationId: 'loc1', quantity: 5 }] }
  ];
  const locationsById = { loc1: { name: 'Magazzino' } };
  const csv = buildProductsCsv(products, locationsById);
  const lines = csv.split('\r\n');
  assert.equal(lines.length, 2);
  assert.ok(lines[0].startsWith('Titolo,'));
  assert.ok(lines[1].includes('Raccordo 20mm'));
  assert.ok(lines[1].includes('Magazzino: 5'));
});

test('buildProductsCsv: somma correttamente la quantità totale su più ubicazioni', () => {
  const products = [
    {
      title: 'Tubo',
      unit: 'metri',
      inventory: [
        { locationId: 'loc1', quantity: 10 },
        { locationId: 'loc2', quantity: 5 }
      ]
    }
  ];
  const csv = buildProductsCsv(products, { loc1: { name: 'A' }, loc2: { name: 'B' } });
  assert.ok(csv.includes(',15,')); // quantità totale = 15
});

test('buildProductsCsv: gestisce un prodotto senza alcuna ubicazione', () => {
  const products = [{ title: 'Senza scorta', unit: 'pezzi', inventory: [] }];
  const csv = buildProductsCsv(products, {});
  assert.ok(csv.includes('Senza scorta'));
});
