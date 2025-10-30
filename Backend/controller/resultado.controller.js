const models = require("../model/initModels");
const { idParam } = require("./_crud");
const riesgoService = require("../services/riesgoRefracturaService");
const labAlertService = require("../services/labAlertService");

function parseDate(input) {
  if (!input) return null;
  const t = Date.parse(input);
  return Number.isNaN(t) ? null : new Date(t);
}

async function list(req, res) {
  try {
    const rows = await models.Resultado.findAll({ order: [["resultado_id","DESC"]] });
    res.json(rows);
  } catch (e) {
    console.error('list resultado error', e);
    res.status(500).json({ error: "Error al listar resultados" });
  }
}

async function getOne(req, res) {
  try {
    const id = idParam(req); if (!id) return res.status(400).json({ error: "id inválido" });
    const row = await models.Resultado.findByPk(id); if (!row) return res.status(404).json({ error: "No encontrado" });
    res.json(row);
  } catch (e) {
    console.error('getOne resultado error', e);
    res.status(500).json({ error: "Error al obtener resultado" });
  }
}

async function create(req, res) {
  try {
    const {paciente_id,parametro, valor, unidad, fecha_resultado, muestra_id, examen_id } = req.body || {};
    if (!parametro || valor === undefined )
      return res.status(400).json({ error: "parametro, valor y fecha_resultado son obligatorios" });

    const epi = await models.Episodio.findByPk(episodio_id);
    if (!epi) return res.status(400).json({ error: "episodio_id no existe" });

    if (muestra_id !== undefined && muestra_id !== null) {
      const m = await models.Muestra.findByPk(muestra_id); if (!m) return res.status(400).json({ error: "muestra_id no existe" });
    }
    if (examen_id !== undefined && examen_id !== null) {
      const ex = await models.Examen.findByPk(examen_id); if (!ex) return res.status(400).json({ error: "examen_id no existe" });
    }
    // Validar catálogo de parámetros si existe
    if (models.ParametroLab && parametro) {
      const p = await models.ParametroLab.findByPk(String(parametro));
      if (!p) {
        // no interrumpimos, pero podríamos advertir; para CRUD básico dejamos pasar
      }
    }
    
    let episodio_id;
    if (paciente_id) {
      const ultimoEpisodio = await models.Episodio.findOne({
        where: { paciente_id },
        order: [["episodio_id", "DESC"]],
      });
      if (!ultimoEpisodio) {
        return res.status(400).json({ error: "No se encontró un episodio para el paciente_id proporcionado" });
      }
      episodio_id = ultimoEpisodio.episodio_id;
    } else {
      return res.status(400).json({ error: "paciente_id es obligatorio" });
    }

    const created = await models.Resultado.create({
      episodio_id,
      parametro,
      valor,
      unidad: unidad ?? null,
      fecha_resultado: parseDate(fecha_resultado) || new Date(),
      muestra_id: muestra_id ?? null,
      examen_id: examen_id ?? null,
    });
    try {
      await riesgoService.recalcularIndicadores(episodio_id);
    } catch (recalcError) {
      console.error('recalculo riesgo post-resultado', recalcError);
    }
    try {
      await labAlertService.syncAlertForResultado(created);
    } catch (alertError) {
      console.error('alerta laboratorio post-resultado', alertError);
    }
    res.status(201).json(created);
  } catch (e) {
    console.error('create resultado error', e);
    res.status(500).json({ error: "Error al crear resultado" });
  }
}

async function update(req, res) {
  try {
    const id = idParam(req); if (!id) return res.status(400).json({ error: "id inválido" });
    const row = await models.Resultado.findByPk(id); if (!row) return res.status(404).json({ error: "No encontrado" });
    const { episodio_id, parametro, valor, unidad, fecha_resultado, muestra_id, examen_id } = req.body || {};
    if (episodio_id !== undefined) {
      const epi = await models.Episodio.findByPk(episodio_id); if (!epi) return res.status(400).json({ error: "episodio_id no existe" });
      row.episodio_id = episodio_id;
    }
    if (parametro !== undefined) row.parametro = parametro;
    if (valor !== undefined) row.valor = valor;
    if (unidad !== undefined) row.unidad = unidad ?? null;
    if (fecha_resultado !== undefined) row.fecha_resultado = fecha_resultado ? parseDate(fecha_resultado) : row.fecha_resultado;
    if (muestra_id !== undefined) {
      if (muestra_id === null) row.muestra_id = null; else {
        const m = await models.Muestra.findByPk(muestra_id); if (!m) return res.status(400).json({ error: "muestra_id no existe" });
        row.muestra_id = muestra_id;
      }
    }
    if (examen_id !== undefined) {
      if (examen_id === null) row.examen_id = null; else {
        const ex = await models.Examen.findByPk(examen_id); if (!ex) return res.status(400).json({ error: "examen_id no existe" });
        row.examen_id = examen_id;
      }
    }
    await row.save();
    try {
      await riesgoService.recalcularIndicadores(row.episodio_id);
    } catch (recalcError) {
      console.error('recalculo riesgo post-resultado update', recalcError);
    }
    try {
      await labAlertService.syncAlertForResultado(row);
    } catch (alertError) {
      console.error('alerta laboratorio post-resultado update', alertError);
    }
    res.json(row);
  } catch (e) {
    console.error('update resultado error', e);
    res.status(500).json({ error: "Error al actualizar resultado" });
  }
}

async function remove(req, res) {
  try {
    const id = idParam(req); if (!id) return res.status(400).json({ error: "id inválido" });
    const row = await models.Resultado.findByPk(id); if (!row) return res.status(404).json({ error: "No encontrado" });
    await row.destroy(); res.status(204).send();
  } catch (e) {
    console.error('remove resultado error', e);
    res.status(500).json({ error: "Error al eliminar resultado" });
  }
}

module.exports = { list, getOne, create, update, remove };
