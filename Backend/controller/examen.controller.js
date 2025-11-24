const models = require('../model/initModels');
const { idParam } = require('./_crud');
const riesgoService = require('../services/riesgoRefracturaService');
const labAlertService = require('../services/labAlertService');

function formatDateTime(input) {
    if (!input) return 'N/A';
    const date = input instanceof Date ? input : new Date(input);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toISOString().replace('T', ' ').slice(0, 19);
}

function safeTimestamp(input) {
    const ts = new Date(input).getTime();
    return Number.isNaN(ts) ? null : ts;
}

async function list(req, res) {
    try {
        const rows = await models.Examen.findAll({
            order: [['examen_id', 'DESC']],
        });
        res.json(rows);
    } catch {
        res.status(500).json({ error: 'Error al listar exámenes' });
    }
}

async function getOne(req, res) {
    try {
        const id = idParam(req);
        if (!id) return res.status(400).json({ error: 'id inválido' });
        const row = await models.Examen.findByPk(id);
        if (!row) return res.status(404).json({ error: 'No encontrado' });
        res.json(row);
    } catch {
        res.status(500).json({ error: 'Error al obtener examen' });
    }
}

async function create(req, res) {
    try {
        const body = req.body || {};
        const { tipo_examen, fecha_solicitud, paciente_id, funcionario_id } =
            body;
        const { muestras } = body;

        if (!paciente_id)
            return res
                .status(400)
                .json({ error: 'paciente_id es obligatorio' });
        const p = await models.Paciente.findByPk(paciente_id);
        if (!p) return res.status(400).json({ error: 'paciente_id no existe' });

        if (Array.isArray(muestras)) {
            const tx = await models.sequelize.transaction();
            try {
                const createdEx = await models.Examen.create(
                    {
                        tipo_examen: tipo_examen ?? 'NO_ESPECIFICADO',
                        fecha_solicitud: fecha_solicitud
                            ? new Date(fecha_solicitud)
                            : new Date(),
                        paciente_id,
                        funcionario_id: funcionario_id ?? null,
                    },
                    { transaction: tx }
                );

                const examen_id = createdEx.examen_id;

                const ultimoEpisodio = await models.Episodio.findOne({
                    where: { paciente_id },
                    order: [['episodio_id', 'DESC']],
                });
                if (!ultimoEpisodio) {
                    await tx.rollback();
                    return res.status(400).json({
                        error: 'No se encontró un episodio para el paciente proporcionado',
                    });
                }
                const episodio_id = ultimoEpisodio.episodio_id;

                const muestrasExistentes = await models.Muestra.findAll({
                    include: [
                        {
                            model: models.Resultado,
                            as: 'Resultados',
                            where: { episodio_id },
                            required: true,
                            include: [
                                {
                                    model: models.ParametroLab,
                                    attributes: ['codigo', 'nombre'],
                                    required: false,
                                },
                            ],
                        },
                    ],
                });
                const tiposExistentes = new Set(
                    muestrasExistentes.map((m) =>
                        String(m.tipo_muestra).toLowerCase()
                    )
                );

                const seenInRequest = new Set();
                const createdMuestras = [];
                const createdResultados = [];
                const skipped = [];

                for (const item of muestras) {
                    const tipo_muestra = item.tipo_muestra;
                    if (!tipo_muestra) {
                        skipped.push({ item, reason: 'tipo_muestra faltante' });
                        continue;
                    }
                    const tipoKey = String(tipo_muestra).toLowerCase();
                    if (tiposExistentes.has(tipoKey)) {
                        skipped.push({
                            item,
                            reason: 'tipo_muestra ya existe en el episodio',
                        });
                        continue;
                    }
                    if (seenInRequest.has(tipoKey)) {
                        skipped.push({
                            item,
                            reason: 'tipo_muestra duplicado en request',
                        });
                        continue;
                    }

                    const examenIdForItem = item.examen_id ?? examen_id;
                    const tecnologo_id =
                        item.tecnologo_id ??
                        item.profesional_id ??
                        item.profesionalId;
                    if (!examenIdForItem || !tecnologo_id) {
                        skipped.push({
                            item,
                            reason: 'falta examen_id o tecnologo_id',
                        });
                        continue;
                    }

                    const ex = await models.Examen.findByPk(examenIdForItem, {
                        transaction: tx,
                    });
                    if (!ex) {
                        skipped.push({ item, reason: 'examen_id no existe' });
                        continue;
                    }
                    const tec = await models.ProfessionalProfile.findByPk(
                        tecnologo_id,
                        { transaction: tx }
                    );
                    if (!tec) {
                        skipped.push({
                            item,
                            reason: 'tecnologo_id no existe',
                        });
                        continue;
                    }

                    const createdM = await models.Muestra.create(
                        {
                            tipo_muestra,
                            fecha_extraccion: item.fecha_extraccion
                                ? new Date(item.fecha_extraccion)
                                : new Date(),
                            fecha_recepcion: item.fecha_recepcion
                                ? new Date(item.fecha_recepcion)
                                : null,
                            observaciones: item.observaciones ?? null,
                            examen_id: examenIdForItem,
                            profesional_id: tecnologo_id,
                        },
                        { transaction: tx }
                    );

                    const resultado =
                        item.resultado || item.resultados || item.result;
                    if (
                        !resultado ||
                        resultado.parametro === undefined ||
                        resultado.valor === undefined
                    ) {
                        await tx.rollback();
                        return res.status(400).json({
                            error: 'cada muestra debe incluir un resultado con parametro y valor',
                        });
                    }

                    const createdR = await models.Resultado.create(
                        {
                            episodio_id,
                            parametro: resultado.parametro,
                            valor: Number(resultado.valor),
                            unidad: resultado.unidad ?? null,
                            fecha_resultado: resultado.fecha_resultado
                                ? new Date(resultado.fecha_resultado)
                                : new Date(),
                            muestra_id: createdM.muestra_id,
                            examen_id: examenIdForItem ?? null,
                        },
                        { transaction: tx }
                    );

                    createdMuestras.push(createdM.get({ plain: true }));
                    createdResultados.push(createdR.get({ plain: true }));
                    seenInRequest.add(tipoKey);
                    tiposExistentes.add(tipoKey);
                }

                await tx.commit();

                try {
                    await riesgoService.recalcularIndicadores(
                        ultimoEpisodio.episodio_id
                    );
                } catch (err) {
                    console.error('recalculo riesgo post-examen', err);
                }
                for (const r of createdResultados) {
                    try {
                        await labAlertService.syncAlertForResultado(r);
                    } catch (err) {
                        console.error('alerta laboratorio post-examen', err);
                    }
                }

                return res.status(201).json({
                    examen: createdEx.get({ plain: true }),
                    createdMuestras,
                    createdResultados,
                    skipped,
                });
            } catch (err) {
                await tx.rollback();
                console.error('error crear examen + muestras', err);
                return res.status(500).json({
                    error: 'Error al crear examen y muestras',
                    errorDetails: err.message,
                });
            }
        }

        if (!tipo_examen)
            return res.status(400).json({
                error: "tipo_examen es obligatorio si no viene 'muestras'",
            });
        const created = await models.Examen.create({
            tipo_examen,
            fecha_solicitud: fecha_solicitud
                ? new Date(fecha_solicitud)
                : new Date(),
            paciente_id,
            funcionario_id: funcionario_id ?? null,
        });
        res.status(201).json(created);
    } catch (err) {
        console.error('Error al crear examen:', err);
        res.status(500).json({
            error: 'Error al crear examen',
            errorDetails: err.message,
        });
    }
}

