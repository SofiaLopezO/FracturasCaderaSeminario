module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize");
  const Muestra = sequelize.define("Muestra", {
    muestra_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tipo_muestra: { type: DataTypes.STRING, allowNull: false },
    fecha_extraccion: { type: DataTypes.DATE, allowNull: false },
    fecha_recepcion: { type: DataTypes.DATE, allowNull: true },
    observaciones: { type: DataTypes.TEXT, allowNull: true },
    examen_id: { type: DataTypes.INTEGER, allowNull: false },     // → examen.examen_id
    profesional_id: { type: DataTypes.INTEGER, allowNull: false }, // → professional_profile.professional_profile_id
  }, { tableName: "muestra", timestamps: false });
  return Muestra;
};
