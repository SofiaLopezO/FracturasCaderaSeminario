// controller/control_clinico.controller.js
const models = require('../model/initModels');
const { idParam } = require('./_crud');
const riesgoService = require('../services/riesgoRefracturaService');

function parseDate(input) {
    if (!input) return null;
    const t = Date.parse(input);
    return Number.isNaN(t) ? null : new Date(t);
}

function normalizeStringArray(raw) {
    if (raw === undefined || raw === null) return null;
    if (Array.isArray(raw)) {
        const cleaned = raw
            .map((item) => {
                if (item === undefined || item === null) return null;
                const value =
                    typeof item === 'string'
                        ? item.trim()
                        : String(item).trim();
                return value || null;
            })
            .filter(Boolean);
        return cleaned.length ? cleaned : [];
    }
    if (typeof raw === 'string') {
        const trimmed = raw.trim();
        if (!trimmed) return [];
        try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) return normalizeStringArray(parsed);
            if (parsed && typeof parsed === 'object') {
                return Object.entries(parsed)
                    .filter(([, val]) => Boolean(val))
                    .map(([key]) => String(key).trim())
                    .filter(Boolean);
            }
            return [String(parsed).trim()].filter(Boolean);
        } catch {
            return trimmed
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean);
        }
    }
    if (typeof raw === 'object') {
        return Object.entries(raw)
            .filter(([, val]) => Boolean(val))
            .map(([key]) => String(key).trim())
            .filter(Boolean);
    }
    const asString = String(raw).trim();
    return asString ? [asString] : [];
}

function normalizeJsonValue(raw) {
    if (raw === undefined || raw === null) return null;
    if (typeof raw === 'string') {
        const trimmed = raw.trim();
        if (!trimmed) return null;
        try {
            return JSON.parse(trimmed);
        } catch {
            return trimmed;
        }
    }
    return raw;
}

async function list(req, res) {
    try {
        const rows = await models.ControlClinico.findAll({
            order: [['control_id', 'DESC']],
        });
        res.json(rows);
    } catch (e) {
        console.error('list control_clinico error', e);
        res.status(500).json({ error: 'Error al listar controles clínicos' });
    }
}

async function getOne(req, res) {
    try {
        const id = idParam(req);
        if (!id) return res.status(400).json({ error: 'id inválido' });
        const row = await models.ControlClinico.findByPk(id);
        if (!row) return res.status(404).json({ error: 'No encontrado' });
        res.json(row);
    } catch (e) {
        console.error('getOne control_clinico error', e);
        res.status(500).json({ error: 'Error al obtener control clínico' });
    }
}

