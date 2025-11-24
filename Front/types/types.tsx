export type PacienteHeader = {
  user_id: number;
  rut: string;
  nombre: string;
  fecha_nacimiento?: string;
  tipo_sangre?: string | null;
  edad?: number | null;
  edad_anios?: number | null;
  edad_meses?: number | null;
};
export type Muestra={
  muestra_id: string | number;
  tipo_muestra: string;
  fecha_recepcion: string;
  fecha_extraccion: string | null;
  observaciones: string | null;
  examen_id: string | number;
  profesional_id: string | number;
  Resultados: Resultados[];
  validado_por: string | null;
}
export type Resultados={
  resultado_id: string | number;
  episodio_id: string| number;
  muestra_id: string | number;
  examen_id: string | number;
  parametro: string;
  nombre: string;
  valor: string;
  unidad: string | null;
  fecha_resultado: string;
}
export type Examen = {
  examen_id: string | number;
  tipo_examen: string;
  paciente_id: number | string;
  profesional_id: number | string;
  resultados_sin_muestra: string[];
  muestras: Muestra[];
};