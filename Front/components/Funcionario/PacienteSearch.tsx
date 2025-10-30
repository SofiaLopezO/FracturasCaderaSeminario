"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {Paciente} from "@/types/interfaces";
type Props = {
  readonly value: string;
  readonly onChange: (v: string) => void;
  readonly onOpen: (rut: string) => void;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3001/api/v1";

function toPaciente(x: any): Paciente {
  return {
    rut: String(x?.rut ?? "").trim(),
    nombres: String(x?.nombres ?? x?.nombre ?? "").trim(),
    Apellido_Paterno: String(
      x?.apellido_paterno ?? x?.ApellidoPaterno ?? ""
    ).trim(),
    Apellido_Materno: String(
      x?.apellido_materno ?? x?.ApellidoMaterno ?? ""
    ).trim(),
  };
}

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

export default function PacienteSearch({
  value,
  onChange,
  onOpen,
}: Props) {
  const { authFetch } = useAuth();

  const [results, setResults] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const q = value.trim();
    setErr(null);

    if (!q) {
      setResults([]);
      abortRef.current?.abort();
      return;
    }

    const handle = setTimeout(async () => {
      try {
        abortRef.current?.abort();
        const ctrl = new AbortController();
        abortRef.current = ctrl;

        setLoading(true);

        const resp = await authFetch(
          `${API_BASE}/pacientes/search?q=${encodeURIComponent(q)}&limit=6`,
          { signal: ctrl.signal }
        );

        const data = await resp.json().catch(() => ({} as any));

        let arr: any[] = [];
        if (Array.isArray(data)) {
          arr = data;
        } else if (Array.isArray(data.items)) {
          arr = data.items;
        } else if (Array.isArray(data.pacientes)) {
          arr = data.pacientes;
        }

        setResults(arr.map(toPaciente));
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          console.error(e);
          setErr("Error al buscar pacientes");
        }
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(handle);
  }, [value, authFetch]);

  const hayTexto = value.trim() !== "";

  const sugerencias = useMemo(() => {
    if (!hayTexto) return [];
    const s = norm(value.trim());
    return results
      .filter((p) => {
        const full = `${p.rut} ${p.nombres} ${p.Apellido_Paterno} ${p.Apellido_Materno}`;
        return norm(full).includes(s);
      })
      .slice(0, 6);
  }, [value, results, hayTexto]);

  return (
    <div className="self-start z-3 w-full bg-white/80 backdrop-blur rounded-2xl shadow-xl border border-white/60">
      <div className="flex items-center justify-between px-5 py-3 rounded-t-2xl bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200">
        <h2 className="text-blue-900 font-semibold">Ingreso paciente</h2>
      </div>

      <div className="p-5 space-y-3">
        <label
          htmlFor="paciente-search-input"
          className="block text-sm font-medium text-blue-900"
        >
          Ingrese RUT o Nombre Paciente
        </label>

        <div className="relative">
          <input
            id="paciente-search-input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="12.345.678-9 o nombre/apellidos"
            className="text-blue-700 w-full pl-4 pr-24 py-3 rounded-lg border border-blue-300 focus:ring-2 focus:ring-blue-500 placeholder-blue-500"
          />
          <button
            onClick={() => value.trim() && onOpen(value.trim())}
            disabled={!value.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:shadow active:translate-y-0 transition disabled:opacity-60"
          >
            Abrir
          </button>

          {hayTexto &&
            (() => {
              let content;
              if (loading) {
                content = (
                  <div className="px-4 py-3 text-sm text-blue-700">
                    Buscando…
                  </div>
                );
              } else if (err) {
                content = (
                  <div className="px-4 py-3 text-sm text-red-700">{err}</div>
                );
              } else if (sugerencias.length === 0) {
                content = (
                  <div className="px-4 py-3 text-sm text-blue-700">
                    Sin coincidencias.
                  </div>
                );
              } else {
                content = (
                  <ul className="max-h-64 overflow-auto">
                    {sugerencias.map((p) => (
                      <li
                        key={p.rut}
                        className="flex items-center justify-between"
                      >
                        <button
                          type="button"
                          onClick={() => onOpen(p.rut)}
                          className="w-full text-left px-4 py-3 text-sm cursor-pointer hover:bg-blue-50 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500"
                          tabIndex={0}
                          aria-label={`Abrir paciente ${p.nombres} ${p.Apellido_Paterno} ${p.Apellido_Materno}`}
                        >
                          <div className="text-blue-900">
                            <div className="font-medium">
                              {p.Apellido_Paterno} {p.Apellido_Materno},{" "}
                              {p.nombres}
                            </div>
                            <div className="text-blue-600">{p.rut}</div>
                          </div>
                          <span className="text-blue-600 text-xs bg-blue-100 rounded-full px-2 py-0.5">
                            Ver
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                );
              }
              return (
                <div className="absolute left-0 right-0 mt-2 bg-white/95 backdrop-blur rounded-xl border border-blue-100 shadow-xl overflow-hidden">
                  {content}
                </div>
              );
            })()}
        </div>

      </div>
    </div>
  );
}
