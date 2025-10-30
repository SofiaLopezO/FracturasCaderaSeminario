'use client';

import { ArrowLeft } from 'lucide-react';

export default function ContactSupport({ onBack }: { onBack: () => void }) {
  return (
    <div className="max-w-md mx-auto w-full">
      <button onClick={onBack} className="group inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 mb-6">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition" /> Volver al login
      </button>

      <h2 className="text-3xl font-bold text-blue-900 mb-2 text-center">Soporte</h2>
      <p className="text-blue-700 text-center mb-6">Si tienes problemas para ingresar, escríbenos.</p>

      <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/60 space-y-3 text-sm text-blue-800">
        <div>
          <span className="font-medium text-blue-900">Correo: </span>
          <a className="text-blue-700 underline" href="mailto:soporte@hospital.cl">
            soporte@hospital.cl
          </a>
        </div>
        <div>
          <span className="font-medium text-blue-900">Teléfono: </span>
          +56 32 123 4567
        </div>
        <div>
          <span className="font-medium text-blue-900">Horario: </span>
          Lunes a Viernes, 08:00–17:00
        </div>
      </div>


    </div>
  );
}
