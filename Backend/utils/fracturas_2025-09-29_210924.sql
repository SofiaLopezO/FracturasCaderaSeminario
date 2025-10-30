--
-- PostgreSQL database dump
--

-- Dumped from database version 16.8
-- Dumped by pg_dump version 16.8

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: enum_alerta_severidad; Type: TYPE; Schema: public; Owner: sofia
--

CREATE TYPE public.enum_alerta_severidad AS ENUM (
    'BAJA',
    'MEDIA',
    'ALTA'
);


ALTER TYPE public.enum_alerta_severidad OWNER TO sofia;

--
-- Name: enum_alerta_tipo; Type: TYPE; Schema: public; Owner: sofia
--

CREATE TYPE public.enum_alerta_tipo AS ENUM (
    'LAB',
    'RIESGO',
    'QUIROFANO',
    'SUSPENSION'
);


ALTER TYPE public.enum_alerta_tipo OWNER TO sofia;

--
-- Name: enum_cirugia_lado; Type: TYPE; Schema: public; Owner: sofia
--

CREATE TYPE public.enum_cirugia_lado AS ENUM (
    'DERECHO',
    'IZQUIERDO',
    'BILATERAL'
);


ALTER TYPE public.enum_cirugia_lado OWNER TO sofia;

--
-- Name: enum_cirugia_tecnica; Type: TYPE; Schema: public; Owner: sofia
--

CREATE TYPE public.enum_cirugia_tecnica AS ENUM (
    'GAMMA',
    'DHS',
    'ATC',
    'APC',
    'BIP',
    'OTRA_OTS'
);


ALTER TYPE public.enum_cirugia_tecnica OWNER TO sofia;

--
-- Name: enum_complicacion_momento; Type: TYPE; Schema: public; Owner: sofia
--

CREATE TYPE public.enum_complicacion_momento AS ENUM (
    'PRE',
    'POST',
    'INTRA'
);


ALTER TYPE public.enum_complicacion_momento OWNER TO sofia;

--
-- Name: enum_control_clinico_origen; Type: TYPE; Schema: public; Owner: sofia
--

CREATE TYPE public.enum_control_clinico_origen AS ENUM (
    'Guardado',
    'Minuta',
    'Otro'
);


ALTER TYPE public.enum_control_clinico_origen OWNER TO sofia;

--
-- Name: enum_control_clinico_tipo_control; Type: TYPE; Schema: public; Owner: sofia
--

CREATE TYPE public.enum_control_clinico_tipo_control AS ENUM (
    'INICIAL',
    'SEGUIMIENTO',
    'INTERCONSULTA',
    'ALTA',
    'OTRO'
);


ALTER TYPE public.enum_control_clinico_tipo_control OWNER TO sofia;

--
-- Name: enum_episodio_abo; Type: TYPE; Schema: public; Owner: sofia
--

CREATE TYPE public.enum_episodio_abo AS ENUM (
    'A',
    'B',
    'AB',
    'O'
);


ALTER TYPE public.enum_episodio_abo OWNER TO sofia;

--
-- Name: enum_episodio_cie10; Type: TYPE; Schema: public; Owner: sofia
--

CREATE TYPE public.enum_episodio_cie10 AS ENUM (
    'S72.0',
    'S72.1',
    'S72.2'
);


ALTER TYPE public.enum_episodio_cie10 OWNER TO sofia;

--
-- Name: enum_episodio_indicador_nivel; Type: TYPE; Schema: public; Owner: sofia
--

CREATE TYPE public.enum_episodio_indicador_nivel AS ENUM (
    'BAJO',
    'MODERADO',
    'ALTO'
);


ALTER TYPE public.enum_episodio_indicador_nivel OWNER TO sofia;

--
-- Name: enum_episodio_indicador_tipo; Type: TYPE; Schema: public; Owner: sofia
--

CREATE TYPE public.enum_episodio_indicador_tipo AS ENUM (
    'RIESGO_REFRACTURA',
    'OPERADO_4D',
    'CALCIO_CORREGIDO',
    'RIESGO_FACTOR_EDAD_80',
    'RIESGO_FACTOR_SEXO_FEMENINO',
    'RIESGO_FACTOR_FRACTURA_FRAGILIDAD',
    'RIESGO_FACTOR_FRACTURA_VERTEBRAL',
    'RIESGO_FACTOR_ANTECEDENTE_FAMILIAR',
    'RIESGO_FACTOR_VITAMINA_D',
    'RIESGO_FACTOR_ALBUMINA',
    'RIESGO_FACTOR_HEMOGLOBINA',
    'RIESGO_FACTOR_CREATININA',
    'RIESGO_FACTOR_NLR',
    'RIESGO_FACTOR_MLR',
    'RIESGO_FACTOR_COMORBILIDADES',
    'RIESGO_FACTOR_BARTHEL',
    'RIESGO_FACTOR_IMC',
    'RIESGO_FACTOR_TABACO',
    'RIESGO_FACTOR_CORTICOIDES',
    'RIESGO_FACTOR_ALCOHOL',
    'RIESGO_FACTOR_SUBCAPITAL',
    'RIESGO_FACTOR_RETRASO_QX'
);