async function update(req, res) {
    try {
        const id = idParam(req);
        if (!id) return res.status(400).json({ error: 'id inválido' });

        const row = await models.Examen.findByPk(id);
        if (!row) return res.status(404).json({ error: 'No encontrado' });

        const { tipo_examen, fecha_solicitud, paciente_id, funcionario_id } =
            req.body;
        if (tipo_examen !== undefined) row.tipo_examen = String(tipo_examen);
        if (fecha_solicitud !== undefined)
            row.fecha_solicitud = new Date(fecha_solicitud);
        if (paciente_id !== undefined) {
            const p = await models.Paciente.findByPk(paciente_id);
            if (!p)
                return res.status(400).json({ error: 'paciente_id no existe' });
            row.paciente_id = paciente_id;
        }
        if (funcionario_id !== undefined) {
            const f = await models.Funcionario.findByPk(funcionario_id);
            if (!f)
                return res
                    .status(400)
                    .json({ error: 'funcionario_id no existe' });
            row.funcionario_id = funcionario_id;
        }

        await row.save();
        res.json(row);
    } catch {
        res.status(500).json({ error: 'Error al actualizar examen' });
    }
}

async function remove(req, res) {
    try {
        const id = idParam(req);
        if (!id) return res.status(400).json({ error: 'id inválido' });

        const row = await models.Examen.findByPk(id);
        if (!row) return res.status(404).json({ error: 'No encontrado' });

        await row.destroy();
        res.status(204).send();
    } catch {
        res.status(500).json({ error: 'Error al eliminar examen' });
    }
}

