// services/riesgoRefracturaService.js
const { Op } = require('sequelize');
const models = require('../model/initModels');

// ----------------- utilidades -----------------
function numero(value) {
    if (value === undefined || value === null) return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
}

function calcularEdad(paciente, user) {
    if (
        paciente &&
        paciente.edad_anios !== undefined &&
        paciente.edad_anios !== null
    ) {
        const n = numero(paciente.edad_anios);
        if (n !== null) return n;
    }
    const fecha = user?.fecha_nacimiento
        ? new Date(user.fecha_nacimiento)
        : null;
    if (!fecha || Number.isNaN(fecha.getTime())) return null;
    const hoy = new Date();
    let edad = hoy.getFullYear() - fecha.getFullYear();
    const mes = hoy.getMonth() - fecha.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fecha.getDate())) edad -= 1;
    return edad >= 0 ? edad : null;
}

function horasEntreFechas(base, fechaCirugia, horaInicio) {
    if (!base || !fechaCirugia) return null;
    const baseDate = new Date(base);
    if (Number.isNaN(baseDate.getTime())) return null;
    const cirugia = new Date(fechaCirugia);
    if (Number.isNaN(cirugia.getTime())) return null;
    if (horaInicio) {
        const [hh, mm] = String(horaInicio).split(':');
        if (hh !== undefined && mm !== undefined) {
            cirugia.setHours(Number(hh) || 0, Number(mm) || 0, 0, 0);
        }
    }
    const diffMs = cirugia.getTime() - baseDate.getTime();
    return diffMs > 0 ? diffMs / (1000 * 60 * 60) : 0;
}

async function obtenerResultados(m, episodioId, codigos) {
    if (!Array.isArray(codigos) || !codigos.length) return {};
    const rows = await m.Resultado.findAll({
        where: { episodio_id: episodioId, parametro: { [Op.in]: codigos } },
        order: [
            ['fecha_resultado', 'DESC'],
            ['resultado_id', 'DESC'],
        ],
    });
    const latestByParam = {};
    for (const row of rows) {
        const data = row.get({ plain: true });
        if (!latestByParam[data.parametro])
            latestByParam[data.parametro] = data;
    }
    return latestByParam;
}

async function borrarIndicadoresPrevios(m, controlId, episodioId) {
    const indicadoresIds = new Set();

    const indicadores =
        (await m.EpisodioIndicador.findAll({
            where: { control_id: controlId ?? null },
            attributes: ['episodio_indicador_id'],
        })) || [];
    for (const r of indicadores) indicadoresIds.add(r.episodio_indicador_id);

    const legados =
        (await m.EpisodioIndicador.findAll({
            where: { episodio_id: episodioId ?? null, control_id: null },
            attributes: ['episodio_indicador_id'],
        })) || [];
    for (const r of legados) indicadoresIds.add(r.episodio_indicador_id);

    if (!indicadoresIds.size) return;
    const ids = Array.from(indicadoresIds);
    await m.Alerta.destroy({ where: { indicador_id: { [Op.in]: ids } } });
    await m.EpisodioIndicador.destroy({
        where: { episodio_indicador_id: { [Op.in]: ids } },
    });
}

function construirDetalleFactor(factor, evalResult, puntaje) {
    const baseDetalles = {
        dominio: factor.dominio,
        criterio: factor.criterio,
        puntos: factor.puntos,
        prioridad: factor.prioridad,
        mensaje: factor.mensaje,
        cumple: Boolean(evalResult.cumple),
        puntaje_otorgado: puntaje,
    };
    if (evalResult.detalles && typeof evalResult.detalles === 'object') {
        return { ...baseDetalles, ...evalResult.detalles };
    }
    return baseDetalles;
}

function nivelDesdePuntaje(total, thresholds) {
    if (total >= thresholds.ALTO) return 'ALTO';
    if (total >= thresholds.MODERADO) return 'MODERADO';
    return 'BAJO';
}

function ordenarControles(controles = []) {
    return [...controles].sort((a, b) => {
        const fechaA = a?.fecha_hora_control
            ? new Date(a.fecha_hora_control)
            : null;
        const fechaB = b?.fecha_hora_control
            ? new Date(b.fecha_hora_control)
            : null;
        if (fechaA && fechaB && fechaA.getTime() !== fechaB.getTime())
            return fechaA - fechaB;
        if (fechaA && !fechaB) return -1;
        if (!fechaA && fechaB) return 1;
        return (a?.control_id || 0) - (b?.control_id || 0);
    });
}

