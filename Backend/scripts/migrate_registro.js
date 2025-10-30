// scripts/migrate_registro.js
// Script para migrar la tabla registro de RUTs a IDs

require('dotenv').config();
const { sequelize } = require('../model/db');

async function migrateRegistro() {
    const queryInterface = sequelize.getQueryInterface();

    console.log('🔄 Iniciando migración de tabla registro...\n');

    try {
        // PASO 1: Verificar estructura actual
        console.log('📋 Verificando estructura actual de la tabla...');
        const currentStructure = await queryInterface.describeTable('registro');
        console.log('Columnas actuales:', Object.keys(currentStructure));

        // PASO 2: Agregar nuevas columnas si no existen
        console.log(
            '\n📝 Agregando nuevas columnas (administrador_id, actor_user_id)...'
        );

        if (!currentStructure.administrador_id) {
            await sequelize.query(`
                ALTER TABLE registro 
                ADD COLUMN administrador_id INTEGER REFERENCES users(id);
            `);
            console.log('✅ Columna administrador_id agregada');
        } else {
            console.log('ℹ️  Columna administrador_id ya existe');
        }

        if (!currentStructure.actor_user_id) {
            await sequelize.query(`
                ALTER TABLE registro 
                ADD COLUMN actor_user_id INTEGER REFERENCES users(id);
            `);
            console.log('✅ Columna actor_user_id agregada');
        } else {
            console.log('ℹ️  Columna actor_user_id ya existe');
        }

        // PASO 3: Migrar datos si existen columnas antiguas
        if (currentStructure.administrador_rut) {
            console.log(
                '\n🔄 Migrando datos de administrador_rut a administrador_id...'
            );
            const [results] = await sequelize.query(`
                UPDATE registro r
                SET administrador_id = u.id
                FROM users u
                WHERE r.administrador_rut IS NOT NULL 
                  AND u.rut = r.administrador_rut
                  AND r.administrador_id IS NULL;
            `);
            console.log(`✅ ${results.rowCount || 0} registros migrados`);
        }

        if (currentStructure.actor_user_rut) {
            console.log(
                '\n🔄 Migrando datos de actor_user_rut a actor_user_id...'
            );
            const [results] = await sequelize.query(`
                UPDATE registro r
                SET actor_user_id = u.id
                FROM users u
                WHERE r.actor_user_rut IS NOT NULL 
                  AND u.rut = r.actor_user_rut
                  AND r.actor_user_id IS NULL;
            `);
            console.log(`✅ ${results.rowCount || 0} registros migrados`);
        }

        // PASO 4: Crear índices
        console.log('\n📊 Creando índices...');

        try {
            await sequelize.query(`
                CREATE INDEX IF NOT EXISTS idx_registro_administrador_id 
                ON registro(administrador_id);
            `);
            console.log('✅ Índice idx_registro_administrador_id creado');
        } catch (e) {
            console.log('ℹ️  Índice idx_registro_administrador_id ya existe');
        }

        try {
            await sequelize.query(`
                CREATE INDEX IF NOT EXISTS idx_registro_actor_user_id 
                ON registro(actor_user_id);
            `);
            console.log('✅ Índice idx_registro_actor_user_id creado');
        } catch (e) {
            console.log('ℹ️  Índice idx_registro_actor_user_id ya existe');
        }

        try {
            await sequelize.query(`
                CREATE INDEX IF NOT EXISTS idx_registro_fecha 
                ON registro(fecha_registro DESC);
            `);
            console.log('✅ Índice idx_registro_fecha creado');
        } catch (e) {
            console.log('ℹ️  Índice idx_registro_fecha ya existe');
        }

        // PASO 5: Verificación
        console.log('\n🔍 Verificando migración...');
        const [verificacion] = await sequelize.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(administrador_id) as con_admin_id,
                COUNT(actor_user_id) as con_actor_id
            FROM registro;
        `);

        console.log('\n📈 Estadísticas:');
        console.log(`   Total de registros: ${verificacion[0].total}`);
        console.log(`   Con administrador_id: ${verificacion[0].con_admin_id}`);
        console.log(`   Con actor_user_id: ${verificacion[0].con_actor_id}`);

        // Muestra de registros migrados
        if (verificacion[0].total > 0) {
            console.log('\n📋 Muestra de registros migrados (últimos 5):');
            const [muestra] = await sequelize.query(`
                SELECT 
                    r.registro_id,
                    r.accion,
                    r.administrador_id,
                    u1.rut as admin_rut,
                    u1.nombres || ' ' || u1.apellido_paterno as admin_nombre,
                    r.actor_user_id,
                    u2.rut as actor_rut,
                    u2.nombres || ' ' || u2.apellido_paterno as actor_nombre
                FROM registro r
                LEFT JOIN users u1 ON r.administrador_id = u1.id
                LEFT JOIN users u2 ON r.actor_user_id = u2.id
                ORDER BY r.registro_id DESC
                LIMIT 5;
            `);

            muestra.forEach((reg) => {
                console.log(`\n   ID: ${reg.registro_id}`);
                console.log(`   Acción: ${reg.accion}`);
                console.log(
                    `   Afectado: ${reg.admin_nombre || 'N/A'} (ID: ${
                        reg.administrador_id || 'N/A'
                    })`
                );
                console.log(
                    `   Actor: ${reg.actor_nombre || 'N/A'} (ID: ${
                        reg.actor_user_id || 'N/A'
                    })`
                );
            });
        }

        console.log('\n✅ Migración completada exitosamente!\n');
        console.log(
            '⚠️  NOTA: Las columnas antiguas (administrador_rut, actor_user_rut) se mantienen'
        );
        console.log(
            '   por seguridad. Puedes eliminarlas manualmente después de verificar.'
        );
    } catch (error) {
        console.error('\n❌ Error durante la migración:', error);
        throw error;
    } finally {
        await sequelize.close();
    }
}

// Ejecutar migración
migrateRegistro()
    .then(() => {
        console.log('👍 Proceso completado');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Error fatal:', error);
        process.exit(1);
    });
