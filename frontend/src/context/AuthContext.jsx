/**
 * AuthContext.jsx — Contexte d'authentification utilisateur
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as api from '../services/api.js';
import { clearAuthToken, getAuthToken, setAuthToken } from '../utils/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(() => getAuthToken());
  const [loading, setLoading] = useState(Boolean(getAuthToken()));

  useEffect(() => {
    let alive = true;
    if (!token) {
      setUser(null);
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    api
      .fetchMe()
      .then((data) => {
        if (!alive) return;
        setUser(data?.user ?? null);
      })
      .catch(() => {
        if (!alive) return;
        clearAuthToken();
        setTokenState(null);
        setUser(null);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [token]);

  const persistAuth = useCallback((nextToken, nextUser) => {
    setAuthToken(nextToken);
    setTokenState(nextToken);
    setUser(nextUser ?? null);
  }, []);

  const login = useCallback(
    async ({ email, password }) => {
      const data = await api.login({ email, password });
      persistAuth(data.token, data.user);
      return data.user;
    },
    [persistAuth],
  );

  const register = useCallback(
    async ({ email, password, name }) => {
      const data = await api.register({ email, password, name });
      persistAuth(data.token, data.user);
      return data.user;
    },
    [persistAuth],
  );

  const logout = useCallback(() => {
    clearAuthToken();
    setTokenState(null);
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    if (!token) return null;
    const data = await api.fetchMe();
    setUser(data?.user ?? null);
    return data?.user ?? null;
  }, [token]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user && token),
      login,
      register,
      logout,
      refresh,
    }),
    [user, token, loading, login, register, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return ctx;
}
