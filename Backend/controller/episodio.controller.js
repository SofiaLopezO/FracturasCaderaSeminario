// controller/episodio.controller.js
const models = require('../model/initModels');
const { idParam } = require('./_crud');
const { logRegistro } = require('./registro.controller');
const moment = require('moment-timezone');

function parseDate(input) {
    if (!input) return null;
    const t = Date.parse(input);
    return Number.isNaN(t) ? null : new Date(t);
}

function normalizeComorbilidades(raw) {
    if (raw === undefined || raw === null) return null;
    let list = raw;
    if (typeof raw === 'string') {
        const trimmed = raw.trim();
        if (!trimmed) return [];
        try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
                list = parsed;
            } else {
                list = [String(parsed)];
            }
        } catch {
            list = trimmed.split(',');
        }
    }
    if (!Array.isArray(list)) return null;
    const cleaned = list
        .map((item) => {
            if (item === undefined || item === null) return null;
            const value =
                typeof item === 'string' ? item.trim() : String(item).trim();
            return value || null;
        })
        .filter(Boolean);
    return cleaned.length ? cleaned : [];
}

function normalizeJsonInput(raw) {
    if (raw === undefined) return undefined;
    if (raw === null) return null;
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

const toBoolOrNull = (value) => {
    if (value === undefined) return undefined;
    if (value === null) return null;
    return !!value;
};

function buildControlInicialPayload({
    comorbilidades,
    tabaco,
    alcohol,
    corticoides_cronicos,
    taco,
    prequirurgicas,
    postquirurgicas,
    notas_clinicas,
    comentario_evolucion,
    complicaciones,
    transfusion,
    reingreso,
    fecha_hora_control,
}) {
    const payload = {};
    if (comorbilidades !== undefined) payload.comorbilidades = comorbilidades;
    const tabacoValue = toBoolOrNull(tabaco);
    if (tabacoValue !== undefined) payload.tabaco = tabacoValue;
    const alcoholValue = toBoolOrNull(alcohol);
    if (alcoholValue !== undefined) payload.alcohol = alcoholValue;
    const corticoidesValue = toBoolOrNull(corticoides_cronicos);
    if (corticoidesValue !== undefined)
        payload.corticoides_cronicos = corticoidesValue;
    const tacoValue = toBoolOrNull(taco);
    if (tacoValue !== undefined) payload.taco = tacoValue;
    if (prequirurgicas !== undefined)
        payload.prequirurgicas = prequirurgicas ?? null;
    if (postquirurgicas !== undefined)
        payload.postquirurgicas = postquirurgicas ?? null;
    if (notas_clinicas !== undefined)
        payload.notas_clinicas = notas_clinicas ?? null;
    if (comentario_evolucion !== undefined)
        payload.notas_evolucion = comentario_evolucion ?? null;
    const complicacionesValue = normalizeJsonInput(complicaciones);
    if (complicacionesValue !== undefined)
        payload.complicaciones = complicacionesValue;
    const transfusionValue = toBoolOrNull(transfusion);
    if (transfusionValue !== undefined) payload.transfusion = transfusionValue;
    const reingresoValue = toBoolOrNull(reingreso);
    if (reingresoValue !== undefined) payload.reingreso = reingresoValue;
    if (fecha_hora_control !== undefined)
        payload.fecha_hora_control = fecha_hora_control;
    return payload;
}

function stripUndefined(obj) {
    return Object.entries(obj || {}).reduce((acc, [key, value]) => {
        if (value !== undefined) acc[key] = value;
        return acc;
    }, {});
}

async function list(req, res) {
    try {
        const rows = await models.Episodio.findAll({
            order: [['episodio_id', 'DESC']],
        });
        res.json(rows);
    } catch (e) {
        console.error('list episodios error', e);
        res.status(500).json({ error: 'Error al listar episodios' });
    }
}

async function getOne(req, res) {
    try {
        const id = idParam(req);
        if (!id) return res.status(400).json({ error: 'id inválido' });
        const paciente = await models.Paciente.findByPk(id);
        if (!paciente)
            return res.status(404).json({ error: 'Paciente no encontrado' });

        const episodios = await models.Episodio.findAll({
            where: { paciente_id: id },
            order: [
                ['fecha_diagnostico', 'DESC'],
                ['episodio_id', 'DESC'],
            ],
        });

        res.json(episodios);
    } catch (e) {
        console.error('getOne episodio error', e);
        res.status(500).json({ error: 'Error al obtener episodio' });
    }
}

async function create(req, res) {
    try {
        const {
            paciente_id,
            cie10,
            lado,
            procedencia,
            fecha_diagnostico,
            tabaco,
            alcohol,
            corticoides_cronicos,
            taco,
            fallecimiento,
            fecha_fallecimiento,
            notas_clinicas,
            comorbilidades,
            transfusion,
            reingreso,
            comentario_evolucion,
            prequirurgicas,
            postquirurgicas,
            complicaciones,
        } = req.body || {};

        const normalizedComorbilidades = comorbilidades
            ? normalizeComorbilidades(comorbilidades)
            : null;

        if (!paciente_id || !cie10 || !fecha_diagnostico)
            return res.status(400).json({
                error: 'paciente_id, cie10, fecha_diagnostico son obligatorios',
            });

        const pac = await models.Paciente.findByPk(paciente_id);
        if (!pac)
            return res.status(400).json({ error: 'paciente_id no existe' });

        let procedenciaB = procedencia;
        if (
            typeof procedencia === 'string' &&
            (procedencia === 'Urgencia' || procedencia === 'Otro centro')
        ) {
            procedenciaB = procedencia.toUpperCase();
            procedenciaB = procedenciaB.replace(' ', '_');
        }

        const nowInChile = moment.tz('America/Santiago');
        const fechaMoment = moment.tz(fecha_diagnostico, 'America/Santiago');
        const fechaDiagnosticoDate = fechaMoment.isValid()
            ? fechaMoment
                  .set({
                      hour: nowInChile.hour(),
                      minute: nowInChile.minute(),
                      second: nowInChile.second(),
                      millisecond: 0,
                  })
                  .toDate()
            : new Date();
        const cie10Ultimo = (() => {
            if (!cie10) return '';
            if (Array.isArray(cie10))
                return String(cie10[cie10.length - 1] || '');
            return (
                String(cie10)
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .pop() || ''
            );
        })();

        const tipoFracturaMap = {
            'S72.0': 'INTRACAPSULAR',
            'S72.1': 'PERTROCANTERICA',
            'S72.2': 'SUBTROCANTERICA',
        };

        let tipo_fractura = null;
        if (
            cie10Ultimo !== undefined &&
            cie10Ultimo !== null &&
            String(cie10Ultimo).trim() !== ''
        ) {
            const key = String(cie10Ultimo).trim();
            if (tipoFracturaMap[key]) {
                tipo_fractura = tipoFracturaMap[key];
            }
        }
        const created = await models.Episodio.create({
            paciente_id,
            cie10,
            tipo_fractura,
            lado: lado,
            procedencia: procedenciaB,
            fecha_diagnostico: fechaDiagnosticoDate,
            notas_clinicas: notas_clinicas ?? null,
            tabaco: !!tabaco ? true : null,
            alcohol: !!alcohol ? true : null,
            corticoides_cronicos: !!corticoides_cronicos ? true : null,
            taco: !!taco ? true : null,
            fallecimiento: !!fallecimiento ? true : null,
            fecha_fallecimiento: fecha_fallecimiento
                ? parseDate(fecha_fallecimiento)
                : null,
            comorbilidades: normalizedComorbilidades,
            transfusion: transfusion ? transfusion : null,
            reingreso: reingreso ? reingreso : null,
            comentario_evolucion: comentario_evolucion
                ? comentario_evolucion
                : null,
            prequirurgicas: prequirurgicas ? prequirurgicas : null,
            postquirurgicas: postquirurgicas ? postquirurgicas : null,
        });

        await logRegistro(
            req,
            `CREAR_EPISODIO: episodio_id=${created.episodio_id}, paciente_id=${paciente_id}`,
            paciente_id
        );

        res.status(201).json(created);
    } catch (e) {
        console.error('create episodio error', e);
        res.status(500).json({ error: 'Error al crear episodio' });
    }
}

async function update(req, res) {
    try {
        const id = idParam(req);
        if (!id) return res.status(400).json({ error: 'id inválido' });
        const row = await models.Episodio.findByPk(id);
        if (!row) return res.status(404).json({ error: 'No encontrado' });

        const body = req.body || {};

        const assign = (k, v) => {
            if (v !== undefined) row[k] = v;
        };
        const normalizedComorbilidadesUpdate =
            body.comorbilidades !== undefined
                ? normalizeComorbilidades(body.comorbilidades)
                : undefined;

        if (body.paciente_id !== undefined) {
            const pac = await models.Paciente.findByPk(body.paciente_id);
            if (!pac)
                return res.status(400).json({ error: 'paciente_id no existe' });
            row.paciente_id = body.paciente_id;
        }
        assign('cie10', body.cie10);
        assign('tipo_fractura', body.tipo_fractura);
        assign('lado', body.lado ?? null);
        assign('procedencia', body.procedencia ?? null);
        let parsedFechaDiagnostico;
        if (body.fecha_diagnostico !== undefined) {
            const nowInChile = moment.tz('America/Santiago');
            const fechaMoment = moment.tz(
                body.fecha_diagnostico,
                'America/Santiago'
            );
            const d = fechaMoment.isValid()
                ? fechaMoment
                      .set({
                          hour: nowInChile.hour(),
                          minute: nowInChile.minute(),
                          second: nowInChile.second(),
                          millisecond: 0,
                      })
                      .toDate()
                : null;
            if (!d)
                return res
                    .status(400)
                    .json({ error: 'fecha_diagnostico inválida' });
            row.fecha_diagnostico = d;
            parsedFechaDiagnostico = d;
        }
        if (body.fecha_ingreso_quirurgico !== undefined)
            row.fecha_ingreso_quirurgico = body.fecha_ingreso_quirurgico
                ? parseDate(body.fecha_ingreso_quirurgico)
                : null;
        if (body.fecha_alta !== undefined)
            row.fecha_alta = body.fecha_alta
                ? parseDate(body.fecha_alta)
                : null;
        if (body.fecha_fallecimiento !== undefined)
            row.fecha_fallecimiento = body.fecha_fallecimiento
                ? parseDate(body.fecha_fallecimiento)
                : null;
        if (body.no_operado !== undefined) row.no_operado = !!body.no_operado;
        assign('causa_no_operar', body.causa_no_operar ?? null);
        assign('abo', body.abo ?? null);
        assign('rh', body.rh ?? null);
        if (body.tabaco !== undefined) row.tabaco = !!body.tabaco;
        if (body.alcohol !== undefined) row.alcohol = !!body.alcohol;
        if (body.corticoides_cronicos !== undefined)
            row.corticoides_cronicos = !!body.corticoides_cronicos;
        if (body.taco !== undefined) row.taco = !!body.taco;
        if (body.fallecimiento !== undefined)
            row.fallecimiento = !!body.fallecimiento;
        assign('notas_clinicas', body.notas_clinicas ?? null);

        assign('transfusion', body.transfusion ?? null);
        assign('reingreso', body.reingreso ?? null);
        assign('comentario_evolucion', body.comentario_evolucion ?? null);
        if (normalizedComorbilidadesUpdate !== undefined) {
            row.comorbilidades = normalizedComorbilidadesUpdate;
        }
        assign('prequirurgicas', body.prequirurgicas ?? null);
        assign('postquirurgicas', body.postquirurgicas ?? null);

        await row.save();

        const controlPayload = buildControlInicialPayload({
            comorbilidades: normalizedComorbilidadesUpdate,
            tabaco: body.tabaco,
            alcohol: body.alcohol,
            corticoides_cronicos: body.corticoides_cronicos,
            taco: body.taco,
            prequirurgicas: body.prequirurgicas,
            postquirurgicas: body.postquirurgicas,
            notas_clinicas: body.notas_clinicas,
            comentario_evolucion: body.comentario_evolucion,
            complicaciones: body.complicaciones,
            transfusion: body.transfusion,
            reingreso: body.reingreso,
            fecha_hora_control: parsedFechaDiagnostico,
        });
        await ensureControlInicial(row, controlPayload);

        await logRegistro(
            req,
            `ACTUALIZAR_EPISODIO: episodio_id=${id}, paciente_id=${row.paciente_id}`,
            row.paciente_id
        );

        res.json({ msg: 'ok' });
    } catch (e) {
        console.error('update episodio error', e);
        res.status(500).json({ error: 'Error al actualizar episodio' });
    }
}

async function remove(req, res) {
    try {
        const id = idParam(req);
        if (!id) return res.status(400).json({ error: 'id inválido' });
        const row = await models.Episodio.findByPk(id);
        if (!row) return res.status(404).json({ error: 'No encontrado' });

        const paciente_id = row.paciente_id;

        await row.destroy();

        await logRegistro(
            req,
            `ELIMINAR_EPISODIO: episodio_id=${id}, paciente_id=${paciente_id}`,
            paciente_id
        );

        res.status(204).send();
    } catch (e) {
        console.error('remove episodio error', e);
        res.status(500).json({ error: 'Error al eliminar episodio' });
    }
}

module.exports = { list, getOne, create, update, remove };
