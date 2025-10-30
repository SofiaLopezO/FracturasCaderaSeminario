// tests/registerEmailVerify.spec.js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockReq, mockRes } from './_helpers/http';
import * as Ctrl from '../controller/register.js';

// --- mailer falso (no se usa si verificación está OFF, pero lo dejamos por seguridad)
const sendMailMock = vi.fn().mockResolvedValue({ messageId: 'ok' });
const mailerFake = { sendMail: sendMailMock };

// spies mutables por test
let findUserByCorreoSpy, findUserByRutSpy, findUserByTokenSpy;
let createUserSpy, createPacienteSpy, userUpdateSpy;

// Fila de usuario falsa
const fakeUserRow = (over = {}) => ({
  id: 1,
  rut: '11111111-1',
  correo: 'a@b.cl',
  nombres: 'Ana',
  apellido_paterno: 'P',
  apellido_materno: 'M',
  email_verify_token: over.email_verify_token ?? null,
  email_verify_expires: over.email_verify_expires ?? null,
  update: (userUpdateSpy = vi.fn(async (vals) => Object.assign({}, vals))),
});

// Models falsos inyectables
function buildModels() {
  return {
    User: {
      findOne: vi.fn(async ({ where }) => {
        if ('correo' in where) return findUserByCorreoSpy?.(where.correo) ?? null;
        if ('rut' in where)    return findUserByRutSpy?.(where.rut) ?? null;
        if ('email_verify_token' in where) return findUserByTokenSpy?.(where.email_verify_token) ?? null;
        return null;
      }),
      create: (...args) => createUserSpy(...args),
    },
    Paciente: { create: (...args) => createPacienteSpy(...args) },
  };
}

beforeEach(() => {
  vi.restoreAllMocks();

  // 👉 Ejecutar TODA esta spec sin verificación por correo
  process.env.EMAIL_VERIFICATION_REQUIRED = 'false';
  process.env.FRONT_ORIGIN = 'http://localhost:3000';

  // por defecto no hay duplicados
  findUserByCorreoSpy = vi.fn(async () => null);
  findUserByRutSpy    = vi.fn(async () => null);
  findUserByTokenSpy  = vi.fn(async () => null);

  createUserSpy     = vi.fn(async (vals) => fakeUserRow(vals));
  createPacienteSpy = vi.fn(async () => ({}));
  sendMailMock.mockClear();

  // ⬇️ Inyecta dependencias directamente al controller
  Ctrl.__setModelsForTest(buildModels());
  Ctrl.__setMailerForTest(mailerFake);
});

describe('Registro (SIN verificación por correo)', () => {
  it('crea usuario sin token/expiración y NO envía mail', async () => {
    const req = mockReq({
      nombres: 'Ana',
      apellido_paterno: 'P',
      apellido_materno: 'M',
      correo: 'A@B.cl',
      rut: '11.111.111-1',
      password: 'ClaveSegura1',
      sexo: 'F',
      fecha_nacimiento: '1990-02-10',
    });
    const res = mockRes();

    await Ctrl.registerPaciente(req, res);

    // Esperado: 201 (no 409)
    expect(res.statusCode).toBe(201);
    expect(res.body?.message).toMatch(/Ya puedes iniciar sesión/i);

    // Crea user con verificación ya resuelta
    expect(createUserSpy).toHaveBeenCalledTimes(1);
    const created = createUserSpy.mock.calls[0][0];
    expect(created.email_verified).toBe(true);
    expect(created.email_verify_token == null).toBe(true);
    expect(created.email_verify_expires == null).toBe(true);

    // Crea Paciente y NO envía correo
    expect(createPacienteSpy).toHaveBeenCalledTimes(1);
    expect(sendMailMock).not.toHaveBeenCalled();
  });
});

// Si más adelante activas verificación, puedes habilitar estos:
describe.skip('Verificación de correo (habilitada)', () => {
  it('verifyEmail acepta token válido', async () => {});
  it('verifyEmail rechaza token expirado', async () => {});
  it('verifyEmail rechaza token inválido', async () => {});
});
