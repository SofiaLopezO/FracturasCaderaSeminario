"use client";

import { useMemo } from "react";
import { useInvestigator } from "@/contexts/InvestigatorContext";

export default function FiltersBarTable() {
  const { data, filters, setFilters, clearFilters } = useInvestigator();

  const options = useMemo(() => {
    const years = new Set<number>();
    const tiposMuestra = new Set<string>();
    const sexos = new Set<string>();
    const fracturas = new Set<string>();

    data.forEach((m: any) => {
      const y = new Date(m.fechaIngreso ?? m.fecha_extraccion ?? m.fecha_recepcion ?? "").getFullYear();
      if (!Number.isNaN(y)) years.add(y);
      if (m.tipoMuestra || m.tipo_muestra) tiposMuestra.add(m.tipoMuestra ?? m.tipo_muestra);
      if (m.sexo) sexos.add(m.sexo);
      if (m.tipo_fractura) fracturas.add(m.tipo_fractura);
    });

    return {
      years: Array.from(years).sort((a, b) => b - a),
      tiposMuestra: Array.from(tiposMuestra).sort(),
      sexos: Array.from(sexos).sort(),
      fracturas: Array.from(fracturas).sort(),
    };
  }, [data]);

  return (
    <form
      className="grid grid-cols-1 gap-3 rounded-2xl border bg-white p-4 shadow-sm md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6"
      onSubmit={(e) => e.preventDefault()}
    >
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs font-semibold uppercase text-slate-500">Buscar</span>
        <input
          value={filters.q ?? ""}
          onChange={(e) => setFilters({ q: e.target.value })}
          placeholder="ID, parámetro, observación, CIE-10…"
          className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs font-semibold uppercase text-slate-500">Año</span>
        <select
          value={filters.year ?? ""}
          onChange={(e) => setFilters({ year: e.target.value ? Number(e.target.value) : undefined })}
          className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos</option>
          {options.years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs font-semibold uppercase text-slate-500">Tipo muestra</span>
        <select
          value={filters.tipoMuestra ?? ""}
          onChange={(e) => setFilters({ tipoMuestra: e.target.value || undefined })}
          className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas</option>
          {options.tiposMuestra.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs font-semibold uppercase text-slate-500">Sexo</span>
        <select
          value={filters.sexo ?? ""}
          onChange={(e) => setFilters({ sexo: e.target.value || undefined })}
          className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos</option>
          {options.sexos.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs font-semibold uppercase text-slate-500">Tipo de fractura</span>
        <select
          value={(filters as any).fractura ?? ""}
          onChange={(e) => setFilters({ ...(filters as any), fractura: e.target.value || undefined })}
          className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas</option>
          {options.fracturas.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
      </label>

      <div className="flex flex-col gap-1 text-sm">
        <span className="text-xs font-semibold uppercase text-slate-500">Edad (mín / máx)</span>
        <div className="flex gap-2">
          <input
            type="number"
            value={filters.edadMin ?? ""}
            onChange={(e) => setFilters({ edadMin: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            min={0}
          />
          <input
            type="number"
            value={filters.edadMax ?? ""}
            onChange={(e) => setFilters({ edadMax: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            min={0}
          />
        </div>
      </div>

      <div className="flex items-end">
        <button
          type="button"
          onClick={clearFilters}
          className="w-full rounded-lg border px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          Limpiar filtros
        </button>
      </div>
    </form>
  );
}
