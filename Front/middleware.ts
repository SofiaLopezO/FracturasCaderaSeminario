// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001/api/v1';

const roleMap: Record<string, string[]> = {
  '/admin': ['ADMIN'],
  '/funcionario': ['FUNCIONARIO', 'TECNOLOGO', 'MEDICO'],
  '/investigador': ['INVESTIGADOR'],
  '/tech': ['TECNOLOGO'],
  '/paciente': ['PACIENTE'],
};

function baseOf(pathname: string) {
  const base = '/' + pathname.split('/').filter(Boolean)[0];
  return roleMap[base] ? base : null;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const base = baseOf(pathname);
  if (!base) return NextResponse.next(); // pública

  const token = req.cookies.get('auth')?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  try {
    // Consultamos al backend, reenviando la cookie 'auth'
    const meRes = await fetch(`${API_BASE}/auth/me`, {
      headers: { cookie: `auth=${token}` },
      // OJO: fetch del middleware no comparte el jar del navegador,
      // por eso reenviamos la cookie manualmente.
    });

    if (!meRes.ok) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }

    const data = await meRes.json();
    const roles: string[] = Array.isArray(data?.me?.roles) ? data.me.roles : [];
    const upper = roles.map(r => String(r).toUpperCase());

    // ¿tiene permiso para esta base?
    const allowed = roleMap[base].some(r => upper.includes(r));
    if (!allowed) {
      // encontrar su home por el primer match de rol
      const home =
        Object.entries(roleMap).find(([, rs]) => rs.some(r => upper.includes(r)))?.[0] || '/login';
      const url = req.nextUrl.clone();
      url.pathname = home;
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  } catch {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/funcionario/:path*',
    '/investigador/:path*',
    '/tech/:path*',
    '/paciente/:path*',
  ],
};
