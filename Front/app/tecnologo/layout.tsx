"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { TecnologoProvider, useTecnologo } from "@/contexts/TecnologoContext";
import { useAuth } from "@/contexts/AuthContext";
import { useConfirmBackToLogin } from "@/hooks/useConfirmBackToLogin";
import { House, Settings, LogOut, FlaskConical } from "lucide-react";
import React from "react";

type NavItem = {
  href: string;
  icon: React.ComponentType<any>;
  label: string;
  requiresPatient?: boolean;
  group?: "main" | "upload";
};

const navItems: NavItem[] = [
  { href: "/tecnologo", icon: House, label: "Panel del tecnólogo", group: "main" },
  { href: "/tecnologo/laboratorio", icon: FlaskConical, label: "Subir examen", requiresPatient: true, group: "upload" },
];

export default function TecnologoLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <TecnologoProvider>
      <Shell>{children}</Shell>
    </TecnologoProvider>
  );
}

function Shell({ children }: { readonly children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const { paciente } = useTecnologo();

  useConfirmBackToLogin(() => {
    try { sessionStorage.removeItem("tec_selectedPatient"); } catch {}
    logout();
  });

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/") || (href === "/tecnologo" && pathname === "/tecnologo");

  const onLogout = async () => {
    try { window.dispatchEvent(new Event("tecnologo:close-modals")); } catch {}
    const ok = window.confirm("¿Deseas cerrar sesión y volver al login?");
    if (!ok) return;

    try { sessionStorage.removeItem("tec_selectedPatient"); } catch {}
    try {
      await logout();
    } finally {
      window.location.href = "/login";
      setTimeout(() => {
        if (!/\/login$/.test(window.location.pathname)) {
          window.location.assign("/login");
        }
      }, 0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      <aside className="fixed left-0 top-0 h-screen w-[72px] border-r border-slate-200 bg-white/70 backdrop-blur z-[60]">
        <div className="flex h-full flex-col items-center py-4 gap-3">
          {/* Bloque principal */}
          <div className="mt-2 flex flex-col gap-2">
            {navItems
              .filter(i => i.group !== "upload")
              .map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  title={label}
                  className={`group inline-flex h-12 w-12 items-center justify-center rounded-2xl transition
                    ${
                      isActive(href)
                        ? "bg-slate-900 text-white shadow-lg ring-1 ring-slate-300"
                        : "bg-white hover:bg-slate-100 border border-slate-200 text-slate-700"
                    }`}
                >
                  <Icon className="h-5 w-5" />
                </Link>
              ))}
          </div>

          {/* Separador visual */}
          <div className="my-2 h-px w-8 bg-slate-200" />

          {/* Grupo de carga (solo laboratorio) */}
          <div className="flex flex-col gap-2">
            {navItems
              .filter(i => i.group === "upload")
              .map(({ href, icon: Icon, label, requiresPatient }) => {
                const disabled = requiresPatient && !paciente;
                const base = `group inline-flex h-12 w-12 items-center justify-center rounded-2xl transition border ${
                  isActive(href)
                    ? "bg-slate-900 text-white shadow-lg ring-1 ring-slate-300 border-slate-900"
                    : "bg-white hover:bg-slate-100 border-slate-200 text-slate-700"
                }`;
                return disabled ? (
                  <button
                    key={href}
                    title={`${label} (selecciona paciente)`}
                    className={`${base} opacity-50 pointer-events-none`}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                ) : (
                  <Link key={href} href={href} title={label} className={base}>
                    <Icon className="h-5 w-5" />
                  </Link>
                );
              })}
          </div>

          {/* Configuración */}
          <button
            onClick={() => router.push("/tecnologo/configuracion")}
            title="Configuración"
            className={`mt-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white hover:bg-slate-100 transition
              ${isActive("/tecnologo/configuracion") ? "ring-2 ring-slate-900" : ""}`}
          >
            <Settings className="h-5 w-5" />
          </button>

          {/* Cerrar sesión */}
          <button
            onClick={onLogout}
            title="Cerrar sesión"
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white hover:bg-red-50 hover:text-red-600 transition"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </aside>

      <main className="ml-[72px] p-4 md:p-6 relative z-[10]">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
