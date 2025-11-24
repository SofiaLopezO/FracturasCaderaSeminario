// controller/cirugia.controller.js
const models = require('../model/initModels');
const { Op } = require('sequelize');
const { idParam } = require('./_crud');

function parseDateOnly(input) {
  if (!input) return null;
  const d = new Date(input);
  return isNaN(d.getTime()) ? null : d;
}

async function list(req, res) {
  try {
    const rows = await models.Cirugia.findAll({ order: [['cirugia_id', 'DESC']] });
    res.json(rows);
  } catch (e) {
    console.error('list cirugia error', e);
    res.status(500).json({ error: 'Error al listar cirugías' });
  }
}

async function getOne(req, res) {
  try {
    const id = idParam(req);
    if (!id) return res.status(400).json({ error: 'id inválido' });
    const paciente = await models.Paciente.findByPk(id);
    if (!paciente) return res.status(404).json({ error: 'Paciente no encontrado' });

    const episodios = await models.Episodio.findAll({
      attributes: ['episodio_id'],
      where: { paciente_id: id },
    });
    if (!episodios.length) return res.json([]);

    const episodioIds = episodios.map((epi) => epi.episodio_id);
    const cirugias = await models.Cirugia.findAll({
      where: { episodio_id: { [Op.in]: episodioIds } },
      order: [['fecha', 'ASC'], ['cirugia_id', 'ASC']],
    });

    res.json(cirugias);
  } catch (e) {
    console.error('getOne cirugia error', e);
    res.status(500).json({ error: 'Error al obtener cirugía' });
  }
}

async function create(req, res) {
  try {
    const {
      paciente_id,
      fecha,
      hora_inicio,
      hora_fin,
      tecnica,
      lado,
      reoperacion,
      complicacion_intraop,
      operador_id,
    } = req.body || {};

    if (!paciente_id || !fecha) {
      console.error('Invalid input', { paciente_id, fecha });
      return res.status(400).json({ error: 'paciente_id y fecha son obligatorios' });
    }

    const paciente = await models.Paciente.findByPk(paciente_id);
    if (!paciente) return res.status(400).json({ error: 'paciente_id no existe' });

    const episodio = await models.Episodio.findOne({
      where: { paciente_id },
      order: [['episodio_id', 'DESC']],
    });
    if (!episodio) {
      return res.status(400).json({ error: 'El paciente no tiene episodios registrados' });
    }

    const profesional = await models.ProfessionalProfile.findOne({ where: { user_id: operador_id } });
    if (operador_id && !profesional) {
      return res.status(400).json({ error: 'operador_id no existe' });
    }

    const created = await models.Cirugia.create({
      episodio_id: episodio.episodio_id,
      fecha: parseDateOnly(fecha) || new Date(),
      hora_inicio: hora_inicio ?? null,
      hora_fin: hora_fin ?? null,
      tecnica: tecnica ?? null,
      lado: lado ?? null,
      reoperacion: !!reoperacion,
      complicacion_intraop: complicacion_intraop ?? null,
      operador_id: profesional.id,
    });
    res.status(201).json(created);
  } catch (e) {
    console.error('create cirugia error', e);
    res.status(500).json({ error: 'Error al crear cirugía' });
  }
}

async function update(req, res) {
  try {
    const id = idParam(req);
    if (!id) return res.status(400).json({ error: 'id inválido' });
    const row = await models.Cirugia.findByPk(id);
    if (!row) return res.status(404).json({ error: 'No encontrado' });

    const body = req.body || {};
    const assign = (key, value, transform) => {
      if (value === undefined) return;
      row[key] = transform ? transform(value) : value ?? null;
    };
    if (body.episodio_id !== undefined) {
      const epi = await models.Episodio.findByPk(body.episodio_id);
      if (!epi) return res.status(400).json({ error: 'episodio_id no existe' });
      row.episodio_id = body.episodio_id;
    }
    assign('hora_fin', body.hora_fin);
    assign('tecnica', body.tecnica);
    assign('lado', body.lado);
    if (body.reoperacion !== undefined) row.reoperacion = !!body.reoperacion;
    assign('complicacion_intraop', body.complicacion_intraop);
    assign('operador_id', body.operador_id ?? null);

    await row.save();
    res.json(row);
  } catch (e) {
    console.error('update cirugia error', e);
    res.status(500).json({ error: 'Error al actualizar cirugía' });
  }
}

async function remove(req, res) {
  try {
    const id = idParam(req);
    if (!id) return res.status(400).json({ error: 'id inválido' });
    const row = await models.Cirugia.findByPk(id);
    if (!row) return res.status(404).json({ error: 'No encontrado' });
    await row.destroy();
    res.status(204).send();
  } catch (e) {
    console.error('remove cirugia error', e);
    res.status(500).json({ error: 'Error al eliminar cirugía' });
  }
}

module.exports = { list, getOne, create, update, remove };