async function downloadMuestras(req, res) {
    try {
        const id = idParam(req);
        if (!id) return res.status(400).json({ error: 'id inválido' });

        const examen = await models.Examen.findByPk(id);
        if (!examen) return res.status(404).json({ error: 'No encontrado' });

        const muestrasRaw = await models.Muestra.findAll({
            where: { examen_id: id },
            include: [
                {
                    model: models.Resultado,
                    as: 'Resultados',
                    include: [
                        {
                            model: models.ParametroLab,
                            attributes: ['codigo', 'nombre'],
                            required: false,
                        },
                    ],
                },
            ],
            order: [['muestra_id', 'ASC']],
        });

        const examResultsRaw = await models.Resultado.findAll({
            where: { examen_id: id, muestra_id: null },
            include: [
                {
                    model: models.ParametroLab,
                    attributes: ['codigo', 'nombre'],
                    required: false,
                },
            ],
            order: [
                ['fecha_resultado', 'ASC'],
                ['resultado_id', 'ASC'],
            ],
        });

        const muestras = muestrasRaw.map((m) => {
            const plain = m.get({ plain: true });
            const nested = Array.isArray(plain.Resultados)
                ? plain.Resultados.slice()
                : [];
            nested.sort((a, b) => {
                const timeA = safeTimestamp(a.fecha_resultado);
                const timeB = safeTimestamp(b.fecha_resultado);
                if (timeA === null && timeB === null) {
                    return (a.resultado_id ?? 0) - (b.resultado_id ?? 0);
                }
                if (timeA === null) return 1;
                if (timeB === null) return -1;
                if (timeA === timeB)
                    return (a.resultado_id ?? 0) - (b.resultado_id ?? 0);
                return timeA - timeB;
            });
            plain.Resultados = nested;
            return plain;
        });

        const examResults = examResultsRaw.map((r) => r.get({ plain: true }));
        const header = examen.get({ plain: true });

        const lines = [];
        lines.push(`Examen ID: ${header.examen_id}`);
        if (header.tipo_examen !== undefined)
            lines.push(`Tipo de examen: ${header.tipo_examen ?? 'N/A'}`);
        if (header.paciente_id !== undefined)
            lines.push(`Paciente ID: ${header.paciente_id ?? 'N/A'}`);
        if (header.funcionario_id !== undefined)
            lines.push(`Funcionario ID: ${header.funcionario_id ?? 'N/A'}`);
        if (header.fecha_solicitud !== undefined)
            lines.push(
                `Fecha solicitud: ${formatDateTime(header.fecha_solicitud)}`
            );

        if (examResults.length) {
            lines.push('', 'Resultados sin muestra asociada:');
            examResults.forEach((r) => {
                const unidad = r.unidad ? ` ${r.unidad}` : '';
                lines.push(
                    `- (${r.resultado_id}) ${
                        r.ParametroLab?.nombre || (r.parametro ?? 'Parametro')
                    }: ${r.valor ?? 'N/A'}${unidad} [${formatDateTime(
                        r.fecha_resultado
                    )}]`
                );
            });
        }

        if (muestras.length) {
            lines.push('', 'Muestras:');
            muestras.forEach((m) => {
                const detailParts = [];
                if (m.tipo_muestra !== undefined)
                    detailParts.push(`tipo=${m.tipo_muestra ?? 'N/A'}`);
                if (m.fecha_extraccion !== undefined)
                    detailParts.push(
                        `fecha_extraccion=${formatDateTime(m.fecha_extraccion)}`
                    );
                if (m.fecha_recepcion !== undefined)
                    detailParts.push(
                        `fecha_recepcion=${formatDateTime(m.fecha_recepcion)}`
                    );
                if (m.fecha_toma !== undefined)
                    detailParts.push(
                        `fecha_toma=${formatDateTime(m.fecha_toma)}`
                    );
                if (m.profesional_id !== undefined)
                    detailParts.push(
                        `profesional_id=${m.profesional_id ?? 'N/A'}`
                    );
                if (m.tecnologo_id !== undefined)
                    detailParts.push(`tecnologo_id=${m.tecnologo_id ?? 'N/A'}`);
                if (m.observaciones)
                    detailParts.push(`observaciones=${m.observaciones}`);

                const headerLine = detailParts.length
                    ? `Muestra ${m.muestra_id}: ${detailParts.join(' | ')}`
                    : `Muestra ${m.muestra_id}`;
                lines.push(headerLine);

                const resultados = Array.isArray(m.Resultados)
                    ? m.Resultados
                    : [];
                if (!resultados.length) {
                    lines.push('  (Sin resultados registrados)');
                } else {
                    resultados.forEach((r) => {
                        const unidad = r.unidad ? ` ${r.unidad}` : '';
                        lines.push(
                            `  - (${r.resultado_id}) ${
                                r.ParametroLab?.nombre ||
                                (r.parametro ?? 'Parametro')
                            }: ${r.valor ?? 'N/A'}${unidad} [${formatDateTime(
                                r.fecha_resultado
                            )}]`
                        );
                    });
                }
            });
        } else {
            lines.push('', '(No hay muestras registradas para este examen)');
        }

        const content = `${lines.join('\n')}\n`;
        const filename = `examen_${id}_muestras.txt`;
        res.set({
            'Content-Type': 'text/plain; charset=utf-8',
            'Content-Disposition': `attachment; filename="${filename}"`,
        });
        res.send(content);
    } catch (e) {
        console.error('downloadMuestras error', e);
        res.status(500).json({ error: 'Error al generar el archivo' });
    }
}

