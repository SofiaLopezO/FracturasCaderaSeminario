// model/episodio.js
module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize");

  const Episodio = sequelize.define("Episodio", {
    episodio_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    // vínculo
    paciente_id: { type: DataTypes.INTEGER, allowNull: false }, // → pacientes.user_id

    // diagnóstico inicial
    cie10: { type: DataTypes.ENUM("S72.0","S72.1","S72.2", "S00.0" ), allowNull: false }, // 0 intracap, 1 pertro, 2 subtro
    tipo_fractura: { 
      type: DataTypes.ENUM("INTRACAPSULAR","PERTROCANTERICA","SUBTROCANTERICA", "EXTRACAPSULAR"), 
      allowNull: false 
    },
    lado: { type: DataTypes.ENUM("DERECHO","IZQUIERDO","BILATERAL"), allowNull: true },
    
    procedencia: {
      type: DataTypes.STRING,  
      allowNull: true,
    },

    comorbilidades: { type: DataTypes.JSONB, allowNull: true }, // array de strings en JSON
    
    // fechas clave
    fecha_diagnostico: { type: DataTypes.DATE, allowNull: false },
    fecha_ingreso_quirurgico: { type: DataTypes.DATE, allowNull: true }, // para DHNQ
    fecha_alta: { type: DataTypes.DATE, allowNull: true },

    // indicadores de calidad (algunos se derivan)
    no_operado: { type: DataTypes.BOOLEAN, defaultValue: false },
    causa_no_operar: { type: DataTypes.STRING, allowNull: true },

    // ABO/Rh y notas
    abo: { type: DataTypes.ENUM("A","B","AB","O"), allowNull: true },
    rh:  { type: DataTypes.ENUM("Rh+","Rh-"), allowNull: true },

    // hábitos al diagnóstico
    tabaco: { type: DataTypes.BOOLEAN, defaultValue: false },
    alcohol: { type: DataTypes.BOOLEAN, defaultValue: false },
    corticoides_cronicos: { type: DataTypes.BOOLEAN, defaultValue: false },
    taco: { type: DataTypes.BOOLEAN, defaultValue: false },

    comentario_otro: { type: DataTypes.TEXT, allowNull: true },

    // fallecimiento
    fallecimiento: { type: DataTypes.BOOLEAN, defaultValue: false },
    fecha_fallecimiento: { type: DataTypes.DATE, allowNull: true },

    // notas libres

    transfusion: { type: DataTypes.BOOLEAN, allowNull: true }, // nueva
    reingreso: { type: DataTypes.BOOLEAN, allowNull: true },   // nueva

    comentario_evolucion: { type: DataTypes.TEXT, allowNull: true }, // nueva

    notas_clinicas: { type: DataTypes.TEXT, allowNull: true },

    prequirurgicas: { type: DataTypes.TEXT, allowNull: true },
    
    postquirurgicas: { type: DataTypes.TEXT, allowNull: true },

    //tipo de control 
    // tipo_control: { type: DataTypes.ENUM("inicial","revision","interconsulta", "alta"), allowNull: true },

    inicial: { type: DataTypes.INTEGER, allowNull: true},
    // virtuales (derivados)
    tdc_dias: { 
      type: DataTypes.VIRTUAL(DataTypes.INTEGER, ["fecha_diagnostico"]),
      get() { return null; } // se calcula en servicio según primera cirugía
    },
    tpo_dias: { 
      type: DataTypes.VIRTUAL(DataTypes.INTEGER, ["fecha_alta"]),
      get() { return null; } // se calcula en servicio según última cirugía
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
