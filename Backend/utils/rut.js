function normalizeRut(input) {
  if (typeof input !== 'string') return { cuerpo: '', dv: '' };
  const clean = input.replace(/\./g, '').replace(/\s+/g, '').toUpperCase();
  const m = clean.match(/^(\d+)-?([\dK])$/);
  if (!m) return { cuerpo: '', dv: '' };
  return { cuerpo: m[1], dv: m[2] };
}

function computeDv(cuerpo) {
  let sum = 0, mul = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    sum += parseInt(cuerpo[i], 10) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const rest = 11 - (sum % 11);
  if (rest === 11) return '0';
  if (rest === 10) return 'K';
  return String(rest);
}

function isValidRut(rut) {
  const { cuerpo, dv } = normalizeRut(rut);
  if (!cuerpo || !dv) return false;
  if (!/^\d+$/.test(cuerpo)) return false;
  return computeDv(cuerpo) === dv;
}

function formatRut(rut) {
  const { cuerpo, dv } = normalizeRut(rut);
  if (!cuerpo || !dv) return '';
  const rev = cuerpo.split('').reverse();
  const withDots = [];
  for (let i = 0; i < rev.length; i++) {
    if (i > 0 && i % 3 === 0) withDots.push('.');
    withDots.push(rev[i]);
  }
  return withDots.reverse().join('') + '-' + dv;
}

module.exports = { normalizeRut, computeDv, isValidRut, formatRut };
