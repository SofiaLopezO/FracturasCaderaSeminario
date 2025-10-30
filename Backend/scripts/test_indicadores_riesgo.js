#!/usr/bin/env node
/**
 * Script de prueba para verificar el cálculo de indicadores de riesgo
 *
 * Uso:
 *   node scripts/test_indicadores_riesgo.js
 */

const models = require('../model/initModels');
const {
    evaluarRiesgo,
    CRITERIOS_RIESGO,
} = require('./recalcular_indicadores_riesgo');

async function testEvaluacion() {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  TEST DE EVALUACIÓN DE RIESGOS');
    console.log('═══════════════════════════════════════════════════════\n');

    // Casos de prueba
    const casos = [
        {
            parametro: 'VITD',
            valor: 15,
            debeActivar: true,
            descripcion: 'Vitamina D baja',
        },
        {
            parametro: 'VITD',
            valor: 25,
            debeActivar: false,
            descripcion: 'Vitamina D normal',
        },
        {
            parametro: 'ALBUMINA',
            valor: 3.0,
            debeActivar: true,
            descripcion: 'Albúmina baja',
        },
        {
            parametro: 'ALBUMINA',
            valor: 4.0,
            debeActivar: false,
            descripcion: 'Albúmina normal',
        },
        {
            parametro: 'HB',
            valor: 10,
            debeActivar: true,
            descripcion: 'Hemoglobina baja',
        },
        {
            parametro: 'HB',
            valor: 13,
            debeActivar: false,
            descripcion: 'Hemoglobina normal',
        },
        {
            parametro: 'CREATININA',
            valor: 1.5,
            debeActivar: true,
            descripcion: 'Creatinina alta',
        },
        {
            parametro: 'CREATININA',
            valor: 1.0,
            debeActivar: false,
            descripcion: 'Creatinina normal',
        },
        {
            parametro: 'NLR',
            valor: 5.0,
            debeActivar: true,
            descripcion: 'NLR elevado',
        },
        {
            parametro: 'NLR',
            valor: 3.0,
            debeActivar: false,
            descripcion: 'NLR normal',
        },
    ];

    console.log('🧪 Ejecutando casos de prueba...\n');

    let pasados = 0;
    let fallados = 0;

    for (const caso of casos) {
        const resultado = { parametro: caso.parametro, valor: caso.valor };
        const riesgo = evaluarRiesgo(resultado);

        const activado = riesgo !== null;
        const exito = activado === caso.debeActivar;

        if (exito) {
            console.log(
                `✅ ${caso.descripcion}: ${caso.parametro}=${caso.valor}`
            );
            if (riesgo) {
                console.log(
                    `   → ${riesgo.descripcion} (puntaje: ${riesgo.puntaje})`
                );
            }
            pasados++;
        } else {
            console.log(
                `❌ ${caso.descripcion}: ${caso.parametro}=${caso.valor}`
            );
            console.log(
                `   → Esperado: ${
                    caso.debeActivar ? 'activar' : 'no activar'
                }, Obtenido: ${activado ? 'activado' : 'no activado'}`
            );
            fallados++;
        }
    }

    console.log('\n─────────────────────────────────────────────────────');
    console.log(`\nResultados: ${pasados} pasados, ${fallados} fallados`);
    console.log('\n═══════════════════════════════════════════════════════\n');

    return fallados === 0;
}

async function testBaseDatos() {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  TEST DE CONSULTA A BASE DE DATOS');
    console.log('═══════════════════════════════════════════════════════\n');

    try {
        // Contar resultados
        const totalResultados = await models.Resultado.count();
        console.log(`📊 Total de resultados en BD: ${totalResultados}`);

        // Contar indicadores de riesgo existentes
        const totalIndicadores = await models.IndicadorRiesgo.count();
        console.log(
            `📊 Total de indicadores de riesgo existentes: ${totalIndicadores}`
        );

        // Obtener muestra de resultados
        const muestra = await models.Resultado.findAll({
            limit: 5,
            order: [['resultado_id', 'DESC']],
        });

        if (muestra.length > 0) {
            console.log(`\n📋 Últimos 5 resultados:\n`);
            for (const res of muestra) {
                console.log(
                    `   ID: ${res.resultado_id}, Episodio: ${
                        res.episodio_id
                    }, ${res.parametro} = ${res.valor} ${res.unidad || ''}`
                );

                const riesgo = evaluarRiesgo(res);
                if (riesgo) {
                    console.log(
                        `      ⚠️  Cumple criterio de riesgo: ${riesgo.descripcion}`
                    );
                }
            }
        }

        // Contar por parámetro
        console.log(`\n📊 Distribución de parámetros monitoreados:\n`);
        const parametrosMonitoreados = Object.values(CRITERIOS_RIESGO).map(
            (c) => c.parametro
        );

        for (const param of [...new Set(parametrosMonitoreados)]) {
            const count = await models.Resultado.count({
                where: { parametro: param },
            });
            if (count > 0) {
                console.log(`   ${param}: ${count} resultados`);
            }
        }

        console.log('\n✅ Consultas a BD exitosas');
        console.log(
            '\n═══════════════════════════════════════════════════════\n'
        );

        return true;
    } catch (error) {
        console.error('\n❌ Error en consultas a BD:', error.message);
        console.error(error);
        console.log(
            '\n═══════════════════════════════════════════════════════\n'
        );
        return false;
    }
}

async function main() {
    let exitCode = 0;

    try {
        const testEvalOk = await testEvaluacion();
        const testDbOk = await testBaseDatos();

        if (!testEvalOk || !testDbOk) {
            exitCode = 1;
        }

        if (exitCode === 0) {
            console.log('✅ Todos los tests pasaron correctamente\n');
            console.log('ℹ️  Puedes ejecutar el script completo con:');
            console.log(
                '   node scripts/recalcular_indicadores_riesgo.js --dry-run\n'
            );
        } else {
            console.log('❌ Algunos tests fallaron\n');
        }
    } catch (error) {
        console.error('\n❌ ERROR FATAL:', error.message);
        console.error(error);
        exitCode = 1;
    }

    process.exit(exitCode);
}

if (require.main === module) {
    main();
}

module.exports = { testEvaluacion, testBaseDatos };
