'use client';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type SelectedPatient = {
  id: number;
  rut?: string;
  nombres?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
} | null;

type Ctx = {
  patient: SelectedPatient;
  setPatient: (p: SelectedPatient) => void;
  clear: () => void;
};

const CtxSelectedPatient = createContext<Ctx | undefined>(undefined);

export function SelectedPatientProvider({ children }: { children: React.ReactNode }) {
  const [patient, setPatientState] = useState<SelectedPatient>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('selectedPatient');
      if (raw) setPatientState(JSON.parse(raw));
    } catch { /* noop */ }
  }, []);

  const setPatient = useCallback((p: SelectedPatient) => {
    setPatientState(p);
    try {
      if (p) sessionStorage.setItem('selectedPatient', JSON.stringify(p));
      else sessionStorage.removeItem('selectedPatient');
    } catch { /* noop */ }
  }, []);

  const clear = useCallback(() => setPatient(null), [setPatient]);

  return (
    <CtxSelectedPatient.Provider value={{ patient, setPatient, clear }}>
      {children}
    </CtxSelectedPatient.Provider>
  );
}

export function useSelectedPatient() {
  const ctx = useContext(CtxSelectedPatient);
  if (!ctx) throw new Error('useSelectedPatient must be used within SelectedPatientProvider');
  return ctx;
}
