// services/labAlertService.js
const models = require('../model/initModels');

function toNumber(value) {
  if (value === undefined || value === null) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function buildRangeText(min, max, unidad) {
  const unit = unidad ? ` ${unidad}` : '';
  if (min !== null && max !== null) return `${min}${unit} - ${max}${unit}`;
  if (min !== null) return `>= ${min}${unit}`;
  if (max !== null) return `<= ${max}${unit}`;
  return null;
}

function describeOutside(min, max, value) {
  if (min !== null && value < min) return 'bajo';
  if (max !== null && value > max) return 'alto';
  return 'fuera de rango';
}

/**
 * Sincroniza/crea/actualiza la alerta asociada a un Resultado de laboratorio.
 * @param {object} resultado - fila plain o instancia Sequelize de Resultado
 * @param {object} [deps] - dependencias inyectables para test
 * @param {object} [deps.models] - reemplazo de models (Sequelize)
 * @returns {Promise<object|null>} alerta plain creada/actualizada o null si no aplica
 */
async function syncAlertForResultado(resultado, { models: injectedModels } = {}) {
  const m = injectedModels || models; // <<--- inyección
  if (!resultado) return null;

  const data = typeof resultado.get === 'function' ? resultado.get({ plain: true }) : resultado;
  const { resultado_id: resultadoId, episodio_id: episodioId, parametro, valor } = data || {};
  if (!episodioId || !parametro || valor === undefined || valor === null) return null;

  const parametroRow = await m.ParametroLab.findByPk(String(parametro));
  if (!parametroRow) return null;

  const refMin = toNumber(parametroRow.ref_min);
  const refMax = toNumber(parametroRow.ref_max);
  if (refMin === null && refMax === null) return null;

  const numericValue = toNumber(valor);
  if (numericValue === null) return null;

  const fueraMin = refMin !== null && numericValue < refMin;
  const fueraMax = refMax !== null && numericValue > refMax;
  const fueraRango = fueraMin || fueraMax;

  const unidad = parametroRow.unidad || data.unidad || '';
  const rangeText = buildRangeText(refMin, refMax, unidad);
  const nombreParametro = parametroRow.nombre || parametro;

  const existing = await m.Alerta.findOne({ where: { resultado_id: resultadoId } });

  if (fueraRango) {
    const severidad =
      (fueraMin && refMin !== null) || (fueraMax && refMax !== null) ? 'ALTA' : 'MEDIA';
    const estado = describeOutside(refMin, refMax, numericValue);
    const mensaje = `${nombreParametro}: ${numericValue}${unidad ? ` ${unidad}` : ''} (${estado}). Referencia ${rangeText || 'no disponible'}.`;

    if (existing) {
      existing.tipo = 'LAB';
      existing.severidad = severidad;
      existing.mensaje = mensaje;
      existing.episodio_id = episodioId;
      existing.indicador_id = existing.indicador_id ?? null;
      existing.activa = true;
      existing.resuelta_en = null;
      await existing.save();
      return existing.get({ plain: true });
    }

    const created = await m.Alerta.create({
      episodio_id: episodioId,
      tipo: 'LAB',
      severidad,
      mensaje,
      resultado_id: resultadoId,
      activa: true,
    });
    return created.get({ plain: true });
  }

  if (existing && existing.activa) {
    existing.activa = false;
    existing.resuelta_en = new Date();
    await existing.save();
    return existing.get({ plain: true });
  }

  return null;
}

module.exports = {
  syncAlertForResultado,
};
// opcional: facilitar interop ESM por default
module.exports.default = module.exports;
