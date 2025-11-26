'use client';
import { useAuth } from '@/contexts/AuthContext';
import type React from 'react';
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import muestras from '../data/examples.json';

export type Resultado = {
    resultado_id: number;
    episodio_id: number;
    muestra_id: number;
    examen_id: number;
    parametro: string;
    valor: number;
    unidad: string;
    fecha_resultado: string;
};

export type Muestra = {
    muestra_id: number;
    tipo_muestra: string;
    fecha_extraccion: string;
    fecha_recepcion: string;
    observaciones: string;
    examen_id: number;
    profesional_id: number;
    Resultados: Resultado[];
};

export type AnalyticsData = {
    tiposExamen?: {
        examenes: Array<{
            examen_id: number;
            tipo_examen: string;
            descripcion: string;
            categoria: string;
            muestras: Array<{
                tipo_muestra: string;
                parametros: Array<{
                    codigo: string;
                    nombre: string;
                    unidad: string;
                    ref_min: number | null;
                    ref_max: number | null;
                    notas: string | null;
                    tipo_examen_id: number;
                    tipo_muestra_id: number;
                }>;
            }>;
        }>;
    };
    promediosParametros?: Record<
        string,
        {
            valor_promedio: number;
            unidad: string;
            cantidad_muestras: number;
            valor_minimo: number;
            valor_maximo: number;
        }
    >;
    contadorCategorias?: {
        total_examenes_realizados: number;
        por_tipo_examen: Record<
            string,
            {
                total_examenes: number;
                porcentaje: number;
                por_tipo_muestra: Record<
                    string,
                    {
                        cantidad: number;
                        porcentaje: number;
                    }
                >;
            }
        >;
    };
    distribucionFracturaPorSexo?: Record<
        string,
        {
            Masculino: {
                cantidad: number;
                porcentaje: number;
                edad_promedio: number;
            };
            Femenino: {
                cantidad: number;
                porcentaje: number;
                edad_promedio: number;
            };
            total: number;
        }
    >;
    riesgoRefracturaComorbilidades?: {
        puntuacion_promedio_general: number;
        rango: string;
        interpretacion: string;
        distribucion: Record<string, any>;
        factores_principales: Array<{
            factor: string;
            puntos: number;
            prevalencia: number;
            cantidad: number;
        }>;
        factores_por_nombre?: Record<
            string,
            {
                puntos: number;
                prevalencia: number;
                cantidad: number;
            }
        >;
        total_pacientes?: number;
    };
    riesgoRefracturaHabitos?: {
        puntuacion_promedio_general: number;
        rango: string;
        interpretacion: string;
        distribucion: Record<string, any>;
        factores_principales: Array<{
            factor: string;
            puntos: number;
            prevalencia: number;
            cantidad: number;
        }>;
        factores_por_nombre?: Record<
            string,
            {
                puntos: number;
                prevalencia: number;
                cantidad: number;
            }
        >;
        total_pacientes?: number;
    };
    muestras?: Muestra[];
};

type InvestigatorContextType = {
    loading: boolean;
    error?: string | null;
    items: Muestra[];
    data: Muestra[];
    filtered: Muestra[];
    analytics: AnalyticsData;
    refresh: () => Promise<void>;

    filtros: {
        busqueda: string;
        tipoMuestra: string;
        parametro: string;
        anio: string;
        // aliases commonly used by components
        q?: string;
        year?: number;
        sexo?: string;
        fractura?: string;
        edadMin?: number;
        edadMax?: number;
        valorMin?: number;
        valorMax?: number;
        profesionalId?: number;
        examenId?: number;
    };
    setFiltros: (p: Partial<InvestigatorContextType['filtros']>) => void;
    clearFiltros: () => void;
    // aliases in English for components that use them
    filters: InvestigatorContextType['filtros'];
    setFilters: (p: Partial<InvestigatorContextType['filtros']>) => void;
    clearFilters: () => void;

    seleccion: Set<number>;
    toggleSel: (id: number) => void;
    clearSel: () => void;
    toggleSelect: (id: number) => void;
    selectAllFiltered: () => void;
    clearSelection: () => void;
    selectedIds: Set<number>;

    downloadCSV: (soloSeleccion?: boolean) => Promise<void>;
    downloadJSON: (soloSeleccion?: boolean) => Promise<void>;
    downloadExcel: (soloSeleccion?: boolean) => Promise<void>;
    downloadXLSX: (soloSeleccion?: boolean) => Promise<void>;
};

