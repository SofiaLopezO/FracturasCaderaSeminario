// controller/paciente.controller.js
const models = require('../model/initModels');
const { logRegistro } = require('./registro.controller');
const { Op } = require('sequelize');

let __schemaFlags = {
    checked: false,
    alertaHasEpisodioId: false,
    alertaHasResultadoId: false,
    resultadoHasEpisodioId: false,
    alertaColumns: [],
};
async function ensureSchemaFlags() {
    if (__schemaFlags.checked) return __schemaFlags;
    try {
        const qi = models.sequelize.getQueryInterface();
        try {
            const a = await qi.describeTable('alerta');
            const cols = a ? Object.keys(a) : [];
            __schemaFlags.alertaColumns = cols;
            __schemaFlags.alertaHasEpisodioId = cols.includes('episodio_id');
            __schemaFlags.alertaHasResultadoId = cols.includes('resultado_id');
        } catch {}
        try {
            const r = await qi.describeTable('resultado');
            __schemaFlags.resultadoHasEpisodioId = Boolean(r && r.episodio_id);
        } catch {}
    } catch {}
    __schemaFlags.checked = true;
    return __schemaFlags;
}

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
const normRut = (r) =>
    String(r || '')
        .replace(/\./g, '')
        .replace(/-/g, '')
        .toUpperCase();

function isMissingColumnError(err, column) {
    if (!err) return false;
    const original = err.original || err.parent || err;
    const code = original?.code || err?.code;
    if (code && String(code) !== '42703') return false;
    const message = String(
        original?.message || err.message || ''
    ).toLowerCase();
    return (
        message.includes('column') &&
        message.includes(String(column || '').toLowerCase())
    );
}

async function search(req, res) {
    try {
        const q = String(req.query.q || '').trim();
        const limit = Math.min(parseInt(req.query.limit || '6', 10), 50);
        if (!q) return res.json({ items: [] });

        const qRut = normRut(q);
        const userAlias = 'User';

        const rows = await models.Paciente.findAll({
            include: [
                {
                    model: models.User,
                    as: userAlias,
                    required: true,
                    attributes: [
                        'rut',
                        'nombres',
                        'apellido_paterno',
                        'apellido_materno',
                    ],
                    where: {
                        [Op.or]: [
                            { rut: { [Op.iLike]: `%${q}%` } }, 
                            { rut: { [Op.iLike]: `%${qRut}%` } },
                            { nombres: { [Op.iLike]: `%${q}%` } },
                            { apellido_paterno: { [Op.iLike]: `%${q}%` } },
                            { apellido_materno: { [Op.iLike]: `%${q}%` } },
                        ],
                    },
                },
            ],
            limit,
            order: [
                [
                    { model: models.User, as: userAlias },
                    'apellido_paterno',
                    'ASC',
                ],
                [
                    { model: models.User, as: userAlias },
                    'apellido_materno',
                    'ASC',
                ],
                [{ model: models.User, as: userAlias }, 'nombres', 'ASC'],
            ],
        });

        const items = rows.map((r) => {
            const u = r[userAlias];
            return {
                user_id: r.user_id,
                rut: u?.rut ?? '',
                nombres: u?.nombres ?? '',
                apellido_paterno: u?.apellido_paterno ?? '',
                apellido_materno: u?.apellido_materno ?? '',
            };
        });

        res.json({ items });
    } catch (err) {
        console.error('search pacientes error:', err);
        res.status(500).json({ error: 'Error al buscar pacientes' });
    }
}

async function list(req, res) {
    try {

        const getAll = req.query.all === 'true' || req.query.all === '1';
        const limit = getAll
            ? undefined
            : Math.min(Number(req.query.limit) || 20, 100);
        const offset = getAll ? undefined : Number(req.query.offset) || 0;
        const where = {};

        if (!isEmpty(req.query.tipo_sangre))
            where.tipo_sangre = String(req.query.tipo_sangre).trim();

        const queryOptions = {
            where,
            order: [['user_id', 'DESC']],
            include: [
                {
                    model: models.User,
                    as: 'User',
                    attributes: [
                        'rut',
                        'nombres',
                        'apellido_paterno',
                        'apellido_materno',
                    ],
                    required: false,
                },
            ],
        };

        if (!getAll) {
            queryOptions.limit = limit;
            queryOptions.offset = offset;
        }

        const rows = await models.Paciente.findAll(queryOptions);

        const items = rows.map((row) => {
            const data = row.toJSON();
            const user = data.User || {};
            delete data.User;

            return {
                rut: user.rut || null,
                nombres: user.nombres || null,
                Apellido_Paterno: user.apellido_paterno || null,
                Apellido_Materno: user.apellido_materno || null,
                ...data,
            };
        });

        res.json(items);
    } catch (err) {
        console.error('list pacientes error:', err);
        res.status(500).json({ error: 'Error al listar pacientes' });
    }
}

async function getOne(req, res) {
    try {
        const id = parseUserIdParam(req);
        if (!id) return res.status(400).json({ error: 'user_id inválido' });

        const row = await models.Paciente.findByPk(id);
        if (!row) return res.status(404).json({ error: 'No encontrado' });

        res.json(row);
    } catch (err) {
        console.error('getOne paciente error:', err);
        res.status(500).json({ error: 'Error al obtener paciente' });
    }
}

