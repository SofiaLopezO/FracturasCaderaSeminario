'use client';

import type React from 'react';
import { useEffect, useMemo, useState } from 'react';

import RoleGuard from '@/components/RoleGuard';
import ExamFormFrame from '@/components/Tecnologo/ExamFormFrame';
import { useTecnologo } from '@/contexts/TecnologoContext';
import { Upload, FileText, X, Plus } from 'lucide-react';

type ParamFromApi = {
    codigo: string;
    nombre: string;
    unidad: string | null; // puede venir '' o null si no tiene
    ref_min: number | null; // puede venir null
    ref_max: number | null; // puede venir null
    notas?: string;
    tipo_examen_id?: number | null;
    tipo_muestra_id?: number | null;
};

type MuestraFromApi = {
    tipo_muestra: string;
    parametros: ParamFromApi[];
};

type ExamenFromApi = {
    tipo_examen: string;
    muestras: MuestraFromApi[];
};

type CatalogoResponse = {
    examenes: ExamenFromApi[];
};

type ManualRow = {
    id: number;
    parametro: string; // codigo
    valor: string;
    unidad: string;
    ref_min: number | null;
    ref_max: number | null;
};

export default function Page() {
    const { paciente } = useTecnologo();

    const [activeTab, setActiveTab] = useState<'manual' | 'archivo'>('manual');
    const [tipoExamen, setTipoExamen] = useState<string>('');
    const [tipoMuestra, setTipoMuestra] = useState<string>('');

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

    // ------- Catálogo completo desde API -------
    const [catalogo, setCatalogo] = useState<CatalogoResponse | null>(null);
    const [catalogoLoading, setCatalogoLoading] = useState(false);
    const [catalogoError, setCatalogoError] = useState<string | null>(null);

    // ------- Parámetros filtrados -------
    const [paramOptions, setParamOptions] = useState<ParamFromApi[]>([]);

    const apiBase =
        process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3001/api/v1';

    // ------- Cargar catálogo completo al montar -------
    useEffect(() => {
        const controller = new AbortController();
        setCatalogoLoading(true);
        setCatalogoError(null);

        fetch(`${apiBase}/parametros/catalogo`, {
            credentials: 'include',
            signal: controller.signal,
        })
            .then(async (r) => {
                if (!r.ok) {
                    const msg =
                        (await r.json().catch(() => null))?.error ||
                        'Error al cargar el catálogo';
                    throw new Error(msg);
                }
                return r.json() as Promise<CatalogoResponse>;
            })
            .then((data) => {
                setCatalogo(data);
                // Inicializar con el primer examen y primera muestra si existen
                if (data.examenes && data.examenes.length > 0) {
                    const primerExamen = data.examenes[0];
                    setTipoExamen(primerExamen.tipo_examen);
                    if (
                        primerExamen.muestras &&
                        primerExamen.muestras.length > 0
                    ) {
                        setTipoMuestra(primerExamen.muestras[0].tipo_muestra);
                    }
                }
            })
            .catch((err) => {
                if (err?.name !== 'AbortError') {
                    setCatalogoError(
                        err?.message || 'Error al cargar el catálogo'
                    );
                }
            })
            .finally(() => setCatalogoLoading(false));

        return () => controller.abort();
    }, [apiBase]);

    // ------- Filtrar parámetros según tipo_examen y tipo_muestra -------
    useEffect(() => {
        if (!catalogo || !tipoExamen || !tipoMuestra) {
            setParamOptions([]);
            return;
        }

        const examen = catalogo.examenes.find(
            (e) => e.tipo_examen === tipoExamen
        );
        if (!examen) {
            setParamOptions([]);
            return;
        }

        const muestra = examen.muestras.find(
            (m) => m.tipo_muestra === tipoMuestra
        );
        if (!muestra) {
            setParamOptions([]);
            return;
        }

        setParamOptions(muestra.parametros || []);
    }, [catalogo, tipoExamen, tipoMuestra]);

    const hasParams = useMemo(() => paramOptions.length > 0, [paramOptions]);

    // ------- Acciones de filas -------
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
        if (manualRows.length > 1) {
            setManualRows(manualRows.filter((r) => r.id !== id));
        }
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
        setManualRows((rows) =>
            rows.map((r) => (r.id === rowId ? { ...r, valor } : r))
        );
    };

    // color del input de resultado según ref_min/ref_max
    const resultClasses = (row: ManualRow) => {
        const v = parseFloat(row.valor.replace(',', '.'));
        const isNumber = !Number.isNaN(v);
        if (!isNumber || row.ref_min == null || row.ref_max == null)
            return 'border-gray-300';
        if (v < row.ref_min || v > row.ref_max)
            return 'border-red-500 bg-red-50';
        return 'border-green-500 bg-green-50';
    };

    // Cambiar tipo de examen: reset de muestra y parámetros en filas
    const handleTipoExamenChange = (
        e: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const te = e.target.value;
        setTipoExamen(te);

        // Resetear tipo de muestra a la primera disponible del nuevo examen
        const examen = catalogo?.examenes.find((ex) => ex.tipo_examen === te);
        if (examen && examen.muestras && examen.muestras.length > 0) {
            setTipoMuestra(examen.muestras[0].tipo_muestra);
        } else {
            setTipoMuestra('');
        }

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

    // Cambiar tipo de muestra: reset de parámetros en filas
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

    // ------- Drag & drop archivo (pestaña "archivo") -------
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
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (
                file.type === 'application/pdf' ||
                file.type === 'text/plain' ||
                file.type === 'application/json'
            ) {
                setSelectedFile(file);
            }
        }
    };
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) setSelectedFile(files[0]);
    };
    const removeFile = () => setSelectedFile(null);

    // Reset UI local luego de guardar OK en ExamFormFrame
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

        // Reinicializar con el primer examen y primera muestra
        if (catalogo?.examenes && catalogo.examenes.length > 0) {
            const primerExamen = catalogo.examenes[0];
            setTipoExamen(primerExamen.tipo_examen);
            if (primerExamen.muestras && primerExamen.muestras.length > 0) {
                setTipoMuestra(primerExamen.muestras[0].tipo_muestra);
            }
        }
    };

    return (
        <RoleGuard allow={['tecnologo']}>
            <div className='mb-6'>
                <h1 className='text-3xl font-bold text-slate-900'>
                    Subir examen de laboratorio
                </h1>
                <p className='text-slate-600 mt-2'>
                    Gestión completa de resultados de laboratorio
                </p>
            </div>

            {/* examType controla el tipo en el payload; esta pantalla es laboratorio */}
            <ExamFormFrame
                paciente_id={paciente?.user_id}
                examType='LABORATORIO'
                onSuccess={handleSuccess}
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

                {activeTab === 'manual' && (
                    <div>
                        <div className='grid gap-4 sm:grid-cols-2'>
                            <label className='flex flex-col gap-1'>
                                <span className='text-sm text-slate-700'>
                                    Tipo de examen
                                </span>
                                <select
                                    name='tipo_examen'
                                    className='border rounded-lg px-3 py-2'
                                    value={tipoExamen}
                                    onChange={handleTipoExamenChange}
                                    disabled={catalogoLoading || !catalogo}
                                >
                                    <option value=''>
                                        {catalogoLoading
                                            ? 'Cargando...'
                                            : 'Seleccionar tipo de examen'}
                                    </option>
                                    {catalogo?.examenes.map((e) => (
                                        <option
                                            key={e.tipo_examen}
                                            value={e.tipo_examen}
                                        >
                                            {e.tipo_examen}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className='flex flex-col gap-1'>
                                <span className='text-sm text-slate-700'>
                                    Tipo de muestra
                                </span>
                                <select
                                    name='tipo_muestra'
                                    className='border rounded-lg px-3 py-2'
                                    value={tipoMuestra}
                                    onChange={handleTipoMuestraChange}
                                    disabled={!tipoExamen || catalogoLoading}
                                >
                                    <option value=''>
                                        Seleccionar tipo de muestra
                                    </option>
                                    {catalogo?.examenes
                                        .find(
                                            (e) => e.tipo_examen === tipoExamen
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
                                    className='border rounded-lg px-3 py-2'
                                />
                            </label>

                            <label className='flex flex-col gap-1'>
                                <span className='text-sm text-slate-700'>
                                    Fecha/hora de extracción
                                </span>
                                <input
                                    name='fecha_extraccion'
                                    type='datetime-local'
                                    className='border rounded-lg px-3 py-2'
                                />
                            </label>
                        </div>

                        {/* Estado de carga/errores del catálogo */}
                        {catalogoLoading && (
                            <div className='text-sm text-slate-500 mt-2'>
                                Cargando catálogo de exámenes…
                            </div>
                        )}
                        {catalogoError && (
                            <div className='text-sm text-red-600 mt-2'>
                                {catalogoError}
                            </div>
                        )}
                        {!catalogoLoading &&
                            !hasParams &&
                            tipoExamen &&
                            tipoMuestra && (
                                <div className='text-sm text-slate-500 mt-2'>
                                    No hay parámetros para {tipoExamen} -{' '}
                                    {tipoMuestra}.
                                </div>
                            )}

                        <div className='text-sm text-slate-600 mb-2 mt-3'>
                            Ingrese los resultados manualmente:
                        </div>

                        <div className='space-y-3'>
                            {manualRows.map((row) => (
                                <div
                                    key={row.id}
                                    className='flex items-start gap-2'
                                >
                                    <div className='grid gap-2 sm:grid-cols-3 flex-1'>
                                        {/* Parámetro (desde API y filtrado por muestra) */}
                                        <select
                                            name={`resultado_${row.id}_parametro`}
                                            className='border rounded-lg px-3 py-2'
                                            value={row.parametro}
                                            onChange={(e) =>
                                                onChangeParam(
                                                    row.id,
                                                    e.target.value
                                                )
                                            }
                                            disabled={!hasParams}
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

                                        {/* Resultado con color por rango */}
                                        <input
                                            name={`resultado_${row.id}_valor`}
                                            placeholder='Resultado (p. ej. 95)'
                                            className={`border rounded-lg px-3 py-2 ${resultClasses(
                                                row
                                            )}`}
                                            value={row.valor}
                                            onChange={(e) =>
                                                onChangeValor(
                                                    row.id,
                                                    e.target.value
                                                )
                                            }
                                            inputMode='decimal'
                                        />

                                        {/* Unidad automática, bloqueada */}
                                        <input
                                            name={`resultado_${row.id}_unidad`}
                                            placeholder='Unidad'
                                            className='border rounded-lg px-3 py-2 bg-gray-100 text-gray-700'
                                            value={row.unidad}
                                            readOnly
                                        />
                                    </div>

                                    {/* Ayuda de rango */}
                                    <div className='text-xs text-slate-500 mt-2 min-w-[160px]'>
                                        {row.ref_min != null ||
                                        row.ref_max != null ? (
                                            <span>
                                                Rango: {row.ref_min ?? '—'} –{' '}
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
                            ))}

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
