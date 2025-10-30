-- Migración: Agregar campos 'otro' y 'comentario_otro' a control_clinico
-- Fecha: 2025-10-29
-- Descripción: Agrega un campo booleano 'otro' y un campo de texto 'comentario_otro' 
--              para registrar información adicional en los controles clínicos

-- Agregar columna 'otro' (booleano nullable)
ALTER TABLE control_clinico 
ADD COLUMN IF NOT EXISTS otro BOOLEAN DEFAULT NULL;

-- Agregar columna 'comentario_otro' (texto nullable)
ALTER TABLE control_clinico 
ADD COLUMN IF NOT EXISTS comentario_otro TEXT DEFAULT NULL;

-- Comentarios sobre las columnas
COMMENT ON COLUMN control_clinico.otro IS 'Indica si hay información adicional/otra relevante en el control';
COMMENT ON COLUMN control_clinico.comentario_otro IS 'Comentario detallado cuando otro=true';

-- Verificar que las columnas se agregaron correctamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'control_clinico' 
  AND column_name IN ('otro', 'comentario_otro')
ORDER BY column_name;
