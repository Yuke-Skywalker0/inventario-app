import { apiJson, setAccessToken } from './client';

export async function register({ email, password, name }) {
  const data = await apiJson('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name })
  });
  setAccessToken(data.accessToken);
  return data;
}

export async function login({ email, password }) {
  const data = await apiJson('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  setAccessToken(data.accessToken);
  return data;
}

export async function logout() {
  await apiJson('/auth/logout', { method: 'POST' });
  setAccessToken(null);
}

export async function fetchMe() {
  return apiJson('/me');
}