// ----------------- servicio auxiliar para episodios sin controles -----------------
async function recalcularIndicadoresEpisodio(
    episodioId,
    options = {},
    injected = {}
) {
    const m = injected.models || models;

    // ⚠️ Carga de configuración inyectable (para tests) o real
    const cfg = injected.cfg || require('../config/riesgoFactores');
    const { FACTORES, NIVEL_THRESHOLDS, COLOR_BY_NIVEL, ACTION_BY_NIVEL } = cfg;

    const episodio = await m.Episodio.findByPk(episodioId, {
        include: [
            {
                model: m.Paciente,
                required: false,
                include: [{ model: m.User, as: 'user', required: false }],
            },
            { model: m.Antropometria, required: false },
            { model: m.ControlClinico, required: false },
        ],
    });

    if (!episodio) {
        throw Object.assign(
            new Error('Episodio no encontrado: ' + episodioId),
            { statusCode: 404 }
        );
    }

    const episodioData = episodio.get({ plain: true });
    const paciente = episodioData.Paciente || null;
    const user = paciente?.user || null;
    const antropometria =
        episodioData.Antropometrium || episodioData.Antropometria || null;

    // Para episodios sin controles, usamos directamente los datos del episodio
    const comorbilidadesEpisodio = Array.isArray(episodioData.comorbilidades)
        ? episodioData.comorbilidades.filter(Boolean)
        : [];
    const conteoComorbilidades = comorbilidadesEpisodio.length || null;

    const habitoDesdeEpisodio = (field) => Boolean(episodioData?.[field]);

    const resultados = await obtenerResultados(m, episodioId, [
        'HB',
        'VITAMINA_D',
        'ALBUMINA',
        'CREATININA_SERICA',
        'NLR',
        'MLR',
    ]);

    const cirugias = await m.Cirugia.findAll({
        where: { episodio_id: episodioId },
        order: [
            ['fecha', 'ASC'],
            ['hora_inicio', 'ASC'],
            ['cirugia_id', 'ASC'],
        ],
    });
    const primeraCirugia = cirugias.length
        ? cirugias[0].get({ plain: true })
        : null;

    const overrides =
        options.overrides && typeof options.overrides === 'object'
            ? options.overrides
            : {};

    const imc = (() => {
        const peso = numero(antropometria?.peso_kg);
        const talla = numero(antropometria?.altura_m);
        if (!peso || !talla)
            return overrides.imc !== undefined ? numero(overrides.imc) : null;
        const calculado = peso / (talla * talla);
        return Number.isFinite(calculado) ? Number(calculado.toFixed(1)) : null;
    })();

    const retrasoHoras = (() => {
        if (
            overrides.retraso_horas !== undefined &&
            overrides.retraso_horas !== null
        ) {
            const val = numero(overrides.retraso_horas);
            return val !== null ? val : null;
        }
        const horas = horasEntreFechas(
            episodioData?.fecha_diagnostico,
            primeraCirugia?.fecha,
            primeraCirugia?.hora_inicio
        );
        return horas !== null ? horas : null;
    })();

    const contexto = {
        control_id: null, // Sin control asociado
        episodio_id: episodioId,
        tipo_control: 'INICIAL', // Tipo por defecto para episodios sin controles
        edad:
            overrides.edad !== undefined
                ? numero(overrides.edad)
                : calcularEdad(paciente, user),
        sexo: overrides.sexo !== undefined ? overrides.sexo : user?.sexo,
        fractura_fragilidad: overrides.fractura_fragilidad ?? false,
        fractura_vertebral: overrides.fractura_vertebral ?? false,
        antecedente_familiar: overrides.antecedente_familiar ?? false,
        vitamina_d:
            overrides.vitamina_d !== undefined
                ? numero(overrides.vitamina_d)
                : numero(resultados.VITAMINA_D?.valor),
        albumina:
            overrides.albumina !== undefined
                ? numero(overrides.albumina)
                : numero(resultados.ALBUMINA?.valor),
        hemoglobina:
            overrides.hemoglobina !== undefined
                ? numero(overrides.hemoglobina)
                : numero(resultados.HB?.valor),
        creatinina:
            overrides.creatinina !== undefined
                ? numero(overrides.creatinina)
                : numero(resultados.CREATININA_SERICA?.valor),
        nlr:
            overrides.nlr !== undefined
                ? numero(overrides.nlr)
                : numero(resultados.NLR?.valor),
        mlr:
            overrides.mlr !== undefined
                ? numero(overrides.mlr)
                : numero(resultados.MLR?.valor),
        num_comorbilidades:
            overrides.num_comorbilidades !== undefined
                ? numero(overrides.num_comorbilidades)
                : conteoComorbilidades,
        comorbilidades_detalle:
            overrides.comorbilidades_detalle ?? comorbilidadesEpisodio,
        barthel:
            overrides.barthel !== undefined ? numero(overrides.barthel) : null,
        imc,
        tabaco:
            overrides.tabaco !== undefined
                ? Boolean(overrides.tabaco)
                : habitoDesdeEpisodio('tabaco'),
        corticoides:
            overrides.corticoides !== undefined
                ? Boolean(overrides.corticoides)
                : habitoDesdeEpisodio('corticoides_cronicos'),
        alcohol:
            overrides.alcohol !== undefined
                ? Boolean(overrides.alcohol)
                : habitoDesdeEpisodio('alcohol'),
        tipo_fractura: overrides.tipo_fractura || episodioData?.tipo_fractura,
        subcapital_desplazada: overrides.subcapital_desplazada ?? false,
        retraso_horas: retrasoHoras,
        retraso_quirurgico:
            overrides.retraso_quirurgico !== undefined
                ? Boolean(overrides.retraso_quirurgico)
                : typeof retrasoHoras === 'number'
                ? retrasoHoras > 48
                : false,
    };

    // Borrar indicadores previos del episodio sin control asociado
    await borrarIndicadoresPrevios(m, null, episodioId);

    const indicadoresGuardados = [];
    let puntajeTotal = 0;

    for (const factor of FACTORES) {
        const resultado = factor.evaluate(contexto) || {};
        const puntaje = resultado.cumple ? factor.puntos : 0;
        puntajeTotal += puntaje;
        if (!puntaje) {
            indicadoresGuardados.push({
                control_id: null,
                episodio_id: episodioId,
                tipo: factor.tipo,
                valor: 0,
                detalles: construirDetalleFactor(factor, resultado, puntaje),
            });
            continue;
        }
        const detalles = construirDetalleFactor(factor, resultado, puntaje);
        const indicador = await m.EpisodioIndicador.create({
            episodio_id: episodioId,
            control_id: null, // Sin control asociado
            tipo: factor.tipo,
            valor: puntaje,
            detalles,
            calculado_en: new Date(),
        });
        indicadoresGuardados.push(indicador.get({ plain: true }));
    }

    const nivel = nivelDesdePuntaje(puntajeTotal, NIVEL_THRESHOLDS);
    const resumenDetalles = {
        control_id: null,
        puntaje_total: puntajeTotal,
        nivel,
        color: COLOR_BY_NIVEL[nivel] || null,
        accion_recomendada: ACTION_BY_NIVEL[nivel] || null,
        criterios: indicadoresGuardados.map((item) => ({
            tipo: item.tipo,
            puntaje_otorgado: item.valor,
            cumple: Boolean(item.detalles?.cumple),
            prioridad: item.detalles?.prioridad,
            mensaje: item.detalles?.mensaje,
        })),
    };

    const indicadorTotal = await m.EpisodioIndicador.create({
        episodio_id: episodioId,
        control_id: null,
        tipo: 'RIESGO_REFRACTURA',
        valor: puntajeTotal,
        nivel,
        detalles: resumenDetalles,
        calculado_en: new Date(),
    });
    const indicadorTotalData = indicadorTotal.get({ plain: true });

    let alerta = null;
    if (nivel !== 'BAJO') {
        const severidad = nivel === 'ALTO' ? 'ALTA' : 'MEDIA';
        const accionTexto = ACTION_BY_NIVEL[nivel] || null;
        const mensajeBase = `Riesgo de refractura ${nivel.toLowerCase()} (puntaje ${puntajeTotal}).`;
        const mensaje =
            options.mensajeAlerta ||
            (accionTexto ? `${mensajeBase} ${accionTexto}` : mensajeBase);

        alerta = await m.Alerta.create({
            episodio_id: episodioId,
            tipo: 'RIESGO',
            severidad,
            mensaje,
            activa: true,
            indicador_id: indicadorTotalData.episodio_indicador_id,
        });
        alerta = alerta.get({ plain: true });
    }

    return {
        episodio_id: episodioId,
        control_id: null,
        contexto,
        indicadores: indicadoresGuardados,
        resumen: indicadorTotalData,
        alerta,
    };
}

