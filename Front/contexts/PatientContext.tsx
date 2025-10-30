"use client";
import { useRouter } from "next/navigation";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { PacienteHeader, Examen } from "@/types/types";
import { useAuth } from "@/contexts/AuthContext";
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3001/api/v1";

type PatientContextType = {
  loading: boolean;
  error?: string | null;
  paciente?: PacienteHeader | null;
  examenes?: Examen[] | null;
  refresh: () => Promise<void>;
};

const PatientContext = createContext<PatientContextType>({
  loading: true,
  error: null,
  refresh: async () => {},
});

export const usePatient = () => useContext(PatientContext);
export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { logout } = useAuth();
  const data = localStorage.getItem("session_v1");
  const user = data ? JSON.parse(data).user : null;
  const token = data ? JSON.parse(data).token : null;
  const router = useRouter();
  const [paciente, setPaciente] = useState<PacienteHeader | null>(null);
  const [examenes, setExamenes] = useState<Examen[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetch_paciente = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (!user) {
      setError("No hay usuario autenticado");
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/pacientes/${user.id}/datos`,
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
      setPaciente(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch pacientes:", error);
      setLoading(false);
    }
  }, []);
  const fetch_examenes = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (!user) {
      setError("No hay usuario autenticado");
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/examenes/paciente/${user.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );
      if (response.status === 401) {
        //logout();
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
      setExamenes(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch pacientes:", error);
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetch_paciente();
    fetch_examenes();
  }, [fetch_paciente, fetch_examenes]);

  return (
    <PatientContext.Provider
      value={{ loading, error, paciente, examenes, refresh: fetch_examenes}}
    >
      {children}
    </PatientContext.Provider>
  );
};
