"use client";

import { useEffect, useState } from "react";
import {
  Hospital,
  Calendar,
  Clock,
  PlusCircle,
  CircleCheck,
  History,
  Trash2,
} from "lucide-react";
import { useFuncionario } from "@/contexts/FuncionarioContext";
/* ───────── helpers ───────── */
function nowDate() {
  return new Date().toISOString().split("T")[0];
}
function nowTime() {
  return new Date().toTimeString().split(" ")[0].substring(0, 5);
}
function nowDateTime() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
/** Duración en texto. Si fin <= inicio, retorna "0 min". */
function getDuracionMin(inicio?: string, fin?: string) {
  if (!inicio || !fin) return "";
  const [h1, m1] = inicio.split(":").map(Number);
  const [h2, m2] = fin.split(":").map(Number);
  const t = h2 * 60 + m2 - (h1 * 60 + m1);
  const mins = Math.max(0, t);
  return `${mins} min`;
}
/** Diferencia en minutos (número). 0 si fin <= inicio. */
function diffMin(inicio: string, fin: string) {
  const [h1, m1] = inicio.split(":").map(Number);
  const [h2, m2] = fin.split(":").map(Number);
  return Math.max(0, h2 * 60 + m2 - (h1 * 60 + m1));
}
function trimOrEmpty(s: string | undefined | null) {
  return String(s ?? "").trim();
}

/* ───────── tipos ───────── */
type Evento = {
  id: number;
  fecha: string;
  inicio: string;
  fin: string;
  tecnica: string;
  lado: "" | "DER" | "IZQ" | "BIL"; 
  compIntra: string;
  lockFechaInicio: boolean;
  lockFin: boolean;
};

type Suspension = {
  id: number;
  fecha: string;
  tipo: "Clínica" | "Administrativa";
  motivo: string;
  confirmado: boolean;
};

type RegistroSusp = {
  id: number;
  fecha: string;
  tipo: string;
  motivo: string;
  registradoEn: string;
};

type RegistroQx = {
  id: number;
  fecha: string;
  inicio: string;
  fin: string;
  duracion: string;
  tecnica: string;
  lado: string;
  reop: boolean;
  compIntra: string;
  registradoEn: string;
};

const LADO_LABEL: Record<NonNullable<Evento["lado"]> | "", string> = {
  "": "—",
  DER: "Derecho",
  IZQ: "Izquierdo",
  BIL: "Bilateral",
};

const LADO_API: Record<
  "DER" | "IZQ" | "BIL",
  "DERECHO" | "IZQUIERDO" | "BILATERAL"
> = {
  DER: "DERECHO",
  IZQ: "IZQUIERDO",
  BIL: "BILATERAL",
};

