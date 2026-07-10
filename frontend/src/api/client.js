const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// L'access token vive SOLO in memoria (mai in localStorage, per sicurezza
// — vedi Fase 4 / ADL). Si perde ad ogni refresh di pagina: in quel caso
// chiamiamo /auth/refresh una volta all'avvio (vedi AuthContext) per
// ottenerne uno nuovo grazie al cookie httpOnly.
let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

async function refreshAccessToken() {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include'
  });
  if (!res.ok) {
    accessToken = null;
    return null;
  }
  const data = await res.json();
  accessToken = data.accessToken;
  return accessToken;
}

// Wrapper fetch: aggiunge il Bearer token, e se il server risponde 401
// prova UNA sola volta a rinnovarlo con /auth/refresh prima di arrendersi.
// Questo copre silenziosamente il caso "access token scaduto durante l'uso".
export async function apiFetch(path, options = {}) {
  const doFetch = (token) =>
    fetch(`${API_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      }
    });

  let res = await doFetch(accessToken);

  if (res.status === 401 && path !== '/auth/refresh') {
    const newToken = await refreshAccessToken();
    if (newToken) {
      res = await doFetch(newToken);
    }
  }

  return res;
}

export async function apiJson(path, options = {}) {
  const res = await apiFetch(path, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.error || 'Errore di rete');
    error.status = res.status;
    throw error;
  }
  return data;
}

export { refreshAccessToken };
