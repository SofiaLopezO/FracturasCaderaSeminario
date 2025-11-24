'use client';

import { useEffect, useRef, useState } from 'react';
import { Droplet, ShieldCheck, X, Loader2, Info } from 'lucide-react';

type Props = {
    pacienteId: number | string;
    initialValue?: string | null;
    onSaved?: (nuevo: string) => void;
};

const TIPOS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

export default function BloodTypeSetter({
    pacienteId,
    initialValue,
    onSaved,
}: Props) {
    const [savedValue, setSavedValue] = useState<string | null>(
        initialValue ?? null
    );
    const [draftValue, setDraftValue] = useState<string | null>(null);

    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const modalRef = useRef<HTMLDivElement | null>(null);

    const apiBase =
        process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3001/api/v1';
    const readOnly = !!savedValue?.trim();

    const openModal = () => {
        setDraftValue(savedValue ?? null);
        setError(null);
        setOpen(true);
    };

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) =>
            e.key === 'Escape' && !saving && setOpen(false);
        const onClick = (e: MouseEvent) => {
            if (!modalRef.current || saving) return;
            if (!modalRef.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('keydown', onKey);
        document.addEventListener('mousedown', onClick);
        return () => {
            document.removeEventListener('keydown', onKey);
            document.removeEventListener('mousedown', onClick);
        };
    }, [open, saving]);

    const updateTipoSangre = async (
        userId: number | string,
        tipoSangre: string,
        token?: string | null
    ) => {
        const numericId =
            typeof userId === 'string' ? parseInt(userId, 10) : userId;
        if (!numericId || numericId <= 0 || isNaN(numericId)) {
            throw new Error('ID de paciente inválido');
        }

        const resp = await fetch(`${apiBase}/pacientes/${numericId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ tipo_sangre: tipoSangre }),
            credentials: 'include',
        });
        if (!resp.ok) {
            const msg =
                (await resp.json().catch(() => null))?.error ||
                `HTTP ${resp.status}`;
            throw new Error(msg);
        }
        return await resp.json();
    };

    return (
        <>
            {readOnly ? (
                <span
                    className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium
                     bg-emerald-50/80 text-emerald-700 border-emerald-200 shadow-sm'
                    title='Tipo de sangre (definido)'
                >
                    <ShieldCheck className='w-4 h-4' />
                    {savedValue}
                </span>
            ) : (
                <button
                    type='button'
                    onClick={openModal}
                    className='inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium
                     border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors'
                    title='Definir tipo de sangre (acción única)'
                >
                    <Droplet className='w-4 h-4' />
                    Definir tipo de sangre
                </button>
            )}

            {open && (
                <div
                    className='fixed inset-0 z-[100] flex items-center justify-center p-4
                        bg-black/40 backdrop-blur-sm animate-[fadeIn_.15s_ease-out]'
                >
                    <div
                        ref={modalRef}
                        className='w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl'
                    >
                        {/* Header */}
                        <div className='relative'>
                            <div className='h-20 w-full bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600' />
                            <div className='absolute inset-x-0 top-0 h-20 flex items-center justify-between px-5'>
                                <div className='flex items-center gap-3 text-white'>
                                    <span className='grid place-items-center w-9 h-9 rounded-xl bg-white/10 backdrop-blur'>
                                        <Droplet className='w-5 h-5' />
                                    </span>
                                    <div>
                                        <h3 className='text-lg font-semibold leading-tight'>
                                            Asignar tipo de sangre
                                        </h3>
                                        <p className='text-white/80 text-xs'>
                                            Acción única — quedará bloqueado
                                            tras guardar
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type='button'
                                    onClick={() => !saving && setOpen(false)}
                                    className='p-2 rounded-xl text-white/90 hover:bg-white/10'
                                    title='Cerrar'
                                >
                                    <X className='w-5 h-5' />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className='px-5 py-5 space-y-4'>
                            <div className='flex items-start gap-2 text-slate-600 text-sm'>
                                <Info className='w-4 h-4 mt-0.5 text-slate-500' />
                                <p>
                                    Verifica la documentación de origen antes de
                                    guardar. Una vez confirmado, este valor no
                                    podrá modificarse desde la interfaz.
                                </p>
                            </div>

                            {/* Píldoras */}
                            <div className='space-y-2'>
                                <span className='text-sm font-medium text-slate-700'>
                                    Selecciona un tipo
                                </span>
                                <div className='grid grid-cols-4 gap-2'>
                                    {TIPOS.map((t) => {
                                        const selected = draftValue === t;
                                        return (
                                            <button
                                                key={t}
                                                type='button'
                                                onClick={() => setDraftValue(t)}
                                                className={`group relative w-full rounded-xl px-3 py-2 text-sm font-semibold
                                   border transition-all
                                   ${
                                       selected
                                           ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-[0_0_0_2px_rgba(37,99,235,0.15)]'
                                           : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                   }`}
                                                aria-pressed={selected}
                                            >
                                                {t}
                                                {selected && (
                                                    <span className='absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-600' />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {error && (
                                <div className='text-sm text-rose-600'>
                                    {error}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className='px-5 py-4 bg-slate-50 border-t flex items-center justify-end gap-2'>
                            <button
                                type='button'
                                onClick={() => !saving && setOpen(false)}
                                className='px-4 py-2 text-sm rounded-lg border bg-white hover:bg-slate-50'
                                disabled={saving}
                            >
                                Cancelar
                            </button>
                            <button
                                type='button'
                                disabled={saving || !draftValue}
                                onClick={async () => {
                                    if (!draftValue) {
                                        setError(
                                            'Selecciona un tipo de sangre.'
                                        );
                                        return;
                                    }
                                    setError(null);
                                    setSaving(true);
                                    try {
                                        const session =
                                            localStorage.getItem('session_v1');
                                        const token = session
                                            ? JSON.parse(session).token
                                            : null;
                                        await updateTipoSangre(
                                            pacienteId,
                                            draftValue,
                                            token
                                        );
                                        setSavedValue(draftValue); // ahora sí queda bloqueado
                                        onSaved?.(draftValue);
                                        setSaving(false);
                                        setOpen(false);
                                    } catch (e: any) {
                                        setSaving(false);
                                        setError(
                                            e?.message ||
                                                'No fue posible guardar el tipo de sangre.'
                                        );
                                    }
                                }}
                                className='inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg
                           bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60'
                            >
                                {saving ? (
                                    <Loader2 className='w-4 h-4 animate-spin' />
                                ) : null}
                                Guardar y bloquear
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
