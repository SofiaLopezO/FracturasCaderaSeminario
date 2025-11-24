// controller/registro.controller.js
const models = require('../model/initModels');

function parseIdParam(req) {
    const raw = req.params.id ?? req.query.id;
    const id = Number(raw);
    return Number.isInteger(id) && id > 0 ? id : null;
}

function parseDateOrNull(input) {
    if (!input) return null;
    const t = Date.parse(input);
    return Number.isNaN(t) ? null : new Date(t);
}

async function list(req, res) {
    try {
        const limit = Math.min(Number(req.query.limit) || 20, 100);
        const offset = Number(req.query.offset) || 0;
        const where = {};
        if (req.query.accion) where.accion = String(req.query.accion).trim();

        const rows = await models.Registro.findAll({
            where,
            order: [['registro_id', 'DESC']],
            limit,
            offset,
        });
        res.json(rows);
    } catch (err) {
        console.error('list registros error', err);
        res.status(500).json({ error: 'Error al listar registros' });
    }
}

async function getOne(req, res) {
    try {
        const id = parseIdParam(req);
        if (!id) return res.status(400).json({ error: 'id inválido' });

        const row = await models.Registro.findByPk(id);
        if (!row) return res.status(404).json({ error: 'No encontrado' });
        res.json(row);
    } catch (err) {
        console.error('getOne registro error', err);
        res.status(500).json({ error: 'Error al obtener registro' });
    }
}

async function create(req, res) {
    try {
        const { accion, fecha_registro } = req.body || {};
        if (!accion)
            return res.status(400).json({ error: 'accion obligatoria' });

        const fecha = parseDateOrNull(fecha_registro) || new Date(); // default: ahora
        if (!fecha)
            return res
                .status(400)
                .json({ error: 'fecha_registro inválida (ISO recomendado)' });

        const actorUserId = req.user?.rut || null;
        console.log('actorUserId:', actorUserId);
        let administrador_id = null;
        administrador_id = await models.User.findOne({
            where: { rut: actorUserId },
        });
        console.log('administrador_id:', administrador_id);
        if (req.body?.user.id != null) {
            const id = Number(req.body.user.id);
            const user = await models.User.findByPk(id);
            if (!user)
                return res.status(400).json({ error: 'usuario no existe' });
        }

        const created = await models.Registro.create({
            accion: String(accion).trim(),
            fecha_registro: fecha,
            administrador_id,
            actor_user_id: actorUserId,
        });

        res.status(201)
            .location(`/registros/${created.registro_id}`)
            .json(created);
    } catch (err) {
        console.error('create registro error', err);
        res.status(500).json({ error: 'Error al crear registro' });
    }
}

async function update(req, res) {
    try {
        const id = parseIdParam(req);
        if (!id) return res.status(400).json({ error: 'id inválido' });

        const row = await models.Registro.findByPk(id);
        if (!row) return res.status(404).json({ error: 'No encontrado' });

        const { accion, fecha_registro, administrador_id } = req.body || {};

        if (accion !== undefined) row.accion = String(accion).trim();

        if (fecha_registro !== undefined) {
            const fecha = parseDateOrNull(fecha_registro);
            if (!fecha)
                return res
                    .status(400)
                    .json({ error: 'fecha_registro inválida' });
            row.fecha_registro = fecha;
        }

        if (administrador_id !== undefined) {
            if (administrador_id) {
                const userId = Number(administrador_id);
                if (!Number.isInteger(userId) || userId <= 0) {
                    return res.status(400).json({
                        error: 'administrador_id debe ser un entero positivo',
                    });
                }
                const user = await models.User.findByPk(userId);
                if (!user)
                    return res
                        .status(400)
                        .json({ error: 'administrador_id no existe' });
                const adm = await models.Administrador.findByPk(userId);
                if (!adm)
                    return res.status(400).json({
                        error: 'administrador_id no corresponde a un administrador',
                    });
                row.administrador_id = userId;
            } else {
                row.administrador_id = null;
            }
        }

        await row.save();
        res.json(row);
    } catch (err) {
        console.error('update registro error', err);
        res.status(500).json({ error: 'Error al actualizar registro' });
    }
}

async function remove(req, res) {
    try {
        const id = parseIdParam(req);
        if (!id) return res.status(400).json({ error: 'id inválido' });

        const row = await models.Registro.findByPk(id);
        if (!row) return res.status(404).json({ error: 'No encontrado' });

        await row.destroy();
        res.status(204).send();
    } catch (err) {
        console.error('remove registro error', err);
        res.status(500).json({ error: 'Error al eliminar registro' });
    }
}

async function logRegistro(req, accion, user_afectado_id = null, options = {}) {
    try {
        const safeAction = accion
            ? String(accion).trim()
            : 'ACCION_DESCONOCIDA';
        const hasUserProp =
            req && typeof req === 'object'
                ? Object.prototype.hasOwnProperty.call(req, 'user')
                : false;
        const administradorrut =
            options.actorRut ?? req?.user?.rut ?? req?.rut ?? null;
        if (!administradorrut && hasUserProp && !options.suppressWarning) {
            console.warn(
                '⚠️ logRegistro: req.user no disponible para acción:',
                safeAction
            );
            console.warn('req.user:', req?.user);
        }
        let administradorUsuario = null;
        if (administradorrut) {
            administradorUsuario = await models.User.findOne({
                where: { rut: administradorrut },
            });
        }
        const actorUserId =
            options.actorUserId ??
            req?.user?.id ??
            req?.actor_user_id ??
            user_afectado_id ??
            null;
        await models.Registro.create({
            accion: safeAction,
            fecha_registro: new Date(),
            administrador_id: administradorUsuario?.id ?? null,
            actor_user_id: actorUserId,
        });
    } catch (e) {
        console.error('logRegistro error:', e);
    }
}

module.exports = { list, getOne, create, update, remove, logRegistro };
