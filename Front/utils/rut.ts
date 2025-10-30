// Frontend/.../utils/rut.ts

/** Normaliza email de forma segura (acepta undefined/null/number). */
export const normEmail = (s: unknown) =>
  (s ?? '').toString().trim().toLowerCase();

/** Password fuerte: ≥8, al menos 1 mayúscula y 1 dígito. */
export const strongPwd = (s: unknown) => {
  const str = (s ?? '').toString();
  return str.length >= 8 && /[A-Z]/.test(str) && /\d/.test(str);
};

/** Quita puntos y guión, y pasa a MAYÚSCULAS. Siempre retorna string. */
export function cleanRut(raw: unknown): string {
  const s = (raw ?? '').toString().trim();
  return s.replace(/\./g, '').replace(/-/g, '').toUpperCase();
}

/** Valida RUT chileno con dígito verificador (formato flexible). */
export function isValidRutCl(raw: unknown): boolean {
  const c = cleanRut(raw);
  // 7 u 8 dígitos + DV 0-9/K
  if (!/^\d{7,8}[0-9K]$/.test(c)) return false;

  const cuerpo = c.slice(0, -1);
  const dv = c.slice(-1);
  let suma = 0;
  let multiplo = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }

  const resto = 11 - (suma % 11);
  const dvCalc = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto);
  return dv === dvCalc;
}

/** Formatea 12345678-9 => 12.345.678-9. Devuelve '' si no hay largo suficiente. */
export function formatRutCl(raw: unknown): string {
  const c = cleanRut(raw);
  if (c.length < 2) return '';
  const cuerpo = c.slice(0, -1);
  const dv = c.slice(-1);

  const grupos = cuerpo.split('').reverse().join('').match(/.{1,3}/g);
  const conPuntos = (grupos?.join('.') ?? cuerpo).split('').reverse().join('');
  return `${conPuntos}-${dv}`;
}
