"use client"
import { X } from "lucide-react";
import type { DetallesPaciente } from "@/types/interfaces";
interface IndicatorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  paciente: DetallesPaciente;
}
export default function IndicatorsModal({
  isOpen,
  onClose,
  paciente,
}: Readonly<IndicatorsModalProps>) {
  if (!isOpen) return null
  const { indicadores } = paciente;
  const getLevelColor = (nivel: string) => {
    switch (nivel) {
      case "ALTO":
        return "text-red-600 bg-red-50 border-red-200";
      case "MEDIO":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "BAJO":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };
  const getIndicatorColor = (valor: number) => {
    if (valor >= 2) return "bg-red-100 text-red-800 border-red-200";
    if (valor === 1) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-green-100 text-green-800 border-green-200";
  };
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Indicadores de Riesgo
            </h2>
            <p className="text-gray-600 mt-1">
              Resumen de métricas y factores de riesgo del paciente
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Resumen del nivel de riesgo */}
          <div className="mb-8">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-xl font-bold text-orange-600">
                  {indicadores?.nivel || "NO DISPONIBLE"}
                </div>
                <div className="text-sm text-orange-800 font-medium">
                  Nivel de Riesgo General
                </div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">
                  {indicadores?.suma || 0}
                </div>
                <div className="text-sm text-blue-800 font-medium">
                  Puntaje Total
                </div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">
                  {indicadores?.indicadores?.length || 0}
                </div>
                <div className="text-sm text-purple-800 font-medium">
                  Indicadores Evaluados
                </div>
              </div>
            </div>
          </div>

          {/* Tabla de indicadores */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Detalle de Indicadores
            </h3>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Indicador
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Significado
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {indicadores?.indicadores?.map((indicador, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {indicador.nombre}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getIndicatorColor(
                            indicador.valor
                          )}`}
                        >
                          {indicador.valor}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {indicador.valor > 0 ? (
                            <span className="text-red-600 font-medium">
                              Factor de riesgo presente
                            </span>
                          ) : (
                            <span className="text-green-600">
                              Sin riesgo identificado
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mensaje si no hay indicadores */}
            {(!indicadores?.indicadores ||
              indicadores.indicadores.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                No hay indicadores disponibles para este paciente.
              </div>
            )}
          </div>

          {/* Información adicional */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2">
              Interpretación del Puntaje
            </h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center p-3 bg-green-50 rounded border border-green-200">
                <div className="font-semibold text-green-800">Bajo Riesgo</div>
                <div className="text-green-600">Puntaje 0-3</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded border border-yellow-200">
                <div className="font-semibold text-yellow-800">
                  Medio Riesgo
                </div>
                <div className="text-yellow-600">Puntaje 4-7</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded border border-red-200">
                <div className="font-semibold text-red-800">Alto Riesgo</div>
                <div className="text-red-600">Puntaje 8+</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