ALTER TYPE public.enum_episodio_indicador_tipo OWNER TO sofia;

--
-- Name: enum_episodio_lado; Type: TYPE; Schema: public; Owner: sofia
--

CREATE TYPE public.enum_episodio_lado AS ENUM (
    'DERECHO',
    'IZQUIERDO',
    'BILATERAL'
);


ALTER TYPE public.enum_episodio_lado OWNER TO sofia;

--
-- Name: enum_episodio_procedencia; Type: TYPE; Schema: public; Owner: sofia
--

CREATE TYPE public.enum_episodio_procedencia AS ENUM (
    'URGENCIA',
    'APS',
    'OTRO_CENTRO',
    'Derivación APS'
);


ALTER TYPE public.enum_episodio_procedencia OWNER TO sofia;

--
-- Name: enum_episodio_rh; Type: TYPE; Schema: public; Owner: sofia
--

CREATE TYPE public.enum_episodio_rh AS ENUM (
    'Rh+',
    'Rh-'
);


ALTER TYPE public.enum_episodio_rh OWNER TO sofia;

--
-- Name: enum_episodio_tipo_control; Type: TYPE; Schema: public; Owner: sofia
--

CREATE TYPE public.enum_episodio_tipo_control AS ENUM (
    'Presencial',
    '',
    'inicual',
    'inicial',
    'Telemático',
    'revision',
    'No realizado',
    'interconsulta',
    're',
    'reingreso',
    'alta'
);


ALTER TYPE public.enum_episodio_tipo_control OWNER TO sofia;

--
-- Name: enum_episodio_tipo_fractura; Type: TYPE; Schema: public; Owner: sofia
--

CREATE TYPE public.enum_episodio_tipo_fractura AS ENUM (
    'INTRACAPSULAR',
    'PERTROCANTERICA',
    'SUBTROCANTERICA'
);


ALTER TYPE public.enum_episodio_tipo_fractura OWNER TO sofia;

--
-- Name: enum_professional_profiles_cargo; Type: TYPE; Schema: public; Owner: sofia
--

CREATE TYPE public.enum_professional_profiles_cargo AS ENUM (
    'TECNOLOGO',
    'INVESTIGADOR',
    'FUNCIONARIO'
);


ALTER TYPE public.enum_professional_profiles_cargo OWNER TO sofia;

--
-- Name: enum_suspension_tipo; Type: TYPE; Schema: public; Owner: sofia
--

CREATE TYPE public.enum_suspension_tipo AS ENUM (
    'CLINICA',
    'ADMINISTRATIVA'
);


ALTER TYPE public.enum_suspension_tipo OWNER TO sofia;

--
-- Name: enum_users_sexo; Type: TYPE; Schema: public; Owner: sofia
--

CREATE TYPE public.enum_users_sexo AS ENUM (
    'F',
    'M',
    'O'
);


ALTER TYPE public.enum_users_sexo OWNER TO sofia;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: administradores; Type: TABLE; Schema: public; Owner: sofia
--

CREATE TABLE public.administradores (
    user_id integer NOT NULL,
    nivel_acceso character varying(255)
);


ALTER TABLE public.administradores OWNER TO sofia;

--
-- Name: alerta; Type: TABLE; Schema: public; Owner: sofia
--

CREATE TABLE public.alerta (
    alerta_id integer NOT NULL,
    episodio_id integer NOT NULL,
    tipo public.enum_alerta_tipo NOT NULL,
    severidad public.enum_alerta_severidad DEFAULT 'MEDIA'::public.enum_alerta_severidad,
    mensaje text NOT NULL,
    indicador_id integer,
    resultado_id integer,
    suspension_id integer,
    cirugia_id integer,
    activa boolean DEFAULT true,
    resuelta_en timestamp with time zone
);


ALTER TABLE public.alerta OWNER TO sofia;

--
-- Name: alerta_alerta_id_seq; Type: SEQUENCE; Schema: public; Owner: sofia
--

CREATE SEQUENCE public.alerta_alerta_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.alerta_alerta_id_seq OWNER TO sofia;

--
-- Name: alerta_alerta_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sofia
--

ALTER SEQUENCE public.alerta_alerta_id_seq OWNED BY public.alerta.alerta_id;


--
-- Name: antropometria; Type: TABLE; Schema: public; Owner: sofia
--

CREATE TABLE public.antropometria (
    antropometria_id integer NOT NULL,
    episodio_id integer NOT NULL,
    peso_kg double precision,
    altura_m double precision
);


ALTER TABLE public.antropometria OWNER TO sofia;

--
-- Name: antropometria_antropometria_id_seq; Type: SEQUENCE; Schema: public; Owner: sofia
--

CREATE SEQUENCE public.antropometria_antropometria_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.antropometria_antropometria_id_seq OWNER TO sofia;

--
-- Name: antropometria_antropometria_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sofia
--