async function create(req, res) {
    try {
        const { episodio_id, tipo_control, cambios, profesional_id } =
            req.body || {};
        const {
            resumen,
            fecha_hora_control,
            comorbilidades,
            habitos,
            prequirurgicas,
            postquirurgicas,
            notas_evolucion,
            complicaciones,
            transfusion,
            reingreso,
            peso,
            altura,
        } = cambios;
        const { tabaco, alcohol, corticoides_cronicos, taco, otro } =
            habitos || {};
        if (!episodio_id)
            return res
                .status(400)
                .json({ error: 'episodio_id es obligatorio' });
        const epi = await models.Episodio.findByPk(episodio_id);
        if (!epi)
            return res.status(400).json({ error: 'episodio_id no existe' });

        // Verificar si ya existen controles para este episodio
        const antro = await models.Antropometria.findOne({
            where: { episodio_id },
        });
        if (antro) {
            if (
                peso !== undefined &&
                peso !== null &&
                !Number.isNaN(Number(peso))
            )
                antro.peso_kg = Number(peso);
            if (
                altura !== undefined &&
                altura !== null &&
                !Number.isNaN(Number(altura))
            )
                antro.altura_m = Number(altura);

            await antro.save();
        } else if (
            (peso !== undefined &&
                peso !== null &&
                !Number.isNaN(Number(peso))) ||
            (altura !== undefined &&
                altura !== null &&
                !Number.isNaN(Number(altura)))
        ) {
            await models.Antropometria.create({
                episodio_id,
                peso_kg: Number(peso),
                altura_m: Number(altura),
            });
        }

        const existeControl = await models.ControlClinico.findOne({
            where: { episodio_id },
        });
        if (!existeControl && tipo_control === 'Inicial') {
            // Opción B: en lugar de crear un ControlClinico, volcar campos iniciales al Episodio
            // Campos que actualizamos (si vienen en el body): hábitos/comorbilidades y notas iniciales
            if (comorbilidades !== undefined)
                epi.comorbilidades = normalizeStringArray(comorbilidades);
            if (tabaco !== undefined)
                epi.tabaco = tabaco === null ? null : !!tabaco;
            if (alcohol !== undefined)
                epi.alcohol = alcohol === null ? null : !!alcohol;
            if (corticoides_cronicos !== undefined)
                epi.corticoides_cronicos =
                    corticoides_cronicos === null
                        ? null
                        : !!corticoides_cronicos;
            if (taco !== undefined) epi.taco = taco === null ? null : !!taco;
            if (prequirurgicas !== undefined)
                epi.prequirurgicas = prequirurgicas ?? null;
            if (postquirurgicas !== undefined)
                epi.postquirurgicas = postquirurgicas ?? null;

            if (transfusion !== undefined)
                epi.transfusion = transfusion === null ? null : !!transfusion;
            if (reingreso !== undefined)
                epi.reingreso = reingreso === null ? null : !!reingreso;
            if (notas_evolucion !== undefined)
                epi.comentario_evolucion = notas_evolucion ?? null;
            epi.inicial = 1; // marcamos que ya se cargó el control inicial
            await epi.save();

            // Recalcular indicadores para el episodio cuando se guardan los datos iniciales sin crear ControlClinico
            try {
                await riesgoService.recalcularIndicadores(episodio_id);
            } catch (riskError) {
                console.error(
                    'recalculo riesgo post-episodio update (Opción B)',
                    riskError
                );
            }

            return res.status(200).json(epi);
        }

        // Resolver profesional: el frontend puede enviar either
        // - profesional_id = professional_profiles.id  (preferred)
        // - profesional_id = users.id (user id)
        const providedProf = profesional_id;
        let pro = null;
        if (providedProf !== undefined && providedProf !== null) {
            // Intentar por PK en professional_profiles
            pro = await models.ProfessionalProfile.findByPk(providedProf);
            if (!pro) {
                // Intentar por user_id (caso en que frontend envía user.id)
                pro = await models.ProfessionalProfile.findOne({
                    where: { user_id: providedProf },
                });
            }
        }

        // Determinar profesional_id que se usará como FK (professional_profiles.id)
        const profesional_fk_id = pro ? pro.id : null;

        // Determinar nombre del profesional para registro (si existe user relacionado)
        let nombre = null;
        if (pro) {
            const user = await models.User.findByPk(pro.user_id);
            if (user) {
                nombre = `${user.nombres} ${user.apellido_paterno} ${user.apellido_materno}`;
            }
        } else if (providedProf) {
            // intentar obtener nombre si lo que vino fue user id
            const userCandidate = await models.User.findByPk(
                providedProf
            ).catch(() => null);
            if (userCandidate) {
                nombre = `${userCandidate.nombres} ${userCandidate.apellido_paterno} ${userCandidate.apellido_materno}`;
            }
        }

        // Si existen controles, creamos el ControlClinico normalmente
        // helper para quitar tildes/diacríticos
        const removeTildes = (s) =>
            s === undefined || s === null
                ? s
                : String(s)
                      .normalize('NFD')
                      .replace(/[\u0300-\u036f]/g, '');

        // limpia recursivamente strings dentro de arrays/objetos
        const stripRecursively = (val) => {
            if (val === undefined || val === null) return val;
            if (typeof val === 'string') return removeTildes(val);
            if (Array.isArray(val)) return val.map(stripRecursively);
            if (typeof val === 'object') {
                const out = {};
                Object.entries(val).forEach(([k, v]) => {
                    out[k] = stripRecursively(v);
                });
                return out;
            }
            return val;
        };

        const normComor = normalizeStringArray(comorbilidades);
        const cleanComor =
            normComor === null ? null : normComor.map(removeTildes);
        const normComplic = normalizeJsonValue(complicaciones);
        const cleanComplic = stripRecursively(normComplic);

        const created = await models.ControlClinico.create({
            episodio_id,
            // usar la FK real a professional_profiles (si existe), sino null
            profesional_id: profesional_fk_id ?? null,
            profesional_nombre: stripRecursively(nombre) ?? null,
            tipo_control: tipo_control?.toUpperCase() ?? undefined,
            resumen: stripRecursively(resumen) ?? null,
            fecha_hora_control: fecha_hora_control
                ? parseDate(fecha_hora_control)
                : new Date(),
            comorbilidades: cleanComor,
            tabaco: tabaco === undefined ? null : !!tabaco,
            alcohol: alcohol === undefined ? null : !!alcohol,
            corticoides_cronicos:
                corticoides_cronicos === undefined
                    ? null
                    : !!corticoides_cronicos,
            taco: taco === undefined ? null : !!taco,
            prequirurgicas: stripRecursively(prequirurgicas) ?? null,
            postquirurgicas: stripRecursively(postquirurgicas) ?? null,
            notas_evolucion: stripRecursively(notas_evolucion) ?? null,
            complicaciones: cleanComplic,
            transfusion: transfusion === undefined ? null : !!transfusion,
            reingreso: reingreso === undefined ? null : !!reingreso,
            comentario_otro: stripRecursively(otro) ?? null,
        });
        if (tipo_control?.toUpperCase() === 'ALTA') {
            epi.inicial = 2; // marcamos que el episodio ya no está activo
            await epi.save();
        }
        try {
            await riesgoService.recalcularIndicadoresControl(
                created.control_id
            );
        } catch (riskError) {
            console.error('recalculo riesgo post-control create', riskError);
        }
        res.status(201).json(created);
    } catch (e) {
        console.error('create control_clinico error', e);
        res.status(500).json({ error: 'Error al crear control clínico' });
    }
}

