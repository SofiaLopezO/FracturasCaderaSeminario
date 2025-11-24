'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelectedPatient } from '@/contexts/SelectedPatientContext';

import { PatientSelectorDialog } from '@/components/Funcionario/PatientSelectorDialog';

export function RequirePatient({ children }: { children: React.ReactNode }) {
  const { patient, setPatient } = useSelectedPatient();
  const [open, setOpen] = useState(!patient);
  const router = useRouter();

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
            router.push('/fun');
          }}
        />
      </div>
    );
  }

  return <>{children}</>;
}
