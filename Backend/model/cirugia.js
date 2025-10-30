// model/cirugia.js
module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize");

  const Cirugia = sequelize.define("Cirugia", {
    cirugia_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    episodio_id: { type: DataTypes.INTEGER, allowNull: false }, // → episodio.episodio_id

    fecha: { type: DataTypes.DATEONLY, allowNull: false },
    hora_inicio: { type: DataTypes.STRING, allowNull: true }, // "HH:mm"
    hora_fin: { type: DataTypes.STRING, allowNull: true },    // "HH:mm"

    tecnica: { 
      type: DataTypes.ENUM("GAMMA","DHS","ATC","APC","BIP","OTRA_OTS"),
      allowNull: true
    },
    lado: { type: DataTypes.ENUM("DERECHO","IZQUIERDO","BILATERAL"), allowNull: true },
    reoperacion: { type: DataTypes.BOOLEAN, defaultValue: false },
    complicacion_intraop: { type: DataTypes.STRING, allowNull: true },

    operador_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "professional_profiles", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    }, // → professional_profiles.id (opcional)
    terminada: {type: DataTypes.VIRTUAL(DataTypes.BOOLEAN, ["hora_fin"]),
      get() { return !!this.hora_fin; }
    },
  }, {
    tableName: "cirugia",
    timestamps: false,
  });

  return Cirugia;
};