async function listByPaciente(req, res) {
    try {
        const pacienteId = Number(
            req.params.paciente_id ??
                req.query.paciente_id ??
                req.body.paciente_id
        );
        if (!pacienteId)
            return res.status(400).json({ error: 'paciente_id inválido' });

        const paciente = await models.Paciente.findByPk(pacienteId);
        if (!paciente)
            return res.status(404).json({ error: 'Paciente no encontrado' });

        const examenes = await models.Examen.findAll({
            where: { paciente_id: pacienteId },
            order: [['examen_id', 'DESC']],
        });

        if (!examenes.length) return res.json([]);

        const examenIds = examenes.map((e) => e.examen_id);

        const muestras = await models.Muestra.findAll({
            where: { examen_id: examenIds },
            include: [
                {
                    model: models.Resultado,
                    as: 'Resultados',
                    include: [
                        {
                            model: models.ParametroLab,
                            attributes: ['codigo', 'nombre'],
                            required: false,
                        },
                    ],
                },
            ],
            order: [['muestra_id', 'ASC']],
        });

        const profesionalIds = Array.from(
            new Set(
                muestras
                    .map((m) => m.profesional_id)
                    .filter((id) => id !== undefined && id !== null)
                    .map((id) => Number(id))
                    .filter((id) => !Number.isNaN(id))
            )
        );

        const profesionalesPorId = new Map();
        if (profesionalIds.length) {
            const perfiles = await models.ProfessionalProfile.findAll({
                where: { id: profesionalIds },
                include: [{ model: models.User, as: 'user' }],
            });
            perfiles.forEach((perfil) => {
                const plainPerfil = perfil.get({ plain: true });
                const user = plainPerfil.user || plainPerfil.User || {};
                const nombre = [
                    user.nombres,
                    user.apellido_paterno,
                    user.apellido_materno,
                ]
                    .map((part) =>
                        typeof part === 'string' ? part.trim() : part
                    )
                    .filter(Boolean)
                    .join(' ');
                const id = Number(plainPerfil.id);
                if (!Number.isNaN(id)) {
                    profesionalesPorId.set(id, nombre || null);
                }
            });

            const faltantes = profesionalIds.filter(
                (id) => !profesionalesPorId.has(id)
            );
            if (faltantes.length) {
                const usuarios = await models.User.findAll({
                    where: { id: faltantes },
                });
                usuarios.forEach((usuario) => {
                    const plainUsuario = usuario.get({ plain: true });
                    const nombre = [
                        plainUsuario.nombres,
                        plainUsuario.apellido_paterno,
                        plainUsuario.apellido_materno,
                    ]
                        .map((part) =>
                            typeof part === 'string' ? part.trim() : part
                        )
                        .filter(Boolean)
                        .join(' ');
                    const id = Number(plainUsuario.id);
                    if (!Number.isNaN(id) && !profesionalesPorId.has(id)) {
                        profesionalesPorId.set(id, nombre || null);
                    }
                });
            }
        }

        const resultadosSinMuestra = await models.Resultado.findAll({
            where: { examen_id: examenIds, muestra_id: null },
            include: [
                {
                    model: models.ParametroLab,
                    attributes: ['codigo', 'nombre'],
                    required: false,
                },
            ],
            order: [
                ['fecha_resultado', 'ASC'],
                ['resultado_id', 'ASC'],
            ],
        });

        const muestrasPorExamen = new Map();
        muestras.forEach((m) => {
            const exId = m.examen_id;
            const list = muestrasPorExamen.get(exId) || [];
            const plain = m.get({ plain: true });
            const profIdRaw =
                m.profesional_id !== undefined && m.profesional_id !== null
                    ? m.profesional_id
                    : plain.profesional_id;
            const profId =
                profIdRaw !== undefined && profIdRaw !== null
                    ? Number(profIdRaw)
                    : null;
            const nombreProfesional =
                profId !== null && !Number.isNaN(profId)
                    ? profesionalesPorId.get(profId) || null
                    : null;

            plain.validado_por = nombreProfesional;
            delete plain.profesional_id;
            delete plain.ProfessionalProfile;
            const nested = Array.isArray(plain.Resultados)
                ? plain.Resultados.slice()
                : [];
            nested.sort((a, b) => {
                const ta = safeTimestamp(a.fecha_resultado);
                const tb = safeTimestamp(b.fecha_resultado);
                if (ta === null && tb === null)
                    return (a.resultado_id ?? 0) - (b.resultado_id ?? 0);
                if (ta === null) return 1;
                if (tb === null) return -1;
                if (ta === tb)
                    return (a.resultado_id ?? 0) - (b.resultado_id ?? 0);
                return ta - tb;
            });
            plain.Resultados = nested;
            list.push(plain);
            muestrasPorExamen.set(exId, list);
        });

        const rsmPorExamen = new Map();
        resultadosSinMuestra.forEach((r) => {
            const exId = r.examen_id;
            const list = rsmPorExamen.get(exId) || [];
            list.push(r.get({ plain: true }));
            rsmPorExamen.set(exId, list);
        });

        const payload = examenes.map((e) => {
            const plain = e.get({ plain: true });
            return {
                ...plain,
                resultados_sin_muestra: rsmPorExamen.get(e.examen_id) || [],
                muestras: muestrasPorExamen.get(e.examen_id) || [],
            };
        });

        res.json(payload);
    } catch (e) {
        console.error('listByPaciente error', e);
        res.status(500).json({
            error: 'Error al listar exámenes del paciente',
        });
    }
}

