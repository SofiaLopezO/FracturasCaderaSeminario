'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelectedPatient } from '@/contexts/SelectedPatientContext';

import PacienteSelectorModal from '@/components/Funcionario/PacienteSelectorModal';

export function RequirePatient({ children }: { children: React.ReactNode }) {
  const { patient, setPatient } = useSelectedPatient();
  const [open, setOpen] = useState(!patient);
  const router = useRouter();

  if (!patient) {
    return (
      <div className="p-6">
        <PacienteSelectorModal />
      </div>
    );
  }

  return <>{children}</>;
}
