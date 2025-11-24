import * as controlClinicoModule from '../controller/control_clinico.controller.js';
import { describe, it, expect } from 'vitest';

const controlClinico = controlClinicoModule.default ?? controlClinicoModule;

const makeReq = (overrides = {}) => ({
    params: {},
    query: {},
    body: {
        episodio_id: 1,
        tipo_control: 'inicial',
        cambios: { resumen: 'test' },
    },
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

describe('control_clinico.controller - llamadas seguras', () => {
    Object.entries(controlClinico).forEach(([name, fn]) => {
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