export default function QuirofanoPage() {
  /* ─────────────────────── Quirófano ─────────────────────── */
  const [eventos, setEventos] = useState<Evento[]>([]); 
  const [registroQx, setRegistroQx] = useState<RegistroQx[]>([]);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [suspensiones, setSuspensiones] = useState<Suspension[]>([]);
  const [registroSusp, setRegistroSusp] = useState<RegistroSusp[]>([]);
  const { seleccionado } = useFuncionario();
  const sessionRaw = localStorage.getItem("session_v1");
  const user = sessionRaw ? JSON.parse(sessionRaw).user.id : null;
  const token = sessionRaw ? JSON.parse(sessionRaw).token : null;
  useEffect(() => {
    setRegistroQx(
      seleccionado?.quirofano.cirugias.map((c) => ({
        id: c.cirugia_id,
        fecha: c.fecha,
        inicio: c.hora_inicio,
        fin: c.hora_fin,
        duracion: getDuracionMin(c.hora_inicio, c.hora_fin),
        tecnica: c.tecnica,
        lado: LADO_LABEL[c.lado as "DER" | "IZQ" | "BIL"] || "—",
        reop: !!c.reoperacion,
        compIntra: c.complicacion_intraop || "—",
        registradoEn: nowDateTime(),
      })) || []
    );
    setRegistroSusp(
      seleccionado?.quirofano.suspensiones.map((s) => ({
        id: s.suspension_id,
        fecha: s.fecha,
        tipo: s.tipo === "CLINICA" ? "Clínica" : "Administrativa",
        motivo: s.motivo || "—",
        registradoEn: nowDateTime(),
      })) || []
    );
  }, [seleccionado]);
  const setCampoEvento = (id: number, campo: keyof Evento, valor: any) => {
    setEventos((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [campo]: valor } : e))
    );
  };

  const nextId = <T extends { id: number }>(arr: T[]) =>
    arr.length ? Math.max(...arr.map((x) => x.id)) + 1 : 1;

  function iniciarCirugia() {
    const nuevo: Evento = {
      id: nextId(eventos),
      fecha: nowDate(),
      inicio: nowTime(),
      fin: "",
      tecnica: "",
      lado: "",
      reop: false,
      compIntra: "",
      lockFechaInicio: true,
      lockFin: false,
    };
    setEventos((prev) => [...prev, nuevo]);
  }

  function terminarCirugia(id: number) {
    setEventos((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, fin: nowTime(), lockFin: true } : e
      )
    );
  }

  function eliminarCirugiaPendiente(id: number) {
    setEventos((prev) => prev.filter((e) => e.id !== id));
  }

  function faltantesParaConfirmar(e: Evento): string[] {
    const missing: string[] = [];
    const duracion = getDuracionMin(e.inicio, e.fin);
    if (!duracion) missing.push("Duración (defina Inicio y Fin)");
    if (!trimOrEmpty(e.tecnica)) missing.push("Técnica");
    if (!e.lado) missing.push("Lado");
    if (!trimOrEmpty(e.compIntra)) missing.push("Comp. Intraop");
    return missing;
  }

  async function confirmarCirugia(id: number) {
    const e = eventos.find((x) => x.id === id);
    if (!e) return;

    const missing = faltantesParaConfirmar(e);
    if (missing.length) {
      alert(`No se puede confirmar. Falta:\n- ${missing.join("\n- ")}`);
      return;
    }
    const payload = {
      paciente_id: seleccionado?.general.paciente_id,
      episodio_id: seleccionado!.general.dx_actual.episodio_id,
      fecha: e.fecha,
      hora_inicio: e.inicio,
      hora_fin: e.fin,
      tecnica: e.tecnica,
      lado: LADO_API[e.lado as "DER" | "IZQ" | "BIL"],
      reoperacion: e.reop,
      complicacion_intraop: e.compIntra,
      operador_id: user,
    };
    try {
      setSavingId(id);
      await postCirugiaAPI(payload);
      const reg: RegistroQx = {
        id: nextId(registroQx),
        fecha: e.fecha,
        inicio: e.inicio,
        fin: e.fin,
        duracion: `${diffMin(e.inicio, e.fin)} min`,
        tecnica: e.tecnica,
        lado: LADO_LABEL[e.lado],
        reop: !!e.reop,
        compIntra: e.compIntra,
        registradoEn: nowDateTime(),
      };
      setRegistroQx((prev) => [reg, ...prev]);
      setEventos((prev) => prev.filter((x) => x.id !== id));
    } catch (error: any) {
      alert(`No se pudo guardar la cirugía: ${error.message}`);
    } finally {
      setSavingId(null);
    }
  }

  function agregarSuspension() {
    const nuevo: Suspension = {
      id: nextId(suspensiones),
      fecha: nowDate(),
      tipo: "Clínica",
      motivo: "",
      confirmado: false,
    };
    setSuspensiones((prev) => [...prev, nuevo]);
  }

  function confirmarFila(id: number) {
    const s = suspensiones.find((x) => x.id === id);
    const data = {
      paciente_id: seleccionado?.general.paciente_id,
      episodio_id: seleccionado!.general.dx_actual.episodio_id,
      fecha_suspension: s?.fecha || nowDate(),
      tipo: s?.tipo === "Clínica" ? "CLINICA" : "ADMINISTRATIVA",
      motivo: trimOrEmpty(s?.motivo) || "—",
    };
    postSuspensionAPI(data).catch((error) => {
      alert(`No se pudo guardar la suspensión: ${error.message}`);
    });
    if (!s) return;
    const reg: RegistroSusp = {
      id: nextId(registroSusp),
      fecha: s.fecha,
      tipo: s.tipo,
      motivo: trimOrEmpty(s.motivo) || "—",
      registradoEn: nowDateTime(),
    };
    setRegistroSusp((prev) => [reg, ...prev]);
    setSuspensiones((prev) => prev.filter((x) => x.id !== id));
  }

  function eliminarFila(id: number) {
    setSuspensiones((prev) => prev.filter((x) => x.id !== id));
  }

  function setCampoSusp(id: number, campo: keyof Suspension, valor: any) {
    setSuspensiones((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [campo]: valor } : s))
    );
  }
  async function postCirugiaAPI(payload: {
    paciente_id?: number;
    fecha: string;
    episodio_id: number;
    hora_inicio: string;
    hora_fin: string;
    tecnica: string;
    lado: "DERECHO" | "IZQUIERDO" | "BILATERAL";
    reoperacion: boolean;
    complicacion_intraop: string;
    operador_id: string;
  }) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/cirugias/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(payload),
      credentials: "include",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error ?? `Error HTTP ${res.status}`);
    }
    return res.json();
  }
