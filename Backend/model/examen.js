const professional_profile = require("./professional_profile");

module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize");
  const Examen = sequelize.define("Examen", {
    examen_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tipo_examen: { type: DataTypes.STRING, allowNull: false },
    paciente_id: { type: DataTypes.INTEGER, allowNull: false },  
  }, { tableName: "examen", timestamps: false });
  return Examen;
};
