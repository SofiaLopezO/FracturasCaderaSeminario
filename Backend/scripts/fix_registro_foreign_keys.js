// scripts/fix_registro_foreign_keys.js
// Script para corregir las foreign keys de la tabla registro
// El problema: administrador_id apunta a 'administradores' cuando debería apuntar a 'users'

require('dotenv').config();
const { sequelize } = require('../model/db');

async function fixForeignKeys() {
    console.log('🔧 Corrigiendo foreign keys de la tabla registro...\n');

    try {
        // Verificar constraint actual
        console.log('📋 Verificando constraints actuales...');
        const [constraints] = await sequelize.query(`
            SELECT
                tc.constraint_name,
                tc.table_name,
                kcu.column_name,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name
            FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage AS ccu
                ON ccu.constraint_name = tc.constraint_name
            WHERE tc.table_name = 'registro' 
                AND tc.constraint_type = 'FOREIGN KEY';
        `);

        console.log('Constraints actuales:');
        constraints.forEach((c) => {
            console.log(
                `  - ${c.constraint_name}: ${c.column_name} -> ${c.foreign_table_name}(${c.foreign_column_name})`
            );
        });

        // Eliminar constraint incorrecta si existe
        console.log('\n🗑️  Eliminando constraint incorrecta...');
        const wrongConstraint = constraints.find(
            (c) =>
                c.column_name === 'administrador_id' &&
                c.foreign_table_name === 'administradores'
        );

        if (wrongConstraint) {
            await sequelize.query(`
                ALTER TABLE registro 
                DROP CONSTRAINT IF EXISTS ${wrongConstraint.constraint_name};
            `);
            console.log(
                `✅ Constraint ${wrongConstraint.constraint_name} eliminada`
            );
        } else {
            console.log('ℹ️  No se encontró constraint incorrecta');
        }

        // Eliminar otras constraints relacionadas para recrearlas correctamente
        await sequelize.query(`
            ALTER TABLE registro 
            DROP CONSTRAINT IF EXISTS registro_administrador_id_fkey;
        `);
        await sequelize.query(`
            ALTER TABLE registro 
            DROP CONSTRAINT IF EXISTS registro_actor_user_id_fkey;
        `);
        console.log('✅ Constraints antiguas eliminadas');

        // Crear constraints correctas
        console.log('\n✨ Creando constraints correctas...');

        // administrador_id apunta a users.id (no a administradores)
        await sequelize.query(`
            ALTER TABLE registro 
            ADD CONSTRAINT registro_administrador_id_fkey 
            FOREIGN KEY (administrador_id) 
            REFERENCES users(id) 
            ON DELETE SET NULL;
        `);
        console.log('✅ FK administrador_id -> users(id) creada');

        // actor_user_id apunta a users.id
        await sequelize.query(`
            ALTER TABLE registro 
            ADD CONSTRAINT registro_actor_user_id_fkey 
            FOREIGN KEY (actor_user_id) 
            REFERENCES users(id) 
            ON DELETE SET NULL;
        `);
        console.log('✅ FK actor_user_id -> users(id) creada');

        // Verificar constraints finales
        console.log('\n🔍 Verificando constraints finales...');
        const [finalConstraints] = await sequelize.query(`
            SELECT
                tc.constraint_name,
                tc.table_name,
                kcu.column_name,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name
            FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage AS ccu
                ON ccu.constraint_name = tc.constraint_name
            WHERE tc.table_name = 'registro' 
                AND tc.constraint_type = 'FOREIGN KEY';
        `);

        console.log('\n📊 Constraints finales:');
        finalConstraints.forEach((c) => {
            console.log(
                `  ✅ ${c.constraint_name}: ${c.column_name} -> ${c.foreign_table_name}(${c.foreign_column_name})`
            );
        });

        console.log('\n✅ Foreign keys corregidas exitosamente!');
        console.log('\n📝 Ahora:');
        console.log(
            '   - administrador_id apunta a users.id (usuario afectado por la acción)'
        );
        console.log(
            '   - actor_user_id apunta a users.id (usuario que realizó la acción)'
        );
    } catch (error) {
        console.error('\n❌ Error durante la corrección:', error);
        throw error;
    } finally {
        await sequelize.close();
    }
}

// Ejecutar corrección
fixForeignKeys()
    .then(() => {
        console.log('\n👍 Proceso completado');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Error fatal:', error);
        process.exit(1);
    });
