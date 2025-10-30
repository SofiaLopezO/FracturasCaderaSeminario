-- scripts/remove_otro_from_episodio.sql
-- Eliminar columna 'otro' de la tabla episodio si existe (corrección de modelo)
-- La columna no debe existir; solo debe estar comentario_otro

-- Verificar si existe antes de eliminar
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'episodio' AND column_name = 'otro'
    ) THEN
        ALTER TABLE episodio DROP COLUMN otro;
        RAISE NOTICE 'Columna "otro" eliminada de tabla episodio';
    ELSE
        RAISE NOTICE 'Columna "otro" no existe en tabla episodio (correcto)';
    END IF;
END $$;

-- Verificar estructura final
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'episodio' 
  AND column_name IN ('otro', 'comentario_otro')
ORDER BY column_name;