ALTER SEQUENCE public.antropometria_antropometria_id_seq OWNED BY public.antropometria.antropometria_id;


--
-- Name: cirugia; Type: TABLE; Schema: public; Owner: sofia
--

CREATE TABLE public.cirugia (
    cirugia_id integer NOT NULL,
    episodio_id integer NOT NULL,
    fecha date NOT NULL,
    hora_inicio character varying(255),
    hora_fin character varying(255),
    tecnica public.enum_cirugia_tecnica,
    lado public.enum_cirugia_lado,
    reoperacion boolean DEFAULT false,
    complicacion_intraop character varying(255),
    operador_id integer
);


ALTER TABLE public.cirugia OWNER TO sofia;

--
-- Name: cirugia_cirugia_id_seq; Type: SEQUENCE; Schema: public; Owner: sofia
--

CREATE SEQUENCE public.cirugia_cirugia_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cirugia_cirugia_id_seq OWNER TO sofia;

--
-- Name: cirugia_cirugia_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sofia
--

ALTER SEQUENCE public.cirugia_cirugia_id_seq OWNED BY public.cirugia.cirugia_id;


--
-- Name: complicacion; Type: TABLE; Schema: public; Owner: sofia
--

CREATE TABLE public.complicacion (
    complicacion_id integer NOT NULL,
    episodio_id integer NOT NULL,
    momento public.enum_complicacion_momento NOT NULL,
    presente boolean DEFAULT true,
    descripcion text
);


ALTER TABLE public.complicacion OWNER TO sofia;

--
-- Name: complicacion_complicacion_id_seq; Type: SEQUENCE; Schema: public; Owner: sofia
--

CREATE SEQUENCE public.complicacion_complicacion_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.complicacion_complicacion_id_seq OWNER TO sofia;

--
-- Name: complicacion_complicacion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sofia
--

ALTER SEQUENCE public.complicacion_complicacion_id_seq OWNED BY public.complicacion.complicacion_id;


--
-- Name: control_clinico; Type: TABLE; Schema: public; Owner: sofia
--

CREATE TABLE public.control_clinico (
    control_id integer NOT NULL,
    episodio_id integer NOT NULL,
    profesional_id integer,
    profesional_nombre character varying(150),
    origen public.enum_control_clinico_origen DEFAULT 'Guardado'::public.enum_control_clinico_origen,
    tipo_control public.enum_control_clinico_tipo_control DEFAULT 'SEGUIMIENTO'::public.enum_control_clinico_tipo_control NOT NULL,
    resumen text,
    fecha_hora_control timestamp with time zone NOT NULL,
    comorbilidades jsonb,
    tabaco boolean,
    alcohol boolean,
    corticoides_cronicos boolean,
    taco boolean,
    prequirurgicas text,
    postquirurgicas text,
    notas_clinicas text,
    notas_evolucion text,
    complicaciones jsonb,
    transfusion boolean,
    reingreso boolean
);


ALTER TABLE public.control_clinico OWNER TO sofia;

--
-- Name: control_clinico_control_id_seq; Type: SEQUENCE; Schema: public; Owner: sofia
--

CREATE SEQUENCE public.control_clinico_control_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.control_clinico_control_id_seq OWNER TO sofia;

--
-- Name: control_clinico_control_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sofia
--

ALTER SEQUENCE public.control_clinico_control_id_seq OWNED BY public.control_clinico.control_id;


--
-- Name: episodio; Type: TABLE; Schema: public; Owner: sofia
--

CREATE TABLE public.episodio (
    episodio_id integer NOT NULL,
    paciente_id integer NOT NULL,
    cie10 public.enum_episodio_cie10 NOT NULL,
    tipo_fractura public.enum_episodio_tipo_fractura NOT NULL,
    lado public.enum_episodio_lado,
    procedencia public.enum_episodio_procedencia,
    comorbilidades jsonb,
    fecha_diagnostico timestamp with time zone NOT NULL,
    fecha_ingreso_quirurgico timestamp with time zone,
    fecha_alta timestamp with time zone,
    no_operado boolean DEFAULT false,
    causa_no_operar character varying(255),
    abo public.enum_episodio_abo,
    rh public.enum_episodio_rh,
    tabaco boolean DEFAULT false,
    alcohol boolean DEFAULT false,
    corticoides_cronicos boolean DEFAULT false,
    taco boolean DEFAULT false,
    fallecimiento boolean DEFAULT false,
    fecha_fallecimiento timestamp with time zone,
    transfusion boolean,
    reingreso boolean,
    comentario_evolucion text,
    notas_clinicas text,
    prequirurgicas text,
    postquirurgicas text
);


ALTER TABLE public.episodio OWNER TO sofia;

--
-- Name: episodio_episodio_id_seq; Type: SEQUENCE; Schema: public; Owner: sofia
--

CREATE SEQUENCE public.episodio_episodio_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.episodio_episodio_id_seq OWNER TO sofia;

--
-- Name: episodio_episodio_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sofia
--

