// model/alerta.js
module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize");
  const Alerta = sequelize.define("Alerta", {
    alerta_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    episodio_id: { type: DataTypes.INTEGER, allowNull: false },   // → episodio.episodio_id

    tipo: { // LAB, RIESGO, QUIROFANO, SUSPENSION
      type: DataTypes.ENUM("LAB","RIESGO","QUIROFANO","SUSPENSION"),
      allowNull: false
    },
    severidad: { type: DataTypes.ENUM("BAJA","MEDIA","ALTA"), defaultValue: "MEDIA" },
    mensaje: { type: DataTypes.TEXT, allowNull: false },

    // vínculos opcionales según tipo
    indicador_id: { type: DataTypes.INTEGER, allowNull: true },         // → episodio_indicador.episodio_indicador_id
    resultado_id: { type: DataTypes.INTEGER, allowNull: true },         // → resultado.resultado_id
    suspension_id: { type: DataTypes.INTEGER, allowNull: true },        // → suspension.suspension_id
    cirugia_id: { type: DataTypes.INTEGER, allowNull: true },           // → cirugia.cirugia_id

    activa: { type: DataTypes.BOOLEAN, defaultValue: true },
    resuelta_en: { type: DataTypes.DATE, allowNull: true },
  }, { tableName: "alerta", timestamps: false });

  return Alerta;
};