async function create(req, res) {
    try {
        const { user_id, tipo_sangre, altura, edad } = req.body || {};
        const id = Number(user_id);
        if (!Number.isInteger(id) || id <= 0) {
            return res
                .status(400)
                .json({ error: 'user_id obligatorio y debe ser entero > 0' });
        }

        const user = await models.User.findByPk(id);
        if (!user) return res.status(400).json({ error: 'User no existe' });

        const exists = await models.Paciente.findByPk(id);
        if (exists)
            return res
                .status(409)
                .json({ error: 'El usuario ya tiene perfil de Paciente' });

        const created = await models.Paciente.create({
            user_id: id,
            tipo_sangre: isEmpty(tipo_sangre)
                ? null
                : String(tipo_sangre).trim(),
            altura: isEmpty(altura) ? null : Number(altura),
            edad: isEmpty(edad) ? null : Number(edad),
        });

        await logRegistro(
            req,
            `CREAR_PACIENTE: user_id=${id}, rut=${user.rut}`,
            id // ID del paciente creado
        );

        res.status(201).json(created);
    } catch (err) {
        console.error('create paciente error:', err);
        res.status(500).json({ error: 'Error al crear paciente' });
    }
}

async function update(req, res) {
    try {
        const id = parseUserIdParam(req);
        if (!id) return res.status(400).json({ error: 'user_id inválido' });

        const row = await models.Paciente.findByPk(id);
        if (!row) return res.status(404).json({ error: 'No encontrado' });

        const { tipo_sangre, altura, edad } = req.body || {};

        if (tipo_sangre !== undefined)
            row.tipo_sangre = isEmpty(tipo_sangre)
                ? null
                : String(tipo_sangre).trim();
        if (altura !== undefined)
            row.altura = isEmpty(altura) ? null : Number(altura);
        if (edad !== undefined) row.edad = isEmpty(edad) ? null : Number(edad);

        await row.save();

        const user = await models.User.findByPk(id);
        await logRegistro(
            req,
            `ACTUALIZAR_PACIENTE: user_id=${id}, rut=${user?.rut}`,
            id 
        );

        res.json(row);
    } catch (err) {
        console.error('update paciente error:', err);
        res.status(500).json({ error: 'Error al actualizar paciente' });
    }
}

async function remove(req, res) {
    try {
        const id = parseUserIdParam(req);
        if (!id) return res.status(400).json({ error: 'user_id inválido' });

        const row = await models.Paciente.findByPk(id);
        if (!row) return res.status(404).json({ error: 'No encontrado' });

        const user = await models.User.findByPk(id);
        await row.destroy();

        await logRegistro(
            req,
            `ELIMINAR_PACIENTE: user_id=${id}, rut=${user?.rut}`,
            id
        );

        res.status(204).send();
    } catch (err) {
        console.error('remove paciente error:', err);
        res.status(500).json({ error: 'Error al eliminar paciente' });
    }
}

