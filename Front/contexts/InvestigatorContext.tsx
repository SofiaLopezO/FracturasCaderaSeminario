"use client"

import type React from "react"
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import muestras from "../data/examples.json"
export type Resultado = {
  resultado_id: number
  episodio_id: number
  muestra_id: number
  examen_id: number
  parametro: string
  valor: number
  unidad: string
  fecha_resultado: string
}

export type Muestra = {
  muestra_id: number
  tipo_muestra: string
  fecha_extraccion: string
  fecha_recepcion: string
  observaciones: string
  examen_id: number
  profesional_id: number
  Resultados: Resultado[]
}

type InvestigatorContextType = {
  loading: boolean
  error?: string | null
  items: Muestra[]
  filtered: Muestra[]
  refresh: () => Promise<void>

  // filtros
  filtros: {
    busqueda: string
    tipoMuestra: string
    parametro: string
    anio: string
    valorMin?: number
    valorMax?: number
    profesionalId?: number
    examenId?: number
  }
  setFiltros: (p: Partial<InvestigatorContextType["filtros"]>) => void
  clearFiltros: () => void

  // selección
  seleccion: Set<number>
  toggleSel: (id: number) => void
  clearSel: () => void

  // export
  downloadCSV: (soloSeleccion?: boolean) => void
  downloadJSON: (soloSeleccion?: boolean) => void
  downloadExcel: (soloSeleccion?: boolean) => void
}

const InvestigatorContext = createContext<InvestigatorContextType>({
  loading: true,
  error: null,
  items: [],
  filtered: [],
  refresh: async () => {},
  filtros: {
    busqueda: "",
    tipoMuestra: "",
    parametro: "",
    anio: "",
  },
  setFiltros: () => {},
  clearFiltros: () => {},
  seleccion: new Set(),
  toggleSel: () => {},
  clearSel: () => {},
  downloadCSV: () => {},
  downloadJSON: () => {},
  downloadExcel: () => {},
})

export const useInvestigator = () => useContext(InvestigatorContext)

// Helpers
function toCSV(rows: Record<string, any>[]) {
  if (!rows.length) return ""
  const cols = Object.keys(rows[0])
  const esc = (v: any) => (typeof v === "string" ? `"${v.replaceAll('"', '""')}"` : v == null ? "" : String(v))
  const head = cols.join(";")
  const body = rows.map((r) => cols.map((c) => esc(r[c])).join(";")).join("\n")
  return "\uFEFF" + head + "\n" + body
}

function downloadFile(name: string, content: BlobPart, mime = "text/csv;charset=utf-8") {
  const a = document.createElement("a")
  a.href = URL.createObjectURL(new Blob([content], { type: mime }))
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
}