// ----------------- servicio principal -----------------
async function recalcularIndicadoresControl(
    controlId,
    options = {},
    injected = {}
) {
    const m = injected.models || models;

    // ⚠️ Carga de configuración inyectable (para tests) o real
    const cfg = injected.cfg || require('../config/riesgoFactores');
    const { FACTORES, NIVEL_THRESHOLDS, COLOR_BY_NIVEL, ACTION_BY_NIVEL } = cfg;

    if (!controlId) {
        throw Object.assign(new Error('control_id requerido'), {
            statusCode: 400,
        });
    }

    let controlRow = options.__controlInstance || null;
    if (!controlRow) {
        controlRow = await m.ControlClinico.findByPk(controlId, {
            include: [
                {
                    model: m.Episodio,
                    include: [
                        {
                            model: m.Paciente,
                            required: false,
                            include: [
                                { model: m.User, as: 'user', required: false },
                            ],
                        },
                        { model: m.Antropometria, required: false },
                        { model: m.ControlClinico, required: false },
                    ],
                },
            ],
        });
    }

    if (!controlRow) {
        throw Object.assign(new Error('Control clínico no encontrado'), {
            statusCode: 404,
        });
    }

    const controlData = controlRow.get
        ? controlRow.get({ plain: true })
        : controlRow;
    const episodioData = controlData.Episodio || options.__episodioPlain;

    if (!episodioData) {
        const episodio = await m.Episodio.findByPk(controlData.episodio_id, {
            include: [
                {
                    model: m.Paciente,
                    required: false,
                    include: [{ model: m.User, as: 'user', required: false }],
                },
                { model: m.Antropometria, required: false },
                { model: m.ControlClinico, required: false },
            ],
        });
        if (!episodio) {
            throw Object.assign(new Error('Episodio no encontrado'), {
                statusCode: 404,
            });
        }
        controlData.Episodio = episodio.get({ plain: true });
    }

    const episodio = controlData.Episodio || episodioData;
    const episodioId = episodio?.episodio_id;
    if (!episodioId) {
        throw Object.assign(
            new Error('Episodio asociado al control no válido'),
            { statusCode: 400 }
        );
    }

    const paciente = episodio.Paciente || null;
    const user = paciente?.user || null;
    const antropometria =
        episodio.Antropometrium || episodio.Antropometria || null;
    const controlesEpisodio = ordenarControles(episodio.ControlClinicos || []);
    const controlActual =
        controlesEpisodio.find((c) => c.control_id === controlId) ||
        controlData;
    const controlInicial =
        controlesEpisodio.find((c) => c.tipo_control === 'INICIAL') ||
        controlesEpisodio[0] ||
        null;

    const comorbilidadesActual = Array.isArray(controlActual?.comorbilidades)
        ? controlActual.comorbilidades.filter(Boolean)
        : null;
    const comorbilidadesInicial = Array.isArray(controlInicial?.comorbilidades)
        ? controlInicial.comorbilidades.filter(Boolean)
        : null;
    const comorbilidadesEpisodio = Array.isArray(episodio.comorbilidades)
        ? episodio.comorbilidades.filter(Boolean)
        : null;

    const detalleComorbilidades =
        comorbilidadesActual ??
        comorbilidadesInicial ??
        comorbilidadesEpisodio ??
        [];
    const conteoComorbilidades = comorbilidadesActual
        ? comorbilidadesActual.length
        : comorbilidadesInicial
        ? comorbilidadesInicial.length
        : comorbilidadesEpisodio
        ? comorbilidadesEpisodio.length
        : null;

    const habitoDesdeControl = (field) => {
        if (
            controlActual &&
            controlActual[field] !== undefined &&
            controlActual[field] !== null
        )
            return Boolean(controlActual[field]);
        if (
            controlInicial &&
            controlInicial[field] !== undefined &&
            controlInicial[field] !== null
        )
            return Boolean(controlInicial[field]);
        return Boolean(episodio?.[field]);
    };

    const resultados = await obtenerResultados(m, episodioId, [
        'HB',
        'VITAMINA_D',
        'ALBUMINA',
        'CREATININA_SERICA',
        'NLR',
        'MLR',
    ]);

    const cirugias = await m.Cirugia.findAll({
        where: { episodio_id: episodioId },
        order: [
            ['fecha', 'ASC'],
            ['hora_inicio', 'ASC'],
            ['cirugia_id', 'ASC'],
        ],
    });
    const primeraCirugia = cirugias.length
        ? cirugias[0].get({ plain: true })
        : null;

    const overrides =
        options.overrides && typeof options.overrides === 'object'
            ? options.overrides
            : {};

    const imc = (() => {
        const peso = numero(antropometria?.peso_kg);
        const talla = numero(antropometria?.altura_m);
        if (!peso || !talla)
            return overrides.imc !== undefined ? numero(overrides.imc) : null;
        const calculado = peso / (talla * talla);
        return Number.isFinite(calculado) ? Number(calculado.toFixed(1)) : null;
    })();

    const retrasoHoras = (() => {
        if (
            overrides.retraso_horas !== undefined &&
            overrides.retraso_horas !== null
        ) {
            const val = numero(overrides.retraso_horas);
            return val !== null ? val : null;
        }
        const horas = horasEntreFechas(
            episodio?.fecha_diagnostico,
            primeraCirugia?.fecha,
            primeraCirugia?.hora_inicio
        );
        return horas !== null ? horas : null;
    })();

    const contexto = {
        control_id: controlId,
        episodio_id: episodioId,
        tipo_control: controlActual?.tipo_control || null,
        edad:
            overrides.edad !== undefined
                ? numero(overrides.edad)
                : calcularEdad(paciente, user),
        sexo: overrides.sexo !== undefined ? overrides.sexo : user?.sexo,
        fractura_fragilidad: overrides.fractura_fragilidad ?? false,
        fractura_vertebral: overrides.fractura_vertebral ?? false,
        antecedente_familiar: overrides.antecedente_familiar ?? false,
        vitamina_d:
            overrides.vitamina_d !== undefined
                ? numero(overrides.vitamina_d)
                : numero(resultados.VITAMINA_D?.valor),
        albumina:
            overrides.albumina !== undefined
                ? numero(overrides.albumina)
                : numero(resultados.ALBUMINA?.valor),
        hemoglobina:
            overrides.hemoglobina !== undefined
                ? numero(overrides.hemoglobina)
                : numero(resultados.HB?.valor),
        creatinina:
            overrides.creatinina !== undefined
                ? numero(overrides.creatinina)
                : numero(resultados.CREATININA_SERICA?.valor),
        nlr:
            overrides.nlr !== undefined
                ? numero(overrides.nlr)
                : numero(resultados.NLR?.valor),
        mlr:
            overrides.mlr !== undefined
                ? numero(overrides.mlr)
                : numero(resultados.MLR?.valor),
        num_comorbilidades:
            overrides.num_comorbilidades !== undefined
                ? numero(overrides.num_comorbilidades)
                : conteoComorbilidades,
        comorbilidades_detalle:
            overrides.comorbilidades_detalle ?? detalleComorbilidades,
        barthel:
            overrides.barthel !== undefined ? numero(overrides.barthel) : null,
        imc,
        tabaco:
            overrides.tabaco !== undefined
                ? Boolean(overrides.tabaco)
                : habitoDesdeControl('tabaco'),
        corticoides:
            overrides.corticoides !== undefined
                ? Boolean(overrides.corticoides)
                : habitoDesdeControl('corticoides_cronicos'),
        alcohol:
            overrides.alcohol !== undefined
                ? Boolean(overrides.alcohol)
                : habitoDesdeControl('alcohol'),
        tipo_fractura: overrides.tipo_fractura || episodio?.tipo_fractura,
        subcapital_desplazada: overrides.subcapital_desplazada ?? false,
        retraso_horas: retrasoHoras,
        retraso_quirurgico:
            overrides.retraso_quirurgico !== undefined
                ? Boolean(overrides.retraso_quirurgico)
                : typeof retrasoHoras === 'number'
                ? retrasoHoras > 48
                : false,
    };

    await borrarIndicadoresPrevios(m, controlId, episodioId);

    const indicadoresGuardados = [];
    let puntajeTotal = 0;

    for (const factor of FACTORES) {
        const resultado = factor.evaluate(contexto) || {};
        const puntaje = resultado.cumple ? factor.puntos : 0;
        puntajeTotal += puntaje;
        if (!puntaje) {
            indicadoresGuardados.push({
                control_id: controlId,
                episodio_id: episodioId,
                tipo: factor.tipo,
                valor: 0,
                detalles: construirDetalleFactor(factor, resultado, puntaje),
            });
            continue;
        }
        const detalles = construirDetalleFactor(factor, resultado, puntaje);
        const indicador = await m.EpisodioIndicador.create({
            episodio_id: episodioId,
            control_id: controlId,
            tipo: factor.tipo,
            valor: puntaje,
            detalles,
            calculado_en: new Date(),
        });
        indicadoresGuardados.push(indicador.get({ plain: true }));
    }

    const nivel = nivelDesdePuntaje(puntajeTotal, NIVEL_THRESHOLDS);
    const resumenDetalles = {
        control_id: controlId,
        puntaje_total: puntajeTotal,
        nivel,
        color: COLOR_BY_NIVEL[nivel] || null,
        accion_recomendada: ACTION_BY_NIVEL[nivel] || null,
        criterios: indicadoresGuardados.map((item) => ({
            tipo: item.tipo,
            puntaje_otorgado: item.valor,
            cumple: Boolean(item.detalles?.cumple),
            prioridad: item.detalles?.prioridad,
            mensaje: item.detalles?.mensaje,
        })),
    };

    const indicadorTotal = await m.EpisodioIndicador.create({
        episodio_id: episodioId,
        control_id: controlId,
        tipo: 'RIESGO_REFRACTURA',
        valor: puntajeTotal,
        nivel,
        detalles: resumenDetalles,
        calculado_en: new Date(),
    });
    const indicadorTotalData = indicadorTotal.get({ plain: true });

    let alerta = null;
    if (nivel !== 'BAJO') {
        const severidad = nivel === 'ALTO' ? 'ALTA' : 'MEDIA';
        const accionTexto = ACTION_BY_NIVEL[nivel] || null;
        const mensajeBase = `Riesgo de refractura ${nivel.toLowerCase()} (puntaje ${puntajeTotal}).`;
        const mensaje =
            options.mensajeAlerta ||
            (accionTexto ? `${mensajeBase} ${accionTexto}` : mensajeBase);

        alerta = await m.Alerta.create({
            episodio_id: episodioId,
            tipo: 'RIESGO',
            severidad,
            mensaje,
            activa: true,
            indicador_id: indicadorTotalData.episodio_indicador_id,
        });
        alerta = alerta.get({ plain: true });
    }

    return {
        episodio_id: episodioId,
        control_id: controlId,
        contexto,
        indicadores: indicadoresGuardados,
        resumen: indicadorTotalData,
        alerta,
    };
}

