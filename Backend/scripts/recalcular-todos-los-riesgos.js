#!/usr/bin/env node
/**
 * Script para recalcular todos los indicadores de riesgo
 *
 * Este script revisa todos los episodios en la base de datos y:
 * 1. Para cada episodio CON controles: calcula riesgos para cada control
 * 2. Para cada episodio SIN controles: calcula riesgos a nivel de episodio
 * 3. Almacena los resultados en la tabla episodio_indicador
 * 4. Genera alertas según el nivel de riesgo (MODERADO/ALTO)
 *
 * Uso:
 *   node scripts/recalcular-todos-los-riesgos.js [opciones]
 *
 * Opciones:
 *   --dry-run           Simula el proceso sin hacer cambios en BD
 *   --episodio=ID       Procesa solo el episodio especificado
 *   --limit=N           Procesa solo los primeros N episodios
 *   --skip=N            Omite los primeros N episodios
 *   --verbose           Muestra información detallada de cada cálculo
 *   --quiet             Solo muestra errores y resumen final
 *
 * Ejemplos:
 *   node scripts/recalcular-todos-los-riesgos.js
 *   node scripts/recalcular-todos-los-riesgos.js --dry-run --verbose
 *   node scripts/recalcular-todos-los-riesgos.js --episodio=123
 *   node scripts/recalcular-todos-los-riesgos.js --limit=50 --skip=100
 */

const path = require('path');
const models = require('../model/initModels');
const {
    recalcularIndicadores,
} = require('../services/riesgoRefracturaService');

// ========== Configuración ==========
const CONFIG = {
    dryRun: false,
    verbose: false,
    quiet: false,
    episodioId: null,
    limit: null,
    skip: null,
    batchSize: 10, // Procesar de a 10 episodios para evitar sobrecarga de memoria
};

// ========== Colores para consola ==========
const COLORS = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
};

// ========== Utilidades de logging ==========
function log(message, color = '') {
    if (!CONFIG.quiet) {
        console.log(`${color}${message}${COLORS.reset}`);
    }
}

function logVerbose(message, color = COLORS.dim) {
    if (CONFIG.verbose && !CONFIG.quiet) {
        console.log(`${color}${message}${COLORS.reset}`);
    }
}

function logError(message) {
    console.error(`${COLORS.red}❌ ERROR: ${message}${COLORS.reset}`);
}

function logSuccess(message) {
    log(`${COLORS.green}✓ ${message}${COLORS.reset}`);
}

function logWarning(message) {
    log(`${COLORS.yellow}⚠ ${message}${COLORS.reset}`);
}

function logInfo(message) {
    log(`${COLORS.cyan}ℹ ${message}${COLORS.reset}`);
}

function logTitle(message) {
    log(
        `\n${COLORS.bright}${COLORS.blue}═══════════════════════════════════════════════════════${COLORS.reset}`
    );
    log(`${COLORS.bright}${COLORS.blue}  ${message}${COLORS.reset}`);
    log(
        `${COLORS.bright}${COLORS.blue}═══════════════════════════════════════════════════════${COLORS.reset}\n`
    );
}

// ========== Estadísticas ==========
const stats = {
    totalEpisodios: 0,
    episodiosConControles: 0,
    episodiosSinControles: 0,
    totalControlesProcesados: 0,
    episodiosConRiesgoBajo: 0,
    episodiosConRiesgoModerado: 0,
    episodiosConRiesgoAlto: 0,
    alertasGeneradas: 0,
    errores: 0,
    tiempoInicio: Date.now(),
    erroresDetalle: [],
};

