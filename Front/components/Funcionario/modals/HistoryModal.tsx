"use client"
import { X, FileText, Calendar, User, Stethoscope } from "lucide-react"
import type { DetallesPaciente } from "@/types/interfaces"

interface HistoryModalProps {
  isOpen: boolean
  onClose: () => void
  paciente: DetallesPaciente | null
}

export default function HistoryModal({ isOpen, onClose, paciente }: Readonly<HistoryModalProps>) {
  if (!isOpen) return null

  const historialMedico = paciente?.general?.historial_medico || []
  const registroControles = paciente?.registro_controles || []

  const getColorByConsulta = (nombreConsulta: string) => {
    switch (nombreConsulta.toLowerCase()) {
      case "guardado":
        return "blue"
      case "minuta":
        return "green"
      case "urgencia":
        return "red"
      case "control":
        return "purple"
      default:
        return "gray"
    }
  }

  const getColorByOrigen = (origen: string) => {
    switch (origen.toLowerCase()) {
      case "guardado":
        return "blue"
      case "minuta":
        return "green"
      case "urgencia":
        return "red"
      default:
        return "gray"
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
        <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <FileText className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Historial Médico</h2>
              </div>
                <p className="text-sm text-gray-600">
                {paciente?.general?.rut
                  ? paciente.general.rut.replace(/^(\d{1,2})(\d{3})(\d{3})([\dkK])$/, "$1.$2.$3-$4")
                  : ""}
                </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3 flex items-center sticky top-0 bg-white py-2 -mx-6 px-6 border-b border-gray-100">
              <Stethoscope className="w-5 h-5 mr-2 text-green-600" />
              Historial de Consultas Médicas
            </h3>
            <div className="space-y-4 mt-4">
              {historialMedico.length > 0 ? (
                historialMedico.map((entrada, index) => {
                  const color = getColorByConsulta(entrada.nombre_consulta)
                  return (
                    <div key={index} className={`border-l-4 border-${color}-500 pl-4 py-3 bg-${color}-50 rounded-r-lg`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className={`w-4 h-4 text-${color}-600`} />
                        <span className={`text-sm text-${color}-600 font-medium`}>
                          {new Date(entrada.fecha).toLocaleDateString("es-ES")}
                        </span>
                        <span className={`text-xs px-2 py-1 bg-${color}-100 text-${color}-700 rounded-full`}>
                          {entrada.nombre_consulta}
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-800">{entrada.motivo_consulta}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Dr. {entrada.doctor_asociado} (ID: {entrada.doctor_id})
                      </p>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No hay historial médico registrado</p>
                </div>
              )}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3 flex items-center sticky top-0 bg-white py-2 -mx-6 px-6 border-b border-gray-100">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Registro de Controles
            </h3>
            <div className="space-y-3 mt-4">
              {registroControles.length > 0 ? (
                registroControles.slice(0, 10).map((control, index) => {
                  const color = getColorByOrigen(control.origen)
                  return (
                    <div key={index} className={`border-l-4 border-${color}-500 pl-4 py-2 bg-${color}-50 rounded-r-lg`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <Calendar className={`w-4 h-4 text-${color}-600`} />
                          <span className="text-sm text-gray-700 font-medium">
                            {new Date(control.fecha_hora).toLocaleDateString("es-ES")} -{" "}
                            {new Date(control.fecha_hora).toLocaleTimeString("es-ES", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <span className={`text-xs px-2 py-1 bg-${color}-100 text-${color}-700 rounded-full`}>
                          Episodio {control.episodio_id}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-1">
                        <strong>Origen:</strong> {control.origen}
                      </p>
                      <p className="text-sm text-gray-600">{control.resumen}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500">
                          Dr. {control.doctor} (ID: {control.profesional_id})
                        </p>
                        {control.dias_desde_previo && (
                          <span className="text-xs text-gray-400">
                            {control.dias_desde_previo} días desde control previo
                          </span>
                        )}
                      </div>
                      {control.tipo_fractura && (
                          <span className="text-xs text-gray-400">
                            {control.tipo_fractura}
                          </span>
                        )}
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p>No hay registros de control disponibles</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
