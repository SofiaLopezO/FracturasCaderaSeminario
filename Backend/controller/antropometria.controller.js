// controller/antropometria.controller.js
const models = require('../model/initModels');
const { idParam } = require('./_crud');

async function list(req, res) {
  try {
    const rows = await models.Antropometria.findAll({ order: [['antropometria_id', 'DESC']] });
    res.json(rows);
  } catch (e) {
    console.error('list antropometria error', e);
    res.status(500).json({ error: 'Error al listar antropometría' });
  }
}

async function getOne(req, res) {
  try {
    const id = idParam(req);
    if (!id) return res.status(400).json({ error: 'id inválido' });
    const row = await models.Antropometria.findByPk(id);
    if (!row) return res.status(404).json({ error: 'No encontrado' });
    res.json(row);
  } catch (e) {
    console.error('getOne antropometria error', e);
    res.status(500).json({ error: 'Error al obtener antropometría' });
  }
}

async function create(req, res) {
  try {
    const { episodio_id, peso_kg, altura_m } = req.body || {};
    if (!episodio_id) return res.status(400).json({ error: 'episodio_id es obligatorio' });
    const epi = await models.Episodio.findByPk(episodio_id);
    if (!epi) return res.status(400).json({ error: 'episodio_id no existe' });

    const created = await models.Antropometria.create({
      episodio_id,
      peso_kg: peso_kg ?? null,
      altura_m: altura_m ?? null,
    });
    res.status(201).json(created);
  } catch (e) {
    console.error('create antropometria error', e);
    res.status(500).json({ error: 'Error al crear antropometría' });
  }
}

async function update(req, res) {
  try {
    const id = idParam(req);
    if (!id) return res.status(400).json({ error: 'id inválido' });
    const row = await models.Antropometria.findByPk(id);
    if (!row) return res.status(404).json({ error: 'No encontrado' });

    const body = req.body || {};
    if (body.episodio_id !== undefined) {
      const epi = await models.Episodio.findByPk(body.episodio_id);
      if (!epi) return res.status(400).json({ error: 'episodio_id no existe' });
      row.episodio_id = body.episodio_id;
    }
    if (body.peso_kg !== undefined) row.peso_kg = body.peso_kg ?? null;
    if (body.altura_m !== undefined) row.altura_m = body.altura_m ?? null;

    await row.save();
    res.json(row);
  } catch (e) {
    console.error('update antropometria error', e);
    res.status(500).json({ error: 'Error al actualizar antropometría' });
  }
}

async function remove(req, res) {
  try {
    const id = idParam(req);
    if (!id) return res.status(400).json({ error: 'id inválido' });
    const row = await models.Antropometria.findByPk(id);
    if (!row) return res.status(404).json({ error: 'No encontrado' });
    await row.destroy();
    res.status(204).send();
  } catch (e) {
    console.error('remove antropometria error', e);
    res.status(500).json({ error: 'Error al eliminar antropometría' });
  }
}

module.exports = { list, getOne, create, update, remove };

