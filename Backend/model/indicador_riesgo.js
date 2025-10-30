module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize");
  const IndicadorRiesgo = sequelize.define("IndicadorRiesgo", {
    indicador_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    descripcion: DataTypes.TEXT,
    puntaje: DataTypes.FLOAT,
    resultado_id: { type: DataTypes.INTEGER, allowNull: false }, 
  }, { tableName: "indicador_riesgo", timestamps: false });
  return IndicadorRiesgo;
};
