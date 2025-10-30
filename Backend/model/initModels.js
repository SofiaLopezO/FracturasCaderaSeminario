// model/initModels.js
const { sequelize } = require('./db');

// Modelos base
const User = require('./user')(sequelize);
const Paciente = require('./paciente')(sequelize);
const Administrador = require('./administrador')(sequelize);
const ProfessionalProfile = require('./professional_profile')(sequelize);

// Negocio existente
const Examen = require('./examen')(sequelize);
const Muestra = require('./muestra')(sequelize);
const Resultado = require('./resultado')(sequelize);
const IndicadorRiesgo = require('./indicador_riesgo')(sequelize); // (si lo sigues usando)
const Alerta = require('./alerta')(sequelize);
const Minuta = require('./minuta')(sequelize);
const Registro = require('./registro')(sequelize);
const GenericReport = require('./generic_report')(sequelize);

// **Nuevos**
const Episodio = require('./episodio')(sequelize);
const ControlClinico = require('./control_clinico')(sequelize);
const Cirugia = require('./cirugia')(sequelize);
const Suspension = require('./suspension')(sequelize);
const Complicacion = require('./complicacion')(sequelize);
const Evolucion = require('./evolucion')(sequelize);
const Antropometria = require('./antropometria')(sequelize);
const EpisodioIndicador = require('./episodio_indicador')(sequelize);
const ParametroLab = require('./parametro_lab')(sequelize); // opcional fuerte
const TipoExamen = require('./tipo_examen')(sequelize);
const TipoMuestra = require('./tipo_muestra')(sequelize);

// ─────────────────────────── Relaciones ───────────────────────────

// Users ↔ Paciente (1:1)
User.hasOne(Paciente, {
    as: 'paciente',
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
});
Paciente.belongsTo(User, { as: 'user', foreignKey: 'user_id' });

// Users ↔ Administrador (1:1)
User.hasOne(Administrador, {
    as: 'administrador',
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
});
Administrador.belongsTo(User, { as: 'user', foreignKey: 'user_id' });

// Users ↔ ProfessionalProfile (1:1)
User.hasOne(ProfessionalProfile, {
    as: 'professional_profile',
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
});
ProfessionalProfile.belongsTo(User, { as: 'user', foreignKey: 'user_id' });

// Examen ↔ GenericReport (1:1)
Examen.hasOne(GenericReport, { foreignKey: 'examen_id' });
GenericReport.belongsTo(Examen, { foreignKey: 'examen_id' });

// Paciente ↔ Episodio (1:N)
Paciente.hasMany(Episodio, { foreignKey: 'paciente_id', onDelete: 'CASCADE' });
Episodio.belongsTo(Paciente, { foreignKey: 'paciente_id' });

// Episodio ↔ Cirugia (1:N)
Episodio.hasMany(Cirugia, { foreignKey: 'episodio_id', onDelete: 'CASCADE' });
Cirugia.belongsTo(Episodio, { foreignKey: 'episodio_id' });

// Episodio ↔ Suspension (1:N)
Episodio.hasMany(Suspension, {
    foreignKey: 'episodio_id',
    onDelete: 'CASCADE',
});
Suspension.belongsTo(Episodio, { foreignKey: 'episodio_id' });

// Episodio ↔ Complicacion (1:N)
Episodio.hasMany(Complicacion, {
    foreignKey: 'episodio_id',
    onDelete: 'CASCADE',
});
Complicacion.belongsTo(Episodio, { foreignKey: 'episodio_id' });

// Episodio ↔ Evolucion (1:1)
Episodio.hasOne(Evolucion, { foreignKey: 'episodio_id', onDelete: 'CASCADE' });
Evolucion.belongsTo(Episodio, { foreignKey: 'episodio_id' });

// Episodio ↔ Antropometria (1:1)
Episodio.hasOne(Antropometria, {
    foreignKey: 'episodio_id',
    onDelete: 'CASCADE',
});
Antropometria.belongsTo(Episodio, { foreignKey: 'episodio_id' });

// Episodio ↔ ControlClinico (1:N)
Episodio.hasMany(ControlClinico, {
    foreignKey: 'episodio_id',
    onDelete: 'CASCADE',
});
ControlClinico.belongsTo(Episodio, { foreignKey: 'episodio_id' });

// ProfessionalProfile ↔ ControlClinico (1:N)
ProfessionalProfile.hasMany(ControlClinico, {
    foreignKey: 'profesional_id',
    onDelete: 'SET NULL',
});
ControlClinico.belongsTo(ProfessionalProfile, {
    as: 'profesional',
    foreignKey: 'profesional_id',
});

// ProfessionalProfile ↔ Cirugia (1:N)
ProfessionalProfile.hasMany(Cirugia, {
    as: 'cirugias',
    foreignKey: 'operador_id',
    onDelete: 'SET NULL',
});
Cirugia.belongsTo(ProfessionalProfile, {
    as: 'operador',
    foreignKey: 'operador_id',
});

// Episodio ↔ EpisodioIndicador (1:N)
Episodio.hasMany(EpisodioIndicador, {
    foreignKey: 'episodio_id',
    onDelete: 'CASCADE',
});
EpisodioIndicador.belongsTo(Episodio, { foreignKey: 'episodio_id' });

