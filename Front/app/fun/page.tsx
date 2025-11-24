'use client';
import { useState, useEffect, useRef } from 'react';
import {
    Droplets,
    Activity,
    FileText,
    AlertTriangle,
    User,
    Ruler,
    Weight,
    UserSearch,
    TrendingUp,
} from 'lucide-react';
import BloodModal from '@/components/Funcionario/modals/BloodModal';
import ParametersModal from '@/components/Funcionario/modals/ParametersModal';
import HistoryModal from '@/components/Funcionario/modals/HistoryModal';
import IndicatorsModal from '@/components/Funcionario/modals/IndicatorsModal';
import AlertsModal from '@/components/Funcionario/modals/AlertsModal';
import RoleGuard from '@/components/RoleGuard';
import Body from '@/components/Funcionario/body';
import { useFuncionario } from '@/contexts/FuncionarioContext';
import type { DetallesPaciente, MuestraLaboratorio } from '@/types/interfaces';
import * as echarts from 'echarts';
import { generarMinutaPDF } from '@/components/Funcionario/modals/MinutaModal';
import { useAuth } from '@/contexts/AuthContext';

type SerieLab = {
    label: string;
    unit: string;
    dates: string[]; 
    ticks: string[];
    values: number[];
};

export default function FuncionarioHome() {
    const { seleccionado, setSeleccionado } = useFuncionario() as {
        seleccionado: DetallesPaciente | undefined;
        setSeleccionado: (paciente: DetallesPaciente | undefined) => void;
    };
    const [showBloodModal, setShowBloodModal] = useState(false);
    const [showParametersModal, setShowParametersModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showAlertsModal, setShowAlertsModal] = useState(false);
    const [showIndicatorsModal, setShowIndicatorsModal] = useState(false);

    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstance = useRef<echarts.ECharts | null>(null);

    const getMaxAlertSeverity = () => {
        if (!seleccionado?.general?.alertas_medicas?.length) return null;
        const activeAlerts = seleccionado.general.alertas_medicas.filter(
            (a) => a.activa
        );
        if (!activeAlerts.length) return null;
        const severityOrder = { ALTA: 3, MEDIA: 2, BAJA: 1 } as const;
        return activeAlerts.reduce(
            (max, a) =>
                severityOrder[a.severidad as keyof typeof severityOrder] >
                severityOrder[max as keyof typeof severityOrder]
                    ? a.severidad
                    : max,
            activeAlerts[0].severidad
        );
    };

    const getAlertButtonStyles = () => {
        const maxSeverity = getMaxAlertSeverity();
        switch (maxSeverity) {
            case 'ALTA':
                return {
                    border: 'border-2 border-red-200 hover:border-red-300 hover:bg-red-50',
                    icon: 'text-red-600 group-hover:text-red-700',
                };
            case 'MEDIA':
                return {
                    border: 'border-2 border-yellow-200 hover:border-yellow-300 hover:bg-yellow-50',
                    icon: 'text-yellow-600 group-hover:text-yellow-700',
                };
            case 'BAJA':
                return {
                    border: 'border-2 border-green-200 hover:border-green-300 hover:bg-green-50',
                    icon: 'text-green-600 group-hover:text-green-700',
                };
            default:
                return {
                    border: 'border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                    icon: 'text-gray-600 group-hover:text-gray-700',
                };
        }
    };

    const getIndicatorsButtonStyles = () => {
        const nivel = seleccionado?.indicadores?.nivel;
        switch (nivel) {
            case 'ALTO':
                return {
                    border: 'border-2 border-red-200 hover:border-red-300 hover:bg-red-50',
                    icon: 'text-red-600 group-hover:text-red-700',
                };
            case 'MEDIO':
                return {
                    border: 'border-2 border-yellow-200 hover:border-yellow-300 hover:bg-yellow-50',
                    icon: 'text-yellow-600 group-hover:text-yellow-700',
                };
            case 'BAJO':
                return {
                    border: 'border-2 border-green-200 hover:border-green-300 hover:bg-green-50',
                    icon: 'text-green-600 group-hover:text-green-700',
                };
            default:
                return {
                    border: 'border-2 border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50',
                    icon: 'text-indigo-600 group-hover:text-indigo-700',
                };
        }
    };

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('es-ES');
    const getBMIStatus = (bmi: number) =>
        bmi < 18.5
            ? 'Bajo peso'
            : bmi < 25
            ? 'Normal'
            : bmi < 30
            ? 'Sobrepeso'
            : 'Obesidad';

    const PARAM_META: Record<string, { label: string; unit: string }> = {
        HB: { label: 'Hemoglobina', unit: 'g/dL' },
        HEMOGLOBINA: { label: 'Hemoglobina', unit: 'g/dL' },
        HGB: { label: 'Hemoglobina', unit: 'g/dL' },

        HTO: { label: 'Hematocrito', unit: '%' },
        HCT: { label: 'Hematocrito', unit: '%' },
        HEMATOCRITO: { label: 'Hematocrito', unit: '%' },

        PLT: { label: 'Plaquetas', unit: '10^3/µL' },
        PLAQUETAS: { label: 'Plaquetas', unit: '10^3/µL' },

        CREA: { label: 'Creatinina', unit: 'mg/dL' },
        CREATININA: { label: 'Creatinina', unit: 'mg/dL' },
        CREAT: { label: 'Creatinina', unit: 'mg/dL' },

        UREA: { label: 'Urea', unit: 'mg/dL' },
        BUN: { label: 'Urea', unit: 'mg/dL' },

        NA: { label: 'Sodio', unit: 'mmol/L' },
        SODIO: { label: 'Sodio', unit: 'mmol/L' },
        K: { label: 'Potasio', unit: 'mmol/L' },
        POTASIO: { label: 'Potasio', unit: 'mmol/L' },
        MG: { label: 'Magnesio', unit: 'mg/dL' },
        MAGNESIO: { label: 'Magnesio', unit: 'mg/dL' },
        PHOS: { label: 'Fósforo', unit: 'mg/dL' },
        FOSFORO: { label: 'Fósforo', unit: 'mg/dL' },
        P: { label: 'Fósforo', unit: 'mg/dL' },

        ALB: { label: 'Albúmina', unit: 'g/dL' },
        ALBUMINA: { label: 'Albúmina', unit: 'g/dL' },

        INR: { label: 'INR', unit: 'sin_unidad' },
        PROT: { label: 'Protrombina', unit: '%' },
        PROTROMBINA: { label: 'Protrombina', unit: '%' },
        TP: { label: 'Protrombina', unit: '%' },

        VITD: { label: 'Vitamina D', unit: 'ng/mL' },
        VITAMINA_D: { label: 'Vitamina D', unit: 'ng/mL' },
        VIT_D: { label: 'Vitamina D', unit: 'ng/mL' },
        FE: { label: 'Hierro', unit: 'µg/dL' },
        HIERRO: { label: 'Hierro', unit: 'µg/dL' },
        IRON: { label: 'Hierro', unit: 'µg/dL' },

        TRANSF: { label: 'Transferrina', unit: 'mg/dL' },
        TRANSFERRINA: { label: 'Transferrina', unit: 'mg/dL' },
        SAT_TRF: { label: 'Saturación Transf.', unit: '%' },

        TSH: { label: 'TSH', unit: 'µIU/mL' },
        T4L: { label: 'T4 Libre', unit: 'ng/dL' },
        T4_LIBRE: { label: 'T4 Libre', unit: 'ng/dL' },

        GLUCOSA: { label: 'Glucosa', unit: 'mg/dL' },
        GLICEMIA: { label: 'Glucosa', unit: 'mg/dL' },
        GLUCOSE: { label: 'Glucosa', unit: 'mg/dL' },
        COLESTEROL_TOTAL: { label: 'Colesterol Total', unit: 'mg/dL' },
        COLESTEROL: { label: 'Colesterol Total', unit: 'mg/dL' },
        CT: { label: 'Colesterol Total', unit: 'mg/dL' },
        TRIGLICERIDOS: { label: 'Triglicéridos', unit: 'mg/dL' },
        TG: { label: 'Triglicéridos', unit: 'mg/dL' },
    };

    const PRIORITY_ORDER = [
        'HB',
        'HEMOGLOBINA',
        'HGB',
        'HTO',
        'HEMATOCRITO',
        'HCT',
        'CREA',
        'CREATININA',
        'UREA',
        'BUN',
        'NA',
        'SODIO',
        'K',
        'POTASIO',
        'ALB',
        'ALBUMINA',
        'INR',
        'VITD',
        'VITAMINA_D',
        'VIT_D',
        'FE',
        'HIERRO',
        'PHOS',
        'FOSFORO',
        'P',
        'MG',
        'MAGNESIO',
        'TSH',
        'T4L',
        'T4_LIBRE',
        'PLT',
        'PLAQUETAS',
        'PROT',
        'PROTROMBINA',
        'TP',
        'TRANSF',
        'TRANSFERRINA',
        'SAT_TRF',
        'GLUCOSA',
        'GLICEMIA',
        'COLESTEROL_TOTAL',
        'COLESTEROL',
        'TRIGLICERIDOS',
        'TG',
    ];

    const processLabData = (): Record<string, SerieLab> | null => {
        const solicitudes = seleccionado?.laboratorio?.solicitudes;
        if (!solicitudes || solicitudes.length === 0) {
            console.log('No hay solicitudes de laboratorio');
            return null;
        }

        const todasLasMuestras: MuestraLaboratorio[] = [];
        for (const solicitud of solicitudes) {
            if (solicitud.muestras && solicitud.muestras.length > 0) {
                todasLasMuestras.push(...solicitud.muestras);
            }
        }

        if (todasLasMuestras.length === 0) {
            console.log('No hay muestras en las solicitudes');
            return null;
        }

        console.log(
            `Procesando ${todasLasMuestras.length} muestras de ${solicitudes.length} exámenes`
        );

        const primeraConResultados = todasLasMuestras.find(
            (m) => m.resultados && m.resultados.length > 0
        );
        if (primeraConResultados) {
            console.log('🔍 Ejemplo de muestra con resultados:', {
                muestra_id: primeraConResultados.muestra_id,
                fecha_recepcion: primeraConResultados.fecha_recepcion,
                fecha_extraccion: primeraConResultados.fecha_extraccion,
                num_resultados: primeraConResultados.resultados?.length || 0,
                primer_resultado: primeraConResultados.resultados?.[0],
                todos_resultados: primeraConResultados.resultados,
            });
        }

        const sorted = [...todasLasMuestras].sort((a, b) => {
            const fechaA = a.fecha_recepcion || a.fecha_extraccion;
            const fechaB = b.fecha_recepcion || b.fecha_extraccion;
            if (!fechaA) return 1;
            if (!fechaB) return -1;
            return new Date(fechaA).getTime() - new Date(fechaB).getTime();
        });

        const byParam: Record<string, Map<string, number>> = {};
        const parametrosEncontrados = new Set<string>();
        const parametrosIgnorados = new Set<string>();

        for (const m of sorted) {
            const fecha = m.fecha_recepcion || m.fecha_extraccion;
            if (!fecha) {
                console.warn('⚠️ Muestra sin fecha:', m.muestra_id);
                continue; 
            }

            const d = new Date(fecha);
            if (isNaN(d.getTime())) {
                console.warn(
                    '⚠️ Fecha inválida:',
                    fecha,
                    'en muestra',
                    m.muestra_id
                );
                continue; 
            }

            const iso = d.toISOString().slice(0, 10); 

            if (m.resultados && m.resultados.length > 0) {
                console.log(
                    `📋 Muestra ${m.muestra_id} tiene ${m.resultados.length} resultados en fecha ${iso}`
                );
            }

            for (const r of m.resultados || []) {
                const code = String(r.parametro || '')
                    .trim()
                    .toUpperCase();

                console.log(
                    `  → Procesando resultado: parametro="${r.parametro}", valor="${r.valor}", code_upper="${code}"`
                );

                if (code) {
                    parametrosEncontrados.add(code);
                }

                if (!PARAM_META[code]) {
                    parametrosIgnorados.add(code);
                    console.log(
                        `    ❌ Parámetro "${code}" NO está en PARAM_META`
                    );
                    continue; 
                }

                console.log(
                    `    ✅ Parámetro "${code}" reconocido: ${PARAM_META[code].label}`
                );
                if (!byParam[code]) byParam[code] = new Map();
                byParam[code].set(iso, Number(r.valor));
            }
        }

        console.log(
            '📊 TODOS los parámetros recibidos desde el backend:',
            Array.from(parametrosEncontrados)
        );
        console.log(
            '✅ Parámetros mapeados (reconocidos):',
            Object.keys(byParam)
        );
        console.log(
            '❌ Parámetros NO mapeados (ignorados):',
            Array.from(parametrosIgnorados)
        );

        console.log(
            '📊 TODOS los parámetros recibidos desde el backend:',
            Array.from(parametrosEncontrados)
        );
        console.log(
            '✅ Parámetros mapeados (reconocidos):',
            Object.keys(byParam)
        );
        console.log(
            '❌ Parámetros NO mapeados (ignorados):',
            Array.from(parametrosIgnorados)
        );

        const allDates = new Set<string>();
        Object.values(byParam).forEach((map) =>
            map.forEach((_v, date) => allDates.add(date))
        );
        const datesSorted = Array.from(allDates).sort();

        const series: Record<string, SerieLab> = {};
        for (const [code, map] of Object.entries(byParam)) {
            const meta = PARAM_META[code];
            const values: number[] = datesSorted.map((d) =>
                map.has(d) ? (map.get(d) as number) : NaN
            );
            const ticks = datesSorted.map((d) => {
                const [y, m, day] = d.split('-').map(Number);
                return new Date(y, m - 1, day).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'short',
                });
            });
            series[code] = {
                label: meta.label,
                unit: meta.unit,
                dates: datesSorted,
                ticks,
                values,
            };
        }

        console.log(`Series construidas: ${Object.keys(series).length}`);
        return Object.keys(series).length ? series : null;
    };

    const buildSparklineOption = (
        seriesMap: Record<string, SerieLab>
    ): echarts.EChartsOption => {
        const byUnit: Record<string, string[]> = {};
        for (const [code, s] of Object.entries(seriesMap)) {
            const unit = s.unit;
            if (!byUnit[unit]) byUnit[unit] = [];
            byUnit[unit].push(code);
        }

        console.log('📊 Agrupación de parámetros por unidad:', byUnit);

        for (const unit in byUnit) {
            byUnit[unit].sort((a, b) => {
                const pa = PRIORITY_ORDER.indexOf(a);
                const pb = PRIORITY_ORDER.indexOf(b);
                const ra = pa === -1 ? 999 : pa;
                const rb = pb === -1 ? 999 : pb;
                if (ra !== rb) return ra - rb;
                const va = seriesMap[a].values.filter(
                    (v) => !Number.isNaN(v)
                ).length;
                const vb = seriesMap[b].values.filter(
                    (v) => !Number.isNaN(v)
                ).length;
                return vb - va;
            });
        }

        const unitPriority: Record<string, number> = {
            'g/dL': 1, 
            '%': 2, 
            'mg/dL': 3, 
            'mmol/L': 4, 
            '10^3/µL': 5, 
            'µg/dL': 6,
            'ng/mL': 7, 
            'µIU/mL': 8, 
            sin_unidad: 9, 
        };

        const units = Object.keys(byUnit).sort((a, b) => {
            const pa = unitPriority[a] || 999;
            const pb = unitPriority[b] || 999;
            return pa - pb;
        });

        const gridHeight = 200; 
        const topOffset = 30;
        const vgap = 40; 

        const option: echarts.EChartsOption = {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'line' },
                formatter: (params: any) => {
                    if (!params?.length) return '';
                    const axisLabel = params[0].axisValue;
                    let s = `<div style="margin-bottom:4px;"><strong>${axisLabel}</strong></div>`;
                    for (const p of params) {
                        const unit = p.seriesName.split(' · ').pop();
                        s += `${p.marker} ${p.seriesName.replace(
                            ` · ${unit}`,
                            ''
                        )}: ${p.value ?? '-'} ${
                            unit === 'sin_unidad' ? '' : unit
                        }<br/>`;
                    }
                    return s;
                },
            },
            grid: [] as any[],
            xAxis: [] as any[],
            yAxis: [] as any[],
            series: [] as any[],
            dataZoom: units.length
                ? [
                      {
                          type: 'slider',
                          xAxisIndex: units.map((_, i) => i),
                          bottom: 0,
                          height: 16,
                      },
                      { type: 'inside', xAxisIndex: units.map((_, i) => i) },
                  ]
                : [],
        };

        const allDates = new Set<string>();
        const allTicks: string[] = [];
        for (const code in seriesMap) {
            const s = seriesMap[code];
            s.dates.forEach((d, idx) => {
                if (!allDates.has(d)) {
                    allDates.add(d);
                    allTicks.push(s.ticks[idx]);
                }
            });
        }
        const datesSorted = Array.from(allDates).sort();
        const ticksSorted = datesSorted.map((d) => {
            const [y, m, day] = d.split('-').map(Number);
            return new Date(y, m - 1, day).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
            });
        });

        units.forEach((unit, i) => {
            const codes = byUnit[unit];
            const top = topOffset + i * (gridHeight + vgap);

            (option.grid as any[]).push({
                left: 80,
                right: 20,
                top,
                height: gridHeight,
                containLabel: true,
            });

            (option.xAxis as any[]).push({
                type: 'category',
                gridIndex: i,
                boundaryGap: true,
                data: ticksSorted,
                axisLabel: { color: '#6B7280', fontSize: 12 },
                axisTick: { show: false },
            });

            (option.yAxis as any[]).push({
                type: 'value',
                gridIndex: i,
                axisLine: { show: false },
                axisTick: { show: false },
                splitLine: { show: true, lineStyle: { color: '#F3F4F6' } },
                axisLabel: {
                    color: '#6B7280',
                    fontSize: 12,
                    formatter: (val: number) => `${val}`,
                },
                name: `${unit === 'sin_unidad' ? 'Valores' : unit}`,
                nameLocation: 'start',
                nameGap: 15,
                nameTextStyle: {
                    color: '#111827',
                    fontSize: 13,
                    fontWeight: 600,
                    align: 'right',
                },
            });

            const colors = [
                '#3b82f6',
                '#10b981',
                '#f59e0b',
                '#ef4444',
                '#8b5cf6',
                '#ec4899',
            ];
            codes.forEach((code, seriesIdx) => {
                const s = seriesMap[code];
                const alignedValues = datesSorted.map((d) => {
                    const idx = s.dates.indexOf(d);
                    return idx >= 0 ? s.values[idx] : NaN;
                });

                (option.series as any[]).push({
                    name: `${s.label} · ${s.unit}`,
                    type: 'line',
                    xAxisIndex: i,
                    yAxisIndex: i,
                    data: alignedValues.map((v) =>
                        Number.isNaN(v) ? null : v
                    ),
                    connectNulls: false,
                    smooth: true,
                    showSymbol: true,
                    symbol: 'circle',
                    symbolSize: 7,
                    lineStyle: { width: 3 },
                    itemStyle: { color: colors[seriesIdx % colors.length] },
                    areaStyle: { opacity: 0.08 },
                    emphasis: { focus: 'series' },
                });
            });
        });

        return option;
    };

    useEffect(() => {
        if (!chartRef.current || !seleccionado) return;

        console.log('Datos de laboratorio del paciente:', {
            tiene_laboratorio: !!seleccionado.laboratorio,
            num_solicitudes: seleccionado.laboratorio?.solicitudes?.length || 0,
            resumen: seleccionado.laboratorio?.resumen_examenes,
        });

        if (!chartInstance.current) {
            chartInstance.current = echarts.init(chartRef.current);
        }

        const seriesMap = processLabData();
        if (!seriesMap || !Object.keys(seriesMap).length) {
            console.log('No se encontraron series de datos para el gráfico');
            chartInstance.current.clear();
            chartInstance.current.setOption({
                title: {
                    text: 'Sin resultados de laboratorio para mostrar',
                    left: 'center',
                    top: 'middle',
                    textStyle: {
                        color: '#6B7280',
                        fontSize: 14,
                        fontWeight: 500,
                    },
                },
            });
            return;
        }

        console.log('Configurando gráfico con series:', Object.keys(seriesMap));
        const option = buildSparklineOption(seriesMap);
        chartInstance.current.setOption(option, true);

        const units = new Set(Object.values(seriesMap).map((s) => s.unit));
        const numGraphs = units.size;
        const graphHeight = 200; 
        const gap = 40; 
        const extraSpace = 80;
        const totalHeight =
            numGraphs * graphHeight + (numGraphs - 1) * gap + extraSpace;
        if (chartRef.current) {
            chartRef.current.style.height = `${totalHeight}px`;
            chartInstance.current.resize();
        }

        const onResize = () => chartInstance.current?.resize();
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [seleccionado]);

    useEffect(() => {
        return () => {
            if (chartInstance.current) {
                chartInstance.current.dispose();
                chartInstance.current = null;
            }
        };
    }, []);

    if (!seleccionado) {
        return (
            <RoleGuard allow={['funcionario']}>
                <div className='min-h-screen bg-gray-50 p-6 flex items-center justify-center'>
                    <div className='text-center'>
                        <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                            No hay paciente seleccionado
                        </h2>
                        <p className='text-gray-600 mb-6'>
                            Selecciona un paciente para ver su información
                        </p>
                        <button
                            onClick={() => setSeleccionado(undefined)}
                            className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                        >
                            Seleccionar Paciente
                        </button>
                    </div>
                </div>
            </RoleGuard>
        );
    }

    const alertStyles = getAlertButtonStyles();
    const indicatorsStyles = getIndicatorsButtonStyles();
    const { user } = useAuth() as any;

    const onGenerarMinuta = async () => {
        if (!seleccionado) return;

        const autor = {
            nombre: user?.name || user?.nombre || user?.fullName || 'Funcionario',
            cargo: user?.cargo || user?.role || 'Funcionario',
            rut: user?.rut || undefined,
            unidad: user?.unidad || user?.department || undefined,
        };
        const blocks = { motivo: '', diagnosticoLibre: '', tratamiento: '' };

        try {
            const blob = await generarMinutaPDF(seleccionado, autor, blocks, {
            maxExamenes: 5,
            download: true,     
            returnBlob: true, 
            });
            if (!blob) return alert('No se pudo generar el PDF.');

            const nombrePaciente = (seleccionado.general.nombre || 'paciente').toString();
            const safeName = nombrePaciente.toLowerCase().replace(/\s+/g, '_');
            const nombreArchivo = `minuta_${safeName}.pdf`;

            const session = localStorage.getItem('session_v1');
            const token = session ? JSON.parse(session).token : null;
            const API_BASE =
            process.env.NEXT_PUBLIC_API_BASE ||
            'https://provider.blocktype.cl/api/v1';

            const form = new FormData();
            const file = new File([blob], nombreArchivo, { type: 'application/pdf' });
            form.append('file', file);

            const uploadResp = await fetch(`${API_BASE}/uploads/minutas`, {
            method: 'POST',
            headers: { Authorization: token ? `Bearer ${token}` : '' },
            body: form,
            });

            if (!uploadResp.ok) {
            const err = await uploadResp.json().catch(() => ({ error: uploadResp.statusText }));
            console.error('Error subiendo PDF:', err);
            return alert('Minuta descargada localmente pero no se pudo subir: ' + (err?.error || uploadResp.statusText));
            }

            const uploaded = await uploadResp.json();
            const ruta_pdf = uploaded?.ruta_pdf;
            if (!ruta_pdf) {
            console.error('Respuesta inválida del upload:', uploaded);
            return alert('Error al subir archivo: respuesta inválida del servidor');
            }

            const resp = await fetch(`${API_BASE}/minutas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: token ? `Bearer ${token}` : '',
            },
            body: JSON.stringify({
                ruta_pdf,
                fecha_creacion: new Date().toISOString(),
                paciente_id: seleccionado.general.paciente_id,
            }),
            });

            if (!resp.ok) {
            const err = await resp.json().catch(() => ({ error: resp.statusText }));
            console.error('Error registrando minuta:', err);
            alert(`Minuta descargada y subida, pero no se pudo registrar: ${err?.error || resp.statusText}`);
            } else {
            console.log('Minuta registrada:', await resp.json());
            alert('Minuta descargada, subida y registrada correctamente.');
            }
        } catch (err) {
            console.error(err);
            alert('No se pudo generar o subir la minuta.');
        }
        };


    return (
        <RoleGuard allow={['funcionario']}>
            <div className='min-h-screen bg-gray-50 p-6'>
                <div className='flex justify-between mb-6'>
                    <div>
                        <h1 className='text-3xl font-bold text-slate-900'>
                            Vista general del paciente
                        </h1>
                        <p className='text-slate-600 mt-2'>
                            Resumen rápido del estado y acciones médicas
                            disponibles
                        </p>
                    </div>
                    <button
                        onClick={() => setSeleccionado(undefined)}
                        className='px-4 py-2 bg-white text-blue-600 rounded-xl border-2 hover:bg-blue-700 hover:text-white transition-colors flex items-center space-x-2'
                    >
                        <UserSearch size={24} />
                        <span>Seleccionar paciente</span>
                    </button>
                </div>

                {/* Header paciente */}
                <div className='bg-white rounded-lg shadow-sm border border-gray-200 mb-6'>
                    <div className='flex justify-between items-center p-6'>
                        <div className='flex items-start space-x-4'>
                            <div className='p-3 bg-blue-100 rounded-full'>
                                <User className='w-8 h-8 text-blue-600' />
                            </div>
                            <div>
                                <h1 className='text-2xl font-semibold text-gray-900 mb-3'>
                                    {seleccionado.general.nombre}
                                </h1>
                                <div className='flex items-center space-x-6 text-sm'>
                                    <div className='flex items-center space-x-2'>
                                        <span className='text-gray-800'>
                                            {seleccionado.general.rut}
                                        </span>
                                    </div>
                                    <div className='w-px h-4 bg-gray-300'></div>
                                    <div className='flex items-center space-x-2'>
                                        <span className='text-gray-800'>
                                            {formatDate(
                                                seleccionado.general
                                                    .fecha_nacimiento
                                            )}
                                        </span>
                                    </div>
                                    <div className='w-px h-4 bg-gray-300'></div>
                                    <div className='flex items-center space-x-2'>
                                        <span className='text-gray-800'>
                                            {seleccionado.general.edad} años{' '}
                                            {seleccionado.general.edad_meses}{' '}
                                            meses
                                        </span>
                                    </div>
                                    <div className='w-px h-4 bg-gray-300'></div>
                                    <div className='flex items-center space-x-2'>
                                        <span className='font-semibold text-red-600'>
                                            {seleccionado.general.tipo_sangre}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={onGenerarMinuta}
                            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-100 hover:text-blue-600 hover:border-2 border-2 border-blue-600 transition-colors flex items-center space-x-2'
                        >
                            <FileText size={24} />
                            <span>Generar Minuta</span>
                        </button>
                    </div>
                </div>

                <div className='grid grid-cols-3 gap-6 mb-6'>
                    {/* Acciones (igual) */}
                    <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                        <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                            Acciones Médicas
                        </h2>
                        <div className='flex flex-col space-y-4'>
                            <button
                                onClick={() => setShowIndicatorsModal(true)}
                                className={`p-4 rounded-lg transition-colors group text-left ${
                                    getIndicatorsButtonStyles().border
                                }`}
                            >
                                <div className='flex items-center space-x-3'>
                                    <TrendingUp
                                        className={`w-8 h-8 ${
                                            getIndicatorsButtonStyles().icon
                                        }`}
                                    />
                                    <div>
                                        <div className='font-medium text-gray-900'>
                                            Indicadores
                                        </div>
                                        <div className='text-sm text-gray-500'>
                                            Riesgo de refractura:{' '}
                                            {seleccionado.indicadores?.suma}
                                        </div>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => setShowBloodModal(true)}
                                className='p-4 border-2 border-red-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors group text-left'
                            >
                                <div className='flex items-center space-x-3'>
                                    <Droplets className='w-8 h-8 text-red-600 group-hover:text-red-700' />
                                    <div>
                                        <div className='font-medium text-gray-900'>
                                            Análisis de Sangre
                                        </div>
                                        <div className='text-sm text-gray-500'>
                                            Ver resultados y parámetros
                                            sanguíneos
                                        </div>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => setShowParametersModal(true)}
                                className='p-4 border-2 border-blue-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group text-left'
                            >
                                <div className='flex items-center space-x-3'>
                                    <Activity className='w-8 h-8 text-blue-600 group-hover:text-blue-700' />
                                    <div>
                                        <div className='font-medium text-gray-900'>
                                            Parámetros Vitales
                                        </div>
                                        <div className='text-sm text-gray-500'>
                                            Monitoreo de signos vitales
                                        </div>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => setShowHistoryModal(true)}
                                className='p-4 border-2 border-green-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors group text-left'
                            >
                                <div className='flex items-center space-x-3'>
                                    <FileText className='w-8 h-8 text-green-600 group-hover:text-green-700' />
                                    <div>
                                        <div className='font-medium text-gray-900'>
                                            Historial Médico
                                        </div>
                                        <div className='text-sm text-gray-500'>
                                            Diagnósticos y tratamientos previos
                                        </div>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => setShowAlertsModal(true)}
                                className={`p-4 rounded-lg transition-colors group text-left ${
                                    getAlertButtonStyles().border
                                }`}
                            >
                                <div className='flex items-center space-x-3'>
                                    <AlertTriangle
                                        className={`w-8 h-8 ${
                                            getAlertButtonStyles().icon
                                        }`}
                                    />
                                    <div>
                                        <div className='font-medium text-gray-900'>
                                            Alertas Médicas
                                        </div>
                                        <div className='text-sm text-gray-500'>
                                            Avisos y parámetros críticos
                                        </div>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Datos físicos (igual) */}
                    <div className='col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                        <h2 className='text-lg font-semibold text-gray-900 mb-6 text-center'>
                            Datos Físicos del Paciente
                        </h2>
                        <div className='relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 rounded-2xl p-8 border-2 border-blue-200/50 shadow-inner min-h-[400px]'>
                            <div className='absolute inset-0 flex justify-center items-center pointer-events-none'>
                                <Body className='w-56 h-96 text-blue-300/30' />
                            </div>

                            <div className='relative z-10 h-[400px] flex flex-col justify-between items-start py-4'>
                                <div className='flex justify-center'>
                                    <div className='group bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-blue-200/60 transform hover:scale-105 transition-all duration-300 cursor-pointer'>
                                        <div className='group-hover:hidden px-4 py-2'>
                                            <div className='text-lg font-bold text-blue-900'>
                                                {Math.round(
                                                    seleccionado.general.altura
                                                        ? seleccionado.general
                                                              .altura
                                                        : 0
                                                )}
                                                cm
                                            </div>
                                        </div>
                                        <div className='hidden group-hover:block px-6 py-4'>
                                            <div className='flex items-center space-x-3'>
                                                <div className='p-2 bg-blue-100 rounded-full'>
                                                    <Ruler className='w-5 h-5 text-blue-600' />
                                                </div>
                                                <div>
                                                    <div className='text-xs font-medium text-blue-700 uppercase tracking-wide'>
                                                        Altura
                                                    </div>
                                                    <div className='text-xl font-bold text-blue-900'>
                                                        {Math.round(
                                                            seleccionado.general
                                                                .altura
                                                                ? seleccionado
                                                                      .general
                                                                      .altura
                                                                : 0
                                                        )}
                                                    </div>
                                                    <div className='text-xs text-blue-600'>
                                                        centímetros
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className='flex justify-start '>
                                    <div className='group bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-green-200/60 transform hover:scale-105 transition-all duration-300 cursor-pointer'>
                                        <div className='group-hover:hidden px-4 py-2'>
                                            <div className='text-lg font-bold text-green-900'>
                                                {seleccionado.general.peso
                                                    ? seleccionado.general.peso
                                                    : 0}
                                                kg
                                            </div>
                                        </div>
                                        <div className='hidden group-hover:block px-6 py-4'>
                                            <div className='flex items-center space-x-3'>
                                                <div className='p-2 bg-green-100 rounded-full'>
                                                    <Weight className='w-5 h-5 text-green-600' />
                                                </div>
                                                <div>
                                                    <div className='text-xs font-medium text-green-700 uppercase tracking-wide'>
                                                        Peso
                                                    </div>
                                                    <div className='text-xl font-bold text-green-900'>
                                                        {seleccionado.general
                                                            .peso
                                                            ? seleccionado
                                                                  .general.peso
                                                            : 0}
                                                    </div>
                                                    <div className='text-xs text-green-600'>
                                                        kilogramos
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className='flex justify-end '>
                                    <div className='group bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-purple-200/60 transform hover:scale-105 transition-all duration-300 cursor-pointer'>
                                        <div className='group-hover:hidden px-4 py-2'>
                                            <div className='text-lg font-bold text-purple-900'>
                                                {(seleccionado.general.IMC
                                                    ? seleccionado.general.IMC
                                                    : 0
                                                ).toFixed(1)}
                                                kg/m²
                                            </div>
                                        </div>
                                        <div className='hidden group-hover:block px-6 py-4'>
                                            <div className='flex items-center space-x-3'>
                                                <div className='p-2 bg-purple-100 rounded-full'>
                                                    <Activity className='w-5 h-5 text-purple-600' />
                                                </div>
                                                <div>
                                                    <div className='text-xs font-medium text-purple-700 uppercase tracking-wide'>
                                                        IMC (kg/m²)
                                                    </div>
                                                    <div className='text-xl font-bold text-purple-900'>
                                                        {(seleccionado.general
                                                            .IMC
                                                            ? seleccionado
                                                                  .general.IMC
                                                            : 0
                                                        ).toFixed(1)}
                                                    </div>
                                                    <div className='text-xs text-purple-600'>
                                                        {getBMIStatus(
                                                            seleccionado.general
                                                                .IMC
                                                                ? seleccionado
                                                                      .general
                                                                      .IMC
                                                                : 0
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* KPIs (igual) */}
                <div className='grid grid-cols-4 gap-4 mb-6'>
                    <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
                        <div className='text-center'>
                            <div className='text-2xl font-bold text-blue-600 mb-1'>
                                {seleccionado.general.tdc_dias}
                            </div>
                            <div className='text-sm font-medium text-gray-900 mb-1'>
                                TDC (Dx→Cx)
                            </div>
                            <div className='text-xs text-gray-500'>días</div>
                        </div>
                    </div>
                    <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
                        <div className='text-center'>
                            <div className='text-2xl font-bold text-green-600 mb-1'>
                                {seleccionado.general.tpo_dias}
                            </div>
                            <div className='text-sm font-medium text-gray-900 mb-1'>
                                TPO (Cx→Alta)
                            </div>
                            <div className='text-xs text-gray-500'>días</div>
                        </div>
                    </div>
                    <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
                        <div className='text-center'>
                            <div className='text-2xl font-bold text-purple-600 mb-1'>
                                {seleccionado.general.tth_dias}
                            </div>
                            <div className='text-sm font-medium text-gray-900 mb-1'>
                                TTH (Dx→Alta)
                            </div>
                            <div className='text-xs text-gray-500'>días</div>
                        </div>
                    </div>
                    <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
                        <div className='text-center'>
                            <div className='text-lg font-semibold text-red-600 mb-1'>
                                {seleccionado.general.dx_actual?.cie10}
                            </div>
                            <div className='text-sm font-medium text-gray-900 mb-1'>
                                Dx actual
                            </div>
                            <div className='text-xs text-gray-500'>
                                {seleccionado.general.dx_actual?.tipo_fractura}
                            </div>
                        </div>
                    </div>
                </div>

                {/* === Nuevo gráfico: Sparkline grid dinámico === */}
                <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                    <h3 className='text-base font-semibold text-gray-900 mb-2'>
                        Tendencias de laboratorio (parámetros agrupados por
                        unidad)
                    </h3>
                    <div
                        ref={chartRef}
                        className='w-full'
                        style={{ minHeight: '300px' }}
                    />
                </div>

                {/* Modales */}
                <BloodModal
                    isOpen={showBloodModal}
                    onClose={() => setShowBloodModal(false)}
                    paciente={seleccionado}
                />
                <ParametersModal
                    isOpen={showParametersModal}
                    onClose={() => setShowParametersModal(false)}
                    paciente={seleccionado}
                />
                <HistoryModal
                    isOpen={showHistoryModal}
                    onClose={() => setShowHistoryModal(false)}
                    paciente={seleccionado}
                />
                <AlertsModal
                    isOpen={showAlertsModal}
                    onClose={() => setShowAlertsModal(false)}
                    paciente={seleccionado}
                />
                <IndicatorsModal
                    isOpen={showIndicatorsModal}
                    onClose={() => setShowIndicatorsModal(false)}
                    paciente={seleccionado}
                />
            </div>
        </RoleGuard>
    );
}
