# Fracturas de Cadera - Backend

Sistema de gestión de datos clínicos para el proyecto de fracturas de cadera.

## 🚀 Inicio rápido

### Requisitos

-   Node.js v18+
-   PostgreSQL 14+
-   Variables de entorno configuradas en `.env`

### Instalación

```bash
# Instalar dependencias
npm install

# Configurar base de datos y poblar con datos iniciales
npm run seed:all

# Iniciar servidor en modo desarrollo
npm run dev
```

## 📊 Sistema de Parámetros de Laboratorio e Imagen

Ver documentación completa en [docs/PARAMETROS_LAB.md](docs/PARAMETROS_LAB.md)

### Estructura de datos

El sistema gestiona **37 parámetros** organizados en:

-   **Laboratorio + Sangre** (23 parámetros): análisis bioquímicos, hematológicos, hormonales
-   **Imagen + Ecografía** (8 parámetros): mediciones cuantitativas por ultrasonido
-   **Laboratorio + Tejido** (6 parámetros): espectroscopia FTIR de muestras óseas

### Endpoints disponibles

```
GET    /api/v1/tipos-examen          # Lista tipos de examen (Laboratorio, Imagen)
GET    /api/v1/tipos-muestra         # Lista tipos de muestra (Sangre, Ecografía, Tejido)
GET    /api/v1/parametros            # Lista todos los parámetros con tipos asociados
GET    /api/v1/parametros/:codigo    # Obtiene un parámetro específico
POST   /api/v1/parametros            # Crea un nuevo parámetro
PUT    /api/v1/parametros/:codigo    # Actualiza un parámetro
DELETE /api/v1/parametros/:codigo    # Elimina un parámetro
```

### Parámetros espectroscópicos (FTIR)

Los 6 parámetros de espectroscopia infrarroja (tipo Tejido) incluyen:

-   **AMIDA_I**: Amida I (colágeno) — banda 1710–1590 cm⁻¹
-   **AMIDA_II**: Amida II (colágeno) — banda ~1580–1500 cm⁻¹
-   **FOSFATOS_APATITA**: Fosfatos (apatita) — ν₃: 1110–940; ν₄: doblete 603/565 cm⁻¹
-   **CARBONATOS_APATITA**: Carbonatos (apatita) — ν₃: 1455–1415; ν₂: ~872 cm⁻¹
-   **PO4_CO3**: Relación fosfato/carbonato
-   **CI_IRSF**: Índice de cristalinidad (IRSF)

## 🛠️ Scripts disponibles

### Desarrollo

```bash
npm run dev              # Iniciar servidor con nodemon
npm start               # Iniciar servidor en producción
```

### Testing

```bash
npm test                # Ejecutar tests con Vitest
npm run test:watch      # Tests en modo watch
npm run coverage        # Tests con cobertura
npm run test:api:parametros  # Probar endpoints de parámetros
```

### Base de datos

```bash
npm run seed:all        # Setup completo (tipos + migración + parámetros)
npm run seed:tipos      # Solo tipos de examen y muestra
npm run migrate:tipos   # Solo migración de columnas FK
npm run seed:parametros # Solo insertar/actualizar parámetros
npm run verify:parametros # Verificar datos insertados
```

## 📁 Estructura del proyecto

```
.
├── controller/          # Controladores de la API
│   ├── parametro.controller.js
│   ├── tipo_examen.controller.js
│   └── tipo_muestra.controller.js
├── model/              # Modelos Sequelize
│   ├── parametro_lab.js
│   ├── tipo_examen.js
│   ├── tipo_muestra.js
│   └── initModels.js
├── routes/             # Definición de rutas
│   ├── parametro.routes.js
│   ├── tipo_examen.routes.js
│   ├── tipo_muestra.routes.js
│   └── initRoutes.js
├── scripts/            # Scripts de mantenimiento
│   ├── seed_tipos.js
│   ├── seed_parametros_completo.js
│   ├── migrate_add_tipos_to_parametro_lab.js
│   ├── verify_parametros.js
│   └── test_api_parametros.js
└── docs/              # Documentación
    └── PARAMETROS_LAB.md
```

## 🔗 Relaciones del modelo

```
tipo_examen (1) ----< (N) parametro_lab
tipo_muestra (1) ----< (N) parametro_lab
parametro_lab (1) ----< (N) resultado
episodio (1) ----< (N) resultado
```

## 📝 Variables de entorno

Crear un archivo `.env` con:

```env
# PostgreSQL
PGHOST=localhost
PGPORT=5432
PGDATABASE=fracturas_cadera
PGUSER=usuario
PGPASSWORD=contraseña

# API
PORT=3001
API_URL=http://localhost:3001/api/v1

# JWT y otros...
```

## 🧪 Ejemplo de uso

### Listar todos los parámetros

```bash
curl http://localhost:3001/api/v1/parametros
```

### Obtener un parámetro específico con tipos asociados

```bash
curl http://localhost:3001/api/v1/parametros/AMIDA_I
```

Respuesta:

```json
{
    "codigo": "AMIDA_I",
    "nombre": "Amida I (colágeno)",
    "unidad": null,
    "ref_min": null,
    "ref_max": null,
    "notas": "Banda proteica; usada en índices de colágeno. Banda espectral: 1710–1590 cm⁻¹.",
    "tipo_examen_id": 1,
    "tipo_muestra_id": 3,
    "tipoExamen": {
        "id": 1,
        "nombre": "Laboratorio"
    },
    "tipoMuestra": {
        "id": 3,
        "nombre": "Tejido"
    }
}
```

## 📚 Documentación adicional

-   [Parámetros de Laboratorio e Imagen](docs/PARAMETROS_LAB.md) — Documentación completa del sistema de parámetros

## 🤝 Contribución

Ver guías de contribución en el repositorio principal.

## 📄 Licencia

ISC

---

**Última actualización**: Octubre 2025  
**Total de parámetros**: 37 (23 sangre + 8 ecografía + 6 tejido)
