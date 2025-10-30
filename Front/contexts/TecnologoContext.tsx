'use client';

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import PacienteSelectorModalView, {
    TecnologoModalItem,
} from '@/components/Tecnologo/PacienteSelectorModal';
import { useAuth } from '@/contexts/AuthContext';
import type { DetallesPaciente } from '@/types/interfaces';

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3001/api/v1';

export type PacienteLite = {
    user_id: number;
    rut: string;
    nombres?: string;
    apellido_paterno?: string;
    apellido_materno?: string;
    nombre_completo?: string;
    sexo?: 'M' | 'F' | 'O';
    fecha_nacimiento?: string | null;
};

type SearchItem = {
    user_id: number;
    rut: string;
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;
    Apellido_Paterno?: string;
    Apellido_Materno?: string;
};

type TecnologoContextType = {
    loading: boolean;
    error: string | null;

    searching: boolean;
    results: SearchItem[];
    searchPacientes: (q: string) => Promise<void>;
    clearResults: () => void;

    paciente?: PacienteLite | null;
    detalles?: DetallesPaciente | null;
    loadPaciente: (user_id: number) => Promise<void>;
    clearSelection: () => void;
};

const TecnologoContext = createContext<TecnologoContextType>({
    loading: false,
    error: null,
    searching: false,
    results: [],
    searchPacientes: async () => {},
    clearResults: () => {},
    paciente: null,
    detalles: null,
    loadPaciente: async () => {},
    clearSelection: () => {},
});

export const useTecnologo = () => useContext(TecnologoContext);

function nombreCompleto(u: any) {
    if (u?.nombre_completo) return u.nombre_completo;
    const parts = [u?.nombres, u?.apellido_paterno, u?.apellido_materno].filter(
        Boolean
    );
    return parts.length ? parts.join(' ') : 'Paciente';
}