const InvestigatorContext = createContext<InvestigatorContextType>({
    loading: true,
    error: null,
    items: [],
    data: [],
    filtered: [],
    analytics: {},
    refresh: async () => {},
    filtros: {
        busqueda: '',
        tipoMuestra: '',
        parametro: '',
        anio: '',
        q: '',
        year: undefined,
        sexo: undefined,
        fractura: undefined,
        edadMin: undefined,
        edadMax: undefined,
    },
    setFiltros: () => {},
    clearFiltros: () => {},
    filters: {
        busqueda: '',
        tipoMuestra: '',
        parametro: '',
        anio: '',
    },
    setFilters: () => {},
    clearFilters: () => {},
    seleccion: new Set(),
    selectedIds: new Set(),
    toggleSel: () => {},
    clearSel: () => {},
    toggleSelect: () => {},
    selectAllFiltered: () => {},
    clearSelection: () => {},
    downloadCSV: async () => {},
    downloadJSON: async () => {},
    downloadExcel: async () => {},
    downloadXLSX: async () => {},
});

export const useInvestigator = () => useContext(InvestigatorContext);

function toCSV(rows: Record<string, any>[]) {
    if (!rows.length) return '';
    const cols = Object.keys(rows[0]);
    const esc = (v: any) =>
        typeof v === 'string'
            ? `"${v.replaceAll('"', '""')}"`
            : v == null
            ? ''
            : String(v);
    const head = cols.join(';');
    const body = rows
        .map((r) => cols.map((c) => esc(r[c])).join(';'))
        .join('\n');
    return '\uFEFF' + head + '\n' + body;
}

function downloadFile(
    name: string,
    content: BlobPart,
    mime = 'text/csv;charset=utf-8'
) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type: mime }));
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
}