// ========== Procesamiento de argumentos ==========
function parseArgs() {
    const args = process.argv.slice(2);

    for (const arg of args) {
        if (arg === '--dry-run') {
            CONFIG.dryRun = true;
        } else if (arg === '--verbose') {
            CONFIG.verbose = true;
        } else if (arg === '--quiet') {
            CONFIG.quiet = true;
        } else if (arg.startsWith('--episodio=')) {
            CONFIG.episodioId = parseInt(arg.split('=')[1], 10);
        } else if (arg.startsWith('--limit=')) {
            CONFIG.limit = parseInt(arg.split('=')[1], 10);
        } else if (arg.startsWith('--skip=')) {
            CONFIG.skip = parseInt(arg.split('=')[1], 10);
        } else if (arg === '--help' || arg === '-h') {
            mostrarAyuda();
            process.exit(0);
        } else {
            logWarning(`Argumento desconocido: ${arg}`);
        }
    }

    // Validaciones
    if (CONFIG.episodioId && (CONFIG.limit || CONFIG.skip)) {
        logWarning(
            'Las opciones --limit y --skip se ignoran cuando se usa --episodio'
        );
        CONFIG.limit = null;
        CONFIG.skip = null;
    }

    if (CONFIG.verbose && CONFIG.quiet) {
        logWarning(
            'No se puede usar --verbose y --quiet al mismo tiempo. Se usará --verbose'
        );
        CONFIG.quiet = false;
    }
}

function mostrarAyuda() {
    console.log(`
${COLORS.bright}Recalcular Todos los Riesgos${COLORS.reset}

Este script recalcula los indicadores de riesgo de refractura para todos los 
episodios y controles en la base de datos.

${COLORS.bright}Uso:${COLORS.reset}
  node scripts/recalcular-todos-los-riesgos.js [opciones]

${COLORS.bright}Opciones:${COLORS.reset}
  --dry-run           Simula el proceso sin hacer cambios en BD
  --episodio=ID       Procesa solo el episodio especificado
  --limit=N           Procesa solo los primeros N episodios
  --skip=N            Omite los primeros N episodios
  --verbose           Muestra información detallada de cada cálculo
  --quiet             Solo muestra errores y resumen final
  --help, -h          Muestra esta ayuda

${COLORS.bright}Ejemplos:${COLORS.reset}
  # Recalcular todos los episodios
  node scripts/recalcular-todos-los-riesgos.js

  # Modo de prueba (sin cambios en BD)
  node scripts/recalcular-todos-los-riesgos.js --dry-run --verbose

  # Recalcular un episodio específico
  node scripts/recalcular-todos-los-riesgos.js --episodio=123

  # Procesar los episodios 100-150
  node scripts/recalcular-todos-los-riesgos.js --skip=100 --limit=50

${COLORS.bright}Qué hace el script:${COLORS.reset}
  1. Busca todos los episodios en la base de datos
  2. Para cada episodio:
     - Si tiene controles: calcula riesgos para cada control
     - Si no tiene controles: calcula riesgos a nivel de episodio
  3. Guarda los indicadores en episodio_indicador
  4. Genera alertas automáticas para riesgo MODERADO/ALTO
  5. Muestra estadísticas del proceso

${COLORS.bright}Factores de riesgo evaluados:${COLORS.reset}
  - Edad >= 80 años
  - Sexo femenino
  - Fracturas previas por fragilidad
  - Vitamina D < 20 ng/mL
  - Albúmina < 3.5 g/dL
  - Hemoglobina < 11 g/dL
  - Creatinina >= 1.3 mg/dL
  - NLR > 4.5, MLR > 0.35
  - Comorbilidades >= 2
  - Barthel <= 30
  - IMC <= 18.5
  - Tabaquismo, corticoides, alcohol
  - Fractura subcapital desplazada
  - Retraso quirúrgico > 48 horas
  `);
}

