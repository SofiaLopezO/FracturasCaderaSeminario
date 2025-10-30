// model/antropometria.js
module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize");

  const Antropometria = sequelize.define("Antropometria", {
    antropometria_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    episodio_id: { type: DataTypes.INTEGER, allowNull: false }, // → episodio.episodio_id
    peso_kg: { type: DataTypes.FLOAT, allowNull: true },
    altura_m: { type: DataTypes.FLOAT, allowNull: true },
  }, {
    tableName: "antropometria",
    timestamps: false,
  });

  return Antropometria;
};
