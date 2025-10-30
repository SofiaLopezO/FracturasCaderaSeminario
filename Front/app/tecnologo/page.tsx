'use client';

import { useMemo, useState } from 'react';
import {
    User,
    UserSearch,
    Calendar,
    ChevronDown,
    Download,
    Filter,
    Search,
} from 'lucide-react';
import RoleGuard from '@/components/RoleGuard';
import { useTecnologo } from '@/contexts/TecnologoContext';
import type { DetallesPaciente } from '@/types/interfaces';
import BloodTypeSetter from '@/components/Tecnologo/BloodTypeSetter';

/* ==============================
   Helpers básicos
============================== */
function formatDate(dateString?: string | null) {
    if (!dateString) return '—';
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('es-ES');
}
function fmtFechaLarga(fecha?: string | null) {
    if (!fecha) return '—';
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('es-CL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/* ==============================
   UI mini (Card y Button)
============================== */
function Card({
    children,
    className = '',
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}
        >
            {children}
        </div>
    );
}
function CardHeader({ children }: { children: React.ReactNode }) {
    return <div className='p-6 pb-4'>{children}</div>;
}
function CardContent({ children }: { children: React.ReactNode }) {
    return <div className='px-6 pb-6'>{children}</div>;
}
function CardTitle({ children }: { children: React.ReactNode }) {
    return <h3 className='text-lg font-semibold text-gray-900'>{children}</h3>;
}
function CardDescription({ children }: { children: React.ReactNode }) {
    return <p className='text-sm text-gray-600 mt-1'>{children}</p>;
}
function CardHeaderWithIcon({
    icon,
    title,
    subtitle,
}: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
}) {
    return (
        <CardHeader>
            <div className='flex items-center gap-3'>
                <div className='rounded-xl bg-slate-100 p-2 text-slate-700'>
                    {icon}
                </div>
                <div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{subtitle}</CardDescription>
                </div>
            </div>
        </CardHeader>
    );
}
function Button({
    children,
    onClick,
    variant = 'default',
    className = '',
}: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'default' | 'secondary' | 'ghost';
    className?: string;
}) {
    const base =
        'inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
    const variants = {
        default: 'bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
        ghost: 'text-gray-600 hover:bg-gray-100',
    } as const;
    return (
        <button
            onClick={onClick}
            className={`${base} ${variants[variant]} ${className}`}
        >
            {children}
        </button>
    );
}

/* ==============================
   Tipos UI estandarizados para exámenes
============================== */
type ResultadoUI = {
    resultado_id: string | number;
    parametro: string;
    valor: string | number;
    unidad?: string | null;
    fecha_resultado?: string | null;
};
type MuestraUI = {
    muestra_id: string | number;
    tipo_muestra: string;
    fecha_recepcion?: string | null;
    fecha_extraccion?: string | null;
    validado_por?: string | null;
    observaciones?: string | null;
    Resultados: ResultadoUI[];
};
type ExamenUI = {
    examen_id: string | number;
    tipo_examen: string;
    muestras: MuestraUI[];
};

