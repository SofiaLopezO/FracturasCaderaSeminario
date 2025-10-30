"use client";
import { X, Droplets, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { DetallesPaciente } from "@/types/interfaces";

interface BloodModalProps {
  isOpen: boolean;
  onClose: () => void;
  paciente: DetallesPaciente | null;
}

type Analito = {
  nombre?: string;
  valor?: number | null;
  unidad?: string | null;
  fecha?: string | null;
} | null | undefined;

type ParametroUI = {
  nombre: string;
  valor: number;
  unidad: string;
  fecha: string;
  normalMin: number;
  normalMax: number;
  rango: string;
};

export default function BloodModal({ isOpen, onClose, paciente }: Readonly<BloodModalProps>) {
  if (!isOpen || !paciente) return null;

  const analisisSangre = paciente.general?.analisis_sangre;

  const getStatusInfo = (value: number, normalMin: number, normalMax: number) => {
    if (value < normalMin) {
      return {
        color: "blue",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        textColor: "text-blue-800",
        valueColor: "text-blue-600",
        icon: TrendingDown,
        status: "Bajo",
      };
    } else if (value > normalMax) {
      return {
        color: "red",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        textColor: "text-red-800",
        valueColor: "text-red-600",
        icon: TrendingUp,
        status: "Alto",
      };
    } else {
      return {
        color: "green",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        textColor: "text-green-800",
        valueColor: "text-green-600",
        icon: Minus,
        status: "Normal",
      };
    }
  };

  // Definición de los analitos que queremos mostrar + rangos
  const defs = [
    { key: "hemoglobina", label: "Hemoglobina", normalMin: 12, normalMax: 16, rango: "12–16 g/dL" },
    { key: "glucosa", label: "Glucosa", normalMin: 70, normalMax: 100, rango: "70–100 mg/dL" },
    { key: "colesterol_total", label: "Colesterol total", normalMin: 0, normalMax: 200, rango: "<200 mg/dL" },
    { key: "trigliceridos", label: "Triglicéridos", normalMin: 0, normalMax: 150, rango: "<150 mg/dL" },
  ] as const;

  // Construimos la lista de parámetros, filtrando los que vienen null/undefined o sin valor numérico
  const parametros: ParametroUI[] =
    analisisSangre
      ? defs
          .map((d) => {
            const item = (analisisSangre as any)?.[d.key] as Analito;
            if (!item) return null;

            const valorNum =
              typeof item.valor === "number"
                ? item.valor
                : item.valor != null
                ? Number(item.valor)
                : null;

            if (valorNum == null || Number.isNaN(valorNum)) return null;

            return {
              nombre: item.nombre ?? d.label,
              valor: valorNum,
              unidad: (item.unidad ?? "").toString(),
              fecha: (item.fecha ?? new Date().toISOString()).toString(),
              normalMin: d.normalMin,
              normalMax: d.normalMax,
              rango: d.rango,
            } as ParametroUI;
          })
          .filter(Boolean) as ParametroUI[]
      : [];

  const noHayAnalitosValidos = parametros.length === 0;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Droplets className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-semibold">Análisis de Sangre</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Mensajes vacíos */}
        {!analisisSangre && (
          <p className="text-gray-500 text-center py-8">No hay datos de análisis de sangre disponibles.</p>
        )}

        {analisisSangre && noHayAnalitosValidos && (
          <p className="text-gray-500 text-center py-8">
            El paciente no tiene resultados numéricos disponibles para los parámetros configurados.
          </p>
        )}

        {/* Grid de parámetros */}
        {analisisSangre && !noHayAnalitosValidos && (
          <div className="grid grid-cols-2 gap-4">
            {parametros.map((param) => {
              const statusInfo = getStatusInfo(param.valor, param.normalMin, param.normalMax);
              const StatusIcon = statusInfo.icon;
              return (
                <div
                  key={param.nombre}
                  className={`p-4 ${statusInfo.bgColor} rounded-lg border ${statusInfo.borderColor}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-medium ${statusInfo.textColor}`}>{param.nombre}</h3>
                    <StatusIcon className={`w-4 h-4 ${statusInfo.valueColor}`} />
                  </div>
                  <p className={`text-2xl font-bold ${statusInfo.valueColor}`}>
                    {param.valor} {param.unidad}
                  </p>
                  <p className={`text-sm ${statusInfo.valueColor}`}>
                    {statusInfo.status} ({param.rango})
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(param.fecha).toLocaleDateString("es-CL")}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Info paciente */}
        <div className="mt-6">
          <h3 className="font-medium text-gray-800 mb-3">Información del Paciente</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="text-sm">Tipo de sangre</span>
              <span className="text-sm font-medium">{paciente.general?.tipo_sangre ?? "—"}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="text-sm">Edad</span>
              <span className="text-sm font-medium">
                {typeof paciente.general?.edad === "number" ? `${paciente.general.edad} años` : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
