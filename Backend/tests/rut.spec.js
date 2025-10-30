import { describe, it, expect } from 'vitest';
import rut from '../utils/rut.js'; 
const { isValidRut, computeDv, normalizeRut, formatRut } = rut;

describe('RUT utils', () => {
  it('computeDv correcto', () => {
    expect(computeDv('11111111')).toBe('1');
    expect(computeDv('76086428')).toBe('5');
  });

  it('válidos con/sin puntos/espacios', () => {
    expect(isValidRut('11.111.111-1')).toBe(true);
    expect(isValidRut('11111111-1')).toBe(true);
    expect(isValidRut('  11.111.111  - 1 ')).toBe(true);
    expect(isValidRut('76.086.428-5')).toBe(true);
  });

  it('inválidos', () => {
    expect(isValidRut('11111111-2')).toBe(false);
    expect(isValidRut('ABC-K')).toBe(false);
    expect(isValidRut('')).toBe(false);
    expect(isValidRut('1234567')).toBe(false);
  });

  it('normalize + format', () => {
    const n = normalizeRut('12.345.678-k');
    expect(n.cuerpo).toBe('12345678');
    expect(n.dv).toBe('K');
    expect(formatRut('12345678-k')).toBe('12.345.678-K');
  });
});
