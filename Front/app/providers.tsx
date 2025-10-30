'use client';
import { AuthProvider } from '@/contexts/AuthContext';
export default function Providers({ children }: { readonly children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
