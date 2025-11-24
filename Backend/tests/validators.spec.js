// tests/validators.spec.js
import { describe, it, expect } from 'vitest';
import {
    parseValorDecimal,
    esValidoValorResultado,
} from '../utils/validators.js';

describe('validators.parseValorDecimal', () => {
    it('rechaza null y undefined', () => {
        expect(parseValorDecimal(null).ok).toBe(false);
        expect(parseValorDecimal(undefined).ok).toBe(false);
    });

    it('rechaza strings vacíos', () => {
        expect(parseValorDecimal('').ok).toBe(false);
        expect(parseValorDecimal('   ').ok).toBe(false);
    });

    it('rechaza strings muy largos (>12 caracteres)', () => {
        expect(parseValorDecimal('1234567890123').ok).toBe(false);
    });

    it('rechaza notación científica', () => {
        expect(parseValorDecimal('1e5').ok).toBe(false);
        expect(parseValorDecimal('2E3').ok).toBe(false);
    });

    it('rechaza letras o espacios', () => {
        expect(parseValorDecimal('12a').ok).toBe(false);
        expect(parseValorDecimal('1 2').ok).toBe(false);
        expect(parseValorDecimal('1_234').ok).toBe(false);
    });

    it('rechaza usar punto Y coma juntos', () => {
        expect(parseValorDecimal('1.234,5').ok).toBe(false);
    });

    it('rechaza formato inválido (múltiples puntos/comas)', () => {
        expect(parseValorDecimal('1.2.3').ok).toBe(false);
        expect(parseValorDecimal('1,2,3').ok).toBe(false);
    });

    it('rechaza más de 3 decimales', () => {
        expect(parseValorDecimal('3.1415').ok).toBe(false);
        expect(parseValorDecimal('3,1415').ok).toBe(false);
    });

    it('acepta enteros válidos', () => {
        const res = parseValorDecimal('42');
        expect(res.ok).toBe(true);
        expect(res.value).toBe(42);
    });

    it('acepta decimales con punto (hasta 3 decimales)', () => {
        const res = parseValorDecimal('3.14');
        expect(res.ok).toBe(true);
        expect(res.value).toBeCloseTo(3.14);

        const res2 = parseValorDecimal('3.142');
        expect(res2.ok).toBe(true);
        expect(res2.value).toBeCloseTo(3.142);
    });

    it('acepta decimales con coma (hasta 3 decimales)', () => {
        const res = parseValorDecimal('3,14');
        expect(res.ok).toBe(true);
        expect(res.value).toBeCloseTo(3.14);
    });

    it('acepta valores dentro del límite de 12 caracteres', () => {
        const res = parseValorDecimal('123456.789'); 
        expect(res.ok).toBe(true);
        expect(res.value).toBeCloseTo(123456.789);
    });
});

describe('validators.esValidoValorResultado', () => {
    it('rechaza valores no numéricos o infinitos', () => {
        expect(esValidoValorResultado(NaN, 'g/dL', 3, 5)).toBe(false);
        expect(esValidoValorResultado(Infinity, 'g/dL', 3, 5)).toBe(false);
        expect(esValidoValorResultado(-Infinity, 'g/dL', 3, 5)).toBe(false);
    });

    it('rechaza porcentajes negativos', () => {
        expect(esValidoValorResultado(-5, '%', 0, 100)).toBe(false);
    });

    it('rechaza porcentajes mayores a 100', () => {
        expect(esValidoValorResultado(105, '%', 0, 100)).toBe(false);
    });

    it('acepta porcentajes válidos (0-100)', () => {
        expect(esValidoValorResultado(50, '%', 0, 100)).toBe(true);
        expect(esValidoValorResultado(0, '%', 0, 100)).toBe(true);
        expect(esValidoValorResultado(100, '%', 0, 100)).toBe(true);
    });

    it('rechaza valores negativos en unidades no porcentuales', () => {
        expect(esValidoValorResultado(-10, 'g/dL', 3, 5)).toBe(false);
    });

    it('sin RI: acepta valores absolutos <= 1e6', () => {
        expect(esValidoValorResultado(999999, 'mg/dL', null, null)).toBe(true);
        expect(esValidoValorResultado(1000000, 'mg/dL', null, null)).toBe(true);
    });

    it('sin RI: rechaza valores absolutos > 1e6', () => {
        expect(esValidoValorResultado(1000001, 'mg/dL', null, null)).toBe(
            false
        );
    });

    it('con RI: rechaza valores demasiado altos (>ref_max * 10)', () => {
        expect(esValidoValorResultado(100, 'g/dL', 3, 5)).toBe(false); 
    });

    it('con RI: rechaza valores demasiado bajos (<ref_min / 10, si ref_min > 0)', () => {
        expect(esValidoValorResultado(0.05, 'g/dL', 3, 5)).toBe(false); 
    });

    it('con RI: acepta valores dentro de rango razonable', () => {
        expect(esValidoValorResultado(4, 'g/dL', 3, 5)).toBe(true);
        expect(esValidoValorResultado(3, 'g/dL', 3, 5)).toBe(true);
        expect(esValidoValorResultado(5, 'g/dL', 3, 5)).toBe(true);
    });

    it('con RI: acepta valores ligeramente fuera de rango pero razonables', () => {
        expect(esValidoValorResultado(2.5, 'g/dL', 3, 5)).toBe(true); 
        expect(esValidoValorResultado(6, 'g/dL', 3, 5)).toBe(true); 
    });

    it('con RI (ref_min=0): no rechaza valores bajos si ref_min es 0', () => {
        expect(esValidoValorResultado(0.001, 'g/dL', 0, 5)).toBe(true);
    });
});
