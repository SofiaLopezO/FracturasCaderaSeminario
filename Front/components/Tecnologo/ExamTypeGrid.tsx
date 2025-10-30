// components/Tecnologo/ExamTypeGrid.tsx
'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FlaskConical, Microscope, Image as ImageIcon, ChevronRight } from 'lucide-react';

type Card = { slug: string; title: string; desc: string; Icon: any };

const CARDS: Card[] = [
  { slug: 'biopsia',     title: 'Biopsias',   desc: 'Ingreso y resultados de anatomía patológica.', Icon: Microscope },
  { slug: 'laboratorio', title: 'Laboratorio', desc: 'Química, hematología, hormonas, etc.',       Icon: FlaskConical },
  { slug: 'rayosx',      title: 'Rayos X',     desc: 'Radiografías y adjuntos de imagen.',         Icon: ImageIcon },
];

export default function ExamTypeGrid() {
  const router = useRouter();
  const params = useParams<{ user_id: string }>();
  const uid = params?.user_id;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {CARDS.map(({ slug, title, desc, Icon }) => (
        <button
          key={slug}
          onClick={() => router.push(`/tecnologo/paciente/${uid}/${slug}`)}
          className="group rounded-2xl p-[1px] bg-gradient-to-r from-indigo-200/60 via-sky-200/60 to-emerald-200/60 text-left"
        >
          <div className="rounded-2xl bg-white p-4 h-full transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
                  <Icon className="h-5 w-5 text-blue-700" />
                </span>
                <h3 className="font-semibold text-slate-900">{title}</h3>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600" />
            </div>
            <p className="mt-2 text-sm text-slate-600">{desc}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
