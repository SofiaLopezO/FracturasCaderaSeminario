# Documentación: Campos "otro" y "comentario_otro" en Control Clínico

**Fecha:** 2025-10-29  
**Versión:** 1.0  
**Autor:** Sistema

## 📋 Resumen

Se han agregado dos nuevos campos al modelo `control_clinico` para permitir registrar información adicional relevante en los controles clínicos:

-   `otro` (BOOLEAN): Indicador booleano para señalar información adicional
-   `comentario_otro` (TEXT): Campo de texto libre para detallar la información cuando `otro=true`

## 🗄️ Cambios en Base de Datos

### Migración ejecutada

```sql
-- Agregar columna 'otro' (booleano nullable)
ALTER TABLE control_clinico
ADD COLUMN IF NOT EXISTS otro BOOLEAN DEFAULT NULL;

-- Agregar columna 'comentario_otro' (texto nullable)
ALTER TABLE control_clinico
ADD COLUMN IF NOT EXISTS comentario_otro TEXT DEFAULT NULL;
```

### Estructura de campos

| Campo             | Tipo    | Nullable | Default | Descripción                                        |
| ----------------- | ------- | -------- | ------- | -------------------------------------------------- |
| `otro`            | BOOLEAN | YES      | NULL    | Indica si hay información adicional/otra relevante |
| `comentario_otro` | TEXT    | YES      | NULL    | Comentario detallado cuando otro=true              |

## 📝 Cambios en el Modelo

**Archivo:** `/model/control_clinico.js`

```javascript
otro: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: null },
comentario_otro: { type: DataTypes.TEXT, allowNull: true },
```

## 🔧 Cambios en el Controlador

**Archivo:** `/controller/control_clinico.controller.js`

### Función `create()`

Se agregó el manejo de los nuevos campos:

```javascript
const {
    // ... campos existentes
    otro,
    comentario_otro,
} = cambios;

// Al crear el registro:
const created = await models.ControlClinico.create({
    // ... campos existentes
    otro: otro === undefined ? null : !!otro,
    comentario_otro: stripRecursively(comentario_otro) ?? null,
});
```

### Función `update()`

Se agregó el manejo de los nuevos campos:

```javascript
if (body.otro !== undefined) row.otro = body.otro === null ? null : !!body.otro;
if (body.comentario_otro !== undefined)
    row.comentario_otro = body.comentario_otro ?? null;
```

## 🧪 Pruebas con Bruno

### POST - Crear Control Clínico con "otro"

**URL:** `POST https://provider.blocktype.cl/api/v1/controles`

**Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Body:**

```json
{
    "episodio_id": 1,
    "tipo_control": "SEGUIMIENTO",
    "profesional_id": 1,
    "cambios": {
        "resumen": "Control de seguimiento regular",
        "fecha_hora_control": "2025-10-29T14:30:00",
        "habitos": {
            "tabaco": false,
            "alcohol": false,
            "corticoides_cronicos": false,
            "taco": false
        },
        "transfusion": false,
        "reingreso": false,
        "otro": true,
        "comentario_otro": "Paciente reportó dolor leve en la zona de la fractura. Se recomienda seguimiento cercano."
    }
}
```

### PUT - Actualizar Control Clínico con "otro"

**URL:** `PUT https://provider.blocktype.cl/api/v1/controles/{control_id}`

**Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Body:**

```json
{
    "otro": true,
    "comentario_otro": "Se observó mejoría en la movilidad. Continuar con fisioterapia."
}
```

## 📊 Respuesta Esperada

```json
{
    "control_id": 15,
    "episodio_id": 1,
    "profesional_id": 1,
    "profesional_nombre": "Juan Perez Lopez",
    "tipo_control": "SEGUIMIENTO",
    "resumen": "Control de seguimiento regular",
    "fecha_hora_control": "2025-10-29T14:30:00.000Z",
    "comorbilidades": null,
    "tabaco": false,
    "alcohol": false,
    "corticoides_cronicos": false,
    "taco": false,
    "transfusion": false,
    "reingreso": false,
    "otro": true,
    "comentario_otro": "Paciente reportó dolor leve en la zona de la fractura. Se recomienda seguimiento cercano.",
    "complicaciones": null,
    "prequirurgicas": null,
    "postquirurgicas": null,
    "notas_clinicas": null,
    "notas_evolucion": null
}
```

## ✅ Validaciones

-   `otro` acepta valores: `true`, `false`, `null`
-   `otro` se convierte automáticamente a booleano si se envía como string ("true"/"false")
-   `comentario_otro` acepta cualquier texto o `null`
-   `comentario_otro` es opcional incluso si `otro=true`
-   Se aplica `stripRecursively()` a `comentario_otro` para normalizar el texto

## 🎯 Casos de Uso

### Caso 1: Información adicional relevante

```json
{
    "otro": true,
    "comentario_otro": "Paciente refiere antecedentes familiares de osteoporosis no registrados previamente"
}
```

### Caso 2: Sin información adicional

```json
{
    "otro": false,
    "comentario_otro": null
}
```

### Caso 3: Actualización posterior

```json
{
    "otro": true,
    "comentario_otro": "Actualización: Resultados de examen complementario recibidos - revisar en próxima consulta"
}
```

## 🔍 Consultas SQL de Ejemplo

### Buscar controles con información adicional

```sql
SELECT control_id, episodio_id, tipo_control, comentario_otro
FROM control_clinico
WHERE otro = true
ORDER BY fecha_hora_control DESC;
```

### Contar controles por tipo con "otro"

```sql
SELECT tipo_control, COUNT(*) as total
FROM control_clinico
WHERE otro = true
GROUP BY tipo_control;
```

## 📌 Notas Importantes

1. Los campos son completamente opcionales (nullable)
2. No hay validación de longitud en `comentario_otro` (tipo TEXT)
3. El campo `otro` sigue el mismo patrón de normalización que `transfusion` y `reingreso`
4. Se aplica `stripRecursively()` para remover tildes y normalizar el texto
5. Compatible con la estructura existente de control_clinico

## 🔄 Migración de Datos Existentes

Los registros existentes tendrán `otro=NULL` y `comentario_otro=NULL` por defecto. No se requiere acción adicional.

## 📞 Soporte

Para preguntas o reportar problemas, consultar con el equipo de desarrollo.

---

**Última actualización:** 2025-10-29
