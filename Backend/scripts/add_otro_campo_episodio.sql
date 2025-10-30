-- Migración: Agregar campos 'otro' y 'comentario_otro' a episodio
-- Fecha: 2025-10-29
-- Descripción: Agrega un campo booleano 'otro' y un campo de texto 'comentario_otro' 
--              para registrar información adicional en episodios

-- Agregar columna 'otro' (booleano nullable)
ALTER TABLE episodio 
ADD COLUMN IF NOT EXISTS otro BOOLEAN DEFAULT NULL;

-- Agregar columna 'comentario_otro' (texto nullable)
ALTER TABLE episodio 
ADD COLUMN IF NOT EXISTS comentario_otro TEXT DEFAULT NULL;

-- Comentarios sobre las columnas
COMMENT ON COLUMN episodio.otro IS 'Indica si hay información adicional/otra relevante en el episodio';
COMMENT ON COLUMN episodio.comentario_otro IS 'Comentario detallado cuando otro=true en el episodio';

-- Verificar que las columnas se agregaron correctamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'episodio' 
  AND column_name IN ('otro', 'comentario_otro')
ORDER BY column_name;