async function postSuspensionAPI(payload: {
  paciente_id?: number;
  episodio_id: number;
  fecha_suspension: string;
  tipo: "CLINICA" | "ADMINISTRATIVA" | string;
  motivo: string;
}) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE}/suspensiones/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(payload),
      credentials: "include",
    }
  );
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    let msg = `Error HTTP ${res.status}`;
    try {
      const j = JSON.parse(errText);
      msg = j?.error ?? errText ?? msg;
    } catch {
      if (errText) msg = errText;
    }
    throw new Error(msg);
  }
  return res.json();
}
  return (
    <div className="grid gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Vista Quirófano</h1>
        <p className="text-slate-600 mt-2">
          Registro de cirugías y suspensiones
        </p>
      </div>

      {/* ───────────── Panel Quirófano (pendientes/editables) ───────────── */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Hospital className="h-5 w-5 text-slate-700" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Quirófano</h2>
              <p className="text-sm text-gray-600">Múltiples cirugías</p>
            </div>
          </div>
          <button
            onClick={iniciarCirugia}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Hospital className="h-4 w-4" />
            Iniciar cirugía
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-700">
                <th className="px-3 py-2 text-left">Fecha</th>
                <th className="px-3 py-2 text-left">Inicio</th>
                <th className="px-3 py-2 text-left">Fin</th>
                <th className="px-3 py-2 text-left">Duración</th>
                <th className="px-3 py-2 text-left">Técnica</th>
                <th className="px-3 py-2 text-left">Lado</th>
                <th className="px-3 py-2 text-left">Reop.</th>
                <th className="px-3 py-2 text-left">Comp. Intraop</th>
                <th className="px-3 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {eventos.length === 0 ? (
                <tr>
                  <td
                    className="px-3 py-6 text-center text-slate-500"
                    colSpan={10}
                  >
                    No hay cirugías pendientes.
                  </td>
                </tr>
              ) : (
                eventos.map((e) => {
                  const duracion = getDuracionMin(e.inicio, e.fin);
                  const missing = faltantesParaConfirmar(e);
                  const puedeConfirmar = missing.length === 0;
                  return (
                    <tr key={e.id} className="border-b">
                      <td className="px-3 py-2">
                        <input
                          type="date"
                          value={e.fecha}
                          disabled={e.lockFechaInicio}
                          onChange={(ev) =>
                            setCampoEvento(e.id, "fecha", ev.target.value)
                          }
                          className={`w-full px-3 py-1 text-sm border rounded-md focus:outline-none ${
                            e.lockFechaInicio
                              ? "bg-gray-100 text-slate-500 border-gray-200"
                              : "border-gray-300 focus:ring-2 focus:ring-blue-500"
                          }`}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="time"
                          value={e.inicio}
                          disabled={e.lockFechaInicio}
                          onChange={(ev) =>
                            setCampoEvento(e.id, "inicio", ev.target.value)
                          }
                          className={`w-full px-3 py-1 text-sm border rounded-md focus:outline-none ${
                            e.lockFechaInicio
                              ? "bg-gray-100 text-slate-500 border-gray-200"
                              : "border-gray-300 focus:ring-2 focus:ring-blue-500"
                          }`}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="time"
                          value={e.fin}
                          disabled={e.lockFin}
                          onChange={(ev) =>
                            setCampoEvento(e.id, "fin", ev.target.value)
                          }
                          className={`w-full px-3 py-1 text-sm border rounded-md focus:outline-none ${
                            e.lockFin
                              ? "bg-gray-100 text-slate-500 border-gray-200"
                              : "border-gray-300 focus:ring-2 focus:ring-blue-500"
                          }`}
                        />
                      </td>
                      <td className="px-3 py-2">{duracion}</td>
                      <td className="px-3 py-2">
                        <select
                          value={e.tecnica}
                          onChange={(ev) =>
                            setCampoEvento(e.id, "tecnica", ev.target.value)
                          }
                          className={`w-full px-3 py-1 text-sm border rounded-md focus:outline-none ${
                            trimOrEmpty(e.tecnica)
                              ? "border-gray-300 focus:ring-2 focus:ring-blue-500"
                              : "border-red-300"
                          }`}
                        >
                          <option value="">—</option>
                          <option>Gamma Nail</option>
                          <option>DHS</option>
                          <option>ATC</option>
                          <option>APC</option>
                          <option>BIP</option>
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={e.lado}
                          onChange={(ev) =>
                            setCampoEvento(
                              e.id,
                              "lado",
                              ev.target.value as Evento["lado"]
                            )
                          }
                          className={`w-full px-3 py-1 text-sm border rounded-md focus:outline-none ${
                            e.lado
                              ? "border-gray-300 focus:ring-2 focus:ring-blue-500"
                              : "border-red-300"
                          }`}
                        >
                          <option value="">—</option>
                          <option value="DER">Derecho</option>
                          <option value="IZQ">Izquierdo</option>
                          <option value="BIL">Bilateral</option>
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={!!e.reop}
                          onChange={(ev) =>
                            setCampoEvento(e.id, "reop", ev.target.checked)
                          }
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={e.compIntra}
                          onChange={(ev) =>
                            setCampoEvento(e.id, "compIntra", ev.target.value)
                          }
                          placeholder="p. ej., sangrado"
                          className={`w-full px-3 py-1 text-sm border rounded-md focus:outline-none ${
                            trimOrEmpty(e.compIntra)
                              ? "border-gray-300 focus:ring-2 focus:ring-blue-500"
                              : "border-red-300"
                          }`}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          {!e.fin && (
                            <button
                              onClick={() => terminarCirugia(e.id)}
                              className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              title="Marcar fin ahora"
                            >
                              <Clock className="h-4 w-4" />
                              Terminar
                            </button>
                          )}
                          <button
                            onClick={() => confirmarCirugia(e.id)}
                            disabled={!puedeConfirmar || savingId === e.id}
                            className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-md focus:outline-none focus:ring-2 ${
                              puedeConfirmar && savingId !== e.id
                                ? "text-white bg-green-600 hover:bg-green-700 focus:ring-green-500"
                                : "text-slate-400 bg-slate-100 cursor-not-allowed"
                            }`}
                            title={
                              puedeConfirmar
                                ? savingId === e.id
                                  ? "Guardando..."
                                  : "Confirmar y mover al registro"
                                : `Falta: ${missing.join(", ")}`
                            }
                          >
                            <CircleCheck className="h-4 w-4" />
                            {savingId === e.id ? "Guardando..." : "Confirmar"}
                          </button>
                          <button
                            onClick={() => eliminarCirugiaPendiente(e.id)}
                            className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
                            title="Eliminar (pendiente)"
                          >
                            <Trash2 className="h-4 w-4" />
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ───────────── Registro de cirugías (histórico) ───────────── */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 p-6 border-b border-gray-200">
          <History className="h-5 w-5 text-slate-700" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Registro de cirugías
            </h2>
            <p className="text-sm text-gray-600">
              Solo se muestran las confirmadas
            </p>
          </div>
        </div>

        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-700">
                  <th className="px-3 py-2 text-left">Fecha</th>
                  <th className="px-3 py-2 text-left">Inicio</th>
                  <th className="px-3 py-2 text-left">Fin</th>
                  <th className="px-3 py-2 text-left">Duración</th>
                  <th className="px-3 py-2 text-left">Técnica</th>
                  <th className="px-3 py-2 text-left">Lado</th>
                  <th className="px-3 py-2 text-left">Reop.</th>
                  <th className="px-3 py-2 text-left">Comp. Intraop</th>
                  <th className="px-3 py-2 text-left">Registrado el</th>
                </tr>
              </thead>
              <tbody>
                {registroQx.length === 0 ? (
                  <tr>
                    <td
                      className="px-3 py-6 text-center text-slate-500"
                      colSpan={10}
                    >
                      Sin registros aún.
                    </td>
                  </tr>
                ) : (
                  registroQx.map((r) => (
                    <tr key={r.id} className="border-b">
                      <td className="px-3 py-2">{r.fecha}</td>
                      <td className="px-3 py-2">{r.inicio}</td>
                      <td className="px-3 py-2">{r.fin}</td>
                      <td className="px-3 py-2">{r.duracion}</td>
                      <td className="px-3 py-2">{r.tecnica}</td>
                      <td className="px-3 py-2">{r.lado}</td>
                      <td className="px-3 py-2">{r.reop ? "Sí" : "No"}</td>
                      <td className="px-3 py-2">{r.compIntra}</td>
                      <td className="px-3 py-2">{r.registradoEn}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ───────────── Panel Suspensiones ───────────── */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-slate-700" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Suspensiones ({suspensiones.length})
              </h2>
              <p className="text-sm text-gray-600">
                Clínicas o administrativas con motivo
              </p>
            </div>
          </div>

          <button
            onClick={agregarSuspension}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Agregar"
          >
            <PlusCircle className="h-4 w-4" />
            Agregar
          </button>
        </div>

        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-700">
                  <th className="px-3 py-2 text-left">Fecha</th>
                  <th className="px-3 py-2 text-left">Tipo</th>
                  <th className="px-3 py-2 text-left">Motivo</th>
                  <th className="px-3 py-2 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {suspensiones.map((s) => (
                  <tr key={s.id} className="border-b">
                    <td className="px-3 py-2">
                      <input
                        type="date"
                        value={s.fecha}
                        onChange={(e) =>
                          setCampoSusp(s.id, "fecha", e.target.value)
                        }
                        className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={s.tipo}
                        onChange={(e) =>
                          setCampoSusp(
                            s.id,
                            "tipo",
                            e.target.value as Suspension["tipo"]
                          )
                        }
                        className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option>Clínica</option>
                        <option>Administrativa</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={s.motivo}
                        onChange={(e) =>
                          setCampoSusp(s.id, "motivo", e.target.value)
                        }
                        placeholder="Ej.: INR alto, sin pabellón"
                        className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => confirmarFila(s.id)}
                          className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <CircleCheck className="h-4 w-4" />
                          Confirmar
                        </button>
                        <button
                          onClick={() => eliminarFila(s.id)}
                          className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
                          title="Eliminar (pendiente)"
                        >
                          <Trash2 className="h-4 w-4" />
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ───────────── Registro de suspensiones ───────────── */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 p-6 border-b border-gray-200">
          <History className="h-5 w-5 text-slate-700" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Registro de suspensiones
            </h2>
            <p className="text-sm text-gray-600">
              Solo se muestran las confirmadas
            </p>
          </div>
        </div>

        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-700">
                  <th className="px-3 py-2 text-left">Fecha</th>
                  <th className="px-3 py-2 text-left">Tipo</th>
                  <th className="px-3 py-2 text-left">Motivo</th>
                  <th className="px-3 py-2 text-left">Registrado el</th>
                </tr>
              </thead>
              <tbody>
                {registroSusp.length === 0 ? (
                  <tr>
                    <td
                      className="px-3 py-6 text-center text-slate-500"
                      colSpan={5}
                    >
                      Sin registros aún.
                    </td>
                  </tr>
                ) : (
                  registroSusp.map((r) => (
                    <tr key={r.id} className="border-b">
                      <td className="px-3 py-2">{r.fecha}</td>
                      <td className="px-3 py-2">{r.tipo}</td>
                      <td className="px-3 py-2">{r.motivo}</td>
                      <td className="px-3 py-2">{r.registradoEn}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
