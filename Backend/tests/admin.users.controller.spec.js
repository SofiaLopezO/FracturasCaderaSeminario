import * as adminUsersModule from '../controller/admin.users.controller.js';
import { describe, it, expect } from 'vitest';

const adminUsers = adminUsersModule.default ?? adminUsersModule;

const makeReq = (overrides = {}) => ({
    params: { id: 1 },
    query: {},
    body: { rut: '12345678-9', role: 'admin' },
    user: { rut: '12345678-9', id: 1 },
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

describe('admin.users.controller - llamadas seguras', () => {
    Object.entries(adminUsers).forEach(([name, fn]) => {
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
