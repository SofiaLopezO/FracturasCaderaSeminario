import { describe, it, expect } from 'vitest';
import * as minutaController from '../controller/minuta.controller.js';

describe('minuta.controller', () => {
    it('debe exportar la función list', () => {
        expect(typeof minutaController.list).toBe('function');
    });

    it('debe exportar la función getOne', () => {
        expect(typeof minutaController.getOne).toBe('function');
    });

    it('debe exportar la función create', () => {
        expect(typeof minutaController.create).toBe('function');
    });

    it('debe exportar la función update', () => {
        expect(typeof minutaController.update).toBe('function');
    });

    it('debe exportar la función remove', () => {
        expect(typeof minutaController.remove).toBe('function');
    });
});
