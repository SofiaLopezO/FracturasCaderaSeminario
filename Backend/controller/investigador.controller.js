const models = require('../model/initModels');
const { logRegistro } = require('./registro.controller');

async function list(req, res) {
    try {
        res.json(await models.Investigador.findAll());
    } catch {
        res.status(500).json({ error: 'Error al listar investigadores' });
    }
}

async function getOne(req, res) {
    try {
        const id = Number(req.params.user_id);
        if (!id) return res.status(400).json({ error: 'user_id inválido' });
        const row = await models.Investigador.findByPk(id);
        if (!row) return res.status(404).json({ error: 'No encontrado' });
        res.json(row);
    } catch {
        res.status(500).json({ error: 'Error al obtener investigador' });
    }
}

async function create(req, res) {
    try {
        const { user_id, area } = req.body;
        if (!user_id)
            return res.status(400).json({ error: 'user_id obligatorio' });
        const user = await models.User.findByPk(user_id);
        if (!user) return res.status(400).json({ error: 'User no existe' });
        const created = await models.Investigador.create({ user_id, area });

        // Registrar la acción
        await logRegistro(
            req,
            `CREAR_INVESTIGADOR: user_id=${user_id}, rut=${user.rut}, area=${
                area || 'N/A'
            }`,
            user_id // ID del investigador creado
        );

        res.status(201).json(created);
    } catch (err) {
        console.error('create investigador error', err);
        res.status(500).json({ error: 'Error al crear investigador' });
    }
}

async function update(req, res) {
    try {
        const id = Number(req.params.user_id);
        if (!id) return res.status(400).json({ error: 'user_id inválido' });
        const row = await models.Investigador.findByPk(id);
        if (!row) return res.status(404).json({ error: 'No encontrado' });

        const { area } = req.body;
        if (area !== undefined) row.area = area;
        await row.save();

        // Registrar la acción
        await logRegistro(
            req,
            `ACTUALIZAR_INVESTIGADOR: user_id=${id}, area=${
                area || 'sin cambio'
            }`,
            id // ID del investigador actualizado
        );

        res.json(row);
    } catch (err) {
        console.error('update investigador error', err);
        res.status(500).json({ error: 'Error al actualizar investigador' });
    }
}

async function remove(req, res) {
    try {
        const id = Number(req.params.user_id);
        if (!id) return res.status(400).json({ error: 'user_id inválido' });
        const row = await models.Investigador.findByPk(id);
        if (!row) return res.status(404).json({ error: 'No encontrado' });

        await row.destroy();

        // Registrar la acción
        await logRegistro(
            req,
            `ELIMINAR_INVESTIGADOR: user_id=${id}`,
            id // ID del investigador eliminado
        );

        res.status(204).send();
    } catch (err) {
        console.error('remove investigador error', err);
        res.status(500).json({ error: 'Error al eliminar investigador' });
    }
}

module.exports = { list, getOne, create, update, remove };
