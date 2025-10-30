import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';

// 🔧 Datos base
const userOk = {
  id: 42,
  rut: '11111111-1',
  nombres: 'Ada',
  apellido_paterno: 'Lovelace',
  apellido_materno: '',
  correo: 'ada@demo.cl',
  email_verified: true,
  password_hash: '$2a$10$hash_fake',
};

// 🔧 Factories de app y controller (permiten “reimportar” si fuera necesario)
function makeApp(controller) {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.post('/login', controller.login);
  app.post('/logout', controller.logout);
  return app;
}

let loginController;
let bcryptCompareSpy;
let findOneSpy;

beforeEach(async () => {
  // Asegura envs para cada test
  process.env.JWT_SECRET = 'test-secret';
  process.env.JWT_EXPIRES = '1h';
  process.env.EMAIL_VERIFICATION_REQUIRED = 'true'; // requerir verificación por defecto

  // Limpia cache de módulos por si hiciste cambios en el controller
  vi.resetModules();

  // Reimporta el controller limpio
  loginController = await import('../controller/login.js');

  // Fake models por defecto: usuario NO existe (para el test 404)
  const fakeModels = {
    User: {
      findOne: vi.fn(async () => null),
    },
    Administrador: { findOne: vi.fn(async () => null) },
    Funcionario: { findOne: vi.fn(async () => null) },
    Tecnologo: { findOne: vi.fn(async () => null) },
    Investigador: { findOne: vi.fn(async () => null) },
    Paciente: { findOne: vi.fn(async () => null) },
  };
  findOneSpy = fakeModels.User.findOne;

  // Inyecta modelos
  loginController.__setModelsForTest(fakeModels);

  // Mock global de bcrypt.compare
  const bcrypt = require('bcryptjs');
  bcryptCompareSpy = vi.spyOn(bcrypt, 'compare');
  bcryptCompareSpy.mockResolvedValue(true); // por defecto OK
});

describe('POST /login', () => {
  it('rechaza si faltan credenciales (400)', async () => {
    const app = makeApp(loginController);
    const res = await request(app).post('/login').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/obligatorios/i);
  });

  it('404 si usuario no existe', async () => {
    const app = makeApp(loginController);
    const res = await request(app).post('/login').send({ rut: '22.222.222-2', password: 'x' });
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/no registrado/i);
    expect(findOneSpy).toHaveBeenCalledTimes(1);
  });

  it('403 si requiere verificación y email_verified=false', async () => {
    // Forzamos usuario encontrado con email no verificado
    const fakeModels = {
      User: { findOne: vi.fn(async () => ({ ...userOk, email_verified: false })) },
      Administrador: { findOne: vi.fn(async () => null) },
      Funcionario: { findOne: vi.fn(async () => null) },
      Tecnologo: { findOne: vi.fn(async () => null) },
      Investigador: { findOne: vi.fn(async () => null) },
      Paciente: { findOne: vi.fn(async () => null) },
    };
    loginController.__setModelsForTest(fakeModels);

    // Asegura que la bandera esté activa
    process.env.EMAIL_VERIFICATION_REQUIRED = 'true';

    const app = makeApp(loginController);
    const res = await request(app).post('/login').send({ rut: '11.111.111-1', password: 'x' });

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/verificar tu correo/i);
  });

  it('401 si password incorrecta', async () => {
    // Usuario verificado OK
    const fakeModels = {
      User: { findOne: vi.fn(async () => ({ ...userOk, email_verified: true })) },
      Administrador: { findOne: vi.fn(async () => null) },
      Funcionario: { findOne: vi.fn(async () => null) },
      Tecnologo: { findOne: vi.fn(async () => null) },
      Investigador: { findOne: vi.fn(async () => null) },
      Paciente: { findOne: vi.fn(async () => null) },
    };
    loginController.__setModelsForTest(fakeModels);

    // Fuerza contraseña incorrecta
    bcryptCompareSpy.mockResolvedValueOnce(false);

    const app = makeApp(loginController);
    const res = await request(app).post('/login').send({ rut: '11.111.111-1', password: 'malo' });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/Contraseña incorrecta/i);
  });

  it('200 login exitoso: set-cookie + token + user', async () => {
    const fakeModels = {
      User: { findOne: vi.fn(async () => ({ ...userOk, email_verified: true })) },
      Administrador: { findOne: vi.fn(async () => null) },
      Funcionario: { findOne: vi.fn(async () => null) },
      Tecnologo: { findOne: vi.fn(async () => null) },
      Investigador: { findOne: vi.fn(async () => null) },
      Paciente: { findOne: vi.fn(async () => null) },
    };
    loginController.__setModelsForTest(fakeModels);

    const app = makeApp(loginController);
    const res = await request(app)
      .post('/login')
      .send({ rut: '11.111.111-1', password: 'buena' });

    expect(res.status).toBe(200);
    const setCookie = res.headers['set-cookie']?.[0] || '';
    expect(setCookie).toMatch(/auth=/);
    expect(setCookie).toMatch(/HttpOnly/);
    expect(res.body.message).toMatch(/Login exitoso/i);
    expect(res.body.user.id).toBe(userOk.id);
    expect(typeof res.body.token).toBe('string');
    expect(res.body.token.length).toBeGreaterThan(10);
  });
});

describe('POST /logout', () => {
  it('borra cookie y responde ok (200)', async () => {
    const app = makeApp(loginController);
    const res = await request(app).post('/logout');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    const setCookie = res.headers['set-cookie']?.[0] || '';
    expect(setCookie).toMatch(/auth=;/);
  });
});
