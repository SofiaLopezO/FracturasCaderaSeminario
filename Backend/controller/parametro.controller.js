// controller/parametro.controller.js (Parametrización de laboratorio)
const models = require('../model/initModels');

function codeParam(req) {
    const c = (req.params?.codigo ?? req.params?.id ?? '').toString().trim();
    return c.length ? c : null;
}

async function list(req, res) {
    try {
        const rows = await models.ParametroLab.findAll({
            order: [['codigo', 'ASC']],
            include: [
                {
                    model: models.TipoExamen,
                    as: 'tipoExamen',
                    attributes: ['id', 'nombre'],
                },
                {
                    model: models.TipoMuestra,
                    as: 'tipoMuestra',
                    attributes: ['id', 'nombre'],
                },
            ],
        });
        res.json(rows);
    } catch (e) {
        console.error('list parametro error', e);
        res.status(500).json({ error: 'Error al listar parámetros' });
    }
}

async function getOne(req, res) {
    try {
        const codigo = codeParam(req);
        if (!codigo) return res.status(400).json({ error: 'codigo inválido' });
        const row = await models.ParametroLab.findByPk(codigo, {
            include: [
                {
                    model: models.TipoExamen,
                    as: 'tipoExamen',
                    attributes: ['id', 'nombre'],
                },
                {
                    model: models.TipoMuestra,
                    as: 'tipoMuestra',
                    attributes: ['id', 'nombre'],
                },
            ],
        });
        if (!row) return res.status(404).json({ error: 'No encontrado' });
        res.json(row);
    } catch (e) {
        console.error('getOne parametro error', e);
        res.status(500).json({ error: 'Error al obtener parámetro' });
    }
}

async function create(req, res) {
    try {
        const {
            codigo,
            nombre,
            unidad,
            ref_min,
            ref_max,
            notas,
            tipo_examen_id,
            tipo_muestra_id,
        } = req.body || {};
        if (!codigo || !nombre)
            return res
                .status(400)
                .json({ error: 'codigo y nombre son obligatorios' });
        const exists = await models.ParametroLab.findByPk(String(codigo));
        if (exists) return res.status(409).json({ error: 'codigo ya existe' });
        const created = await models.ParametroLab.create({
            codigo: String(codigo),
            nombre: String(nombre),
            unidad: unidad ?? null,
            ref_min: ref_min ?? null,
            ref_max: ref_max ?? null,
            notas: notas ?? null,
            tipo_examen_id: tipo_examen_id ?? null,
            tipo_muestra_id: tipo_muestra_id ?? null,
        });
        res.status(201).json(created);
    } catch (e) {
        console.error('create parametro error', e);
        res.status(500).json({ error: 'Error al crear parámetro' });
    }
}

async function update(req, res) {
    try {
        const codigo = codeParam(req);
        if (!codigo) return res.status(400).json({ error: 'codigo inválido' });
        const row = await models.ParametroLab.findByPk(codigo);
        if (!row) return res.status(404).json({ error: 'No encontrado' });
        const {
            nombre,
            unidad,
            ref_min,
            ref_max,
            notas,
            tipo_examen_id,
            tipo_muestra_id,
        } = req.body || {};
        if (nombre !== undefined) row.nombre = nombre;
        if (unidad !== undefined) row.unidad = unidad ?? null;
        if (ref_min !== undefined) row.ref_min = ref_min ?? null;
        if (ref_max !== undefined) row.ref_max = ref_max ?? null;
        if (notas !== undefined) row.notas = notas ?? null;
        if (tipo_examen_id !== undefined)
            row.tipo_examen_id = tipo_examen_id ?? null;
        if (tipo_muestra_id !== undefined)
            row.tipo_muestra_id = tipo_muestra_id ?? null;
        await row.save();
        res.json(row);
    } catch (e) {
        console.error('update parametro error', e);
        res.status(500).json({ error: 'Error al actualizar parámetro' });
    }
}

async function remove(req, res) {
    try {
        const codigo = codeParam(req);
        if (!codigo) return res.status(400).json({ error: 'codigo inválido' });
        const row = await models.ParametroLab.findByPk(codigo);
        if (!row) return res.status(404).json({ error: 'No encontrado' });
        await row.destroy();
        res.status(204).send();
    } catch (e) {
        console.error('remove parametro error', e);
        res.status(500).json({ error: 'Error al eliminar parámetro' });
    }
}

// GET /parametros/catalogo
// Estructura:
// {
//   examenes: [
//     {
//       tipo_examen: string,
//       muestras: [
//         {
//           tipo_muestra: string,
//           parametros: [ParametroLab]
//         }
//       ]
//     }
//   ]
// }
async function catalogo(req, res) {
    try {
        const rows = await models.ParametroLab.findAll({
            include: [
                {
                    model: models.TipoExamen,
                    as: 'tipoExamen',
                    attributes: ['id', 'nombre'],
                },
                {
                    model: models.TipoMuestra,
                    as: 'tipoMuestra',
                    attributes: ['id', 'nombre'],
                },
            ],
            order: [
                [
                    { model: models.TipoExamen, as: 'tipoExamen' },
                    'nombre',
                    'ASC',
                ],
                [
                    { model: models.TipoMuestra, as: 'tipoMuestra' },
                    'nombre',
                    'ASC',
                ],
                ['nombre', 'ASC'],
            ],
        });

        const examenesMap = new Map(); // key: tipoExamenNombre -> { tipo_examen, muestras: Map }

        for (const p of rows) {
            const te = p.tipoExamen?.nombre || 'Sin tipo';
            const tm = p.tipoMuestra?.nombre || 'Sin muestra';

            if (!examenesMap.has(te)) {
                examenesMap.set(te, { tipo_examen: te, muestras: new Map() });
            }
            const exam = examenesMap.get(te);

            if (!exam.muestras.has(tm)) {
                exam.muestras.set(tm, { tipo_muestra: tm, parametros: [] });
            }
            const muestra = exam.muestras.get(tm);

            // Formatear parámetro (evitar incluir asociaciones circulares)
            const { dataValues } = p;
            const { tipoExamen, tipoMuestra, ...plain } = dataValues;
            muestra.parametros.push(plain);
        }

        const examenes = Array.from(examenesMap.values()).map((exam) => ({
            tipo_examen: exam.tipo_examen,
            muestras: Array.from(exam.muestras.values()),
        }));

        res.json({ examenes });
    } catch (e) {
        console.error('catalogo parametros error', e);
        res.status(500).json({
            error: 'Error al construir catálogo de parámetros',
        });
    }
}

module.exports = { list, getOne, create, update, remove, catalogo };
