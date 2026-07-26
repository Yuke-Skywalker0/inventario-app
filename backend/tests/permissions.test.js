const test = require('node:test');
const assert = require('node:assert/strict');
const { requireMinRole, ROLE_ORDER } = require('../src/middleware/permissions');

function callMiddleware(middleware, role) {
  const req = { memberRole: role };
  let statusCode = null;
  let body = null;
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(payload) {
      body = payload;
      return this;
    }
  };
  let nextCalled = false;
  middleware(req, res, () => {
    nextCalled = true;
  });
  return { nextCalled, statusCode, body };
}

test('ROLE_ORDER ha la gerarchia attesa', () => {
  assert.deepEqual(ROLE_ORDER, ['viewer', 'technician', 'admin', 'owner']);
});

test('requireMinRole("admin"): un viewer viene rifiutato con 403', () => {
  const middleware = requireMinRole('admin');
  const { nextCalled, statusCode } = callMiddleware(middleware, 'viewer');
  assert.equal(nextCalled, false);
  assert.equal(statusCode, 403);
});

test('requireMinRole("admin"): un technician viene rifiutato', () => {
  const middleware = requireMinRole('admin');
  const { nextCalled } = callMiddleware(middleware, 'technician');
  assert.equal(nextCalled, false);
});

test('requireMinRole("admin"): un admin passa', () => {
  const middleware = requireMinRole('admin');
  const { nextCalled } = callMiddleware(middleware, 'admin');
  assert.equal(nextCalled, true);
});

test('requireMinRole("admin"): un owner passa (gerarchia superiore)', () => {
  const middleware = requireMinRole('admin');
  const { nextCalled } = callMiddleware(middleware, 'owner');
  assert.equal(nextCalled, true);
});

test('requireMinRole("technician"): un viewer viene rifiutato, un technician passa', () => {
  const middleware = requireMinRole('technician');
  assert.equal(callMiddleware(middleware, 'viewer').nextCalled, false);
  assert.equal(callMiddleware(middleware, 'technician').nextCalled, true);
});

test('requireMinRole("viewer"): chiunque abbia un ruolo valido passa', () => {
  const middleware = requireMinRole('viewer');
  for (const role of ROLE_ORDER) {
    assert.equal(callMiddleware(middleware, role).nextCalled, true);
  }
});

test('requireMinRole: un ruolo mancante/non riconosciuto viene rifiutato', () => {
  const middleware = requireMinRole('admin');
  const { nextCalled, statusCode } = callMiddleware(middleware, undefined);
  assert.equal(nextCalled, false);
  assert.equal(statusCode, 403);
});
