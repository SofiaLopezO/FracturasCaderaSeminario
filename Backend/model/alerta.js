// model/alerta.js
module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize");
  const Alerta = sequelize.define("Alerta", {
    alerta_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    episodio_id: { type: DataTypes.INTEGER, allowNull: false },   

    tipo: {
      type: DataTypes.ENUM("LAB","RIESGO","QUIROFANO","SUSPENSION"),
      allowNull: false
    },
    severidad: { type: DataTypes.ENUM("BAJA","MEDIA","ALTA"), defaultValue: "MEDIA" },
    mensaje: { type: DataTypes.TEXT, allowNull: false },

    indicador_id: { type: DataTypes.INTEGER, allowNull: true },     
    resultado_id: { type: DataTypes.INTEGER, allowNull: true },      
    suspension_id: { type: DataTypes.INTEGER, allowNull: true },     
    cirugia_id: { type: DataTypes.INTEGER, allowNull: true },          

    activa: { type: DataTypes.BOOLEAN, defaultValue: true },
    resuelta_en: { type: DataTypes.DATE, allowNull: true },
  }, { tableName: "alerta", timestamps: false });

  return Alerta;
};
