'use client';

import { useEffect, useMemo, useState } from 'react';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import { useInvestigator } from '@/contexts/InvestigatorContext';

const PALETTE = [
    '#2563eb',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#14b8a6',
    '#f97316',
    '#22c55e',
    '#e11d48',
    '#06b6d4',
];
const colorFor = (i: number) => PALETTE[i % PALETTE.length];
const getYear = (iso?: string | null) => {
    if (!iso) return NaN;
    const d = new Date(iso);
    return isNaN(d.getTime()) ? NaN : d.getFullYear();
};
const ensure = <T,>(arr: T[], filler: T) => (arr.length ? arr : [filler]);

function CustomTooltip({ active, payload, label }: any) {
    if (active && payload && payload.length) {
        return (
            <div className='bg-white border border-slate-200 rounded-lg shadow-lg p-3'>
                <p className='font-medium text-slate-900'>
                    {label || payload[0].name}
                </p>
                {payload.map((entry: any, index: number) => {
                    const showLabel =
                        entry.name &&
                        entry.name !== label &&
                        entry.name !== 'value';
                    const labelText = showLabel ? entry.name : 'Valor';

                    return (
                        <p
                            key={index}
                            style={{ color: entry.color }}
                            className='text-sm'
                        >
                            {entry.name !== 'value' && showLabel
                                ? `${entry.name}: `
                                : `${labelText}: `}
                            <span className='font-semibold'>
                                {typeof entry.value === 'number'
                                    ? entry.value.toFixed(1)
                                    : entry.value}
                                {entry.unit || ''}
                            </span>
                        </p>
                    );
                })}
            </div>
        );
    }
    return null;
}

function ChartTitle({ children }: { children: React.ReactNode }) {
    return (
        <h4 className='mb-2 text-sm font-semibold text-slate-800 text-center tracking-wide'>
            {children}
        </h4>
    );
}

function SoftGlow({
    tone = 'blue',
}: {
    tone?: 'blue' | 'emerald' | 'violet' | 'amber';
}) {
    const toneMap: Record<string, string> = {
        blue: 'bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,.18),rgba(16,185,129,.10)_45%,transparent_70%)]',
        emerald:
            'bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,.18),rgba(59,130,246,.10)_45%,transparent_70%)]',
        violet: 'bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,.20),rgba(6,182,212,.10)_45%,transparent_70%)]',
        amber: 'bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,.22),rgba(34,197,94,.10)_45%,transparent_70%)]',
    };
    return (
        <div className='pointer-events-none absolute inset-0 -z-10'>
            <div
                className={[
                    'absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl opacity-70',
                    toneMap[tone],
                ].join(' ')}
            />
        </div>
    );
}

function ChartBox({
    height = 256,
    children,
    glow = 'blue',
}: {
    height?: number;
    children: React.ReactNode;
    glow?: 'blue' | 'emerald' | 'violet' | 'amber';
}) {
    return (
        <div className='relative w-full'>
            <SoftGlow tone={glow} />
            <div className='mx-auto' style={{ height }}>
                {children}
            </div>
        </div>
    );
}

