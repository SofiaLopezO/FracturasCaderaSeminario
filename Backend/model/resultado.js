// model/resultado.js
module.exports = (sequelize) => {
    const { DataTypes } = require('sequelize');
    const Resultado = sequelize.define(
        'Resultado',
        {
            resultado_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },

            // vínculos
            episodio_id: { type: DataTypes.INTEGER, allowNull: false }, 
            muestra_id: { type: DataTypes.INTEGER, allowNull: true }, 
            examen_id: { type: DataTypes.INTEGER, allowNull: true }, 

            // dato
            parametro: { type: DataTypes.STRING, allowNull: false }, 
            valor: { type: DataTypes.FLOAT, allowNull: false },
            unidad: { type: DataTypes.STRING, allowNull: true },
            fecha_resultado: { type: DataTypes.DATE, allowNull: false },
        },
        { tableName: 'resultado', timestamps: false }
    );

    return Resultado;
};
