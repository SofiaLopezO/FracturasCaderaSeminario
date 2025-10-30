# Scripts de Migración de Registro

Este directorio contiene scripts para migrar la tabla `registro` de usar RUTs a usar IDs como claves foráneas.

## 📋 Orden de Ejecución

### 1. Migración Principal ✅ (COMPLETADO)

```bash
node scripts/migrate_registro.js
```

**Este script:**

-   ✅ Agrega las columnas `administrador_id` y `actor_user_id`
-   ✅ Migra datos existentes de RUT a ID
-   ✅ Crea índices para mejorar el rendimiento
-   ✅ Mantiene las columnas antiguas por seguridad

**Estado:** EJECUTADO EXITOSAMENTE

**Resultados:**

-   Total de registros: 1
-   Con administrador_id: 0
-   Con actor_user_id: 1
-   Índices creados correctamente

### 2. Limpieza (OPCIONAL - NO EJECUTADO)

```bash
node scripts/cleanup_registro_old_columns.js
```

**Este script:**

-   ⚠️ Elimina las columnas antiguas (`administrador_rut`, `actor_user_rut`)
-   Requiere confirmación explícita del usuario
-   Solo debe ejecutarse después de verificar que todo funciona correctamente

**¿Cuándo ejecutarlo?**

-   Después de probar exhaustivamente el sistema
-   Cuando estés 100% seguro de que la migración fue exitosa
-   Cuando no necesites hacer rollback

## 🔍 Verificación

Para verificar que la migración fue exitosa, puedes ejecutar:

```sql
-- Ver estructura de la tabla
\d registro

-- Ver registros con información completa
SELECT
    r.registro_id,
    r.accion,
    r.fecha_registro,
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
LIMIT 10;
```

## 📊 Estructura de Columnas

### Antes de la migración:

-   `registro_id` (PK)
-   `accion`
-   `fecha_registro`
-   `administrador_rut` ❌ (obsoleto)
-   `actor_user_rut` ❌ (obsoleto)

### Después de la migración:

-   `registro_id` (PK)
-   `accion`
-   `fecha_registro`
-   `administrador_id` ✅ (nuevo - FK a users.id)
-   `actor_user_id` ✅ (nuevo - FK a users.id)
-   `administrador_rut` ⚠️ (mantiene temporalmente)
-   `actor_user_rut` ⚠️ (mantiene temporalmente)

### Después de la limpieza (opcional):

-   `registro_id` (PK)
-   `accion`
-   `fecha_registro`
-   `administrador_id` ✅ (FK a users.id)
-   `actor_user_id` ✅ (FK a users.id)

## 🔗 Relaciones

Las nuevas columnas permiten las siguientes relaciones (definidas en `model/initModels.js`):

```javascript
// Usuario sobre el que se actuó (afectado)
Administrador.hasMany(Registro, { foreignKey: 'administrador_id' });
Registro.belongsTo(Administrador, { foreignKey: 'administrador_id' });

// Usuario que realizó la acción (actor)
User.hasMany(Registro, { foreignKey: 'actor_user_id' });
Registro.belongsTo(User, { foreignKey: 'actor_user_id' });
```

## 🛡️ Seguridad

-   Los scripts incluyen verificaciones y validaciones
-   La limpieza requiere confirmación explícita
-   Las columnas antiguas se mantienen hasta que decidas eliminarlas
-   Todos los cambios están respaldados por índices

## 📝 Notas

-   Los índices mejoran significativamente el rendimiento de las consultas
-   La migración es reversible si mantienes las columnas antiguas
-   Se recomienda hacer un backup antes de ejecutar la limpieza