// ========== Función principal de procesamiento ==========
async function procesarEpisodio(episodioId) {
    try {
        logVerbose(
            `\n${COLORS.cyan}→ Procesando episodio ${episodioId}...${COLORS.reset}`
        );

        // Verificar si el episodio existe
        const episodio = await models.Episodio.findByPk(episodioId, {
            include: [{ model: models.ControlClinico, required: false }],
        });

        if (!episodio) {
            logWarning(`Episodio ${episodioId} no encontrado. Omitiendo.`);
            return { exito: false, motivo: 'no_encontrado' };
        }

        const episodioData = episodio.get({ plain: true });
        const controles = episodioData.ControlClinicos || [];
        const tieneControles = controles.length > 0;

        if (CONFIG.dryRun) {
            logVerbose(
                `  [DRY-RUN] Episodio ${episodioId} ${
                    tieneControles
                        ? `con ${controles.length} control(es)`
                        : 'sin controles'
                }`
            );
            return { exito: true, dryRun: true, controles: controles.length };
        }

        // Recalcular indicadores usando el servicio existente
        const resultado = await recalcularIndicadores(episodioId);

        // Analizar resultados
        const controlesResultados = resultado.controles || [];
        let nivelMasAlto = 'BAJO';
        let alertasEnEsteEpisodio = 0;

        for (const controlResult of controlesResultados) {
            if (controlResult.alerta) {
                alertasEnEsteEpisodio++;
            }

            const nivel = controlResult.resumen?.nivel || 'BAJO';
            if (nivel === 'ALTO') {
                nivelMasAlto = 'ALTO';
            } else if (nivel === 'MODERADO' && nivelMasAlto !== 'ALTO') {
                nivelMasAlto = 'MODERADO';
            }

            if (CONFIG.verbose) {
                const controlId = controlResult.control_id || 'episodio';
                const puntaje = controlResult.resumen?.valor || 0;
                logVerbose(
                    `  Control ${controlId}: Nivel ${nivel}, Puntaje ${puntaje}`
                );
            }
        }

        // Actualizar estadísticas
        if (tieneControles) {
            stats.episodiosConControles++;
            stats.totalControlesProcesados += controles.length;
        } else {
            stats.episodiosSinControles++;
        }

        if (nivelMasAlto === 'BAJO') stats.episodiosConRiesgoBajo++;
        else if (nivelMasAlto === 'MODERADO')
            stats.episodiosConRiesgoModerado++;
        else if (nivelMasAlto === 'ALTO') stats.episodiosConRiesgoAlto++;

        stats.alertasGeneradas += alertasEnEsteEpisodio;

        logVerbose(
            `  ${COLORS.green}✓ Episodio ${episodioId} procesado. Nivel: ${nivelMasAlto}, Alertas: ${alertasEnEsteEpisodio}${COLORS.reset}`
        );

        return {
            exito: true,
            episodioId,
            controles: controles.length,
            nivel: nivelMasAlto,
            alertas: alertasEnEsteEpisodio,
        };
    } catch (error) {
        stats.errores++;
        stats.erroresDetalle.push({
            episodioId,
            error: error.message,
            stack: error.stack,
        });

        logError(`Error procesando episodio ${episodioId}: ${error.message}`);
        logVerbose(error.stack);

        return { exito: false, episodioId, error: error.message };
    }
}

// ========== Procesamiento por lotes ==========
async function procesarEpisodiosEnLotes(episodios) {
    const total = episodios.length;
    let procesados = 0;
    const resultados = [];

    logInfo(
        `Procesando ${total} episodio(s) en lotes de ${CONFIG.batchSize}...`
    );

    for (let i = 0; i < total; i += CONFIG.batchSize) {
        const lote = episodios.slice(i, i + CONFIG.batchSize);
        const promesas = lote.map((ep) => procesarEpisodio(ep.episodio_id));

        const resultadosLote = await Promise.all(promesas);
        resultados.push(...resultadosLote);

        procesados += lote.length;
        const porcentaje = ((procesados / total) * 100).toFixed(1);

        if (!CONFIG.quiet && !CONFIG.verbose) {
            process.stdout.write(
                `\r${COLORS.cyan}Progreso: ${procesados}/${total} (${porcentaje}%)${COLORS.reset}`
            );
        }
    }

    if (!CONFIG.quiet && !CONFIG.verbose) {
        process.stdout.write('\n');
    }

    return resultados;
}

// ========== Obtener episodios a procesar ==========
async function obtenerEpisodios() {
    const whereClause = {};
    const options = {
        attributes: ['episodio_id'],
        order: [['episodio_id', 'ASC']],
    };

    if (CONFIG.episodioId) {
        whereClause.episodio_id = CONFIG.episodioId;
    }

    if (CONFIG.limit) {
        options.limit = CONFIG.limit;
    }

    if (CONFIG.skip) {
        options.offset = CONFIG.skip;
    }

    options.where = whereClause;

    const episodios = await models.Episodio.findAll(options);
    return episodios.map((e) => e.get({ plain: true }));
}

