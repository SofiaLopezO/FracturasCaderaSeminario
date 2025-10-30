// model/generic_report.js
module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize");

  const GenericReport = sequelize.define("GenericReport", {
    report_id:       { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    examen_id:       { type: DataTypes.INTEGER, allowNull: false }, 

    // Imagen
    modalidad:       { type: DataTypes.STRING, allowNull: true },   // RX, TC, RM, ECO…
    region_anat:     { type: DataTypes.STRING, allowNull: true },
    dicom_study_uid: { type: DataTypes.STRING, allowNull: true },

    // Anatomía patológica
    sitio_muestra:   { type: DataTypes.STRING, allowNull: true },
    procedimiento:   { type: DataTypes.STRING, allowNull: true },

    // Texto común
    hallazgos:       { type: DataTypes.TEXT,   allowNull: true },
    impresion:       { type: DataTypes.TEXT,   allowNull: true },

    cod_snomed:      { type: DataTypes.STRING, allowNull: true },
    informado_por:   { type: DataTypes.INTEGER, allowNull: true },  
    informado_en:    { type: DataTypes.DATE,   allowNull: true },
  }, {
    tableName: "generic_report",
    timestamps: false,
  });

  return GenericReport;
};
