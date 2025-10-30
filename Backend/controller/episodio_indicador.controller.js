// controller/episodio_indicador.controller.js
const models = require('../model/initModels');
const { idParam } = require('./_crud');
const riesgoService = require('../services/riesgoRefracturaService');

function parseDate(input) {
  if (!input) return null;
  const t = Date.parse(input);
  return Number.isNaN(t) ? null : new Date(t);
}

async function list(req, res) {
  try {
    const rows = await models.EpisodioIndicador.findAll({ order: [['episodio_indicador_id', 'DESC']] });
    res.json(rows);
  } catch (e) {
    console.error('list episodio_indicador error', e);
    res.status(500).json({ error: 'Error al listar indicadores de episodio' });
  }
}

async function getOne(req, res) {
  try {
    const id = idParam(req);
    if (!id) return res.status(400).json({ error: 'id inválido' });
    const row = await models.EpisodioIndicador.findByPk(id);
    if (!row) return res.status(404).json({ error: 'No encontrado' });
    res.json(row);
  } catch (e) {
    console.error('getOne episodio_indicador error', e);
    res.status(500).json({ error: 'Error al obtener indicador de episodio' });
  }
}

async function create(req, res) {
  try {
    const { episodio_id, control_id, tipo, valor, nivel, detalles, calculado_en } = req.body || {};
    let episodioId = episodio_id ? Number(episodio_id) : null;
    let controlId = control_id ? Number(control_id) : null;

    let control = null;
    if (controlId) {
      if (!Number.isInteger(controlId) || controlId <= 0) {
        return res.status(400).json({ error: 'control_id inválido' });
      }
      control = await models.ControlClinico.findByPk(controlId);
      if (!control) return res.status(400).json({ error: 'control_id no existe' });
      if (!episodioId) episodioId = control.episodio_id;
    }

    if (!episodioId || !Number.isInteger(episodioId) || episodioId <= 0) {
      return res.status(400).json({ error: 'episodio_id es obligatorio' });
    }

    const epi = await models.Episodio.findByPk(episodioId);
    if (!epi) return res.status(400).json({ error: 'episodio_id no existe' });

    if (control && control.episodio_id !== episodioId) {
      return res.status(400).json({ error: 'control_id no pertenece al episodio indicado' });
    }

    if (!tipo) return res.status(400).json({ error: 'tipo es obligatorio' });
    const created = await models.EpisodioIndicador.create({
      episodio_id: episodioId,
      control_id: controlId ?? null,
      tipo,
      valor: valor ?? null,
      nivel: nivel ?? null,
      detalles: detalles ?? null,
      calculado_en: calculado_en ? parseDate(calculado_en) : new Date(),
    });
    res.status(201).json(created);
  } catch (e) {
    console.error('create episodio_indicador error', e);
    res.status(500).json({ error: 'Error al crear indicador de episodio' });
  }
}

async function update(req, res) {
  try {
    const id = idParam(req);
    if (!id) return res.status(400).json({ error: 'id inválido' });
    const row = await models.EpisodioIndicador.findByPk(id);
    if (!row) return res.status(404).json({ error: 'No encontrado' });
    const body = req.body || {};
    if (body.episodio_id !== undefined) {
      const episodioId = Number(body.episodio_id);
      if (!Number.isInteger(episodioId) || episodioId <= 0) {
        return res.status(400).json({ error: 'episodio_id inválido' });
      }
      const epi = await models.Episodio.findByPk(episodioId);
      if (!epi) return res.status(400).json({ error: 'episodio_id no existe' });
      if (row.control_id) {
        const control = await models.ControlClinico.findByPk(row.control_id);
        if (control && control.episodio_id !== episodioId) {
          return res.status(400).json({ error: 'control_id existente no pertenece al nuevo episodio' });
        }
      }
      row.episodio_id = episodioId;
    }
    if (body.control_id !== undefined) {
      if (body.control_id === null) {
        row.control_id = null;
      } else {
        const controlId = Number(body.control_id);
        if (!Number.isInteger(controlId) || controlId <= 0) {
          return res.status(400).json({ error: 'control_id inválido' });
        }
        const control = await models.ControlClinico.findByPk(controlId);
        if (!control) return res.status(400).json({ error: 'control_id no existe' });
        if (row.episodio_id && control.episodio_id !== row.episodio_id) {
          return res.status(400).json({ error: 'control_id no pertenece al episodio indicado' });
        }
        row.control_id = controlId;
      }
    }
    if (body.tipo !== undefined) row.tipo = body.tipo;
    if (body.valor !== undefined) row.valor = body.valor ?? null;
    if (body.nivel !== undefined) row.nivel = body.nivel ?? null;
    if (body.detalles !== undefined) row.detalles = body.detalles ?? null;
    if (body.calculado_en !== undefined) row.calculado_en = body.calculado_en ? parseDate(body.calculado_en) : new Date();
    await row.save();
    res.json(row);
  } catch (e) {
    console.error('update episodio_indicador error', e);
    res.status(500).json({ error: 'Error al actualizar indicador de episodio' });
  }
}

async function remove(req, res) {
  try {
    const id = idParam(req);
    if (!id) return res.status(400).json({ error: 'id inválido' });
    const row = await models.EpisodioIndicador.findByPk(id);
    if (!row) return res.status(404).json({ error: 'No encontrado' });
    await row.destroy();
    res.status(204).send();
  } catch (e) {
    console.error('remove episodio_indicador error', e);
    res.status(500).json({ error: 'Error al eliminar indicador de episodio' });
  }
}

async function recalculate(req, res) {
  try {
    const controlRaw = req.params.controlId || req.body?.control_id;
    const overrides = req.body?.overrides || req.body?.contexto || {};
    const mensajeAlerta = req.body?.mensajeAlerta;

    if (controlRaw !== undefined) {
      const controlId = Number(controlRaw);
      if (!Number.isInteger(controlId) || controlId <= 0) {
        return res.status(400).json({ error: 'control_id inválido' });
      }
      const data = await riesgoService.recalcularIndicadoresControl(controlId, {
        overrides,
        mensajeAlerta,
      });
      return res.json(data);
    }

    const rawId = req.params.episodioId || req.params.id || req.body?.episodio_id;
    const episodioId = Number(rawId);
    if (!Number.isInteger(episodioId) || episodioId <= 0) {
      return res.status(400).json({ error: 'episodio_id inválido' });
    }

    const data = await riesgoService.recalcularIndicadores(episodioId, {
      overrides,
      mensajeAlerta,
    });

    res.json(data);
  } catch (e) {
    const status = e.statusCode || e.status || 500;
    if (status >= 500) console.error('recalculate episodio_indicador error', e);
    res.status(status).json({ error: e.message || 'Error al recalcular indicadores de episodio' });
  }
}

module.exports = { list, getOne, create, update, remove, recalculate };
