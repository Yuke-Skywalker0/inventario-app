import { apiJson, setAccessToken } from './client';

export async function register({ email, password, name, rememberMe = true }) {
  const data = await apiJson('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name, rememberMe })
  });
  setAccessToken(data.accessToken);
  return data;
}

export async function login({ email, password, rememberMe = true }) {
  const data = await apiJson('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, rememberMe })
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
