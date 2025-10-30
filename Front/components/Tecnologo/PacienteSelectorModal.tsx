"use client";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import PacienteSearch from "@/components/Funcionario/PacienteSearch";
import PacienteTable from "@/components/Funcionario/PacienteTable";

export type TecnologoModalItem = {
  user_id: number;
  rut: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
};

type Props = {
  results: TecnologoModalItem[];
  searching: boolean;
  onSearch: (q: string) => void;   // llamado con debounce
  onClear: () => void;
  onSelectUserId: (user_id: number) => void;

  open?: boolean;                  // default: true
  onCancel?: () => void;           // cerrar modal
};

export default function PacienteSelectorModalView({
  results,
  searching,
  onSearch,
  onClear,
  onSelectUserId,
  open = true,
  onCancel,
}: Props) {
  const [q, setQ] = useState("");
  const pathname = usePathname();

  // Debounce búsqueda
  useEffect(() => {
    const t = setTimeout(() => {
      if (q.trim()) onSearch(q.trim());
      else onClear();
    }, 300);
    return () => clearTimeout(t);
  }, [q, onSearch, onClear]);

  // Esc para cerrar
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  // ⛔ Cierra si cambia la ruta
  useEffect(() => {
    if (!open) return;
    onCancel?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // ⛔ Cierra al recibir evento global (antes de logout)
  useEffect(() => {
    const close = () => onCancel?.();
    window.addEventListener("tecnologo:close-modals", close);
    return () => window.removeEventListener("tecnologo:close-modals", close);
  }, [onCancel]);

  // ⛔ Cierra si cambian storage (token removido, etc.)
  useEffect(() => {
    const onStorage = () => onCancel?.();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [onCancel]);

  const handleOpenByRut = (rut: string) => {
    const item = results.find((x) => x.rut === rut);
    if (item) onSelectUserId(item.user_id);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay clickeable — semitransparente para no parecer “pantalla en blanco” */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        onClick={onCancel}
      />

      {/* Panel */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-5xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <h2 className="text-lg md:text-xl font-semibold">
            Selecciona un paciente para continuar
          </h2>
          {onCancel && (
            <button
              onClick={onCancel}
              className="rounded-md px-3 py-1 text-sm bg-white/10 hover:bg-white/20"
              title="Cancelar"
            >
              Cancelar
            </button>
          )}
        </div>

        {/* Contenido */}
        <div className="p-4 md:p-6 overflow-y-auto max-h-[calc(90vh-72px)]">
          <div className="grid grid-cols-1 xl:grid-cols-[360px,1fr] gap-6">
            <PacienteSearch value={q} onChange={setQ} onOpen={handleOpenByRut} />

            <PacienteTable
              pacientes={results as any}
              q={q}
              onQChange={setQ}
              onVerPerfil={(rut) => {
                const p = results.find((x) => x.rut === rut);
                if (p) onSelectUserId(p.user_id);
              }}
            />
          </div>

          {searching && results.length === 0 && (
            <p className="mt-4 text-sm text-slate-500">Buscando…</p>
          )}
          {!searching && results.length === 0 && q.trim().length === 0 && (
            <p className="mt-4 text-sm text-slate-500">
              Escribe un RUT o nombre para buscar…
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
