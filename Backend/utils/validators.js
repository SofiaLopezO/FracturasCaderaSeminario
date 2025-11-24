// utils/validators.js
function parseValorDecimal(raw) {
  if (raw === null || raw === undefined) return { ok: false, err: 'Falta valor' };
  const txt = String(raw).trim();
  if (!txt) return { ok: false, err: 'Falta valor' };
  if (txt.length > 12) return { ok: false, err: 'Demasiados dígitos' };
  if (/e|E/.test(txt)) return { ok: false, err: 'No se permite notación científica' };
  if (/[\s_a-zA-Z]/.test(txt)) return { ok: false, err: 'Sólo dígitos y separador decimal' };

  const hasDot = txt.includes('.');
  const hasComma = txt.includes(',');
  if (hasDot && hasComma) return { ok: false, err: 'Usa punto o coma, no ambos' };

  const re = /^\d+(?:[.,]\d+)?$/;
  if (!re.test(txt)) return { ok: false, err: 'Formato inválido (ej: 3.1 o 3,1)' };

  const [, dec = ''] = txt.split(hasComma ? ',' : '.');
  if (dec && dec.length > 3) return { ok: false, err: 'Máx. 3 decimales' };

  const val = Number(txt.replace(',', '.'));
  if (!Number.isFinite(val)) return { ok: false, err: 'No numérico' };
  return { ok: true, value: val };
}

const MAX_ABS_NO_RI = 1e6;
const IMPROBABLE_FACTOR_HIGH = 10;
const IMPROBABLE_FACTOR_LOW = 10;

function esValidoValorResultado(valorNum, unidad, ref_min, ref_max) {
  if (typeof valorNum !== 'number' || !isFinite(valorNum)) return false;

  if (String(unidad || '').trim().toLowerCase() === '%') {
    if (valorNum < 0 || valorNum > 100) return false;
  } else {
    if (valorNum < 0) return false;
  }

  if (ref_min == null || ref_max == null) {
    return Math.abs(valorNum) <= MAX_ABS_NO_RI;
  }

  const tooHigh = valorNum > ref_max * IMPROBABLE_FACTOR_HIGH;
  const tooLow = ref_min > 0 ? valorNum < ref_min / IMPROBABLE_FACTOR_LOW : false;
  return !(tooHigh || tooLow);
}

module.exports = {
  parseValorDecimal,
  esValidoValorResultado,
};