ALTER SEQUENCE public.episodio_episodio_id_seq OWNED BY public.episodio.episodio_id;


--
-- Name: episodio_indicador; Type: TABLE; Schema: public; Owner: sofia
--

CREATE TABLE public.episodio_indicador (
    episodio_indicador_id integer NOT NULL,
    episodio_id integer NOT NULL,
    control_id integer,
    tipo public.enum_episodio_indicador_tipo NOT NULL,
    valor double precision,
    nivel public.enum_episodio_indicador_nivel,
    detalles jsonb,
    calculado_en timestamp with time zone
);


ALTER TABLE public.episodio_indicador OWNER TO sofia;

--
-- Name: episodio_indicador_episodio_indicador_id_seq; Type: SEQUENCE; Schema: public; Owner: sofia
--

CREATE SEQUENCE public.episodio_indicador_episodio_indicador_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.episodio_indicador_episodio_indicador_id_seq OWNER TO sofia;

--
-- Name: episodio_indicador_episodio_indicador_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sofia
--

ALTER SEQUENCE public.episodio_indicador_episodio_indicador_id_seq OWNED BY public.episodio_indicador.episodio_indicador_id;


--
-- Name: evolucion; Type: TABLE; Schema: public; Owner: sofia
--

CREATE TABLE public.evolucion (
    evolucion_id integer NOT NULL,
    episodio_id integer NOT NULL,
    transfusion_requerida boolean DEFAULT false,
    reingreso_30d boolean DEFAULT false,
    comentarios text
);


ALTER TABLE public.evolucion OWNER TO sofia;

--
-- Name: evolucion_evolucion_id_seq; Type: SEQUENCE; Schema: public; Owner: sofia
--

CREATE SEQUENCE public.evolucion_evolucion_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.evolucion_evolucion_id_seq OWNER TO sofia;

--
-- Name: evolucion_evolucion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sofia
--

ALTER SEQUENCE public.evolucion_evolucion_id_seq OWNED BY public.evolucion.evolucion_id;


--
-- Name: examen; Type: TABLE; Schema: public; Owner: sofia
--

CREATE TABLE public.examen (
    examen_id integer NOT NULL,
    tipo_examen character varying(255) NOT NULL,
    paciente_id integer NOT NULL,
    profesional_id integer
);


ALTER TABLE public.examen OWNER TO sofia;

--
-- Name: examen_examen_id_seq; Type: SEQUENCE; Schema: public; Owner: sofia
--

CREATE SEQUENCE public.examen_examen_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.examen_examen_id_seq OWNER TO sofia;

--
-- Name: examen_examen_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sofia
--

ALTER SEQUENCE public.examen_examen_id_seq OWNED BY public.examen.examen_id;


--
-- Name: generic_report; Type: TABLE; Schema: public; Owner: sofia
--

CREATE TABLE public.generic_report (
    report_id integer NOT NULL,
    examen_id integer NOT NULL,
    modalidad character varying(255),
    region_anat character varying(255),
    dicom_study_uid character varying(255),
    sitio_muestra character varying(255),
    procedimiento character varying(255),
    hallazgos text,
    impresion text,
    cod_snomed character varying(255),
    informado_por integer,
    informado_en timestamp with time zone
);


ALTER TABLE public.generic_report OWNER TO sofia;

--
-- Name: generic_report_report_id_seq; Type: SEQUENCE; Schema: public; Owner: sofia
--

CREATE SEQUENCE public.generic_report_report_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.generic_report_report_id_seq OWNER TO sofia;

--
-- Name: generic_report_report_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sofia
--

ALTER SEQUENCE public.generic_report_report_id_seq OWNED BY public.generic_report.report_id;


--
-- Name: indicador_riesgo; Type: TABLE; Schema: public; Owner: sofia
--

CREATE TABLE public.indicador_riesgo (
    indicador_id integer NOT NULL,
    descripcion text,
    puntaje double precision,
    resultado_id integer NOT NULL
);


ALTER TABLE public.indicador_riesgo OWNER TO sofia;

--
-- Name: indicador_riesgo_indicador_id_seq; Type: SEQUENCE; Schema: public; Owner: sofia
--

CREATE SEQUENCE public.indicador_riesgo_indicador_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.indicador_riesgo_indicador_id_seq OWNER TO sofia;

--
-- Name: indicador_riesgo_indicador_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sofia
--

ALTER SEQUENCE public.indicador_riesgo_indicador_id_seq OWNED BY public.indicador_riesgo.indicador_id;


--
-- Name: minuta; Type: TABLE; Schema: public; Owner: sofia
--

CREATE TABLE public.minuta (
    minuta_id integer NOT NULL,
    ruta_pdf character varying(255),
    fecha_creacion timestamp with time zone NOT NULL,
    funcionario_id integer NOT NULL,
    paciente_id integer NOT NULL,
    tecnologo_id integer NOT NULL,
    profesional_id integer
);


ALTER TABLE public.minuta OWNER TO sofia;