/* ==============================
   Panel de exámenes (replica del portal de Pacientes)
============================== */
function LabExamsPanel() {
    const { detalles } = useTecnologo();

    // Mapear detalles.laboratorio.solicitudes -> ExamenUI[]
    const examenes: ExamenUI[] = useMemo(() => {
        const solicitudes = (detalles as any)?.laboratorio?.solicitudes ?? [];
        if (!Array.isArray(solicitudes)) return [];
        return solicitudes.map((sol: any, i: number) => {
            const muestrasSrc = sol?.muestras ?? [];
            const muestras: MuestraUI[] = Array.isArray(muestrasSrc)
                ? muestrasSrc.map((m: any, j: number) => ({
                      muestra_id: m?.muestra_id ?? m?.id ?? `${i}-${j}`,
                      tipo_muestra: m?.tipo_muestra ?? m?.tipo ?? 'SANGRE',
                      fecha_recepcion: m?.fecha_recepcion ?? null,
                      fecha_extraccion: m?.fecha_extraccion ?? null,
                      validado_por: m?.validado_por ?? m?.validador ?? null,
                      observaciones: m?.observaciones ?? m?.observacion ?? null,
                      Resultados: Array.isArray(m?.Resultados ?? m?.resultados)
                          ? (m.Resultados ?? m.resultados).map(
                                (r: any, k: number): ResultadoUI => ({
                                    resultado_id:
                                        r?.resultado_id ??
                                        r?.id ??
                                        `${i}-${j}-${k}`,
                                    parametro: r?.parametro ?? '-',
                                    valor: r?.valor ?? '-',
                                    unidad: r?.unidad ?? null,
                                    fecha_resultado:
                                        r?.fecha_resultado ??
                                        m?.fecha_recepcion ??
                                        null,
                                })
                            )
                          : [],
                  }))
                : [];
            return {
                examen_id: sol?.examen_id ?? sol?.id ?? i + 1,
                tipo_examen: sol?.tipo_examen ?? sol?.tipo ?? 'LABORATORIO',
                muestras,
            };
        });
    }, [detalles]);

    const [abiertas, setAbiertas] = useState<Set<string | number>>(new Set());
    const [filtros, setFiltros] = useState({
        tipoMuestra: '',
        tipoExamen: '',
        busqueda: '',
    });

    const optsTipoExamen = useMemo(
        () => ['', ...Array.from(new Set(examenes.map((e) => e.tipo_examen)))],
        [examenes]
    );
    const optsTipoMuestra = useMemo(
        () => [
            '',
            ...Array.from(
                new Set(
                    examenes.flatMap(
                        (e) => e.muestras?.map((m) => m.tipo_muestra) ?? []
                    )
                )
            ),
        ],
        [examenes]
    );

    const examenesFiltrados = useMemo(() => {
        const q = filtros.busqueda.trim().toLowerCase();
        return examenes.filter((ex) => {
            const byExamen =
                !filtros.tipoExamen || ex.tipo_examen === filtros.tipoExamen;
            const byMuestra =
                !filtros.tipoMuestra ||
                ex.muestras?.some(
                    (m) => m.tipo_muestra === filtros.tipoMuestra
                );
            const byQ =
                !q ||
                String(ex.examen_id).includes(q) ||
                ex.tipo_examen.toLowerCase().includes(q) ||
                ex.muestras?.some((m) =>
                    m.Resultados?.some((r) =>
                        String(r.parametro).toLowerCase().includes(q)
                    )
                );
            return byExamen && byMuestra && byQ;
        });
    }, [examenes, filtros]);

    const toggle = (id: string | number) => {
        const s = new Set(abiertas);
        s.has(id) ? s.delete(id) : s.add(id);
        setAbiertas(s);
    };

    // Descarga
    const descargarExamenCompleto = async (examen: ExamenUI) => {
        try {
            const user = localStorage.getItem('session_v1');
            const token = user ? JSON.parse(user).token : null;

            const resp = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE}/examenes/${examen.examen_id}/muestras`,
                { headers: { Authorization: token ? `Bearer ${token}` : '' } }
            );
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

            const ct = resp.headers.get('content-type') || '';
            if (ct.includes('application/pdf')) {
                const blob = await resp.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `examen_${examen.examen_id}_${examen.tipo_examen}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
            } else if (ct.includes('text/plain')) {
                const text = await resp.text();
                const blob = new Blob([text], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `examen_${examen.examen_id}_${examen.tipo_examen}.txt`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
            } else {
                const json = await resp.json();
                const blob = new Blob([JSON.stringify(json, null, 2)], {
                    type: 'application/json',
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `examen_${examen.examen_id}_datos.json`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
            }
        } catch (e) {
            console.error('Error al descargar el examen:', e);
            alert('Error al descargar el examen. Inténtalo nuevamente.');
        }
    };

    return (
        <div className='grid gap-6 mt-6'>
            {/* Filtros */}
            <Card>
                <CardHeaderWithIcon
                    icon={<Filter className='h-5 w-5' />}
                    title='Filtros y Búsqueda'
                    subtitle='Encuentra exámenes específicos'
                />
                <CardContent>
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                        <div className='relative'>
                            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                            <input
                                type='text'
                                placeholder='Buscar por tipo o parámetro...'
                                value={filtros.busqueda}
                                onChange={(e) =>
                                    setFiltros((f) => ({
                                        ...f,
                                        busqueda: e.target.value,
                                    }))
                                }
                                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            />
                        </div>
                        <select
                            value={filtros.tipoExamen}
                            onChange={(e) =>
                                setFiltros((f) => ({
                                    ...f,
                                    tipoExamen: e.target.value,
                                }))
                            }
                            className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        >
                            <option value=''>Tipo de examen</option>
                            {optsTipoExamen.slice(1).map((v) => (
                                <option key={v} value={v}>
                                    {v}
                                </option>
                            ))}
                        </select>
                        <select
                            value={filtros.tipoMuestra}
                            onChange={(e) =>
                                setFiltros((f) => ({
                                    ...f,
                                    tipoMuestra: e.target.value,
                                }))
                            }
                            className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        >
                            <option value=''>Tipo de muestra</option>
                            {optsTipoMuestra.slice(1).map((v) => (
                                <option key={v} value={v}>
                                    {v}
                                </option>
                            ))}
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Lista expandible */}
            <Card>
                <CardHeaderWithIcon
                    icon={<Calendar className='h-5 w-5' />}
                    title={`Exámenes de Laboratorio (${examenesFiltrados.length})`}
                    subtitle='Lista expandible de exámenes'
                />
                <CardContent>
                    <div className='space-y-4'>
                        {examenesFiltrados.length === 0 ? (
                            <div className='text-center py-8 text-gray-500'>
                                No se encontraron exámenes
                            </div>
                        ) : (
                            examenesFiltrados.map((ex) => {
                                const id = ex.examen_id;
                                const abierto = abiertas.has(id);
                                const totalMuestras = ex.muestras?.length || 0;
                                const totalResultados =
                                    ex.muestras?.reduce(
                                        (acc, m) =>
                                            acc + (m.Resultados?.length || 0),
                                        0
                                    ) || 0;
                                const primeraFecha =
                                    ex.muestras?.[0]?.fecha_recepcion;

                                return (
                                    <div
                                        key={String(id)}
                                        className='border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow'
                                    >
                                        <div
                                            className='p-4 cursor-pointer'
                                            onClick={() => toggle(id)}
                                        >
                                            <div className='flex items-center justify-between'>
                                                <div className='flex items-center gap-4'>
                                                    <div className='flex flex-col'>
                                                        <div className='font-semibold text-gray-900'>
                                                            Examen -{' '}
                                                            {ex.tipo_examen}
                                                        </div>
                                                        <div className='text-sm text-gray-600 flex items-center gap-2'>
                                                            <Calendar className='h-3 w-3' />
                                                            {primeraFecha
                                                                ? fmtFechaLarga(
                                                                      primeraFecha
                                                                  )
                                                                : 'Sin fecha'}
                                                        </div>
                                                    </div>
                                                    <div className='hidden md:flex flex-col gap-1'>
                                                        <div className='text-sm font-medium'>
                                                            {totalMuestras}{' '}
                                                            muestra(s)
                                                        </div>
                                                        <div className='text-xs text-gray-600'>
                                                            {totalResultados}{' '}
                                                            resultado(s)
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className='flex items-center gap-2'>
                                                    <span className='text-xs text-gray-600'>
                                                        {totalMuestras}{' '}
                                                        muestra(s)
                                                    </span>
                                                    <ChevronDown
                                                        className={`h-4 w-4 transition-transform ${
                                                            abierto
                                                                ? 'rotate-180'
                                                                : ''
                                                        }`}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {abierto && (
                                            <div className='border-t border-gray-200 bg-gray-50 p-4'>
                                                <div className='flex justify-between items-center mb-4'>
                                                    <h4 className='font-medium text-gray-900'>
                                                        Muestras y Resultados
                                                    </h4>
                                                    <Button
                                                        onClick={() =>
                                                            descargarExamenCompleto(
                                                                ex
                                                            )
                                                        }
                                                    >
                                                        <Download className='h-4 w-4' />
                                                        Descargar todo
                                                    </Button>
                                                </div>

                                                <div className='space-y-4'>
                                                    {ex.muestras?.map((m) => (
                                                        <div
                                                            key={String(
                                                                m.muestra_id
                                                            )}
                                                            className='bg-white rounded-lg border border-gray-200 p-4'
                                                        >
                                                            <div className='font-medium text-gray-900 mb-2'>
                                                                Muestra -{' '}
                                                                {m.tipo_muestra}
                                                            </div>
                                                            <div className='text-sm text-gray-600 mb-3'>
                                                                Recepción:{' '}
                                                                {fmtFechaLarga(
                                                                    m.fecha_recepcion
                                                                )}{' '}
                                                                | Validador:{' '}
                                                                {m.validado_por ??
                                                                    '—'}{' '}
                                                                | Extracción:{' '}
                                                                {fmtFechaLarga(
                                                                    m.fecha_extraccion
                                                                )}
                                                            </div>
                                                            <div className='text-sm text-gray-600 mb-3'>
                                                                Observación:{' '}
                                                                {m.observaciones
                                                                    ? ` ${m.observaciones}`
                                                                    : '—'}
                                                            </div>

                                                            {m.Resultados
                                                                ?.length ? (
                                                                <div className='space-y-2'>
                                                                    {m.Resultados.map(
                                                                        (r) => (
                                                                            <div
                                                                                key={String(
                                                                                    r.resultado_id
                                                                                )}
                                                                                className='flex items-center justify-between p-2 bg-gray-50 rounded'
                                                                            >
                                                                                <div className='flex items-center gap-4'>
                                                                                    <div className='flex flex-col'>
                                                                                        <div className='font-medium text-gray-900'>
                                                                                            {
                                                                                                r.parametro
                                                                                            }
                                                                                        </div>
                                                                                        <div className='text-sm text-gray-600'>
                                                                                            Valor:{' '}
                                                                                            {
                                                                                                r.valor
                                                                                            }{' '}
                                                                                            {r.unidad ||
                                                                                                ''}
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className='text-xs text-gray-500'>
                                                                                        {fmtFechaLarga(
                                                                                            r.fecha_resultado
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div className='text-center py-2 text-gray-500 text-sm'>
                                                                    No hay
                                                                    resultados
                                                                    disponibles
                                                                    para esta
                                                                    muestra
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

/* ==============================
   Página principal del Tecnólogo
============================== */
export function TecnologoDashboard() {
    const { detalles: seleccionado, clearSelection } = useTecnologo();

    if (!seleccionado) {
        return (
            <div className='min-h-screen bg-gray-50 p-6 flex items-center justify-center'>
                <div className='text-center'>
                    <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                        No hay paciente seleccionado
                    </h2>
                </div>
            </div>
        );
    }

    const general = (seleccionado as DetallesPaciente).general;
    const rutFmt = general?.rut
        ? String(general.rut).replace(
              /^(\d{1,2})(\d{3})(\d{3})([0-9kK])$/,
              '$1.$2.$3-$4'
          )
        : '—';

    const edadDescripcion =
        general?.edad != null
            ? `${general.edad} años${
                  general?.edad_meses ? ` ${general.edad_meses} meses` : ''
              }`
            : '—';

    // Cálculo SEGURO del ID de paciente (evita TS errors si no existen en el tipo)
    const pacienteId =
        (general as any)?.user_id ??
        (general as any)?.paciente_id ??
        (general as any)?.id ??
        (seleccionado as any)?.user_id ??
        (seleccionado as any)?.id ??
        0;

    return (
        <div className='min-h-screen bg-gray-50 p-6'>
            {/* Header + ficha básica */}
            <div className='flex justify-between mb-6'>
                <div>
                    <h1 className='text-3xl font-bold text-slate-900'>
                        Vista general del paciente
                    </h1>
                    <p className='text-slate-600 mt-2'>Resumen básico</p>
                </div>
                <button
                    onClick={clearSelection}
                    className='px-4 py-2 bg-white text-blue-600 rounded-xl border-2 hover:bg-blue-700 hover:text-white transition-colors flex items-center space-x-2'
                >
                    <UserSearch size={24} />
                    <span>Seleccionar paciente</span>
                </button>
            </div>

            <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
                <div className='flex items-start gap-4 p-6'>
                    <div className='p-3 bg-blue-100 rounded-full'>
                        <User className='w-8 h-8 text-blue-600' />
                    </div>
                    <div className='space-y-2'>
                        <h2 className='text-2xl font-semibold text-gray-900'>
                            {general?.nombre ?? 'Paciente'}
                        </h2>
                        <div className='flex flex-wrap items-center gap-x-6 gap-y-2 text-sm'>
                            <div className='text-gray-800'>
                                <span className='font-medium'>RUT: </span>
                                {rutFmt}
                            </div>
                            <div className='w-px h-4 bg-gray-300' />
                            <div className='text-gray-800'>
                                <span className='font-medium'>
                                    Fecha de nacimiento:{' '}
                                </span>
                                {formatDate(general?.fecha_nacimiento)}
                            </div>
                            <div className='w-px h-4 bg-gray-300' />
                            <div className='text-gray-800'>
                                <span className='font-medium'>Edad: </span>
                                {edadDescripcion}
                            </div>
                            <div className='w-px h-4 bg-gray-300' />
                            <div className='text-gray-800'>
                                <span className='font-medium'>Sexo: </span>
                                {general?.sexo ?? '—'}
                            </div>
                            <div className='w-px h-4 bg-gray-300' />
                            {/* Tipo de sangre: editable una sola vez si está vacío */}
                            <div className='flex items-center gap-2'>
                                <span className='font-medium'>
                                    Tipo de sangre:
                                </span>
                                <BloodTypeSetter
                                    pacienteId={pacienteId}
                                    initialValue={general?.tipo_sangre ?? null}
                                    onSaved={(nuevo) => {
                                        if (general)
                                            (general as any).tipo_sangre =
                                                nuevo;
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Panel de exámenes */}
            <LabExamsPanel />
        </div>
    );
}

export default function TecnologoHomePage() {
    return (
        <RoleGuard allow={['tecnologo']}>
            <TecnologoDashboard />
        </RoleGuard>
    );
}
