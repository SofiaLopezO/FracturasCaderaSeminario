// model/tipo_muestra.js
module.exports = (sequelize) => {
    const { DataTypes } = require('sequelize');

    const TipoMuestra = sequelize.define(
        'TipoMuestra',
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
            tableName: 'tipo_muestra',
            timestamps: false,
        }
    );

    return TipoMuestra;
};