export const InvestigatorProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [items, setItems] = useState<Muestra[]>([]);
    const [analytics, setAnalytics] = useState<AnalyticsData>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [filtros, setFiltrosState] = useState({
        busqueda: '',
        tipoMuestra: '',
        parametro: '',
        anio: '',
        valorMin: undefined as number | undefined,
        valorMax: undefined as number | undefined,
        profesionalId: undefined as number | undefined,
        examenId: undefined as number | undefined,
    });

    const [seleccion, setSeleccion] = useState<Set<number>>(new Set());

    const fetchItems = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            console.log(
                '[InvestigatorContext] Fetching analytics data from API...'
            );
            const user = localStorage.getItem('session_v1');
            const token = user ? JSON.parse(user).token : null;

            const apiUrl =
                process.env.NEXT_PUBLIC_API_BASE ||
                'http://localhost:3001/api/v1';
            const url = `${apiUrl}/investigadores/analytics/completo`;

            console.log('[InvestigatorContext] Fetching from:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token ? `Bearer ${token}` : '',
                },
            });

            if (!response.ok) {
                console.warn(
                    '[InvestigatorContext] API failed with status:',
                    response.status,
                    'using fallback data'
                );
                const fallbackData = muestras as any;
                setItems(fallbackData.muestras || []);
                setAnalytics({
                    tiposExamen: fallbackData.tiposExamen,
                    promediosParametros: fallbackData.promediosParametros,
                    contadorCategorias: fallbackData.contadorCategorias,
                    distribucionFracturaPorSexo:
                        fallbackData.distribucionFracturaPorSexo,
                    riesgoRefracturaComorbilidades:
                        fallbackData.riesgoRefracturaComorbilidades,
                    riesgoRefracturaHabitos:
                        fallbackData.riesgoRefracturaHabitos,
                    muestras: fallbackData.muestras,
                });
                return;
            }

            const data = await response.json();
            console.log('[InvestigatorContext] Loaded analytics data:', data);

            setItems(data.muestras || []);
            setAnalytics({
                tiposExamen: data.tiposExamen,
                promediosParametros: data.promediosParametros,
                contadorCategorias: data.contadorCategorias,
                distribucionFracturaPorSexo: data.distribucionFracturaPorSexo,
                riesgoRefracturaComorbilidades:
                    data.riesgoRefracturaComorbilidades,
                riesgoRefracturaHabitos: data.riesgoRefracturaHabitos,
                muestras: data.muestras,
            });
        } catch (e) {
            console.error('[InvestigatorContext] Error loading data:', e);
            setError('Error al cargar los datos');
            const fallbackData = muestras as any;
            setItems(fallbackData.muestras || []);
            setAnalytics({
                tiposExamen: fallbackData.tiposExamen,
                promediosParametros: fallbackData.promediosParametros,
                contadorCategorias: fallbackData.contadorCategorias,
                distribucionFracturaPorSexo:
                    fallbackData.distribucionFracturaPorSexo,
                riesgoRefracturaComorbilidades:
                    fallbackData.riesgoRefracturaComorbilidades,
                riesgoRefracturaHabitos: fallbackData.riesgoRefracturaHabitos,
                muestras: fallbackData.muestras,
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const setFiltros = useCallback(
        (p: Partial<typeof filtros>) => {
            setFiltrosState((prev) => ({ ...prev, ...p }));
        },
        [setFiltrosState]
    );

    const clearFiltros = useCallback(() => {
        setFiltrosState({
            busqueda: '',
            tipoMuestra: '',
            parametro: '',
            anio: '',
            valorMin: undefined,
            valorMax: undefined,
            profesionalId: undefined,
            examenId: undefined,
        });
        setSeleccion(new Set());
    }, []);

    const filtered = useMemo(() => {
        const q = filtros.busqueda.toLowerCase().trim();
        return items.filter((m) => {
            if (filtros.tipoMuestra && m.tipo_muestra !== filtros.tipoMuestra)
                return false;
            if (
                filtros.anio &&
                new Date(m.fecha_extraccion).getFullYear() !==
                    Number(filtros.anio)
            )
                return false;
            if (
                filtros.profesionalId != null &&
                m.profesional_id !== filtros.profesionalId
            )
                return false;
            if (filtros.examenId != null && m.examen_id !== filtros.examenId)
                return false;

            if (filtros.parametro) {
                const tieneParametro = m.Resultados.some((r) =>
                    r.parametro
                        ?.toLowerCase()
                        .includes(filtros.parametro.toLowerCase())
                );
                if (!tieneParametro) return false;
            }

            if (filtros.valorMin != null || filtros.valorMax != null) {
                const tieneValorEnRango = m.Resultados.some((r) => {
                    if (filtros.valorMin != null && r.valor < filtros.valorMin)
                        return false;
                    if (filtros.valorMax != null && r.valor > filtros.valorMax)
                        return false;
                    return true;
                });
                if (!tieneValorEnRango) return false;
            }

            if (q) {
                const hay =
                    (m.tipo_muestra?.toLowerCase() || '').includes(q) ||
                    (m.observaciones?.toLowerCase() || '').includes(q) ||
                    String(m.muestra_id || '').includes(q) ||
                    String(m.examen_id || '').includes(q) ||
                    String(m.profesional_id || '').includes(q) ||
                    m.Resultados.some(
                        (r) =>
                            (r.parametro?.toLowerCase() || '').includes(q) ||
                            (r.unidad?.toLowerCase() || '').includes(q)
                    );
                if (!hay) return false;
            }
            return true;
        });
    }, [items, filtros]);

    const toggleSel = useCallback((id: number) => {
        setSeleccion((s) => {
            const n = new Set(s);
            if (n.has(id)) n.delete(id);
            else n.add(id);
            return n;
        });
    }, []);
    const clearSel = useCallback(() => setSeleccion(new Set()), []);
    const selectAllFiltered = useCallback(() => {
        setSeleccion(new Set(filtered.map((m) => m.muestra_id)));
    }, [filtered]);

    const rowsForExport = useCallback(
        (soloSel?: boolean) => {
            const base = soloSel
                ? filtered.filter((m) => seleccion.has(m.muestra_id))
                : filtered;
            const rows = base.flatMap((m) =>
                m.Resultados.length > 0
                    ? m.Resultados.map((r) => ({
                          muestra_id: m.muestra_id,
                          tipo_muestra: m.tipo_muestra || '',
                          fecha_extraccion:
                              m.fecha_extraccion?.slice(0, 10) || '',
                          fecha_recepcion:
                              m.fecha_recepcion?.slice(0, 10) || '',
                          observaciones: m.observaciones || '',
                          examen_id: m.examen_id,
                          profesional_id: m.profesional_id,
                          resultado_id: r.resultado_id,
                          episodio_id: r.episodio_id,
                          parametro: r.parametro || '',
                          valor: r.valor,
                          unidad: r.unidad || '',
                          fecha_resultado:
                              r.fecha_resultado?.slice(0, 10) || '',
                      }))
                    : [
                          {
                              muestra_id: m.muestra_id,
                              tipo_muestra: m.tipo_muestra || '',
                              fecha_extraccion:
                                  m.fecha_extraccion?.slice(0, 10) || '',
                              fecha_recepcion:
                                  m.fecha_recepcion?.slice(0, 10) || '',
                              observaciones: m.observaciones || '',
                              examen_id: m.examen_id,
                              profesional_id: m.profesional_id,
                              resultado_id: 0,
                              episodio_id: 0,
                              parametro: '',
                              valor: 0,
                              unidad: '',
                              fecha_resultado: '',
                          },
                      ]
            );
            return rows;
        },
        [filtered, seleccion]
    );

    const downloadCSV = useCallback(
        async (soloSel?: boolean) => {
            const rows = rowsForExport(soloSel);
            const csv = toCSV(rows);
            downloadFile(
                `muestras_resultados${soloSel ? '_seleccion' : ''}.csv`,
                csv,
                'text/csv;charset=utf-8'
            );
        },
        [rowsForExport]
    );

    const downloadJSON = useCallback(
        async (soloSel?: boolean) => {
            const base = soloSel
                ? filtered.filter((m) => seleccion.has(m.muestra_id))
                : filtered;
            const json = JSON.stringify({ muestras: base }, null, 2);
            downloadFile(
                `muestras_resultados${soloSel ? '_seleccion' : ''}.json`,
                json,
                'application/json'
            );
        },
        [filtered, seleccion]
    );

    const downloadExcel = useCallback(
        async (soloSel?: boolean) => {
            const rows = rowsForExport(soloSel);
            const csv = toCSV(rows);
            downloadFile(
                `muestras_resultados${soloSel ? '_seleccion' : ''}.xlsx`,
                csv,
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
        },
        [rowsForExport]
    );

    const value: InvestigatorContextType = {
        loading,
        error,
        items,
        data: items,
        filtered,
        analytics,
        refresh: fetchItems,
        filtros,
        setFiltros,
        clearFiltros,
        filters: filtros,
        setFilters: setFiltros,
        clearFilters: clearFiltros,
        seleccion,
        selectedIds: seleccion,
        toggleSel,
        clearSel,
        toggleSelect: toggleSel,
        selectAllFiltered,
        clearSelection: clearSel,
        downloadCSV,
        downloadJSON,
        downloadExcel,
        downloadXLSX: downloadExcel,
    };

    return (
        <InvestigatorContext.Provider value={value}>
            {children}
        </InvestigatorContext.Provider>
    );
};
