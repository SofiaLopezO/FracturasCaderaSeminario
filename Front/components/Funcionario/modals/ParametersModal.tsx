"use client"
import { X, Activity, Clock, User, Calendar } from "lucide-react"
import type { ModalProps, DetallesPaciente } from "@/types/interfaces"

interface ParametersModalProps extends ModalProps {
  paciente?: DetallesPaciente
}

export default function ParametersModal({ isOpen, onClose, paciente }: Readonly<ParametersModalProps>) {
  if (!isOpen) return null

  const general = paciente?.general
  const parametrosVitales = [
    {
      nombre: "Altura",
      valor: general?.altura || 0,
      unidad: "m",
      icono: <User className="w-4 h-4" />,
      color: "text-blue-600",
    },
    {
      nombre: "Peso",
      valor: general?.peso || 0,
      unidad: "kg",
      icono: <User className="w-4 h-4" />,
      color: "text-green-600",
    },
    {
      nombre: "Edad",
      valor: general?.edad || 0,
      unidad: "años",
      icono: <Calendar className="w-4 h-4" />,
      color: "text-purple-600",
    },
    {
      nombre: "TDC",
      valor: general?.tdc_dias || 0,
      unidad: "días",
      icono: <Clock className="w-4 h-4" />,
      color: "text-orange-600",
    },
    {
      nombre: "TPO",
      valor: general?.tpo_dias || 0,
      unidad: "días",
      icono: <Clock className="w-4 h-4" />,
      color: "text-red-600",
    },
    {
      nombre: "TTH",
      valor: general?.tth_dias || 0,
      unidad: "días",
      icono: <Clock className="w-4 h-4" />,
      color: "text-indigo-600",
    },
  ]

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[80vh] flex flex-col">
        <div className="flex-shrink-0 p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold">Parámetros del Paciente</h2>
              </div>
              <p className="text-sm text-gray-600">
                {general?.nombre} - RUT: {general?.rut}
              </p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Parámetros Básicos */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Parámetros Básicos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {parametrosVitales.map((parametro, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={parametro.color}>{parametro.icono}</div>
                        <h4 className="font-medium text-gray-800">{parametro.nombre}</h4>
                      </div>
                    </div>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-2xl font-bold text-gray-900">{parametro.valor}</span>
                      <span className="text-sm text-gray-500">{parametro.unidad}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Información Adicional */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Información Adicional</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">Tipo de Sangre</h4>
                  <span className="text-lg font-semibold text-red-600">{general?.tipo_sangre || "No disponible"}</span>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">Sexo</h4>
                  <span className="text-lg font-semibold text-gray-700">
                    {general?.sexo === "M" ? "Masculino" : general?.sexo === "F" ? "Femenino" : "No especificado"}
                  </span>
                </div>
              </div>
            </div>

            {/* Diagnóstico Actual */}
            {general?.dx_actual && (
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Diagnóstico Actual</h3>
                <div className="p-4 border border-gray-200 rounded-lg bg-blue-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-1">CIE-10</h4>
                      <span className="text-sm text-gray-600">{general.dx_actual.cie10}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-1">Tipo de Fractura</h4>
                      <span className="text-sm text-gray-600">{general.dx_actual.tipo_fractura}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-1">Lado</h4>
                      <span className="text-sm text-gray-600">{general.dx_actual.lado}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-1">Procedencia</h4>
                      <span className="text-sm text-gray-600">{general.dx_actual.procedencia}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
