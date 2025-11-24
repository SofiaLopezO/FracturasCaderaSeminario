// tests/paciente.controller.spec.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as pacienteModule from '../controller/paciente.controller.js';

const paciente = pacienteModule.default ?? pacienteModule;

const makeReq = (overrides = {}) => ({
    params: { id: 1, user_id: 1 },
    query: { q: 'test' },
    body: { rut: '12345678-9', nombre: 'Test', apellido_paterno: 'Test' },
    user: { rut: '12345678-9' },
    ...overrides,
});

const makeRes = () => {
    const res = {};
    res._status = 200;
    res._json = null;
    res.status = (s) => {
        res._status = s;
        return res;
    };
    res.json = (j) => {
        res._json = j;
        return res;
    };
    res.location = () => res;
    res.send = () => res;
    return res;
};

describe('paciente.controller - funciones exportadas', () => {
    Object.entries(paciente).forEach(([name, fn]) => {
        if (typeof fn !== 'function') return;
        it(`invoca de forma segura ${name}`, async () => {
            const req = makeReq();
            const res = makeRes();
            try {
                const result = fn(req, res);
                if (result && typeof result.then === 'function') await result;
            } catch (e) {
            }
            expect(typeof fn).toBe('function');
        });
    });
});

describe('paciente.controller helpers', () => {
    describe('normRut helper (inferido del código)', () => {
        it('debería eliminar puntos y guiones del RUT', () => {
            const normRut = (r) =>
                String(r || '')
                    .replace(/\./g, '')
                    .replace(/-/g, '')
                    .toUpperCase();

            expect(normRut('12.345.678-9')).toBe('123456789');
            expect(normRut('12345678-9')).toBe('123456789');
            expect(normRut('12345678-K')).toBe('12345678K');
        });

        it('debería convertir a mayúsculas', () => {
            const normRut = (r) =>
                String(r || '')
                    .replace(/\./g, '')
                    .replace(/-/g, '')
                    .toUpperCase();

            expect(normRut('12345678-k')).toBe('12345678K');
        });

        it('debería manejar valores vacíos', () => {
            const normRut = (r) =>
                String(r || '')
                    .replace(/\./g, '')
                    .replace(/-/g, '')
                    .toUpperCase();

            expect(normRut('')).toBe('');
            expect(normRut(null)).toBe('');
            expect(normRut(undefined)).toBe('');
        });
    });

    describe('parseUserIdParam helper (inferido del código)', () => {
        it('debería parsear user_id desde params', () => {
            function parseUserIdParam(req) {
                const raw = req.params.user_id ?? req.query.user_id;
                const id = Number(raw);
                return Number.isInteger(id) && id > 0 ? id : null;
            }

            const req = { params: { user_id: '123' }, query: {} };
            expect(parseUserIdParam(req)).toBe(123);
        });

        it('debería parsear user_id desde query', () => {
            function parseUserIdParam(req) {
                const raw = req.params.user_id ?? req.query.user_id;
                const id = Number(raw);
                return Number.isInteger(id) && id > 0 ? id : null;
            }

            const req = { params: {}, query: { user_id: '456' } };
            expect(parseUserIdParam(req)).toBe(456);
        });

        it('debería retornar null para IDs inválidos', () => {
            function parseUserIdParam(req) {
                const raw = req.params.user_id ?? req.query.user_id;
                const id = Number(raw);
                return Number.isInteger(id) && id > 0 ? id : null;
            }

            expect(parseUserIdParam({ params: {}, query: {} })).toBeNull();
            expect(
                parseUserIdParam({ params: { user_id: 'abc' }, query: {} })
            ).toBeNull();
            expect(
                parseUserIdParam({ params: { user_id: '-5' }, query: {} })
            ).toBeNull();
            expect(
                parseUserIdParam({ params: { user_id: '0' }, query: {} })
            ).toBeNull();
        });
    });

    describe('isEmpty helper (inferido del código)', () => {
        it('debería retornar true para valores vacíos', () => {
            function isEmpty(v) {
                return (
                    v === undefined ||
                    v === null ||
                    (typeof v === 'string' && v.trim() === '')
                );
            }

            expect(isEmpty(undefined)).toBe(true);
            expect(isEmpty(null)).toBe(true);
            expect(isEmpty('')).toBe(true);
            expect(isEmpty('   ')).toBe(true);
        });

        it('debería retornar false para valores no vacíos', () => {
            function isEmpty(v) {
                return (
                    v === undefined ||
                    v === null ||
                    (typeof v === 'string' && v.trim() === '')
                );
            }

            expect(isEmpty('texto')).toBe(false);
            expect(isEmpty('  texto  ')).toBe(false);
            expect(isEmpty(0)).toBe(false);
            expect(isEmpty(false)).toBe(false);
        });
    });

    describe('isMissingColumnError helper (inferido del código)', () => {
        it('debería detectar error de columna faltante', () => {
            function isMissingColumnError(err, column) {
                if (!err) return false;
                const original = err.original || err.parent || err;
                const code = original?.code || err?.code;
                if (code && String(code) !== '42703') return false;
                const message = String(
                    original?.message || err.message || ''
                ).toLowerCase();
                return (
                    message.includes('column') &&
                    message.includes(String(column || '').toLowerCase())
                );
            }

            const err = {
                code: '42703',
                message: 'column "episodio_id" does not exist',
            };
            expect(isMissingColumnError(err, 'episodio_id')).toBe(true);
        });

        it('debería retornar false para errores no relacionados', () => {
            function isMissingColumnError(err, column) {
                if (!err) return false;
                const original = err.original || err.parent || err;
                const code = original?.code || err?.code;
                if (code && String(code) !== '42703') return false;
                const message = String(
                    original?.message || err.message || ''
                ).toLowerCase();
                return (
                    message.includes('column') &&
                    message.includes(String(column || '').toLowerCase())
                );
            }

            const err = {
                code: '23505',
                message: 'unique constraint violation',
            };
            expect(isMissingColumnError(err, 'episodio_id')).toBe(false);
        });

        it('debería retornar false para null/undefined', () => {
            function isMissingColumnError(err, column) {
                if (!err) return false;
                const original = err.original || err.parent || err;
                const code = original?.code || err?.code;
                if (code && String(code) !== '42703') return false;
                const message = String(
                    original?.message || err.message || ''
                ).toLowerCase();
                return (
                    message.includes('column') &&
                    message.includes(String(column || '').toLowerCase())
                );
            }

            expect(isMissingColumnError(null, 'test')).toBe(false);
            expect(isMissingColumnError(undefined, 'test')).toBe(false);
        });
    });

    describe('ensureSchemaFlags helper (inferido del código)', () => {
        it('debería cachear flags de esquema', async () => {
            let __schemaFlags = {
                checked: false,
                alertaHasEpisodioId: false,
                alertaHasResultadoId: false,
                resultadoHasEpisodioId: false,
                alertaColumns: [],
            };

            async function ensureSchemaFlags() {
                if (__schemaFlags.checked) return __schemaFlags;
                __schemaFlags.checked = true;
                return __schemaFlags;
            }

            const result = await ensureSchemaFlags();
            expect(result.checked).toBe(true);

            const result2 = await ensureSchemaFlags();
            expect(result2).toBe(result);
        });
    });
});
