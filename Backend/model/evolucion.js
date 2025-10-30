// model/evolucion.js
module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize");

  const Evolucion = sequelize.define("Evolucion", {
    evolucion_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    episodio_id: { type: DataTypes.INTEGER, allowNull: false }, // → episodio.episodio_id
    transfusion_requerida: { type: DataTypes.BOOLEAN, defaultValue: false },
    reingreso_30d: { type: DataTypes.BOOLEAN, defaultValue: false },
    comentarios: { type: DataTypes.TEXT, allowNull: true },
  }, {
    tableName: "evolucion",
    timestamps: false,
  });

  return Evolucion;
};
