'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type UserRole = 'admin' | 'funcionario' | 'pa' | 'investigador' | 'tecnologo';

export interface User {
  id: number | string;
  nombre: string;
  correo: string;
  rut?: string;
  roles: UserRole[];
}

type AuthState = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (rut: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  authFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  portalFor: (roles: UserRole[]) => string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3001/api/v1';

const ROLE_MAP: Record<string, UserRole> = {
  PACIENTE: 'pa',
  FUNCIONARIO: 'funcionario',
  TECNOLOGO: 'tecnologo',
  INVESTIGADOR: 'investigador',
  ADMIN: 'admin',
};

const STORAGE_KEY = 'session_v1';
const AuthContext = createContext<AuthState | undefined>(undefined);

// --- helpers ---
const S = (x: unknown) => typeof x === 'string' ? x.trim() : '';
const U = (x: unknown) => S(x).toUpperCase();
function normRut(r: string) {
  return (r || '').replace(/\./g, '').replace(/-/g, '').toUpperCase();
}

export function AuthProvider({ children }: { readonly children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null); 
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API_BASE}/auth/me`, { credentials: 'include' });
        if (r.ok) {
          const { me } = await r.json();
          const mapped = (Array.isArray(me?.roles) ? me.roles : [])
            .map((x: string) => ROLE_MAP[String(x).toUpperCase()])
            .filter(Boolean) as UserRole[];

          setUser({
            id: me?.id ?? me?.sub ?? '',
            nombre: me?.nombre ?? '',
            correo: me?.correo ?? '',
            rut: me?.rut,
            roles: mapped,
          });
          return;
        }
        else if (r.status === 401) {
          // No autorizado, no hacer nada y limpiar estado
          setUser(null);
          setToken(null);
          localStorage.removeItem(STORAGE_KEY);
          return;
        }

  
        const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
        if (raw) {
          const parsed = JSON.parse(raw) as { user: User; token: string };
          setUser(parsed.user);
          setToken(parsed.token ?? null);
        }
      } catch {
        const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
        if (raw) {
          const parsed = JSON.parse(raw) as { user: User; token: string };
          setUser(parsed.user);
          setToken(parsed.token ?? null);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const portalFor = (roles: UserRole[]) => {
    const rolePriority: Record<UserRole, string> = {
      admin: '/adm',
      investigador: '/inv',
      tecnologo: '/tecnologo',
      pa: '/pa',
      funcionario: '/fun',
    };
    for (const role of Object.keys(rolePriority) as UserRole[]) {
      if (roles.includes(role)) return rolePriority[role];
    }
    return '/login';
  };

  const login = async (rut: string, password: string) => {
    if (!rut || !password) throw new Error('RUT y contraseña son obligatorios');
    const url = `${API_BASE}/auth/login`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ rut: normRut(rut), password }),
    });

    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body?.error || `HTTP ${res.status}: ${url}`);
    const mappedRoles: UserRole[] = (body?.user?.roles || [])
      .map((r: string) => ROLE_MAP[String(r).trim().toUpperCase()] || null)
      .filter(Boolean) as UserRole[];
    const u: User = {
      id: body.user.id,
      nombre: body.user?.nombre,
      correo: body.user?.correo,
      rut: body.user?.rut,
      roles: mappedRoles,

    };
    setUser(u);
    const tok: string | null = body?.token ?? null;
    setToken(tok);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: u, token: tok || '' }));
    return u;
  };

  const logout = async () => {
    await fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
  };


  const authFetch: AuthState['authFetch'] = async (input, init = {}) => {
    const headers = new Headers(init.headers || {});
    if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`);
    if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    const resp = await fetch(input, { ...init, headers, credentials: 'include' });
    if (resp.status === 401) await logout();
    return resp;
  };

  const value = useMemo(
    () => ({ user, token, loading, login, logout, authFetch, portalFor }),
    [user, token, loading]
  );

  if (loading) return null;
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
