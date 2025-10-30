"use client";

import React, { useState, useMemo } from "react";
import { useInvestigator } from "@/contexts/InvestigatorContext";
import {
  Search,
  Filter,
  Download,
  FileText,
  Database,
  Table,
  Eye,
  EyeOff,
  Activity,
} from "lucide-react";
import ChartsPanel from "@/components/Investigador/ChartsPanel";

/* ==============================
   UI helpers
============================== */
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>{children}</div>;
}
function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="p-6 pb-4">{children}</div>;
}
function CardContent({ children }: { children: React.ReactNode }) {
  return <div className="px-6 pb-6">{children}</div>;
}
function CardTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold text-gray-900">{children}</h3>;
}
function CardDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-600 mt-1">{children}</p>;
}
function CardHeaderWithIcon({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <CardHeader>
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-slate-100 p-2 text-slate-700">{icon}</div>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{subtitle}</CardDescription>
        </div>
      </div>
    </CardHeader>
  );
}

function Button({
  children,
  onClick,
  variant = "default",
  className = "",
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "secondary" | "ghost" | "outline";
  className?: string;
  disabled?: boolean;
}) {
  const base =
    "inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const styles = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    ghost: "text-gray-600 hover:bg-gray-100",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50",
  } as const;
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </button>
  );
}

