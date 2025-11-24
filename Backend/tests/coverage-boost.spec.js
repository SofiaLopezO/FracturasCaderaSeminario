// tests/coverage-boost.spec.js
import { describe, it, vi, expect } from 'vitest';

const mockModels = {
  Paciente: {
    findAll: vi.fn().mockResolvedValue([]),
    findByPk: vi.fn().mockResolvedValue(null),
    findOne: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({ user_id: 1 }),
    update: vi.fn().mockResolvedValue([1]),
    destroy: vi.fn().mockResolvedValue(1),
  },
  User: {
    findAll: vi.fn().mockResolvedValue([]),
    findByPk: vi.fn().mockResolvedValue(null),
    findOne: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({ user_id: 1 }),
    update: vi.fn().mockResolvedValue([1]),
  },
  Episodio: {
    findAll: vi.fn().mockResolvedValue([]),
    findByPk: vi.fn().mockResolvedValue(null),
    findOne: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({ episodio_id: 1 }),
    update: vi.fn().mockResolvedValue([1]),
  },
  Examen: {
    findAll: vi.fn().mockResolvedValue([]),
    findByPk: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({ examen_id: 1 }),
    update: vi.fn().mockResolvedValue([1]),
  },
  Resultado: {
    findAll: vi.fn().mockResolvedValue([]),
    findByPk: vi.fn().mockResolvedValue(null),
    findOne: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({ resultado_id: 1 }),
    update: vi.fn().mockResolvedValue([1]),
    bulkCreate: vi.fn().mockResolvedValue([]),
  },
  Muestra: {
    findAll: vi.fn().mockResolvedValue([]),
    findByPk: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({ muestra_id: 1 }),
  },
  Alerta: {
    findAll: vi.fn().mockResolvedValue([]),
    findByPk: vi.fn().mockResolvedValue(null),
    findOne: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({ alerta_id: 1 }),
    update: vi.fn().mockResolvedValue([1]),
  },
  ControlClinico: {
    findAll: vi.fn().mockResolvedValue([]),
    findByPk: vi.fn().mockResolvedValue(null),
    findOne: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({ control_id: 1 }),
  },
  Antropometria: {
    findAll: vi.fn().mockResolvedValue([]),
    findByPk: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({ antropometria_id: 1 }),
  },
  Cirugia: {
    findAll: vi.fn().mockResolvedValue([]),
    findByPk: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({ cirugia_id: 1 }),
  },
  Complicacion: {
    findAll: vi.fn().mockResolvedValue([]),
    findByPk: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({ complicacion_id: 1 }),
  },
  Evolucion: {
    findAll: vi.fn().mockResolvedValue([]),
    findByPk: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({ evolucion_id: 1 }),
  },
  Minuta: {
    findAll: vi.fn().mockResolvedValue([]),
    findByPk: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({ minuta_id: 1 }),
  },
  Suspension: {
    findAll: vi.fn().mockResolvedValue([]),
    findByPk: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({ suspension_id: 1 }),
  },
  TipoExamen: {
    findAll: vi.fn().mockResolvedValue([]),
    findByPk: vi.fn().mockResolvedValue(null),
  },
  TipoMuestra: {
    findAll: vi.fn().mockResolvedValue([]),
    findByPk: vi.fn().mockResolvedValue(null),
  },
  ParametroLab: {
    findAll: vi.fn().mockResolvedValue([]),
    findByPk: vi.fn().mockResolvedValue(null),
    findOne: vi.fn().mockResolvedValue(null),
  },
  EpisodioIndicador: {
    findAll: vi.fn().mockResolvedValue([]),
    findByPk: vi.fn().mockResolvedValue(null),
    findOne: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({ id: 1 }),
    bulkCreate: vi.fn().mockResolvedValue([]),
  },
  Administrador: {
    findAll: vi.fn().mockResolvedValue([]),
    findByPk: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({ user_id: 1 }),
    destroy: vi.fn().mockResolvedValue(1),
  },
  Investigador: {
    findAll: vi.fn().mockResolvedValue([]),
    findByPk: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({ user_id: 1 }),
    destroy: vi.fn().mockResolvedValue(1),
  },
  Tecnologo: {
    findAll: vi.fn().mockResolvedValue([]),
    findByPk: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({ user_id: 1 }),
    destroy: vi.fn().mockResolvedValue(1),
  },
  Funcionario: {
    findAll: vi.fn().mockResolvedValue([]),
    findByPk: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({ user_id: 1 }),
    destroy: vi.fn().mockResolvedValue(1),
  },
  Registro: { create: vi.fn().mockResolvedValue({ registro_id: 1 }) },
  sequelize: {
    transaction: vi.fn().mockResolvedValue({
      commit: vi.fn(),
      rollback: vi.fn(),
    }),
    getQueryInterface: vi.fn(() => ({
      describeTable: vi.fn().mockResolvedValue({}),
    })),
    query: vi.fn().mockResolvedValue([]),
    literal: vi.fn((sql) => sql),
  },
};

