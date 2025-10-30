// tests/riesgoRefracturaService.spec.js
import { describe, it, expect, beforeEach, vi } from 'vitest';

let recalcularIndicadoresControl;
let fakeModels;
let controlInstancePlain;

// helpers
function asInstance(plain) { return { get: () => ({ ...plain }) }; }

// Config de prueba (inyectada al servicio)
const testCfgAlto = {
  FACTORES: [
    { tipo: 'F1', puntos: 10, prioridad: 1, criterio: 'c1', mensaje: 'm1', dominio: 'd', evaluate: () => ({ cumple: true }) },
    { tipo: 'F2', puntos: 7,  prioridad: 2, criterio: 'c2', mensaje: 'm2', dominio: 'd', evaluate: () => ({ cumple: true }) },
  ],
  NIVEL_THRESHOLDS: { ALTO: 15, MODERADO: 5 },
  COLOR_BY_NIVEL: { ALTO: 'red', MODERADO: 'yellow', BAJO: 'green' },
  ACTION_BY_NIVEL: { ALTO: 'Derivar a unidad de fractura', MODERADO: 'Control cercano' },
};

const testCfgBajo = {
  ...testCfgAlto,
  FACTORES: [
    { tipo: 'F1', puntos: 10, prioridad: 1, criterio: 'c1', mensaje: 'm1', dominio: 'd', evaluate: () => ({ cumple: false }) },
    { tipo: 'F2', puntos: 7,  prioridad: 2, criterio: 'c2', mensaje: 'm2', dominio: 'd', evaluate: () => ({ cumple: false }) },
  ],
};

beforeEach(async () => {
  vi.restoreAllMocks();
  vi.resetModules();
  ({ recalcularIndicadoresControl } = await import('../services/riesgoRefracturaService.js'));

  fakeModels = {
    Resultado: { findAll: vi.fn().mockResolvedValue([]) },
    Cirugia:   { findAll: vi.fn().mockResolvedValue([]) },
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
      { models: fakeModels, cfg: testCfgAlto },   // ⟵ inyectamos FACTORES/umbrales
    );

    // existe indicador total y puntaje numérico
    expect(fakeModels.EpisodioIndicador.create).toHaveBeenCalled();
    const totalCall = fakeModels.EpisodioIndicador.create.mock.calls.find(
      (c) => c[0].tipo === 'RIESGO_REFRACTURA'
    )?.[0];
    expect(totalCall).toBeTruthy();
    expect(typeof totalCall.valor).toBe('number');

    // nivel ALTO con esta cfg
    expect(res.resumen.nivel).toBe('ALTO');

    // alerta creada (ALTA) y activa
    expect(fakeModels.Alerta.create).toHaveBeenCalledTimes(1);
    expect(fakeModels.Alerta.create).toHaveBeenCalledWith(expect.objectContaining({
      episodio_id: 10, tipo: 'RIESGO', severidad: 'ALTA', activa: true,
    }));
  });

  it('no crea alerta si el nivel es BAJO (forzando 0 puntos)', async () => {
    const res = await recalcularIndicadoresControl(
      1,
      { __controlInstance: asInstance(controlInstancePlain) },
      { models: fakeModels, cfg: testCfgBajo },
    );

    expect(res.resumen.nivel).toBe('BAJO');
    expect(fakeModels.Alerta.create).not.toHaveBeenCalled();
  });
});
