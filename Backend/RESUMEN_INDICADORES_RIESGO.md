# Resumen: Scripts de Recálculo de Indicadores de Riesgo

## ✅ Scripts Creados

### 1. Script Principal: `recalcular_indicadores_riesgo.js`

**Ubicación**: `Backend/Fracturas-de-cadera/scripts/recalcular_indicadores_riesgo.js`

**Función**: Recorre todos los resultados de laboratorio y calcula indicadores de riesgo basados en criterios clínicos predefinidos, almacenándolos en la tabla `indicador_riesgo`.

**Características**:

-   ✅ Procesa resultados de laboratorio (tabla `resultado`)
-   ✅ Evalúa 10 criterios de riesgo diferentes
-   ✅ Crea/actualiza registros en `indicador_riesgo`
-   ✅ Modo dry-run para simulación
-   ✅ Filtros por episodio, resultado o límite
-   ✅ Modo verbose para debugging
-   ✅ Manejo de errores robusto
-   ✅ Reportes detallados

### 2. Script de Test: `test_indicadores_riesgo.js`

**Ubicación**: `Backend/Fracturas-de-cadera/scripts/test_indicadores_riesgo.js`

**Función**: Valida la lógica de evaluación y consulta estadísticas de la base de datos.

**Características**:

-   ✅ 10 casos de prueba automatizados
-   ✅ Verificación de criterios de riesgo
-   ✅ Estadísticas de la base de datos
-   ✅ Ejemplos de resultados monitoreados
-   ✅ No modifica datos

### 3. Documentación

**Documentación completa**: `docs/RECALCULO_INDICADORES_RIESGO.md` (384 líneas)

**README rápido**: `scripts/README.md` (guía de scripts)

## 📊 Criterios de Riesgo Implementados

### Parámetros Bioquímicos (7 criterios)

| Parámetro        | Criterio     | Puntaje |
| ---------------- | ------------ | ------- |
| Vitamina D       | < 20 ng/mL   | 2       |
| Albúmina         | < 3.5 g/dL   | 1       |
| Hemoglobina      | < 11 g/dL    | 1       |
| Creatinina       | >= 1.3 mg/dL | 1       |
| Calcio           | < 8.5 mg/dL  | 1       |
| Calcio Corregido | < 8.5 mg/dL  | 1       |
| INR              | > 1.5        | 1       |

### Ratios Inflamatorios (3 criterios)

| Parámetro | Criterio | Puntaje |
| --------- | -------- | ------- |
| NLR       | > 4.5    | 1       |
| MLR       | > 0.35   | 1       |
| PLR       | > 200    | 1       |

## 🚀 Uso Rápido

### Primer Uso

```bash
cd Backend/Fracturas-de-cadera

# 1. Test
node scripts/test_indicadores_riesgo.js

# 2. Simulación
node scripts/recalcular_indicadores_riesgo.js --dry-run

# 3. Ejecución
node scripts/recalcular_indicadores_riesgo.js
```

### Opciones Disponibles

```bash
# Procesar todo
node scripts/recalcular_indicadores_riesgo.js

# Modo dry-run (no guarda)
node scripts/recalcular_indicadores_riesgo.js --dry-run

# Episodio específico
node scripts/recalcular_indicadores_riesgo.js --episodio-id=123

# Resultado específico
node scripts/recalcular_indicadores_riesgo.js --resultado-id=456

# Con límite
node scripts/recalcular_indicadores_riesgo.js --limit=100

# Verbose (detalles)
node scripts/recalcular_indicadores_riesgo.js --verbose

# Combinaciones
node scripts/recalcular_indicadores_riesgo.js --dry-run --verbose --episodio-id=123
```

## 🧪 Resultados del Test

```
✅ Todos los tests pasaron correctamente (10/10)

Estadísticas de BD:
- Total de resultados: 1,631
- Resultados con Vitamina D: 57
- Resultados con Hemoglobina: 57
- Resultados con INR: 57
- Indicadores de riesgo existentes: 0 (antes de ejecutar)
```