async function getDetalles(req, res) {
    try {
        const id = parseUserIdParam(req);
        if (!id) return res.status(400).json({ error: 'user_id inválido' });

        const roles = (req.user?.roles || []).map((r) =>
            String(r).toUpperCase()
        );
        const puedeVerMinutas = roles.some((r) =>
            ['FUNCIONARIO', 'INVESTIGADOR', 'ADMIN', 'ADMINISTRADOR'].includes(
                r
            )
        );
        const esProfesional = roles.some((r) =>
            ['FUNCIONARIO', 'INVESTIGADOR', 'TECNOLOGO'].includes(r)
        );

        const include = [
            {
                model: models.User,
                as: 'User',
                attributes: [
                    'rut',
                    'nombres',
                    'apellido_paterno',
                    'apellido_materno',
                    'correo',
                    'telefono',
                    'sexo',
                    'fecha_nacimiento',
                ],
                required: false,
            },
            {
                model: models.Examen,
                include: [
                    {
                        model: models.Muestra,
                        include: [
                            {
                                model: models.Resultado,
                                as: 'Resultados',
                                include: [
                                    {
                                        model: models.IndicadorRiesgo,
                                        include: [models.Alerta],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ];

        if (puedeVerMinutas) {
            include.push({
                model: models.Minuta,
            });
        }

        const row = await models.Paciente.findByPk(id, { include });
        if (!row) return res.status(404).json({ error: 'No encontrado' });

        if (!puedeVerMinutas && row?.dataValues?.Minuta) {
            delete row.dataValues.Minuta;
        }

        res.json(row);

        if (esProfesional && req.user?.rut) {
            try {
                const viewerUser = await models.User.findOne({
                    where: { rut: req.user.rut },
                });
                if (viewerUser) {
                    const prof = await models.ProfessionalProfile.findOne({
                        where: { user_id: viewerUser.id },
                    });
                    if (prof) {
                        const arr = Array.isArray(prof.historial_pacientes)
                            ? prof.historial_pacientes
                            : [];
                        arr.push({
                            idPaciente: id,
                            timestamp: new Date().toISOString(),
                        });
                        await prof.update({ historial_pacientes: arr });
                    }
                }
            } catch (e) {
                console.warn(
                    'No se pudo registrar historial de profesional:',
                    e?.message || e
                );
            }
        }
    } catch (err) {
        console.error('getDetalles paciente error:', err);
        res.status(500).json({
            error: 'Error al obtener detalles del paciente',
        });
    }
}

async function getResumen(req, res) {
    try {
        await ensureSchemaFlags();
        const id = parseUserIdParam(req);
        if (!id) return res.status(400).json({ error: 'user_id inválido' });

        const paciente = await models.Paciente.findByPk(id, {
            include: [
                {
                    model: models.User,
                    as: 'User',
                    attributes: [
                        'rut',
                        'nombres',
                        'apellido_paterno',
                        'apellido_materno',
                        'fecha_nacimiento',
                        'sexo',
                        'telefono',
                        'correo',
                    ],
                },
            ],
        });
        if (!paciente) return res.status(404).json({ error: 'No encontrado' });

        const user = paciente.User || {};

        const formatNombreProfesional = (u) => {
            if (!u) return '';
            return [u.nombres, u.apellido_paterno, u.apellido_materno]
                .filter(Boolean)
                .join(' ')
                .replace(/\s+/g, ' ')
                .trim();
        };
        const normalizeId = (value) => {
            if (value === null || value === undefined || value === '')
                return null;
            const n = Number(value);
            return Number.isNaN(n) ? null : n;
        };
        const formatComorbilidades = (raw) => {
            if (raw === undefined || raw === null) return null;
            if (Array.isArray(raw)) return raw;
            if (typeof raw === 'string') {
                const trimmed = raw.trim();
                if (!trimmed) return [];
                try {
                    const parsed = JSON.parse(trimmed);
                    if (Array.isArray(parsed)) return parsed;
                    if (parsed && typeof parsed === 'object') {
                        return Object.entries(parsed)
                            .filter(([, val]) => Boolean(val))
                            .map(([key]) => key);
                    }
                } catch {
                    return trimmed
                        .split(',')
                        .map((item) => item.trim())
                        .filter(Boolean);
                }
                return [trimmed];
            }
            if (typeof raw === 'object') {
                return Object.entries(raw)
                    .filter(([, val]) => Boolean(val))
                    .map(([key]) => key);
            }
            const asString = String(raw).trim();
            return asString ? [asString] : [];
        };

        const calcEdad = (fn) => {
            try {
                if (!fn)
                    return {
                        anios: paciente.edad_anios ?? null,
                        meses: paciente.edad_meses ?? null,
                    };
                const nacimiento = new Date(fn);
                if (isNaN(nacimiento.getTime()))
                    return {
                        anios: paciente.edad_anios ?? null,
                        meses: paciente.edad_meses ?? null,
                    };
                const hoy = new Date();
                let anios = hoy.getFullYear() - nacimiento.getFullYear();
                let meses = hoy.getMonth() - nacimiento.getMonth();
                if (hoy.getDate() < nacimiento.getDate()) meses -= 1;
                if (meses < 0) {
                    anios -= 1;
                    meses += 12;
                }
                return { anios, meses };
            } catch {
                return {
                    anios: paciente.edad_anios ?? null,
                    meses: paciente.edad_meses ?? null,
                };
            }
        };
        const edad = calcEdad(user.fecha_nacimiento);

        const episodios = await models.Episodio.findAll({
            where: { paciente_id: id },
            order: [
                ['episodio_id', 'DESC'],
                ['fecha_diagnostico', 'DESC'],
            ],
        });

        const episodioIds = episodios.map((e) => e.episodio_id);
        const episodioActual = episodios[0] || null;
        const controlesRaw = episodioIds.length
            ? await models.ControlClinico.findAll({
                  where: { episodio_id: { [Op.in]: episodioIds } },
                  order: [
                      ['episodio_id', 'DESC'],
                      ['fecha_hora_control', 'ASC'],
                      ['control_id', 'ASC'],
                  ],
                  include: [
                      {
                          model: models.ProfessionalProfile,
                          as: 'profesional',
                          attributes: [
                              'id',
                              'user_id',
                              'especialidad',
                              'cargo',
                          ],
                          include: [
                              {
                                  model: models.User,
                                  as: 'user',
                                  attributes: [
                                      'nombres',
                                      'apellido_paterno',
                                      'apellido_materno',
                                      'rut',
                                  ],
                              },
                          ],
                          required: false,
                      },
                  ],
              })
            : [];
        const controles = controlesRaw.map((c) => c.get({ plain: true }));

        const controlesPorEpisodio = new Map();
        for (const c of controles) {
            if (!controlesPorEpisodio.has(c.episodio_id))
                controlesPorEpisodio.set(c.episodio_id, []);
            controlesPorEpisodio.get(c.episodio_id).push(c);
        }
        const sortControles = (arr = []) =>
            [...arr].sort((a, b) => {
                const t1 = a?.fecha_hora_control
                    ? new Date(a.fecha_hora_control).getTime()
                    : NaN;
                const t2 = b?.fecha_hora_control
                    ? new Date(b.fecha_hora_control).getTime()
                    : NaN;
                if (Number.isFinite(t1) && Number.isFinite(t2) && t1 !== t2)
                    return t1 - t2;
                if (Number.isFinite(t1) && !Number.isFinite(t2)) return -1;
                if (!Number.isFinite(t1) && Number.isFinite(t2)) return 1;
                return (a?.control_id || 0) - (b?.control_id || 0);
            });

        const registroControles = [];
        for (const epi of episodios) {
            const epiIdNumber = Number(epi.episodio_id);
            const controlIdEpisodio =
                Number.isFinite(epiIdNumber) && epiIdNumber !== 0
                    ? Math.abs(epiIdNumber)
                    : 1000 + registroControles.length;
            const controlesEpisodio =
                controlesPorEpisodio.get(epi.episodio_id) || [];
            const lista = sortControles(controlesEpisodio);
            const controlInicial =
                lista.find((c) => c.tipo_control === 'INICIAL') ||
                lista[0] ||
                null;
            const habitosIniciales = {
                tabaco: controlInicial?.tabaco ?? epi.tabaco ?? null,
                alcohol: controlInicial?.alcohol ?? epi.alcohol ?? null,
                corticoides_cronicos:
                    controlInicial?.corticoides_cronicos ??
                    epi.corticoides_cronicos ??
                    null,
                taco: controlInicial?.taco ?? epi.taco ?? null,
            };
            const comorbilidadesIniciales = formatComorbilidades(
                controlInicial?.comorbilidades ?? epi.comorbilidades
            );

            const prof = controlInicial?.profesional || null;
            const profUser = prof?.user || null;
            const doctorEpisodio = profUser
                ? formatNombreProfesional(profUser)
                : controlInicial?.profesional_nombre || null;
            const profesionalIdEpisodio = normalizeId(
                controlInicial?.profesional_id ?? prof?.id
            );

            registroControles.push({
                control_id: controlIdEpisodio,
                episodio_id: epi.episodio_id,
                fecha_hora: epi.fecha_diagnostico,
                tipo_fractura: epi.cie10 + ' ' + epi.tipo_fractura,
                lado: epi.lado,
                profesional_id: profesionalIdEpisodio,
                doctor: doctorEpisodio,
                origen: epi.procedencia || null,
                resumen: controlInicial?.resumen ?? null,
                notas_clinicas:
                    controlInicial?.notas_clinicas ??
                    epi.notas_clinicas ??
                    null,
                notas_evolucion:
                    controlInicial?.notas_evolucion ??
                    epi.comentario_evolucion ??
                    null,
                prequirurgicas:
                    controlInicial?.prequirurgicas ??
                    epi.prequirurgicas ??
                    null,
                postquirurgicas:
                    controlInicial?.postquirurgicas ??
                    epi.postquirurgicas ??
                    null,
                comorbilidades: comorbilidadesIniciales,
                habitos: habitosIniciales,
                transfusion:
                    controlInicial?.transfusion ?? epi.transfusion ?? null,
                reingreso: controlInicial?.reingreso ?? epi.reingreso ?? null,
                complicaciones: controlInicial?.complicaciones ?? null,
                tipo_control: 'INICIAL',
                dias_desde_previo: null,
                es_episodio: false,
                sintetico: true,
            });
            let prev = null;
            for (const c of lista) {
                const prof = c.profesional || null;
                const profUser = prof?.user || null;
                const doctorPerfil = formatNombreProfesional(profUser);
                const doctor = doctorPerfil || c.profesional_nombre || null;
                const profesionalId = normalizeId(c.profesional_id ?? prof?.id);
                let diasDesdePrevio = null;
                if (prev) {
                    const d1 = new Date(prev.fecha_hora_control);
                    const d2 = new Date(c.fecha_hora_control);
                    diasDesdePrevio = Math.round(
                        (d2 - d1) / (1000 * 60 * 60 * 24)
                    );
                }
                registroControles.push({
                    control_id: c.control_id,
                    episodio_id: epi.episodio_id,
                    fecha_hora: c.fecha_hora_control,
                    profesional_id: profesionalId,
                    doctor: doctor || null,
                    origen: c.origen || epi.procedencia || null,
                    resumen: c.resumen ?? null,
                    notas_clinicas: c.notas_clinicas ?? null,
                    notas_evolucion: c.notas_evolucion ?? null,
                    prequirurgicas: c.prequirurgicas ?? null,
                    postquirurgicas: c.postquirurgicas ?? null,
                    comorbilidades: formatComorbilidades(c.comorbilidades),
                    habitos: {
                        tabaco: c.tabaco ?? null,
                        alcohol: c.alcohol ?? null,
                        corticoides_cronicos: c.corticoides_cronicos ?? null,
                        taco: c.taco ?? null,
                    },
                    transfusion: c.transfusion ?? null,
                    reingreso: c.reingreso ?? null,
                    complicaciones: c.complicaciones ?? null,
                    tipo_control: c.tipo_control || null,
                    dias_desde_previo: diasDesdePrevio,
                    es_episodio: false,
                });
                prev = c;
            }
        }

        const historialMedico = registroControles.map((rc) => ({
            control_id: rc.control_id,
            fecha: rc.fecha_hora,
            nombre_consulta: rc.es_episodio
                ? 'Episodio'
                : rc.origen || 'Control clínico',
            motivo_consulta: rc.resumen || null,
            doctor_asociado: rc.doctor || null,
            doctor_id: rc.profesional_id ?? null,
            es_episodio: Boolean(rc.es_episodio),
        }));

        const cirugias = episodioIds.length
            ? await models.Cirugia.findAll({
                  where: { episodio_id: { [Op.in]: episodioIds } },
                  order: [
                      ['episodio_id', 'DESC'],
                      ['fecha', 'ASC'],
                      ['cirugia_id', 'ASC'],
                  ],
              })
            : [];
        const suspensiones = episodioIds.length
            ? await models.Suspension.findAll({
                  where: { episodio_id: { [Op.in]: episodioIds } },
                  order: [
                      ['episodio_id', 'DESC'],
                      ['fecha_suspension', 'ASC'],
                      ['suspension_id', 'ASC'],
                  ],
              })
            : [];

        const cirugiasPorEpisodio = new Map();
        for (const c of cirugias) {
            if (!cirugiasPorEpisodio.has(c.episodio_id))
                cirugiasPorEpisodio.set(c.episodio_id, []);
            cirugiasPorEpisodio.get(c.episodio_id).push(c);
        }

        let tdc = null,
            tpo = null,
            tth = null;
        if (episodioActual) {
            const cirEpi = (
                cirugiasPorEpisodio.get(episodioActual.episodio_id) || []
            ).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
            const primeraCir = cirEpi[0] || null;
            const ultimaCir = cirEpi[cirEpi.length - 1] || null;
            const fDx = episodioActual.fecha_diagnostico
                ? new Date(episodioActual.fecha_diagnostico)
                : null;
            const fAlta = episodioActual.fecha_alta
                ? new Date(episodioActual.fecha_alta)
                : null;
            if (fDx && primeraCir) {
                tdc = Math.round(
                    (new Date(primeraCir.fecha) - fDx) / (1000 * 60 * 60 * 24)
                );
            }
            if (fAlta && ultimaCir) {
                tpo = Math.round(
                    (fAlta - new Date(ultimaCir.fecha)) / (1000 * 60 * 60 * 24)
                );
            }
            if (fDx && fAlta) {
                tth = Math.round((fAlta - fDx) / (1000 * 60 * 60 * 24));
            }
        }

        const antrop = episodioIds.length
            ? await models.Antropometria.findAll({
                  where: { episodio_id: { [Op.in]: episodioIds } },
                  order: [
                      ['episodio_id', 'DESC'],
                      ['antropometria_id', 'DESC'],
                  ],
              })
            : [];
        const antropPorEpi = new Map();
        for (const a of antrop)
            if (!antropPorEpi.has(a.episodio_id))
                antropPorEpi.set(a.episodio_id, a);
        const antropActual = episodioActual
            ? antropPorEpi.get(episodioActual.episodio_id) || null
            : null;

        const alertaCols = Array.isArray(__schemaFlags.alertaColumns)
            ? __schemaFlags.alertaColumns
            : [];
        const alertaOrder = [];
        if (alertaCols.includes('severidad'))
            alertaOrder.push(['severidad', 'DESC']);
        alertaOrder.push(['alerta_id', 'DESC']);
        const alertaAttributes = alertaCols.length
            ? alertaCols
            : ['alerta_id', 'tipo', 'mensaje', 'activa', 'resuelta_en'];

        let alertas = [];
        if (episodioIds.length && __schemaFlags.alertaHasEpisodioId) {
            alertas = await models.Alerta.findAll({
                where: { episodio_id: { [Op.in]: episodioIds } },
                attributes: alertaAttributes,
                order: alertaOrder,
            });
        } else if (__schemaFlags.alertaHasResultadoId) {
            let needResultadoFallback = true;
            if (episodioIds.length && __schemaFlags.resultadoHasEpisodioId) {
                try {
                    alertas = await models.Alerta.findAll({
                        include: [
                            {
                                model: models.Resultado,
                                required: true,
                                where: {
                                    episodio_id: { [Op.in]: episodioIds },
                                },
                                attributes: [],
                            },
                        ],
                        attributes: alertaAttributes,
                        order: alertaOrder,
                    });
                    needResultadoFallback = false;
                } catch (err) {
                    if (isMissingColumnError(err, 'episodio_id')) {
                        console.warn(
                            'Resultado.episodio_id ausente en join de alertas, usando join por Examen'
                        );
                        __schemaFlags.resultadoHasEpisodioId = false;
                    } else {
                        throw err;
                    }
                }
            }
            if (needResultadoFallback) {
                try {
                    alertas = await models.Alerta.findAll({
                        attributes: alertaAttributes,
                        order: alertaOrder,
                        include: [
                            {
                                model: models.Resultado,
                                required: true,
                                attributes: [],
                                include: [
                                    {
                                        model: models.Examen,
                                        required: true,
                                        where: { paciente_id: id },
                                        attributes: [],
                                    },
                                ],
                            },
                        ],
                    });
                } catch (err) {
                    if (isMissingColumnError(err, 'examen_id')) {
                        console.warn(
                            'Resultado.examen_id ausente, devolviendo últimas alertas sin filtro'
                        );
                        alertas = await models.Alerta.findAll({
                            attributes: alertaAttributes,
                            order: alertaOrder,
                            limit: 50,
                        });
                    } else {
                        throw err;
                    }
                }
            }
        } else {
            alertas = await models.Alerta.findAll({
                attributes: alertaAttributes,
                order: alertaOrder,
                limit: 50,
            });
        }

        const PARAM_MAP = {
            hemoglobina: ['HB', 'HEMOGLOBINA'],
            colesterol_total: ['COLESTEROL_TOTAL', 'COLESTEROL', 'CT'],
            glucosa: ['GLUCOSA', 'GLICEMIA', 'GLUC'],
            trigliceridos: ['TRIGLICERIDOS', 'TG'],
        };
        let analisisSangre = {
            hemoglobina: null,
            colesterol_total: null,
            glucosa: null,
            trigliceridos: null,
        };
        if (episodioIds.length) {
            const flatParams = [...new Set(Object.values(PARAM_MAP).flat())];
            let resul = [];
            let needFallback = !__schemaFlags.resultadoHasEpisodioId;
            if (!needFallback) {
                try {
                    resul = await models.Resultado.findAll({
                        where: {
                            episodio_id: { [Op.in]: episodioIds },
                            parametro: { [Op.in]: flatParams },
                        },
                        include: [{ model: models.ParametroLab }],
                        order: [
                            ['parametro', 'ASC'],
                            ['fecha_resultado', 'DESC'],
                            ['resultado_id', 'DESC'],
                        ],
                    });
                } catch (err) {
                    if (isMissingColumnError(err, 'episodio_id')) {
                        console.warn(
                            'Resultado.episodio_id ausente, usando fallback por Examen'
                        );
                        __schemaFlags.resultadoHasEpisodioId = false;
                        needFallback = true;
                    } else {
                        throw err;
                    }
                }
            }
            if (needFallback) {
                resul = await models.Resultado.findAll({
                    where: { parametro: { [Op.in]: flatParams } },
                    include: [
                        { model: models.ParametroLab },
                        {
                            model: models.Examen,
                            required: true,
                            where: { paciente_id: id },
                            attributes: [],
                        },
                    ],
                    order: [
                        ['parametro', 'ASC'],
                        ['fecha_resultado', 'DESC'],
                        ['resultado_id', 'DESC'],
                    ],
                });
            }
            const seen = new Set();
            for (const r of resul) {
                const key = Object.keys(PARAM_MAP).find((k) =>
                    PARAM_MAP[k].includes(r.parametro)
                );
                if (!key || seen.has(key)) continue;
                analisisSangre[key] = {
                    parametro: r.parametro,
                    nombre: r.ParametroLab?.nombre || r.parametro,
                    valor: r.valor,
                    unidad: r.unidad || r.ParametroLab?.unidad || null,
                    fecha: r.fecha_resultado,
                };
                seen.add(key);
            }
        }

        const examenes = await models.Examen.findAll({
            where: { paciente_id: id },
            order: [
                ['examen_id', 'DESC'],
                [{ model: models.Muestra }, 'fecha_recepcion', 'ASC'],
                [
                    { model: models.Muestra },
                    { model: models.Resultado, as: 'Resultados' },
                    'resultado_id',
                    'ASC',
                ],
            ],
            include: [
                {
                    model: models.Muestra,
                    include: [
                        {
                            model: models.Resultado,
                            as: 'Resultados',
                            include: [{ model: models.ParametroLab }],
                        },
                        {
                            model: models.ProfessionalProfile,
                            include: [
                                {
                                    model: models.User,
                                    as: 'user',
                                    attributes: [
                                        'nombres',
                                        'apellido_paterno',
                                        'apellido_materno',
                                        'rut',
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        });

        const nombreCompleto = [
            user.nombres,
            user.apellido_paterno,
            user.apellido_materno,
        ]
            .filter(Boolean)
            .join(' ');
        const tipoSangreEpi = episodioActual
            ? [episodioActual.abo, episodioActual.rh].filter(Boolean).join('')
            : null;
        const tipoSangre = tipoSangreEpi || paciente.tipo_sangre || null;
        const altura = antropActual?.altura_m ?? paciente.altura ?? null;
        const peso = antropActual?.peso_kg ?? null;

        const controlesEpisodioActual = episodioActual
            ? controlesPorEpisodio.get(episodioActual.episodio_id) || []
            : [];
        const controlesOrdenadosActual = sortControles(controlesEpisodioActual);
        const controlInicialActual = episodioActual
            ? controlesOrdenadosActual.find(
                  (c) => c.tipo_control === 'INICIAL'
              ) ||
              controlesOrdenadosActual[0] ||
              null
            : null;
        const ultimoControlActual = controlesOrdenadosActual.length
            ? controlesOrdenadosActual[controlesOrdenadosActual.length - 1]
            : null;

        const habitosDx = episodioActual
            ? {
                  tabaco:
                      controlInicialActual?.tabaco ??
                      episodioActual.tabaco ??
                      null,
                  alcohol:
                      controlInicialActual?.alcohol ??
                      episodioActual.alcohol ??
                      null,
                  corticoides_cronicos:
                      controlInicialActual?.corticoides_cronicos ??
                      episodioActual.corticoides_cronicos ??
                      null,
                  taco:
                      controlInicialActual?.taco ?? episodioActual.taco ?? null,
              }
            : null;
        const dxActual = episodioActual
            ? {
                  episodio_id: episodioActual.episodio_id,
                  cie10: episodioActual.cie10,
                  tipo_fractura: episodioActual.tipo_fractura,
                  lado: episodioActual.lado,
                  procedencia: episodioActual.procedencia,
                  fecha_diagnostico: episodioActual.fecha_diagnostico,
                  comorbilidades: formatComorbilidades(
                      controlInicialActual?.comorbilidades ??
                          episodioActual.comorbilidades
                  ),
                  notas_clinicas:
                      controlInicialActual?.notas_clinicas ??
                      episodioActual.notas_clinicas ??
                      null,
                  prequirurgicas:
                      controlInicialActual?.prequirurgicas ??
                      episodioActual.prequirurgicas ??
                      null,
                  postquirurgicas:
                      controlInicialActual?.postquirurgicas ??
                      episodioActual.postquirurgicas ??
                      null,
                  complicaciones: controlInicialActual?.complicaciones ?? null,
                  transfusion:
                      controlInicialActual?.transfusion ??
                      episodioActual.transfusion ??
                      null,
                  reingreso:
                      controlInicialActual?.reingreso ??
                      episodioActual.reingreso ??
                      null,
                  fallecimiento: episodioActual.fallecimiento,
                  comentario_evolucion:
                      controlInicialActual?.notas_evolucion ??
                      episodioActual.comentario_evolucion ??
                      null,
                  habitos: habitosDx,

                  es_episodio: episodioActual.inicial,
              }
            : {
                  episodio_id: null,
                  cie10: null,
                  tipo_fractura: null,
                  lado: null,
                  procedencia: null,
                  fecha_diagnostico: null,
                  comorbilidades: null,
                  notas_clinicas: null,
                  prequirurgicas: null,
                  postquirurgicas: null,
                  complicaciones: null,
                  transfusion: null,
                  reingreso: null,
                  fallecimiento: null,
                  comentario_evolucion: null,
                  habitos: null,
                  es_episodio: null,
              };

        let indicadoresUltimoControl = { suma: 0, indicadores: [] };
        try {
            let indicadoresRows = [];

            if (ultimoControlActual?.control_id) {
                indicadoresRows = await models.EpisodioIndicador.findAll({
                    where: { control_id: ultimoControlActual.control_id },
                    order: [
                        ['tipo', 'ASC'],
                        ['episodio_indicador_id', 'ASC'],
                    ],
                });
            }
            if (
                (!indicadoresRows || indicadoresRows.length === 0) &&
                episodioActual?.episodio_id
            ) {
                const ultimaFecha = await models.EpisodioIndicador.findOne({
                    where: { episodio_id: episodioActual.episodio_id },
                    attributes: ['calculado_en'],
                    order: [['calculado_en', 'DESC']],
                });
                if (ultimaFecha) {
                    const fecha =
                        ultimaFecha.calculado_en ||
                        ultimaFecha.dataValues?.calculado_en;
                    if (fecha) {
                        indicadoresRows =
                            await models.EpisodioIndicador.findAll({
                                where: {
                                    episodio_id: episodioActual.episodio_id,
                                },
                                order: [['episodio_indicador_id', 'ASC']],
                            });
                    }
                }
                if (!indicadoresRows || indicadoresRows.length === 0) {
                    const rows = await models.EpisodioIndicador.findAll({
                        where: { episodio_id: episodioActual.episodio_id },
                        order: [
                            ['calculado_en', 'DESC'],
                            ['episodio_indicador_id', 'DESC'],
                        ],
                        limit: 200,
                    });
                    const byTipo = new Map();
                    for (const r of rows) {
                        const plain = r.get ? r.get({ plain: true }) : r;
                        if (!byTipo.has(plain.tipo))
                            byTipo.set(plain.tipo, plain);
                    }
                    indicadoresRows = Array.from(byTipo.values());
                }
            }

            const indicadoresPlain = (indicadoresRows || []).map((r) =>
                r.get ? r.get({ plain: true }) : r
            );
            const disparados = indicadoresPlain.filter(
                (item) =>
                    Number(item.valor) > 0 ||
                    (item.tipo === 'RIESGO_REFRACTURA' &&
                        Number(item.valor) >= 0)
            );
            const indicadorResumen = indicadoresPlain.find(
                (i) => i.tipo === 'RIESGO_REFRACTURA'
            );
            const nivelResumen = indicadorResumen
                ? indicadorResumen.nivel ||
                  indicadorResumen.detalles?.nivel ||
                  null
                : null;
            const detallesIndicadores = disparados
                .filter((i) => i.tipo !== 'RIESGO_REFRACTURA') 
                .map((item) => {
                    const detalles =
                        item.detalles && typeof item.detalles === 'object'
                            ? item.detalles
                            : {};
                    const nombre =
                        detalles.criterio ||
                        detalles.mensaje ||
                        item.tipo ||
                        'INDICADOR';
                    return {
                        nombre,
                        valor: Number(item.valor) || 0,
                    };
                });

            const sumaIndicadores = detallesIndicadores.reduce(
                (acc, item) => acc + (Number(item.valor) || 0),
                0
            );

            indicadoresUltimoControl = {
                suma: sumaIndicadores,
                nivel: nivelResumen,
                indicadores: detallesIndicadores,
            };
        } catch (e) {
            console.warn(
                'Error obteniendo indicadores ultimo control/episodio:',
                e && e.message ? e.message : e
            );
            indicadoresUltimoControl = { suma: 0, indicadores: [] };
        }

        const quirofano = {
            suspensiones: suspensiones.map((s) => ({
                suspension_id: s.suspension_id,
                episodio_id: s.episodio_id,
                fecha: s.fecha_suspension,
                tipo: s.tipo,
                motivo: s.motivo,
            })),
            cirugias: (cirugias || []).map((c) => ({
                cirugia_id: c.cirugia_id,
                episodio_id: c.episodio_id,
                fecha: c.fecha,
                hora_inicio: c.hora_inicio ?? null,
                hora_fin: c.hora_fin ?? null,
                tecnica: c.tecnica ?? null,
                lado: c.lado ?? null,
                reoperacion: !!c.reoperacion,
                complicacion_intraop: c.complicacion_intraop ?? null,
                operador_id: c.operador_id ?? null,
            })),
        };

        const laboratorio = {
            resumen_examenes: {
                total_examenes: examenes.length,
                total_muestras: examenes.reduce(
                    (acc, ex) => acc + (ex.Muestras?.length || 0),
                    0
                ),
                total_resultados: examenes.reduce(
                    (acc, ex) =>
                        acc +
                        (ex.Muestras?.reduce(
                            (a, m) => a + (m.Resultados?.length || 0),
                            0
                        ) || 0),
                    0
                ),
            },
            solicitudes: examenes.map((ex) => ({
                examen_id: ex.examen_id,
                nombre: ex.tipo_examen,
                fecha: null,
                tipo_examen: ex.tipo_examen,
                urgente_o_programado: null,
                estado: null, 
                muestras: (ex.Muestras || []).map((m) => ({
                    muestra_id: m.muestra_id,
                    tipo_muestra: m.tipo_muestra,
                    fecha_extraccion: m.fecha_extraccion,
                    fecha_recepcion: m.fecha_recepcion,
                    validado_por: m.ProfessionalProfile?.user
                        ? `${m.ProfessionalProfile.user.nombres} ${m.ProfessionalProfile.user.apellido_paterno} ${m.ProfessionalProfile.user.apellido_materno}`.trim()
                        : null,
                    fecha_validacion: null, 
                    resultados: (m.Resultados || []).map((r) => ({
                        resultado_id: r.resultado_id,
                        nombre: r.ParametroLab?.nombre || r.parametro,
                        parametro: r.parametro,
                        valor: r.valor,
                        unidad: r.unidad || r.ParametroLab?.unidad || null,
                        fecha_resultado: r.fecha_resultado,
                    })),
                })),
            })),
        };

        const heightCm = altura;
        let imc = null;
        if (
            peso !== null &&
            peso !== undefined &&
            !Number.isNaN(Number(peso)) &&
            heightCm !== null &&
            heightCm !== undefined &&
            !Number.isNaN(Number(heightCm)) &&
            Number(heightCm) > 0
        ) {
            const heightM = Number(heightCm) / 100; 
            if (heightM > 0) {
                const val = Number(peso) / (heightM * heightM);
                imc = Number.isFinite(val) ? val : null;
            }
        }

        const general = {
            paciente_id: paciente.user_id,
            nombre: nombreCompleto || null,
            rut: user.rut || null,
            fecha_nacimiento: user.fecha_nacimiento || null,
            edad: edad?.anios ?? null,
            edad_meses: edad?.meses ?? null,
            sexo: user.sexo || null,
            tipo_sangre: tipoSangre,
            altura,
            peso,
            IMC: imc,
            analisis_sangre: analisisSangre,
            historial_medico: historialMedico,
            alertas_medicas: alertas.map((a) => ({
                alerta_id: a.alerta_id,
                tipo: a.tipo,
                severidad:
                    typeof a.severidad === 'undefined' ? null : a.severidad,
                mensaje: typeof a.mensaje === 'undefined' ? null : a.mensaje,
                activa: typeof a.activa === 'undefined' ? null : a.activa,
                resuelta_en:
                    typeof a.resuelta_en === 'undefined' ? null : a.resuelta_en,
                episodio_id: __schemaFlags.alertaHasEpisodioId
                    ? a.episodio_id
                    : null,
            })),
            tdc_dias: tdc,
            tpo_dias: tpo,
            tth_dias: tth,
            dx_actual: dxActual,
        };

        res.json({
            general,
            registro_controles: registroControles,
            quirofano,
            laboratorio,
            indicadores: indicadoresUltimoControl,
        });
    } catch (err) {
        console.error('getResumen paciente error:', err);
        res.status(500).json({
            error: 'Error al obtener resumen del paciente',
        });
    }
}

async function datosPaciente(req, res) {
    try {
        const id = Number(req.params.user_id ?? req.query.user_id);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ error: 'user_id inválido' });
        }

        const paciente = await models.Paciente.findByPk(id, {
            include: [
                {
                    model: models.User,
                    as: 'User',
                    attributes: [
                        'nombres',
                        'apellido_paterno',
                        'apellido_materno',
                        'rut',
                        'fecha_nacimiento',
                    ],
                },
            ],
        });
        if (!paciente)
            return res.status(404).json({ error: 'Paciente no encontrado' });

        const user = paciente.User || {};

        const fn = user.fecha_nacimiento
            ? new Date(user.fecha_nacimiento)
            : null;
        let edadAnios = null;
        let edadMeses = null;
        if (fn && !Number.isNaN(fn.getTime())) {
            const hoy = new Date();
            let anios = hoy.getFullYear() - fn.getFullYear();
            let meses = hoy.getMonth() - fn.getMonth();
            const cumpleMes = hoy.getDate() - fn.getDate();
            if (cumpleMes < 0) meses -= 1;
            if (meses < 0) {
                anios -= 1;
                meses += 12;
            }
            edadAnios = anios;
            edadMeses = meses;
        }

        let tipoSangre = paciente.tipo_sangre || null;
        if (!tipoSangre) {
            const episodio = await models.Episodio.findOne({
                where: { paciente_id: id },
                order: [['episodio_id', 'DESC']],
                attributes: ['abo', 'rh'],
            });
            if (episodio) {
                const ts = [episodio.abo, episodio.rh].filter(Boolean).join('');
                if (ts) tipoSangre = ts;
            }
        }

        const nombre =
            [user.nombres, user.apellido_paterno, user.apellido_materno]
                .filter(Boolean)
                .join(' ') || null;

        res.json({
            nombre,
            rut: user.rut || null,
            fecha_nacimiento: user.fecha_nacimiento || null,
            tipo_sangre: tipoSangre,
            edad_anios: edadAnios,
            edad_meses: edadMeses,
        });
    } catch (err) {
        console.error('datosPaciente error:', err);
        res.status(500).json({ error: 'Error al obtener datos del paciente' });
    }
}
module.exports = {
    search,
    list,
    getOne,
    create,
    update,
    remove,
    getDetalles,
    getResumen,
    datosPaciente,
};
