'use client';

import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
    ClipboardList,
    AlertTriangle,
    Activity,
    Hospital,
    HeartPulse,
    Calendar,
    Cigarette,
    Wine,
    Pill,
    Droplet,
    Clock,
    ChevronDown,
    X,
    CircleCheck,
    FileText,
} from 'lucide-react';
import { Switch } from '@/components/ui/Switch';
import { useFuncionario } from '@/contexts/FuncionarioContext';
const sessionRaw = localStorage.getItem('session_v1');

const user = sessionRaw ? JSON.parse(sessionRaw).user.id : null;

function cieToTipo(cie: string): string {
    switch (cie) {
        case 'S72.0':
            return 'Intracapsular';
        case 'S72.1':
            return 'Pertrocantérica';
        case 'S72.2':
            return 'Subtrocantérica';
        default:
            return 'No especificado';
    }
}
const fmtCL = (iso?: string) =>
    iso
        ? new Date(iso).toLocaleString('es-CL', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
          })
        : '';
const fmtDateInput = (iso?: string) =>
    iso
        ? new Date(iso).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10);

/* ---------------- UI minis ---------------- */
function Card({
    children,
    className = '',
}: Readonly<{ children: React.ReactNode; className?: string }>) {
    return (
        <div
            className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden ${className}`}
        >
            {children}
        </div>
    );
}

function CardHeader({
    children,
    className = '',
}: Readonly<{ children: React.ReactNode; className?: string }>) {
    return <div className={`p-6 pb-4 ${className}`}>{children}</div>;
}

function CardContent({
    children,
    className = '',
}: Readonly<{ children: React.ReactNode; className?: string }>) {
    return <div className={`px-6 pb-6 ${className}`}>{children}</div>;
}

function CardTitle({ children }: Readonly<{ children: React.ReactNode }>) {
    return <h3 className='text-lg font-semibold text-gray-900'>{children}</h3>;
}
function CardDescription({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return <p className='text-sm text-gray-600 mt-1'>{children}</p>;
}
function Button({
    children,
    onClick,
    variant = 'default',
    className = '',
    disabled = false,
}: Readonly<{
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'default' | 'secondary' | 'ghost';
    className?: string;
    disabled?: boolean;
}>) {
    const base =
        'inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
    const variants = {
        default: 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60',
        secondary:
            'bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:opacity-60',
        ghost: 'text-gray-600 hover:bg-gray-100 disabled:opacity-60',
    };
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${base} ${variants[variant]} ${className}`}
        >
            {children}
        </button>
    );
}
function Input({
    type = 'text',
    value,
    onChange,
    placeholder,
    className = '',
    disabled = false,
    min,
    required,
}: Readonly<{
    type?: string;
    value?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    min?: number | string;
    required?: boolean;
}>) {
    return (
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            min={min}
            required={required}
            className={
                'w-full h-10 px-3 py-2 border border-gray-300 rounded-md text-sm ' +
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ' +
                'disabled:bg-gray-50 disabled:text-gray-500 leading-none ' +
                className
            }
        />
    );
}
function Textarea({
    value,
    onChange,
    placeholder,
    disabled = false,
    className = '',
}: Readonly<{
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}>) {
    return (
        <textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            rows={3}
            className={
                'w-full px-3 py-2 border border-gray-300 rounded-md text-sm ' +
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ' +
                'disabled:bg-gray-50 disabled:text-gray-500 ' +
                'resize-none min-h-[112px] leading-tight ' +
                className
            }
        />
    );
}
function Label({
    children,
    className = '',
}: Readonly<{ children: React.ReactNode; className?: string }>) {
    return (
        <label className={`text-sm font-medium text-gray-700 ${className}`}>
            {children}
        </label>
    );
}
function Select({
    value,
    onValueChange,
    children,
    disabled = false,
}: Readonly<{
    value?: string;
    onValueChange?: (value: string) => void;
    children: React.ReactNode;
    disabled?: boolean;
}>) {
    return (
        <div className='relative'>
            <select
                value={value}
                disabled={disabled}
                onChange={(e) => onValueChange?.(e.target.value)}
                className='w-full h-10 px-3 py-2 pr-8 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none disabled:bg-gray-50 disabled:text-gray-500'
            >
                {children}
            </select>
            <ChevronDown className='absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none' />
        </div>
    );
}
function SelectItem({
    value,
    children,
}: Readonly<{ value: string; children: React.ReactNode }>) {
    return <option value={value}>{children}</option>;
}
function Field({
    label,
    children,
}: Readonly<{ label: string; children: React.ReactNode }>) {
    return (
        <div className='grid gap-2'>
            <Label>{label}</Label>
            {children}
        </div>
    );
}
function HabitRow({
    icon,
    label,
    value,
    onChange,
    disabled = false,
}: Readonly<{
    icon: React.ReactNode;
    label: string;
    value: boolean;
    onChange: (value: boolean) => void;
    disabled?: boolean;
}>) {
    return (
        <div className='flex items-center justify-between p-3 rounded-lg border'>
            <div className='flex items-center justify-between gap-3'>
                {icon}
                <Label>{label}</Label>
            </div>
            <Switch
                checked={value}
                onCheckedChange={onChange}
                size='sm'
                color='primary'
                disabled={disabled}
            />
        </div>
    );
}
function CardHeaderWithIcon({
    icon,
    title,
    subtitle,
    right,
}: Readonly<{
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    right?: React.ReactNode;
}>) {
    return (
        <CardHeader>
            <div className='flex items-start justify-between gap-3'>
                <div className='flex items-center gap-3'>
                    <div className='rounded-xl bg-slate-100 p-2 text-slate-700'>
                        {icon}
                    </div>
                    <div>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>{subtitle}</CardDescription>
                    </div>
                </div>
                {right}
            </div>
        </CardHeader>
    );
}