async function createComplete(req, res) {
    try {
        const body = req.body || {};
        const {
            tipo_examen,
            tipo_muestra,
            fecha_extraccion,
            fecha_recepcion,
            observaciones,
            paciente_id,
            funcionario_id,
            resultados,
        } = body;

        const userId = req.user?.rut;
        if (!userId) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }

        const profesionalProfile = await models.User.findOne({
            where: { rut: userId },
            include: [
                {
                    model: models.ProfessionalProfile,
                    as: 'professional_profile',
                },
            ],
        }).then((user) => user?.professional_profile);

        if (!profesionalProfile) {
            return res.status(400).json({
                error: 'No se encontró un perfil profesional para el usuario',
            });
        }
        const validado_por = profesionalProfile.id;

        if (!paciente_id) {
            return res
                .status(400)
                .json({ error: 'paciente_id es obligatorio' });
        }
        if (!tipo_examen) {
            return res
                .status(400)
                .json({ error: 'tipo_examen es obligatorio' });
        }
        if (!tipo_muestra) {
            return res
                .status(400)
                .json({ error: 'tipo_muestra es obligatorio' });
        }
        if (!Array.isArray(resultados) || resultados.length === 0) {
            return res
                .status(400)
                .json({ error: 'resultados debe ser un array no vacío' });
        }

        const paciente = await models.Paciente.findByPk(paciente_id);
        if (!paciente) {
            return res.status(400).json({ error: 'paciente_id no existe' });
        }

        const ultimoEpisodio = await models.Episodio.findOne({
            where: { paciente_id },
            order: [['episodio_id', 'DESC']],
        });
        if (!ultimoEpisodio) {
            return res.status(400).json({
                error: 'No se encontró un episodio para el paciente',
            });
        }
        const episodio_id = ultimoEpisodio.episodio_id;

        const tx = await models.sequelize.transaction();
        try {
            const createdExamen = await models.Examen.create(
                {
                    tipo_examen,
                    fecha_solicitud: new Date(),
                    paciente_id,
                    funcionario_id: funcionario_id ?? null,
                },
                { transaction: tx }
            );

            const createdMuestra = await models.Muestra.create(
                {
                    tipo_muestra,
                    fecha_extraccion: fecha_extraccion
                        ? new Date(fecha_extraccion)
                        : new Date(),
                    fecha_recepcion: fecha_recepcion
                        ? new Date(fecha_recepcion)
                        : null,
                    observaciones: observaciones ?? null,
                    examen_id: createdExamen.examen_id,
                    profesional_id: validado_por,
                },
                { transaction: tx }
            );

            const createdResultados = [];
            for (const res_item of resultados) {
                const { parametro, valor, unidad } = res_item;

                if (!parametro || valor === undefined) {
                    await tx.rollback();
                    return res.status(400).json({
                        error: 'Cada resultado debe tener parametro y valor',
                    });
                }

                const parametroExists = await models.ParametroLab.findByPk(
                    parametro,
                    { transaction: tx }
                );
                if (!parametroExists) {
                    await tx.rollback();
                    return res.status(400).json({
                        error: `Parámetro '${parametro}' no existe en el catálogo de parámetros de laboratorio`,
                    });
                }

                const createdResultado = await models.Resultado.create(
                    {
                        episodio_id,
                        parametro,
                        valor: Number(valor),
                        unidad: unidad ?? null,
                        fecha_resultado: new Date(),
                        muestra_id: createdMuestra.muestra_id,
                        examen_id: createdExamen.examen_id,
                    },
                    { transaction: tx }
                );
                createdResultados.push(createdResultado.get({ plain: true }));
            }

            await tx.commit();

            try {
                await riesgoService.recalcularIndicadores(episodio_id);
            } catch (err) {
                console.error('recalculo riesgo post-createComplete', err);
            }

            for (const resultado of createdResultados) {
                try {
                    await labAlertService.syncAlertForResultado(resultado);
                } catch (err) {
                    console.error(
                        'alerta laboratorio post-createComplete',
                        err
                    );
                }
            }

            return res.status(201).json({
                examen: createdExamen.get({ plain: true }),
                muestra: createdMuestra.get({ plain: true }),
                resultados: createdResultados,
                mensaje: 'Examen, muestra y resultados creados exitosamente',
            });
        } catch (err) {
            await tx.rollback();
            console.error('Error en createComplete:', err);
            return res.status(500).json({
                error: 'Error al crear examen, muestra y resultados',
                errorDetails: err.message,
            });
        }
    } catch (err) {
        console.error('Error en createComplete (outer):', err);
        res.status(500).json({
            error: 'Error al crear examen completo',
            errorDetails: err.message,
        });
    }
}

module.exports = {
    list,
    getOne,
    create,
    createComplete,
    update,
    remove,
    downloadMuestras,
    listByPaciente,
};
