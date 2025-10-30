'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useConfirmBackToLogin(onConfirm?: () => void) {
  const router = useRouter();

  useEffect(() => {
    try {
      history.pushState({ _block: true }, '', location.href);
    } catch (_) {
    }

    const onPopState = () => {
      const ok = window.confirm('¿Seguro que quieres salir y volver al login?');
      if (ok) {
        window.removeEventListener('popstate', onPopState);

        try { onConfirm?.(); } catch {}

        try { router.replace('/login'); } catch {}

        setTimeout(() => {
          if (location.pathname !== '/login') {
            window.location.assign('/login');
          }
        }, 0);
      } else {

        try {
          history.pushState({ _block: true }, '', location.href);
        } catch {}
      }
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [router, onConfirm]);
}
