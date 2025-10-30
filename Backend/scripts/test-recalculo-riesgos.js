#!/usr/bin/env node
/**
 * Script de prueba rápida para el recálculo de riesgos
 *
 * Este script ejecuta una prueba simple del sistema de cálculo de riesgos
 * sin afectar la base de datos real.
 */

const models = require('../model/initModels');
const {
    recalcularIndicadores,
    recalcularIndicadoresEpisodio,
} = require('../services/riesgoRefracturaService');

async function probarRecalculo() {
    console.log('🔍 Buscando episodios en la base de datos...\n');

    try {
        // Obtener un episodio de ejemplo
        const episodios = await models.Episodio.findAll({
            limit: 5,
            order: [['episodio_id', 'ASC']],
            include: [
                { model: models.ControlClinico, required: false },
                {
                    model: models.Paciente,
                    required: false,
                    include: [
                        { model: models.User, as: 'user', required: false },
                    ],
                },
            ],
        });

        if (episodios.length === 0) {
            console.log('⚠️  No se encontraron episodios en la base de datos.');
            return;
        }

        console.log(`✓ Encontrados ${episodios.length} episodio(s)\n`);

        for (const episodio of episodios) {
            const ep = episodio.get({ plain: true });
            const controles = ep.ControlClinicos || [];

            console.log(`\n${'='.repeat(60)}`);
            console.log(`📋 Episodio ID: ${ep.episodio_id}`);
            console.log(`   Paciente ID: ${ep.paciente_id}`);
            console.log(`   Tipo fractura: ${ep.tipo_fractura || 'N/A'}`);
            console.log(`   Controles: ${controles.length}`);
            console.log(`${'='.repeat(60)}\n`);

            console.log('🔄 Calculando riesgos...');

            const resultado = await recalcularIndicadores(ep.episodio_id);

            console.log('\n📊 Resultados:');

            if (resultado.controles && resultado.controles.length > 0) {
                resultado.controles.forEach((control, idx) => {
                    const resumen = control.resumen || {};
                    const nivel = resumen.nivel || 'DESCONOCIDO';
                    const puntaje = resumen.valor || 0;
                    const controlId = control.control_id || 'episodio';

                    let nivelColor = '';
                    if (nivel === 'BAJO') nivelColor = '\x1b[32m'; // verde
                    else if (nivel === 'MODERADO')
                        nivelColor = '\x1b[33m'; // amarillo
                    else if (nivel === 'ALTO') nivelColor = '\x1b[31m'; // rojo

                    console.log(`\n  Control ${controlId}:`);
                    console.log(`    Nivel: ${nivelColor}${nivel}\x1b[0m`);
                    console.log(`    Puntaje: ${puntaje}`);

                    if (control.alerta) {
                        console.log(
                            `    🚨 Alerta generada: ${control.alerta.severidad}`
                        );
                    }

                    if (control.indicadores && control.indicadores.length > 0) {
                        const factoresCumplen = control.indicadores.filter(
                            (i) => i.valor > 0
                        );
                        console.log(
                            `    Factores que cumplen: ${factoresCumplen.length}/${control.indicadores.length}`
                        );

                        if (factoresCumplen.length > 0) {
                            console.log(`    Factores de riesgo detectados:`);
                            factoresCumplen.forEach((factor) => {
                                const detalles = factor.detalles || {};
                                console.log(
                                    `      - ${factor.tipo}: +${factor.valor} puntos`
                                );
                                if (detalles.mensaje) {
                                    console.log(
                                        `        ${detalles.mensaje.substring(
                                            0,
                                            60
                                        )}...`
                                    );
                                }
                            });
                        }
                    }
                });
            } else {
                console.log('  No se procesaron controles');
            }
        }

        console.log('\n\n✅ Prueba completada exitosamente\n');
        console.log('💡 Para procesar todos los episodios, ejecuta:');
        console.log('   node scripts/recalcular-todos-los-riesgos.js\n');
    } catch (error) {
        console.error('\n❌ Error durante la prueba:');
        console.error(error.message);
        console.error(error.stack);
    }
}

// Ejecutar
if (require.main === module) {
    probarRecalculo()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('Error fatal:', error);
            process.exit(1);
        });
}

module.exports = { probarRecalculo };
