'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelectedPatient } from '@/contexts/SelectedPatientContext';

// ADAPTA este import a tu selector real
// Debe aceptar: open, onSelect(paciente), onCancel()
import { PatientSelectorDialog } from '@/components/Funcionario/PatientSelectorDialog';

export function RequirePatient({ children }: { children: React.ReactNode }) {
  const { patient, setPatient } = useSelectedPatient();
  const [open, setOpen] = useState(!patient);
  const router = useRouter();

  // Si no hay paciente, en lugar de cubrir toda la app, mostramos sólo el selector
  if (!patient) {
    return (
      <div className="p-6">
        <PatientSelectorDialog
          open={open}
          onSelect={(p) => {
            setPatient(p);
            setOpen(false);
          }}
          onCancel={() => {
            // Si cancela, lo llevamos a una ruta que NO requiere paciente
            router.push('/fun');
          }}
        />
      </div>
    );
  }

  return <>{children}</>;
}