/* ---------------- Main ---------------- */
export default function MedicinaPage() {
    const { seleccionado, reloadPacientes } = useFuncionario();
    const episodios = useMemo<any[]>(
        () => ((seleccionado?.registro_controles as any) ?? []) as any[],
        [seleccionado]
    );
    console.log('Episodios:', seleccionado?.general.dx_actual);
    const episodioActual = seleccionado?.general.dx_actual;
    const ESTADO =
        Number(seleccionado?.general.dx_actual?.es_episodio) !== 2 &&
        seleccionado?.general.dx_actual?.es_episodio !== null;
    // UI: estados auxiliares
    const [showNuevoControl, setShowNuevoControl] = useState(false);

    // diagnóstico (controlado)
    const [dx, setDx] = useState<any>(() => {
        let base: any = {};
        if (ESTADO) {
            base = episodioActual ?? {
                cie10: 'S72.1',
                lado: 'Derecho',
                procedencia: 'Urgencia',
                fecha_diagnostico: new Date().toISOString().split('T')[0],
                notas_clinicas: '',
            };
        } else {
            base = {
                cie10: 'S72.1',
                lado: 'Derecho',
                procedencia: 'Urgencia',
                fecha_diagnostico: new Date().toISOString().split('T')[0],
                notas_clinicas: '',
            };
        }
        return { ...base, tipo_fractura: cieToTipo(base.cie10 ?? 'S72.1') };
    });
    useEffect(() => {
        setDx((prev: any) => ({
            ...prev,
            tipo_fractura: cieToTipo(prev.cie10),
        }));
    }, [dx.cie10]);

    // controles (sólo lectura aquí)
    const controles = seleccionado?.registro_controles ?? [];
    const ordenados = [...controles].sort((a, b) =>
        b.fecha_hora.localeCompare(a.fecha_hora)
    );
    const comorbOptions = [
        'DM2',
        'EPOC',
        'ERC',
        'ECV/ACV',
        'Parkinson',
        'Epilepsia',
    ];
    const toggleIn = (arr: string[], val: string) =>
        arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

    // “Agregar control” (UI)
    type ControlTipo = 'Seguimiento' | 'Interconsulta' | 'Alta' | 'otro';
    const CONTROL_TIPOS: ControlTipo[] = [
        'Seguimiento',
        'Interconsulta',
        'Alta',
        'otro',
    ];

    const [nuevo, setNuevo] = useState<any>({
        tipo: 'Inicial' as ControlTipo,
        notas: '',
        proximo_control: '',
        // secciones dentro del modal
        habitos: {
            tabaco: false,
            alcohol: false,
            corticoides_cronicos: false,
            taco: false,
            otro: '',
        },
        peso: seleccionado?.general?.peso ?? '',
        altura: seleccionado?.general?.altura ?? '',
        prequirurgicas: '',
        postquirurgicas: '',
        evolucion_coment: '',
        transfusion: false,
        reingreso30: false,
        comorbilidades: [] as string[],
    });
    /* ---------------- render ---------------- */
    /* ---------------- API (stub de ejemplo) ---------------- */
    async function saveEpisodio(payload: any) {
        try {
            const user = localStorage.getItem('session_v1');
            const token = user ? JSON.parse(user).token : null;
            console.log('Saving episodio with payload:', payload);
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE}/episodios/`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: token ? `Bearer ${token}` : '',
                    },
                    body: JSON.stringify(payload),
                }
            );
            if (!response.ok) {
                console.error(
                    'Error al guardar episodio:',
                    response.statusText
                );
                alert('No se pudo guardar el episodio. Revisa la consola.');
                return;
            }
            alert('Episodio guardado correctamente.');
            reloadPacientes();
            console.log('Response:', seleccionado);
        } catch (error) {
            console.error('Failed to POST /episodios:', error);
        }
    }
    async function saveControl(payload: any) {
        try {
            const user = localStorage.getItem('session_v1');
            const token = user ? JSON.parse(user).token : null;
            console.log('Saving episodio with payload:', payload);
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE}/controles/`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: token ? `Bearer ${token}` : '',
                    },
                    body: JSON.stringify(payload),
                }
            );
            if (!response.ok) {
                console.error('Error al guardar control:', response.statusText);
                alert('No se pudo guardar el control. Revisa la consola.');
                return;
            }
            alert('Control guardado correctamente.');
            reloadPacientes();
        } catch (error) {
            console.error('Failed to POST /controles:', error);
        }
    }
    return (
        <div className='p-6 max-w-7xl mx-auto'>
            {/* Header */}
            <div className='mb-6'>
                <h1 className='text-3xl font-bold text-slate-900'>
                    Antecedentes Médicos
                </h1>
                <p className='text-slate-600 mt-2'>
                    Registro del diagnóstico y controles del paciente
                </p>
            </div>

            {/* Barra superior: Episodio en curso */}
            <div className='mb-4'>
                <Card>
                    <CardContent className='px-4 py-3 sm:px-6'>
                        <div className='flex flex-wrap items-center justify-between gap-3'>
                            <div className='flex flex-wrap items-center gap-x-4 gap-y-2 text-sm'>
                                <span
                                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-white ${
                                        ESTADO
                                            ? 'bg-emerald-600'
                                            : 'bg-slate-500'
                                    }`}
                                >
                                    <span className='h-2 w-2 rounded-full bg-white/90' />
                                    Episodio {ESTADO ? 'Activo' : 'Cerrado'}
                                    {episodioActual?.episodio_id
                                        ? ` · #${episodioActual.episodio_id}`
                                        : ''}
                                </span>

                                <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-700'>
                                    <span>
                                        <span className='text-slate-500'>
                                            CIE-10:
                                        </span>{' '}
                                        <b>
                                            {episodioActual?.cie10 ?? dx.cie10}
                                        </b>
                                    </span>
                                    <span className='text-slate-400'>•</span>
                                    <span>
                                        <span className='text-slate-500'>
                                            Lado:
                                        </span>{' '}
                                        <b>{episodioActual?.lado ?? dx.lado}</b>
                                    </span>
                                    <span className='text-slate-400'>•</span>
                                    <span>
                                        <span className='text-slate-500'>
                                            Fecha:
                                        </span>{' '}
                                        <b>
                                            {fmtCL(
                                                episodioActual?.fecha_diagnostico ??
                                                    dx.fecha_diagnostico
                                            )}
                                        </b>
                                    </span>
                                </div>
                            </div>

                            <div className='flex flex-wrap items-center gap-2'>
                                <Button
                                    variant='secondary'
                                    onClick={() => {
                                        const inicial =
                                            seleccionado?.general?.dx_actual
                                                ?.habitos?.tabaco == null
                                                ? 'Inicial'
                                                : CONTROL_TIPOS[0];
                                        setNuevo((n: any) => ({ ...n, tipo: inicial }));
                                        setShowNuevoControl(true);
                                    }}
                                    disabled={
                                        // Habilitar solo cuando: es_episodio === 0 o 1 AND episodio_id != null
                                        !(
                                            (Number(
                                                seleccionado?.general?.dx_actual
                                                    ?.es_episodio
                                            ) === 0 ||
                                                Number(
                                                    seleccionado?.general
                                                        ?.dx_actual?.es_episodio
                                                ) === 1) &&
                                            seleccionado?.general?.dx_actual
                                                ?.episodio_id != null
                                        )
                                    }
                                >
                                    + Agregar control
                                </Button>
                                <Button
                                    onClick={() =>
                                        alert('Implementa cierre en backend')
                                    }
                                    disabled={
                                        !(
                                            (Number(
                                                seleccionado?.general?.dx_actual
                                                    ?.es_episodio
                                            ) === 0 ||
                                                Number(
                                                    seleccionado?.general
                                                        ?.dx_actual?.es_episodio
                                                ) === 1) &&
                                            seleccionado?.general?.dx_actual
                                                ?.episodio_id != null
                                        )
                                    }
                                >
                                    Cerrar episodio
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Secciones principales SOLO con Diagnóstico + Registro */}
            <div className='grid grid-cols-1 gap-6'>
                {/* Diagnóstico */}
                <Card>
                    <CardHeaderWithIcon
                        icon={<ClipboardList className='h-5 w-5' />}
                        title='Diagnóstico'
                        subtitle='Registrar/actualizar el diagnóstico y notas clínicas de admisión'
                        right={
                            <span className='text-xs text-slate-500'>
                                Tipo: {dx.tipo_fractura}
                            </span>
                        }
                    />
                    <CardContent>
                        <div className='grid md:grid-cols-2 gap-4'>
                            <Field label='CIE-10 (tipo de fractura)'>
                                <Select
                                    value={dx.cie10}
                                    onValueChange={(v) =>
                                        setDx({ ...dx, cie10: v })
                                    }
                                    disabled={ESTADO}
                                >
                                    <SelectItem value='S72.0'>
                                        S72.0 — Intracapsular
                                    </SelectItem>
                                    <SelectItem value='S72.1'>
                                        S72.1 — Pertrocantérica
                                    </SelectItem>
                                    <SelectItem value='S72.2'>
                                        S72.2 — Subtrocantérica
                                    </SelectItem>
                                </Select>
                            </Field>
                            <Field label='Lado de la fractura'>
                                <Select
                                    value={dx.lado}
                                    onValueChange={(v) =>
                                        setDx({ ...dx, lado: v })
                                    }
                                    disabled={ESTADO}
                                >
                                    <SelectItem value='Derecho'>
                                        Derecho
                                    </SelectItem>
                                    <SelectItem value='Izquierdo'>
                                        Izquierdo
                                    </SelectItem>
                                    <SelectItem value='Bilateral'>
                                        Bilateral
                                    </SelectItem>
                                </Select>
                            </Field>
                            <Field label='Procedencia'>
                                <Select
                                    value={dx.procedencia}
                                    onValueChange={(v) =>
                                        setDx({ ...dx, procedencia: v })
                                    }
                                    disabled={ESTADO}
                                >
                                    <SelectItem value='Urgencia'>
                                        Urgencia
                                    </SelectItem>
                                    <SelectItem value='Derivación APS'>
                                        Derivación APS
                                    </SelectItem>
                                    <SelectItem value='Otro centro'>
                                        Otro centro
                                    </SelectItem>
                                </Select>
                            </Field>
                            <Field label='Fecha del diagnóstico'>
                                <Input
                                    type='date'
                                    value={fmtDateInput(dx.fecha_diagnostico)}
                                    onChange={(e) =>
                                        setDx({
                                            ...dx,
                                            fecha_diagnostico: e.target.value,
                                        })
                                    }
                                    disabled={ESTADO}
                                />
                            </Field>
                            <div className='md:col-span-2'>
                                <Field label='Notas clínicas'>
                                    <Textarea
                                        value={dx.notas_clinicas}
                                        onChange={(e) =>
                                            setDx({
                                                ...dx,
                                                notas_clinicas: e.target.value,
                                            })
                                        }
                                        placeholder='Hallazgos relevantes al ingreso, dolor, movilidad, riesgo...'
                                        disabled={ESTADO}
                                    />
                                </Field>
                            </div>
                        </div>

                        {/* Historial compacto del diagnóstico (si existe) */}
                        {(() => {
                            const hist = ((seleccionado?.general as any)
                                ?.historial_diagnosticos ?? []) as any[];
                            if (!Array.isArray(hist) || hist.length === 0)
                                return null;
                            return (
                                <div className='mt-4'>
                                    <Label className='mb-2 block'>
                                        Historial de diagnósticos
                                    </Label>
                                    <div className='overflow-x-auto rounded-lg border'>
                                        <table className='min-w-full text-sm'>
                                            <thead>
                                                <tr className='bg-slate-100 text-slate-700'>
                                                    <th className='px-3 py-2 text-left'>
                                                        Fecha
                                                    </th>
                                                    <th className='px-3 py-2 text-left'>
                                                        CIE-10
                                                    </th>
                                                    <th className='px-3 py-2 text-left'>
                                                        Lado
                                                    </th>
                                                    <th className='px-3 py-2 text-left'>
                                                        Estado
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {hist.map((d) => (
                                                    <tr
                                                        key={d.id}
                                                        className='border-t'
                                                    >
                                                        <td className='px-3 py-2'>
                                                            {fmtCL(
                                                                d.fecha_diagnostico
                                                            )}
                                                        </td>
                                                        <td className='px-3 py-2'>
                                                            {d.cie10}
                                                        </td>
                                                        <td className='px-3 py-2'>
                                                            {d.lado}
                                                        </td>
                                                        <td className='px-3 py-2'>
                                                            <span
                                                                className={`px-2 py-0.5 rounded-full text-xs shadow-sm ${
                                                                    d.estado ===
                                                                    'ACTIVO'
                                                                        ? 'bg-emerald-100 text-emerald-700'
                                                                        : d.estado ===
                                                                          'CERRADO'
                                                                        ? 'bg-slate-200 text-slate-700'
                                                                        : 'bg-amber-100 text-amber-700'
                                                                }`}
                                                            >
                                                                {d.estado}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Footer acciones del diagnóstico */}
                        <div className='mt-4 pt-4 border-t flex justify-end gap-2'>
                            <Button
                                onClick={() =>
                                    saveEpisodio({
                                        paciente_id:
                                            seleccionado?.general?.paciente_id,
                                        episodio_id:
                                            episodioActual?.episodio_id ?? null,
                                        cie10: dx.cie10,
                                        tipo_fractura: dx.tipo_fractura,
                                        lado: (dx.lado ?? '').toUpperCase(),
                                        procedencia: dx.procedencia,
                                        fecha_diagnostico: dx.fecha_diagnostico,
                                        notas_clinicas: dx.notas_clinicas,
                                    })
                                }
                                disabled={
                                    !(
                                        (seleccionado?.general?.dx_actual
                                            ?.episodio_id == null &&
                                            seleccionado?.general?.dx_actual
                                                ?.es_episodio == null) ||
                                        Number(
                                            seleccionado?.general?.dx_actual
                                                ?.es_episodio
                                        ) === 2
                                    )
                                }
                            >
                                <CircleCheck className='h-4 w-4' />
                                Guardar diagnóstico
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Registro de controles */}
                <Card>
                    <CardHeaderWithIcon
                        icon={<Calendar className='h-5 w-5' />}
                        title='Registro de diagnosticos'
                        subtitle='Vista rapida de los diagnosticos previos del paciente'
                    />
                    <CardContent>
                        <div className='overflow-x-auto'>
                            <table className='min-w-full text-sm'>
                                <thead>
                                    <tr className='bg-slate-100 text-slate-700'>
                                        <th className='px-3 py-2 text-left'>
                                            Fecha y hora
                                        </th>
                                        <th className='px-3 py-2 text-left'>
                                            Diagnóstico
                                        </th>
                                        <th className='px-3 py-2 text-left'>
                                            Tipo de fractura
                                        </th>
                                        <th className='px-3 py-2 text-left'>
                                            Lado
                                        </th>
                                        <th className='px-3 py-2 text-left'>
                                            Procedencia
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {episodios.map(
                                        (e: any, i: number, arr: any[]) => (
                                            <tr
                                                key={`${e.episodio_id}-${i}`}
                                                className='border-b'
                                            >
                                                <td className='px-3 py-2'>
                                                    {e.fecha_hora
                                                        ? fmtCL(e.fecha_hora)
                                                        : '—'}
                                                </td>
                                                <td className='px-3 py-2'>
                                                    {e.notas_clinicas?.length >
                                                    34
                                                        ? e.notas_clinicas.slice(
                                                              0,
                                                              34
                                                          ) + '…'
                                                        : e.notas_clinicas}
                                                </td>
                                                <td className='px-3 py-2'>
                                                    {e.tipo_fractura}
                                                </td>
                                                <td className='px-3 py-2'>
                                                    {e.lado}
                                                </td>
                                                <td className='px-3 py-2'>
                                                    {e.origen}
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* -------- Modal: Nuevo control -------- */}
                {showNuevoControl && (
                    <div
                        className='fixed inset-0 z-50 bg-black/30 p-4 overflow-y-auto'
                        onClick={(e) => {
                            if (e.target === e.currentTarget)
                                setShowNuevoControl(false); // clic fuera cierra
                        }}
                    >
                        <Card className='mx-auto my-6 w-full max-w-3xl max-h-[90vh] flex flex-col'>
                            <CardHeader className='flex items-center justify-between'>
                                <div>
                                    <CardTitle>Nuevo control</CardTitle>
                                    <CardDescription>
                                        Registra la revisión y los cambios
                                    </CardDescription>
                                </div>
                                <button
                                    className='p-2 rounded-md hover:bg-slate-100'
                                    onClick={() => setShowNuevoControl(false)}
                                >
                                    <X className='h-5 w-5' />
                                </button>
                            </CardHeader>

                            {/* Contenido scrollable del modal */}
                            <CardContent className='flex-1 overflow-y-auto'>
                                <div className='grid md:grid-cols-2 gap-4 mb-4'>
                                    <Field label='Peso'>
                                        <Input
                                            type='number'
                                            value={
                                                nuevo.peso ??
                                                seleccionado?.general?.peso ??
                                                ''
                                            }
                                            onChange={(e) =>
                                                setNuevo({
                                                    ...nuevo,
                                                    peso: e.target.value,
                                                })
                                            }
                                            min={0}
                                            required
                                            placeholder='kg'
                                        />
                                    </Field>

                                    <Field label='Altura'>
                                        <Input
                                            type='number'
                                            value={
                                                nuevo.altura ??
                                                seleccionado?.general?.altura ??
                                                ''
                                            }
                                            onChange={(e) =>
                                                setNuevo({
                                                    ...nuevo,
                                                    altura: e.target.value,
                                                })
                                            }
                                            min={0}
                                            required
                                            placeholder='cm'
                                        />
                                    </Field>
                                </div>
                                {/* cabecera */}
                                <div className='grid md:grid-cols-2 gap-4'>
                                    <Field label='Tipo de control'>
                                        <Select
                                            value={nuevo.tipo}
                                            onValueChange={(v) =>
                                                setNuevo({ ...nuevo, tipo: v })
                                            }
                                            disabled={Number(seleccionado?.general?.dx_actual?.es_episodio) !== 1}
                                        >
                                            {seleccionado?.general?.dx_actual
                                                ?.habitos?.tabaco == null ? (
                                                <SelectItem
                                                    key='Inicial'
                                                    value='Inicial'
                                                >
                                                    Inicial
                                                </SelectItem>
                                            ) : (
                                                CONTROL_TIPOS.map((t) => (
                                                    <SelectItem
                                                        key={t}
                                                        value={t}
                                                    >
                                                        {t}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </Select>
                                    </Field>

                                    <Field label='Próximo control (opcional)'>
                                        <Input
                                            type='datetime-local'
                                            value={nuevo.proximo_control ?? ''}
                                            onChange={(e) =>
                                                setNuevo({
                                                    ...nuevo,
                                                    proximo_control:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                    </Field>

                                    <div className='md:col-span-2'>
                                        <Field label='Resumen de la atención'>
                                            <Textarea
                                                value={nuevo.notas}
                                                onChange={(e) =>
                                                    setNuevo({
                                                        ...nuevo,
                                                        notas: e.target.value,
                                                    })
                                                }
                                                placeholder='Dolor controlado, ajustar analgésicos, iniciar rehabilitación...'
                                            />
                                        </Field>
                                    </div>
                                </div>

                                {/* secciones trasladadas */}
                                <div className='mt-6 grid lg:grid-cols-2 gap-4'>
                                    {/* Hábitos */}
                                    <Card className='border-slate-200'>
                                        <CardHeaderWithIcon
                                            icon={
                                                <Activity className='h-5 w-5' />
                                            }
                                            title='Hábitos'
                                            subtitle='Cambios relevantes'
                                        />
                                        <CardContent>
                                            <div className='grid gap-2'>
                                                <HabitRow
                                                    icon={
                                                        <Cigarette size={20} />
                                                    }
                                                    label='Tabaco'
                                                    value={nuevo.habitos.tabaco}
                                                    onChange={(v) =>
                                                        setNuevo({
                                                            ...nuevo,
                                                            habitos: {
                                                                ...nuevo.habitos,
                                                                tabaco: v,
                                                            },
                                                        })
                                                    }
                                                />
                                                <HabitRow
                                                    icon={<Wine size={20} />}
                                                    label='Alcohol'
                                                    value={
                                                        nuevo.habitos.alcohol
                                                    }
                                                    onChange={(v) =>
                                                        setNuevo({
                                                            ...nuevo,
                                                            habitos: {
                                                                ...nuevo.habitos,
                                                                alcohol: v,
                                                            },
                                                        })
                                                    }
                                                />
                                                <HabitRow
                                                    icon={<Pill size={20} />}
                                                    label='Corticoides crónicos'
                                                    value={
                                                        nuevo.habitos
                                                            .corticoides_cronicos
                                                    }
                                                    onChange={(v) =>
                                                        setNuevo({
                                                            ...nuevo,
                                                            habitos: {
                                                                ...nuevo.habitos,
                                                                corticoides_cronicos:
                                                                    v,
                                                            },
                                                        })
                                                    }
                                                />
                                                <HabitRow
                                                    icon={<Droplet size={20} />}
                                                    label='Anticoagulantes orales (TACO)'
                                                    value={nuevo.habitos.taco}
                                                    onChange={(v) =>
                                                        setNuevo({
                                                            ...nuevo,
                                                            habitos: {
                                                                ...nuevo.habitos,
                                                                taco: v,
                                                            },
                                                        })
                                                    }
                                                />
                                                {/* Campo 'Otro' como cuadro de texto */}
                                                <div className='pt-2'>
                                                    <Field label='Otro'>
                                                        <Textarea
                                                            value={nuevo.habitos.otro}
                                                            onChange={(e) =>
                                                                setNuevo({
                                                                    ...nuevo,
                                                                    habitos: {
                                                                        ...nuevo.habitos,
                                                                        otro: e.target.value,
                                                                    },
                                                                })
                                                            }
                                                            placeholder='Describa otro hábito relevante...'
                                                        />
                                                    </Field>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Complicaciones */}
                                    <Card className='border-slate-200'>
                                        <CardHeaderWithIcon
                                            icon={
                                                <AlertTriangle className='h-5 w-5 text-amber-600' />
                                            }
                                            title='Complicaciones'
                                            subtitle='Registro binario y descripción clínica'
                                        />
                                        <CardContent>
                                            <Field label='Prequirúrgicas'>
                                                <Textarea
                                                    value={nuevo.prequirurgicas}
                                                    onChange={(e) =>
                                                        setNuevo({
                                                            ...nuevo,
                                                            prequirurgicas:
                                                                e.target.value,
                                                        })
                                                    }
                                                    placeholder='Ej.: anemia, INR elevado, infección urinaria...'
                                                />
                                            </Field>
                                            <div className='mt-3' />
                                            <Field label='Postquirúrgicas'>
                                                <Textarea
                                                    value={
                                                        nuevo.postquirurgicas
                                                    }
                                                    onChange={(e) =>
                                                        setNuevo({
                                                            ...nuevo,
                                                            postquirurgicas:
                                                                e.target.value,
                                                        })
                                                    }
                                                    placeholder='Ej.: infección de herida, neumonía, TVP...'
                                                />
                                            </Field>
                                        </CardContent>
                                    </Card>

                                    {/* Evolución post-cirugía (a lo ancho) */}
                                    <Card className='border-slate-200 lg:col-span-2'>
                                        <CardHeaderWithIcon
                                            icon={
                                                <Hospital className='h-5 w-5' />
                                            }
                                            title='Evolución post-cirugía'
                                            subtitle='Eventos clave durante la estancia y al alta'
                                        />
                                        <CardContent>
                                            <div className='grid sm:grid-cols-2 gap-3'>
                                                <HabitRow
                                                    icon={
                                                        <Droplet className='h-4 w-4' />
                                                    }
                                                    label='Transfusión requerida'
                                                    value={nuevo.transfusion}
                                                    onChange={(v) =>
                                                        setNuevo({
                                                            ...nuevo,
                                                            transfusion: v,
                                                        })
                                                    }
                                                />
                                                <HabitRow
                                                    icon={
                                                        <Clock className='h-4 w-4' />
                                                    }
                                                    label='Reingreso en 30 días'
                                                    value={nuevo.reingreso30}
                                                    onChange={(v) =>
                                                        setNuevo({
                                                            ...nuevo,
                                                            reingreso30: v,
                                                        })
                                                    }
                                                />
                                            </div>
                                            <div className='mt-3'>
                                                <Field label='Comentarios de evolución'>
                                                    <Textarea
                                                        value={
                                                            nuevo.evolucion_coment
                                                        }
                                                        onChange={(e) =>
                                                            setNuevo({
                                                                ...nuevo,
                                                                evolucion_coment:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        placeholder='Dolor controlado, deambulación con asistencia, iniciar rehabilitación...'
                                                    />
                                                </Field>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Comorbilidades */}
                                <Card className='mt-4 border-slate-200'>
                                    <CardHeaderWithIcon
                                        icon={
                                            <HeartPulse className='h-5 w-5' />
                                        }
                                        title='Comorbilidades crónicas'
                                        subtitle='Selecciona todas las que apliquen'
                                    />
                                    <CardContent>
                                        <div className='flex flex-wrap gap-2'>
                                            {comorbOptions.map((key) => {
                                                const active = (
                                                    nuevo.comorbilidades as string[]
                                                ).includes(key);
                                                return (
                                                    <button
                                                        key={key}
                                                        onClick={() =>
                                                            setNuevo(
                                                                (n: any) => ({
                                                                    ...n,
                                                                    comorbilidades:
                                                                        toggleIn(
                                                                            n.comorbilidades as string[],
                                                                            key
                                                                        ),
                                                                })
                                                            )
                                                        }
                                                        className={`px-3 py-1.5 rounded-full text-sm border transition ${
                                                            active
                                                                ? 'bg-sky-600 text-white border-sky-600'
                                                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                                                        }`}
                                                    >
                                                        {key}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            </CardContent>

                            {/* Footer fijo del modal */}
                            <div className='p-6 border-t flex justify-end gap-2'>
                                <Button
                                    variant='ghost'
                                    onClick={() => setShowNuevoControl(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    disabled={
                                        !(
                                            (nuevo.peso ??
                                                seleccionado?.general?.peso) !==
                                                '' &&
                                            (nuevo.altura ??
                                                seleccionado?.general
                                                    ?.altura) !== '' &&
                                            Number(
                                                nuevo.peso ??
                                                    seleccionado?.general?.peso
                                            ) >= 0 &&
                                            Number(
                                                nuevo.altura ??
                                                    seleccionado?.general
                                                        ?.altura
                                            ) >= 0
                                        )
                                    }
                                    onClick={async () => {
                                        const payload = {
                                            episodio_id:
                                                episodioActual?.episodio_id ??
                                                null,
                                            profesional_id: user,
                                            tipo_control: nuevo.tipo,
                                            cambios: {
                                                habitos: nuevo.habitos,
                                                prequirurgicas:
                                                    nuevo.prequirurgicas?.trim() ||
                                                    '',
                                                postquirurgicas:
                                                    nuevo.postquirurgicas?.trim() ||
                                                    '',
                                                evolucion_coment:
                                                    nuevo.evolucion_coment?.trim() ||
                                                    '',
                                                transfusion:
                                                    !!nuevo.transfusion,
                                                reingreso30:
                                                    !!nuevo.reingreso30,
                                                comorbilidades:
                                                    nuevo.comorbilidades,
                                                peso: nuevo.peso
                                                    ? Number(nuevo.peso)
                                                    : null,
                                                altura: nuevo.altura
                                                    ? Number(nuevo.altura)
                                                    : null,
                                            },
                                        };
                                        await saveControl(payload);
                                        setShowNuevoControl(false);
                                    }}
                                >
                                    Guardar control
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
