import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type Role = 'ADMIN' | 'USER' | null;

type AuthUser = { id: string; email: string; role: 'ADMIN' | 'USER' } | null;

type AuthContextType = {
  user: AuthUser;
  role: Role;
  loading: boolean;
  loginAdmin: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  apiBase: string;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getApiBase = () => {
  const envBase = (import.meta as any)?.env?.VITE_API_BASE as string | undefined;
  if (envBase) return envBase.replace(/\/$/, '');
  // Default to local dev backend
  return 'http://localhost:4000';
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);
  const apiBase = useMemo(() => getApiBase(), []);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/auth/me`, { credentials: 'include' });
      const data = await res.json();
      setUser(data?.user || null);
    } catch (e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const loginAdmin = useCallback(async (username: string, password: string) => {
    try {
      const res = await fetch(`${apiBase}/auth/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { ok: false, error: err?.error || 'Login fallito' };
      }
      const data = await res.json();
      setUser(data?.user || null);
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message || 'Errore di rete' };
    }
  }, [apiBase]);

  const logout = useCallback(async () => {
    try {
      await fetch(`${apiBase}/auth/logout`, { method: 'POST', credentials: 'include' });
    } finally {
      setUser(null);
    }
  }, [apiBase]);

  const value = useMemo(() => ({ user, role: user?.role ?? null, loading, loginAdmin, logout, refresh, apiBase }), [user, loading, loginAdmin, logout, refresh, apiBase]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};