"use client"
import { useState } from "react"
import type React from "react"
import { ChevronDown, Download, Search, Filter, Calendar, User } from "lucide-react"
import { useFuncionario } from "@/contexts/FuncionarioContext"

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>{children}</div>
}

function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="p-6 pb-4">{children}</div>
}

function CardContent({ children }: { children: React.ReactNode }) {
  return <div className="px-6 pb-6">{children}</div>
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold text-gray-900">{children}</h3>
}

function CardDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-600 mt-1">{children}</p>
}

function CardHeaderWithIcon({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
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
  )
}

function Button({
  children,
  onClick,
  variant = "default",
  className = "",
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: "default" | "secondary" | "ghost"
  className?: string
}) {
  const baseClasses =
    "inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"

  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    ghost: "text-gray-600 hover:bg-gray-100",
  }

  return (
    <button onClick={onClick} className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </button>
  )
}

const LaboratorioPage = () => {
  const { seleccionado } = useFuncionario()
  const examenes = seleccionado?.laboratorio.solicitudes || []
  const paciente = seleccionado?.general
  const [abiertas, setAbiertas] = useState<Set<string>>(new Set())
  const [filtros, setFiltros] = useState({
    tipoMuestra: "",
    tipoExamen: "",
    busqueda: "",
  })

  const optsTipoMuestra = [
    "",
    ...new Set(examenes?.flatMap((examen) => examen.muestras?.map((muestra) => muestra.tipo_muestra) || []) || []),
  ]

  const optsTipoExamen = ["", ...new Set(examenes?.map((examen) => examen.tipo_examen) || [])]

  const examenesFiltrados =
    examenes?.filter((examen) => {
      const cumpleTipoExamen = !filtros.tipoExamen || examen.tipo_examen === filtros.tipoExamen

      const cumpleTipoMuestra =
        !filtros.tipoMuestra || examen.muestras?.some((muestra) => muestra.tipo_muestra === filtros.tipoMuestra)

      const cumpleBusqueda =
        !filtros.busqueda ||
        examen.examen_id.toString().includes(filtros.busqueda) ||
        examen.tipo_examen.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
        examen.muestras?.some((muestra) =>
          muestra.resultados?.some((resultado) =>
            resultado.parametro.toLowerCase().includes(filtros.busqueda.toLowerCase()),
          ),
        )

      return cumpleTipoExamen && cumpleTipoMuestra && cumpleBusqueda
    }) || []

  const toggle = (examenId: string) => {
    const nuevas = new Set(abiertas)
    if (nuevas.has(examenId)) {
      nuevas.delete(examenId)
    } else {
      nuevas.add(examenId)
    }
    setAbiertas(nuevas)
  }

  const descargarExamenCompleto = async (examen: any) => {
    try {
      const user = localStorage.getItem("session_v1")
      const token = user ? JSON.parse(user).token : null

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/examenes/${examen.examen_id}/muestras`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      })

      if (!response.ok) {
        throw new Error("Error fetching exam document")
      }

      const contentType = response.headers.get("content-type")

      if (contentType && contentType.includes("application/pdf")) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `examen_${examen.examen_id}_${examen.tipo_examen}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } else if (contentType && (contentType.includes("text/plain") || contentType.includes("text/txt"))) {
        const textContent = await response.text()
        const blob = new Blob([textContent], { type: "text/plain" })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `examen_${examen.examen_id}_${examen.tipo_examen}.txt`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } else {
        const data = await response.json()
        const jsonString = JSON.stringify(data, null, 2)
        const blob = new Blob([jsonString], { type: "application/json" })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `examen_${examen.examen_id}_datos.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error("[v0] Failed to download exam:", error)
      alert("Error al descargar el examen. Por favor, inténtelo de nuevo.")
    }
  }

  const formatearFecha = (fecha: string) => {
    const formato = new Date(fecha).toLocaleDateString("es-CL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
    return formato
  }

  return (
    <div className="p-6 max-w-7xl mx-auto relative">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Exámenes de Laboratorio</h1>
        <p className="text-slate-600 mt-2">Gestión completa de resultados de laboratorio</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex justify-between items-center p-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-3">{paciente?.nombre || "Paciente"}</h1>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-800">
                    {paciente?.rut ? paciente.rut.replace(/^(\d{1,2})(\d{3})(\d{3})([0-9kK])$/, "$1.$2.$3-$4") : "—"}
                  </span>
                </div>
                <div className="w-px h-4 bg-gray-300"></div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-800">{paciente?.fecha_nacimiento || "—"}</span>
                </div>
                <div className="w-px h-4 bg-gray-300"></div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-800">
                    {paciente?.edad || 0} años {paciente?.edad_meses || 0} meses
                  </span>
                </div>
                <div className="w-px h-4 bg-gray-300"></div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-red-600">{paciente?.tipo_sangre || "—"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeaderWithIcon
            icon={<Filter className="h-5 w-5" />}
            title="Filtros y Búsqueda"
            subtitle="Encuentra exámenes específicos"
          />
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por tipo o parametro..."
                  value={filtros.busqueda}
                  onChange={(e: { target: { value: any } }) => setFiltros({ ...filtros, busqueda: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <select
                value={filtros.tipoExamen}
                onChange={(e) => setFiltros({ ...filtros, tipoExamen: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tipo de examen</option>
                {optsTipoExamen.slice(1).map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
              <select
                value={filtros.tipoMuestra}
                onChange={(e) => setFiltros({ ...filtros, tipoMuestra: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tipo de muestra</option>
                {optsTipoMuestra.slice(1).map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeaderWithIcon
            icon={<Calendar className="h-5 w-5" />}
            title={`Exámenes de Laboratorio (${examenesFiltrados.length})`}
            subtitle="Lista expandible de exámenes"
          />
          <CardContent>
            <div className="space-y-4">
              {examenesFiltrados.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No se encontraron exámenes</div>
              ) : (
                examenesFiltrados.map((examen) => {
                  const examenId = examen.examen_id.toString()
                  const abierto = abiertas.has(examenId)
                  const totalMuestras = examen.muestras?.length || 0
                  const totalResultados =
                    examen.muestras?.reduce((total, muestra) => total + (muestra.resultados?.length || 0), 0) || 0

                  return (
                    <div
                      key={examenId}
                      className="border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="p-4 cursor-pointer" onClick={() => toggle(examenId)}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col">
                              <div className="font-semibold text-gray-900">Examen - {examen.tipo_examen}</div>
                              <div className="text-sm text-gray-600 flex items-center gap-2">
                                <Calendar className="h-3 w-3" />
                                {totalMuestras > 0 && examen.muestras?.[0]?.fecha_recepcion
                                  ? formatearFecha(examen.muestras[0].fecha_recepcion)
                                  : "Sin fecha"}
                              </div>
                            </div>
                            <div className="hidden md:flex flex-col gap-1">
                              <div className="text-sm font-medium">{totalMuestras} muestra(s)</div>
                              <div className="text-xs text-gray-600">{totalResultados} resultado(s)</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-600">{totalMuestras} muestra(s)</span>
                            <ChevronDown className={`h-4 w-4 transition-transform ${abierto ? "rotate-180" : ""}`} />
                          </div>
                        </div>
                      </div>

                      {abierto && (
                        <div className="border-t border-gray-200 bg-gray-50 p-4">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium text-gray-900">Muestras y Resultados</h4>
                            <Button onClick={() => descargarExamenCompleto(examen)}>
                              <Download className="h-4 w-4" />
                              Descargar todo
                            </Button>
                          </div>
                          <div className="space-y-4">
                            {examen.muestras?.map((muestra, index) => (
                              <div key={muestra.muestra_id} className="bg-white rounded-lg border border-gray-200 p-4">
                                <div className="font-medium text-gray-900 mb-2">Muestra - {muestra.tipo_muestra}</div>
                                <div className="text-sm text-gray-600 mb-3">
                                  Recepción: {formatearFecha(muestra.fecha_recepcion)} | Validador: {muestra.validado_por} |
                                  Extracción:{" "}
                                  {muestra.fecha_extraccion ? formatearFecha(muestra.fecha_extraccion) : "—"}{" "}
                                  
                                </div>
                                <div className="text-sm text-gray-600 mb-3">
                                  Observación: {muestra.observaciones && ` ${muestra.observaciones}`}
                                </div>

                                {muestra.resultados && muestra.resultados.length > 0 ? (
                                  <div className="space-y-2">
                                    {muestra.resultados.map((resultado) => (
                                      <div
                                        key={resultado.resultado_id}
                                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                                      >
                                        <div className="flex items-center gap-4">
                                          <div className="flex flex-col">
                                            <div className="font-medium text-gray-900">{resultado.nombre}</div>
                                            <div className="text-sm text-gray-600">
                                              Valor: {resultado.valor} {resultado.unidad || ""}
                                            </div>
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            {formatearFecha(resultado.fecha_resultado)}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-2 text-gray-500 text-sm">
                                    No hay resultados disponibles para esta muestra
                                  </div>
                                )}
                              </div>
                            )) || (
                              <div className="text-center py-4 text-gray-500">No hay muestras para este examen</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default LaboratorioPage
