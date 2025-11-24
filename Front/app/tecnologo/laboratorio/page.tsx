'use client';

import type React from 'react';
import { useEffect, useMemo, useState } from 'react';

import RoleGuard from '@/components/RoleGuard';
import ExamFormFrame from '@/components/Tecnologo/ExamFormFrame';
import { useTecnologo } from '@/contexts/TecnologoContext';
import { Upload, FileText, X, Plus, AlertTriangle } from 'lucide-react';

type ParamFromApi = {
    codigo: string;
    nombre: string;
    unidad: string | null;
    ref_min: number | null;
    ref_max: number | null;
    notas?: string;
    tipo_examen_id?: number | null;
    tipo_muestra_id?: number | null;
};
type MuestraFromApi = { tipo_muestra: string; parametros: ParamFromApi[] };
type ExamenFromApi = { tipo_examen: string; muestras: MuestraFromApi[] };
type CatalogoResponse = { examenes: ExamenFromApi[] };

type ManualRow = {
    id: number;
    parametro: string;
    valor: string;
    unidad: string;
    ref_min: number | null;
    ref_max: number | null;
};

type Plausibility =
    | { ok: true; level: 'in-range' | 'out-of-reference'; msg?: string }
    | { ok: false; level: 'implausible'; msg: string };

const norm = (s?: string | null) => (s ?? '').toString().trim().toUpperCase();
const isPercent = (u?: string | null) => !!u && norm(u) === '%';

const MAX_ABS_NO_RI = 1e6;
const MAX_DECIMALS = 3;
const MAX_TOTAL_LEN = 12;

function parseDecimalStrict(
    raw: string
): { ok: true; value: number } | { ok: false; err: string } {
    const txt = raw.trim();
    if (!txt) return { ok: false, err: 'Falta el resultado' };
    if (txt.length > MAX_TOTAL_LEN)
        return { ok: false, err: `Demasiados dígitos (máx ${MAX_TOTAL_LEN})` };
    if (/e|E/.test(txt))
        return { ok: false, err: 'No se permite notación científica' };
    if (/[\s_a-zA-Z]/.test(txt))
        return {
            ok: false,
            err: 'Formato inválido: solo dígitos y separador decimal',
        };

    const hasDot = txt.includes('.');
    const hasComma = txt.includes(',');
    if (hasDot && hasComma)
        return { ok: false, err: 'Usa punto o coma, no ambos' };

    const re = /^\d+(?:[.,]\d+)?$/;
    if (!re.test(txt))
        return { ok: false, err: 'Ejemplo válido: 123.45 o 123,45' };

    const [, dec = ''] = txt.split(hasComma ? ',' : '.');
    if (dec && dec.length > MAX_DECIMALS)
        return { ok: false, err: `Máx. ${MAX_DECIMALS} decimales` };

    const v = Number(txt.replace(',', '.'));
    if (!Number.isFinite(v)) return { ok: false, err: 'Valor no numérico' };

    return { ok: true, value: v };
}

const IMPROBABLE_FACTOR_HIGH = 10;
const IMPROBABLE_FACTOR_LOW = 10;

function classifyValue(
    rawValue: string,
    unidad: string | null | undefined,
    ref_min: number | null,
    ref_max: number | null
): Plausibility {
    const parsed = parseDecimalStrict(rawValue);
    if (!parsed.ok) return { ok: false, level: 'implausible', msg: parsed.err };
    const v = parsed.value;

    if (isPercent(unidad)) {
        if (v < 0 || v > 100)
            return { ok: false, level: 'implausible', msg: '% fuera de 0–100' };
    } else {
        if (v < 0)
            return {
                ok: false,
                level: 'implausible',
                msg: 'No se permiten negativos',
            };
    }

    if (ref_min == null || ref_max == null) {
        if (Math.abs(v) > MAX_ABS_NO_RI)
            return {
                ok: false,
                level: 'implausible',
                msg: `Valor irreal (sin RI): > ${MAX_ABS_NO_RI}`,
            };
        return { ok: true, level: 'in-range' };
    }

    const tooHigh = v > ref_max * IMPROBABLE_FACTOR_HIGH;
    const tooLow = ref_min > 0 ? v < ref_min / IMPROBABLE_FACTOR_LOW : false;
    if (tooHigh || tooLow)
        return {
            ok: false,
            level: 'implausible',
            msg: 'Valor fisiológicamente imposible',
        };

    if (v < ref_min || v > ref_max)
        return {
            ok: true,
            level: 'out-of-reference',
            msg: 'Fuera del intervalo de referencia (no bloquea)',
        };
    return { ok: true, level: 'in-range' };
}

