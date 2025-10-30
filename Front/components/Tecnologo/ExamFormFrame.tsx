'use client';

import type { ReactNode } from 'react';
import { useState, useRef, useMemo } from 'react';
import { usePathname } from 'next/navigation';

interface ExamFormFrameProps {
  children: ReactNode;
  paciente_id?: number;
  funcionario_id?: number;
  /** Forzar el tipo de examen según la sección (p. ej. "LABORATORIO" | "RADIOGRAFIA" | "BIOPSIA") */
  examType?: string;
  /** Se invoca cuando el guardado termina OK para que el padre limpie su UI */
  onSuccess?: () => void;
}

/** Mapeo auxiliar ruta → tipo de examen (ajústalo a tus rutas reales y a lo que espera tu backend) */
const ROUTE_TO_EXAMTYPE: Array<{ test: (p: string) => boolean; value: string }> = [
  { test: (p) => /laboratorio/i.test(p), value: 'LABORATORIO' },
  { test: (p) => /(imagen|radiografia|rayosx|rx)/i.test(p), value: 'RADIOGRAFIA' },
  { test: (p) => /biopsia/i.test(p), value: 'BIOPSIA' },
];

export default function ExamFormFrame({
  children,
  paciente_id,
  funcionario_id, // reservado
  examType,
  onSuccess,
}: ExamFormFrameProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const pathname = usePathname();

  /** Si no viene por prop, intenta inferirlo por ruta */
  const resolvedExamType = useMemo(() => {
    if (examType && examType.trim()) return examType.trim();
    const p = pathname || '';
    const hit = ROUTE_TO_EXAMTYPE.find((r) => r.test(p));
    return hit?.value ?? '';
  }, [examType, pathname]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formEl = formRef.current ?? e.currentTarget;
      const formData = new FormData(formEl);
      const data: Record<string, FormDataEntryValue> = {};
      formData.forEach((value, key) => {
        data[key] = value;
      });

      // Agrupar resultados (solo los que tengan parametro y valor)
      const resultados: Array<{ parametro: string; valor: string; unidad: string | null }> = [];
      let i = 1;
      while (data[`resultado_${i}_parametro`] !== undefined) {
        const parametro = String(data[`resultado_${i}_parametro`] ?? '').trim();
        const valor = String(data[`resultado_${i}_valor`] ?? '').trim();
        const unidad = String(data[`resultado_${i}_unidad`] ?? '').trim();

        if (parametro && valor) {
          resultados.push({ parametro, valor, unidad: unidad || null });
        }
        i++;
      }

      if (resultados.length === 0) {
        setError('Debe ingresar al menos un resultado con parámetro y valor');
        setIsLoading(false);
        return;
      }

      const { fecha_recepcion, fecha_extraccion, observaciones, tipo_muestra } = data;

      // ✅ Tipo de examen por contexto (prop o ruta)
      const tipo_examen = resolvedExamType;

      if (!tipo_examen) {
        setError('No fue posible determinar el tipo de examen (sección).');
        setIsLoading(false);
        return;
      }
      if (!tipo_muestra || !tipo_muestra.toString().trim()) {
        setError('Tipo de muestra es requerida');
        setIsLoading(false);
        return;
      }
      if (!paciente_id) {
        setError('paciente_id es requerido');
        setIsLoading(false);
        return;
      }

      const payload = {
        tipo_examen, // ← viene del contexto
        tipo_muestra: tipo_muestra.toString().trim(),
        fecha_extraccion: fecha_extraccion ? fecha_extraccion.toString() : null,
        fecha_recepcion: fecha_recepcion ? fecha_recepcion.toString() : null,
        observaciones: observaciones ? observaciones.toString() : null,
        paciente_id,
        resultados,
      };

      // POST
      const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3001/api/v1';

      const response = await fetch(`${apiBase}/examenes/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let message = 'Error al guardar el examen';
        try {
          const errJson = await response.json();
          message = errJson?.error || message;
        } catch {
          /* ignore */
        }
        throw new Error(message);
      }

      // OK
      setSuccess(true);
      setError(null);
      (formEl as HTMLFormElement).reset();
      onSuccess?.();
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      console.error('Error al guardar examen:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg border border-gray-200 p-8">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          Examen guardado exitosamente
        </div>
      )}

      <form ref={formRef} className="space-y-6" onSubmit={handleSubmit}>
        {/* (Opcional) Guardarlo también como campo oculto, por si quieres inspeccionarlo en DevTools */}
        {resolvedExamType && (
          <input type="hidden" name="tipo_examen_contexto" value={resolvedExamType} />
        )}

        {children}

        <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
          <button
            type="reset"
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Guardando...' : 'Guardar Examen'}
          </button>
        </div>
      </form>
    </div>
  );
}
