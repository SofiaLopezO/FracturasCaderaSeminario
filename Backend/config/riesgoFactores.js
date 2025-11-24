const FACTORES = [
  {
    tipo: 'RIESGO_FACTOR_EDAD_80',
    dominio: 'Generales',
    criterio: 'Edad >= 80 anios',
    puntos: 1,
    prioridad: 'MEDIA',
    mensaje: 'Riesgo aumentado por fragilidad. Refuerza prevencion de caidas y optimiza manejo perioperatorio.',
    evaluate(ctx) {
      const edad = ctx.edad;
      if (edad === undefined || edad === null) return { cumple: false, detalles: { motivo: 'edad no disponible' } };
      const cumple = edad >= 80;
      return { cumple, detalles: { valor_medido: edad, unidad: 'anios' } };
    },
  },
  {
    tipo: 'RIESGO_FACTOR_SEXO_FEMENINO',
    dominio: 'Generales',
    criterio: 'Sexo femenino',
    puntos: 1,
    prioridad: 'MEDIA',
    mensaje: 'Mayor riesgo de osteoporosis y fragilidad. Mantener prevencion y tratamiento oseo.',
    evaluate(ctx) {
      const sexo = (ctx.sexo || '').toUpperCase();
      if (!sexo) return { cumple: false, detalles: { motivo: 'sexo no disponible' } };
      const cumple = sexo === 'F';
      return { cumple, detalles: { valor_medido: ctx.sexo } };
    },
  },
  {
    tipo: 'RIESGO_FACTOR_FRACTURA_FRAGILIDAD',
    dominio: 'Generales',
    criterio: 'Fractura previa por fragilidad',
    puntos: 2,
    prioridad: 'ALTA',
    mensaje: 'Alto riesgo de refractura. Indicar seguimiento preventivo y optimizar tratamiento oseo.',
    evaluate(ctx) {
      const valor = Boolean(ctx.fractura_fragilidad);
      return { cumple: valor, detalles: { valor_medido: valor } };
    },
  },
  {
    tipo: 'RIESGO_FACTOR_FRACTURA_VERTEBRAL',
    dominio: 'Generales',
    criterio: 'Fractura vertebral previa',
    puntos: 1,
    prioridad: 'MEDIA',
    mensaje: 'Fragilidad esqueletica acumulada. Intensificar prevencion de nuevas fracturas.',
    evaluate(ctx) {
      const valor = Boolean(ctx.fractura_vertebral);
      return { cumple: valor, detalles: { valor_medido: valor } };
    },
  },
  {
    tipo: 'RIESGO_FACTOR_ANTECEDENTE_FAMILIAR',
    dominio: 'Generales',
    criterio: 'Antecedente familiar de fractura de cadera',
    puntos: 1,
    prioridad: 'MEDIA',
    mensaje: 'Riesgo heredofamiliar aumentado. Refuerza pesquisa y prevencion secundaria.',
    evaluate(ctx) {
      const valor = Boolean(ctx.antecedente_familiar);
      return { cumple: valor, detalles: { valor_medido: valor } };
    },
  },
  {
    tipo: 'RIESGO_FACTOR_VITAMINA_D',
    dominio: 'Bioquimicos',
    criterio: 'Vitamina D < 20 ng/mL',
    puntos: 2,
    prioridad: 'ALTA',
    mensaje: 'Deficiencia de vitamina D. Iniciar suplementacion y control metabolico oseo.',
    evaluate(ctx) {
      const valor = ctx.vitamina_d;
      if (valor === undefined || valor === null) return { cumple: false, detalles: { motivo: 'vitamina D no disponible' } };
      const cumple = valor < 20;
      return { cumple, detalles: { valor_medido: valor, unidad: 'ng/mL' } };
    },
  },
  {
    tipo: 'RIESGO_FACTOR_ALBUMINA',
    dominio: 'Bioquimicos',
    criterio: 'Albumina < 3.5 g/dL',
    puntos: 1,
    prioridad: 'MEDIA',
    mensaje: 'Riesgo nutricional. Solicitar evaluacion nutricional y correccion.',
    evaluate(ctx) {
      const valor = ctx.albumina;
      if (valor === undefined || valor === null) return { cumple: false, detalles: { motivo: 'albumina no disponible' } };
      const cumple = valor < 3.5;
      return { cumple, detalles: { valor_medido: valor, unidad: 'g/dL' } };
    },
  },
  {
    tipo: 'RIESGO_FACTOR_HEMOGLOBINA',
    dominio: 'Bioquimicos',
    criterio: 'Hemoglobina < 11 g/dL',
    puntos: 1,
    prioridad: 'MEDIA',
    mensaje: 'Anemia por tolerancia y complicaciones. Corregir y monitorizar.',
    evaluate(ctx) {
      const valor = ctx.hemoglobina;
      if (valor === undefined || valor === null) return { cumple: false, detalles: { motivo: 'hemoglobina no disponible' } };
      const cumple = valor < 11;
      return { cumple, detalles: { valor_medido: valor, unidad: 'g/dL' } };
    },
  },
  {
    tipo: 'RIESGO_FACTOR_CREATININA',
    dominio: 'Bioquimicos',
    criterio: 'Creatinina serica >= 1.3 mg/dL',
    puntos: 1,
    prioridad: 'MEDIA',
    mensaje: 'Compromiso de funcion renal. Ajustar farmacos y vigilar complicaciones.',
    evaluate(ctx) {
      const valor = ctx.creatinina;
      if (valor === undefined || valor === null) return { cumple: false, detalles: { motivo: 'creatinina no disponible' } };
      const cumple = valor >= 1.3;
      return { cumple, detalles: { valor_medido: valor, unidad: 'mg/dL' } };
    },
  },
  {
    tipo: 'RIESGO_FACTOR_NLR',
    dominio: 'Bioquimicos',
    criterio: 'NLR > 4.5',
    puntos: 1,
    prioridad: 'MEDIA',
    mensaje: 'Inflamacion elevada, peor pronostico. Intensificar vigilancia clinica.',
    evaluate(ctx) {
      const valor = ctx.nlr;
      if (valor === undefined || valor === null) return { cumple: false, detalles: { motivo: 'NLR no disponible' } };
      const cumple = valor > 4.5;
      return { cumple, detalles: { valor_medido: valor } };
    },
  },
  {
    tipo: 'RIESGO_FACTOR_MLR',
    dominio: 'Bioquimicos',
    criterio: 'MLR > 0.35',
    puntos: 1,
    prioridad: 'MEDIA',
    mensaje: 'Inmunosenescencia o inflamacion. Monitorizar de cerca.',
    evaluate(ctx) {
      const valor = ctx.mlr;
      if (valor === undefined || valor === null) return { cumple: false, detalles: { motivo: 'MLR no disponible' } };
      const cumple = valor > 0.35;
      return { cumple, detalles: { valor_medido: valor } };
    },
  },
  {
    tipo: 'RIESGO_FACTOR_COMORBILIDADES',
    dominio: 'Clinico-funcional',
    criterio: 'Numero de comorbilidades >= 2',
    puntos: 1,
    prioridad: 'MEDIA',
    mensaje: 'Mayor carga basal. Requiere seguimiento estrecho e interconsultas segun necesidad.',
    evaluate(ctx) {
      const conteo = ctx.num_comorbilidades;
      if (conteo === undefined || conteo === null) return { cumple: false, detalles: { motivo: 'comorbilidades no disponibles' } };
      const cumple = conteo >= 2;
      return { cumple, detalles: { conteo, detalle_comorbilidades: ctx.comorbilidades_detalle || [] } };
    },
  },
  {
    tipo: 'RIESGO_FACTOR_BARTHEL',
    dominio: 'Clinico-funcional',
    criterio: 'Indice de Barthel < 30',
    puntos: 1,
    prioridad: 'MEDIA',
    mensaje: 'Dependencia funcional severa. Coordinar rehabilitacion temprana.',
    evaluate(ctx) {
      const valor = ctx.barthel;
      if (valor === undefined || valor === null) return { cumple: false, detalles: { motivo: 'Barthel no disponible' } };
      const cumple = valor < 30;
      return { cumple, detalles: { puntaje_barthel: valor } };
    },
  },
  {
    tipo: 'RIESGO_FACTOR_IMC',
    dominio: 'Clinico-funcional',
    criterio: 'IMC < 18.5 kg/m2',
    puntos: 1,
    prioridad: 'MEDIA',
    mensaje: 'Sarcopenia o malnutricion probable. Evaluar nutricion y fortalecer musculatura.',
    evaluate(ctx) {
      const valor = ctx.imc;
      if (valor === undefined || valor === null) return { cumple: false, detalles: { motivo: 'IMC no disponible' } };
      const cumple = valor < 18.5;
      return { cumple, detalles: { valor_medido: valor, unidad: 'kg/m2' } };
    },
  },
  {
    tipo: 'RIESGO_FACTOR_TABACO',
    dominio: 'Habitos',
    criterio: 'Tabaquismo activo',
    puntos: 1,
    prioridad: 'MEDIA',
    mensaje: 'Factor modificable. Sugerir cese tabaco y reforzar prevencion de complicaciones.',
    evaluate(ctx) {
      const valor = Boolean(ctx.tabaco);
      return { cumple: valor, detalles: { valor_medido: valor } };
    },
  },
  {
    tipo: 'RIESGO_FACTOR_CORTICOIDES',
    dominio: 'Habitos',
    criterio: 'Corticoides orales cronicos >= 3 meses',
    puntos: 1,
    prioridad: 'MEDIA',
    mensaje: 'Supresion hormonal y mayor riesgo de osteoporosis. Optimizar manejo y suplementacion.',
    evaluate(ctx) {
      const valor = Boolean(ctx.corticoides);
      return { cumple: valor, detalles: { valor_medido: valor } };
    },
  },
  {
    tipo: 'RIESGO_FACTOR_ALCOHOL',
    dominio: 'Habitos',
    criterio: 'Alcohol >= 3/dia',
    puntos: 1,
    prioridad: 'MEDIA',
    mensaje: 'Menor densidad osea y mayor riesgo de caida. Intervenir sobre consumo.',
    evaluate(ctx) {
      const valor = Boolean(ctx.alcohol);
      return { cumple: valor, detalles: { valor_medido: valor } };
    },
  },
  {
    tipo: 'RIESGO_FACTOR_SUBCAPITAL',
    dominio: 'Quirurgicos',
    criterio: 'Fractura subcapital desplazada',
    puntos: 2,
    prioridad: 'ALTA',
    mensaje: 'Mayor complejidad y peor recuperacion. Manejo prioritario y rehabilitacion intensiva.',
    evaluate(ctx) {
      const valor = Boolean(ctx.subcapital_desplazada);
      return { cumple: valor, detalles: { valor_medido: valor, tipo_fractura: ctx.tipo_fractura } };
    },
  },
  {
    tipo: 'RIESGO_FACTOR_RETRASO_QX',
    dominio: 'Quirurgicos',
    criterio: 'Retraso quirurgico > 48 horas',
    puntos: 1,
    prioridad: 'MEDIA',
    mensaje: 'Mayor mortalidad y complicaciones. Priorizar resolucion y soporte perioperatorio.',
    evaluate(ctx) {
      const horas = ctx.retraso_horas;
      if (horas === undefined || horas === null) return { cumple: false, detalles: { motivo: 'no existe dato de retraso' } };
      const cumple = horas > 48;
      const detalleHoras = Number.isFinite(horas) ? Number(horas.toFixed ? horas.toFixed(1) : horas) : horas;
      return { cumple, detalles: { horas_retraso: detalleHoras } };
    },
  },
];

const NIVEL_THRESHOLDS = {
  ALTO: 8,
  MODERADO: 4,
};

const COLOR_BY_NIVEL = {
  BAJO: 'VERDE',
  MODERADO: 'AMARILLO',
  ALTO: 'ROJO',
};

const ACTION_BY_NIVEL = {
  BAJO: 'No se genera alerta. Seguimiento estándar.',
  MODERADO: 'Alerta informativa: monitorizar y evaluar suplementación/seguimiento.',
  ALTO: 'Alerta prioritaria: evaluación interdisciplinaria urgente.',
};

module.exports = { FACTORES, NIVEL_THRESHOLDS, COLOR_BY_NIVEL, ACTION_BY_NIVEL };
