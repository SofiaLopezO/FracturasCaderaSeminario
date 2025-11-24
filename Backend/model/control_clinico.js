// model/control_clinico.js
module.exports = (sequelize) => {
    const { DataTypes } = require('sequelize');

    const ControlClinico = sequelize.define(
        'ControlClinico',
        {
            control_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            episodio_id: { type: DataTypes.INTEGER, allowNull: false }, 
            profesional_id: { type: DataTypes.INTEGER, allowNull: true }, 
            profesional_nombre: {
                type: DataTypes.STRING(150),
                allowNull: true,
            },
            origen: {
                type: DataTypes.ENUM('Guardado', 'Minuta', 'Otro'),
                defaultValue: 'Guardado',
            },
            tipo_control: {
                type: DataTypes.ENUM(
                    'INICIAL',
                    'SEGUIMIENTO',
                    'INTERCONSULTA',
                    'ALTA',
                    'OTRO'
                ),
                allowNull: false,
                defaultValue: 'SEGUIMIENTO',
            },
            resumen: { type: DataTypes.TEXT, allowNull: true },
            fecha_hora_control: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            comorbilidades: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: null,
            },
            tabaco: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: null,
            },
            alcohol: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: null,
            },
            corticoides_cronicos: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: null,
            },
            taco: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: null,
            },
            prequirurgicas: { type: DataTypes.TEXT, allowNull: true },
            postquirurgicas: { type: DataTypes.TEXT, allowNull: true },
            notas_clinicas: { type: DataTypes.TEXT, allowNull: true },
            notas_evolucion: { type: DataTypes.TEXT, allowNull: true },
            complicaciones: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: null,
            },
            transfusion: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: null,
            },
            reingreso: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: null,
            },

            comentario_otro: { type: DataTypes.TEXT, allowNull: true },
        },
        {
            tableName: 'control_clinico',
            timestamps: false,
        }
    );

    return ControlClinico;
};
