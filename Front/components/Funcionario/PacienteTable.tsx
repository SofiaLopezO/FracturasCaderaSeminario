'use client';
import { Search, Users } from 'lucide-react';
import type { Paciente } from '@/types/interfaces';
type Props = {
  readonly pacientes: readonly Paciente[];
  readonly q: string;
  readonly onQChange: (v: string) => void;
  readonly onVerPerfil: (rut: string) => void;
};

export default function PacienteTable({
  pacientes, q, onQChange, onVerPerfil,
}: Props) {
  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/60 flex flex-col min-h-0">
      <div className="flex items-center justify-between px-6 py-4 rounded-t-2xl bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200 sticky top-0">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-700" />
          <h2 className="text-blue-900 font-semibold">Mis Pacientes</h2>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-blue-600 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={q}
            onChange={(e) => onQChange(e.target.value)}
            placeholder="Buscar por RUT, nombre o apellidos…"
            className="bg-blue-100 text-blue-700 w-[320px] pl-9 pr-3 py-2 rounded-md border border-blue-300 focus:ring-2 focus:ring-blue-500 placeholder-blue-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-blue-100/90 backdrop-blur">
            <tr className="text-blue-900">
              <th className="text-left px-6 py-3 font-semibold">RUT</th>
              <th className="text-left px-6 py-3 font-semibold">Nombre</th>
              <th className="text-left px-6 py-3 font-semibold">Apellido Paterno</th>
              <th className="text-left px-6 py-3 font-semibold">Apellido Materno</th>
              
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody>
            {pacientes.map((p, i) => (
              <tr key={p.rut} className={i % 2 ? 'bg-blue-50/70' : 'bg-white/70'}>
                <td className="px-6 py-3 text-blue-900 rounded-l-lg">{p.rut}</td>
                <td className="px-6 py-3 text-blue-900">{p.nombres}</td>
                <td className="px-6 py-3 text-blue-900">{p.Apellido_Paterno}</td>
                <td className="px-6 py-3 text-blue-900">{p.Apellido_Materno}</td>
                
                <td className="px-6 py-3 text-righ rounded-r-lg">
                  <button
                    onClick={() => onVerPerfil(p.rut)}
                    className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md font-medium hover:-translate-y-0.5 hover:shadow transition"
                  >
                    Ver perfil
                  </button>
                </td>
              </tr>
            ))}
            {pacientes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-blue-700">
                  Sin resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
