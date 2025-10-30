// model/suspension.js
module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize");

  const Suspension = sequelize.define("Suspension", {
    suspension_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    episodio_id: { type: DataTypes.INTEGER, allowNull: false }, // → episodio.episodio_id
    fecha_suspension: { type: DataTypes.DATEONLY, allowNull: false },
    tipo: { type: DataTypes.ENUM("CLINICA","ADMINISTRATIVA"), allowNull: false },
    motivo: { type: DataTypes.STRING, allowNull: false },
  }, {
    tableName: "suspension",
    timestamps: false,
  });

  return Suspension;
};
