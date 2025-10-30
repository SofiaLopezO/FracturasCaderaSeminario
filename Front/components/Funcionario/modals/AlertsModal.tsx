"use client"
import { X, AlertTriangle, Clock, TrendingUp } from "lucide-react"
import type { DetallesPaciente } from "@/types/interfaces"

interface AlertsModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly paciente: DetallesPaciente | null
}

export default function AlertsModal({ isOpen, onClose, paciente }: AlertsModalProps) {
  if (!isOpen) return null

  const alertas = paciente?.general?.alertas_medicas || []

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
            <h2 className="text-xl font-semibold">Alertas Médicas</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          {alertas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No hay alertas médicas registradas para este paciente</p>
            </div>
          ) : (
            alertas.map((alerta, index) => {
              const getAlertColor = (severidad: string) => {
                switch (severidad.toLowerCase()) {
                  case "alta":
                    return "red"
                  case "media":
                    return "yellow"
                  case "baja":
                    return "blue"
                  default:
                    return "gray"
                }
              }

              const color = getAlertColor(alerta.severidad)

              return (
                <div key={alerta.alerta_id} className={`p-4 bg-${color}-50 border border-${color}-200 rounded-lg`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {alerta.severidad === "ALTA" && <AlertTriangle className={`w-5 h-5 text-${color}-600`} />}
                      {alerta.severidad === "MEDIA" && <TrendingUp className={`w-5 h-5 text-${color}-600`} />}
                      {alerta.severidad === "BAJA" && <Clock className={`w-5 h-5 text-${color}-600`} />}
                      <h3 className={`font-medium text-${color}-800`}>{alerta.tipo}</h3>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        alerta.activa ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                      }`}
                    >
                      {alerta.activa ? "Activa" : "Resuelta"}
                    </span>
                  </div>
                  <p className={`text-sm text-${color}-700`}>{alerta.mensaje}</p>
                  <div className="flex justify-between items-center mt-2">
                    <p className={`text-sm text-${color}-600`}>Episodio: {alerta.episodio_id}</p>
                    {alerta.resuelta_en && (
                      <p className={`text-sm text-${color}-600`}>
                        Resuelta: {new Date(alerta.resuelta_en).toLocaleDateString("es-CL")}
                      </p>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
