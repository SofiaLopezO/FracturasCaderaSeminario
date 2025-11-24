// model/episodio.js
module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize");

  const Episodio = sequelize.define("Episodio", {
    episodio_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    paciente_id: { type: DataTypes.INTEGER, allowNull: false }, 

    cie10: { type: DataTypes.ENUM("S72.0","S72.1","S72.2", "S00.0" ), allowNull: false },
    tipo_fractura: { 
      type: DataTypes.ENUM("INTRACAPSULAR","PERTROCANTERICA","SUBTROCANTERICA", "EXTRACAPSULAR"), 
      allowNull: false 
    },
    lado: { type: DataTypes.ENUM("DERECHO","IZQUIERDO","BILATERAL"), allowNull: true },
    
    procedencia: {
      type: DataTypes.STRING,  
      allowNull: true,
    },

    comorbilidades: { type: DataTypes.JSONB, allowNull: true }, 
    

    fecha_diagnostico: { type: DataTypes.DATE, allowNull: false },
    fecha_ingreso_quirurgico: { type: DataTypes.DATE, allowNull: true }, 
    fecha_alta: { type: DataTypes.DATE, allowNull: true },

    no_operado: { type: DataTypes.BOOLEAN, defaultValue: false },
    causa_no_operar: { type: DataTypes.STRING, allowNull: true },

    abo: { type: DataTypes.ENUM("A","B","AB","O"), allowNull: true },
    rh:  { type: DataTypes.ENUM("Rh+","Rh-"), allowNull: true },

    tabaco: { type: DataTypes.BOOLEAN, defaultValue: false },
    alcohol: { type: DataTypes.BOOLEAN, defaultValue: false },
    corticoides_cronicos: { type: DataTypes.BOOLEAN, defaultValue: false },
    taco: { type: DataTypes.BOOLEAN, defaultValue: false },

    comentario_otro: { type: DataTypes.TEXT, allowNull: true },

    fallecimiento: { type: DataTypes.BOOLEAN, defaultValue: false },
    fecha_fallecimiento: { type: DataTypes.DATE, allowNull: true },


    transfusion: { type: DataTypes.BOOLEAN, allowNull: true },
    reingreso: { type: DataTypes.BOOLEAN, allowNull: true },  

    comentario_evolucion: { type: DataTypes.TEXT, allowNull: true },

    notas_clinicas: { type: DataTypes.TEXT, allowNull: true },

    prequirurgicas: { type: DataTypes.TEXT, allowNull: true },
    
    postquirurgicas: { type: DataTypes.TEXT, allowNull: true },

    inicial: { type: DataTypes.INTEGER, allowNull: true},

    tdc_dias: { 
      type: DataTypes.VIRTUAL(DataTypes.INTEGER, ["fecha_diagnostico"]),
      get() { return null; }
    },
    tpo_dias: { 
      type: DataTypes.VIRTUAL(DataTypes.INTEGER, ["fecha_alta"]),
      get() { return null; } 
    },
    tth_dias: { 
      type: DataTypes.VIRTUAL(DataTypes.INTEGER, ["fecha_diagnostico","fecha_alta"]),
      get() { return null; }
    },
    dhnq_dias: { 
      type: DataTypes.VIRTUAL(DataTypes.INTEGER, ["fecha_diagnostico","fecha_ingreso_quirurgico"]),
      get() { return null; }
    },
  }, {
    tableName: "episodio",
    timestamps: false,
  });

  return Episodio;
};
