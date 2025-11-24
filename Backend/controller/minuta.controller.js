const models = require('../model/initModels');
const { idParam } = require('./_crud');

async function list(req, res) {
    try {
        res.json(
            await models.Minuta.findAll({ order: [['minuta_id', 'DESC']] })
        );
    } catch {
        res.status(500).json({ error: 'Error al listar minutas' });
    }
}
async function getOne(req, res) {
    try {
        const id = idParam(req);
        if (!id) return res.status(400).json({ error: 'id inválido' });
        const row = await models.Minuta.findByPk(id);
        if (!row) return res.status(404).json({ error: 'No encontrado' });
        res.json(row);
    } catch {
        res.status(500).json({ error: 'Error al obtener minuta' });
    }
}
async function create(req, res) {
    try {

        const { ruta_pdf, fecha_creacion, paciente_id } = req.body;


        if (!ruta_pdf || !fecha_creacion || !paciente_id)
            return res.status(400).json({
                error: 'ruta_pdf, fecha_creacion, paciente_id obligatorios',
            });

        if (!(await models.Paciente.findByPk(paciente_id))) {

            return res.status(400).json({ error: 'paciente_id no existe' });
        }

        const usuario = await models.User.findOne({
            where: { rut: req.user.rut },
        });

        if (!usuario) {
            console.log('Usuario no encontrado')
            return res.status(400).json({ error: 'Usuario no encontrado' });
        }


        const profesional = await models.ProfessionalProfile.findOne({
            where: { user_id: usuario.id },
        });


        if (!profesional) {
            console.log('No se encontró profesional para el usuario');
            return res.status(400).json({
                error: 'No se encontró un perfil profesional para el usuario',
            });
        }


        const created = await models.Minuta.create({
            ruta_pdf,
            fecha_creacion: new Date(fecha_creacion),
            paciente_id,
            profesional_id: profesional.id,
        });
        console.log('Minuta creada exitosamente:', created);
        res.status(201).json(created);
    } catch (error) {
        console.error('Error al crear minuta:', error);
        res.status(500).json({
            error: 'Error al crear minuta',
            details: error.message,
        });
    }
}
async function update(req, res) {
    try {
        const id = idParam(req);
        if (!id) return res.status(400).json({ error: 'id inválido' });
        const row = await models.Minuta.findByPk(id);
        if (!row) return res.status(404).json({ error: 'No encontrado' });
        const {
            ruta_pdf,
            fecha_creacion,
            funcionario_id,
            paciente_id,
            tecnologo_id,
        } = req.body;
        if (ruta_pdf !== undefined) row.ruta_pdf = ruta_pdf;
        if (fecha_creacion !== undefined)
            row.fecha_creacion = new Date(fecha_creacion);
        if (funcionario_id !== undefined) {
            if (!(await models.Funcionario.findByPk(funcionario_id)))
                return res
                    .status(400)
                    .json({ error: 'funcionario_id no existe' });
            row.funcionario_id = funcionario_id;
        }
        if (paciente_id !== undefined) {
            if (!(await models.Paciente.findByPk(paciente_id)))
                return res.status(400).json({ error: 'paciente_id no existe' });
            row.paciente_id = paciente_id;
        }
        if (tecnologo_id !== undefined) {
            if (!(await models.Tecnologo.findByPk(tecnologo_id)))
                return res
                    .status(400)
                    .json({ error: 'tecnologo_id no existe' });
            row.tecnologo_id = tecnologo_id;
        }
        await row.save();
        res.json(row);
    } catch {
        res.status(500).json({ error: 'Error al actualizar minuta' });
    }
}
async function remove(req, res) {
    try {
        const id = idParam(req);
        if (!id) return res.status(400).json({ error: 'id inválido' });
        const row = await models.Minuta.findByPk(id);
        if (!row) return res.status(404).json({ error: 'No encontrado' });
        await row.destroy();
        res.status(204).send();
    } catch {
        res.status(500).json({ error: 'Error al eliminar minuta' });
    }
}

module.exports = { list, getOne, create, update, remove };
