const models = require('../model/initModels');
const { idParam } = require('./_crud');

async function list(req, res) {
    try {
        res.json(
            await models.Muestra.findAll({ order: [['muestra_id', 'DESC']] })
        );
    } catch {
        res.status(500).json({ error: 'Error al listar muestras' });
    }
}
async function getOne(req, res) {
    try {
        const id = idParam(req);
        if (!id) return res.status(400).json({ error: 'id inválido' });
        const row = await models.Muestra.findByPk(id);
        if (!row) return res.status(404).json({ error: 'No encontrado' });
        res.json(row);
    } catch {
        res.status(500).json({ error: 'Error al obtener muestra' });
    }
}
async function create(req, res) {
    try {
        const { fecha_toma, examen_id, tecnologo_id,tipo_muestra } = req.body;
        if ( !examen_id || !tecnologo_id)
            return res
                .status(400)
                .json({
                    error: 'examen_id, tecnologo_id obligatorios',
                });
        console.log("Examen ID:", examen_id);
        const ex = await models.Examen.findByPk(examen_id);
        if (!ex) return res.status(400).json({ error: 'examen_id no existe' });
        console.log("Tec ID:", tecnologo_id);
        const tec = await models.ProfessionalProfile.findByPk(tecnologo_id);
        if (!tec)
            return res.status(400).json({ error: 'tecnologo_id no existe' });
        const created = await models.Muestra.create({
            fecha_extraccion: fecha_toma ? new Date(fecha_toma) : new Date(),
            examen_id,
            profesional_id: tecnologo_id,
            tipo_muestra
        });
        res.status(201).json(created);
    } catch (err){
        res.status(500).json({ error: 'Error al crear muestra', errorDetails: err.message  });
    }
}
async function update(req, res) {
    try {
        const id = idParam(req);
        if (!id) return res.status(400).json({ error: 'id inválido' });
        const row = await models.Muestra.findByPk(id);
        if (!row) return res.status(404).json({ error: 'No encontrado' });
        const { fecha_toma, examen_id, tecnologo_id } = req.body;
        if (fecha_toma !== undefined) row.fecha_toma = new Date(fecha_toma);
        if (examen_id !== undefined) {
            const ex = await models.Examen.findByPk(examen_id);
            if (!ex)
                return res.status(400).json({ error: 'examen_id no existe' });
            row.examen_id = examen_id;
        }
        if (tecnologo_id !== undefined) {
            const tec = await models.Tecnologo.findByPk(tecnologo_id);
            if (!tec)
                return res
                    .status(400)
                    .json({ error: 'tecnologo_id no existe' });
            row.tecnologo_id = tecnologo_id;
        }
        await row.save();
        res.json(row);
    } catch {
        res.status(500).json({ error: 'Error al actualizar muestra' });
    }
}
async function remove(req, res) {
    try {
        const id = idParam(req);
        if (!id) return res.status(400).json({ error: 'id inválido' });
        const row = await models.Muestra.findByPk(id);
        if (!row) return res.status(404).json({ error: 'No encontrado' });
        await row.destroy();
        res.status(204).send();
    } catch {
        res.status(500).json({ error: 'Error al eliminar muestra' });
    }
}

module.exports = { list, getOne, create, update, remove };