export const TecnologoProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<SearchItem[]>([]);
    const [basePacientes, setBasePacientes] = useState<SearchItem[]>([]);
    const [paciente, setPaciente] = useState<PacienteLite | null>(null);
    const [detalles, setDetalles] = useState<DetallesPaciente | null>(null);
    const pendingUserIdRef = useRef<number | null>(null);

    const pathname = usePathname();
    const router = useRouter();
    const { logout, authFetch } = useAuth();

    useEffect(() => setMounted(true), []);

    // Mostrar modal en todo /tecnologo excepto configuración
    const requirePatientHere = useMemo(() => {
        if (!pathname) return false;
        if (pathname.startsWith('/tecnologo/configuracion')) return false;
        return pathname === '/tecnologo' || pathname.startsWith('/tecnologo/');
    }, [pathname]);

    // Hidratar selección previa
    useEffect(() => {
        try {
            const raw = sessionStorage.getItem('tec_selectedPatient');
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (parsed?.paciente) setPaciente(parsed.paciente);
            else if (parsed?.user_id) {
                const pid = Number(parsed.user_id);
                if (Number.isFinite(pid)) {
                    setPaciente({
                        user_id: pid,
                        rut: parsed?.rut ?? '',
                        nombres: parsed?.nombres,
                        apellido_paterno: parsed?.apellido_paterno,
                        apellido_materno: parsed?.apellido_materno,
                        nombre_completo: parsed?.nombre_completo,
                        sexo: parsed?.sexo,
                        fecha_nacimiento: parsed?.fecha_nacimiento ?? null,
                    });
                }
            }
            if (parsed?.detalles) setDetalles(parsed.detalles);
            else {
                const uid = Number(
                    parsed?.paciente?.user_id ?? parsed?.user_id
                );
                if (Number.isFinite(uid) && uid > 0)
                    pendingUserIdRef.current = uid;
            }
        } catch {
            // Ignorar errores de parseo
        }
    }, []);

    // ESC para cerrar
    useEffect(() => {
        if (!(requirePatientHere && !paciente)) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') router.push('/tecnologo');
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [requirePatientHere, paciente, router]);

    // Búsqueda
    const mapToSearchItem = useCallback((raw: any): SearchItem | null => {
        const userId = Number(raw?.user_id ?? raw?.id);
        if (!Number.isFinite(userId) || userId <= 0) return null;
        const rut = raw?.rut ?? raw?.user?.rut ?? '';
        const nombres = raw?.nombres ?? raw?.user?.nombres ?? '';
        const apellidoP =
            raw?.apellido_paterno ??
            raw?.Apellido_Paterno ??
            raw?.user?.apellido_paterno ??
            '';
        const apellidoM =
            raw?.apellido_materno ??
            raw?.Apellido_Materno ??
            raw?.user?.apellido_materno ??
            '';
        return {
            user_id: userId,
            rut: String(rut ?? ''),
            nombres: String(nombres ?? ''),
            apellido_paterno: String(apellidoP ?? ''),
            apellido_materno: String(apellidoM ?? ''),
            Apellido_Paterno: String(apellidoP ?? ''),
            Apellido_Materno: String(apellidoM ?? ''),
        };
    }, []);

    const searchPacientes = useCallback(
        async (q: string) => {
            const query = q?.trim();
            if (!query) {
                setResults(basePacientes.length ? [...basePacientes] : []);
                return;
            }
            setSearching(true);
            setError(null);
            try {
                const r = await authFetch(
                    `${API_BASE}/pacientes/search?q=${encodeURIComponent(
                        query
                    )}&limit=6`
                );
                if (r.status === 401) {
                    router.push('/login');
                    return;
                }
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                const j = await r.json();
                const items = Array.isArray(j?.items)
                    ? j.items
                          .map(mapToSearchItem)
                          .filter(
                              (
                                  x: SearchItem | null | undefined
                              ): x is SearchItem => Boolean(x)
                          )
                    : [];
                setResults(items);
            } catch (err) {
                console.error('Error al buscar pacientes:', err);
                setError('Error al buscar pacientes');
            } finally {
                setSearching(false);
            }
        },
        [authFetch, basePacientes, mapToSearchItem, router]
    );

    const clearResults = useCallback(
        () => setResults(basePacientes.length ? [...basePacientes] : []),
        [basePacientes]
    );

    useEffect(() => {
        let active = true;
        const fetchInicial = async () => {
            setSearching(true);
            setError(null);
            try {
                const resp = await authFetch(`${API_BASE}/pacientes/?all=true`);
                if (resp.status === 401) {
                    router.push('/login');
                    return;
                }
                if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                const data = await resp.json();
                const items = Array.isArray(data)
                    ? data
                          .map(mapToSearchItem)
                          .filter((x): x is SearchItem => Boolean(x))
                    : [];
                if (!active) return;
                setBasePacientes(items);
                setResults(items.length ? [...items] : []);
            } catch (err) {
                if (!active) return;
                console.error('Error al cargar pacientes:', err);
                setError('Error al cargar pacientes');
                setBasePacientes([]);
                setResults([]);
            } finally {
                if (active) setSearching(false);
            }
        };

        void fetchInicial();
        return () => {
            active = false;
        };
    }, [authFetch, mapToSearchItem, router]);

    // Cargar paciente seleccionado
    const loadPaciente = useCallback(
        async (user_id: number) => {
            setLoading(true);
            setError(null);
            try {
                const [ru, resumenResp] = await Promise.all([
                    authFetch(`${API_BASE}/users/${user_id}`),
                    authFetch(`${API_BASE}/pacientes/${user_id}/resumen`),
                ]);

                if (ru.status === 401 || resumenResp.status === 401) {
                    try {
                        sessionStorage.removeItem('tec_selectedPatient');
                    } catch {}
                    await logout();
                    router.push('/login');
                    return;
                }

                if (!ru.ok) throw new Error(`Usuario HTTP ${ru.status}`);
                if (!resumenResp.ok)
                    throw new Error(`Resumen HTTP ${resumenResp.status}`);

                const [u, resumen] = await Promise.all([
                    ru.json(),
                    resumenResp.json(),
                ]);
                setDetalles(resumen);

                const general = resumen?.general ?? {};
                const sexoRaw = String(
                    general?.sexo ?? u?.sexo ?? ''
                ).toUpperCase();
                const sexo: 'M' | 'F' | 'O' | undefined = sexoRaw.startsWith(
                    'M'
                )
                    ? 'M'
                    : sexoRaw.startsWith('F')
                    ? 'F'
                    : sexoRaw
                    ? 'O'
                    : undefined;

                const nombreCompletoGeneral = general?.nombre
                    ? String(general.nombre)
                    : nombreCompleto(u);

                const pac: PacienteLite = {
                    user_id,
                    rut: String(general?.rut ?? u?.rut ?? ''),
                    nombres: u?.nombres ?? nombreCompletoGeneral,
                    apellido_paterno: u?.apellido_paterno ?? '',
                    apellido_materno: u?.apellido_materno ?? '',
                    nombre_completo: nombreCompletoGeneral,
                    sexo,
                    fecha_nacimiento:
                        general?.fecha_nacimiento ??
                        u?.fecha_nacimiento ??
                        null,
                };

                setPaciente(pac);
                try {
                    sessionStorage.setItem(
                        'tec_selectedPatient',
                        JSON.stringify({ paciente: pac, detalles: resumen })
                    );
                } catch {}
            } catch (err) {
                console.error('Error al cargar paciente:', err);
                setError('Error al cargar paciente');
                setPaciente(null);
                setDetalles(null);
                try {
                    sessionStorage.removeItem('tec_selectedPatient');
                } catch {}
            } finally {
                setLoading(false);
            }
        },
        [authFetch, logout, router]
    );

    useEffect(() => {
        if (!detalles && pendingUserIdRef.current) {
            const uid = pendingUserIdRef.current;
            pendingUserIdRef.current = null;
            if (uid) void loadPaciente(uid);
        }
    }, [detalles, loadPaciente]);

    const clearSelection = useCallback(() => {
        setPaciente(null);
        setDetalles(null);
        try {
            sessionStorage.removeItem('tec_selectedPatient');
        } catch {}
    }, []);

    const value: TecnologoContextType = useMemo(
        () => ({
            loading,
            error,
            searching,
            results,
            searchPacientes,
            clearResults,
            paciente,
            detalles,
            loadPaciente,
            clearSelection,
        }),
        [
            loading,
            error,
            searching,
            results,
            searchPacientes,
            clearResults,
            paciente,
            detalles,
            loadPaciente,
            clearSelection,
        ]
    );

    // Handlers para modal
    const handleSearch = useCallback(
        (q: string) => (q.trim() ? searchPacientes(q.trim()) : clearResults()),
        [searchPacientes, clearResults]
    );
    const handleSelectUserId = useCallback(
        (id: number) => loadPaciente(id),
        [loadPaciente]
    );

    // Modal con portal y capas seguras
    const modal =
        requirePatientHere && !paciente ? (
            <PacienteSelectorModalView
                open
                onCancel={() => router.push('/tecnologo')} // o "/tecnologo/configuracion"
                results={results as unknown as TecnologoModalItem[]}
                searching={searching}
                onSearch={handleSearch}
                onClear={clearResults}
                onSelectUserId={handleSelectUserId}
            />
        ) : null;

    return (
        <TecnologoContext.Provider value={value}>
            {children}
            {mounted ? createPortal(modal, document.body) : null}
        </TecnologoContext.Provider>
    );
};
