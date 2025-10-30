// model/tipo_examen.js
module.exports = (sequelize) => {
    const { DataTypes } = require('sequelize');

    const TipoExamen = sequelize.define(
        'TipoExamen',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            nombre: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            descripcion: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
        },
        {
            tableName: 'tipo_examen',
            timestamps: false,
        }
    );

    return TipoExamen;
};
