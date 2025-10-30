'use client';

import { ReactNode, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/contexts/AuthContext';

type Props = { allow: UserRole[]; children: ReactNode };

const norm = (s?: string) => String(s ?? '').trim().toLowerCase();

export default function RoleGuard({ allow, children }: Props) {
  const { user, loading, portalFor } = useAuth();
  const router = useRouter();

  const allowSet = useMemo(() => new Set(allow.map(norm)), [allow]);
  const rolesSet = useMemo(
    () => new Set((user?.roles ?? []).map(norm)),
    [user?.roles]
  );

  useEffect(() => {
    if (loading) return;

    if (!user) {                  
      router.replace('/login');
      return;
    }

    const hasAccess = [...rolesSet].some(r => allowSet.has(r));
    if (!hasAccess) {
      const dest = portalFor(user.roles ?? []);

      router.replace(dest && dest !== '/' ? dest : '/login');
    }
  }, [loading, user, rolesSet, allowSet, router, portalFor]);

  if (loading || !user) return null;

  const allowed = [...rolesSet].some(r => allowSet.has(r));
  if (!allowed) return null;

  return <>{children}</>;
}
