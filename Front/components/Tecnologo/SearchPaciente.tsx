'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTecnologo } from '@/contexts/TecnologoContext';
import { Search, Loader2 } from 'lucide-react';

export default function SearchPaciente() {
  const { searching, results, searchPacientes, clearResults } = useTecnologo();
  const [q, setQ] = useState('');
  const router = useRouter();

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!q.trim()) {
      clearResults();
      return;
    }

    debounceRef.current = setTimeout(() => {
      void searchPacientes(q);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q, searchPacientes, clearResults]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) void searchPacientes(q);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="RUT o nombre/apellidos…"
            className="w-full rounded-xl border border-slate-200 py-2 pl-10 pr-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
        </div>
        <button
          type="submit"
          disabled={searching}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm hover:bg-slate-50"
        >
          {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Buscar'}
        </button>
      </div>

      {results.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {results.map((r) => {
            const nombre = [r.nombres, r.apellido_paterno, r.apellido_materno]
              .filter(Boolean)
              .join(' ');
            return (
              <button
                key={r.user_id}
                type="button"
                onClick={() => router.push(`/tecnologo/paciente/${r.user_id}`)}
                className="rounded-full border border-slate-200 px-3 py-1 text-sm bg-white hover:bg-blue-50"
                title={`${nombre || r.rut}`}
              >
                {nombre || r.rut}
              </button>
            );
          })}
        </div>
      )}
    </form>
  );
}