/* ==============================
   Página Investigador
============================== */
export default function InvestigadorHome() {
  const {
    loading,
    filtered,
    filtros,
    setFiltros,
    clearFiltros,
    seleccion,
    toggleSel,
    clearSel,
    downloadCSV,
    downloadJSON,
    downloadExcel,
  } = useInvestigator();

  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (id: number) => {
    setExpandedRows((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const anios = useMemo(() => {
    const s = new Set<number>();
    filtered.forEach((m) => s.add(new Date(m.fecha_extraccion).getFullYear()));
    return Array.from(s).sort((a, b) => a - b);
  }, [filtered]);

  const tiposMuestra = useMemo(() => {
    const s = new Set<string>();
    filtered.forEach((m) => s.add(m.tipo_muestra));
    return Array.from(s).sort();
  }, [filtered]);

  const parametros = useMemo(() => {
    const s = new Set<string>();
    filtered.forEach((m) => m.Resultados.forEach((r) => s.add(r.parametro)));
    return Array.from(s).sort();
  }, [filtered]);

  const format = (iso?: string) => (iso ? new Date(iso).toLocaleDateString("es-CL") : "—");
  const formatDateTime = (iso?: string) => (iso ? new Date(iso).toLocaleString("es-CL") : "—");

  const totalResultados = useMemo(() => {
    return filtered.reduce((acc, m) => acc + m.Resultados.length, 0);
  }, [filtered]);

  return (
    <div className="p-6 max-w-7xl mx-auto relative">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Análisis de Muestras y Resultados</h1>
        <p className="text-slate-600 mt-2">
          Exploración, filtros y descarga de datos de laboratorio para investigación científica.
        </p>
      </div>

      {/* === AHORA PRIMERO: Panel de gráficos === */}
      <Card className="mb-6">
        <CardHeaderWithIcon
          icon={<Activity className="h-5 w-5" />}
          title="Análisis visual"
          subtitle="Gráficos que se actualizan con los filtros aplicados"
        />
        <CardContent>
          <ChartsPanel />
        </CardContent>
      </Card>

      {/* Resumen con iconos */}
      <div className="mb-3 flex flex-wrap items-center gap-6 text-sm text-slate-600">
        <span className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          {filtered.length} muestras
        </span>
        <span className="flex items-center gap-2">
          <Table className="h-4 w-4" />
          {totalResultados} resultados
        </span>
        <span className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          {seleccion.size} seleccionadas
        </span>
      </div>


      {/* === LUEGO: Filtros y búsqueda === */}
      <Card className="mb-6">
        <CardHeaderWithIcon
          icon={<Filter className="h-5 w-5" />}
          title="Filtros y Búsqueda"
          subtitle="Refina tu consulta antes de exportar"
        />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por ID, tipo muestra, parámetro, observaciones..."
                value={filtros.busqueda}
                onChange={(e) => setFiltros({ busqueda: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <select
              value={filtros.tipoMuestra}
              onChange={(e) => setFiltros({ tipoMuestra: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tipo de muestra</option>
              {tiposMuestra.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <select
              value={filtros.parametro}
              onChange={(e) => setFiltros({ parametro: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Parámetro</option>
              {parametros.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            <select
              value={filtros.anio}
              onChange={(e) => setFiltros({ anio: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Año</option>
              {anios.map((a) => (
                <option key={a} value={String(a)}>
                  {a}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Valor mínimo"
              value={filtros.valorMin ?? ""}
              onChange={(e) => setFiltros({ valorMin: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="number"
              placeholder="Valor máximo"
              value={filtros.valorMax ?? ""}
              onChange={(e) => setFiltros({ valorMax: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />

            <input
              type="number"
              placeholder="ID Profesional"
              value={filtros.profesionalId ?? ""}
              onChange={(e) => setFiltros({ profesionalId: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />

            <input
              type="number"
              placeholder="ID Examen"
              value={filtros.examenId ?? ""}
              onChange={(e) => setFiltros({ examenId: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-4">
            <Button variant="secondary" onClick={() => clearFiltros()}>
              Limpiar filtros
            </Button>
            <Button variant="ghost" onClick={() => clearSel()}>
              Limpiar selección
            </Button>
            <div className="ml-auto flex gap-2">
              <Button variant="outline" onClick={() => downloadCSV()} disabled={filtered.length === 0}>
                <Download className="h-4 w-4" />
                CSV Completo
              </Button>
              <Button variant="outline" onClick={() => downloadJSON()} disabled={filtered.length === 0}>
                <Download className="h-4 w-4" />
                JSON Completo
              </Button>
              <Button variant="default" onClick={() => downloadCSV(true)} disabled={seleccion.size === 0}>
                <Download className="h-4 w-4" />
                CSV Selección ({seleccion.size})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Muestras y Resultados */}
      <Card>
        <CardHeaderWithIcon
          icon={<Table className="h-5 w-5" />}
          title="Datos de Muestras y Resultados"
          subtitle={`${filtered.length} muestras con ${totalResultados} resultados`}
        />
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Cargando datos...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Database className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No se encontraron muestras con los filtros aplicados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left p-3 font-medium text-gray-900">Sel.</th>
                    <th className="text-left p-3 font-medium text-gray-900">ID Muestra</th>
                    <th className="text-left p-3 font-medium text-gray-900">Tipo</th>
                    <th className="text-left p-3 font-medium text-gray-900">Fecha Extracción</th>
                    <th className="text-left p-3 font-medium text-gray-900">Fecha Recepción</th>
                    <th className="text-left p-3 font-medium text-gray-900">Profesional</th>
                    <th className="text-left p-3 font-medium text-gray-900">Examen</th>
                    <th className="text-left p-3 font-medium text-gray-900">Resultados</th>
                    <th className="text-left p-3 font-medium text-gray-900">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((muestra) => (
                    <React.Fragment key={muestra.muestra_id}>
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={seleccion.has(muestra.muestra_id)}
                            onChange={() => toggleSel(muestra.muestra_id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="p-3 font-mono text-blue-600">{muestra.muestra_id}</td>
                        <td className="p-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {muestra.tipo_muestra}
                          </span>
                        </td>
                        <td className="p-3 text-gray-600">{format(muestra.fecha_extraccion)}</td>
                        <td className="p-3 text-gray-600">{format(muestra.fecha_recepcion)}</td>
                        <td className="p-3 font-mono text-gray-600">{muestra.profesional_id}</td>
                        <td className="p-3 font-mono text-gray-600">{muestra.examen_id}</td>
                        <td className="p-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {muestra.Resultados.length} resultados
                          </span>
                        </td>
                        <td className="p-3">
                          <Button variant="ghost" onClick={() => toggleRow(muestra.muestra_id)} className="p-1 h-8 w-8">
                            {expandedRows.has(muestra.muestra_id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </td>
                      </tr>
                      {expandedRows.has(muestra.muestra_id) && (
                        <tr>
                          <td colSpan={9} className="p-0">
                            <div className="bg-gray-50 border-l-4 border-blue-500">
                              <div className="p-4">
                                <div className="mb-3">
                                  <h4 className="font-medium text-gray-900 mb-2">Información de la Muestra</h4>
                                  <p className="text-sm text-gray-600">
                                    <strong>Observaciones:</strong> {muestra.observaciones}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-2">
                                    Resultados ({muestra.Resultados.length})
                                  </h4>
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                      <thead>
                                        <tr className="bg-white border border-gray-200">
                                          <th className="text-left p-2 font-medium text-gray-700">ID Resultado</th>
                                          <th className="text-left p-2 font-medium text-gray-700">Episodio</th>
                                          <th className="text-left p-2 font-medium text-gray-700">Parámetro</th>
                                          <th className="text-left p-2 font-medium text-gray-700">Valor</th>
                                          <th className="text-left p-2 font-medium text-gray-700">Unidad</th>
                                          <th className="text-left p-2 font-medium text-gray-700">Fecha Resultado</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {muestra.Resultados.map((resultado) => (
                                          <tr key={resultado.resultado_id} className="border-b border-gray-200 bg-white">
                                            <td className="p-2 font-mono text-blue-600">{resultado.resultado_id}</td>
                                            <td className="p-2 font-mono text-gray-600">{resultado.episodio_id}</td>
                                            <td className="p-2">
                                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                                {resultado.parametro}
                                              </span>
                                            </td>
                                            <td className="p-2 font-mono font-semibold text-gray-900">{resultado.valor}</td>
                                            <td className="p-2 text-gray-600">{resultado.unidad}</td>
                                            <td className="p-2 text-gray-600">{formatDateTime(resultado.fecha_resultado)}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
