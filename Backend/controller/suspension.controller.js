// controller/suspension.controller.js
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
        const rows = await models.Suspension.findAll({
            order: [['suspension_id', 'DESC']],
        });
        res.json(rows);
    } catch (e) {
        console.error('list suspension error', e);
        res.status(500).json({ error: 'Error al listar suspensiones' });
    }
}

async function getOne(req, res) {
    try {
        const id = idParam(req);
        if (!id) return res.status(400).json({ error: 'id inválido' });
        const paciente = await models.Paciente.findByPk(id);
        if (!paciente)
            return res.status(404).json({ error: 'Paciente no encontrado' });

        const episodios = await models.Episodio.findAll({
            attributes: ['episodio_id'],
            where: { paciente_id: id },
        });
        if (!episodios.length) return res.json([]);

        const episodioIds = episodios.map((epi) => epi.episodio_id);
        const suspensiones = await models.Suspension.findAll({
            where: { episodio_id: { [Op.in]: episodioIds } },
            order: [
                ['fecha_suspension', 'ASC'],
                ['suspension_id', 'ASC'],
            ],
        });

        res.json(suspensiones);
    } catch (e) {
        console.error('getOne suspension error', e);
        res.status(500).json({ error: 'Error al obtener suspensión' });
    }
}

async function create(req, res) {
    try {
        const { paciente_id, fecha_suspension, tipo, motivo } = req.body || {};
        if (!paciente_id || !fecha_suspension || !tipo || !motivo)
            return res.status(400).json({
                error: 'paciente_id, fecha_suspension, tipo y motivo son obligatorios',
            });
        const paciente = await models.Paciente.findByPk(paciente_id);
        if (!paciente)
            return res.status(400).json({ error: 'paciente_id no existe' });

        const episodio = await models.Episodio.findOne({
            where: { paciente_id },
            order: [['episodio_id', 'DESC']],
        });
        if (!episodio) {
            return res
                .status(400)
                .json({ error: 'El paciente no tiene episodios registrados' });
        }
        const created = await models.Suspension.create({
            episodio_id: episodio.episodio_id,
            fecha_suspension: parseDateOnly(fecha_suspension) || new Date(),
            tipo,
            motivo,
        });
        res.status(201).json(created);
    } catch (e) {
        console.error('create suspension error', e);
        res.status(500).json({ error: 'Error al crear suspensión' });
    }
}

async function update(req, res) {
    try {
        const id = idParam(req);
        if (!id) return res.status(400).json({ error: 'id inválido' });
        const row = await models.Suspension.findByPk(id);
        if (!row) return res.status(404).json({ error: 'No encontrado' });
        const body = req.body || {};
        if (body.episodio_id !== undefined) {
            const epi = await models.Episodio.findByPk(body.episodio_id);
            if (!epi)
                return res.status(400).json({ error: 'episodio_id no existe' });
            row.episodio_id = body.episodio_id;
        }
        if (body.fecha_suspension !== undefined)
            row.fecha_suspension = body.fecha_suspension
                ? parseDateOnly(body.fecha_suspension)
                : row.fecha_suspension;
        if (body.tipo !== undefined) row.tipo = body.tipo;
        if (body.motivo !== undefined) row.motivo = body.motivo;
        await row.save();
        res.json(row);
    } catch (e) {
        console.error('update suspension error', e);
        res.status(500).json({ error: 'Error al actualizar suspensión' });
    }
}

async function remove(req, res) {
    try {
        const id = idParam(req);
        if (!id) return res.status(400).json({ error: 'id inválido' });
        const row = await models.Suspension.findByPk(id);
        if (!row) return res.status(404).json({ error: 'No encontrado' });
        await row.destroy();
        res.status(204).send();
    } catch (e) {
        console.error('remove suspension error', e);
        res.status(500).json({ error: 'Error al eliminar suspensión' });
    }
}

module.exports = { list, getOne, create, update, remove };
