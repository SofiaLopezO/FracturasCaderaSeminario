# Sistema de Auditoría de Acciones de Administradores

## Descripción General

Se ha implementado un sistema completo de registro (auditoría) de todas las acciones que realizan los administradores dentro del sistema. Esto permite tener trazabilidad completa de las operaciones administrativas realizadas.

## Función Helper: `logRegistro`

La función `logRegistro` está ubicada en `controller/registro.controller.js` y se utiliza para registrar acciones de manera consistente:

```javascript
async function logRegistro(req, accion, administrador_id = null) {
    try {
        await models.Registro.create({
            accion: String(accion).trim(),
            fecha_registro: new Date(),
            administrador_id: administrador_id ?? null, // usuario sobre el que se actuó
            actor_user_id: req.user?.id ?? null, // usuario que realizó la acción
        });
    } catch (e) {
        console.error('logRegistro error:', e);
    }
}
```

### Parámetros:

-   `req`: Objeto request de Express (contiene información del usuario autenticado en `req.user`)
-   `accion`: String descriptivo de la acción realizada
-   `user_afectado_id` (opcional): ID del usuario sobre el que se realizó la acción (el afectado por la operación)

## Controladores Actualizados

### 1. `administrador.controller.js`

Registra las siguientes acciones:

-   **CREAR_ADMINISTRADOR**: Al crear un nuevo administrador
-   **ACTUALIZAR_ADMINISTRADOR**: Al modificar nivel de acceso
-   **ELIMINAR_ADMINISTRADOR**: Al eliminar un administrador

### 2. `admin.users.controller.js`

Registra las siguientes acciones:

-   **CREAR_USUARIO**: Al crear un nuevo usuario con rol
-   **ASIGNAR_ROL**: Al agregar un rol a un usuario existente
-   **QUITAR_ROL**: Al remover un rol de un usuario
-   **ACTUALIZAR_PERFIL_USUARIO**: Al actualizar el perfil profesional de un usuario

### 3. `paciente.controller.js`

Registra las siguientes acciones:

-   **CREAR_PACIENTE**: Al crear un nuevo paciente (incluye user_id y rut)
-   **ACTUALIZAR_PACIENTE**: Al actualizar datos de un paciente
-   **ELIMINAR_PACIENTE**: Al eliminar un paciente

### 4. `episodio.controller.js`

Registra las siguientes acciones:

-   **CREAR_EPISODIO**: Al crear un nuevo episodio (incluye episodio_id, paciente_id y rut)
-   **ACTUALIZAR_EPISODIO**: Al actualizar un episodio
-   **ELIMINAR_EPISODIO**: Al eliminar un episodio

### 5. `funcionario.controller.js`

Registra las siguientes acciones:

-   **CREAR_FUNCIONARIO**: Al crear un nuevo funcionario (incluye cargo y departamento)
-   **ACTUALIZAR_FUNCIONARIO**: Al actualizar datos de un funcionario
-   **ELIMINAR_FUNCIONARIO**: Al eliminar un funcionario

### 6. `tecnologo.controller.js`

Registra las siguientes acciones:

-   **CREAR_TECNOLOGO**: Al crear un nuevo tecnólogo (incluye especialidad)
-   **ACTUALIZAR_TECNOLOGO**: Al actualizar datos de un tecnólogo
-   **ELIMINAR_TECNOLOGO**: Al eliminar un tecnólogo

### 7. `investigador.controller.js`

Registra las siguientes acciones:

-   **CREAR_INVESTIGADOR**: Al crear un nuevo investigador (incluye área)
-   **ACTUALIZAR_INVESTIGADOR**: Al actualizar datos de un investigador
-   **ELIMINAR_INVESTIGADOR**: Al eliminar un investigador

## Información Registrada

Cada registro contiene:

-   **accion**: Descripción detallada de la acción (tipo de operación + datos relevantes)
-   **fecha_registro**: Timestamp automático de cuándo se realizó la acción
-   **administrador_id**: ID del administrador/usuario que realizó la acción (el actor)
-   **actor_user_id**: ID del usuario sobre el que se realizó la acción (el afectado)

## Ejemplo de Registro

```javascript
{
  registro_id: 123,
  accion: "CREAR_PACIENTE: user_id=45, rut=12345678-9",
  fecha_registro: "2025-10-29T10:30:00.000Z",
  administrador_id: 7,   // El admin que creó el paciente (el actor)
  actor_user_id: 45      // El usuario/paciente que fue creado (el afectado)
}
```

## Relaciones en la Base de Datos

El modelo `Registro` tiene las siguientes relaciones definidas en `initModels.js`:

```javascript
// administrador_id: Usuario que realizó la acción (el actor/administrador)
User.hasMany(Registro, {
    foreignKey: 'administrador_id',
    as: 'registros_como_administrador',
});
Registro.belongsTo(User, {
    foreignKey: 'administrador_id',
    as: 'administrador',
});

// actor_user_id: Usuario sobre el que se realizó la acción (el afectado)
User.hasMany(Registro, {
    foreignKey: 'actor_user_id',
    as: 'registros_como_afectado',
});
Registro.belongsTo(User, {
    foreignKey: 'actor_user_id',
    as: 'usuario_afectado',
});
```

**Importante:** Ambas foreign keys apuntan a la tabla `users`, no a `administradores`. Esto permite registrar acciones realizadas por cualquier administrador sobre cualquier tipo de usuario (pacientes, funcionarios, tecnólogos, investigadores, otros administradores).

### Ejemplo de Query con Relaciones

```javascript
const registros = await models.Registro.findAll({
    include: [
        {
            model: models.User,
            as: 'administrador',
            attributes: ['id', 'rut', 'nombres', 'apellido_paterno'],
        },
        {
            model: models.User,
            as: 'usuario_afectado',
            attributes: ['id', 'rut', 'nombres', 'apellido_paterno'],
        },
    ],
    order: [['fecha_registro', 'DESC']],
    limit: 10,
});
```

Esto permite hacer queries con `include` para obtener información completa de ambos usuarios.

## Beneficios

1. **Trazabilidad completa**: Todas las acciones administrativas quedan registradas
2. **Auditoría**: Permite revisar quién hizo qué y cuándo
3. **Seguridad**: Facilita la detección de acciones no autorizadas
4. **Cumplimiento**: Ayuda a cumplir con requisitos de auditoría y normativas
5. **Información detallada**: Los mensajes de acción incluyen datos relevantes (IDs, RUTs, valores modificados)

## Consulta de Registros

Los registros pueden consultarse a través del endpoint:

-   `GET /registros` - Lista registros con paginación y filtros
-   `GET /registros/:id` - Obtiene un registro específico

Parámetros de consulta:

-   `limit`: Cantidad de registros (default: 20, máx: 100)
-   `offset`: Offset para paginación
-   `accion`: Filtrar por tipo de acción específica

## Protección

Los endpoints de registros están protegidos y solo accesibles por usuarios con rol `ADMIN` según la configuración en `routes/registro.routes.js`.

## Mantenimiento Futuro

Si se agregan nuevos controladores o acciones administrativas, se debe:

1. Importar la función `logRegistro`:

    ```javascript
    const { logRegistro } = require('./registro.controller');
    ```

2. Llamar a `logRegistro` después de realizar la acción exitosamente:

    ```javascript
    await logRegistro(req, 'NOMBRE_ACCION: detalles relevantes', rut_afectado);
    ```

3. Seguir el patrón de nomenclatura: `VERBO_RECURSO: detalles`
    - Ejemplos: `CREAR_USUARIO`, `ACTUALIZAR_PACIENTE`, `ELIMINAR_EPISODIO`