// ========== Mostrar resumen final ==========
function mostrarResumen() {
    const tiempoTotal = ((Date.now() - stats.tiempoInicio) / 1000).toFixed(2);
    const promedioTiempo =
        stats.totalEpisodios > 0
            ? (tiempoTotal / stats.totalEpisodios).toFixed(2)
            : 0;

    logTitle('RESUMEN DE PROCESAMIENTO');

    console.log(`${COLORS.bright}Episodios:${COLORS.reset}`);
    console.log(`  Total procesados:       ${stats.totalEpisodios}`);
    console.log(`  Con controles:          ${stats.episodiosConControles}`);
    console.log(`  Sin controles:          ${stats.episodiosSinControles}`);
    console.log(`  Controles procesados:   ${stats.totalControlesProcesados}`);

    console.log(`\n${COLORS.bright}Niveles de riesgo:${COLORS.reset}`);
    console.log(
        `  ${COLORS.green}Riesgo BAJO:${COLORS.reset}       ${stats.episodiosConRiesgoBajo}`
    );
    console.log(
        `  ${COLORS.yellow}Riesgo MODERADO:${COLORS.reset}   ${stats.episodiosConRiesgoModerado}`
    );
    console.log(
        `  ${COLORS.red}Riesgo ALTO:${COLORS.reset}       ${stats.episodiosConRiesgoAlto}`
    );

    console.log(`\n${COLORS.bright}Alertas:${COLORS.reset}`);
    console.log(`  Alertas generadas:      ${stats.alertasGeneradas}`);

    console.log(`\n${COLORS.bright}Rendimiento:${COLORS.reset}`);
    console.log(`  Tiempo total:           ${tiempoTotal}s`);
    console.log(`  Tiempo promedio/ep:     ${promedioTiempo}s`);

    if (stats.errores > 0) {
        console.log(`\n${COLORS.bright}${COLORS.red}Errores:${COLORS.reset}`);
        console.log(`  Total de errores:       ${stats.errores}`);

        if (CONFIG.verbose) {
            console.log(`\n${COLORS.bright}Detalle de errores:${COLORS.reset}`);
            stats.erroresDetalle.slice(0, 10).forEach((err, idx) => {
                console.log(`\n  ${idx + 1}. Episodio ${err.episodioId}:`);
                console.log(`     ${COLORS.red}${err.error}${COLORS.reset}`);
            });

            if (stats.erroresDetalle.length > 10) {
                console.log(
                    `\n  ... y ${
                        stats.erroresDetalle.length - 10
                    } error(es) más`
                );
            }
        }
    }

    console.log('');

    if (CONFIG.dryRun) {
        logWarning(
            'MODO DRY-RUN: No se realizaron cambios en la base de datos'
        );
    }

    if (stats.errores === 0) {
        logSuccess('Proceso completado exitosamente');
    } else if (stats.errores < stats.totalEpisodios) {
        logWarning(`Proceso completado con ${stats.errores} error(es)`);
    } else {
        logError('Proceso completado con errores críticos');
    }
}

// ========== Función principal ==========
async function main() {
    try {
        parseArgs();

        logTitle('RECALCULO DE INDICADORES DE RIESGO');

        if (CONFIG.dryRun) {
            logWarning('MODO DRY-RUN ACTIVADO - No se harán cambios en la BD');
        }

        if (CONFIG.episodioId) {
            logInfo(`Procesando episodio específico: ${CONFIG.episodioId}`);
        } else {
            logInfo('Obteniendo episodios a procesar...');
        }

        // Obtener episodios
        const episodios = await obtenerEpisodios();
        stats.totalEpisodios = episodios.length;

        if (episodios.length === 0) {
            logWarning('No se encontraron episodios para procesar');
            return;
        }

        logInfo(`Se procesarán ${episodios.length} episodio(s)`);

        // Procesar episodios
        const resultados = await procesarEpisodiosEnLotes(episodios);

        // Mostrar resumen
        mostrarResumen();

        // Código de salida
        const exitCode = stats.errores > 0 ? 1 : 0;
        process.exit(exitCode);
    } catch (error) {
        logError(`Error crítico en el script: ${error.message}`);
        console.error(error.stack);
        process.exit(1);
    }
}

// ========== Manejo de señales ==========
process.on('SIGINT', () => {
    console.log('\n');
    logWarning('Proceso interrumpido por el usuario');
    mostrarResumen();
    process.exit(130);
});

process.on('unhandledRejection', (error) => {
    logError(`Promesa rechazada no manejada: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
});

// ========== Ejecutar ==========
if (require.main === module) {
    main();
}

module.exports = { procesarEpisodio, main };
