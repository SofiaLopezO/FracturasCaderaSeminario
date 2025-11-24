const models = require('../model/initModels');
const { logRegistro } = require('./registro.controller');

async function list(req, res) {
    try {
        res.json(await models.Administrador.findAll());
    } catch {
        res.status(500).json({ error: 'Error al listar administradores' });
    }
}

async function getOne(req, res) {
    try {
        const id = Number(req.params.user_id);
        if (!id) return res.status(400).json({ error: 'user_id inválido' });
        const row = await models.Administrador.findByPk(id);
        if (!row) return res.status(404).json({ error: 'No encontrado' });
        res.json(row);
    } catch {
        res.status(500).json({ error: 'Error al obtener administrador' });
    }
}

async function create(req, res) {
    try {
        const { user_id, nivel_acceso } = req.body;
        if (!user_id)
            return res.status(400).json({ error: 'user_id obligatorio' });
        const user = await models.User.findByPk(user_id);
        if (!user) return res.status(400).json({ error: 'User no existe' });
        const created = await models.Administrador.create({
            user_id,
            nivel_acceso,
        });

        await logRegistro(
            req,
            `CREAR_ADMINISTRADOR: user_id=${user_id}, nivel_acceso=${
                nivel_acceso || 'N/A'
            }`,
            user_id 
        );

        res.status(201).json(created);
    } catch (err) {
        console.error('create administrador error', err);
        res.status(500).json({ error: 'Error al crear administrador' });
    }
}

async function update(req, res) {
    try {
        const id = Number(req.params.user_id);
        if (!id) return res.status(400).json({ error: 'user_id inválido' });
        const row = await models.Administrador.findByPk(id);
        if (!row) return res.status(404).json({ error: 'No encontrado' });

        const user = await models.User.findByPk(id);
        const { nivel_acceso } = req.body;
        const oldNivel = row.nivel_acceso;

        if (nivel_acceso !== undefined) row.nivel_acceso = nivel_acceso;
        await row.save();


        await logRegistro(
            req,
            `ACTUALIZAR_ADMINISTRADOR: user_id=${id}, nivel_acceso ${oldNivel} → ${nivel_acceso}`,
            id 
        );

        res.json(row);
    } catch (err) {
        console.error('update administrador error', err);
        res.status(500).json({ error: 'Error al actualizar administrador' });
    }
}

async function remove(req, res) {
    try {
        const id = Number(req.params.user_id);
        if (!id) return res.status(400).json({ error: 'user_id inválido' });
        const row = await models.Administrador.findByPk(id);
        if (!row) return res.status(404).json({ error: 'No encontrado' });

        const user = await models.User.findByPk(id);
        await row.destroy();

        await logRegistro(
            req,
            `ELIMINAR_ADMINISTRADOR: user_id=${id}`,
            id
        );

        res.status(204).send();
    } catch (err) {
        console.error('remove administrador error', err);
        res.status(500).json({ error: 'Error al eliminar administrador' });
    }
}

module.exports = { list, getOne, create, update, remove };