async function update(req, res) {
    try {
        const id = idParam(req);
        if (!id) return res.status(400).json({ error: 'id inválido' });
        const row = await models.ControlClinico.findByPk(id);
        if (!row) return res.status(404).json({ error: 'No encontrado' });

        const body = req.body || {};
        if (body.episodio_id !== undefined) {
            const epi = await models.Episodio.findByPk(body.episodio_id);
            if (!epi)
                return res.status(400).json({ error: 'episodio_id no existe' });
            row.episodio_id = body.episodio_id;
        }
        if (body.profesional_id !== undefined)
            row.profesional_id = body.profesional_id ?? null;
        // Resolver profesional para update: soportar tanto professional_profiles.id como user.id
        if (body.profesional_id !== undefined) {
            let proUp = await models.ProfessionalProfile.findByPk(
                body.profesional_id
            );
            if (!proUp) {
                proUp = await models.ProfessionalProfile.findOne({
                    where: { user_id: body.profesional_id },
                });
            }
            if (proUp) {
                const user = await models.User.findByPk(proUp.user_id).catch(
                    () => null
                );
                const nombreUp = user
                    ? `${user.nombres} ${user.apellido_paterno} ${user.apellido_materno}`
                    : null;
                if (nombreUp) row.profesional_nombre = nombreUp;
                // Asignar FK real
                row.profesional_id = proUp.id ?? null;
            } else {
                // Si no se encontró profile, intentar usar body.profesional_id como user id para nombre
                const userCandidate = await models.User.findByPk(
                    body.profesional_id
                ).catch(() => null);
                if (userCandidate) {
                    row.profesional_nombre = `${userCandidate.nombres} ${userCandidate.apellido_paterno} ${userCandidate.apellido_materno}`;
                    // dejar profesional_id sin cambio (no asignar FK inválida)
                }
            }
        }

        if (body.origen !== undefined) row.origen = body.origen;
        if (body.tipo_control !== undefined)
            row.tipo_control = body.tipo_control;
        if (body.resumen !== undefined) row.resumen = body.resumen ?? null;
        if (body.fecha_hora_control !== undefined)
            row.fecha_hora_control = body.fecha_hora_control
                ? parseDate(body.fecha_hora_control)
                : new Date();
        if (body.comorbilidades !== undefined)
            row.comorbilidades = normalizeStringArray(body.comorbilidades);
        if (body.tabaco !== undefined)
            row.tabaco = body.tabaco === null ? null : !!body.tabaco;
        if (body.alcohol !== undefined)
            row.alcohol = body.alcohol === null ? null : !!body.alcohol;
        if (body.corticoides_cronicos !== undefined)
            row.corticoides_cronicos =
                body.corticoides_cronicos === null
                    ? null
                    : !!body.corticoides_cronicos;
        if (body.taco !== undefined)
            row.taco = body.taco === null ? null : !!body.taco;
        if (body.prequirurgicas !== undefined)
            row.prequirurgicas = body.prequirurgicas ?? null;
        if (body.postquirurgicas !== undefined)
            row.postquirurgicas = body.postquirurgicas ?? null;
        if (body.notas_clinicas !== undefined)
            row.notas_clinicas = body.notas_clinicas ?? null;
        if (body.notas_evolucion !== undefined)
            row.notas_evolucion = body.notas_evolucion ?? null;
        if (body.complicaciones !== undefined)
            row.complicaciones = normalizeJsonValue(body.complicaciones);
        if (body.transfusion !== undefined)
            row.transfusion =
                body.transfusion === null ? null : !!body.transfusion;
        if (body.reingreso !== undefined)
            row.reingreso = body.reingreso === null ? null : !!body.reingreso;
        if (body.otro !== undefined) row.comentario_otro = body.otro ?? null;

        await row.save();
        try {
            await riesgoService.recalcularIndicadoresControl(row.control_id);
        } catch (riskError) {
            console.error('recalculo riesgo post-control update', riskError);
        }
        res.json(row);
    } catch (e) {
        console.error('update control_clinico error', e);
        res.status(500).json({ error: 'Error al actualizar control clínico' });
    }
}

async function remove(req, res) {
    try {
        const id = idParam(req);
        if (!id) return res.status(400).json({ error: 'id inválido' });
        const row = await models.ControlClinico.findByPk(id);
        if (!row) return res.status(404).json({ error: 'No encontrado' });
        await row.destroy();
        res.status(204).send();
    } catch (e) {
        console.error('remove control_clinico error', e);
        res.status(500).json({ error: 'Error al eliminar control clínico' });
    }
}

module.exports = { list, getOne, create, update, remove };
