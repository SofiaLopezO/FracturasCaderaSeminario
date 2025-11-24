const models = require('../model/initModels');
const { logRegistro } = require('./registro.controller');

async function list(req, res) {
    try {
        res.json(await models.Funcionario.findAll());
    } catch {
        res.status(500).json({ error: 'Error al listar funcionarios' });
    }
}

async function getOne(req, res) {
    try {
        const id = Number(req.params.user_id);
        if (!id) return res.status(400).json({ error: 'user_id inválido' });
        const row = await models.Funcionario.findByPk(id);
        if (!row) return res.status(404).json({ error: 'No encontrado' });
        res.json(row);
    } catch {
        res.status(500).json({ error: 'Error al obtener funcionario' });
    }
}

async function create(req, res) {
    try {
        const { user_id, cargo, departamento } = req.body;
        if (!user_id)
            return res.status(400).json({ error: 'user_id obligatorio' });
        const user = await models.User.findByPk(user_id);
        if (!user) return res.status(400).json({ error: 'User no existe' });

        const created = await models.Funcionario.create({
            user_id,
            cargo,
            departamento,
        });

        await logRegistro(
            req,
            `CREAR_FUNCIONARIO: user_id=${user_id}, cargo=${
                cargo || 'N/A'
            }, departamento=${departamento || 'N/A'}`,
            user_id 
        );

        res.status(201).json(created);
    } catch (err) {
        console.error('create funcionario error', err);
        res.status(500).json({ error: 'Error al crear funcionario' });
    }
}

async function update(req, res) {
    try {
        const id = Number(req.params.user_id);
        if (!id) return res.status(400).json({ error: 'user_id inválido' });
        const row = await models.Funcionario.findByPk(id);
        if (!row) return res.status(404).json({ error: 'No encontrado' });

        const { cargo, departamento } = req.body;
        if (cargo !== undefined) row.cargo = cargo;
        if (departamento !== undefined) row.departamento = departamento;
        await row.save();

        await logRegistro(
            req,
            `ACTUALIZAR_FUNCIONARIO: user_id=${id}, cargo=${
                cargo || 'sin cambio'
            }, departamento=${departamento || 'sin cambio'}`,
            id 
        );

        res.json(row);
    } catch (err) {
        console.error('update funcionario error', err);
        res.status(500).json({ error: 'Error al actualizar funcionario' });
    }
}

async function remove(req, res) {
    try {
        const id = Number(req.params.user_id);
        if (!id) return res.status(400).json({ error: 'user_id inválido' });
        const row = await models.Funcionario.findByPk(id);
        if (!row) return res.status(404).json({ error: 'No encontrado' });

        await row.destroy();

        await logRegistro(
            req,
            `ELIMINAR_FUNCIONARIO: user_id=${id}`,
            id 
        );

        res.status(204).send();
    } catch (err) {
        console.error('remove funcionario error', err);
        res.status(500).json({ error: 'Error al eliminar funcionario' });
    }
}

module.exports = { list, getOne, create, update, remove };
