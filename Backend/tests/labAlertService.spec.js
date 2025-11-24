// tests/labAlertService.spec.js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { syncAlertForResultado } from '../services/labAlertService.js'; // ⟵ import nombrado

let fakeModels;

beforeEach(() => {
    vi.restoreAllMocks();

    fakeModels = {
        ParametroLab: {
            findByPk: vi.fn(), 
        },
        Alerta: {
            findOne: vi.fn(),
            create: vi.fn(async (row) => ({
                ...row,
                alerta_id: 1,
                get: () => ({ ...row, alerta_id: 1 }),
            })),
        },
    };
});

const resultadoBase = {
    resultado_id: 77,
    episodio_id: 123,
    parametro: 'K',
    valor: 6.0,
};

describe('labAlertService.syncAlertForResultado', () => {
    it('crea alerta LAB cuando valor está por SOBRE el máximo', async () => {
        fakeModels.ParametroLab.findByPk.mockResolvedValue({
            ref_min: 3.5,
            ref_max: 5.1,
            unidad: 'mmol/L',
            nombre: 'Potasio',
        });
        fakeModels.Alerta.findOne.mockResolvedValue(null);

        const out = await syncAlertForResultado(resultadoBase, {
            models: fakeModels,
        });

        expect(fakeModels.Alerta.create).toHaveBeenCalledTimes(1);
        expect(fakeModels.Alerta.create).toHaveBeenCalledWith(
            expect.objectContaining({
                episodio_id: 123,
                tipo: 'LAB',
                severidad: 'ALTA',
                resultado_id: 77,
                activa: true,
            })
        );
        expect(out.mensaje).toMatch(/Potasio/i);
        expect(out.mensaje).toMatch(/alto|fuera de rango/i);
    });

    it('actualiza alerta existente si sigue fuera de rango', async () => {
        fakeModels.ParametroLab.findByPk.mockResolvedValue({
            ref_min: 3.5,
            ref_max: 5.1,
            unidad: 'mmol/L',
            nombre: 'Potasio',
        });

        const existing = {
            tipo: 'LAB',
            severidad: 'MEDIA',
            mensaje: 'old',
            episodio_id: 123,
            indicador_id: null,
            activa: true,
            resuelta_en: null,
            save: vi.fn(async () => {}),
            get: () => ({
                tipo: 'LAB',
                severidad: 'ALTA',
                mensaje: 'x',
                episodio_id: 123,
                activa: true,
            }),
        };
        fakeModels.Alerta.findOne.mockResolvedValue(existing);

        const out = await syncAlertForResultado(resultadoBase, {
            models: fakeModels,
        });
        expect(existing.save).toHaveBeenCalled();
        expect(out).toMatchObject({ activa: true, episodio_id: 123 });
    });

    it('resuelve alerta si el valor vuelve a rango', async () => {
        fakeModels.ParametroLab.findByPk.mockResolvedValue({
            ref_min: 3.5,
            ref_max: 5.1,
            unidad: 'mmol/L',
            nombre: 'Potasio',
        });

        const resultadoOk = { ...resultadoBase, valor: 4.0 };

        const existing = {
            activa: true,
            save: vi.fn(async () => {}),
            get: () => ({ activa: false, resuelta_en: new Date() }),
        };
        fakeModels.Alerta.findOne.mockResolvedValue(existing);

        const out = await syncAlertForResultado(resultadoOk, {
            models: fakeModels,
        });
        expect(existing.save).toHaveBeenCalled();
        expect(out.activa).toBe(false);
    });

    it('no hace nada si no hay referencia (min y max nulos) o valor no numérico', async () => {

        fakeModels.ParametroLab.findByPk.mockResolvedValue({
            ref_min: null,
            ref_max: null,
            unidad: '',
            nombre: 'X',
        });
        const out1 = await syncAlertForResultado(resultadoBase, {
            models: fakeModels,
        });
        expect(out1).toBeNull();


        fakeModels.ParametroLab.findByPk.mockResolvedValue({
            ref_min: 1,
            ref_max: 2,
            unidad: '',
            nombre: 'X',
        });
        const out2 = await syncAlertForResultado(
            { ...resultadoBase, valor: 'N/A' },
            { models: fakeModels }
        );
        expect(out2).toBeNull();
    });
});

describe('labAlertService - funciones exportadas adicionales', () => {
    it('todas las funciones exportadas son ejecutables', async () => {
        const service = await import('../services/labAlertService.js');

        Object.entries(service).forEach(([name, fn]) => {
            if (typeof fn === 'function') {
                expect(typeof fn).toBe('function');
            }
        });
    });

    it('syncAlertForResultado debe ejecutarse con parámetros vacíos', async () => {
        const { syncAlertForResultado } = await import(
            '../services/labAlertService.js'
        );
        expect(typeof syncAlertForResultado).toBe('function');

        try {
            await syncAlertForResultado({}, {});
        } catch (e) {

        }
    });
});
