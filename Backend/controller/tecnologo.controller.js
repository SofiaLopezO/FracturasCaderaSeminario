// controller/tecnologo.controller.js
const models = require('../model/initModels');
const { logRegistro } = require('./registro.controller');

// Helpers
function parseUserIdParam(req) {
    const raw = req.params.user_id ?? req.query.user_id;
    const id = Number(raw);
    return Number.isInteger(id) && id > 0 ? id : null;
}
function isEmpty(v) {
    return (
        v === undefined ||
        v === null ||
        (typeof v === 'string' && v.trim() === '')
    );
}
function normStr(v) {
    return isEmpty(v) ? null : String(v).trim();
}

/**
 * GET /tecnologos?limit=20&offset=0&especialidad=...
 */
async function list(req, res) {
    try {
        const limit = Math.min(Number(req.query.limit) || 20, 100);
        const offset = Number(req.query.offset) || 0;
        const where = {};
        if (!isEmpty(req.query.especialidad))
            where.especialidad = String(req.query.especialidad).trim();

        const rows = await models.Tecnologo.findAll({
            where,
            order: [['user_id', 'DESC']],
            limit,
            offset,
        });
        res.json(rows);
    } catch (err) {
        console.error('list tecnologos error:', err);
        res.status(500).json({ error: 'Error al listar tecnólogos' });
    }
}

/**
 * GET /tecnologos/:user_id
 */
async function getOne(req, res) {
    try {
        const id = parseUserIdParam(req);
        if (!id) return res.status(400).json({ error: 'user_id inválido' });

        const row = await models.Tecnologo.findByPk(id);
        if (!row) return res.status(404).json({ error: 'No encontrado' });

        res.json(row);
    } catch (err) {
        console.error('getOne tecnólogo error:', err);
        res.status(500).json({ error: 'Error al obtener tecnólogo' });
    }
}

/**
 * POST /tecnologos
 * body: { user_id, rut_profesional?, especialidad? }
 * Nota: Sólo debe usarla ADMIN (en rutas protege con auth(['ADMIN'])).
 */
async function create(req, res) {
    try {
        const { user_id, rut_profesional, especialidad } = req.body || {};
        const id = Number(user_id);
        if (!Number.isInteger(id) || id <= 0) {
            return res
                .status(400)
                .json({ error: 'user_id obligatorio y debe ser entero > 0' });
        }

        // Debe existir el usuario base
        const user = await models.User.findByPk(id);
        if (!user) return res.status(400).json({ error: 'User no existe' });

        // Evita duplicar perfil tecnólogo para el mismo user
        const exists = await models.Tecnologo.findByPk(id);
        if (exists)
            return res
                .status(409)
                .json({ error: 'El usuario ya tiene perfil de Tecnólogo' });

        const created = await models.Tecnologo.create({
            user_id: id,
            rut_profesional: normStr(rut_profesional),
            especialidad: normStr(especialidad),
        });

        // Auditoría
        await logRegistro(
            req,
            `CREAR_TECNOLOGO: user_id=${id}, rut=${user.rut}, especialidad=${
                especialidad || 'N/A'
            }`,
            id // ID del tecnólogo creado
        );

        res.status(201).json(created);
    } catch (err) {
        console.error('create tecnólogo error:', err);
        res.status(500).json({ error: 'Error al crear tecnólogo' });
    }
}

/**
 * PUT /tecnologos/:user_id
 * body: { rut_profesional?, especialidad? }
 */
async function update(req, res) {
    try {
        const id = parseUserIdParam(req);
        if (!id) return res.status(400).json({ error: 'user_id inválido' });

        const row = await models.Tecnologo.findByPk(id);
        if (!row) return res.status(404).json({ error: 'No encontrado' });

        const { rut_profesional, especialidad } = req.body || {};

        if (rut_profesional !== undefined)
            row.rut_profesional = normStr(rut_profesional);
        if (especialidad !== undefined)
            row.especialidad = normStr(especialidad);

        await row.save();

        // Auditoría
        await logRegistro(
            req,
            `ACTUALIZAR_TECNOLOGO: user_id=${id}`,
            id // ID del tecnólogo actualizado
        );

        res.json(row);
    } catch (err) {
        console.error('update tecnólogo error:', err);
        res.status(500).json({ error: 'Error al actualizar tecnólogo' });
    }
}

/**
 * DELETE /tecnologos/:user_id
 */
async function remove(req, res) {
    try {
        const id = parseUserIdParam(req);
        if (!id) return res.status(400).json({ error: 'user_id inválido' });

        const row = await models.Tecnologo.findByPk(id);
        if (!row) return res.status(404).json({ error: 'No encontrado' });

        await row.destroy();

        // Auditoría
        await logRegistro(
            req,
            `ELIMINAR_TECNOLOGO: user_id=${id}`,
            id // ID del tecnólogo eliminado
        );

        res.status(204).send();
    } catch (err) {
        console.error('remove tecnólogo error:', err);
        res.status(500).json({ error: 'Error al eliminar tecnólogo' });
    }
}

module.exports = { list, getOne, create, update, remove };
