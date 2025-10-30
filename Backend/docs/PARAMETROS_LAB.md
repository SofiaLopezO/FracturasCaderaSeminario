# Sistema de Parámetros de Laboratorio e Imagen

Este sistema gestiona parámetros de exámenes de laboratorio clínico y diagnóstico por imagen para el proyecto de fracturas de cadera.

## 📊 Estructura de tablas

### Tabla `tipo_examen`

Cataloga los tipos de examen disponibles:

-   **id: 1** - Laboratorio (exámenes de laboratorio clínico)
-   **id: 2** - Imagen (diagnóstico por imagen)

### Tabla `tipo_muestra`

Cataloga los tipos de muestra:

-   **id: 1** - Sangre (suero, plasma, sangre completa)
-   **id: 2** - Ecografía (imágenes por ultrasonido)
-   **id: 3** - Tejido (muestras de tejido óseo para espectroscopia FTIR)

### Tabla `parametro_lab`

Almacena los parámetros analíticos con:

-   `codigo` (PK): Código único del parámetro
-   `nombre`: Nombre descriptivo
-   `unidad`: Unidad de medida (puede ser NULL)
-   `ref_min`, `ref_max`: Valores de referencia opcionales
-   `notas`: Información adicional (bandas espectrales, observaciones)
-   `tipo_examen_id` (FK → tipo_examen)
-   `tipo_muestra_id` (FK → tipo_muestra)

## 🗂️ Parámetros disponibles

### Laboratorio + Sangre (23 parámetros)

Análisis bioquímicos, hematológicos y hormonales:

-   Glucosa, Colesterol Total, Triglicéridos
-   Hemoglobina, Hematocrito, Plaquetas
-   Uremia, Creatinina
-   Electrolitos: Sodio, Potasio, Calcio, Magnesio
-   Coagulación: INR, Protrombina
-   Vitaminas: D, B12
-   Proteínas: Albúmina, Transferrina
-   Hormonas: PTH, TSH, T4L
-   Hierro y saturación de transferrina

### Imagen + Ecografía (8 parámetros)

Mediciones cuantitativas por ultrasonido:

-   Velocidad 1.ª señal aD
-   Velocidad modo A0
-   Espesor cortical
-   Porosidad cortical
-   Máximo del inverso (0–1)
-   Diferencia entre máx (0–1)
-   Intensidad baja-k (0–1)
-   Espesor de tejido blando

### Laboratorio + Tejido (6 parámetros)

Análisis por espectroscopia FTIR de muestras óseas:

-   **AMIDA_I**: Amida I (colágeno) — banda 1710–1590 cm⁻¹
-   **AMIDA_II**: Amida II (colágeno) — banda ~1580–1500 cm⁻¹
-   **FOSFATOS_APATITA**: Fosfatos (apatita) — ν₃: 1110–940 cm⁻¹; ν₄: doblete 603/565 cm⁻¹
-   **CARBONATOS_APATITA**: Carbonatos (apatita) — ν₃: 1455–1415 cm⁻¹; ν₂: ~872 cm⁻¹
-   **PO4_CO3**: Relación fosfato/carbonato
-   **CI_IRSF**: Índice de cristalinidad (IRSF) — (altura 565 + 603) / valle

## 🚀 Instalación y uso

### Requisitos previos

Tener configuradas las variables de entorno PostgreSQL en `.env`:

```bash
PGHOST=localhost
PGPORT=5432
PGDATABASE=nombre_bd
PGUSER=usuario
PGPASSWORD=contraseña
```

### Primera instalación (base de datos nueva)

Ejecutar el seed completo que crea tablas, migra y puebla datos:

```bash
npm run seed:all
```

Este comando ejecuta en secuencia:

1. `seed:tipos` — Crea tipos de examen y tipos de muestra
2. `migrate:tipos` — Agrega columnas FK a `parametro_lab`
3. `seed:parametros` — Inserta los 37 parámetros con sus tipos asociados

### Comandos individuales

```bash
# Solo crear tipos de examen y muestra
npm run seed:tipos

# Solo ejecutar migración de columnas FK
npm run migrate:tipos

# Solo insertar/actualizar parámetros
npm run seed:parametros
```

### Verificación de datos

Para verificar los datos insertados:

```bash
node scripts/verify_parametros.js
```

Mostrará:

-   Cantidad de parámetros por combinación tipo_examen + tipo_muestra
-   Listado de parámetros espectroscópicos (FTIR)
-   Total de parámetros en la base de datos

## 🛠️ Actualizar parámetros existentes

Los scripts usan `upsert` (insert o update), por lo que:

-   Si el `codigo` no existe → se inserta
-   Si el `codigo` ya existe → se actualiza

Para actualizar datos, modifica `scripts/seed_parametros_completo.js` y vuelve a ejecutar:

```bash
npm run seed:parametros
```

## 🗃️ Archivos relevantes

### Modelos

-   `model/tipo_examen.js` — Modelo TipoExamen
-   `model/tipo_muestra.js` — Modelo TipoMuestra
-   `model/parametro_lab.js` — Modelo ParametroLab (actualizado con FK)
-   `model/initModels.js` — Relaciones Sequelize

### Scripts

-   `scripts/seed_tipos.js` — Seed de tipos
-   `scripts/migrate_add_tipos_to_parametro_lab.js` — Migración de columnas FK
-   `scripts/seed_parametros_completo.js` — Seed de 37 parámetros
-   `scripts/verify_parametros.js` — Verificación de datos

### Controladores y rutas

-   `controller/parametro.controller.js` — CRUD de parámetros
-   `routes/parametro.routes.js` — Endpoints `/api/parametros`

## 📌 Notas técnicas

-   Los parámetros espectroscópicos (FTIR) no tienen `unidad` definida (NULL), ya que son mediciones espectrales sin unidad física estándar.
-   Los rangos de referencia (`ref_min`, `ref_max`) son orientativos y dependen del contexto clínico.
-   Las relaciones son `SET NULL` on delete para preservar integridad de datos históricos.
-   El sistema es idempotente: se puede ejecutar `seed:all` múltiples veces sin duplicar datos.

## 🔗 Relaciones

```
tipo_examen (1) ----< (N) parametro_lab
tipo_muestra (1) ----< (N) parametro_lab
parametro_lab (1) ----< (N) resultado
```

---

**Total de parámetros implementados**: 37  
**Última actualización**: Octubre 2025
