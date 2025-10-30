// scripts/cleanup_registro_old_columns.js
// Script para eliminar las columnas antiguas (administrador_rut, actor_user_rut)
// ⚠️  SOLO EJECUTAR DESPUÉS DE VERIFICAR QUE TODO FUNCIONA CORRECTAMENTE

require('dotenv').config();
const { sequelize } = require('../model/db');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function pregunta(query) {
    return new Promise((resolve) => rl.question(query, resolve));
}

async function cleanupOldColumns() {
    console.log(
        '⚠️  ADVERTENCIA: Este script eliminará las columnas antiguas\n'
    );
    console.log('   Columnas a eliminar:');
    console.log('   - administrador_rut');
    console.log('   - actor_user_rut\n');

    try {
        // Verificar que existen las nuevas columnas
        const queryInterface = sequelize.getQueryInterface();
        const structure = await queryInterface.describeTable('registro');

        if (!structure.administrador_id || !structure.actor_user_id) {
            console.log(
                '❌ Error: Las nuevas columnas (administrador_id, actor_user_id) no existen.'
            );
            console.log('   Ejecuta primero el script migrate_registro.js');
            process.exit(1);
        }

        // Mostrar estadísticas
        const [stats] = await sequelize.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(administrador_id) as con_admin_id,
                COUNT(actor_user_id) as con_actor_id,
                COUNT(administrador_rut) as con_admin_rut,
                COUNT(actor_user_rut) as con_actor_rut
            FROM registro;
        `);

        console.log('📊 Estadísticas actuales:');
        console.log(`   Total registros: ${stats[0].total}`);
        console.log(`   Con administrador_id: ${stats[0].con_admin_id}`);
        console.log(`   Con actor_user_id: ${stats[0].con_actor_id}`);
        console.log(`   Con administrador_rut: ${stats[0].con_admin_rut}`);
        console.log(`   Con actor_user_rut: ${stats[0].con_actor_rut}\n`);

        const respuesta = await pregunta(
            '¿Estás seguro de eliminar las columnas antiguas? (escribe "SI" para confirmar): '
        );

        if (respuesta.trim().toUpperCase() !== 'SI') {
            console.log('\n❌ Operación cancelada por el usuario');
            process.exit(0);
        }

        console.log('\n🗑️  Eliminando columnas antiguas...');

        if (structure.administrador_rut) {
            await sequelize.query(
                `ALTER TABLE registro DROP COLUMN administrador_rut;`
            );
            console.log('✅ Columna administrador_rut eliminada');
        }

        if (structure.actor_user_rut) {
            await sequelize.query(
                `ALTER TABLE registro DROP COLUMN actor_user_rut;`
            );
            console.log('✅ Columna actor_user_rut eliminada');
        }

        console.log('\n✅ Limpieza completada exitosamente!');

        // Verificar estructura final
        const finalStructure = await queryInterface.describeTable('registro');
        console.log('\n📋 Estructura final de la tabla:');
        console.log('   Columnas:', Object.keys(finalStructure).join(', '));
    } catch (error) {
        console.error('\n❌ Error durante la limpieza:', error);
        throw error;
    } finally {
        rl.close();
        await sequelize.close();
    }
}

// Ejecutar limpieza
cleanupOldColumns()
    .then(() => {
        console.log('\n👍 Proceso completado');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Error fatal:', error);
        process.exit(1);
    });