## 📁 Estructura de Tablas

### Tabla: `indicador_riesgo`

```sql
indicador_id      INT (PK, AUTO_INCREMENT)
descripcion       TEXT
puntaje           FLOAT
resultado_id      INT (FK -> resultado.resultado_id)
```

**Ejemplo de registro**:

```json
{
    "indicador_id": 1,
    "descripcion": "Vitamina D < 20 ng/mL - Deficiencia de vitamina D",
    "puntaje": 2,
    "resultado_id": 123
}
```

## 🔄 Flujo de Procesamiento

```
1. Consultar resultados de laboratorio
   ↓
2. Para cada resultado:
   - Obtener parámetro y valor
   - Buscar criterio correspondiente
   - Evaluar si cumple el criterio
   ↓
3. Si cumple criterio:
   - Generar descripción
   - Asignar puntaje
   - Crear/actualizar en indicador_riesgo
   ↓
4. Reportar estadísticas
```

## 🎯 Casos de Uso

### 1. Primera Implementación

```bash
node scripts/test_indicadores_riesgo.js
node scripts/recalcular_indicadores_riesgo.js --dry-run --verbose
node scripts/recalcular_indicadores_riesgo.js --limit=10
node scripts/recalcular_indicadores_riesgo.js
```

### 2. Actualización de Criterios

```bash
# Editar CRITERIOS_RIESGO en el script
node scripts/test_indicadores_riesgo.js
node scripts/recalcular_indicadores_riesgo.js
```

### 3. Corrección de Episodio Específico

```bash
node scripts/recalcular_indicadores_riesgo.js --episodio-id=456
```

### 4. Verificación de Resultado

```bash
node scripts/recalcular_indicadores_riesgo.js --resultado-id=123 --verbose
```

## 🔗 Relación con Otros Scripts

| Script                             | Tabla Destino        | Nivel                |
| ---------------------------------- | -------------------- | -------------------- |
| `recalcular_indicadores_riesgo.js` | `indicador_riesgo`   | Resultado individual |
| `recalcular-todos-los-riesgos.js`  | `episodio_indicador` | Episodio completo    |

**Complementarios**: Ambos scripts deben ejecutarse para tener el sistema de riesgos completo.

## 📈 Rendimiento

-   **Velocidad**: ~100-200 resultados/segundo
-   **Memoria**: Bajo consumo (procesa en secuencia)
-   **Volúmenes grandes**: Usar `--limit` en bloques
-   **Seguridad**: No elimina datos, solo crea/actualiza

## 🛡️ Seguridad y Validación

-   ✅ Modo dry-run disponible
-   ✅ No elimina datos existentes
-   ✅ Validación de valores numéricos
-   ✅ Manejo de errores individual
-   ✅ Reportes detallados
-   ✅ Logging completo en modo verbose

## 📚 Documentación

1. **Guía completa**: `docs/RECALCULO_INDICADORES_RIESGO.md`
2. **Guía rápida**: `scripts/README.md`
3. **Código fuente**: Scripts autodocumentados
4. **Tests**: Casos de prueba incluidos

## ✨ Próximos Pasos

1. **Ejecutar test inicial**:

    ```bash
    node scripts/test_indicadores_riesgo.js
    ```

2. **Probar en dry-run**:

    ```bash
    node scripts/recalcular_indicadores_riesgo.js --dry-run --limit=50
    ```

3. **Ejecutar producción**:
    ```bash
    node scripts/recalcular_indicadores_riesgo.js
    ```

## 📞 Soporte

Para más información, revisar:

-   `docs/RECALCULO_INDICADORES_RIESGO.md` - Documentación detallada
-   `scripts/README.md` - Guía rápida de todos los scripts
-   Código fuente - Comentarios inline

---

**Estado**: ✅ Implementado y testeado

**Fecha**: Octubre 30, 2025

**Sistema**: Fracturas de Cadera - Indicadores de Riesgo
