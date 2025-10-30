-- Migración: Cambiar registro de usar RUTs a usar IDs
-- Fecha: 2025-10-29
-- Descripción: Actualiza la tabla registro para usar referencias por ID en lugar de RUT

-- PASO 1: Agregar las nuevas columnas con IDs (si no existen)
ALTER TABLE registro 
ADD COLUMN IF NOT EXISTS administrador_id INTEGER REFERENCES users(id),
ADD COLUMN IF NOT EXISTS actor_user_id INTEGER REFERENCES users(id);

-- PASO 2: Migrar datos existentes de RUT a ID (si hay datos en las columnas antiguas)
-- Convertir administrador_rut a administrador_id
UPDATE registro r
SET administrador_id = u.id
FROM users u
WHERE r.administrador_rut IS NOT NULL 
  AND u.rut = r.administrador_rut
  AND r.administrador_id IS NULL;

-- Convertir actor_user_rut a actor_user_id
UPDATE registro r
SET actor_user_id = u.id
FROM users u
WHERE r.actor_user_rut IS NOT NULL 
  AND u.rut = r.actor_user_rut
  AND r.actor_user_id IS NULL;

-- PASO 3: Eliminar las columnas antiguas (OPCIONAL - comentado por seguridad)
-- Solo ejecutar después de verificar que la migración fue exitosa
-- ALTER TABLE registro DROP COLUMN IF EXISTS administrador_rut;
-- ALTER TABLE registro DROP COLUMN IF EXISTS actor_user_rut;

-- PASO 4: Crear índices para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_registro_administrador_id ON registro(administrador_id);
CREATE INDEX IF NOT EXISTS idx_registro_actor_user_id ON registro(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_registro_fecha ON registro(fecha_registro DESC);

-- VERIFICACIÓN: Consultar registros para verificar la migración
-- SELECT 
--   r.registro_id,
--   r.accion,
--   r.fecha_registro,
--   r.administrador_id,
--   u1.rut as administrador_rut,
--   u1.nombres || ' ' || u1.apellido_paterno as administrador_nombre,
--   r.actor_user_id,
--   u2.rut as actor_rut,
--   u2.nombres || ' ' || u2.apellido_paterno as actor_nombre
-- FROM registro r
-- LEFT JOIN users u1 ON r.administrador_id = u1.id
-- LEFT JOIN users u2 ON r.actor_user_id = u2.id
-- ORDER BY r.registro_id DESC
-- LIMIT 10;