--
-- Name: minuta_minuta_id_seq; Type: SEQUENCE; Schema: public; Owner: sofia
--

CREATE SEQUENCE public.minuta_minuta_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.minuta_minuta_id_seq OWNER TO sofia;

--
-- Name: minuta_minuta_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sofia
--

ALTER SEQUENCE public.minuta_minuta_id_seq OWNED BY public.minuta.minuta_id;


--
-- Name: muestra; Type: TABLE; Schema: public; Owner: sofia
--

CREATE TABLE public.muestra (
    muestra_id integer NOT NULL,
    tipo_muestra character varying(255) NOT NULL,
    fecha_extraccion timestamp with time zone NOT NULL,
    fecha_recepcion timestamp with time zone,
    observaciones text,
    examen_id integer NOT NULL,
    profesional_id integer NOT NULL
);


ALTER TABLE public.muestra OWNER TO sofia;

--
-- Name: muestra_muestra_id_seq; Type: SEQUENCE; Schema: public; Owner: sofia
--

CREATE SEQUENCE public.muestra_muestra_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.muestra_muestra_id_seq OWNER TO sofia;

--
-- Name: muestra_muestra_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sofia
--

ALTER SEQUENCE public.muestra_muestra_id_seq OWNED BY public.muestra.muestra_id;


--
-- Name: pacientes; Type: TABLE; Schema: public; Owner: sofia
--

CREATE TABLE public.pacientes (
    user_id integer NOT NULL,
    tipo_sangre character varying(255),
    altura double precision,
    edad_anios integer,
    edad_meses integer
);


ALTER TABLE public.pacientes OWNER TO sofia;

--
-- Name: parametro_lab; Type: TABLE; Schema: public; Owner: sofia
--

CREATE TABLE public.parametro_lab (
    codigo character varying(255) NOT NULL,
    nombre character varying(255) NOT NULL,
    unidad character varying(255),
    ref_min double precision,
    ref_max double precision,
    notas text
);


ALTER TABLE public.parametro_lab OWNER TO sofia;

--
-- Name: professional_profiles; Type: TABLE; Schema: public; Owner: sofia
--

