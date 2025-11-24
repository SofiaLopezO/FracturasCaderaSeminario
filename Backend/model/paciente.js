// model/paciente.js
module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize");
  const Paciente = sequelize.define("Paciente", {
    user_id: { type: DataTypes.INTEGER, primaryKey: true },
    tipo_sangre: DataTypes.STRING,
    altura: DataTypes.FLOAT,
    edad_anios: DataTypes.INTEGER,
    edad_meses: DataTypes.INTEGER, 
  }, { tableName: "pacientes", timestamps: false });
  return Paciente;
};
