// model/user.js
module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize");

  const User = sequelize.define("User", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    rut: { type: DataTypes.STRING, unique: true, allowNull: false }, 
    nombres: { type: DataTypes.STRING, allowNull: false },
    apellido_paterno: { type: DataTypes.STRING, allowNull: false },
    apellido_materno: { type: DataTypes.STRING, allowNull: false },
    correo: { type: DataTypes.STRING, unique: true, allowNull: false },
    password_hash: { type: DataTypes.STRING, allowNull: false },
    telefono: { type: DataTypes.STRING, allowNull: true},             
    sexo: {
      type: DataTypes.ENUM("F", "M", "O"),
      allowNull: false,
    },
    fecha_nacimiento: DataTypes.DATEONLY,
    //VER
    fecha_creacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    email_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
    email_verify_token: { type: DataTypes.STRING, allowNull: true, unique: true },
    email_verify_expires: { type: DataTypes.DATE, allowNull: true },
  }, { tableName: "users", timestamps: false });

  return User;
};
