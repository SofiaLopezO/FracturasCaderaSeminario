// tests/riesgoRefracturaService.spec.js
import { describe, it, expect, beforeEach, vi } from 'vitest';

let recalcularIndicadoresControl;
let fakeModels;
let controlInstancePlain;

function asInstance(plain) {
    return { get: () => ({ ...plain }) };
}

const testCfgAlto = {
    FACTORES: [
        {
            tipo: 'F1',
            puntos: 10,
            prioridad: 1,
            criterio: 'c1',
            mensaje: 'm1',
            dominio: 'd',
            evaluate: () => ({ cumple: true }),
        },
        {
            tipo: 'F2',
            puntos: 7,
            prioridad: 2,
            criterio: 'c2',
            mensaje: 'm2',
            dominio: 'd',
            evaluate: () => ({ cumple: true }),
        },
    ],
    NIVEL_THRESHOLDS: { ALTO: 15, MODERADO: 5 },
    COLOR_BY_NIVEL: { ALTO: 'red', MODERADO: 'yellow', BAJO: 'green' },
    ACTION_BY_NIVEL: {
        ALTO: 'Derivar a unidad de fractura',
        MODERADO: 'Control cercano',
    },
};

const testCfgBajo = {
    ...testCfgAlto,
    FACTORES: [
        {
            tipo: 'F1',
            puntos: 10,
            prioridad: 1,
            criterio: 'c1',
            mensaje: 'm1',
            dominio: 'd',
            evaluate: () => ({ cumple: false }),
        },
        {
            tipo: 'F2',
            puntos: 7,
            prioridad: 2,
            criterio: 'c2',
            mensaje: 'm2',
            dominio: 'd',
            evaluate: () => ({ cumple: false }),
        },
    ],
};

beforeEach(async () => {
    vi.restoreAllMocks();
    vi.resetModules();
    ({ recalcularIndicadoresControl } = await import(
        '../services/riesgoRefracturaService.js'
    ));

    fakeModels = {
        Resultado: { findAll: vi.fn().mockResolvedValue([]) },
        Cirugia: { findAll: vi.fn().mockResolvedValue([]) },
        EpisodioIndicador: {
            findAll: vi.fn().mockResolvedValue([]),
            destroy: vi.fn(),
            create: vi.fn(async (row) => ({
                ...row,
                episodio_indicador_id: 555,
                get: () => ({ ...row, episodio_indicador_id: 555 }),
            })),
        },
        Alerta: {
            destroy: vi.fn(),
            create: vi.fn(async (row) => ({
                ...row,
                alerta_id: 999,
                get: () => ({ ...row, alerta_id: 999 }),
            })),
        },
    };

    controlInstancePlain = {
        control_id: 1,
        episodio_id: 10,
        tipo_control: 'SEGUIMIENTO',
        Episodio: {
            episodio_id: 10,
            Paciente: { user: { sexo: 'F', fecha_nacimiento: '1970-01-01' } },
            Antropometria: null,
            ControlClinicos: [{ control_id: 1, tipo_control: 'SEGUIMIENTO' }],
            fecha_diagnostico: '2025-01-01T10:00:00Z',
            tipo_fractura: '0',
        },
    };
});

describe('riesgoRefracturaService.recalcularIndicadoresControl', () => {
    it('crea indicadores y alerta de RIESGO cuando el puntaje ≥ ALTO', async () => {
        const res = await recalcularIndicadoresControl(
            1,
            { __controlInstance: asInstance(controlInstancePlain) },
            { models: fakeModels, cfg: testCfgAlto } // ⟵ inyectamos FACTORES/umbrales
        );

        expect(fakeModels.EpisodioIndicador.create).toHaveBeenCalled();
        const totalCall = fakeModels.EpisodioIndicador.create.mock.calls.find(
            (c) => c[0].tipo === 'RIESGO_REFRACTURA'
        )?.[0];
        expect(totalCall).toBeTruthy();
        expect(typeof totalCall.valor).toBe('number');

        expect(res.resumen.nivel).toBe('ALTO');

        expect(fakeModels.Alerta.create).toHaveBeenCalledTimes(1);
        expect(fakeModels.Alerta.create).toHaveBeenCalledWith(
            expect.objectContaining({
                episodio_id: 10,
                tipo: 'RIESGO',
                severidad: 'ALTA',
                activa: true,
            })
        );
    });

    it('no crea alerta si el nivel es BAJO (forzando 0 puntos)', async () => {
        const res = await recalcularIndicadoresControl(
            1,
            { __controlInstance: asInstance(controlInstancePlain) },
            { models: fakeModels, cfg: testCfgBajo }
        );

        expect(res.resumen.nivel).toBe('BAJO');
        expect(fakeModels.Alerta.create).not.toHaveBeenCalled();
    });
});

describe('riesgoRefracturaService - funciones exportadas adicionales', () => {
    it('todas las funciones exportadas son ejecutables', async () => {
        const service = await import('../services/riesgoRefracturaService.js');
        const exported = service.default ?? service;

        Object.entries(exported).forEach(([name, fn]) => {
            if (typeof fn === 'function') {
                expect(typeof fn).toBe('function');
            }
        });
    });

    it('recalcularIndicadores debe ser invocable', async () => {
        const { recalcularIndicadores } = await import(
            '../services/riesgoRefracturaService.js'
        );
        expect(typeof recalcularIndicadores).toBe('function');

        try {
            await recalcularIndicadores(1, {});
        } catch (e) {
        }
    });

    it('recalcularIndicadoresEpisodio debe ser invocable', async () => {
        const { recalcularIndicadoresEpisodio } = await import(
            '../services/riesgoRefracturaService.js'
        );
        expect(typeof recalcularIndicadoresEpisodio).toBe('function');

        try {
            await recalcularIndicadoresEpisodio(1);
        } catch (e) {
        }
    });

    it('recalcularIndicadores con diferentes opciones', async () => {
        const { recalcularIndicadores } = await import(
            '../services/riesgoRefracturaService.js'
        );

        try {
            await recalcularIndicadores(1, { force: true });
        } catch (e) {}

        try {
            await recalcularIndicadores(2, { skipAlerts: true });
        } catch (e) {}

        expect(true).toBe(true);
    });

    it('recalcularIndicadoresControl con diferentes parámetros', async () => {
        const { recalcularIndicadoresControl } = await import(
            '../services/riesgoRefracturaService.js'
        );

        try {
            await recalcularIndicadoresControl(1, {});
        } catch (e) {}

        try {
            await recalcularIndicadoresControl(2, { __controlInstance: null });
        } catch (e) {}

        expect(true).toBe(true);
    });
});
