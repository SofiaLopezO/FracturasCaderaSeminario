// controller/tipo_examen.controller.js
const models = require('../model/initModels');

async function list(req, res) {
    try {
        const rows = await models.TipoExamen.findAll({
            order: [['id', 'ASC']],
        });
        res.json(rows);
    } catch (e) {
        console.error('list tipo_examen error', e);
        res.status(500).json({ error: 'Error al listar tipos de examen' });
    }
}

async function getOne(req, res) {
    try {
        const id = parseInt(req.params.id);
        if (!id) return res.status(400).json({ error: 'id inválido' });
        const row = await models.TipoExamen.findByPk(id);
        if (!row) return res.status(404).json({ error: 'No encontrado' });
        res.json(row);
    } catch (e) {
        console.error('getOne tipo_examen error', e);
        res.status(500).json({ error: 'Error al obtener tipo de examen' });
    }
}

async function create(req, res) {
    try {
        const { nombre, descripcion } = req.body || {};
        if (!nombre)
            return res.status(400).json({ error: 'nombre es obligatorio' });
        const created = await models.TipoExamen.create({
            nombre: String(nombre),
            descripcion: descripcion ?? null,
        });
        res.status(201).json(created);
    } catch (e) {
        console.error('create tipo_examen error', e);
        res.status(500).json({ error: 'Error al crear tipo de examen' });
    }
}

async function update(req, res) {
    try {
        const id = parseInt(req.params.id);
        if (!id) return res.status(400).json({ error: 'id inválido' });
        const row = await models.TipoExamen.findByPk(id);
        if (!row) return res.status(404).json({ error: 'No encontrado' });
        const { nombre, descripcion } = req.body || {};
        if (nombre !== undefined) row.nombre = nombre;
        if (descripcion !== undefined) row.descripcion = descripcion ?? null;
        await row.save();
        res.json(row);
    } catch (e) {
        console.error('update tipo_examen error', e);
        res.status(500).json({ error: 'Error al actualizar tipo de examen' });
    }
}

async function remove(req, res) {
    try {
        const id = parseInt(req.params.id);
        if (!id) return res.status(400).json({ error: 'id inválido' });
        const row = await models.TipoExamen.findByPk(id);
        if (!row) return res.status(404).json({ error: 'No encontrado' });
        await row.destroy();
        res.status(204).send();
    } catch (e) {
        console.error('remove tipo_examen error', e);
        res.status(500).json({ error: 'Error al eliminar tipo de examen' });
    }
}

module.exports = { list, getOne, create, update, remove };
