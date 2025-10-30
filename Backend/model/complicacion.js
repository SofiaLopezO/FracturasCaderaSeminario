// model/complicacion.js
module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize");

  const Complicacion = sequelize.define("Complicacion", {
    complicacion_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    episodio_id: { type: DataTypes.INTEGER, allowNull: false }, // → episodio.episodio_id
    momento: { type: DataTypes.ENUM("PRE","POST","INTRA"), allowNull: false }, // Excel tiene PRE/POST; agregamos INTRA
    presente: { type: DataTypes.BOOLEAN, defaultValue: true },
    descripcion: { type: DataTypes.TEXT, allowNull: true },
  }, {
    tableName: "complicacion",
    timestamps: false,
  });

  return Complicacion;
};