async function recalcularIndicadores(episodioId, options = {}, injected = {}) {
    const m = injected.models || models;
    const controles = await m.ControlClinico.findAll({
        where: { episodio_id: episodioId },
        order: [
            ['fecha_hora_control', 'ASC'],
            ['control_id', 'ASC'],
        ],
        include: [
            {
                model: m.Episodio,
                include: [
                    {
                        model: m.Paciente,
                        required: false,
                        include: [
                            { model: m.User, as: 'user', required: false },
                        ],
                    },
                    { model: m.Antropometria, required: false },
                    { model: m.ControlClinico, required: false },
                ],
            },
        ],
    });

    if (!controles.length) {
        // Si no existen controles, usar la función específica para episodios sin controles
        const data = await recalcularIndicadoresEpisodio(episodioId, options, {
            models: m,
        });
        return { episodio_id: episodioId, controles: [data] };
    }

    const resultados = [];
    for (const control of controles) {
        const data = await recalcularIndicadoresControl(
            control.control_id,
            {
                ...options,
                __controlInstance: control,
                __episodioPlain: control.Episodio,
            },
            { models: m } // mantiene inyección
        );
        resultados.push(data);
    }

    return { episodio_id: episodioId, controles: resultados };
}

module.exports = {
    recalcularIndicadores,
    recalcularIndicadoresControl,
    recalcularIndicadoresEpisodio,
};
module.exports.default = module.exports;
