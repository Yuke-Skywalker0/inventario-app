const test = require('node:test');
const assert = require('node:assert/strict');
const { validateInviteInput } = require('../src/utils/validateInviteInput');

test('rifiuta email mancante', () => {
  assert.equal(validateInviteInput({}).valid, false);
});

test('rifiuta email non valida', () => {
  assert.equal(validateInviteInput({ email: 'non-una-email' }).valid, false);
});

test('accetta una email valida con ruolo di default technician', () => {
  const result = validateInviteInput({ email: 'Mario@Esempio.it' });
  assert.equal(result.valid, true);
  assert.equal(result.data.email, 'mario@esempio.it');
  assert.equal(result.data.role, 'technician');
});

test('accetta un ruolo esplicito valido', () => {
  const result = validateInviteInput({ email: 'a@b.it', role: 'viewer' });
  assert.equal(result.data.role, 'viewer');
});

test('un ruolo non invitabile (es. owner) ricade su technician', () => {
  const result = validateInviteInput({ email: 'a@b.it', role: 'owner' });
  assert.equal(result.data.role, 'technician');
});

test('un ruolo inventato ricade su technician', () => {
  const result = validateInviteInput({ email: 'a@b.it', role: 'superadmin' });
  assert.equal(result.data.role, 'technician');
});
