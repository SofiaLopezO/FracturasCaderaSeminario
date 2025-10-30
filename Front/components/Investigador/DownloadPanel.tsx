"use client";

import { useInvestigator } from "@/contexts/InvestigatorContext";
import { Download } from "lucide-react";
import { useState } from "react";

export default function DownloadPanel() {
  const { downloadCSV, downloadXLSX, selectedIds, filtered } = useInvestigator();
  const [busy, setBusy] = useState(false);

  async function runWithBusy(fn: () => Promise<void>): Promise<void> {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  }

  const nothing = filtered.length === 0;

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Exportar registros anonimizados</p>
          <p className="text-xs text-slate-500">
            Según tu diagrama: “Descargar datos anonimizados” y “Navegar entre registros
            anonimizados (filtros/búsqueda/exploración)”.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => runWithBusy(() => downloadCSV(false))}
            disabled={busy || nothing}
            className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
            title="CSV"
          >
            <Download className={["h-4 w-4", busy ? "animate-pulse" : ""].join(" ")} />
            Descargar todo (CSV)
          </button>
          <button
            onClick={() => runWithBusy(() => downloadXLSX(false))}
            disabled={busy || nothing}
            className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
            title="Excel"
          >
            <Download className={["h-4 w-4", busy ? "animate-pulse" : ""].join(" ")} />
            Descargar todo (Excel)
          </button>

          <div className="mx-2 h-6 w-px bg-slate-200" />

          <button
            onClick={() => runWithBusy(() => downloadCSV(true))}
            disabled={busy || selectedIds.size === 0}
            className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
            title="CSV selección"
          >
            <Download className={["h-4 w-4", busy ? "animate-pulse" : ""].join(" ")} />
            Solo selección (CSV)
          </button>
          <button
            onClick={() => runWithBusy(() => downloadXLSX(true))}
            disabled={busy || selectedIds.size === 0}
            className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
            title="Excel selección"
          >
            <Download className={["h-4 w-4", busy ? "animate-pulse" : ""].join(" ")} />
            Solo selección (Excel)
          </button>
        </div>
      </div>
    </div>
  );
}