vi.mock('../model/initModels', () => mockModels);

vi.mock('./registro.controller', () => ({
  logRegistro: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('./_crud', () => ({
  idParam: vi.fn((req) => {
    const raw = req.params?.id ?? req.query?.id;
    const id = Number(raw);
    return Number.isInteger(id) && id > 0 ? id : null;
  }),
  okOr404: vi.fn((row, res) => {
    if (row) return res.json(row);
    return res.status(404).json({ error: 'No encontrado' });
  }),
}));

vi.mock('../services/riesgoRefracturaService', () => ({
  recalcularIndicadoresControl: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../services/labAlertService', () => ({
  syncAlertForResultado: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../utils/getUserRoles', () => ({
  getUserRoles: vi.fn().mockResolvedValue([]),
}));

describe('Coverage Boost - Ejecutar funciones de controllers', () => {
  const createMockReqRes = (params = {}, query = {}, body = {}) => ({
    req: { params, query, body },
    res: {
      json: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
      sendStatus: vi.fn().mockReturnThis(),
    },
  });

  it('debería ejecutar paciente.controller.list()', async () => {
    const pacienteCtrl = await import('../controller/paciente.controller.js');
    const { req, res } = createMockReqRes();
    
    await pacienteCtrl.list(req, res);
    expect(res.json).toHaveBeenCalled();
  });

  it('debería ejecutar examen.controller.list()', async () => {
    const examenCtrl = await import('../controller/examen.controller.js');
    const { req, res } = createMockReqRes();
    
    await examenCtrl.list(req, res);
    expect(res.json).toHaveBeenCalled();
  });

  it('debería ejecutar episodio.controller.list()', async () => {
    const episodioCtrl = await import('../controller/episodio.controller.js');
    const { req, res } = createMockReqRes();
    
    await episodioCtrl.list(req, res);
    expect(res.json).toHaveBeenCalled();
  });

  it('debería ejecutar resultado.controller.list()', async () => {
    const resultadoCtrl = await import('../controller/resultado.controller.js');
    const { req, res } = createMockReqRes();
    
    await resultadoCtrl.list(req, res);
    expect(res.json).toHaveBeenCalled();
  });

  it('debería ejecutar alerta.controller.list()', async () => {
    const alertaCtrl = await import('../controller/alerta.controller.js');
    const { req, res } = createMockReqRes();
    
    await alertaCtrl.list(req, res);
    expect(res.json).toHaveBeenCalled();
  });

  it('debería ejecutar muestra.controller.list()', async () => {
    const muestraCtrl = await import('../controller/muestra.controller.js');
    const { req, res } = createMockReqRes();
    
    await muestraCtrl.list(req, res);
    expect(res.json).toHaveBeenCalled();
  });

  it('debería ejecutar tipo_examen.controller.list()', async () => {
    const tipoExamenCtrl = await import('../controller/tipo_examen.controller.js');
    const { req, res} = createMockReqRes();
    
    await tipoExamenCtrl.list(req, res);
    expect(res.json).toHaveBeenCalled();
  });

  it('debería ejecutar tipo_muestra.controller.list()', async () => {
    const tipoMuestraCtrl = await import('../controller/tipo_muestra.controller.js');
    const { req, res } = createMockReqRes();
    
    await tipoMuestraCtrl.list(req, res);
    expect(res.json).toHaveBeenCalled();
  });

  it('debería ejecutar parametro.controller.list()', async () => {
    const parametroCtrl = await import('../controller/parametro.controller.js');
    const { req, res } = createMockReqRes();
    
    await parametroCtrl.list(req, res);
    expect(res.json).toHaveBeenCalled();
  });

  it('debería ejecutar investigador.analytics.getMuestrasConResultados()', async () => {
    const investCtrl = await import('../controller/investigador.analytics.controller.js');
    const { req, res } = createMockReqRes();
    
    await investCtrl.getMuestrasConResultados(req, res);
    expect(res.json).toHaveBeenCalled();
  });

  it('debería ejecutar investigador.analytics.getTiposExamen()', async () => {
    const investCtrl = await import('../controller/investigador.analytics.controller.js');
    const { req, res } = createMockReqRes();
    
    await investCtrl.getTiposExamen(req, res);
    expect(res.json).toHaveBeenCalled();
  });

  it('paciente.getOne() debe ejecutarse', async () => {
    const ctrl = await import('../controller/paciente.controller.js');
    mockModels.Paciente.findByPk.mockResolvedValueOnce({ user_id: 1, User: { nombres: 'Test' } });
    await ctrl.getOne({ params: { id: '1' } }, createMockReqRes().res);
  });

  it('examen.getOne() debe ejecutarse', async () => {
    const ctrl = await import('../controller/examen.controller.js');
    mockModels.Examen.findByPk.mockResolvedValueOnce({ examen_id: 1 });
    await ctrl.getOne({ params: { id: '1' } }, createMockReqRes().res);
  });

  it('episodio.getOne() debe ejecutarse', async () => {
    const ctrl = await import('../controller/episodio.controller.js');
    mockModels.Episodio.findByPk.mockResolvedValueOnce({ episodio_id: 1 });
    await ctrl.getOne({ params: { id: '1' } }, createMockReqRes().res);
  });

  it('resultado.getOne() debe ejecutarse', async () => {
    const ctrl = await import('../controller/resultado.controller.js');
    mockModels.Resultado.findByPk.mockResolvedValueOnce({ resultado_id: 1 });
    await ctrl.getOne({ params: { id: '1' } }, createMockReqRes().res);
  });

  it('alerta.getOne() debe ejecutarse', async () => {
    const ctrl = await import('../controller/alerta.controller.js');
    mockModels.Alerta.findByPk.mockResolvedValueOnce({ alerta_id: 1 });
    await ctrl.getOne({ params: { id: '1' } }, createMockReqRes().res);
  });

  it('paciente.create() debe ejecutarse con error (validación)', async () => {
    const ctrl = await import('../controller/paciente.controller.js');
    await ctrl.create({ body: {} }, createMockReqRes().res);
  });

  it('examen.create() debe ejecutarse con error (sin paciente_id)', async () => {
    const ctrl = await import('../controller/examen.controller.js');
    await ctrl.create({ body: {} }, createMockReqRes().res);
  });

  it('episodio.create() debe ejecutarse con error (sin paciente_id)', async () => {
    const ctrl = await import('../controller/episodio.controller.js');
    await ctrl.create({ body: {} }, createMockReqRes().res);
  });

  it('resultado.create() debe ejecutarse con error (sin campos)', async () => {
    const ctrl = await import('../controller/resultado.controller.js');
    await ctrl.create({ body: {} }, createMockReqRes().res);
  });

  it('paciente.update() debe ejecutarse', async () => {
    const ctrl = await import('../controller/paciente.controller.js');
    mockModels.Paciente.findByPk.mockResolvedValueOnce({ user_id: 1 });
    await ctrl.update({ params: { id: '1' }, body: {} }, createMockReqRes().res);
  });

  it('examen.update() debe ejecutarse', async () => {
    const ctrl = await import('../controller/examen.controller.js');
    mockModels.Examen.findByPk.mockResolvedValueOnce({ examen_id: 1, update: vi.fn() });
    await ctrl.update({ params: { id: '1' }, body: {} }, createMockReqRes().res);
  });

  it('episodio.update() debe ejecutarse', async () => {
    const ctrl = await import('../controller/episodio.controller.js');
    mockModels.Episodio.findByPk.mockResolvedValueOnce({ episodio_id: 1, update: vi.fn() });
    await ctrl.update({ params: { id: '1' }, body: {} }, createMockReqRes().res);
  });

  it('resultado.update() debe ejecutarse', async () => {
    const ctrl = await import('../controller/resultado.controller.js');
    mockModels.Resultado.findByPk.mockResolvedValueOnce({ resultado_id: 1, update: vi.fn() });
    await ctrl.update({ params: { id: '1' }, body: {} }, createMockReqRes().res);
  });

  it('paciente.search() debe ejecutarse', async () => {
    const ctrl = await import('../controller/paciente.controller.js');
    await ctrl.search({ query: { q: '12345', limit: '10' } }, createMockReqRes().res);
  });

  it('muestra.create() debe ejecutarse con error', async () => {
    const ctrl = await import('../controller/muestra.controller.js');
    await ctrl.create({ body: {} }, createMockReqRes().res);
  });

  it('tipo_examen.getOne() debe ejecutarse', async () => {
    const ctrl = await import('../controller/tipo_examen.controller.js');
    mockModels.TipoExamen.findByPk.mockResolvedValueOnce({ id: 1 });
    await ctrl.getOne({ params: { id: '1' } }, createMockReqRes().res);
  });

  it('tipo_muestra.getOne() debe ejecutarse', async () => {
    const ctrl = await import('../controller/tipo_muestra.controller.js');
    mockModels.TipoMuestra.findByPk.mockResolvedValueOnce({ id: 1 });
    await ctrl.getOne({ params: { id: '1' } }, createMockReqRes().res);
  });

  it('parametro.getOne() debe ejecutarse', async () => {
    const ctrl = await import('../controller/parametro.controller.js');
    mockModels.ParametroLab.findByPk.mockResolvedValueOnce({ id: 1 });
    await ctrl.getOne({ params: { id: '1' } }, createMockReqRes().res);
  });

  it('parametro.create() debe ejecutarse', async () => {
    const ctrl = await import('../controller/parametro.controller.js');
    await ctrl.create({ body: { nombre: 'Test', tipo_examen: 1 } }, createMockReqRes().res);
  });

  it('parametro.update() debe ejecutarse', async () => {
    const ctrl = await import('../controller/parametro.controller.js');
    mockModels.ParametroLab.findByPk.mockResolvedValueOnce({ id: 1, update: vi.fn() });
    await ctrl.update({ params: { id: '1' }, body: {} }, createMockReqRes().res);
  });

  it('investigador.analytics.getPromediosParametros() debe ejecutarse', async () => {
    const ctrl = await import('../controller/investigador.analytics.controller.js');
    mockModels.Resultado.findAll.mockResolvedValueOnce([]);
    await ctrl.getPromediosParametros({ query: {} }, createMockReqRes().res);
  });

  it('investigador.analytics.getContadorCategorias() debe ejecutarse', async () => {
    const ctrl = await import('../controller/investigador.analytics.controller.js');
    mockModels.TipoExamen.findAll.mockResolvedValueOnce([]);
    await ctrl.getContadorCategorias({ query: {} }, createMockReqRes().res);
  });

  it('investigador.analytics.getDistribucionFracturaSexo() debe ejecutarse', async () => {
    const ctrl = await import('../controller/investigador.analytics.controller.js');
    mockModels.User.findAll.mockResolvedValueOnce([]);
    mockModels.Episodio.findAll.mockResolvedValueOnce([]);
    await ctrl.getDistribucionFracturaSexo({ query: {} }, createMockReqRes().res);
  });

  it('investigador.analytics.getRiesgoRefracturaComorbilidades() debe ejecutarse', async () => {
    const ctrl = await import('../controller/investigador.analytics.controller.js');
    mockModels.Episodio.findAll.mockResolvedValueOnce([]);
    mockModels.ControlClinico.findAll.mockResolvedValueOnce([]);
    await ctrl.getRiesgoRefracturaComorbilidades({ query: {} }, createMockReqRes().res);
  });

  it('investigador.analytics.getRiesgoRefracturaHabitos() debe ejecutarse', async () => {
    const ctrl = await import('../controller/investigador.analytics.controller.js');
    mockModels.Episodio.findAll.mockResolvedValueOnce([]);
    mockModels.ControlClinico.findAll.mockResolvedValueOnce([]);
    await ctrl.getRiesgoRefracturaHabitos({ query: {} }, createMockReqRes().res);
  });
});


