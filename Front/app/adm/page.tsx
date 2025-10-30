'use client';

import { useEffect } from 'react';
import RoleGuard from '@/components/RoleGuard';
import { AdminUsersProvider, useAdminUsers } from '@/contexts/AdminUsersContext';
import { UsersTable } from '@/components/Admin/UsersTable';
import { CreateUserCard } from '@/components/Admin/CreateUserCard';
import { useConfirmBackToLogin } from '@/hooks/useConfirmBackToLogin';
import { useAuth } from '@/contexts/AuthContext';

function AdminUsersScreen() {
  const { fetchUsers, loading, error } = useAdminUsers();
  const { logout } = useAuth();

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useConfirmBackToLogin(() => { logout(); });

  return (
    <div className="force-light min-h-[100vh] bg-gradient-to-br from-blue-50 to-blue-100">
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Encabezado estilo Configuración/Pacientes (sin línea) */}
        <section>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Panel de Administración
              </h1>
              <p className="text-sm text-gray-500">
                Gestión de usuarios y perfiles profesionales.
              </p>
            </div>
          </div>
        </section>

        {/* Contenido */}
        <CreateUserCard />
        <UsersTable />
        {loading && <div className="text-center text-blue-700">Cargando…</div>}
        {error && <div className="text-center text-red-600">{error}</div>}
      </main>
    </div>
  );
}

export default function AdminPage() {
  return (
    <RoleGuard allow={['admin']}>
      <AdminUsersProvider>
        <AdminUsersScreen />
      </AdminUsersProvider>
    </RoleGuard>
  );
}
