'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { isValidRutCl } from '../utils/rut';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3001/api/v1';

export type User = {
  id: number;
  rut: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  correo: string;
  telefono?: string;
  sexo?: 'M'|'F'|'O';
  fecha_nacimiento?: string;
  email_verified?: boolean;
  roles?: string[]; // para detectar ADMIN

  profile?: {
    id?: number;
    rut_profesional?: string;
    cargo?: 'TECNOLOGO'|'INVESTIGADOR'|'FUNCIONARIO';
    especialidad?: string | null;
    hospital?: string | null;
    departamento?: string | null;
    activo?: boolean;
  } | null;

  professional_profile?: User['profile'] | null;
  professionalProfile?: User['profile'] | null;
};

// ===== REEMPLAZA ESTE TIPO =====
type CreateUserPayload = {
  user: {
    rut: string;
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;
    correo: string;
    password: string;
    telefono?: string;
    sexo?: 'M'|'F'|'O'|'';
    fecha_nacimiento?: string;
  };
  role?: 'ADMIN'; 
  profile?: {     
    cargo: 'TECNOLOGO'|'INVESTIGADOR'|'FUNCIONARIO';
    rut_profesional?: string;
    especialidad?: string | null;
    hospital?: string | null;
    departamento?: string | null;
  };
};


type Ctx = {
  users: User[];
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  createUser: (p: CreateUserPayload) => Promise<any>;
  addRole: (userId: number, role: string) => Promise<any>;
  removeRole: (userId: number, role: string) => Promise<void>;
  updateProfile: (userId: number, partial: Partial<User['profile']>) => Promise<any>;
};

const AdminUsersCtx = createContext<Ctx | null>(null);

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return (
    localStorage.getItem('token') ||
    localStorage.getItem('auth_token') ||
    localStorage.getItem('access_token')
  );
}

async function parseJsonSafe(res: Response) {
  try { return await res.json(); } catch { return null; }
}

function pickProfile(u: any): User['profile'] | null {
  return (
    u?.profile ??
    u?.professional_profile ??
    u?.professionalProfile ??
    u?.profesional_profile ??
    u?.profile_profesional ??
    u?.perfil_profesional ??
    (Array.isArray(u?.profiles) ? u.profiles[0] : undefined) ??
    (Array.isArray(u?.professional_profiles) ? u.professional_profiles[0] : undefined) ??
    (Array.isArray(u?.professionalProfiles) ? u.professionalProfiles[0] : undefined) ??
    null
  );
}

