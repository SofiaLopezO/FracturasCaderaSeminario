// model/parametro_lab.js
module.exports = (sequelize) => {
    const { DataTypes } = require('sequelize');

    const ParametroLab = sequelize.define(
        'ParametroLab',
        {
            codigo: { type: DataTypes.STRING, primaryKey: true }, // p.ej., "HB","ALBUMINA","INR"
            nombre: { type: DataTypes.STRING, allowNull: false },
            unidad: { type: DataTypes.STRING, allowNull: true },
            ref_min: { type: DataTypes.FLOAT, allowNull: true },
            ref_max: { type: DataTypes.FLOAT, allowNull: true },
            notas: { type: DataTypes.TEXT, allowNull: true },
            tipo_examen_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'tipo_examen',
                    key: 'id',
                },
            },
            tipo_muestra_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'tipo_muestra',
                    key: 'id',
                },
            },
        },
        {
            tableName: 'parametro_lab',
            timestamps: false,
        }
    );

    return ParametroLab;
};
