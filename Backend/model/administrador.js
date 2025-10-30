module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize");
  // Admin profile is keyed by the user account
  const Administrador = sequelize.define(
    "Administrador",
    {
      user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      nivel_acceso: { type: DataTypes.STRING, allowNull: true },
    },
    { tableName: "administradores", timestamps: false }
  );
  return Administrador;
};