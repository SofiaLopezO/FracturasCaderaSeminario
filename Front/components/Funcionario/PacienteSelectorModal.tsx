"use client";
import { useFuncionario } from "@/contexts/FuncionarioContext";
import {useAuth} from "@/contexts/AuthContext";
import { useConfirmBackToLogin } from "@/hooks/useConfirmBackToLogin";
import PacienteSearch from "@/components/Funcionario/PacienteSearch";
import PacienteTable from "@/components/Funcionario/PacienteTable";

export default function PacienteSelectorModal() {
  const { filtrados, query, setQuery, setSeleccionado } = useFuncionario();
  const { logout } = useAuth();
  function handleselect(a: any) {
    //setSeleccionado(a);
    const fetchSelectPaciente = async () => {
      try {
        const user = localStorage.getItem("session_v1");
        const token = user ? JSON.parse(user).token : null;
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/pacientes/${a.user_id}/resumen`,
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
  }
  useConfirmBackToLogin(() => {
      logout();
    });
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 ">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <h2 className="text-lg md:text-xl font-semibold">
            Selecciona un paciente para continuar
          </h2>
        </div>

        {/* Contenido */}
        <div className="p-4 md:p-6 overflow-y-auto max-h-[calc(90vh-72px)]">
          <div className="grid grid-cols-1 xl:grid-cols-[360px,1fr] gap-6">
            <PacienteSearch
              value={query}
              onChange={setQuery}
              onOpen={(rut) => {
                const p = filtrados.find((x) => x.rut === rut);
                if (p) handleselect(p);
              }}
            />

            <PacienteTable
              pacientes={filtrados}
              q={query}
              onQChange={setQuery}
              onVerPerfil={(rut) => {
                const p = filtrados.find((x) => x.rut === rut);
                if (p) handleselect(p);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