CREATE TABLE public.professional_profiles (
    id integer NOT NULL,
    user_id integer NOT NULL,
    rut character varying(16),
    rut_profesional character varying(16),
    especialidad character varying(120),
    cargo public.enum_professional_profiles_cargo NOT NULL,
    hospital character varying(120),
    departamento character varying(80),
    fecha_ingreso date,
    historial_pacientes jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.professional_profiles OWNER TO sofia;

--
-- Name: professional_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: sofia
--

CREATE SEQUENCE public.professional_profiles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.professional_profiles_id_seq OWNER TO sofia;

--
-- Name: professional_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sofia
--

ALTER SEQUENCE public.professional_profiles_id_seq OWNED BY public.professional_profiles.id;


--
-- Name: registro; Type: TABLE; Schema: public; Owner: sofia
--

CREATE TABLE public.registro (
    registro_id integer NOT NULL,
    accion character varying(255),
    fecha_registro timestamp with time zone NOT NULL,
    administrador_rut character varying(255),
    actor_user_rut character varying(255),
    administrador_id integer,
    actor_user_id integer
);


ALTER TABLE public.registro OWNER TO sofia;

--
-- Name: registro_registro_id_seq; Type: SEQUENCE; Schema: public; Owner: sofia
--

CREATE SEQUENCE public.registro_registro_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.registro_registro_id_seq OWNER TO sofia;

--
-- Name: registro_registro_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sofia
--

ALTER SEQUENCE public.registro_registro_id_seq OWNED BY public.registro.registro_id;


--
-- Name: resultado; Type: TABLE; Schema: public; Owner: sofia
--

CREATE TABLE public.resultado (
    resultado_id integer NOT NULL,
    episodio_id integer NOT NULL,
    muestra_id integer,
    examen_id integer,
    parametro character varying(255) NOT NULL,
    valor double precision NOT NULL,
    unidad character varying(255),
    fecha_resultado timestamp with time zone NOT NULL
);


ALTER TABLE public.resultado OWNER TO sofia;

--
-- Name: resultado_resultado_id_seq; Type: SEQUENCE; Schema: public; Owner: sofia
--

CREATE SEQUENCE public.resultado_resultado_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.resultado_resultado_id_seq OWNER TO sofia;

--
-- Name: resultado_resultado_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sofia
--

ALTER SEQUENCE public.resultado_resultado_id_seq OWNED BY public.resultado.resultado_id;


--
-- Name: suspension; Type: TABLE; Schema: public; Owner: sofia
--

CREATE TABLE public.suspension (
    suspension_id integer NOT NULL,
    episodio_id integer NOT NULL,
    fecha_suspension date NOT NULL,
    tipo public.enum_suspension_tipo NOT NULL,
    motivo character varying(255) NOT NULL
);


ALTER TABLE public.suspension OWNER TO sofia;

--
-- Name: suspension_suspension_id_seq; Type: SEQUENCE; Schema: public; Owner: sofia
--

CREATE SEQUENCE public.suspension_suspension_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.suspension_suspension_id_seq OWNER TO sofia;

--
-- Name: suspension_suspension_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sofia
--

ALTER SEQUENCE public.suspension_suspension_id_seq OWNED BY public.suspension.suspension_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: sofia
--

CREATE TABLE public.users (
    id integer NOT NULL,
    rut character varying(255) NOT NULL,
    nombres character varying(255) NOT NULL,
    apellido_paterno character varying(255) NOT NULL,
    apellido_materno character varying(255) NOT NULL,
    correo character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    telefono character varying(255),
    sexo public.enum_users_sexo NOT NULL,
    fecha_nacimiento date,
    fecha_creacion timestamp with time zone,
    email_verified boolean DEFAULT false,
    email_verify_token character varying(255),
    email_verify_expires timestamp with time zone
);


ALTER TABLE public.users OWNER TO sofia;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: sofia
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO sofia;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sofia
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: alerta alerta_id; Type: DEFAULT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.alerta ALTER COLUMN alerta_id SET DEFAULT nextval('public.alerta_alerta_id_seq'::regclass);


--
-- Name: antropometria antropometria_id; Type: DEFAULT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.antropometria ALTER COLUMN antropometria_id SET DEFAULT nextval('public.antropometria_antropometria_id_seq'::regclass);


--
-- Name: cirugia cirugia_id; Type: DEFAULT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.cirugia ALTER COLUMN cirugia_id SET DEFAULT nextval('public.cirugia_cirugia_id_seq'::regclass);


--
-- Name: complicacion complicacion_id; Type: DEFAULT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.complicacion ALTER COLUMN complicacion_id SET DEFAULT nextval('public.complicacion_complicacion_id_seq'::regclass);


--
-- Name: control_clinico control_id; Type: DEFAULT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.control_clinico ALTER COLUMN control_id SET DEFAULT nextval('public.control_clinico_control_id_seq'::regclass);


--
-- Name: episodio episodio_id; Type: DEFAULT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.episodio ALTER COLUMN episodio_id SET DEFAULT nextval('public.episodio_episodio_id_seq'::regclass);


--
-- Name: episodio_indicador episodio_indicador_id; Type: DEFAULT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.episodio_indicador ALTER COLUMN episodio_indicador_id SET DEFAULT nextval('public.episodio_indicador_episodio_indicador_id_seq'::regclass);


--
-- Name: evolucion evolucion_id; Type: DEFAULT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.evolucion ALTER COLUMN evolucion_id SET DEFAULT nextval('public.evolucion_evolucion_id_seq'::regclass);


--
-- Name: examen examen_id; Type: DEFAULT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.examen ALTER COLUMN examen_id SET DEFAULT nextval('public.examen_examen_id_seq'::regclass);


--
-- Name: generic_report report_id; Type: DEFAULT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.generic_report ALTER COLUMN report_id SET DEFAULT nextval('public.generic_report_report_id_seq'::regclass);


--
-- Name: indicador_riesgo indicador_id; Type: DEFAULT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.indicador_riesgo ALTER COLUMN indicador_id SET DEFAULT nextval('public.indicador_riesgo_indicador_id_seq'::regclass);


--
-- Name: minuta minuta_id; Type: DEFAULT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.minuta ALTER COLUMN minuta_id SET DEFAULT nextval('public.minuta_minuta_id_seq'::regclass);


--
-- Name: muestra muestra_id; Type: DEFAULT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.muestra ALTER COLUMN muestra_id SET DEFAULT nextval('public.muestra_muestra_id_seq'::regclass);


--
-- Name: professional_profiles id; Type: DEFAULT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.professional_profiles ALTER COLUMN id SET DEFAULT nextval('public.professional_profiles_id_seq'::regclass);


--
-- Name: registro registro_id; Type: DEFAULT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.registro ALTER COLUMN registro_id SET DEFAULT nextval('public.registro_registro_id_seq'::regclass);


--
-- Name: resultado resultado_id; Type: DEFAULT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.resultado ALTER COLUMN resultado_id SET DEFAULT nextval('public.resultado_resultado_id_seq'::regclass);


--
-- Name: suspension suspension_id; Type: DEFAULT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.suspension ALTER COLUMN suspension_id SET DEFAULT nextval('public.suspension_suspension_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: administradores administradores_pkey; Type: CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.administradores
    ADD CONSTRAINT administradores_pkey PRIMARY KEY (user_id);


--
-- Name: alerta alerta_pkey; Type: CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.alerta
    ADD CONSTRAINT alerta_pkey PRIMARY KEY (alerta_id);


--
-- Name: antropometria antropometria_pkey; Type: CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.antropometria
    ADD CONSTRAINT antropometria_pkey PRIMARY KEY (antropometria_id);


--
-- Name: cirugia cirugia_pkey; Type: CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.cirugia
    ADD CONSTRAINT cirugia_pkey PRIMARY KEY (cirugia_id);


--
-- Name: complicacion complicacion_pkey; Type: CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.complicacion
    ADD CONSTRAINT complicacion_pkey PRIMARY KEY (complicacion_id);


--
-- Name: control_clinico control_clinico_pkey; Type: CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.control_clinico
    ADD CONSTRAINT control_clinico_pkey PRIMARY KEY (control_id);


--
-- Name: episodio_indicador episodio_indicador_pkey; Type: CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.episodio_indicador
    ADD CONSTRAINT episodio_indicador_pkey PRIMARY KEY (episodio_indicador_id);


--
-- Name: episodio episodio_pkey; Type: CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.episodio
    ADD CONSTRAINT episodio_pkey PRIMARY KEY (episodio_id);


--
-- Name: evolucion evolucion_pkey; Type: CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.evolucion
    ADD CONSTRAINT evolucion_pkey PRIMARY KEY (evolucion_id);


--
-- Name: examen examen_pkey; Type: CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.examen
    ADD CONSTRAINT examen_pkey PRIMARY KEY (examen_id);


--
-- Name: generic_report generic_report_pkey; Type: CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.generic_report
    ADD CONSTRAINT generic_report_pkey PRIMARY KEY (report_id);


--
-- Name: indicador_riesgo indicador_riesgo_pkey; Type: CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.indicador_riesgo
    ADD CONSTRAINT indicador_riesgo_pkey PRIMARY KEY (indicador_id);


--
-- Name: minuta minuta_pkey; Type: CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.minuta
    ADD CONSTRAINT minuta_pkey PRIMARY KEY (minuta_id);


--
-- Name: muestra muestra_pkey; Type: CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.muestra
    ADD CONSTRAINT muestra_pkey PRIMARY KEY (muestra_id);


--
-- Name: pacientes pacientes_pkey; Type: CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.pacientes
    ADD CONSTRAINT pacientes_pkey PRIMARY KEY (user_id);


--
-- Name: parametro_lab parametro_lab_pkey; Type: CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.parametro_lab
    ADD CONSTRAINT parametro_lab_pkey PRIMARY KEY (codigo);


--
-- Name: professional_profiles professional_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.professional_profiles
    ADD CONSTRAINT professional_profiles_pkey PRIMARY KEY (id);


--
-- Name: professional_profiles professional_profiles_rut_key; Type: CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.professional_profiles
    ADD CONSTRAINT professional_profiles_rut_key UNIQUE (rut);


--
-- Name: professional_profiles professional_profiles_rut_profesional_key; Type: CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.professional_profiles
    ADD CONSTRAINT professional_profiles_rut_profesional_key UNIQUE (rut_profesional);


--
-- Name: professional_profiles professional_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.professional_profiles
    ADD CONSTRAINT professional_profiles_user_id_key UNIQUE (user_id);


--
-- Name: registro registro_pkey; Type: CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.registro
    ADD CONSTRAINT registro_pkey PRIMARY KEY (registro_id);


--
-- Name: resultado resultado_pkey; Type: CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.resultado
    ADD CONSTRAINT resultado_pkey PRIMARY KEY (resultado_id);


--
-- Name: suspension suspension_pkey; Type: CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.suspension
    ADD CONSTRAINT suspension_pkey PRIMARY KEY (suspension_id);


--
-- Name: users users_correo_key; Type: CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_correo_key UNIQUE (correo);


--
-- Name: users users_email_verify_token_key; Type: CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_verify_token_key UNIQUE (email_verify_token);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_rut_key; Type: CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_rut_key UNIQUE (rut);


--
-- Name: professional_profiles_cargo; Type: INDEX; Schema: public; Owner: sofia
--

CREATE INDEX professional_profiles_cargo ON public.professional_profiles USING btree (cargo);


--
-- Name: professional_profiles_rut; Type: INDEX; Schema: public; Owner: sofia
--

CREATE UNIQUE INDEX professional_profiles_rut ON public.professional_profiles USING btree (rut);


--
-- Name: professional_profiles_rut_profesional; Type: INDEX; Schema: public; Owner: sofia
--

CREATE UNIQUE INDEX professional_profiles_rut_profesional ON public.professional_profiles USING btree (rut_profesional);


--
-- Name: professional_profiles_user_id; Type: INDEX; Schema: public; Owner: sofia
--

CREATE UNIQUE INDEX professional_profiles_user_id ON public.professional_profiles USING btree (user_id);


--
-- Name: administradores administradores_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.administradores
    ADD CONSTRAINT administradores_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: alerta alerta_cirugia_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.alerta
    ADD CONSTRAINT alerta_cirugia_id_fkey FOREIGN KEY (cirugia_id) REFERENCES public.cirugia(cirugia_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: alerta alerta_episodio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.alerta
    ADD CONSTRAINT alerta_episodio_id_fkey FOREIGN KEY (episodio_id) REFERENCES public.episodio(episodio_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: alerta alerta_indicador_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.alerta
    ADD CONSTRAINT alerta_indicador_id_fkey FOREIGN KEY (indicador_id) REFERENCES public.indicador_riesgo(indicador_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: alerta alerta_resultado_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.alerta
    ADD CONSTRAINT alerta_resultado_id_fkey FOREIGN KEY (resultado_id) REFERENCES public.resultado(resultado_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: alerta alerta_suspension_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.alerta
    ADD CONSTRAINT alerta_suspension_id_fkey FOREIGN KEY (suspension_id) REFERENCES public.suspension(suspension_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: antropometria antropometria_episodio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.antropometria
    ADD CONSTRAINT antropometria_episodio_id_fkey FOREIGN KEY (episodio_id) REFERENCES public.episodio(episodio_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cirugia cirugia_episodio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.cirugia
    ADD CONSTRAINT cirugia_episodio_id_fkey FOREIGN KEY (episodio_id) REFERENCES public.episodio(episodio_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: complicacion complicacion_episodio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.complicacion
    ADD CONSTRAINT complicacion_episodio_id_fkey FOREIGN KEY (episodio_id) REFERENCES public.episodio(episodio_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: control_clinico control_clinico_episodio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.control_clinico
    ADD CONSTRAINT control_clinico_episodio_id_fkey FOREIGN KEY (episodio_id) REFERENCES public.episodio(episodio_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: control_clinico control_clinico_profesional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.control_clinico
    ADD CONSTRAINT control_clinico_profesional_id_fkey FOREIGN KEY (profesional_id) REFERENCES public.professional_profiles(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: episodio_indicador episodio_indicador_control_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.episodio_indicador
    ADD CONSTRAINT episodio_indicador_control_id_fkey FOREIGN KEY (control_id) REFERENCES public.control_clinico(control_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: episodio_indicador episodio_indicador_episodio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.episodio_indicador
    ADD CONSTRAINT episodio_indicador_episodio_id_fkey FOREIGN KEY (episodio_id) REFERENCES public.episodio(episodio_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: episodio episodio_paciente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.episodio
    ADD CONSTRAINT episodio_paciente_id_fkey FOREIGN KEY (paciente_id) REFERENCES public.pacientes(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: evolucion evolucion_episodio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.evolucion
    ADD CONSTRAINT evolucion_episodio_id_fkey FOREIGN KEY (episodio_id) REFERENCES public.episodio(episodio_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: examen examen_paciente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.examen
    ADD CONSTRAINT examen_paciente_id_fkey FOREIGN KEY (paciente_id) REFERENCES public.pacientes(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: examen examen_profesional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.examen
    ADD CONSTRAINT examen_profesional_id_fkey FOREIGN KEY (profesional_id) REFERENCES public.professional_profiles(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: generic_report generic_report_examen_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.generic_report
    ADD CONSTRAINT generic_report_examen_id_fkey FOREIGN KEY (examen_id) REFERENCES public.examen(examen_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: minuta minuta_paciente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.minuta
    ADD CONSTRAINT minuta_paciente_id_fkey FOREIGN KEY (paciente_id) REFERENCES public.pacientes(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: minuta minuta_profesional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.minuta
    ADD CONSTRAINT minuta_profesional_id_fkey FOREIGN KEY (profesional_id) REFERENCES public.professional_profiles(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: muestra muestra_examen_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.muestra
    ADD CONSTRAINT muestra_examen_id_fkey FOREIGN KEY (examen_id) REFERENCES public.examen(examen_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: muestra muestra_profesional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.muestra
    ADD CONSTRAINT muestra_profesional_id_fkey FOREIGN KEY (profesional_id) REFERENCES public.professional_profiles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: pacientes pacientes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.pacientes
    ADD CONSTRAINT pacientes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: professional_profiles professional_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.professional_profiles
    ADD CONSTRAINT professional_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: registro registro_actor_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.registro
    ADD CONSTRAINT registro_actor_user_id_fkey FOREIGN KEY (actor_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: registro registro_administrador_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.registro
    ADD CONSTRAINT registro_administrador_id_fkey FOREIGN KEY (administrador_id) REFERENCES public.administradores(user_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: resultado resultado_episodio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.resultado
    ADD CONSTRAINT resultado_episodio_id_fkey FOREIGN KEY (episodio_id) REFERENCES public.episodio(episodio_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: resultado resultado_examen_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.resultado
    ADD CONSTRAINT resultado_examen_id_fkey FOREIGN KEY (examen_id) REFERENCES public.examen(examen_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: resultado resultado_muestra_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.resultado
    ADD CONSTRAINT resultado_muestra_id_fkey FOREIGN KEY (muestra_id) REFERENCES public.muestra(muestra_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: resultado resultado_parametro_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.resultado
    ADD CONSTRAINT resultado_parametro_fkey FOREIGN KEY (parametro) REFERENCES public.parametro_lab(codigo) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: suspension suspension_episodio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sofia
--

ALTER TABLE ONLY public.suspension
    ADD CONSTRAINT suspension_episodio_id_fkey FOREIGN KEY (episodio_id) REFERENCES public.episodio(episodio_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