export const InvestigatorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Muestra[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [filtros, setFiltrosState] = useState({
    busqueda: "",
    tipoMuestra: "",
    parametro: "",
    anio: "",
    valorMin: undefined as number | undefined,
    valorMax: undefined as number | undefined,
    profesionalId: undefined as number | undefined,
    examenId: undefined as number | undefined,
  })

  const [seleccion, setSeleccion] = useState<Set<number>>(new Set())

  const fetchItems = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      console.log("[v0] Loading data from /data/examples.json")
      const response = await fetch("/data/examples.json")
      if (!response.ok) {
        const response = muestras
        return setItems(response.muestras || [])
      }
      const data = await response.json()
      console.log("[v0] Loaded data:", data)
      setItems(data.muestras || [])
    } catch (e) {
      console.error("[v0] Error loading data:", e)
      setError("Error al cargar los datos")
      // Fallback to empty array instead of mock data
      setItems([])
    } finally {
      setLoading(false)
    }
  }, []) // Removed dependencies since we're not using filters in the fetch

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const setFiltros = useCallback(
    (p: Partial<typeof filtros>) => {
      setFiltrosState((prev) => ({ ...prev, ...p }))
    },
    [setFiltrosState],
  )

  const clearFiltros = useCallback(() => {
    setFiltrosState({
      busqueda: "",
      tipoMuestra: "",
      parametro: "",
      anio: "",
      valorMin: undefined,
      valorMax: undefined,
      profesionalId: undefined,
      examenId: undefined,
    })
    setSeleccion(new Set())
  }, [])

  const filtered = useMemo(() => {
    const q = filtros.busqueda.toLowerCase().trim()
    return items.filter((m) => {
      if (filtros.tipoMuestra && m.tipo_muestra !== filtros.tipoMuestra) return false
      if (filtros.anio && new Date(m.fecha_extraccion).getFullYear() !== Number(filtros.anio)) return false
      if (filtros.profesionalId != null && m.profesional_id !== filtros.profesionalId) return false
      if (filtros.examenId != null && m.examen_id !== filtros.examenId) return false

      // Filtrar por parámetro específico en los resultados
      if (filtros.parametro) {
        const tieneParametro = m.Resultados.some((r) =>
          r.parametro.toLowerCase().includes(filtros.parametro.toLowerCase()),
        )
        if (!tieneParametro) return false
      }

      // Filtrar por rango de valores
      if (filtros.valorMin != null || filtros.valorMax != null) {
        const tieneValorEnRango = m.Resultados.some((r) => {
          if (filtros.valorMin != null && r.valor < filtros.valorMin) return false
          if (filtros.valorMax != null && r.valor > filtros.valorMax) return false
          return true
        })
        if (!tieneValorEnRango) return false
      }

      if (q) {
        const hay =
          m.tipo_muestra.toLowerCase().includes(q) ||
          m.observaciones.toLowerCase().includes(q) ||
          String(m.muestra_id).includes(q) ||
          String(m.examen_id).includes(q) ||
          String(m.profesional_id).includes(q) ||
          m.Resultados.some((r) => r.parametro.toLowerCase().includes(q) || r.unidad.toLowerCase().includes(q))
        if (!hay) return false
      }
      return true
    })
  }, [items, filtros])

  const toggleSel = useCallback((id: number) => {
    setSeleccion((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }, [])
  const clearSel = useCallback(() => setSeleccion(new Set()), [])

  const rowsForExport = useCallback(
    (soloSel?: boolean) => {
      const base = soloSel ? filtered.filter((m) => seleccion.has(m.muestra_id)) : filtered
      const rows = base.flatMap((m) =>
        m.Resultados.length > 0
          ? m.Resultados.map((r) => ({
              muestra_id: m.muestra_id,
              tipo_muestra: m.tipo_muestra,
              fecha_extraccion: m.fecha_extraccion.slice(0, 10),
              fecha_recepcion: m.fecha_recepcion.slice(0, 10),
              observaciones: m.observaciones,
              examen_id: m.examen_id,
              profesional_id: m.profesional_id,
              resultado_id: r.resultado_id,
              episodio_id: r.episodio_id,
              parametro: r.parametro,
              valor: r.valor,
              unidad: r.unidad,
              fecha_resultado: r.fecha_resultado.slice(0, 10),
            }))
          : [
              {
                muestra_id: m.muestra_id,
                tipo_muestra: m.tipo_muestra,
                fecha_extraccion: m.fecha_extraccion.slice(0, 10),
                fecha_recepcion: m.fecha_recepcion.slice(0, 10),
                observaciones: m.observaciones,
                examen_id: m.examen_id,
                profesional_id: m.profesional_id,
                resultado_id: 0,
                episodio_id: 0,
                parametro: "",
                valor: 0,
                unidad: "",
                fecha_resultado: "",
              },
            ],
      )
      return rows
    },
    [filtered, seleccion],
  )

  const downloadCSV = useCallback(
    (soloSel?: boolean) => {
      const rows = rowsForExport(soloSel)
      const csv = toCSV(rows)
      downloadFile(`muestras_resultados${soloSel ? "_seleccion" : ""}.csv`, csv, "text/csv;charset=utf-8")
    },
    [rowsForExport],
  )

  const downloadJSON = useCallback(
    (soloSel?: boolean) => {
      const base = soloSel ? filtered.filter((m) => seleccion.has(m.muestra_id)) : filtered
      const json = JSON.stringify({ muestras: base }, null, 2)
      downloadFile(`muestras_resultados${soloSel ? "_seleccion" : ""}.json`, json, "application/json")
    },
    [filtered, seleccion],
  )

  const downloadExcel = useCallback(
    (soloSel?: boolean) => {
      const rows = rowsForExport(soloSel)
      const csv = toCSV(rows)
      downloadFile(
        `muestras_resultados${soloSel ? "_seleccion" : ""}.xlsx`,
        csv,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      )
    },
    [rowsForExport],
  )

  const value: InvestigatorContextType = {
    loading,
    error,
    items,
    filtered,
    refresh: fetchItems,
    filtros,
    setFiltros,
    clearFiltros,
    seleccion,
    toggleSel,
    clearSel,
    downloadCSV,
    downloadJSON,
    downloadExcel,
  }

  return <InvestigatorContext.Provider value={value}>{children}</InvestigatorContext.Provider>
}
