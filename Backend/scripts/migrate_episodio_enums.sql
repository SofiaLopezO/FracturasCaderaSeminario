-- scripts/migrate_episodio_enums.sql
-- Migración para agregar nuevos valores a los ENUMs de episodio
-- Fecha: 2025-10-29

-- 1. Agregar S00.0 al ENUM de cie10 (si no existe)
DO $$ 
BEGIN
    -- Verificar si el valor ya existe
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'S00.0' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_episodio_cie10')
    ) THEN
        ALTER TYPE enum_episodio_cie10 ADD VALUE 'S00.0';
        RAISE NOTICE 'Valor S00.0 agregado a enum_episodio_cie10';
    ELSE
        RAISE NOTICE 'Valor S00.0 ya existe en enum_episodio_cie10';
    END IF;
END $$;

-- 2. Agregar EXTRACAPSULAR al ENUM de tipo_fractura (si no existe)
DO $$ 
BEGIN
    -- Verificar si el valor ya existe
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'EXTRACAPSULAR' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_episodio_tipo_fractura')
    ) THEN
        ALTER TYPE enum_episodio_tipo_fractura ADD VALUE 'EXTRACAPSULAR';
        RAISE NOTICE 'Valor EXTRACAPSULAR agregado a enum_episodio_tipo_fractura';
    ELSE
        RAISE NOTICE 'Valor EXTRACAPSULAR ya existe en enum_episodio_tipo_fractura';
    END IF;
END $$;

-- Verificar valores actuales de los ENUMs
SELECT 'enum_episodio_cie10' as enum_name, enumlabel as value
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_episodio_cie10')
ORDER BY enumsortorder;

SELECT 'enum_episodio_tipo_fractura' as enum_name, enumlabel as value
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_episodio_tipo_fractura')
ORDER BY enumsortorder;
