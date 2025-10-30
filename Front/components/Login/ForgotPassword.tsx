'use client';

import { useState } from 'react';
import { ArrowLeft, Mail, ShieldCheck } from 'lucide-react';

export default function ForgotPassword({ onBack }: { onBack: () => void }) {
  const [ident, setIdent] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    alert(`Enviamos un código a: ${ident}`);
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto w-full">
      <button onClick={onBack} className="group inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 mb-6">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition" /> Volver al login
      </button>

      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4 shadow-lg">
          <ShieldCheck className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-blue-900 mb-2">Recuperar contraseña</h2>
        <p className="text-blue-700">Ingresa tu correo y te enviaremos un código.</p>
      </div>

      <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/60">
        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-blue-900">RUT o correo</span>
            <div className="relative mt-1">
              <Mail className="h-5 w-5 text-blue-500 absolute left-3 top-3" />
              <input
              type= 'text'
              value={ident}
              onChange={(e) => setIdent(e.target.value)}
              placeholder="correo@ejemplo.cl"
              className="text-blue-600 w-full pl-10 pr-12 py-3 rounded-lg border border-blue-300 focus:ring-2 focus:ring-blue-500"
              required
            />
            </div>
          </label>
          <button className="w-full bg-blue-600 text-white font-semibold rounded-lg py-3 disabled:opacity-60" disabled={loading}>
            {loading ? 'Enviando…' : 'Enviar código'}
          </button>
        </form>
      </div>
    </div>
  );
}
