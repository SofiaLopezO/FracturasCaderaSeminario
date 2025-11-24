export interface Paciente {
    rut: string;
    nombres: string;
    Apellido_Paterno: string;
    Apellido_Materno: string;
}
export interface Examen {
    id: number;
    nombre: string;
    fecha: string;
    tipo: '.txt' | '.xlsx' | '.doc' | '.pdf' | '.csv' | '.jpg' | '.png';
    url: string;
}
export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
}
export interface AnalisisSangre {
    parametro: string;
    nombre: string;
    valor: number;
    unidad: string;
    fecha: string;
}

export interface HistorialMedico {
    fecha: string;
    nombre_consulta: string;
    motivo_consulta: string;
    doctor_asociado: string;
    doctor_id: number;
}

export interface AlertaMedica {
    alerta_id: number;
    tipo: string;
    severidad: 'ALTA' | 'MEDIA' | 'BAJA';
    mensaje: string;
    activa: boolean;
    resuelta_en: string | null;
    episodio_id: number;
}
export interface Habitos {
    tabaco: boolean;
    alcohol: boolean;
    corticoides_cronicos: boolean;
    taco: boolean;
}
export interface DiagnosticoActual {
    episodio_id: number;
    cie10: string;
    tipo_fractura: string;
    lado: string;
    procedencia: string;
    fecha_diagnostico: string;
    habitos: Habitos;
    comorbilidades: string[];
    notas_clinicas: string;
    prequirurgicas: string;
    postquirurgicas: string;
    transfusion: boolean;
    reingreso: boolean;
    fallecimiento: boolean;
    comentario_evolucion: string | null;
    es_episodio: boolean;
}

export interface General {
    nombre: string;
    rut: string;
    paciente_id: number;
    fecha_nacimiento: string;
    edad: number;
    edad_meses: number;
    sexo: string;
    IMC: number;
    tipo_sangre: string;
    altura: number;
    peso: number;
    analisis_sangre: {
        hemoglobina: AnalisisSangre;
        colesterol_total: AnalisisSangre;
        glucosa: AnalisisSangre;
        trigliceridos: AnalisisSangre;
    };
    historial_medico: HistorialMedico[];
    alertas_medicas: AlertaMedica[];
    tdc_dias: number;
    tpo_dias: number;
    tth_dias: number;
    dx_actual: DiagnosticoActual;
}

export interface RegistroControl {
    episodio_id: number;
    fecha_hora: string;
    profesional_id: number;
    doctor: string;
    origen: string;
    dias_desde_previo: number | null;
    notas_clinicas: string;
    resumen: string;
    tipo_fractura: string;
}

export interface SuspensionQuirofano {
    suspension_id: number;
    episodio_id: number;
    fecha: string;
    tipo: string;
    motivo: string;
}

export interface Quirofano {
    suspensiones: SuspensionQuirofano[];
    cirugias: Cirugia[];
}
export interface Cirugia {
    cirugia_id: number;
    episodio_id: number;
    fecha: string;
    hora_inicio: string;
    hora_fin: string;
    tecnica: string;
    lado: string;
    reoperacion: boolean;
    complicacion_intraop: string;
    operador_id: number;
}
export interface ResultadoLaboratorio {
    resultado_id: number;
    nombre: string;
    parametro: string;
    valor: number;
    unidad: string;
    fecha_resultado: string;
    ParametroLab?: {
        codigo: string;
        nombre: string;
    };
}

export interface MuestraLaboratorio {
    muestra_id: number;
    tipo_muestra: string;
    fecha_recepcion: string;
    fecha_extraccion: string | null;
    validado_por: string;
    fecha_validacion: string | null;
    resultados: ResultadoLaboratorio[];
    observaciones: string | null;
}

export interface SolicitudLaboratorio {
    examen_id: number;
    nombre: string;
    fecha: string | null;
    tipo_examen: string;
    urgente_o_programado: string | null;
    estado: string | null;
    muestras: MuestraLaboratorio[];
}

export interface Laboratorio {
    resumen_examenes: {
        total_examenes: number;
        total_muestras: number;
        total_resultados: number;
    };
    solicitudes: SolicitudLaboratorio[];
}
export interface AlertaMedica {
    tipo: string;
    descripcion: string;
    fecha: string;
    prioridad: 'alta' | 'media' | 'baja';
}
export interface DetallesPaciente {
    general: General;
    registro_controles: RegistroControl[];
    quirofano: Quirofano;
    laboratorio: Laboratorio;
    alertas_medicas: AlertaMedica[];
    indicadores: Indicadores;
}

export interface Indicador {
    nombre: string;
    valor: number;
}
export interface Indicadores {
    suma: number;
    nivel: string;
    indicadores: Indicador[];
}