export default function Page() {
    const { paciente } = useTecnologo();

    const [tipoExamen, setTipoExamen] = useState<string>('');
    const [tipoMuestra, setTipoMuestra] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'manual' | 'archivo'>('manual');
    const [fechaRecepcion, setFechaRecepcion] = useState<string>('');
    const [fechaExtraccion, setFechaExtraccion] = useState<string>('');
    const [attemptedSubmit, setAttemptedSubmit] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    const [nowMax, setNowMax] = useState<string>('');

    const [manualRows, setManualRows] = useState<ManualRow[]>([
        {
            id: 1,
            parametro: '',
            valor: '',
            unidad: '',
            ref_min: null,
            ref_max: null,
        },
    ]);

    const [isDragOver, setIsDragOver] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [catalogo, setCatalogo] = useState<CatalogoResponse | null>(null);
    const [catalogoLoading, setCatalogoLoading] = useState(false);
    const [catalogoError, setCatalogoError] = useState<string | null>(null);

    const [paramOptions, setParamOptions] = useState<ParamFromApi[]>([]);

    const apiBase =
        process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3001/api/v1';

    useEffect(() => {
        const controller = new AbortController();
        setCatalogoLoading(true);
        setCatalogoError(null);

        fetch(`${apiBase}/parametros/catalogo`, {
            credentials: 'include',
            signal: controller.signal,
        })
            .then(async (r) => {
                if (!r.ok)
                    throw new Error(
                        (await r.json().catch(() => null))?.error ||
                            'Error al cargar el catálogo'
                    );
                return r.json() as Promise<CatalogoResponse>;
            })
            .then((data) => {
                setCatalogo(data);

                const all = data.examenes ?? [];
                const lab =
                    all.find((e) => norm(e.tipo_examen) === 'LABORATORIO') ??
                    all[0];
                if (lab) {
                    setTipoExamen(lab.tipo_examen);
                    setTipoMuestra(lab.muestras?.[0]?.tipo_muestra ?? '');
                }
            })
            .catch((e) => {
                if ((e as any)?.name !== 'AbortError')
                    setCatalogoError(
                        (e as Error)?.message || 'Error al cargar'
                    );
            })
            .finally(() => setCatalogoLoading(false));

        return () => controller.abort();
    }, [apiBase]);

    useEffect(() => {
        const now = new Date();
        const localISO = new Date(
            now.getTime() - now.getTimezoneOffset() * 60000
        )
            .toISOString()
            .slice(0, 16); // "2025-11-18T15:30"

        setNowMax(localISO);
        setFechaRecepcion(localISO);
        setFechaExtraccion(localISO);
    }, []);

    useEffect(() => {
        if (!catalogo || !tipoExamen || !tipoMuestra)
            return setParamOptions([]);

        const examen = catalogo.examenes.find(
            (e) => norm(e.tipo_examen) === norm(tipoExamen)
        );
        if (!examen) return setParamOptions([]);

        const muestra = examen.muestras.find(
            (m) => norm(m.tipo_muestra) === norm(tipoMuestra)
        );
        if (!muestra) return setParamOptions([]);

        setParamOptions(muestra.parametros || []);
    }, [catalogo, tipoExamen, tipoMuestra]);

    const hasParams = useMemo(() => paramOptions.length > 0, [paramOptions]);

    const addManualRow = () => {
        const newId = Math.max(...manualRows.map((r) => r.id)) + 1;
        setManualRows([
            ...manualRows,
            {
                id: newId,
                parametro: '',
                valor: '',
                unidad: '',
                ref_min: null,
                ref_max: null,
            },
        ]);
    };
    const removeManualRow = (id: number) => {
        if (manualRows.length > 1)
            setManualRows(manualRows.filter((r) => r.id !== id));
    };
    const onChangeParam = (rowId: number, codigo: string) => {
        const def = paramOptions.find((p) => p.codigo === codigo);
        setManualRows((rows) =>
            rows.map((r) =>
                r.id === rowId
                    ? {
                          ...r,
                          parametro: codigo,
                          unidad: def?.unidad || '',
                          ref_min: def?.ref_min ?? null,
                          ref_max: def?.ref_max ?? null,
                      }
                    : r
            )
        );
    };
    const onChangeValor = (rowId: number, valor: string) => {
        let t = valor.replace(/[^\d.,]/g, '');
        const firstDot = t.indexOf('.');
        const firstComma = t.indexOf(',');
        const sep =
            firstDot >= 0 && firstComma >= 0
                ? firstDot < firstComma
                    ? '.'
                    : ','
                : firstDot >= 0
                ? '.'
                : firstComma >= 0
                ? ','
                : '';
        if (sep) {
            const parts = t.split(sep);
            const left = parts.shift()!.replace(/[.,]/g, '');
            const rightRaw = parts.join('');
            const right = rightRaw.slice(0, MAX_DECIMALS);
            t = left + sep + right;
        }
        if (t.length > MAX_TOTAL_LEN) t = t.slice(0, MAX_TOTAL_LEN);
        setManualRows((rows) =>
            rows.map((r) => (r.id === rowId ? { ...r, valor: t } : r))
        );
    };

    const resultState = (row: ManualRow) => {
        if (!row.valor.trim()) return { cls: 'border-gray-300', hint: '' };

        const fmt = parseDecimalStrict(row.valor);
        if (!fmt.ok) return { cls: 'border-red-500 bg-red-50', hint: fmt.err };

        const res = classifyValue(
            row.valor,
            row.unidad,
            row.ref_min,
            row.ref_max
        );
        if (!res.ok && res.level === 'implausible')
            return { cls: 'border-red-500 bg-red-50', hint: res.msg };
        if (res.ok && res.level === 'out-of-reference')
            return {
                cls: 'border-red-500 bg-red-50',
                hint:
                    res.msg || 'Fuera del intervalo de referencia (no bloquea)',
            };
        return {
            cls: 'border-green-500 bg-green-50',
            hint: res.msg || 'En rango',
        };
    };

    const handleTipoExamenChange = (
        e: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const te = e.target.value;
        setTipoExamen(te);
        const examen = catalogo?.examenes.find(
            (ex) => norm(ex.tipo_examen) === norm(te)
        );
        setTipoMuestra(examen?.muestras?.[0]?.tipo_muestra ?? '');
        setManualRows((rows) =>
            rows.map((r) => ({
                ...r,
                parametro: '',
                unidad: '',
                ref_min: null,
                ref_max: null,
            }))
        );
    };

    const handleTipoMuestraChange = (
        e: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const tm = e.target.value;
        setTipoMuestra(tm);
        setManualRows((rows) =>
            rows.map((r) => ({
                ...r,
                parametro: '',
                unidad: '',
                ref_min: null,
                ref_max: null,
            }))
        );
    };

    const handleRecepcionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFechaRecepcion(value);

        // Si la extracción quedó antes de la recepción o en día diferente, la forzamos al mismo día y hora
        if (
            fechaExtraccion &&
            value &&
            (fechaExtraccion < value ||
                fechaExtraccion.slice(0, 10) !== value.slice(0, 10))
        ) {
            setFechaExtraccion(value);
        }
    };

    const handleExtraccionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        if (fechaRecepcion) {
            const recepcionDate = new Date(fechaRecepcion);
            const recepcionDay = recepcionDate.toISOString().slice(0, 10); // YYYY-MM-DD
            const valueDate = new Date(value);
            const valueDay = valueDate.toISOString().slice(0, 10);

            if (valueDay !== recepcionDay) {
                // Forzar al mismo día, manteniendo la hora
                const newValue = recepcionDay + value.slice(10); // YYYY-MM-DDTHH:mm
                setFechaExtraccion(newValue);
                return;
            }
        }

        setFechaExtraccion(value);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };
    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const f = e.dataTransfer.files?.[0];
        if (
            f &&
            (f.type === 'application/pdf' ||
                f.type === 'text/plain' ||
                f.type === 'application/json')
        )
            setSelectedFile(f);
    };
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        const ok =
            ['application/pdf', 'text/plain', 'application/json'].includes(
                f.type
            ) || /\.(pdf|txt|json)$/i.test(f.name);
        setSelectedFile(ok ? f : null);
    };
    const removeFile = () => setSelectedFile(null);

    const handleSuccess = () => {
        setManualRows([
            {
                id: 1,
                parametro: '',
                valor: '',
                unidad: '',
                ref_min: null,
                ref_max: null,
            },
        ]);
        setSelectedFile(null);
        setActiveTab('manual');
        setFechaRecepcion('');
        setFechaExtraccion('');
        setAttemptedSubmit(false);
        setValidationError(null);

        if (catalogo?.examenes?.length) {
            const ex = catalogo.examenes.find(
                (e) => norm(e.tipo_examen) === norm(tipoExamen)
            );
            setTipoMuestra(ex?.muestras?.[0]?.tipo_muestra ?? '');
        }
    };

    const blockingErrors = useMemo(() => {
        const errs: string[] = [];
        if (!tipoExamen) errs.push('tipo_examen');
        if (!tipoMuestra) errs.push('tipo_muestra');
        if (!fechaRecepcion) errs.push('fecha_recepcion');
        if (!fechaExtraccion) errs.push('fecha_extraccion');
        if (activeTab === 'archivo' && !selectedFile) errs.push('archivo');

        if (activeTab === 'manual') {
            if (!manualRows.length) errs.push('sin_filas');
            manualRows.forEach((r, i) => {
                if (!r.parametro) errs.push(`parametro_${i}`);
                if (!r.valor.trim()) errs.push(`valor_${i}`);
                else {
                    const res = classifyValue(
                        r.valor,
                        r.unidad,
                        r.ref_min,
                        r.ref_max
                    );
                    if (!res.ok && res.level === 'implausible')
                        errs.push(`implausible_${i}`);
                }
            });
        }
        return errs;
    }, [
        tipoExamen,
        tipoMuestra,
        fechaRecepcion,
        fechaExtraccion,
        activeTab,
        selectedFile,
        manualRows,
    ]);

    const hasBlockingErrors = blockingErrors.length > 0;

    const getValidationMessage = (): string | null => {
        if (!attemptedSubmit) return null;
        const errors: string[] = [];

        if (blockingErrors.includes('tipo_examen'))
            errors.push('Tipo de examen');
        if (blockingErrors.includes('tipo_muestra'))
            errors.push('Tipo de muestra');
        if (blockingErrors.includes('fecha_recepcion'))
            errors.push('Fecha de recepción');
        if (blockingErrors.includes('fecha_extraccion'))
            errors.push('Fecha de extracción');
        if (blockingErrors.includes('archivo')) errors.push('Archivo');

        const implCount = blockingErrors.filter((e) =>
            e.startsWith('implausible_')
        ).length;
        const missParam = blockingErrors.filter((e) =>
            e.startsWith('parametro_')
        ).length;
        const missVal = blockingErrors.filter((e) =>
            e.startsWith('valor_')
        ).length;

        if (implCount > 0)
            errors.push(
                `${implCount} resultado${
                    implCount > 1 ? 's' : ''
                } con valor imposible`
            );
        if (missParam > 0)
            errors.push(
                `${missParam} parámetro${
                    missParam > 1 ? 's' : ''
                } sin seleccionar`
            );
        if (missVal > 0)
            errors.push(
                `${missVal} resultado${missVal > 1 ? 's' : ''} sin valor`
            );

        return errors.length ? `Por favor corrija: ${errors.join(', ')}` : null;
    };

    const reqClass = (ok: boolean) =>
        attemptedSubmit && !ok ? 'border-red-500 bg-red-50' : '';

    const examTypeForBackend = norm(tipoExamen);

    const getEndOfDay = (dateStr: string) => {
        const date = new Date(dateStr);
        date.setHours(23, 59, 59, 999);
        return date.toISOString().slice(0, 16);
    };

    const examTypeOptions = useMemo(() => {
        const set = new Map<string, string>();
        (catalogo?.examenes ?? []).forEach((e) => {
            const key = norm(e.tipo_examen);
            if (!set.has(key)) set.set(key, e.tipo_examen);
        });
        return Array.from(set.values());
    }, [catalogo]);

    return (
        <RoleGuard allow={['tecnologo']}>
            <div className='mb-6'>
                <h1 className='text-3xl font-bold text-slate-900'>
                    Subir examen
                </h1>
                <p className='text-slate-600 mt-2'>
                    Gestión completa de resultados
                </p>
            </div>

            <ExamFormFrame
                paciente_id={paciente?.user_id}
                examType={examTypeForBackend}
                onSubmit={async () => {
                    setAttemptedSubmit(true);
                    if (hasBlockingErrors) {
                        const msg = getValidationMessage();
                        setValidationError(
                            msg || 'Hay errores en el formulario'
                        );
                        return false;
                    }
                    setValidationError(null);
                    return true;
                }}
                onSuccess={handleSuccess}
                disableSubmit={hasBlockingErrors}
            >
                {/* Tabs */}
                <div className='flex border-b border-gray-200 mb-4'>
                    <button
                        type='button'
                        onClick={() => setActiveTab('manual')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'manual'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Ingreso Manual
                    </button>
                    <button
                        type='button'
                        onClick={() => setActiveTab('archivo')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'archivo'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Subir Archivo
                    </button>
                </div>

                {catalogoError && (
                    <div className='text-sm text-red-600 mb-3'>
                        {catalogoError}
                    </div>
                )}
                {validationError && (
                    <div className='mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start gap-2'>
                        <AlertTriangle className='w-5 h-5 flex-shrink-0 mt-0.5' />
                        <span>{validationError}</span>
                    </div>
                )}

                {activeTab === 'manual' && (
                    <div>
                        <div className='grid gap-4 sm:grid-cols-2'>
                            {/* Tipo de examen (seleccionable) */}
                            <label className='flex flex-col gap-1'>
                                <span className='text-sm text-slate-700'>
                                    Tipo de examen
                                </span>
                                <select
                                    className={`border rounded-lg px-3 py-2 ${reqClass(
                                        !!tipoExamen
                                    )}`}
                                    value={tipoExamen}
                                    onChange={handleTipoExamenChange}
                                    disabled={catalogoLoading || !catalogo}
                                    required
                                    name='tipo_examen_visual'
                                >
                                    <option value=''>
                                        {catalogoLoading
                                            ? 'Cargando...'
                                            : 'Seleccionar tipo de examen'}
                                    </option>
                                    {examTypeOptions.map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            {/* Tipo de muestra (dependiente del examen) */}
                            <label className='flex flex-col gap-1'>
                                <span className='text-sm text-slate-700'>
                                    Tipo de muestra
                                </span>
                                <select
                                    name='tipo_muestra'
                                    className={`border rounded-lg px-3 py-2 ${reqClass(
                                        !!tipoMuestra
                                    )}`}
                                    value={tipoMuestra}
                                    onChange={handleTipoMuestraChange}
                                    disabled={!tipoExamen || catalogoLoading}
                                    required
                                >
                                    <option value=''>
                                        Seleccionar tipo de muestra
                                    </option>
                                    {catalogo?.examenes
                                        .find(
                                            (e) =>
                                                norm(e.tipo_examen) ===
                                                norm(tipoExamen)
                                        )
                                        ?.muestras.map((m) => (
                                            <option
                                                key={m.tipo_muestra}
                                                value={m.tipo_muestra}
                                            >
                                                {m.tipo_muestra}
                                            </option>
                                        ))}
                                </select>
                            </label>

                            <label className='flex flex-col gap-1'>
                                <span className='text-sm text-slate-700'>
                                    Fecha/hora de recepción
                                </span>
                                <input
                                    name='fecha_recepcion'
                                    type='datetime-local'
                                    className={`border rounded-lg px-3 py-2 ${reqClass(
                                        !!fechaRecepcion
                                    )}`}
                                    value={fechaRecepcion}
                                    onChange={handleRecepcionChange}
                                    max={nowMax} // ❌ no futura
                                    required
                                />
                            </label>

                            <label className='flex flex-col gap-1'>
                                <span className='text-sm text-slate-700'>
                                    Fecha/hora de extracción
                                </span>
                                <input
                                    name='fecha_extraccion'
                                    type='datetime-local'
                                    className={`border rounded-lg px-3 py-2 ${reqClass(
                                        !!fechaExtraccion
                                    )}`}
                                    value={fechaExtraccion}
                                    onChange={handleExtraccionChange}
                                    min={fechaRecepcion || undefined} // ❌ no antes de recepción
                                    max={
                                        fechaRecepcion
                                            ? getEndOfDay(fechaRecepcion)
                                            : nowMax
                                    } // ❌ mismo día
                                    required
                                />
                            </label>
                        </div>

                        {catalogoLoading && (
                            <div className='text-sm text-slate-500 mt-2'>
                                Cargando catálogo de exámenes…
                            </div>
                        )}
                        {!catalogoLoading &&
                            !hasParams &&
                            tipoExamen &&
                            tipoMuestra && (
                                <div className='text-sm text-slate-500 mt-2'>
                                    No hay parámetros para {tipoExamen} —{' '}
                                    {tipoMuestra}.
                                </div>
                            )}

                        <div className='text-sm text-slate-600 mb-2 mt-3'>
                            Ingrese los resultados manualmente:
                        </div>

                        <div className='space-y-3'>
                            {manualRows.map((row) => {
                                const { cls, hint } = resultState(row);
                                const needParam =
                                    attemptedSubmit && !row.parametro;
                                const needValor =
                                    attemptedSubmit && !row.valor.trim();
                                return (
                                    <div
                                        key={row.id}
                                        className='flex items-start gap-2'
                                    >
                                        <div className='grid gap-2 sm:grid-cols-3 flex-1'>
                                            <select
                                                name={`resultado_${row.id}_parametro`}
                                                className={`border rounded-lg px-3 py-2 ${
                                                    needParam
                                                        ? 'border-red-500 bg-red-50'
                                                        : ''
                                                }`}
                                                value={row.parametro}
                                                onChange={(e) =>
                                                    onChangeParam(
                                                        row.id,
                                                        e.target.value
                                                    )
                                                }
                                                disabled={!hasParams}
                                                required
                                            >
                                                <option value=''>
                                                    {hasParams
                                                        ? 'Seleccionar parámetro'
                                                        : 'Sin opciones'}
                                                </option>
                                                {paramOptions.map((p) => (
                                                    <option
                                                        key={p.codigo}
                                                        value={p.codigo}
                                                    >
                                                        {p.nombre}{' '}
                                                        {p.unidad
                                                            ? `(${p.unidad})`
                                                            : '(sin unidad)'}
                                                    </option>
                                                ))}
                                            </select>

                                            <div className='flex flex-col'>
                                                <input
                                                    name={`resultado_${row.id}_valor`}
                                                    placeholder='Resultado (p. ej. 3.1 o 3,1)'
                                                    className={`border rounded-lg px-3 py-2 ${
                                                        needValor
                                                            ? 'border-red-500 bg-red-50'
                                                            : cls
                                                    }`}
                                                    value={row.valor}
                                                    onChange={(e) =>
                                                        onChangeValor(
                                                            row.id,
                                                            e.target.value
                                                        )
                                                    }
                                                    inputMode='decimal'
                                                    required
                                                    pattern='^\d+(?:[.,]\d+)?$'
                                                    title={`Solo dígitos y un separador decimal (punto o coma). Máx ${MAX_DECIMALS} decimales y ${MAX_TOTAL_LEN} caracteres.`}
                                                    maxLength={MAX_TOTAL_LEN}
                                                />
                                                {hint && (
                                                    <div className='flex items-center gap-1 text-xs mt-1 text-slate-600'>
                                                        <AlertTriangle className='w-3 h-3' />
                                                        <span>{hint}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <input
                                                name={`resultado_${row.id}_unidad`}
                                                placeholder='Unidad'
                                                className='border rounded-lg px-3 py-2 bg-gray-100 text-gray-700'
                                                value={row.unidad}
                                                readOnly
                                            />
                                        </div>

                                        <div className='text-xs text-slate-500 mt-2 min-w-[160px]'>
                                            {row.ref_min != null ||
                                            row.ref_max != null ? (
                                                <span>
                                                    Rango ref.:{' '}
                                                    {row.ref_min ?? '—'} –{' '}
                                                    {row.ref_max ?? '—'}
                                                </span>
                                            ) : (
                                                <span>Sin rango definido</span>
                                            )}
                                        </div>

                                        {manualRows.length > 1 && (
                                            <button
                                                type='button'
                                                onClick={() =>
                                                    removeManualRow(row.id)
                                                }
                                                className='text-red-500 hover:text-red-700 p-1'
                                                title='Eliminar fila'
                                            >
                                                <X className='w-4 h-4' />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}

                            <button
                                type='button'
                                onClick={addManualRow}
                                className='flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium mt-2'
                            >
                                <Plus className='w-4 h-4' />
                                Agregar fila
                            </button>
                        </div>

                        <div className='mt-4'>
                            <label className='flex flex-col gap-1'>
                                <span className='text-sm text-slate-700'>
                                    Observaciones
                                </span>
                                <textarea
                                    name='observaciones'
                                    rows={3}
                                    className='border rounded-lg px-3 py-2'
                                />
                            </label>
                        </div>
                    </div>
                )}

                {activeTab === 'archivo' && (
                    <div>
                        <div className='text-sm text-slate-600 mb-2'>
                            Suba un archivo con los resultados:
                        </div>

                        <div
                            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                                isDragOver
                                    ? 'border-blue-400 bg-blue-50'
                                    : selectedFile
                                    ? 'border-green-400 bg-green-50'
                                    : 'border-gray-300 hover:border-gray-400'
                            }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <input
                                type='file'
                                accept='.pdf,.txt,.json'
                                onChange={handleFileSelect}
                                className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                                name='archivo'
                                required={activeTab === 'archivo'}
                            />
                            {selectedFile ? (
                                <div className='flex flex-col items-center gap-3'>
                                    <div className='flex items-center gap-3 p-3 bg-white rounded-lg border'>
                                        <FileText className='w-8 h-8 text-green-600' />
                                        <div className='text-left'>
                                            <div className='font-medium text-gray-900'>
                                                {selectedFile.name}
                                            </div>
                                            <div className='text-sm text-gray-500'>
                                                {(
                                                    selectedFile.size / 1024
                                                ).toFixed(1)}{' '}
                                                KB
                                            </div>
                                        </div>
                                        <button
                                            type='button'
                                            onClick={removeFile}
                                            className='text-red-500 hover:text-red-700 p-1'
                                            title='Remover archivo'
                                        >
                                            <X className='w-5 h-5' />
                                        </button>
                                    </div>
                                    <p className='text-sm text-green-600 font-medium'>
                                        Archivo seleccionado correctamente
                                    </p>
                                </div>
                            ) : (
                                <div className='flex flex-col items-center gap-4'>
                                    <Upload
                                        className={`w-12 h-12 ${
                                            isDragOver
                                                ? 'text-blue-500'
                                                : 'text-gray-400'
                                        }`}
                                    />
                                    <div>
                                        <p className='text-lg font-medium text-gray-900 mb-1'>
                                            {isDragOver
                                                ? 'Suelte el archivo aquí'
                                                : 'Arrastra y suelta tu archivo'}
                                        </p>
                                        <p className='text-sm text-gray-500'>
                                            o{' '}
                                            <span className='text-blue-600 font-medium'>
                                                haz clic para seleccionar
                                            </span>
                                        </p>
                                    </div>
                                    <div className='flex items-center gap-2 text-xs text-gray-500'>
                                        <FileText className='w-4 h-4' />
                                        <span>
                                            PDF, TXT, JSON • Máximo 10MB
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </ExamFormFrame>
        </RoleGuard>
    );
}