export function AdminUsersProvider({ children }: { readonly children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setErr] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true); setErr(null);
    try {
      const headers: Record<string,string> = {};
      const t = getAuthToken();
      if (t) headers['Authorization'] = `Bearer ${t}`;

      const r = await fetch(`${API_BASE}/adminUser/users`, {
        credentials: 'include',
        headers,
      });
      const data = await parseJsonSafe(r);
      if (!r.ok) throw new Error(data?.error || `HTTP ${r.status}`);

      const raw: any[] = (data?.users ?? data) ?? [];

      // 1) normalizamos profile del listado
      let normalized: User[] = raw.map((u) => ({ ...u, profile: pickProfile(u) }));

      // 2) pedir detalle si FALTA profile o FALTAN roles
      const needDetailIds = normalized
        .filter(u => !u.profile || !Array.isArray(u.roles))
        .map(u => u.id);

      if (needDetailIds.length) {
        const detailPairs = await Promise.all(
          needDetailIds.map(async (id) => {
            try {
              const rr = await fetch(`${API_BASE}/adminUser/users/${id}`, {
                credentials: 'include',
                headers,
              });
              const dd = await parseJsonSafe(rr);
              const prof = pickProfile(dd);
              let roles;
              if (Array.isArray(dd?.roles)) {
                roles = dd.roles;
              } else if (Array.isArray(dd?.user?.roles)) {
                roles = dd.user.roles;
              } else {
                roles = undefined;
              }
              return [id, { profile: prof, roles }] as const;
            } catch {
              return [id, { profile: null, roles: undefined }] as const;
            }
          })
        );
        const detailMap = Object.fromEntries(detailPairs);

        normalized = normalized.map(u => {
          const extra = detailMap[u.id];
          if (!extra) return u;
          return {
            ...u,
            profile: u.profile ?? extra.profile ?? null,
            roles: Array.isArray(u.roles) ? u.roles : extra.roles,
          };
        });
      }

      setUsers(normalized);
    } catch (e: any) {
      setErr(e?.message || 'No se pudieron obtener los usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

 // ===== REEMPLAZA ESTA FUNCIÓN COMPLETA =====
const createUser = useCallback(async (p: CreateUserPayload) => {
  if (!isValidRutCl(p.user.rut)) throw new Error('RUT nacional inválido');

  // Valida RUT profesional solo si hay profile y el cargo lo requiere
  if (p.profile && p.profile.cargo !== 'FUNCIONARIO') {
    if (!isValidRutCl(p.profile.rut_profesional || '')) {
      throw new Error('RUT profesional inválido');
    }
  }

  setLoading(true); setErr(null);
  try {
    const headers: Record<string,string> = { 'Content-Type': 'application/json' };
    const t = getAuthToken();
    if (t) headers['Authorization'] = `Bearer ${t}`;

    const r = await fetch(`${API_BASE}/adminUser/users`, {
      method: 'POST',
      credentials: 'include',
      headers,
      body: JSON.stringify(p),
    });
    const data = await parseJsonSafe(r);
    if (!r.ok) throw new Error(data?.error || `HTTP ${r.status}`);
    await fetchUsers();
    return data;
  } catch (e: any) {
    setErr(e?.message || 'No se pudo crear el usuario (revisa duplicados de correo/RUT).');
    throw e;
  } finally {
    setLoading(false);
  }
}, [fetchUsers]);

  const addRole = useCallback(async (userId: number, role: string) => {
    setLoading(true); setErr(null);
    try {
      const headers: Record<string,string> = { 'Content-Type': 'application/json' };
      const t = getAuthToken();
      if (t) headers['Authorization'] = `Bearer ${t}`;

      const r = await fetch(`${API_BASE}/adminUser/users/${userId}/roles`, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify({ role }),
      });
      const data = await parseJsonSafe(r);
      if (!r.ok) throw new Error(data?.error || `HTTP ${r.status}`);

      await fetchUsers();
      return data;
    } catch (e: any) {
      setErr(e?.message || 'No se pudo asignar el rol.');
      throw e;
    } finally { setLoading(false); }
  }, [fetchUsers]);

  const removeRole = useCallback(async (userId: number, role: string) => {
    setLoading(true); setErr(null);
    try {
      const headers: Record<string,string> = {};
      const t = getAuthToken();
      if (t) headers['Authorization'] = `Bearer ${t}`;

      const r = await fetch(`${API_BASE}/adminUser/users/${userId}/roles/${encodeURIComponent(role)}`, {
        method: 'DELETE',
        credentials: 'include',
        headers,
      });
      if (!r.ok) {
        const data = await parseJsonSafe(r);
        throw new Error(data?.error || `HTTP ${r.status}`);
      }

      await fetchUsers();
    } catch (e: any) {
      setErr(e?.message || 'No se pudo quitar el rol.');
      throw e;
    } finally { setLoading(false); }
  }, [fetchUsers]);

  const updateProfile = useCallback(async (userId: number, partial: Partial<User['profile']>) => {
    setLoading(true); setErr(null);
    try {
      const headers: Record<string,string> = { 'Content-Type': 'application/json' };
      const t = getAuthToken();
      if (t) headers['Authorization'] = `Bearer ${t}`;

      const r = await fetch(`${API_BASE}/adminUser/users/${userId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers,
        body: JSON.stringify({ profile: partial }),
      });
      const data = await parseJsonSafe(r);
      if (!r.ok) throw new Error(data?.error || `HTTP ${r.status}`);

      await fetchUsers();
      return data;
    } catch (e: any) {
      setErr(e?.message || 'No se pudo actualizar el perfil.');
      throw e;
    } finally { setLoading(false); }
  }, [fetchUsers]);

  const value = useMemo<Ctx>(() => ({
    users, loading, error,
    fetchUsers, createUser, addRole, removeRole, updateProfile
  }), [users, loading, error, fetchUsers, createUser, addRole, removeRole, updateProfile]);

  return <AdminUsersCtx.Provider value={value}>{children}</AdminUsersCtx.Provider>;
}

export function useAdminUsers() {
  const ctx = useContext(AdminUsersCtx);
  if (!ctx) throw new Error('useAdminUsers debe usarse dentro de AdminUsersProvider');
  return ctx;
}
