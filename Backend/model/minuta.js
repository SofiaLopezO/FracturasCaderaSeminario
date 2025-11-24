module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize");
  const Minuta = sequelize.define("Minuta", {
    minuta_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ruta_pdf: DataTypes.STRING,
    fecha_creacion: { type: DataTypes.DATE, allowNull: false },
    paciente_id: { type: DataTypes.INTEGER, allowNull: false },    
    profesional_id: { type: DataTypes.INTEGER, allowNull: false }, 
  }, { tableName: "minuta", timestamps: false });
  return Minuta;
};
