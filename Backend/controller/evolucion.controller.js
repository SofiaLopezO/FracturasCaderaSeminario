// controller/evolucion.controller.js
const models = require('../model/initModels');
const { idParam } = require('./_crud');

async function list(req, res) {
  try {
    const rows = await models.Evolucion.findAll({ order: [['evolucion_id', 'DESC']] });
    res.json(rows);
  } catch (e) {
    console.error('list evolucion error', e);
    res.status(500).json({ error: 'Error al listar evolución' });
  }
}

async function getOne(req, res) {
  try {
    const id = idParam(req);
    if (!id) return res.status(400).json({ error: 'id inválido' });
    const row = await models.Evolucion.findByPk(id);
    if (!row) return res.status(404).json({ error: 'No encontrado' });
    res.json(row);
  } catch (e) {
    console.error('getOne evolucion error', e);
    res.status(500).json({ error: 'Error al obtener evolución' });
  }
}

async function create(req, res) {
  try {
    const { episodio_id, transfusion_requerida, reingreso_30d, comentarios } = req.body || {};
    if (!episodio_id) return res.status(400).json({ error: 'episodio_id es obligatorio' });
    const epi = await models.Episodio.findByPk(episodio_id);
    if (!epi) return res.status(400).json({ error: 'episodio_id no existe' });
    const created = await models.Evolucion.create({
      episodio_id,
      transfusion_requerida: !!transfusion_requerida,
      reingreso_30d: !!reingreso_30d,
      comentarios: comentarios ?? null,
    });
    res.status(201).json(created);
  } catch (e) {
    console.error('create evolucion error', e);
    res.status(500).json({ error: 'Error al crear evolución' });
  }
}

async function update(req, res) {
  try {
    const id = idParam(req);
    if (!id) return res.status(400).json({ error: 'id inválido' });
    const row = await models.Evolucion.findByPk(id);
    if (!row) return res.status(404).json({ error: 'No encontrado' });
    const body = req.body || {};
    if (body.episodio_id !== undefined) {
      const epi = await models.Episodio.findByPk(body.episodio_id);
      if (!epi) return res.status(400).json({ error: 'episodio_id no existe' });
      row.episodio_id = body.episodio_id;
    }
    if (body.transfusion_requerida !== undefined) row.transfusion_requerida = !!body.transfusion_requerida;
    if (body.reingreso_30d !== undefined) row.reingreso_30d = !!body.reingreso_30d;
    if (body.comentarios !== undefined) row.comentarios = body.comentarios ?? null;
    await row.save();
    res.json(row);
  } catch (e) {
    console.error('update evolucion error', e);
    res.status(500).json({ error: 'Error al actualizar evolución' });
  }
}

async function remove(req, res) {
  try {
    const id = idParam(req);
    if (!id) return res.status(400).json({ error: 'id inválido' });
    const row = await models.Evolucion.findByPk(id);
    if (!row) return res.status(404).json({ error: 'No encontrado' });
    await row.destroy();
    res.status(204).send();
  } catch (e) {
    console.error('remove evolucion error', e);
    res.status(500).json({ error: 'Error al eliminar evolución' });
  }
}

module.exports = { list, getOne, create, update, remove };