function SelectPill({
    value,
    onChange,
    options,
    placeholder,
    title,
}: {
    value?: number | undefined;
    onChange: (v?: number) => void;
    options: number[];
    placeholder: string;
    title: string;
}) {
    return (
        <div className='relative inline-flex items-center group'>
            {/* borde degradado */}
            <span
                aria-hidden
                className='pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-500 opacity-60 group-hover:opacity-90 transition-opacity'
            />
            {/* focus ring */}
            <span
                aria-hidden
                className='pointer-events-none absolute -inset-1 rounded-full ring-2 ring-blue-500/0 group-focus-within:ring-blue-500/30 transition'
            />
            {/* contenido clickeable */}
            <div className='relative rounded-full bg-white/75 backdrop-blur px-3 py-1.5 shadow-sm'>
                <div className='relative'>
                    <select
                        value={value ?? ''}
                        onChange={(e) =>
                            onChange(
                                e.target.value
                                    ? Number(e.target.value)
                                    : undefined
                            )
                        }
                        title={title}
                        className='relative z-10 appearance-none pr-7 bg-transparent text-sm text-slate-700 font-medium outline-none'
                    >
                        <option value=''>{placeholder}</option>
                        {options.map((y) => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>
                    {/* caret */}
                    <span className='pointer-events-none absolute right-1 top-1/2 -translate-y-1/2'>
                        <svg
                            width='16'
                            height='16'
                            viewBox='0 0 20 20'
                            fill='none'
                        >
                            <path
                                d='M6 8l4 4 4-4'
                                stroke='#334155'
                                strokeWidth='1.6'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                            />
                        </svg>
                    </span>
                </div>
            </div>
        </div>
    );
}

export default function ChartsPanelSketchV4() {
    const { filtered, analytics, filtros } = useInvestigator();

    const hasActiveFilters = useMemo(() => {
        return !!(
            filtros.busqueda ||
            filtros.tipoMuestra ||
            filtros.parametro ||
            filtros.valorMin != null ||
            filtros.valorMax != null ||
            filtros.profesionalId != null ||
            filtros.examenId != null
        );
    }, [filtros]);

    const years = useMemo(() => {
        const s = new Set<number>();
        filtered.forEach((m) => {
            const y = getYear(
                m.fecha_extraccion ||
                    (m as any).fechaIngreso ||
                    (m as any).fecha_recepcion
            );
            if (!isNaN(y)) s.add(y);
        });
        return Array.from(s).sort((a, b) => a - b);
    }, [filtered]);

    const [fromY, setFromY] = useState<number | undefined>(undefined);
    const [toY, setToY] = useState<number | undefined>(undefined);

    useEffect(() => {
        if (years.length && fromY == null) setFromY(years[years.length - 1]);
    }, [years]); 

    const inTime = (m: any) => {
        const y = getYear(
            m.fecha_extraccion || m.fechaIngreso || m.fecha_recepcion
        );
        if (isNaN(y)) return false;
        if (fromY != null && toY == null) return y === fromY;
        if (fromY == null && toY != null) return y === toY;
        if (fromY != null && toY != null) return y >= fromY && y <= toY;
        return true;
    };

    const dataT = useMemo(() => {
        if (fromY == null && toY == null) {
            return filtered;
        }
        return filtered.filter(inTime);
    }, [filtered, fromY, toY]);

    const tipos = useMemo(() => {
        const s = new Set<string>();
        dataT.forEach((m) => s.add(m.tipo_muestra));
        return Array.from(s).sort();
    }, [dataT]);

    const avgByParam = useMemo(() => {
        if (analytics.promediosParametros) {
            const rows = Object.entries(analytics.promediosParametros)
                .map(([parametro, data]) => ({
                    parametro,
                    promedio: data.valor_promedio,
                }))
                .sort((a, b) => a.parametro.localeCompare(b.parametro));
            return ensure(rows, { parametro: '—', promedio: 0 });
        }

        const mp = new Map<string, { sum: number; n: number }>();
        dataT.forEach((m) =>
            m.Resultados.forEach((r) => {
                const v = Number(r.valor);
                if (!Number.isFinite(v)) return;
                const cur = mp.get(r.parametro) ?? { sum: 0, n: 0 };
                cur.sum += v;
                cur.n += 1;
                mp.set(r.parametro, cur);
            })
        );
        const rows = Array.from(mp.entries())
            .map(([parametro, { sum, n }]) => ({
                parametro,
                promedio: sum / Math.max(1, n),
            }))
            .sort((a, b) => a.parametro.localeCompare(b.parametro));
        return ensure(rows, { parametro: '—', promedio: 0 });
    }, [analytics.promediosParametros, dataT]);

    type Slice = { name: string; value: number };

    const pieLab = useMemo(() => {
        if (analytics.contadorCategorias?.por_tipo_examen) {
            const labData: Slice[] = [];

            Object.entries(
                analytics.contadorCategorias.por_tipo_examen
            ).forEach(([tipoExamen, data]) => {
                if (
                    tipoExamen.toLowerCase().includes('laboratorio') ||
                    tipoExamen.toLowerCase().includes('hemograma') ||
                    tipoExamen.toLowerCase().includes('perfil')
                ) {
                    Object.entries(data.por_tipo_muestra).forEach(
                        ([tipoMuestra, muestra]) => {
                            labData.push({
                                name: tipoMuestra,
                                value: muestra.cantidad,
                            });
                        }
                    );
                }
            });

            return labData.length > 0 ? labData : [{ name: '—', value: 1 }];
        }

        function countBy<T extends string>(
            arr: any[],
            pred: (m: any) => T | null
        ): Slice[] {
            const mp = new Map<string, number>();
            arr.forEach((m) => {
                const k = pred(m);
                if (!k) return;
                mp.set(k, (mp.get(k) ?? 0) + 1);
            });
            const rows = Array.from(mp.entries())
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value);
            return rows.length ? rows : [{ name: '—', value: 1 }];
        }

        const norm = (s?: string) =>
            (s ?? '')
                .toString()
                .trim()
                .toUpperCase()
                .normalize('NFD')
                .replace(/\p{Diacritic}/gu, '');

        const LAB_SET = new Set([
            'SANGRE',
            'SANGRE TOTAL',
            'SANGRE_CAPILAR',
            'SANGRE VENOSA',
            'SANGRE VENOSA CITRATADA',
            'SANGRE VENOSA EDTA',
            'ORINA',
            'HECES',
            'SUERO',
            'PLASMA',
            'LCR',
            'BIOPSIA',
            'TEJIDO',
            'SALIVA',
            'SECRECION',
            'OROFAST',
        ]);

        const isLab = (t: string) => LAB_SET.has(t);

        return countBy(dataT, (m: any) => {
            const t = norm(m?.tipo_muestra);
            if (isLab(t)) return m.tipo_muestra as string;
            return null;
        });
    }, [analytics.contadorCategorias, dataT]);

    const pieImg = useMemo(() => {
        if (analytics.contadorCategorias?.por_tipo_examen) {
            const imgData: Slice[] = [];

            Object.entries(
                analytics.contadorCategorias.por_tipo_examen
            ).forEach(([tipoExamen, data]) => {
                if (tipoExamen.toLowerCase().includes('imagen')) {
                    Object.entries(data.por_tipo_muestra).forEach(
                        ([tipoMuestra, muestra]) => {
                            imgData.push({
                                name: tipoMuestra,
                                value: muestra.cantidad,
                            });
                        }
                    );
                }
            });

            return imgData.length > 0 ? imgData : [{ name: '—', value: 1 }];
        }

        function countBy<T extends string>(
            arr: any[],
            pred: (m: any) => T | null
        ): Slice[] {
            const mp = new Map<string, number>();
            arr.forEach((m) => {
                const k = pred(m);
                if (!k) return;
                mp.set(k, (mp.get(k) ?? 0) + 1);
            });
            const rows = Array.from(mp.entries())
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value);
            return rows.length ? rows : [{ name: '—', value: 1 }];
        }

        const norm = (s?: string) =>
            (s ?? '')
                .toString()
                .trim()
                .toUpperCase()
                .normalize('NFD')
                .replace(/\p{Diacritic}/gu, '');

        const IMG_KEYWORDS = [
            'RX',
            'RAYOS X',
            'RADIOGRAF',
            'ECO',
            'ECOGRAF',
            'ECO-DOPPLER',
            'DOPPLER',
            'ULTRASON',
            'US',
            'TAC',
            'TOMOGRAF',
            'RMN',
            'RESONANCIA',
            'ANGIO TAC',
            'ANGIO RMN',
            'MAMOGRAF',
            'BDAT',
        ];

        const isImg = (t: string) =>
            IMG_KEYWORDS.some((k) => t.includes(norm(k)));

        return countBy(dataT, (m: any) => {
            const t = norm(m?.tipo_muestra);
            if (isImg(t)) return m.tipo_muestra as string;
            return null;
        });
    }, [analytics.contadorCategorias, dataT]);

    const fracturaSexo = useMemo(() => {
        if (analytics.distribucionFracturaPorSexo) {
            const rows = Object.entries(analytics.distribucionFracturaPorSexo)
                .map(([tipo_fractura, data]) => ({
                    tipo_fractura,
                    Femenino: data.Femenino.cantidad,
                    Masculino: data.Masculino.cantidad,
                    Otro: 0, 
                }))
                .sort(
                    (a, b) =>
                        b.Femenino + b.Masculino - (a.Femenino + a.Masculino)
                );
            return ensure(rows, {
                tipo_fractura: '—',
                Femenino: 0,
                Masculino: 0,
                Otro: 0,
            });
        }

        const by = new Map<string, { F: number; M: number; O: number }>();
        dataT.forEach((m: any) => {
            const tf = m?.tipo_fractura as string | undefined;
            if (!tf) return;
            const sexo = (m?.sexo as string | undefined)?.toUpperCase() ?? 'O';
            const row = by.get(tf) ?? { F: 0, M: 0, O: 0 };
            if (sexo.startsWith('F')) row.F++;
            else if (sexo.startsWith('M')) row.M++;
            else row.O++;
            by.set(tf, row);
        });
        const rows = Array.from(by.entries())
            .map(([tipo_fractura, v]) => ({
                tipo_fractura,
                Femenino: v.F,
                Masculino: v.M,
                Otro: v.O,
            }))
            .sort(
                (a, b) =>
                    b.Femenino +
                    b.Masculino +
                    b.Otro -
                    (a.Femenino + a.Masculino + a.Otro)
            );
        return ensure(rows, {
            tipo_fractura: '—',
            Femenino: 0,
            Masculino: 0,
            Otro: 0,
        });
    }, [analytics.distribucionFracturaPorSexo, dataT]);

    type BarRow = { name: string; value: number };
    type RiskDistRow = { nivel: string; cantidad: number; porcentaje: number };

    const barsComorb = useMemo(() => {
        const useBackendData =
            !hasActiveFilters &&
            analytics.riesgoRefracturaComorbilidades?.factores_principales;

        if (useBackendData) {
            const rows = analytics
                .riesgoRefracturaComorbilidades!.factores_principales.map(
                    (f) => ({
                        name: f.factor,
                        value: f.prevalencia,
                    })
                )
                .slice(0, 8);
            return ensure(rows, { name: '—', value: 0 });
        }

        function aggCategory(
            arr: any[],
            field: 'comorbilidades' | 'habitos'
        ): BarRow[] {
            const hasScore = arr.some(
                (m: any) => typeof m?.riesgo_refractura === 'number'
            );
            const mp = new Map<string, { sum: number; n: number }>();
            arr.forEach((m: any) => {
                const raw = m?.[field];
                const list: string[] = Array.isArray(raw)
                    ? raw
                    : typeof raw === 'string'
                    ? raw
                          .split(',')
                          .map((x) => x.trim())
                          .filter(Boolean)
                    : [];
                if (list.length === 0) return;
                list.forEach((label) => {
                    const v = mp.get(label) ?? { sum: 0, n: 0 };
                    v.sum += hasScore ? Number(m.riesgo_refractura ?? 0) : 1;
                    v.n += 1;
                    mp.set(label, v);
                });
            });
            let rows = Array.from(mp.entries()).map(([name, v]) => ({
                name,
                value: arr.some(
                    (m: any) => typeof m?.riesgo_refractura === 'number'
                )
                    ? v.sum / Math.max(1, v.n)
                    : v.sum,
            }));
            rows = rows.sort((a, b) => b.value - a.value).slice(0, 8);
            return ensure(rows, { name: '—', value: 0 });
        }
        return aggCategory(dataT, 'comorbilidades');
    }, [hasActiveFilters, analytics.riesgoRefracturaComorbilidades, dataT]);

    const distComorb = useMemo((): RiskDistRow[] => {
        const useBackendData =
            !hasActiveFilters &&
            analytics.riesgoRefracturaComorbilidades?.distribucion;

        if (useBackendData) {
            const dist = analytics.riesgoRefracturaComorbilidades!.distribucion;
            return [
                {
                    nivel: 'Bajo',
                    cantidad: dist.BAJO.cantidad,
                    porcentaje: dist.BAJO.porcentaje,
                },
                {
                    nivel: 'Moderado',
                    cantidad: dist.MODERADO.cantidad,
                    porcentaje: dist.MODERADO.porcentaje,
                },
                {
                    nivel: 'Alto',
                    cantidad: dist.ALTO.cantidad,
                    porcentaje: dist.ALTO.porcentaje,
                },
                {
                    nivel: 'Muy Alto',
                    cantidad: dist.MUY_ALTO.cantidad,
                    porcentaje: dist.MUY_ALTO.porcentaje,
                },
            ];
        }
        return [{ nivel: '—', cantidad: 0, porcentaje: 0 }];
    }, [analytics.riesgoRefracturaComorbilidades]);

    const barsHabits = useMemo(() => {
        const useBackendData =
            !hasActiveFilters &&
            analytics.riesgoRefracturaHabitos?.factores_principales;

        if (useBackendData) {
            const rows = analytics
                .riesgoRefracturaHabitos!.factores_principales.map((f) => ({
                    name: f.factor,
                    value: f.prevalencia,
                }))
                .slice(0, 8);
            return ensure(rows, { name: '—', value: 0 });
        }

        function aggCategory(
            arr: any[],
            field: 'comorbilidades' | 'habitos'
        ): BarRow[] {
            const hasScore = arr.some(
                (m: any) => typeof m?.riesgo_refractura === 'number'
            );
            const mp = new Map<string, { sum: number; n: number }>();
            arr.forEach((m: any) => {
                const raw = m?.[field];
                const list: string[] = Array.isArray(raw)
                    ? raw
                    : typeof raw === 'string'
                    ? raw
                          .split(',')
                          .map((x) => x.trim())
                          .filter(Boolean)
                    : [];
                if (list.length === 0) return;
                list.forEach((label) => {
                    const v = mp.get(label) ?? { sum: 0, n: 0 };
                    v.sum += hasScore ? Number(m.riesgo_refractura ?? 0) : 1;
                    v.n += 1;
                    mp.set(label, v);
                });
            });
            let rows = Array.from(mp.entries()).map(([name, v]) => ({
                name,
                value: arr.some(
                    (m: any) => typeof m?.riesgo_refractura === 'number'
                )
                    ? v.sum / Math.max(1, v.n)
                    : v.sum,
            }));
            rows = rows.sort((a, b) => b.value - a.value).slice(0, 8);
            return ensure(rows, { name: '—', value: 0 });
        }
        return aggCategory(dataT, 'habitos');
    }, [hasActiveFilters, analytics.riesgoRefracturaHabitos, dataT]);

    const distHabits = useMemo((): RiskDistRow[] => {
        const useBackendData =
            !hasActiveFilters &&
            analytics.riesgoRefracturaHabitos?.distribucion;

        if (useBackendData) {
            const dist = analytics.riesgoRefracturaHabitos!.distribucion;
            return [
                {
                    nivel: 'Bajo',
                    cantidad: dist.BAJO.cantidad,
                    porcentaje: dist.BAJO.porcentaje,
                },
                {
                    nivel: 'Moderado',
                    cantidad: dist.MODERADO.cantidad,
                    porcentaje: dist.MODERADO.porcentaje,
                },
                {
                    nivel: 'Alto',
                    cantidad: dist.ALTO.cantidad,
                    porcentaje: dist.ALTO.porcentaje,
                },
                {
                    nivel: 'Muy Alto',
                    cantidad: dist.MUY_ALTO.cantidad,
                    porcentaje: dist.MUY_ALTO.porcentaje,
                },
            ];
        }
        return [{ nivel: '—', cantidad: 0, porcentaje: 0 }];
    }, [analytics.riesgoRefracturaHabitos]);

    const gridStroke = '#e5e7eb';

    return (
        <div className='grid grid-cols-1 gap-6'>
            {/* Encabezado + selector */}
            <div className='mb-1 flex items-center justify-between'>
                <h3 className='text-base font-semibold text-slate-800'></h3>
                <div className='flex items-center gap-3'>
                    <SelectPill
                        value={fromY}
                        onChange={setFromY}
                        options={years}
                        placeholder='Desde…'
                        title='Desde (año)'
                    />
                    <span className='text-slate-400'>→</span>
                    <SelectPill
                        value={toY}
                        onChange={setToY}
                        options={years}
                        placeholder='Hasta…'
                        title='Hasta (año)'
                    />
                </div>
            </div>

            {/* Fila 1 (50/50) */}
            <div className='grid grid-cols-1 items-start gap-6 lg:grid-cols-2'>
                <div className='lg:col-span-1'>
                    <ChartTitle>Promedio por parámetro</ChartTitle>
                    <ChartBox height={260} glow='blue'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <LineChart data={avgByParam}>
                                <CartesianGrid
                                    stroke={gridStroke}
                                    strokeOpacity={0.7}
                                />
                                <XAxis
                                    dataKey='parametro'
                                    interval={0}
                                    angle={-25}
                                    textAnchor='end'
                                    height={60}
                                />
                                <YAxis />
                                <Tooltip content={<CustomTooltip />} />
                                <Line
                                    type='monotone'
                                    dataKey='promedio'
                                    stroke='#2563eb'
                                    strokeWidth={2}
                                    dot
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartBox>
                </div>

                <div className='lg:col-span-1'>
                    <ChartTitle>Tipos por categoría de examen</ChartTitle>
                    <div className='grid grid-cols-2 gap-6'>
                        {/* Laboratorio */}
                        <div className='flex flex-col'>
                            <div className='mb-1 text-center text-xs font-semibold text-slate-700 tracking-wide'>
                                EXÁMENES DE LABORATORIO
                            </div>
                            <ChartBox height={220} glow='emerald'>
                                <ResponsiveContainer width='100%' height='100%'>
                                    <PieChart>
                                        <defs>
                                            <filter
                                                id='pieShadow'
                                                x='-50%'
                                                y='-50%'
                                                width='200%'
                                                height='200%'
                                            >
                                                <feDropShadow
                                                    dx='0'
                                                    dy='2'
                                                    stdDeviation='3'
                                                    floodOpacity='0.25'
                                                />
                                            </filter>
                                        </defs>
                                        <Tooltip content={<CustomTooltip />} />
                                        <g filter='url(#pieShadow)'>
                                            <Pie
                                                data={pieLab}
                                                dataKey='value'
                                                nameKey='name'
                                                outerRadius={90}
                                                label
                                            >
                                                {pieLab.map((_, idx) => (
                                                    <Cell
                                                        key={idx}
                                                        fill={colorFor(idx)}
                                                    />
                                                ))}
                                            </Pie>
                                        </g>
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartBox>
                        </div>

                        {/* Imagen */}
                        <div className='flex flex-col'>
                            <div className='mb-1 text-center text-xs font-semibold text-slate-700 tracking-wide'>
                                EXÁMENES DE IMAGEN
                            </div>
                            <ChartBox height={220} glow='violet'>
                                <ResponsiveContainer width='100%' height='100%'>
                                    <PieChart>
                                        <defs>
                                            <filter
                                                id='pieShadow2'
                                                x='-50%'
                                                y='-50%'
                                                width='200%'
                                                height='200%'
                                            >
                                                <feDropShadow
                                                    dx='0'
                                                    dy='2'
                                                    stdDeviation='3'
                                                    floodOpacity='0.25'
                                                />
                                            </filter>
                                        </defs>
                                        <Tooltip content={<CustomTooltip />} />
                                        <g filter='url(#pieShadow2)'>
                                            <Pie
                                                data={pieImg}
                                                dataKey='value'
                                                nameKey='name'
                                                outerRadius={90}
                                                label
                                            >
                                                {pieImg.map((_, idx) => (
                                                    <Cell
                                                        key={idx}
                                                        fill={colorFor(idx)}
                                                    />
                                                ))}
                                            </Pie>
                                        </g>
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartBox>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fila 2 */}
            <div>
                <ChartTitle>
                    Distribución por tipo de fractura (por sexo)
                </ChartTitle>
                <ChartBox height={300} glow='violet'>
                    <ResponsiveContainer width='100%' height='100%'>
                        <BarChart data={fracturaSexo}>
                            <CartesianGrid
                                stroke={gridStroke}
                                strokeOpacity={0.7}
                            />
                            <XAxis
                                dataKey='tipo_fractura'
                                interval={0}
                                angle={-15}
                                textAnchor='end'
                                height={40}
                            />
                            <YAxis allowDecimals={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar
                                dataKey='Femenino'
                                fill={PALETTE[4]}
                                radius={[8, 8, 0, 0]}
                            />
                            <Bar
                                dataKey='Masculino'
                                fill={PALETTE[0]}
                                radius={[8, 8, 0, 0]}
                            />
                            <Bar
                                dataKey='Otro'
                                fill={PALETTE[2]}
                                radius={[8, 8, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartBox>
            </div>

            {/* Fila 3: COMORBILIDADES */}
            <div className='rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 p-4 shadow-sm border border-orange-100'>
                <div className='mb-3 flex items-center justify-between'>
                    <h3 className='text-lg font-bold text-slate-800'>
                        Riesgo de Refractura por Comorbilidades
                    </h3>
                    {analytics.riesgoRefracturaComorbilidades && (
                        <div className='text-right'>
                            <div className='text-2xl font-bold text-orange-600'>
                                {analytics.riesgoRefracturaComorbilidades.puntuacion_promedio_general.toFixed(
                                    1
                                )}
                                <span className='text-sm text-slate-500 font-normal ml-1'>
                                    / 20
                                </span>
                            </div>
                            <div className='text-xs text-slate-600'>
                                {
                                    analytics.riesgoRefracturaComorbilidades
                                        .interpretacion
                                }
                            </div>
                        </div>
                    )}
                </div>

                <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                    {/* Prevalencia de factores */}
                    <div>
                        <ChartTitle>Prevalencia de factores (%)</ChartTitle>
                        <ChartBox height={280} glow='amber'>
                            <ResponsiveContainer width='100%' height='100%'>
                                <BarChart
                                    data={barsComorb}
                                    layout='vertical'
                                    margin={{ left: 100 }}
                                >
                                    <CartesianGrid
                                        stroke={gridStroke}
                                        strokeOpacity={0.7}
                                    />
                                    <XAxis type='number' domain={[0, 100]} />
                                    <YAxis
                                        type='category'
                                        dataKey='name'
                                        width={90}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar
                                        dataKey='value'
                                        fill={PALETTE[6]}
                                        radius={[0, 8, 8, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartBox>
                    </div>

                    {/* Distribución por nivel de riesgo */}
                    <div>
                        <ChartTitle>
                            Distribución por nivel de riesgo
                        </ChartTitle>
                        <ChartBox height={280} glow='amber'>
                            <ResponsiveContainer width='100%' height='100%'>
                                <BarChart data={distComorb}>
                                    <CartesianGrid
                                        stroke={gridStroke}
                                        strokeOpacity={0.7}
                                    />
                                    <XAxis dataKey='nivel' interval={0} />
                                    <YAxis yAxisId='left' />
                                    <YAxis
                                        yAxisId='right'
                                        orientation='right'
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Bar
                                        yAxisId='left'
                                        dataKey='cantidad'
                                        fill={PALETTE[6]}
                                        radius={[8, 8, 0, 0]}
                                        name='Pacientes'
                                    />
                                    <Bar
                                        yAxisId='right'
                                        dataKey='porcentaje'
                                        fill={PALETTE[2]}
                                        radius={[8, 8, 0, 0]}
                                        name='Porcentaje (%)'
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartBox>
                    </div>
                </div>
            </div>

            {/* Fila 4: HÁBITOS */}
            <div className='rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 p-4 shadow-sm border border-emerald-100'>
                <div className='mb-3 flex items-center justify-between'>
                    <h3 className='text-lg font-bold text-slate-800'>
                        Riesgo de Refractura por Hábitos
                    </h3>
                    {analytics.riesgoRefracturaHabitos && (
                        <div className='text-right'>
                            <div className='text-2xl font-bold text-emerald-600'>
                                {analytics.riesgoRefracturaHabitos.puntuacion_promedio_general.toFixed(
                                    1
                                )}
                                <span className='text-sm text-slate-500 font-normal ml-1'>
                                    / 15
                                </span>
                            </div>
                            <div className='text-xs text-slate-600'>
                                {
                                    analytics.riesgoRefracturaHabitos
                                        .interpretacion
                                }
                            </div>
                        </div>
                    )}
                </div>

                <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                    {/* Prevalencia de factores */}
                    <div>
                        <ChartTitle>Prevalencia de factores (%)</ChartTitle>
                        <ChartBox height={280} glow='emerald'>
                            <ResponsiveContainer width='100%' height='100%'>
                                <BarChart
                                    data={barsHabits}
                                    layout='vertical'
                                    margin={{ left: 150 }}
                                >
                                    <CartesianGrid
                                        stroke={gridStroke}
                                        strokeOpacity={0.7}
                                    />
                                    <XAxis type='number' domain={[0, 100]} />
                                    <YAxis
                                        type='category'
                                        dataKey='name'
                                        width={140}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar
                                        dataKey='value'
                                        fill={PALETTE[5]}
                                        radius={[0, 8, 8, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartBox>
                    </div>

                    {/* Distribución por nivel de riesgo */}
                    <div>
                        <ChartTitle>
                            Distribución por nivel de riesgo
                        </ChartTitle>
                        <ChartBox height={280} glow='emerald'>
                            <ResponsiveContainer width='100%' height='100%'>
                                <BarChart data={distHabits}>
                                    <CartesianGrid
                                        stroke={gridStroke}
                                        strokeOpacity={0.7}
                                    />
                                    <XAxis dataKey='nivel' interval={0} />
                                    <YAxis yAxisId='left' />
                                    <YAxis
                                        yAxisId='right'
                                        orientation='right'
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Bar
                                        yAxisId='left'
                                        dataKey='cantidad'
                                        fill={PALETTE[5]}
                                        radius={[8, 8, 0, 0]}
                                        name='Pacientes'
                                    />
                                    <Bar
                                        yAxisId='right'
                                        dataKey='porcentaje'
                                        fill={PALETTE[1]}
                                        radius={[8, 8, 0, 0]}
                                        name='Porcentaje (%)'
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartBox>
                    </div>
                </div>
            </div>
        </div>
    );
}
