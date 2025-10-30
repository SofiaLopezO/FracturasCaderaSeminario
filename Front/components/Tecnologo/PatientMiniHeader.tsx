// components/Tecnologo/PatientMiniHeader.tsx
'use client';

import React from 'react';
import { useTecnologo } from '@/contexts/TecnologoContext';

export default function PatientMiniHeader() {
  const { paciente } = useTecnologo();
  if (!paciente) return null;

  return (
    <div className="rounded-2xl p-[1px] bg-gradient-to-r from-indigo-200/60 via-sky-200/60 to-emerald-200/60">
      <div className="rounded-2xl bg-white/80 backdrop-blur p-4 shadow-sm">
        <div className="text-base md:text-lg font-semibold uppercase">{paciente.nombre_completo}</div>
        <div className="mt-1 text-sm text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
          <span>{paciente.rut}</span>
          <span>{paciente.sexo === 'F' ? 'Femenino' : paciente.sexo === 'M' ? 'Masculino' : '—'}</span>
          <span>{paciente.fecha_nacimiento ?? '—'}</span>
        </div>
      </div>
    </div>
  );
}
