# Migración: Sistema de Tipos para Parámetros de Laboratorio

**Fecha**: Octubre 2025  
**Versión**: 1.0.0

## Cambios en el esquema

### Nuevas tablas

#### `tipo_examen`

```sql
CREATE TABLE tipo_examen (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL UNIQUE,
  descripcion TEXT
);
```

Datos iniciales:

-   id=1: Laboratorio
-   id=2: Imagen

#### `tipo_muestra`

```sql
CREATE TABLE tipo_muestra (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL UNIQUE,
  descripcion TEXT
);
```

Datos iniciales:

-   id=1: Sangre
-   id=2: Ecografía
-   id=3: Tejido

### Modificaciones a tablas existentes

#### `parametro_lab`

```sql
ALTER TABLE parametro_lab
ADD COLUMN tipo_examen_id INTEGER REFERENCES tipo_examen(id) ON DELETE SET NULL;

ALTER TABLE parametro_lab
ADD COLUMN tipo_muestra_id INTEGER REFERENCES tipo_muestra(id) ON DELETE SET NULL;
```

## Parámetros agregados/actualizados

### Parámetros existentes actualizados

Todos los parámetros existentes se actualizaron con las FK correspondientes según su clasificación.

### Nuevos parámetros agregados

#### Espectroscopia FTIR (tipo_examen_id=1, tipo_muestra_id=3)

1. **AMIDA_I** — Amida I (colágeno)
2. **AMIDA_II** — Amida II (colágeno)
3. **FOSFATOS_APATITA** — Fosfatos (apatita)
4. **CARBONATOS_APATITA** — Carbonatos (apatita)
5. **PO4_CO3** — Relación fosfato/carbonato
6. **CI_IRSF** — Índice de cristalinidad (IRSF)

#### Laboratorio - Sangre (tipo_examen_id=1, tipo_muestra_id=1)

23 parámetros de análisis bioquímicos, hematológicos y hormonales.

#### Imagen - Ecografía (tipo_examen_id=2, tipo_muestra_id=2)

8 parámetros de mediciones cuantitativas por ultrasonido.

## Scripts de migración

### Orden de ejecución

```bash
# 1. Crear tablas tipo_examen y tipo_muestra
npm run seed:tipos

# 2. Agregar columnas FK a parametro_lab
npm run migrate:tipos

# 3. Insertar/actualizar todos los parámetros
npm run seed:parametros

# O ejecutar todo junto:
npm run seed:all
```

### Rollback (revertir cambios)

Si necesitas revertir los cambios:

```sql
-- Eliminar FKs de parametro_lab
ALTER TABLE parametro_lab DROP COLUMN IF EXISTS tipo_examen_id;
ALTER TABLE parametro_lab DROP COLUMN IF EXISTS tipo_muestra_id;

-- Eliminar tablas de tipos
DROP TABLE IF EXISTS tipo_examen CASCADE;
DROP TABLE IF EXISTS tipo_muestra CASCADE;

-- Opcional: eliminar los parámetros espectroscópicos agregados
DELETE FROM parametro_lab WHERE codigo IN (
  'AMIDA_I', 'AMIDA_II', 'FOSFATOS_APATITA',
  'CARBONATOS_APATITA', 'PO4_CO3', 'CI_IRSF'
);
```

## Validación post-migración

### Verificar estructura

```sql
-- Verificar que las columnas existen
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'parametro_lab'
  AND column_name IN ('tipo_examen_id', 'tipo_muestra_id');

-- Verificar FKs
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
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'parametro_lab';
```

### Verificar datos

```bash
# Con script Node
npm run verify:parametros

# Con SQL
SELECT
  te.nombre AS tipo_examen,
  tm.nombre AS tipo_muestra,
  COUNT(*) AS cantidad
FROM parametro_lab p
LEFT JOIN tipo_examen te ON p.tipo_examen_id = te.id
LEFT JOIN tipo_muestra tm ON p.tipo_muestra_id = tm.id
GROUP BY te.nombre, tm.nombre
ORDER BY te.nombre, tm.nombre;
```

Resultado esperado:

```
 tipo_examen | tipo_muestra | cantidad
-------------+--------------+----------
 Imagen      | Ecografía    |        8
 Laboratorio | Sangre       |       23
 Laboratorio | Tejido       |        6
```

## Impacto en el sistema

### Modelos afectados

-   `model/parametro_lab.js` — Agregadas FK tipo_examen_id, tipo_muestra_id
-   `model/tipo_examen.js` — Nuevo modelo
-   `model/tipo_muestra.js` — Nuevo modelo
-   `model/initModels.js` — Agregadas relaciones

### Controladores afectados

-   `controller/parametro.controller.js` — Actualizado para incluir tipos en queries
-   `controller/tipo_examen.controller.js` — Nuevo CRUD
-   `controller/tipo_muestra.controller.js` — Nuevo CRUD

### Rutas afectadas

-   `routes/parametro.routes.js` — Sin cambios (mismo CRUD)
-   `routes/tipo_examen.routes.js` — Nuevas rutas
-   `routes/tipo_muestra.routes.js` — Nuevas rutas
-   `routes/initRoutes.js` — Agregados `/tipos-examen` y `/tipos-muestra`

### Endpoints nuevos

```
GET    /api/v1/tipos-examen
GET    /api/v1/tipos-examen/:id
POST   /api/v1/tipos-examen
PUT    /api/v1/tipos-examen/:id
DELETE /api/v1/tipos-examen/:id

GET    /api/v1/tipos-muestra
GET    /api/v1/tipos-muestra/:id
POST   /api/v1/tipos-muestra
PUT    /api/v1/tipos-muestra/:id
DELETE /api/v1/tipos-muestra/:id
```

## Notas técnicas

-   La migración es **idempotente**: se puede ejecutar múltiples veces sin efectos secundarios.
-   Las FK tienen `ON DELETE SET NULL` para preservar registros históricos.
-   Los scripts usan `upsert` de Sequelize para insertar o actualizar según el PK.
-   Los parámetros espectroscópicos tienen `unidad=NULL` (sin unidad física estándar).
-   El sistema mantiene compatibilidad con código existente que no usa tipos.

## Testing

```bash
# Test de endpoints
npm run test:api:parametros

# Test de base de datos
npm run verify:parametros

# Tests unitarios (si aplicable)
npm test
```

---

**Estado**: ✅ Completada y probada  
**Responsable**: Sistema automatizado  
**Fecha de aplicación**: Octubre 2025
