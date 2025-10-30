module.exports = (sequelize) => {
    const { DataTypes } = require('sequelize');
    const Registro = sequelize.define(
        'Registro',
        {
            registro_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            accion: DataTypes.STRING,
            fecha_registro: { type: DataTypes.DATE, allowNull: false },
            administrador_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: { model: 'users', key: 'id' },
            },
            actor_user_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: { model: 'users', key: 'id' },
            },
        },
        { tableName: 'registro', timestamps: false }
    );
    return Registro;
};
