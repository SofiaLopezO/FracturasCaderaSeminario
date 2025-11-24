"use client";

import { Fragment, useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useInvestigator } from "@/contexts/InvestigatorContext";

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "—" : d.toISOString().slice(0, 10);
}

export default function RecordsTable() {
  const {
    filtered,       
    loading,
    error,
    selectedIds,
    toggleSelect,
    selectAllFiltered,
    clearSelection,
  } = useInvestigator();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  if (page > totalPages && totalPages !== 0) {
    setPage(1);
  }

  if (error) {
    return <div className="rounded-2xl border bg-white p-4 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="rounded-2xl border bg-white shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
        <div className="flex items-center gap-2 text-sm">
          <button onClick={selectAllFiltered} className="rounded-lg border px-2 py-1 hover:bg-slate-50">
            Seleccionar página/total
          </button>
          <button onClick={clearSelection} className="rounded-lg border px-2 py-1 hover:bg-slate-50">
            Limpiar selección
          </button>
          <span className="text-slate-500">Seleccionados: {selectedIds.size}</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500">Filas por página</label>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="rounded-lg border px-2 py-1 text-sm"
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-100 text-slate-700">
              <th className="px-3 py-2" />
              <th className="px-3 py-2">Sel.</th>
              <th className="px-3 py-2 text-left">ID Muestra</th>
              <th className="px-3 py-2 text-left">Tipo de Muestra</th>
              <th className="px-3 py-2 text-left">Fecha extracción</th>
              <th className="px-3 py-2 text-left">Fecha recepción</th>
              <th className="px-3 py-2 text-left">Profesional</th>
              <th className="px-3 py-2 text-left">Examen</th>
              <th className="px-3 py-2 text-left">Resultados</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="px-3 py-6 text-center text-slate-500">
                  Cargando…
                </td>
              </tr>
            ) : pageData.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-3 py-6 text-center text-slate-500">
                  Sin resultados para los filtros actuales.
                </td>
              </tr>
            ) : (
              pageData.map((m) => {
                const isOpen = expanded.has(m.muestra_id);
                return (
                  <Fragment key={m.muestra_id}>
                    <tr className="border-t">
                      <td className="px-2 py-2">
                        <button
                          onClick={() =>
                            setExpanded((prev) => {
                              const next = new Set(prev);
                              if (next.has(m.muestra_id)) next.delete(m.muestra_id);
                              else next.add(m.muestra_id);
                              return next;
                            })
                          }
                          className="rounded-lg border p-1 hover:bg-slate-50"
                          aria-label={isOpen ? "Contraer" : "Expandir"}
                        >
                          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(m.muestra_id)}
                          onChange={() => toggleSelect(m.muestra_id)}
                        />
                      </td>
                      <td className="px-3 py-2 font-mono text-blue-600">{m.muestra_id}</td>
                      <td className="px-3 py-2">{m.tipo_muestra}</td>
                      <td className="px-3 py-2">{fmtDate(m.fecha_extraccion)}</td>
                      <td className="px-3 py-2">{fmtDate(m.fecha_recepcion)}</td>
                      <td className="px-3 py-2">{m.profesional_id}</td>
                      <td className="px-3 py-2">{m.examen_id}</td>
                      <td className="px-3 py-2">{m.Resultados?.length ?? 0}</td>
                    </tr>

                    {isOpen && (
                      <tr className="bg-slate-50">
                        <td />
                        <td colSpan={8} className="px-3 pb-4">
                          <div className="rounded-xl border bg-white">
                            <div className="border-b px-3 py-2 text-xs font-semibold text-slate-600">
                              Resultados de la muestra
                            </div>
                            <div className="overflow-x-auto">
                              <table className="min-w-full text-sm">
                                <thead>
                                  <tr className="bg-slate-100 text-slate-700">
                                    <th className="px-3 py-2 text-left">ID Resultado</th>
                                    <th className="px-3 py-2 text-left">Parámetro</th>
                                    <th className="px-3 py-2 text-left">Valor</th>
                                    <th className="px-3 py-2 text-left">Unidad</th>
                                    <th className="px-3 py-2 text-left">Fecha</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(m.Resultados ?? []).map((r) => (
                                    <tr key={r.resultado_id} className="border-t">
                                      <td className="px-3 py-2 font-mono text-blue-600">{r.resultado_id}</td>
                                      <td className="px-3 py-2">{r.parametro}</td>
                                      <td className="px-3 py-2 font-mono">{r.valor}</td>
                                      <td className="px-3 py-2">{r.unidad}</td>
                                      <td className="px-3 py-2">{fmtDate(r.fecha_resultado)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-2 border-t px-3 py-2">
        <p className="text-xs text-slate-500">
          Página {page} de {totalPages} — {filtered.length.toLocaleString()} registros
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => page > 1 && setPage(page - 1)}
            className="rounded-lg border px-2 py-1 text-sm hover:bg-slate-50 disabled:opacity-50"
            disabled={page === 1}
          >
            Anterior
          </button>
          <button
            onClick={() => page < totalPages && setPage(page + 1)}
            className="rounded-lg border px-2 py-1 text-sm hover:bg-slate-50 disabled:opacity-50"
            disabled={page === totalPages}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
