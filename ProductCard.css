const test = require('node:test');
const assert = require('node:assert/strict');

process.env.JWT_ACCESS_SECRET = 'test_access_secret';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';
process.env.JWT_ACCESS_EXPIRES = '1s';
process.env.JWT_REFRESH_EXPIRES = '30d';

const bcrypt = require('bcryptjs');
const {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  hashToken
} = require('../src/utils/jwt');

const fakeUser = { _id: { toString: () => '507f1f77bcf86cd799439011' } };

test('bcrypt: hash diverso dalla password in chiaro', async () => {
  const hash = await bcrypt.hash('passwordsicura123', 12);
  assert.notEqual(hash, 'passwordsicura123');
});

test('bcrypt: riconosce password corretta e rifiuta quella sbagliata', async () => {
  const hash = await bcrypt.hash('passwordsicura123', 12);
  assert.equal(await bcrypt.compare('passwordsicura123', hash), true);
  assert.equal(await bcrypt.compare('sbagliata', hash), false);
});

test('jwt: access e refresh token sono diversi e portano il sub corretto', () => {
  const access = signAccessToken(fakeUser);
  const refresh = signRefreshToken(fakeUser);
  assert.notEqual(access, refresh);

  const payload = verifyAccessToken(access);
  assert.equal(payload.sub, '507f1f77bcf86cd799439011');
});

test('jwt: un token firmato con il secret sbagliato viene rifiutato', () => {
  const refresh = signRefreshToken(fakeUser);
  assert.throws(() => verifyAccessToken(refresh));
});

test('jwt: un access token scaduto viene rifiutato', async () => {
  const access = signAccessToken(fakeUser);
  await new Promise((r) => setTimeout(r, 1200));
  assert.throws(() => verifyAccessToken(access), /jwt expired/);
});

test('hashToken: deterministico e sensibile all\'input', () => {
  assert.equal(hashToken('abc'), hashToken('abc'));
  assert.notEqual(hashToken('abc'), hashToken('xyz'));
});
