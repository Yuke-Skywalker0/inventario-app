import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { refreshAccessToken, setAccessToken } from '../api/client';
import { login as apiLogin, register as apiRegister, logout as apiLogout, fetchMe } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [role, setRole] = useState(null);
  // 'loading' finché non sappiamo ancora se esiste una sessione valida
  // (evita un lampo della schermata di login ad ogni apertura dell'app).
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      let token = null;
      try {
        token = await refreshAccessToken();
      } catch {
        token = null;
      }
      if (cancelled) return;

      if (!token) {
        setStatus('signed-out');
        return;
      }

      try {
        const data = await fetchMe();
        if (cancelled) return;
        setUser(data.user);
        setWorkspace(data.workspace);
        setRole(data.role);
        setStatus('signed-in');
      } catch {
        if (!cancelled) setStatus('signed-out');
      }
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await apiLogin(credentials);
    setUser(data.user);
    setWorkspace(data.workspace);
    setRole(data.role);
    setStatus('signed-in');
    return data;
  }, []);

  const register = useCallback(async (details) => {
    const data = await apiRegister(details);
    setUser(data.user);
    setWorkspace(data.workspace);
    setRole(data.role);
    setStatus('signed-in');
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } finally {
      setAccessToken(null);
      setUser(null);
      setWorkspace(null);
      setRole(null);
      setStatus('signed-out');
    }
  }, []);

  // Dopo aver accettato un invito o cambiato workspace attivo, i dati di
  // /api/me sono cambiati: questa funzione li rilegge senza dover fare
  // un logout/login completo.
  const refreshWorkspace = useCallback(async () => {
    const data = await fetchMe();
    setUser(data.user);
    setWorkspace(data.workspace);
    setRole(data.role);
    return data;
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, workspace, role, status, login, register, logout, refreshWorkspace }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve essere usato dentro <AuthProvider>');
  return ctx;
}
