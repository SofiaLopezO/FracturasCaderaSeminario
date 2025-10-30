// controller/complicacion.controller.js
const models = require('../model/initModels');
const { idParam } = require('./_crud');

async function list(req, res) {
  try {
    const rows = await models.Complicacion.findAll({ order: [['complicacion_id', 'DESC']] });
    res.json(rows);
  } catch (e) {
    console.error('list complicacion error', e);
    res.status(500).json({ error: 'Error al listar complicaciones' });
  }
}

async function getOne(req, res) {
  try {
    const id = idParam(req);
    if (!id) return res.status(400).json({ error: 'id inválido' });
    const row = await models.Complicacion.findByPk(id);
    if (!row) return res.status(404).json({ error: 'No encontrado' });
    res.json(row);
  } catch (e) {
    console.error('getOne complicacion error', e);
    res.status(500).json({ error: 'Error al obtener complicación' });
  }
}

async function create(req, res) {
  try {
    const { episodio_id, momento, presente, descripcion } = req.body || {};
    if (!episodio_id || !momento) return res.status(400).json({ error: 'episodio_id y momento son obligatorios' });
    const epi = await models.Episodio.findByPk(episodio_id);
    if (!epi) return res.status(400).json({ error: 'episodio_id no existe' });
    const created = await models.Complicacion.create({
      episodio_id,
      momento,
      presente: presente !== undefined ? !!presente : true,
      descripcion: descripcion ?? null,
    });
    res.status(201).json(created);
  } catch (e) {
    console.error('create complicacion error', e);
    res.status(500).json({ error: 'Error al crear complicación' });
  }
}

async function update(req, res) {
  try {
    const id = idParam(req);
    if (!id) return res.status(400).json({ error: 'id inválido' });
    const row = await models.Complicacion.findByPk(id);
    if (!row) return res.status(404).json({ error: 'No encontrado' });

    const body = req.body || {};
    if (body.episodio_id !== undefined) {
      const epi = await models.Episodio.findByPk(body.episodio_id);
      if (!epi) return res.status(400).json({ error: 'episodio_id no existe' });
      row.episodio_id = body.episodio_id;
    }
    if (body.momento !== undefined) row.momento = body.momento;
    if (body.presente !== undefined) row.presente = !!body.presente;
    if (body.descripcion !== undefined) row.descripcion = body.descripcion ?? null;

    await row.save();
    res.json(row);
  } catch (e) {
    console.error('update complicacion error', e);
    res.status(500).json({ error: 'Error al actualizar complicación' });
  }
}

async function remove(req, res) {
  try {
    const id = idParam(req);
    if (!id) return res.status(400).json({ error: 'id inválido' });
    const row = await models.Complicacion.findByPk(id);
    if (!row) return res.status(404).json({ error: 'No encontrado' });
    await row.destroy();
    res.status(204).send();
  } catch (e) {
    console.error('remove complicacion error', e);
    res.status(500).json({ error: 'Error al eliminar complicación' });
  }
}

module.exports = { list, getOne, create, update, remove };

