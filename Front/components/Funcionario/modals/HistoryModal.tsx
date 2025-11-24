"use client";
import { X, FileText, Calendar, User, Stethoscope } from "lucide-react";
import type { DetallesPaciente } from "@/types/interfaces";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  paciente: DetallesPaciente | null;
}

type PaletteKey = "blue" | "green" | "red" | "purple" | "gray";

const PALETTE: Record<PaletteKey, { border: string; bg50: string; bg100: string; text600: string; text700: string }> = {
  blue:   { border: "border-blue-500",   bg50: "bg-blue-50",   bg100: "bg-blue-100",   text600: "text-blue-600",   text700: "text-blue-700" },
  green:  { border: "border-green-500",  bg50: "bg-green-50",  bg100: "bg-green-100",  text600: "text-green-600",  text700: "text-green-700" },
  red:    { border: "border-red-500",    bg50: "bg-red-50",    bg100: "bg-red-100",    text600: "text-red-600",    text700: "text-red-700" },
  purple: { border: "border-purple-500", bg50: "bg-purple-50", bg100: "bg-purple-100", text600: "text-purple-600", text700: "text-purple-700" },
  gray:   { border: "border-gray-400",   bg50: "bg-gray-50",   bg100: "bg-gray-100",   text600: "text-gray-600",   text700: "text-gray-700" },
};

const norm = (v: unknown) => (typeof v === "string" ? v.trim().toLowerCase() : "");

function colorByConsulta(nombreConsulta: unknown): PaletteKey {
  switch (norm(nombreConsulta)) {
    case "guardado": return "blue";
    case "minuta":   return "green";
    case "urgencia": return "red";
    case "control":
    case "control clínico":
    case "control clinico": return "purple";
    default:         return "gray";
  }
}

const formatRut = (rut?: string | null) =>
  rut ? rut.replace(/^(\d{1,2})(\d{3})(\d{3})([\dkK])$/, "$1.$2.$3-$4") : "";

export default function HistoryModal({ isOpen, onClose, paciente }: Readonly<HistoryModalProps>) {
  if (!isOpen) return null;

  const historialMedico = paciente?.general?.historial_medico ?? [];
  const registroControles = paciente?.registro_controles ?? [];

  const sortDesc = <T,>(arr: T[], pick: (x: T) => string | Date | undefined) =>
    [...arr].sort((a, b) => {
      const ta = new Date(String(pick(a))).getTime();
      const tb = new Date(String(pick(b))).getTime();
      return tb - ta;
    });

  const historialOrdenado = sortDesc(historialMedico, (e: any) => e?.fecha);
  const controlesOrdenados = sortDesc(registroControles, (c: any) => c?.fecha_hora);

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
        {/* header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <FileText className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Historial Médico</h2>
              </div>
              <p className="text-sm text-gray-600">{formatRut(paciente?.general?.rut)}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Cerrar">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto px-6">
          {/* Historial de consultas */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3 flex items-center sticky top-0 bg-white py-2 -mx-6 px-6 border-b border-gray-100">
              <Stethoscope className="w-5 h-5 mr-2 text-green-600" />
              Historial de Consultas Médicas
            </h3>

            <div className="space-y-4 mt-4">
              {historialOrdenado.length > 0 ? (
                historialOrdenado.map((entrada: any, index: number) => {
                  const key = colorByConsulta(entrada?.nombre_consulta);
                  const c = PALETTE[key];
                  const fecha = entrada?.fecha ? new Date(entrada.fecha) : null;

                  return (
                    <div key={index} className={`border-l-4 ${c.border} pl-4 py-3 ${c.bg50} rounded-r-lg`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className={`w-4 h-4 ${c.text600}`} />
                        <span className={`text-sm ${c.text600} font-medium`}>
                          {fecha ? fecha.toLocaleDateString("es-ES") : "Fecha no disponible"}
                        </span>
                        <span className={`text-xs px-2 py-1 ${c.bg100} ${c.text700} rounded-full`}>
                          {entrada?.nombre_consulta ?? "—"}
                        </span>
                      </div>

                      <h4 className="font-medium text-gray-800">{entrada?.motivo_consulta ?? "Sin motivo registrado"}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {entrada?.doctor_asociado ? `Dr. ${entrada.doctor_asociado} (ID: ${entrada?.doctor_id ?? "—"})` : "Profesional no registrado"}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No hay historial médico registrado</p>
                </div>
              )}
            </div>
          </div>

          {/* Registro de controles */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3 flex items-center sticky top-0 bg-white py-2 -mx-6 px-6 border-b border-gray-100">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Registro de Controles
            </h3>

            <div className="space-y-3 mt-4">
              {controlesOrdenados.length > 0 ? (
                controlesOrdenados.slice(0, 10).map((control: any, index: number) => {
                  const c = PALETTE.blue;
                  const fh = control?.fecha_hora ? new Date(control.fecha_hora) : null;
                  const diasDesdePrevio =
                    control?.dias_desde_previo ?? control?.dias_desde_previo === 0 ? control.dias_desde_previo : null;

                  return (
                    <div key={index} className={`border-l-4 ${c.border} pl-4 py-2 ${c.bg50} rounded-r-lg`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <Calendar className={`w-4 h-4 ${c.text600}`} />
                          <span className="text-sm text-gray-700 font-medium">
                            {fh
                              ? `${fh.toLocaleDateString("es-ES")} - ${fh.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}`
                              : "Fecha/hora no disponible"}
                          </span>
                        </div>
                        <span className={`text-xs px-2 py-1 ${c.bg100} ${c.text700} rounded-full`}>Episodio {control?.episodio_id ?? "—"}</span>
                      </div>

                      {/* Procedencia (no “Origen”) */}
                      <p className="text-sm text-gray-700 mb-1">
                        <strong>Procedencia:</strong> {control?.procedencia ?? "—"}
                      </p>

                      {control?.resumen && <p className="text-sm text-gray-600">{control.resumen}</p>}

                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500">
                          {control?.doctor ? `Dr. ${control.doctor} (ID: ${control?.profesional_id ?? "—"})` : "Profesional no registrado"}
                        </p>
                        {diasDesdePrevio !== null && (
                          <span className="text-xs text-gray-400">{diasDesdePrevio} días desde control previo</span>
                        )}
                      </div>

                      {control?.tipo_fractura && <span className="text-xs text-gray-400">{control.tipo_fractura}</span>}
                    </div>
                  );
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
  );
}
