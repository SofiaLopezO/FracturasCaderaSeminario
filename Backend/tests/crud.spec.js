// tests/crud.spec.js
import { describe, it, expect } from 'vitest';
import { idParam, okOr404 } from '../controller/_crud.js';

describe('_crud.idParam', () => {
    it('extrae ID numérico de req.params.id', () => {
        const req = { params: { id: '123' } };
        expect(idParam(req)).toBe(123);
    });

    it('retorna null para IDs no numéricos', () => {
        const req = { params: { id: 'abc' } };
        expect(idParam(req)).toBeNull();
    });

    it('acepta IDs negativos (devuelve el número)', () => {
        const req = { params: { id: '-5' } };
        expect(idParam(req)).toBe(-5);
    });

    it('retorna null si no hay parámetros', () => {
        const req = { params: {} };
        expect(idParam(req)).toBeNull();
    });

    it('retorna null si id es undefined', () => {
        const req = { params: { id: undefined } };
        expect(idParam(req)).toBeNull();
    });

    it('acepta ID = 0', () => {
        const req = { params: { id: '0' } };
        expect(idParam(req)).toBe(0);
    });
});

describe('_crud.okOr404', () => {
    it('retorna JSON si row existe', () => {
        const row = { id: 1, name: 'test' };
        const res = {
            json: (data) => {
                expect(data).toEqual(row);
                return res;
            },
        };

        okOr404(row, res);
    });

    it('retorna 404 si row es null', () => {
        let statusCalled = false;
        let jsonCalled = false;

        const res = {
            status: (code) => {
                expect(code).toBe(404);
                statusCalled = true;
                return res;
            },
            json: (data) => {
                expect(data).toEqual({ error: 'No encontrado' });
                jsonCalled = true;
                return res;
            },
        };

        okOr404(null, res);
        expect(statusCalled).toBe(true);
        expect(jsonCalled).toBe(true);
    });

    it('retorna 404 si row es undefined', () => {
        let statusCalled = false;

        const res = {
            status: (code) => {
                statusCalled = true;
                return res;
            },
            json: () => res,
        };

        okOr404(undefined, res);
        expect(statusCalled).toBe(true);
    });
});