// ControlClinico ↔ EpisodioIndicador (1:N) - control_id puede ser NULL para indicadores de episodio
ControlClinico.hasMany(EpisodioIndicador, {
    foreignKey: 'control_id',
    onDelete: 'CASCADE',
});
EpisodioIndicador.belongsTo(ControlClinico, {
    foreignKey: 'control_id',
    allowNull: true, // Permitir indicadores sin control asociado
});

// Episodio ↔ Resultado (1:N)
Episodio.hasMany(Resultado, { foreignKey: 'episodio_id', onDelete: 'CASCADE' });
Resultado.belongsTo(Episodio, { foreignKey: 'episodio_id' });

// ParametroLab ↔ Resultado (1:N) (opcional)
ParametroLab.hasMany(Resultado, {
    foreignKey: 'parametro',
    sourceKey: 'codigo',
});
Resultado.belongsTo(ParametroLab, {
    foreignKey: 'parametro',
    targetKey: 'codigo',
});

// TipoExamen ↔ ParametroLab (1:N)
TipoExamen.hasMany(ParametroLab, {
    foreignKey: 'tipo_examen_id',
    onDelete: 'SET NULL',
});
ParametroLab.belongsTo(TipoExamen, {
    as: 'tipoExamen',
    foreignKey: 'tipo_examen_id',
});

// TipoMuestra ↔ ParametroLab (1:N)
TipoMuestra.hasMany(ParametroLab, {
    foreignKey: 'tipo_muestra_id',
    onDelete: 'SET NULL',
});
ParametroLab.belongsTo(TipoMuestra, {
    as: 'tipoMuestra',
    foreignKey: 'tipo_muestra_id',
});

// Examen / Muestra / Resultado relaciones existentes
Paciente.hasMany(Examen, { foreignKey: 'paciente_id' });
Examen.belongsTo(Paciente, { foreignKey: 'paciente_id' });

ProfessionalProfile.hasMany(Examen, { foreignKey: 'profesional_id' });
Examen.belongsTo(ProfessionalProfile, { foreignKey: 'profesional_id' });

Examen.hasMany(Muestra, { foreignKey: 'examen_id' });
Muestra.belongsTo(Examen, { foreignKey: 'examen_id' });

ProfessionalProfile.hasMany(Muestra, { foreignKey: 'profesional_id' });
Muestra.belongsTo(ProfessionalProfile, { foreignKey: 'profesional_id' });

Muestra.hasMany(Resultado, { foreignKey: 'muestra_id' });
Resultado.belongsTo(Muestra, { foreignKey: 'muestra_id' });

Examen.hasMany(Resultado, { foreignKey: 'examen_id' });
Resultado.belongsTo(Examen, { foreignKey: 'examen_id' });

// IndicadorRiesgo (legacy) ↔ Alerta - COMENTADO: conflicto con EpisodioIndicador
// IndicadorRiesgo.hasMany(Alerta, { foreignKey: "indicador_id" });
// Alerta.belongsTo(IndicadorRiesgo, { foreignKey: "indicador_id" });

// Alerta con nuevas FK
Episodio.hasMany(Alerta, { foreignKey: 'episodio_id', onDelete: 'CASCADE' });
Alerta.belongsTo(Episodio, { foreignKey: 'episodio_id' });

EpisodioIndicador.hasMany(Alerta, {
    foreignKey: 'indicador_id',
    onDelete: 'SET NULL',
});
Alerta.belongsTo(EpisodioIndicador, { foreignKey: 'indicador_id' });

Resultado.hasMany(Alerta, { foreignKey: 'resultado_id', onDelete: 'SET NULL' });
Alerta.belongsTo(Resultado, { foreignKey: 'resultado_id' });

Suspension.hasMany(Alerta, {
    foreignKey: 'suspension_id',
    onDelete: 'SET NULL',
});
Alerta.belongsTo(Suspension, { foreignKey: 'suspension_id' });

Cirugia.hasMany(Alerta, { foreignKey: 'cirugia_id', onDelete: 'SET NULL' });
Alerta.belongsTo(Cirugia, { foreignKey: 'cirugia_id' });

// Minutas / Descargas / Registro como tenías
ProfessionalProfile.hasMany(Minuta, { foreignKey: 'profesional_id' });
Minuta.belongsTo(ProfessionalProfile, { foreignKey: 'profesional_id' });

Paciente.hasMany(Minuta, { foreignKey: 'paciente_id' });
Minuta.belongsTo(Paciente, { foreignKey: 'paciente_id' });

// Registro (auditoría)
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

module.exports = {
    sequelize,
    User,
    Paciente,
    Administrador,
    ProfessionalProfile,
    Examen,
    Muestra,
    Resultado,
    IndicadorRiesgo,
    Alerta,
    Minuta,
    Registro,
    GenericReport,
    Episodio,
    ControlClinico,
    Cirugia,
    Suspension,
    Complicacion,
    Evolucion,
    Antropometria,
    EpisodioIndicador,
    ParametroLab,
    TipoExamen,
    TipoMuestra,
};
