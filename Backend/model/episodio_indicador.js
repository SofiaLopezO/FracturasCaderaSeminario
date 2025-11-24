// model/episodio_indicador.js
module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize");

  const EpisodioIndicador = sequelize.define("EpisodioIndicador", {
    episodio_indicador_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    episodio_id: { type: DataTypes.INTEGER, allowNull: false }, 
    control_id: { type: DataTypes.INTEGER, allowNull: true },   
    tipo: {
      type: DataTypes.ENUM(
        "RIESGO_REFRACTURA",            
        "OPERADO_4D",                    
        "CALCIO_CORREGIDO",          

        "RIESGO_FACTOR_EDAD_80",
        "RIESGO_FACTOR_SEXO_FEMENINO",
        "RIESGO_FACTOR_FRACTURA_FRAGILIDAD",
        "RIESGO_FACTOR_FRACTURA_VERTEBRAL",
        "RIESGO_FACTOR_ANTECEDENTE_FAMILIAR",
        "RIESGO_FACTOR_VITAMINA_D",
        "RIESGO_FACTOR_ALBUMINA",
        "RIESGO_FACTOR_HEMOGLOBINA",
        "RIESGO_FACTOR_CREATININA",
        "RIESGO_FACTOR_NLR",
        "RIESGO_FACTOR_MLR",
        "RIESGO_FACTOR_COMORBILIDADES",
        "RIESGO_FACTOR_BARTHEL",
        "RIESGO_FACTOR_IMC",
        "RIESGO_FACTOR_TABACO",
        "RIESGO_FACTOR_CORTICOIDES",
        "RIESGO_FACTOR_ALCOHOL",
        "RIESGO_FACTOR_SUBCAPITAL",
        "RIESGO_FACTOR_RETRASO_QX"
      ),
      allowNull: false
    },

    valor: { type: DataTypes.FLOAT, allowNull: true },
    nivel: { type: DataTypes.ENUM("BAJO","MODERADO","ALTO"), allowNull: true },
    detalles: { type: DataTypes.JSONB, allowNull: true }, 
    calculado_en: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: "episodio_indicador",
    timestamps: false,
  });

  return EpisodioIndicador;
};
