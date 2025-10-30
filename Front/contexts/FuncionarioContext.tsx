"use client";

import { createContext, useContext, useMemo, useState, useEffect } from "react";
import PacienteSelectorModal from "@/components/Funcionario/PacienteSelectorModal";
import { DetallesPaciente, Paciente } from "@/types/interfaces";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
type Ctx = {
  pacientes: Paciente[];
  query: string;
  setQuery: (v: string) => void;
  filtrados: Paciente[];
  seleccionado?: DetallesPaciente;
  setSeleccionado: (p?: DetallesPaciente) => void;
  reloadPacientes: () => void;
};

const FuncionarioCtx = createContext<Ctx | null>(null);

export function FuncionarioProvider({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [query, setQuery] = useState("");
  const [seleccionado, setSeleccionado] = useState<
    DetallesPaciente | undefined
  >();
  const router = useRouter();
  const { logout } = useAuth();
  const fetchPacientes = async () => {
    try {
      const user = localStorage.getItem("session_v1");
      const token = user ? JSON.parse(user).token : null;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/pacientes/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );
      if (response.status === 401) {
        logout();
        router.push("/login");
        console.error(
          "No autorizado: sesión expirada o credenciales inválidas."
        );
        return;
      }
      if (!response.ok) {
        throw new Error("Error fetching pacientes");
      }
      const data = await response.json();
      setPacientes(data);
    } catch (error) {
      console.error("Failed to fetch pacientes:", error);
    }
  };
  useEffect(() => {
    fetchPacientes();
  }, []);
  const reloadPacientes = () => {
    const fetchSelectPaciente = async () => {
      try {
        const user = localStorage.getItem("session_v1");
        const token = user ? JSON.parse(user).token : null;
        console.log("User ID:", user);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/pacientes/${seleccionado?.general.paciente_id}/resumen`,
          {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
          }
        );
        if (!response.ok) {
          console.error("Error al seleccionar paciente:", response.statusText);
          return;
        }
        const data = await response.json();
        setSeleccionado(data);
      } catch (error) {
        console.error("Failed to fetch pacientes:", error);
      }
    };
    fetchSelectPaciente();
  };
  const filtrados = useMemo(() => {
    const s = query.trim().toLowerCase();
    if (!s) return pacientes;
    return pacientes.filter(
      (p) =>
        p.rut.toLowerCase().includes(s) || p.nombres.toLowerCase().includes(s)
    );
  }, [query, pacientes]);

  const value = useMemo(
    () => ({
      pacientes,
      query,
      setQuery,
      filtrados,
      seleccionado,
      setSeleccionado,
      reloadPacientes,
    }),
    [pacientes, query, setQuery, filtrados, seleccionado, setSeleccionado]
  );
  return (
    <FuncionarioCtx.Provider value={value}>
      {!seleccionado ? (
        <>
          <div className="min-h-screen w-full bg-[#fafafa] relative text-gray-900">
            <div
              className="absolute inset-0 z-0 pointer-events-none"
              style={{
                backgroundImage: `
          repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.1) 0, rgba(0, 0, 0, 0.1) 1px, transparent 1px, transparent 20px),
        repeating-linear-gradient(-45deg, rgba(0, 0, 0, 0.1) 0, rgba(0, 0, 0, 0.1) 1px, transparent 1px, transparent 20px)
        `,
                backgroundSize: "40px 40px",
              }}
            />
          </div>
          <PacienteSelectorModal />
        </>
      ) : (
        children
      )}
    </FuncionarioCtx.Provider>
  );
}

export const useFuncionario = () => {
  const ctx = useContext(FuncionarioCtx);
  if (!ctx)
    throw new Error("useFuncionario debe usarse dentro de FuncionarioProvider");
  return ctx;
};
