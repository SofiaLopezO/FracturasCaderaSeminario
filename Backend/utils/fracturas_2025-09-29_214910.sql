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
-- Data for Name: administradores; Type: TABLE DATA; Schema: public; Owner: sofia
--

COPY public.administradores (user_id, nivel_acceso) FROM stdin;
9	\N
\.


--
-- Data for Name: alerta; Type: TABLE DATA; Schema: public; Owner: sofia
--

COPY public.alerta (alerta_id, episodio_id, tipo, severidad, mensaje, indicador_id, resultado_id, suspension_id, cirugia_id, activa, resuelta_en) FROM stdin;
1	1	LAB	ALTA	HB fuera de rango	1	1	\N	1	t	\N
2	2	LAB	BAJA	HB fuera de rango	2	5	\N	2	t	\N
3	3	LAB	ALTA	HB fuera de rango	3	9	\N	3	t	\N
4	4	LAB	MEDIA	HB fuera de rango	4	13	\N	4	t	\N
5	5	LAB	ALTA	HB fuera de rango	5	17	\N	5	t	\N
6	6	LAB	MEDIA	HB fuera de rango	6	21	\N	6	t	\N
7	7	LAB	ALTA	HB fuera de rango	7	25	\N	7	t	\N
8	8	LAB	BAJA	HB fuera de rango	8	29	\N	8	t	\N
9	9	LAB	MEDIA	HB fuera de rango	9	33	\N	9	t	\N
10	10	LAB	ALTA	HB fuera de rango	10	37	\N	10	t	\N
11	11	LAB	ALTA	HB fuera de rango	11	41	\N	11	t	\N
12	12	LAB	MEDIA	HB fuera de rango	12	45	\N	12	t	\N
13	13	LAB	MEDIA	HB fuera de rango	13	49	\N	13	t	\N
14	14	LAB	ALTA	HB fuera de rango	14	53	\N	14	t	\N
15	15	LAB	BAJA	HB fuera de rango	15	57	\N	15	t	\N
16	16	LAB	ALTA	HB fuera de rango	16	61	\N	16	t	\N
17	17	LAB	BAJA	HB fuera de rango	17	65	\N	17	t	\N
18	18	LAB	MEDIA	HB fuera de rango	18	69	\N	18	t	\N
19	19	LAB	MEDIA	HB fuera de rango	19	73	\N	19	t	\N
20	20	LAB	BAJA	HB fuera de rango	20	77	\N	20	t	\N
21	21	LAB	ALTA	HB fuera de rango	21	81	\N	21	t	\N
22	22	LAB	BAJA	HB fuera de rango	22	85	\N	22	t	\N
23	23	LAB	MEDIA	HB fuera de rango	23	89	\N	23	t	\N
24	24	LAB	BAJA	HB fuera de rango	24	93	\N	24	t	\N
25	25	LAB	ALTA	HB fuera de rango	25	97	\N	25	t	\N
26	26	LAB	MEDIA	HB fuera de rango	26	101	\N	26	t	\N
27	32	LAB	ALTA	25-OH: 15 ng/mL (bajo). Referencia >= 30 ng/mL.	\N	107	\N	\N	t	\N
28	32	LAB	ALTA	25-OH: 1 ng/mL (bajo). Referencia >= 30 ng/mL.	\N	108	\N	\N	t	\N
29	31	LAB	ALTA	25-OH: 1 ng/mL (bajo). Referencia >= 30 ng/mL.	\N	109	\N	\N	t	\N
30	31	LAB	ALTA	25-OH: 1 ng/mL (bajo). Referencia >= 30 ng/mL.	\N	111	\N	\N	t	\N
57	50	RIESGO	ALTA	Riesgo de refractura alto (puntaje 11).	\N	\N	\N	\N	t	\N
58	50	LAB	MEDIA	HB fuera de rango	40	231	\N	42	t	\N
59	51	RIESGO	ALTA	Riesgo de refractura alto (puntaje 8).	\N	\N	\N	\N	t	\N
60	51	LAB	ALTA	HB fuera de rango	41	238	\N	43	t	\N
61	52	RIESGO	MEDIA	Riesgo de refractura moderado (puntaje 7).	\N	\N	\N	\N	t	\N
62	52	LAB	ALTA	HB fuera de rango	42	245	\N	44	t	\N
63	53	RIESGO	ALTA	Riesgo de refractura alto (puntaje 8).	\N	\N	\N	\N	t	\N
64	53	LAB	BAJA	HB fuera de rango	43	252	\N	45	t	\N
65	54	RIESGO	ALTA	Riesgo de refractura alto (puntaje 10).	\N	\N	\N	\N	t	\N
66	54	LAB	BAJA	HB fuera de rango	44	259	\N	46	t	\N
67	55	RIESGO	MEDIA	Riesgo de refractura moderado (puntaje 4).	\N	\N	\N	\N	t	\N
68	55	LAB	MEDIA	HB fuera de rango	45	266	\N	47	t	\N
69	56	RIESGO	ALTA	Riesgo de refractura alto (puntaje 21).	\N	\N	\N	\N	t	\N
70	56	LAB	ALTA	Hemoglobina críticamente baja (9.5 g/dL).	46	273	18	48	t	\N
71	57	RIESGO	ALTA	Riesgo de refractura alto (puntaje 11).	\N	\N	\N	\N	t	\N
72	57	LAB	MEDIA	Hemoglobina disminuida (11.2 g/dL).	47	280	\N	49	t	\N
73	58	LAB	BAJA	Control rutinario de hemoglobina (12.8 g/dL).	48	287	\N	50	t	\N
74	58	LAB	ALTA	Transferrina: 246 mg/dL (bajo). Referencia 250 mg/dL - 380 mg/dL.	\N	295	\N	\N	t	\N
75	58	LAB	ALTA	Transferrina: 246 mg/dL (bajo). Referencia 250 mg/dL - 380 mg/dL.	\N	296	\N	\N	t	\N
\.


--
-- Data for Name: antropometria; Type: TABLE DATA; Schema: public; Owner: sofia
--

COPY public.antropometria (antropometria_id, episodio_id, peso_kg, altura_m) FROM stdin;
1	1	57.2	1.53
2	2	73.8	1.57
3	3	76.1	1.71
4	4	65.2	1.58
5	5	63.4	1.57
6	6	56	1.67
7	7	70.9	1.64
8	8	77.6	1.76
9	9	57.1	1.59
10	10	65.7	1.53
11	11	66.7	1.68
12	12	64.7	1.75
13	13	68.7	1.68
14	14	75.1	1.76
15	15	57.8	1.54
16	16	68.2	1.71
17	17	63.8	1.67
18	18	75.3	1.77
19	19	67.3	1.62
20	20	56.7	1.53
21	21	59.1	1.75
22	22	61	1.75
23	23	65	1.62
24	24	74.3	1.68
25	25	77.1	1.51
26	26	64.3	1.71
44	50	81.7	1.61
45	51	48.7	1.64
46	52	50	1.76
47	53	75.4	1.56
48	54	72.3	1.54
49	55	87.5	1.71
50	56	50.5	1.56
51	57	64	1.68
52	58	58	1.62
\.


--
-- Data for Name: cirugia; Type: TABLE DATA; Schema: public; Owner: sofia
--

COPY public.cirugia (cirugia_id, episodio_id, fecha, hora_inicio, hora_fin, tecnica, lado, reoperacion, complicacion_intraop, operador_id) FROM stdin;
1	1	2025-08-27	08:00	10:00	APC	IZQUIERDO	f	\N	1
2	2	2025-08-12	08:00	10:00	DHS	DERECHO	f	\N	1
3	3	2025-08-27	08:00	10:00	APC	BILATERAL	f	\N	1
4	4	2025-08-12	08:00	10:00	APC	IZQUIERDO	f	\N	1
5	5	2025-08-27	08:00	10:00	ATC	DERECHO	f	\N	1
6	6	2025-08-12	08:00	10:00	APC	BILATERAL	f	\N	1
7	7	2025-08-27	08:00	10:00	APC	BILATERAL	f	\N	1
8	8	2025-08-12	08:00	10:00	ATC	IZQUIERDO	f	\N	1
9	9	2025-07-28	08:00	10:00	BIP	IZQUIERDO	f	\N	1
10	10	2025-07-13	08:00	10:00	GAMMA	BILATERAL	f	\N	1
11	11	2025-08-27	08:00	10:00	DHS	BILATERAL	f	\N	1
12	12	2025-08-12	08:00	10:00	ATC	DERECHO	f	\N	1
13	13	2025-07-28	08:00	10:00	GAMMA	IZQUIERDO	f	\N	1
14	14	2025-07-13	08:00	10:00	DHS	DERECHO	f	\N	1
15	15	2025-08-27	08:00	10:00	DHS	BILATERAL	f	\N	1
16	16	2025-08-12	08:00	10:00	BIP	DERECHO	f	\N	1
17	17	2025-07-28	08:00	10:00	APC	DERECHO	f	\N	1
18	18	2025-07-13	08:00	10:00	DHS	IZQUIERDO	f	\N	1
19	19	2025-08-27	08:00	10:00	APC	DERECHO	f	\N	1
20	20	2025-08-12	08:00	10:00	GAMMA	IZQUIERDO	f	\N	1
21	21	2025-07-28	08:00	10:00	APC	DERECHO	f	\N	1
22	22	2025-07-13	08:00	10:00	BIP	IZQUIERDO	f	\N	1
23	23	2025-08-27	08:00	10:00	ATC	DERECHO	f	\N	1
24	24	2025-08-12	08:00	10:00	ATC	BILATERAL	f	\N	1
25	25	2025-07-28	08:00	10:00	DHS	BILATERAL	f	\N	1
26	26	2025-07-13	08:00	10:00	APC	BILATERAL	f	\N	1
42	50	2025-09-01	14:45	16:45	BIP	DERECHO	f	\N	1
43	51	2025-08-17	14:45	16:45	GAMMA	DERECHO	f	\N	1
44	52	2025-09-03	14:45	16:45	GAMMA	BILATERAL	f	\N	1
45	53	2025-08-17	16:45	18:45	ATC	IZQUIERDO	f	\N	1
46	54	2025-09-03	14:45	16:45	DHS	DERECHO	f	\N	1
47	55	2025-08-19	14:45	16:45	GAMMA	DERECHO	f	\N	1
48	56	2025-08-13	04:45	06:45	GAMMA	IZQUIERDO	f	\N	1
49	57	2025-08-21	20:45	22:45	DHS	DERECHO	f	\N	1
50	58	2025-08-31	16:45	18:45	ATC	IZQUIERDO	f	\N	1
\.


--
-- Data for Name: complicacion; Type: TABLE DATA; Schema: public; Owner: sofia
--

COPY public.complicacion (complicacion_id, episodio_id, momento, presente, descripcion) FROM stdin;
1	1	INTRA	t	Sin complicación mayor
2	2	INTRA	t	Sin complicación mayor
3	3	POST	t	Sin complicación mayor
4	4	INTRA	t	Sin complicación mayor
5	5	INTRA	t	Sin complicación mayor
6	6	POST	t	Sin complicación mayor
7	7	PRE	t	Sin complicación mayor
8	8	POST	t	Sin complicación mayor
9	9	PRE	t	Sin complicación mayor
10	10	INTRA	t	Sin complicación mayor
11	11	INTRA	t	Sin complicación mayor
12	12	INTRA	t	Sin complicación mayor
13	13	PRE	t	Sin complicación mayor
14	14	INTRA	t	Sin complicación mayor
15	15	PRE	t	Sin complicación mayor
16	16	INTRA	t	Sin complicación mayor
17	17	INTRA	t	Sin complicación mayor
18	18	POST	t	Sin complicación mayor
19	19	PRE	t	Sin complicación mayor
20	20	POST	t	Sin complicación mayor
21	21	PRE	t	Sin complicación mayor
22	22	PRE	t	Sin complicación mayor
23	23	POST	t	Sin complicación mayor
24	24	POST	t	Sin complicación mayor
25	25	PRE	t	Sin complicación mayor
26	26	INTRA	t	Sin complicación mayor
42	50	INTRA	t	Sin complicación mayor
43	51	PRE	t	Sin complicación mayor
44	52	PRE	t	Sin complicación mayor
45	53	POST	t	Sin complicación mayor
46	54	PRE	t	Sin complicación mayor
47	55	POST	t	Sin complicación mayor
48	56	POST	t	Hipotensión transitoria
49	57	INTRA	t	Sangrado controlado
50	58	PRE	t	Dolor controlado con analgesia
\.


--
-- Data for Name: control_clinico; Type: TABLE DATA; Schema: public; Owner: sofia
--

COPY public.control_clinico (control_id, episodio_id, profesional_id, profesional_nombre, origen, tipo_control, resumen, fecha_hora_control, comorbilidades, tabaco, alcohol, corticoides_cronicos, taco, prequirurgicas, postquirurgicas, notas_clinicas, notas_evolucion, complicaciones, transfusion, reingreso) FROM stdin;
35	50	1	Felipe Funcionario Perez	Guardado	SEGUIMIENTO	Control de ingreso	2025-08-30 06:45:08.703636-04	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
36	50	3	Iván Investigador Rios	Minuta	SEGUIMIENTO	Control de evolución	2025-09-02 00:45:08.703636-04	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
37	51	1	Felipe Funcionario Perez	Guardado	SEGUIMIENTO	Control de ingreso	2025-08-15 06:45:08.810307-04	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
38	51	3	Iván Investigador Rios	Minuta	SEGUIMIENTO	Control de evolución	2025-08-18 00:45:08.810307-04	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
39	52	1	Felipe Funcionario Perez	Guardado	SEGUIMIENTO	Control de ingreso	2025-08-30 06:45:08.909469-04	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
40	52	3	Iván Investigador Rios	Minuta	SEGUIMIENTO	Control de evolución	2025-09-02 00:45:08.909469-04	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
41	53	1	Felipe Funcionario Perez	Guardado	SEGUIMIENTO	Control de ingreso	2025-08-15 06:45:09.006427-04	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
42	53	3	Iván Investigador Rios	Minuta	SEGUIMIENTO	Control de evolución	2025-08-18 00:45:09.006427-04	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
43	54	1	Felipe Funcionario Perez	Guardado	SEGUIMIENTO	Control de ingreso	2025-08-30 06:45:09.10414-04	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
44	54	3	Iván Investigador Rios	Minuta	SEGUIMIENTO	Control de evolución	2025-09-02 00:45:09.10414-04	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
45	55	1	Felipe Funcionario Perez	Guardado	SEGUIMIENTO	Control de ingreso	2025-08-15 06:45:09.187588-04	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
46	55	3	Iván Investigador Rios	Minuta	SEGUIMIENTO	Control de evolución	2025-08-18 00:45:09.187588-04	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
47	56	1	Felipe Funcionario Perez	Guardado	SEGUIMIENTO	Evaluación inicial estable	2025-08-10 06:45:09.272637-04	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
48	56	3	Iván Investigador Rios	Minuta	SEGUIMIENTO	Seguimiento con signos de anemia	2025-08-13 00:45:09.272637-04	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
49	57	1	Felipe Funcionario Perez	Guardado	SEGUIMIENTO	Paciente compensa dolor, se planifica cirugía	2025-08-20 04:45:09.272637-04	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
50	57	3	Iván Investigador Rios	Minuta	SEGUIMIENTO	Se observa recuperación lenta, sin sangrado	2025-08-22 00:45:09.272637-04	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
51	58	1	Felipe Funcionario Perez	Guardado	SEGUIMIENTO	Ingreso sin complicaciones mayores	2025-08-30 05:45:09.272637-04	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
52	58	3	Iván Investigador Rios	Minuta	SEGUIMIENTO	Buen pronóstico funcional	2025-08-31 00:45:09.272637-04	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: episodio; Type: TABLE DATA; Schema: public; Owner: sofia
--

COPY public.episodio (episodio_id, paciente_id, cie10, tipo_fractura, lado, procedencia, comorbilidades, fecha_diagnostico, fecha_ingreso_quirurgico, fecha_alta, no_operado, causa_no_operar, abo, rh, tabaco, alcohol, corticoides_cronicos, taco, fallecimiento, fecha_fallecimiento, transfusion, reingreso, comentario_evolucion, notas_clinicas, prequirurgicas, postquirurgicas) FROM stdin;
17	6	S72.0	INTRACAPSULAR	DERECHO	URGENCIA	\N	2025-07-25 02:17:49.543972-04	2025-07-27 02:17:49.543972-04	2025-08-01 02:17:49.543972-04	f	\N	AB	Rh+	f	f	f	f	f	\N	\N	\N	\N	Ingreso por Fx cadera (paciente 3, episodio 3)	\N	\N
18	6	S72.0	SUBTROCANTERICA	DERECHO	URGENCIA	\N	2025-07-10 02:17:49.572223-04	2025-07-12 02:17:49.572223-04	2025-07-17 02:17:49.572223-04	f	\N	O	Rh+	t	t	f	f	f	\N	\N	\N	\N	Ingreso por Fx cadera (paciente 3, episodio 4)	\N	\N
19	7	S72.2	INTRACAPSULAR	DERECHO	URGENCIA	\N	2025-08-24 02:17:49.724258-04	2025-08-26 02:17:49.724258-04	2025-08-31 02:17:49.724258-04	f	\N	B	Rh+	f	t	f	f	f	\N	\N	\N	\N	Ingreso por Fx cadera (paciente 4, episodio 1)	\N	\N
20	7	S72.0	PERTROCANTERICA	BILATERAL	APS	\N	2025-08-09 02:17:49.779452-04	2025-08-11 02:17:49.779452-04	2025-08-16 02:17:49.779452-04	f	\N	AB	Rh-	t	f	f	t	f	\N	\N	\N	\N	Ingreso por Fx cadera (paciente 4, episodio 2)	\N	\N
21	7	S72.0	INTRACAPSULAR	DERECHO	APS	\N	2025-07-25 02:17:49.8302-04	2025-07-27 02:17:49.8302-04	2025-08-01 02:17:49.8302-04	f	\N	A	Rh+	f	t	f	f	f	\N	\N	\N	\N	Ingreso por Fx cadera (paciente 4, episodio 3)	\N	\N
22	7	S72.0	SUBTROCANTERICA	BILATERAL	URGENCIA	\N	2025-07-10 02:17:49.871827-04	2025-07-12 02:17:49.871827-04	2025-07-17 02:17:49.871827-04	f	\N	B	Rh-	t	f	f	t	f	\N	\N	\N	\N	Ingreso por Fx cadera (paciente 4, episodio 4)	\N	\N
23	8	S72.2	SUBTROCANTERICA	BILATERAL	OTRO_CENTRO	\N	2025-08-24 02:17:50.031909-04	2025-08-26 02:17:50.031909-04	2025-08-31 02:17:50.031909-04	f	\N	O	Rh-	f	f	f	f	f	\N	\N	\N	\N	Ingreso por Fx cadera (paciente 5, episodio 1)	\N	\N
24	8	S72.1	INTRACAPSULAR	IZQUIERDO	APS	\N	2025-08-09 02:17:50.088339-04	2025-08-11 02:17:50.088339-04	2025-08-16 02:17:50.088339-04	f	\N	A	Rh+	t	t	f	f	f	\N	\N	\N	\N	Ingreso por Fx cadera (paciente 5, episodio 2)	\N	\N
25	8	S72.2	PERTROCANTERICA	DERECHO	APS	\N	2025-07-25 02:17:50.140266-04	2025-07-27 02:17:50.140266-04	2025-08-01 02:17:50.140266-04	f	\N	O	Rh+	f	f	f	f	f	\N	\N	\N	\N	Ingreso por Fx cadera (paciente 5, episodio 3)	\N	\N
26	8	S72.1	PERTROCANTERICA	BILATERAL	OTRO_CENTRO	\N	2025-07-10 02:17:50.182842-04	2025-07-12 02:17:50.182842-04	2025-07-17 02:17:50.182842-04	f	\N	A	Rh-	t	t	f	f	f	\N	\N	\N	\N	Ingreso por Fx cadera (paciente 5, episodio 4)	\N	\N
2	4	S72.0	INTRACAPSULAR	DERECHO	APS	\N	2025-08-09 02:17:45.946279-04	2025-08-11 02:17:45.946279-04	2025-08-16 02:17:45.946279-04	f	\N	AB	Rh+	t	t	f	f	f	\N	t	\N	\N	Ingreso por Fx cadera (paciente 1, episodio 2)	\N	\N
3	5	S72.1	INTRACAPSULAR	IZQUIERDO	URGENCIA	\N	2025-08-24 02:17:46.122866-04	2025-08-26 02:17:46.122866-04	2025-08-31 02:17:46.122866-04	f	\N	AB	Rh-	f	t	f	f	f	\N	t	\N	\N	Ingreso por Fx cadera (paciente 2, episodio 1)	\N	\N
4	5	S72.2	PERTROCANTERICA	IZQUIERDO	APS	\N	2025-08-09 02:17:46.180664-04	2025-08-11 02:17:46.180664-04	2025-08-16 02:17:46.180664-04	f	\N	B	Rh+	t	f	f	t	f	\N	t	\N	\N	Ingreso por Fx cadera (paciente 2, episodio 2)	\N	\N
5	6	S72.1	PERTROCANTERICA	BILATERAL	URGENCIA	\N	2025-08-24 02:17:46.357657-04	2025-08-26 02:17:46.357657-04	2025-08-31 02:17:46.357657-04	f	\N	AB	Rh+	f	f	f	f	f	\N	t	\N	\N	Ingreso por Fx cadera (paciente 3, episodio 1)	\N	\N
6	6	S72.0	SUBTROCANTERICA	IZQUIERDO	OTRO_CENTRO	\N	2025-08-09 02:17:46.415182-04	2025-08-11 02:17:46.415182-04	2025-08-16 02:17:46.415182-04	f	\N	O	Rh-	t	t	f	f	f	\N	t	\N	\N	Ingreso por Fx cadera (paciente 3, episodio 2)	\N	\N
7	4	S72.2	SUBTROCANTERICA	BILATERAL	APS	\N	2025-08-24 02:17:49.217961-04	2025-08-26 02:17:49.217961-04	2025-08-31 02:17:49.217961-04	f	\N	AB	Rh+	f	f	f	f	f	\N	t	\N	\N	Ingreso por Fx cadera (paciente 1, episodio 1)	\N	\N
8	4	S72.0	SUBTROCANTERICA	DERECHO	OTRO_CENTRO	\N	2025-08-09 02:17:49.254414-04	2025-08-11 02:17:49.254414-04	2025-08-16 02:17:49.254414-04	f	\N	AB	Rh-	t	t	f	f	f	\N	t	\N	\N	Ingreso por Fx cadera (paciente 1, episodio 2)	\N	\N
9	4	S72.0	PERTROCANTERICA	BILATERAL	URGENCIA	\N	2025-07-25 02:17:49.286702-04	2025-07-27 02:17:49.286702-04	2025-08-01 02:17:49.286702-04	f	\N	AB	Rh+	f	f	f	f	f	\N	t	\N	\N	Ingreso por Fx cadera (paciente 1, episodio 3)	\N	\N
10	4	S72.1	PERTROCANTERICA	DERECHO	URGENCIA	\N	2025-07-10 02:17:49.319871-04	2025-07-12 02:17:49.319871-04	2025-07-17 02:17:49.319871-04	f	\N	A	Rh-	t	t	f	f	f	\N	t	\N	\N	Ingreso por Fx cadera (paciente 1, episodio 4)	\N	\N
11	5	S72.0	INTRACAPSULAR	BILATERAL	OTRO_CENTRO	\N	2025-08-24 02:17:49.353789-04	2025-08-26 02:17:49.353789-04	2025-08-31 02:17:49.353789-04	f	\N	AB	Rh-	f	t	f	f	f	\N	t	\N	\N	Ingreso por Fx cadera (paciente 2, episodio 1)	\N	\N
12	5	S72.1	INTRACAPSULAR	DERECHO	URGENCIA	\N	2025-08-09 02:17:49.386353-04	2025-08-11 02:17:49.386353-04	2025-08-16 02:17:49.386353-04	f	\N	B	Rh+	t	f	f	t	f	\N	t	\N	\N	Ingreso por Fx cadera (paciente 2, episodio 2)	\N	\N
13	5	S72.1	SUBTROCANTERICA	IZQUIERDO	APS	\N	2025-07-25 02:17:49.419078-04	2025-07-27 02:17:49.419078-04	2025-08-01 02:17:49.419078-04	f	\N	B	Rh-	f	t	f	f	f	\N	t	\N	\N	Ingreso por Fx cadera (paciente 2, episodio 3)	\N	\N
14	5	S72.0	SUBTROCANTERICA	DERECHO	APS	\N	2025-07-10 02:17:49.45091-04	2025-07-12 02:17:49.45091-04	2025-07-17 02:17:49.45091-04	f	\N	O	Rh-	t	f	f	t	f	\N	t	\N	\N	Ingreso por Fx cadera (paciente 2, episodio 4)	\N	\N
15	6	S72.0	SUBTROCANTERICA	DERECHO	APS	\N	2025-08-24 02:17:49.483391-04	2025-08-26 02:17:49.483391-04	2025-08-31 02:17:49.483391-04	f	\N	B	Rh-	f	f	f	f	f	\N	t	\N	\N	Ingreso por Fx cadera (paciente 3, episodio 1)	\N	\N
27	4	S72.0	PERTROCANTERICA	\N	\N	["DM2", "EPOC", "ERC", "ECV/ACV", "Parkinson", "Epilesia"]	2025-08-24 02:17:45.879-04	2025-08-26 02:17:45.879-04	2025-08-31 02:17:45.879-04	f	\N	\N	\N	f	f	f	f	f	\N	\N	\N	\N	\N	\N	\N
28	8	S72.1	SUBTROCANTERICA	IZQUIERDO	Derivación APS	["EPOC", "ERC"]	2025-08-24 02:17:50.031-04	\N	\N	f	\N	\N	\N	t	t	t	t	\N	\N	\N	\N	\N	sdasd	asdasd	asdasd
29	8	S72.2	SUBTROCANTERICA	BILATERAL	OTRO_CENTRO	[]	2025-08-24 02:17:50.031-04	\N	\N	f	\N	\N	\N	f	f	f	f	\N	\N	\N	\N	\N	asdasdasd	\N	\N
1	4	S72.0	PERTROCANTERICA	\N	\N	["A", "B"]	2025-08-24 02:17:45.879758-04	2025-08-26 02:17:45.879758-04	2025-08-31 02:17:45.879758-04	f	\N	A	Rh-	f	f	f	f	f	\N	\N	\N	\N	\N	\N	\N
16	6	S72.1	SUBTROCANTERICA	BILATERAL	APS	["DM2", "EPOC"]	2025-08-09 02:17:49.515369-04	2025-08-11 02:17:49.515369-04	2025-08-16 02:17:49.515369-04	f	\N	O	Rh+	t	t	f	f	f	\N	\N	\N	\N	Ingreso por Fx cadera (paciente 3, episodio 2)	\N	\N
30	4	S72.0	PERTROCANTERICA	\N	\N	["DM2", "ERC", "ECV/ACV"]	2025-08-25 02:17:45.879-04	\N	\N	f	\N	\N	\N	f	f	f	f	\N	\N	\N	\N	\N	\N	\N	\N
31	8	S72.1	SUBTROCANTERICA	IZQUIERDO	Derivación APS	["Parkinson", "ECV/ACV"]	2025-08-24 02:17:50.031-04	\N	\N	f	\N	\N	\N	t	f	f	t	\N	\N	\N	\N	\N	Ingreso por Fx cadera (paciente 5, episodio 1)	dfsdg	dfsdgsdf
32	8	S72.1	SUBTROCANTERICA	IZQUIERDO	Derivación APS	["Parkinson", "ECV/ACV"]	2025-08-24 02:17:50.031-04	\N	\N	f	\N	\N	\N	t	f	f	t	\N	\N	\N	\N	\N	Ingreso por Fx cadera (paciente 5, episodio 1)	dfsdg	dfsdgsdf
50	4	S72.0	INTRACAPSULAR	DERECHO	URGENCIA	\N	2025-08-30 00:45:08.703636-04	2025-08-31 00:45:08.703636-04	2025-09-08 11:45:08.703636-03	f	\N	B	Rh-	f	f	f	f	f	\N	\N	\N	\N	Ingreso por Fx cadera (paciente 1, episodio 1)	\N	\N
51	4	S72.0	INTRACAPSULAR	DERECHO	APS	\N	2025-08-15 00:45:08.810307-04	2025-08-16 00:45:08.810307-04	2025-08-23 10:45:08.810307-04	f	\N	A	Rh+	f	t	f	f	f	\N	\N	\N	\N	Ingreso por Fx cadera (paciente 1, episodio 2)	\N	\N
52	5	S72.0	INTRACAPSULAR	BILATERAL	URGENCIA	\N	2025-08-30 00:45:08.909469-04	2025-09-02 00:45:08.909469-04	2025-09-06 10:45:08.909469-04	f	\N	AB	Rh+	f	f	f	t	f	\N	\N	\N	\N	Ingreso por Fx cadera (paciente 2, episodio 1)	\N	\N
53	5	S72.0	INTRACAPSULAR	IZQUIERDO	URGENCIA	\N	2025-08-15 00:45:09.006427-04	2025-08-16 00:45:09.006427-04	2025-08-22 12:45:09.006427-04	f	\N	A	Rh+	t	t	f	f	f	\N	\N	\N	\N	Ingreso por Fx cadera (paciente 2, episodio 2)	\N	\N
54	6	S72.0	INTRACAPSULAR	DERECHO	OTRO_CENTRO	\N	2025-08-30 00:45:09.10414-04	2025-09-02 00:45:09.10414-04	2025-09-06 10:45:09.10414-04	f	\N	AB	Rh-	f	t	f	t	f	\N	\N	\N	\N	Ingreso por Fx cadera (paciente 3, episodio 1)	\N	\N
55	6	S72.0	INTRACAPSULAR	DERECHO	OTRO_CENTRO	\N	2025-08-15 00:45:09.187588-04	2025-08-18 00:45:09.187588-04	2025-08-25 10:45:09.187588-04	f	\N	B	Rh-	t	f	f	f	f	\N	\N	\N	\N	Ingreso por Fx cadera (paciente 3, episodio 2)	\N	\N
56	18	S72.0	INTRACAPSULAR	IZQUIERDO	URGENCIA	\N	2025-08-10 00:45:09.272637-04	2025-08-12 00:45:09.272637-04	2025-08-20 00:45:09.272637-04	f	\N	O	Rh-	t	t	t	t	f	\N	\N	\N	\N	CURATED_ALTA_EP1	\N	\N
57	19	S72.1	PERTROCANTERICA	DERECHO	APS	\N	2025-08-20 00:45:09.272637-04	2025-08-21 00:45:09.272637-04	2025-08-26 16:45:09.272637-04	f	\N	B	Rh-	f	t	f	f	f	\N	\N	\N	\N	CURATED_MODERADA_EP1	\N	\N
58	20	S72.2	SUBTROCANTERICA	IZQUIERDO	OTRO_CENTRO	\N	2025-08-30 00:45:09.272637-04	2025-08-31 00:45:09.272637-04	2025-09-04 12:45:09.272637-04	f	\N	B	Rh+	f	f	f	f	f	\N	\N	\N	\N	CURATED_BAJA_EP1	\N	\N
\.


--
-- Data for Name: episodio_indicador; Type: TABLE DATA; Schema: public; Owner: sofia
--

COPY public.episodio_indicador (episodio_indicador_id, episodio_id, control_id, tipo, valor, nivel, detalles, calculado_en) FROM stdin;
281	50	\N	RIESGO_FACTOR_EDAD_80	0	\N	{"cumple": false, "puntos": 1, "unidad": "años", "dominio": "Generales", "criterio": "Edad ≥ 80 años", "tipo_factor": "RIESGO_FACTOR_EDAD_80", "valor_medido": 70, "puntaje_otorgado": 0}	2025-09-29 01:45:08.738109-03
282	50	\N	RIESGO_FACTOR_SEXO_FEMENINO	1	\N	{"cumple": true, "puntos": 1, "dominio": "Generales", "criterio": "Sexo femenino", "tipo_factor": "RIESGO_FACTOR_SEXO_FEMENINO", "valor_medido": "F", "puntaje_otorgado": 1}	2025-09-29 01:45:08.741256-03
283	50	\N	RIESGO_FACTOR_FRACTURA_FRAGILIDAD	2	\N	{"cumple": true, "puntos": 2, "dominio": "Generales", "criterio": "Fractura previa por fragilidad", "tipo_factor": "RIESGO_FACTOR_FRACTURA_FRAGILIDAD", "valor_medido": true, "puntaje_otorgado": 2}	2025-09-29 01:45:08.744023-03
284	50	\N	RIESGO_FACTOR_FRACTURA_VERTEBRAL	1	\N	{"cumple": true, "puntos": 1, "dominio": "Generales", "criterio": "Fractura vertebral previa", "tipo_factor": "RIESGO_FACTOR_FRACTURA_VERTEBRAL", "valor_medido": true, "puntaje_otorgado": 1}	2025-09-29 01:45:08.746741-03
285	50	\N	RIESGO_FACTOR_ANTECEDENTE_FAMILIAR	1	\N	{"cumple": true, "puntos": 1, "dominio": "Generales", "criterio": "Antecedente familiar de fractura de cadera", "tipo_factor": "RIESGO_FACTOR_ANTECEDENTE_FAMILIAR", "valor_medido": true, "puntaje_otorgado": 1}	2025-09-29 01:45:08.749383-03
286	50	\N	RIESGO_FACTOR_VITAMINA_D	0	\N	{"cumple": false, "puntos": 2, "unidad": "ng/mL", "dominio": "Bioquímicos", "criterio": "Vitamina D < 20 ng/mL", "tipo_factor": "RIESGO_FACTOR_VITAMINA_D", "valor_medido": 21.3, "puntaje_otorgado": 0}	2025-09-29 01:45:08.752062-03
287	50	\N	RIESGO_FACTOR_ALBUMINA	1	\N	{"cumple": true, "puntos": 1, "unidad": "g/dL", "dominio": "Bioquímicos", "criterio": "Albúmina < 3.5 g/dL", "tipo_factor": "RIESGO_FACTOR_ALBUMINA", "valor_medido": 3.11, "puntaje_otorgado": 1}	2025-09-29 01:45:08.754659-03
288	50	\N	RIESGO_FACTOR_HEMOGLOBINA	0	\N	{"cumple": false, "puntos": 1, "unidad": "g/dL", "dominio": "Bioquímicos", "criterio": "Hemoglobina < 11 g/dL", "tipo_factor": "RIESGO_FACTOR_HEMOGLOBINA", "valor_medido": 11.5, "puntaje_otorgado": 0}	2025-09-29 01:45:08.757313-03
289	50	\N	RIESGO_FACTOR_CREATININA	0	\N	{"cumple": false, "puntos": 1, "unidad": "mg/dL", "dominio": "Bioquímicos", "criterio": "Creatinina sérica ≥ 1.3 mg/dL", "tipo_factor": "RIESGO_FACTOR_CREATININA", "valor_medido": 1.28, "puntaje_otorgado": 0}	2025-09-29 01:45:08.759954-03
290	50	\N	RIESGO_FACTOR_NLR	1	\N	{"cumple": true, "puntos": 1, "dominio": "Bioquímicos", "criterio": "NLR > 4.5", "tipo_factor": "RIESGO_FACTOR_NLR", "valor_medido": 6.74, "puntaje_otorgado": 1}	2025-09-29 01:45:08.762689-03
291	50	\N	RIESGO_FACTOR_MLR	1	\N	{"cumple": true, "puntos": 1, "dominio": "Bioquímicos", "criterio": "MLR > 0.35", "tipo_factor": "RIESGO_FACTOR_MLR", "valor_medido": 0.51, "puntaje_otorgado": 1}	2025-09-29 01:45:08.765354-03
292	50	\N	RIESGO_FACTOR_COMORBILIDADES	0	\N	{"conteo": 1, "cumple": false, "puntos": 1, "dominio": "Clínico-funcional", "criterio": "Nº comorbilidades ≥ 2", "tipo_factor": "RIESGO_FACTOR_COMORBILIDADES", "puntaje_otorgado": 0, "detalle_comorbilidades": ["DM2"]}	2025-09-29 01:45:08.768029-03
293	50	\N	RIESGO_FACTOR_BARTHEL	0	\N	{"cumple": false, "puntos": 1, "dominio": "Clínico-funcional", "criterio": "Índice de Barthel ≤ 30", "tipo_factor": "RIESGO_FACTOR_BARTHEL", "puntaje_barthel": 53, "puntaje_otorgado": 0}	2025-09-29 01:45:08.770679-03
294	50	\N	RIESGO_FACTOR_IMC	0	\N	{"cumple": false, "puntos": 1, "unidad": "kg/m²", "dominio": "Clínico-funcional", "criterio": "IMC ≤ 18.5 kg/m²", "tipo_factor": "RIESGO_FACTOR_IMC", "valor_medido": 31.5, "puntaje_otorgado": 0}	2025-09-29 01:45:08.773551-03
295	50	\N	RIESGO_FACTOR_TABACO	0	\N	{"cumple": false, "puntos": 1, "dominio": "Hábitos", "criterio": "Tabaquismo activo", "tipo_factor": "RIESGO_FACTOR_TABACO", "valor_medido": false, "puntaje_otorgado": 0}	2025-09-29 01:45:08.776192-03
296	50	\N	RIESGO_FACTOR_CORTICOIDES	0	\N	{"cumple": false, "puntos": 1, "dominio": "Hábitos", "criterio": "Glucocorticoides orales crónicos ≥ 3 meses", "tipo_factor": "RIESGO_FACTOR_CORTICOIDES", "valor_medido": false, "puntaje_otorgado": 0}	2025-09-29 01:45:08.778794-03
297	50	\N	RIESGO_FACTOR_ALCOHOL	0	\N	{"cumple": false, "puntos": 1, "dominio": "Hábitos", "criterio": "Alcohol ≥ 3/día", "tipo_factor": "RIESGO_FACTOR_ALCOHOL", "valor_medido": false, "puntaje_otorgado": 0}	2025-09-29 01:45:08.781426-03
298	50	\N	RIESGO_FACTOR_SUBCAPITAL	2	\N	{"cumple": true, "puntos": 2, "dominio": "Quirúrgicos", "criterio": "Subcapital desplazada", "tipo_factor": "RIESGO_FACTOR_SUBCAPITAL", "valor_medido": true, "tipo_fractura": "INTRACAPSULAR", "puntaje_otorgado": 2}	2025-09-29 01:45:08.784141-03
299	50	\N	RIESGO_FACTOR_RETRASO_QX	1	\N	{"cumple": true, "puntos": 1, "dominio": "Quirúrgicos", "criterio": "Retraso quirúrgico > 48 h", "tipo_factor": "RIESGO_FACTOR_RETRASO_QX", "horas_retraso": 58.0, "puntaje_otorgado": 1}	2025-09-29 01:45:08.786781-03
300	50	\N	RIESGO_REFRACTURA	11	ALTO	{"color": "ROJO", "nivel": "ALTO", "criterios": [{"cumple": false, "puntos": 1, "unidad": "años", "dominio": "Generales", "criterio": "Edad ≥ 80 años", "tipo_factor": "RIESGO_FACTOR_EDAD_80", "valor_medido": 70, "puntaje_otorgado": 0}, {"cumple": true, "puntos": 1, "dominio": "Generales", "criterio": "Sexo femenino", "tipo_factor": "RIESGO_FACTOR_SEXO_FEMENINO", "valor_medido": "F", "puntaje_otorgado": 1}, {"cumple": true, "puntos": 2, "dominio": "Generales", "criterio": "Fractura previa por fragilidad", "tipo_factor": "RIESGO_FACTOR_FRACTURA_FRAGILIDAD", "valor_medido": true, "puntaje_otorgado": 2}, {"cumple": true, "puntos": 1, "dominio": "Generales", "criterio": "Fractura vertebral previa", "tipo_factor": "RIESGO_FACTOR_FRACTURA_VERTEBRAL", "valor_medido": true, "puntaje_otorgado": 1}, {"cumple": true, "puntos": 1, "dominio": "Generales", "criterio": "Antecedente familiar de fractura de cadera", "tipo_factor": "RIESGO_FACTOR_ANTECEDENTE_FAMILIAR", "valor_medido": true, "puntaje_otorgado": 1}, {"cumple": false, "puntos": 2, "unidad": "ng/mL", "dominio": "Bioquímicos", "criterio": "Vitamina D < 20 ng/mL", "tipo_factor": "RIESGO_FACTOR_VITAMINA_D", "valor_medido": 21.3, "puntaje_otorgado": 0}, {"cumple": true, "puntos": 1, "unidad": "g/dL", "dominio": "Bioquímicos", "criterio": "Albúmina < 3.5 g/dL", "tipo_factor": "RIESGO_FACTOR_ALBUMINA", "valor_medido": 3.11, "puntaje_otorgado": 1}, {"cumple": false, "puntos": 1, "unidad": "g/dL", "dominio": "Bioquímicos", "criterio": "Hemoglobina < 11 g/dL", "tipo_factor": "RIESGO_FACTOR_HEMOGLOBINA", "valor_medido": 11.5, "puntaje_otorgado": 0}, {"cumple": false, "puntos": 1, "unidad": "mg/dL", "dominio": "Bioquímicos", "criterio": "Creatinina sérica ≥ 1.3 mg/dL", "tipo_factor": "RIESGO_FACTOR_CREATININA", "valor_medido": 1.28, "puntaje_otorgado": 0}, {"cumple": true, "puntos": 1, "dominio": "Bioquímicos", "criterio": "NLR > 4.5", "tipo_factor": "RIESGO_FACTOR_NLR", "valor_medido": 6.74, "puntaje_otorgado": 1}, {"cumple": true, "puntos": 1, "dominio": "Bioquímicos", "criterio": "MLR > 0.35", "tipo_factor": "RIESGO_FACTOR_MLR", "valor_medido": 0.51, "puntaje_otorgado": 1}, {"conteo": 1, "cumple": false, "puntos": 1, "dominio": "Clínico-funcional", "criterio": "Nº comorbilidades ≥ 2", "tipo_factor": "RIESGO_FACTOR_COMORBILIDADES", "puntaje_otorgado": 0, "detalle_comorbilidades": ["DM2"]}, {"cumple": false, "puntos": 1, "dominio": "Clínico-funcional", "criterio": "Índice de Barthel ≤ 30", "tipo_factor": "RIESGO_FACTOR_BARTHEL", "puntaje_barthel": 53, "puntaje_otorgado": 0}, {"cumple": false, "puntos": 1, "unidad": "kg/m²", "dominio": "Clínico-funcional", "criterio": "IMC ≤ 18.5 kg/m²", "tipo_factor": "RIESGO_FACTOR_IMC", "valor_medido": 31.5, "puntaje_otorgado": 0}, {"cumple": false, "puntos": 1, "dominio": "Hábitos", "criterio": "Tabaquismo activo", "tipo_factor": "RIESGO_FACTOR_TABACO", "valor_medido": false, "puntaje_otorgado": 0}, {"cumple": false, "puntos": 1, "dominio": "Hábitos", "criterio": "Glucocorticoides orales crónicos ≥ 3 meses", "tipo_factor": "RIESGO_FACTOR_CORTICOIDES", "valor_medido": false, "puntaje_otorgado": 0}, {"cumple": false, "puntos": 1, "dominio": "Hábitos", "criterio": "Alcohol ≥ 3/día", "tipo_factor": "RIESGO_FACTOR_ALCOHOL", "valor_medido": false, "puntaje_otorgado": 0}, {"cumple": true, "puntos": 2, "dominio": "Quirúrgicos", "criterio": "Subcapital desplazada", "tipo_factor": "RIESGO_FACTOR_SUBCAPITAL", "valor_medido": true, "tipo_fractura": "INTRACAPSULAR", "puntaje_otorgado": 2}, {"cumple": true, "puntos": 1, "dominio": "Quirúrgicos", "criterio": "Retraso quirúrgico > 48 h", "tipo_factor": "RIESGO_FACTOR_RETRASO_QX", "horas_retraso": 58.0, "puntaje_otorgado": 1}], "puntaje_total": 11}	2025-09-29 01:45:08.789418-03
301	51	\N	RIESGO_FACTOR_EDAD_80	0	\N	{"cumple": false, "puntos": 1, "unidad": "años", "dominio": "Generales", "criterio": "Edad ≥ 80 años", "tipo_factor": "RIESGO_FACTOR_EDAD_80", "valor_medido": 70, "puntaje_otorgado": 0}	2025-09-29 01:45:08.840031-03
302	51	\N	RIESGO_FACTOR_SEXO_FEMENINO	1	\N	{"cumple": true, "puntos": 1, "dominio": "Generales", "criterio": "Sexo femenino", "tipo_factor": "RIESGO_FACTOR_SEXO_FEMENINO", "valor_medido": "F", "puntaje_otorgado": 1}	2025-09-29 01:45:08.842606-03
303	51	\N	RIESGO_FACTOR_FRACTURA_FRAGILIDAD	0	\N	{"cumple": false, "puntos": 2, "dominio": "Generales", "criterio": "Fractura previa por fragilidad", "tipo_factor": "RIESGO_FACTOR_FRACTURA_FRAGILIDAD", "valor_medido": false, "puntaje_otorgado": 0}	2025-09-29 01:45:08.84519-03
304	51	\N	RIESGO_FACTOR_FRACTURA_VERTEBRAL	1	\N	{"cumple": true, "puntos": 1, "dominio": "Generales", "criterio": "Fractura vertebral previa", "tipo_factor": "RIESGO_FACTOR_FRACTURA_VERTEBRAL", "valor_medido": true, "puntaje_otorgado": 1}	2025-09-29 01:45:08.847767-03
305	51	\N	RIESGO_FACTOR_ANTECEDENTE_FAMILIAR	0	\N	{"cumple": false, "puntos": 1, "dominio": "Generales", "criterio": "Antecedente familiar de fractura de cadera", "tipo_factor": "RIESGO_FACTOR_ANTECEDENTE_FAMILIAR", "valor_medido": false, "puntaje_otorgado": 0}	2025-09-29 01:45:08.8503-03
306	51	\N	RIESGO_FACTOR_VITAMINA_D	0	\N	{"cumple": false, "puntos": 2, "unidad": "ng/mL", "dominio": "Bioquímicos", "criterio": "Vitamina D < 20 ng/mL", "tipo_factor": "RIESGO_FACTOR_VITAMINA_D", "valor_medido": 26.7, "puntaje_otorgado": 0}	2025-09-29 01:45:08.852938-03
307	51	\N	RIESGO_FACTOR_ALBUMINA	0	\N	{"cumple": false, "puntos": 1, "unidad": "g/dL", "dominio": "Bioquímicos", "criterio": "Albúmina < 3.5 g/dL", "tipo_factor": "RIESGO_FACTOR_ALBUMINA", "valor_medido": 3.73, "puntaje_otorgado": 0}	2025-09-29 01:45:08.855524-03
308	51	\N	RIESGO_FACTOR_HEMOGLOBINA	0	\N	{"cumple": false, "puntos": 1, "unidad": "g/dL", "dominio": "Bioquímicos", "criterio": "Hemoglobina < 11 g/dL", "tipo_factor": "RIESGO_FACTOR_HEMOGLOBINA", "valor_medido": 11.8, "puntaje_otorgado": 0}	2025-09-29 01:45:08.858097-03
309	51	\N	RIESGO_FACTOR_CREATININA	0	\N	{"cumple": false, "puntos": 1, "unidad": "mg/dL", "dominio": "Bioquímicos", "criterio": "Creatinina sérica ≥ 1.3 mg/dL", "tipo_factor": "RIESGO_FACTOR_CREATININA", "valor_medido": 0.71, "puntaje_otorgado": 0}	2025-09-29 01:45:08.86071-03
310	51	\N	RIESGO_FACTOR_NLR	1	\N	{"cumple": true, "puntos": 1, "dominio": "Bioquímicos", "criterio": "NLR > 4.5", "tipo_factor": "RIESGO_FACTOR_NLR", "valor_medido": 5.43, "puntaje_otorgado": 1}	2025-09-29 01:45:08.863574-03
311	51	\N	RIESGO_FACTOR_MLR	0	\N	{"cumple": false, "puntos": 1, "dominio": "Bioquímicos", "criterio": "MLR > 0.35", "tipo_factor": "RIESGO_FACTOR_MLR", "valor_medido": 0.31, "puntaje_otorgado": 0}	2025-09-29 01:45:08.866151-03
312	51	\N	RIESGO_FACTOR_COMORBILIDADES	0	\N	{"conteo": 1, "cumple": false, "puntos": 1, "dominio": "Clínico-funcional", "criterio": "Nº comorbilidades ≥ 2", "tipo_factor": "RIESGO_FACTOR_COMORBILIDADES", "puntaje_otorgado": 0, "detalle_comorbilidades": ["HTA"]}	2025-09-29 01:45:08.868703-03
313	51	\N	RIESGO_FACTOR_BARTHEL	0	\N	{"cumple": false, "puntos": 1, "dominio": "Clínico-funcional", "criterio": "Índice de Barthel ≤ 30", "tipo_factor": "RIESGO_FACTOR_BARTHEL", "puntaje_barthel": 78, "puntaje_otorgado": 0}	2025-09-29 01:45:08.87127-03
314	51	\N	RIESGO_FACTOR_IMC	1	\N	{"cumple": true, "puntos": 1, "unidad": "kg/m²", "dominio": "Clínico-funcional", "criterio": "IMC ≤ 18.5 kg/m²", "tipo_factor": "RIESGO_FACTOR_IMC", "valor_medido": 18.1, "puntaje_otorgado": 1}	2025-09-29 01:45:08.873812-03
315	51	\N	RIESGO_FACTOR_TABACO	0	\N	{"cumple": false, "puntos": 1, "dominio": "Hábitos", "criterio": "Tabaquismo activo", "tipo_factor": "RIESGO_FACTOR_TABACO", "valor_medido": false, "puntaje_otorgado": 0}	2025-09-29 01:45:08.876379-03
316	51	\N	RIESGO_FACTOR_CORTICOIDES	0	\N	{"cumple": false, "puntos": 1, "dominio": "Hábitos", "criterio": "Glucocorticoides orales crónicos ≥ 3 meses", "tipo_factor": "RIESGO_FACTOR_CORTICOIDES", "valor_medido": false, "puntaje_otorgado": 0}	2025-09-29 01:45:08.878969-03
317	51	\N	RIESGO_FACTOR_ALCOHOL	1	\N	{"cumple": true, "puntos": 1, "dominio": "Hábitos", "criterio": "Alcohol ≥ 3/día", "tipo_factor": "RIESGO_FACTOR_ALCOHOL", "valor_medido": true, "puntaje_otorgado": 1}	2025-09-29 01:45:08.881549-03
318	51	\N	RIESGO_FACTOR_SUBCAPITAL	2	\N	{"cumple": true, "puntos": 2, "dominio": "Quirúrgicos", "criterio": "Subcapital desplazada", "tipo_factor": "RIESGO_FACTOR_SUBCAPITAL", "valor_medido": true, "tipo_fractura": "INTRACAPSULAR", "puntaje_otorgado": 2}	2025-09-29 01:45:08.884359-03
319	51	\N	RIESGO_FACTOR_RETRASO_QX	1	\N	{"cumple": true, "puntos": 1, "dominio": "Quirúrgicos", "criterio": "Retraso quirúrgico > 48 h", "tipo_factor": "RIESGO_FACTOR_RETRASO_QX", "horas_retraso": 58.0, "puntaje_otorgado": 1}	2025-09-29 01:45:08.886939-03
320	51	\N	RIESGO_REFRACTURA	8	ALTO	{"color": "ROJO", "nivel": "ALTO", "criterios": [{"cumple": false, "puntos": 1, "unidad": "años", "dominio": "Generales", "criterio": "Edad ≥ 80 años", "tipo_factor": "RIESGO_FACTOR_EDAD_80", "valor_medido": 70, "puntaje_otorgado": 0}, {"cumple": true, "puntos": 1, "dominio": "Generales", "criterio": "Sexo femenino", "tipo_factor": "RIESGO_FACTOR_SEXO_FEMENINO", "valor_medido": "F", "puntaje_otorgado": 1}, {"cumple": false, "puntos": 2, "dominio": "Generales", "criterio": "Fractura previa por fragilidad", "tipo_factor": "RIESGO_FACTOR_FRACTURA_FRAGILIDAD", "valor_medido": false, "puntaje_otorgado": 0}, {"cumple": true, "puntos": 1, "dominio": "Generales", "criterio": "Fractura vertebral previa", "tipo_factor": "RIESGO_FACTOR_FRACTURA_VERTEBRAL", "valor_medido": true, "puntaje_otorgado": 1}, {"cumple": false, "puntos": 1, "dominio": "Generales", "criterio": "Antecedente familiar de fractura de cadera", "tipo_factor": "RIESGO_FACTOR_ANTECEDENTE_FAMILIAR", "valor_medido": false, "puntaje_otorgado": 0}, {"cumple": false, "puntos": 2, "unidad": "ng/mL", "dominio": "Bioquímicos", "criterio": "Vitamina D < 20 ng/mL", "tipo_factor": "RIESGO_FACTOR_VITAMINA_D", "valor_medido": 26.7, "puntaje_otorgado": 0}, {"cumple": false, "puntos": 1, "unidad": "g/dL", "dominio": "Bioquímicos", "criterio": "Albúmina < 3.5 g/dL", "tipo_factor": "RIESGO_FACTOR_ALBUMINA", "valor_medido": 3.73, "puntaje_otorgado": 0}, {"cumple": false, "puntos": 1, "unidad": "g/dL", "dominio": "Bioquímicos", "criterio": "Hemoglobina < 11 g/dL", "tipo_factor": "RIESGO_FACTOR_HEMOGLOBINA", "valor_medido": 11.8, "puntaje_otorgado": 0}, {"cumple": false, "puntos": 1, "unidad": "mg/dL", "dominio": "Bioquímicos", "criterio": "Creatinina sérica ≥ 1.3 mg/dL", "tipo_factor": "RIESGO_FACTOR_CREATININA", "valor_medido": 0.71, "puntaje_otorgado": 0}, {"cumple": true, "puntos": 1, "dominio": "Bioquímicos", "criterio": "NLR > 4.5", "tipo_factor": "RIESGO_FACTOR_NLR", "valor_medido": 5.43, "puntaje_otorgado": 1}, {"cumple": false, "puntos": 1, "dominio": "Bioquímicos", "criterio": "MLR > 0.35", "tipo_factor": "RIESGO_FACTOR_MLR", "valor_medido": 0.31, "puntaje_otorgado": 0}, {"conteo": 1, "cumple": false, "puntos": 1, "dominio": "Clínico-funcional", "criterio": "Nº comorbilidades ≥ 2", "tipo_factor": "RIESGO_FACTOR_COMORBILIDADES", "puntaje_otorgado": 0, "detalle_comorbilidades": ["HTA"]}, {"cumple": false, "puntos": 1, "dominio": "Clínico-funcional", "criterio": "Índice de Barthel ≤ 30", "tipo_factor": "RIESGO_FACTOR_BARTHEL", "puntaje_barthel": 78, "puntaje_otorgado": 0}, {"cumple": true, "puntos": 1, "unidad": "kg/m²", "dominio": "Clínico-funcional", "criterio": "IMC ≤ 18.5 kg/m²", "tipo_factor": "RIESGO_FACTOR_IMC", "valor_medido": 18.1, "puntaje_otorgado": 1}, {"cumple": false, "puntos": 1, "dominio": "Hábitos", "criterio": "Tabaquismo activo", "tipo_factor": "RIESGO_FACTOR_TABACO", "valor_medido": false, "puntaje_otorgado": 0}, {"cumple": false, "puntos": 1, "dominio": "Hábitos", "criterio": "Glucocorticoides orales crónicos ≥ 3 meses", "tipo_factor": "RIESGO_FACTOR_CORTICOIDES", "valor_medido": false, "puntaje_otorgado": 0}, {"cumple": true, "puntos": 1, "dominio": "Hábitos", "criterio": "Alcohol ≥ 3/día", "tipo_factor": "RIESGO_FACTOR_ALCOHOL", "valor_medido": true, "puntaje_otorgado": 1}, {"cumple": true, "puntos": 2, "dominio": "Quirúrgicos", "criterio": "Subcapital desplazada", "tipo_factor": "RIESGO_FACTOR_SUBCAPITAL", "valor_medido": true, "tipo_fractura": "INTRACAPSULAR", "puntaje_otorgado": 2}, {"cumple": true, "puntos": 1, "dominio": "Quirúrgicos", "criterio": "Retraso quirúrgico > 48 h", "tipo_factor": "RIESGO_FACTOR_RETRASO_QX", "horas_retraso": 58.0, "puntaje_otorgado": 1}], "puntaje_total": 8}	2025-09-29 01:45:08.889523-03
321	52	\N	RIESGO_FACTOR_EDAD_80	0	\N	{"cumple": false, "puntos": 1, "unidad": "años", "dominio": "Generales", "criterio": "Edad ≥ 80 años", "tipo_factor": "RIESGO_FACTOR_EDAD_80", "valor_medido": 71, "puntaje_otorgado": 0}	2025-09-29 01:45:08.937659-03
322	52	\N	RIESGO_FACTOR_SEXO_FEMENINO	0	\N	{"cumple": false, "puntos": 1, "dominio": "Generales", "criterio": "Sexo femenino", "tipo_factor": "RIESGO_FACTOR_SEXO_FEMENINO", "valor_medido": "M", "puntaje_otorgado": 0}	2025-09-29 01:45:08.940287-03
323	52	\N	RIESGO_FACTOR_FRACTURA_FRAGILIDAD	0	\N	{"cumple": false, "puntos": 2, "dominio": "Generales", "criterio": "Fractura previa por fragilidad", "tipo_factor": "RIESGO_FACTOR_FRACTURA_FRAGILIDAD", "valor_medido": false, "puntaje_otorgado": 0}	2025-09-29 01:45:08.942891-03
324	52	\N	RIESGO_FACTOR_FRACTURA_VERTEBRAL	1	\N	{"cumple": true, "puntos": 1, "dominio": "Generales", "criterio": "Fractura vertebral previa", "tipo_factor": "RIESGO_FACTOR_FRACTURA_VERTEBRAL", "valor_medido": true, "puntaje_otorgado": 1}	2025-09-29 01:45:08.945449-03
325	52	\N	RIESGO_FACTOR_ANTECEDENTE_FAMILIAR	0	\N	{"cumple": false, "puntos": 1, "dominio": "Generales", "criterio": "Antecedente familiar de fractura de cadera", "tipo_factor": "RIESGO_FACTOR_ANTECEDENTE_FAMILIAR", "valor_medido": false, "puntaje_otorgado": 0}	2025-09-29 01:45:08.948037-03
326	52	\N	RIESGO_FACTOR_VITAMINA_D	0	\N	{"cumple": false, "puntos": 2, "unidad": "ng/mL", "dominio": "Bioquímicos", "criterio": "Vitamina D < 20 ng/mL", "tipo_factor": "RIESGO_FACTOR_VITAMINA_D", "valor_medido": 27.7, "puntaje_otorgado": 0}	2025-09-29 01:45:08.950608-03
327	52	\N	RIESGO_FACTOR_ALBUMINA	0	\N	{"cumple": false, "puntos": 1, "unidad": "g/dL", "dominio": "Bioquímicos", "criterio": "Albúmina < 3.5 g/dL", "tipo_factor": "RIESGO_FACTOR_ALBUMINA", "valor_medido": 4.37, "puntaje_otorgado": 0}	2025-09-29 01:45:08.953178-03
328	52	\N	RIESGO_FACTOR_HEMOGLOBINA	0	\N	{"cumple": false, "puntos": 1, "unidad": "g/dL", "dominio": "Bioquímicos", "criterio": "Hemoglobina < 11 g/dL", "tipo_factor": "RIESGO_FACTOR_HEMOGLOBINA", "valor_medido": 13.1, "puntaje_otorgado": 0}	2025-09-29 01:45:08.955758-03
329	52	\N	RIESGO_FACTOR_CREATININA	0	\N	{"cumple": false, "puntos": 1, "unidad": "mg/dL", "dominio": "Bioquímicos", "criterio": "Creatinina sérica ≥ 1.3 mg/dL", "tipo_factor": "RIESGO_FACTOR_CREATININA", "valor_medido": 0.86, "puntaje_otorgado": 0}	2025-09-29 01:45:08.958331-03
330	52	\N	RIESGO_FACTOR_NLR	0	\N	{"cumple": false, "puntos": 1, "dominio": "Bioquímicos", "criterio": "NLR > 4.5", "tipo_factor": "RIESGO_FACTOR_NLR", "valor_medido": 3.01, "puntaje_otorgado": 0}	2025-09-29 01:45:08.960936-03
331	52	\N	RIESGO_FACTOR_MLR	1	\N	{"cumple": true, "puntos": 1, "dominio": "Bioquímicos", "criterio": "MLR > 0.35", "tipo_factor": "RIESGO_FACTOR_MLR", "valor_medido": 0.5, "puntaje_otorgado": 1}	2025-09-29 01:45:08.96344-03
332	52	\N	RIESGO_FACTOR_COMORBILIDADES	0	\N	{"conteo": 0, "cumple": false, "puntos": 1, "dominio": "Clínico-funcional", "criterio": "Nº comorbilidades ≥ 2", "tipo_factor": "RIESGO_FACTOR_COMORBILIDADES", "puntaje_otorgado": 0, "detalle_comorbilidades": []}	2025-09-29 01:45:08.966-03
333	52	\N	RIESGO_FACTOR_BARTHEL	1	\N	{"cumple": true, "puntos": 1, "dominio": "Clínico-funcional", "criterio": "Índice de Barthel ≤ 30", "tipo_factor": "RIESGO_FACTOR_BARTHEL", "puntaje_barthel": 29, "puntaje_otorgado": 1}	2025-09-29 01:45:08.968813-03
334	52	\N	RIESGO_FACTOR_IMC	1	\N	{"cumple": true, "puntos": 1, "unidad": "kg/m²", "dominio": "Clínico-funcional", "criterio": "IMC ≤ 18.5 kg/m²", "tipo_factor": "RIESGO_FACTOR_IMC", "valor_medido": 16.1, "puntaje_otorgado": 1}	2025-09-29 01:45:08.971401-03
335	52	\N	RIESGO_FACTOR_TABACO	0	\N	{"cumple": false, "puntos": 1, "dominio": "Hábitos", "criterio": "Tabaquismo activo", "tipo_factor": "RIESGO_FACTOR_TABACO", "valor_medido": false, "puntaje_otorgado": 0}	2025-09-29 01:45:08.974012-03
336	52	\N	RIESGO_FACTOR_CORTICOIDES	0	\N	{"cumple": false, "puntos": 1, "dominio": "Hábitos", "criterio": "Glucocorticoides orales crónicos ≥ 3 meses", "tipo_factor": "RIESGO_FACTOR_CORTICOIDES", "valor_medido": false, "puntaje_otorgado": 0}	2025-09-29 01:45:08.97683-03
337	52	\N	RIESGO_FACTOR_ALCOHOL	0	\N	{"cumple": false, "puntos": 1, "dominio": "Hábitos", "criterio": "Alcohol ≥ 3/día", "tipo_factor": "RIESGO_FACTOR_ALCOHOL", "valor_medido": false, "puntaje_otorgado": 0}	2025-09-29 01:45:08.979409-03
338	52	\N	RIESGO_FACTOR_SUBCAPITAL	2	\N	{"cumple": true, "puntos": 2, "dominio": "Quirúrgicos", "criterio": "Subcapital desplazada", "tipo_factor": "RIESGO_FACTOR_SUBCAPITAL", "valor_medido": true, "tipo_fractura": "INTRACAPSULAR", "puntaje_otorgado": 2}	2025-09-29 01:45:08.981953-03
339	52	\N	RIESGO_FACTOR_RETRASO_QX	1	\N	{"cumple": true, "puntos": 1, "dominio": "Quirúrgicos", "criterio": "Retraso quirúrgico > 48 h", "tipo_factor": "RIESGO_FACTOR_RETRASO_QX", "horas_retraso": 106.0, "puntaje_otorgado": 1}	2025-09-29 01:45:08.984558-03
340	52	\N	RIESGO_REFRACTURA	7	MODERADO	{"color": "AMARILLO", "nivel": "MODERADO", "criterios": [{"cumple": false, "puntos": 1, "unidad": "años", "dominio": "Generales", "criterio": "Edad ≥ 80 años", "tipo_factor": "RIESGO_FACTOR_EDAD_80", "valor_medido": 71, "puntaje_otorgado": 0}, {"cumple": false, "puntos": 1, "dominio": "Generales", "criterio": "Sexo femenino", "tipo_factor": "RIESGO_FACTOR_SEXO_FEMENINO", "valor_medido": "M", "puntaje_otorgado": 0}, {"cumple": false, "puntos": 2, "dominio": "Generales", "criterio": "Fractura previa por fragilidad", "tipo_factor": "RIESGO_FACTOR_FRACTURA_FRAGILIDAD", "valor_medido": false, "puntaje_otorgado": 0}, {"cumple": true, "puntos": 1, "dominio": "Generales", "criterio": "Fractura vertebral previa", "tipo_factor": "RIESGO_FACTOR_FRACTURA_VERTEBRAL", "valor_medido": true, "puntaje_otorgado": 1}, {"cumple": false, "puntos": 1, "dominio": "Generales", "criterio": "Antecedente familiar de fractura de cadera", "tipo_factor": "RIESGO_FACTOR_ANTECEDENTE_FAMILIAR", "valor_medido": false, "puntaje_otorgado": 0}, {"cumple": false, "puntos": 2, "unidad": "ng/mL", "dominio": "Bioquímicos", "criterio": "Vitamina D < 20 ng/mL", "tipo_factor": "RIESGO_FACTOR_VITAMINA_D", "valor_medido": 27.7, "puntaje_otorgado": 0}, {"cumple": false, "puntos": 1, "unidad": "g/dL", "dominio": "Bioquímicos", "criterio": "Albúmina < 3.5 g/dL", "tipo_factor": "RIESGO_FACTOR_ALBUMINA", "valor_medido": 4.37, "puntaje_otorgado": 0}, {"cumple": false, "puntos": 1, "unidad": "g/dL", "dominio": "Bioquímicos", "criterio": "Hemoglobina < 11 g/dL", "tipo_factor": "RIESGO_FACTOR_HEMOGLOBINA", "valor_medido": 13.1, "puntaje_otorgado": 0}, {"cumple": false, "puntos": 1, "unidad": "mg/dL", "dominio": "Bioquímicos", "criterio": "Creatinina sérica ≥ 1.3 mg/dL", "tipo_factor": "RIESGO_FACTOR_CREATININA", "valor_medido": 0.86, "puntaje_otorgado": 0}, {"cumple": false, "puntos": 1, "dominio": "Bioquímicos", "criterio": "NLR > 4.5", "tipo_factor": "RIESGO_FACTOR_NLR", "valor_medido": 3.01, "puntaje_otorgado": 0}, {"cumple": true, "puntos": 1, "dominio": "Bioquímicos", "criterio": "MLR > 0.35", "tipo_factor": "RIESGO_FACTOR_MLR", "valor_medido": 0.5, "puntaje_otorgado": 1}, {"conteo": 0, "cumple": false, "puntos": 1, "dominio": "Clínico-funcional", "criterio": "Nº comorbilidades ≥ 2", "tipo_factor": "RIESGO_FACTOR_COMORBILIDADES", "puntaje_otorgado": 0, "detalle_comorbilidades": []}, {"cumple": true, "puntos": 1, "dominio": "Clínico-funcional", "criterio": "Índice de Barthel ≤ 30", "tipo_factor": "RIESGO_FACTOR_BARTHEL", "puntaje_barthel": 29, "puntaje_otorgado": 1}, {"cumple": true, "puntos": 1, "unidad": "kg/m²", "dominio": "Clínico-funcional", "criterio": "IMC ≤ 18.5 kg/m²", "tipo_factor": "RIESGO_FACTOR_IMC", "valor_medido": 16.1, "puntaje_otorgado": 1}, {"cumple": false, "puntos": 1, "dominio": "Hábitos", "criterio": "Tabaquismo activo", "tipo_factor": "RIESGO_FACTOR_TABACO", "valor_medido": false, "puntaje_otorgado": 0}, {"cumple": false, "puntos": 1, "dominio": "Hábitos", "criterio": "Glucocorticoides orales crónicos ≥ 3 meses", "tipo_factor": "RIESGO_FACTOR_CORTICOIDES", "valor_medido": false, "puntaje_otorgado": 0}, {"cumple": false, "puntos": 1, "dominio": "Hábitos", "criterio": "Alcohol ≥ 3/día", "tipo_factor": "RIESGO_FACTOR_ALCOHOL", "valor_medido": false, "puntaje_otorgado": 0}, {"cumple": true, "puntos": 2, "dominio": "Quirúrgicos", "criterio": "Subcapital desplazada", "tipo_factor": "RIESGO_FACTOR_SUBCAPITAL", "valor_medido": true, "tipo_fractura": "INTRACAPSULAR", "puntaje_otorgado": 2}, {"cumple": true, "puntos": 1, "dominio": "Quirúrgicos", "criterio": "Retraso quirúrgico > 48 h", "tipo_factor": "RIESGO_FACTOR_RETRASO_QX", "horas_retraso": 106.0, "puntaje_otorgado": 1}], "puntaje_total": 7}	2025-09-29 01:45:08.987137-03
341	53	\N	RIESGO_FACTOR_EDAD_80	0	\N	{"cumple": false, "puntos": 1, "unidad": "años", "dominio": "Generales", "criterio": "Edad ≥ 80 años", "tipo_factor": "RIESGO_FACTOR_EDAD_80", "valor_medido": 71, "puntaje_otorgado": 0}	2025-09-29 01:45:09.03587-03
342	53	\N	RIESGO_FACTOR_SEXO_FEMENINO	0	\N	{"cumple": false, "puntos": 1, "dominio": "Generales", "criterio": "Sexo femenino", "tipo_factor": "RIESGO_FACTOR_SEXO_FEMENINO", "valor_medido": "M", "puntaje_otorgado": 0}	2025-09-29 01:45:09.038431-03
343	53	\N	RIESGO_FACTOR_FRACTURA_FRAGILIDAD	0	\N	{"cumple": false, "puntos": 2, "dominio": "Generales", "criterio": "Fractura previa por fragilidad", "tipo_factor": "RIESGO_FACTOR_FRACTURA_FRAGILIDAD", "valor_medido": false, "puntaje_otorgado": 0}	2025-09-29 01:45:09.041035-03
344	53	\N	RIESGO_FACTOR_FRACTURA_VERTEBRAL	0	\N	{"cumple": false, "puntos": 1, "dominio": "Generales", "criterio": "Fractura vertebral previa", "tipo_factor": "RIESGO_FACTOR_FRACTURA_VERTEBRAL", "valor_medido": false, "puntaje_otorgado": 0}	2025-09-29 01:45:09.043847-03
345	53	\N	RIESGO_FACTOR_ANTECEDENTE_FAMILIAR	0	\N	{"cumple": false, "puntos": 1, "dominio": "Generales", "criterio": "Antecedente familiar de fractura de cadera", "tipo_factor": "RIESGO_FACTOR_ANTECEDENTE_FAMILIAR", "valor_medido": false, "puntaje_otorgado": 0}	2025-09-29 01:45:09.046436-03
346	53	\N	RIESGO_FACTOR_VITAMINA_D	2	\N	{"cumple": true, "puntos": 2, "unidad": "ng/mL", "dominio": "Bioquímicos", "criterio": "Vitamina D < 20 ng/mL", "tipo_factor": "RIESGO_FACTOR_VITAMINA_D", "valor_medido": 18.3, "puntaje_otorgado": 2}	2025-09-29 01:45:09.049047-03
347	53	\N	RIESGO_FACTOR_ALBUMINA	1	\N	{"cumple": true, "puntos": 1, "unidad": "g/dL", "dominio": "Bioquímicos", "criterio": "Albúmina < 3.5 g/dL", "tipo_factor": "RIESGO_FACTOR_ALBUMINA", "valor_medido": 3.09, "puntaje_otorgado": 1}	2025-09-29 01:45:09.051623-03
348	53	\N	RIESGO_FACTOR_HEMOGLOBINA	0	\N	{"cumple": false, "puntos": 1, "unidad": "g/dL", "dominio": "Bioquímicos", "criterio": "Hemoglobina < 11 g/dL", "tipo_factor": "RIESGO_FACTOR_HEMOGLOBINA", "valor_medido": 13.8, "puntaje_otorgado": 0}	2025-09-29 01:45:09.054193-03
349	53	\N	RIESGO_FACTOR_CREATININA	1	\N	{"cumple": true, "puntos": 1, "unidad": "mg/dL", "dominio": "Bioquímicos", "criterio": "Creatinina sérica ≥ 1.3 mg/dL", "tipo_factor": "RIESGO_FACTOR_CREATININA", "valor_medido": 1.67, "puntaje_otorgado": 1}	2025-09-29 01:45:09.056788-03
350	53	\N	RIESGO_FACTOR_NLR	1	\N	{"cumple": true, "puntos": 1, "dominio": "Bioquímicos", "criterio": "NLR > 4.5", "tipo_factor": "RIESGO_FACTOR_NLR", "valor_medido": 6.67, "puntaje_otorgado": 1}	2025-09-29 01:45:09.059332-03
351	53	\N	RIESGO_FACTOR_MLR	0	\N	{"cumple": false, "puntos": 1, "dominio": "Bioquímicos", "criterio": "MLR > 0.35", "tipo_factor": "RIESGO_FACTOR_MLR", "valor_medido": 0.33, "puntaje_otorgado": 0}	2025-09-29 01:45:09.061893-03
352	53	\N	RIESGO_FACTOR_COMORBILIDADES	0	\N	{"conteo": 1, "cumple": false, "puntos": 1, "dominio": "Clínico-funcional", "criterio": "Nº comorbilidades ≥ 2", "tipo_factor": "RIESGO_FACTOR_COMORBILIDADES", "puntaje_otorgado": 0, "detalle_comorbilidades": ["DM2"]}	2025-09-29 01:45:09.064515-03
353	53	\N	RIESGO_FACTOR_BARTHEL	0	\N	{"cumple": false, "puntos": 1, "dominio": "Clínico-funcional", "criterio": "Índice de Barthel ≤ 30", "tipo_factor": "RIESGO_FACTOR_BARTHEL", "puntaje_barthel": 70, "puntaje_otorgado": 0}	2025-09-29 01:45:09.067312-03
354	53	\N	RIESGO_FACTOR_IMC	0	\N	{"cumple": false, "puntos": 1, "unidad": "kg/m²", "dominio": "Clínico-funcional", "criterio": "IMC ≤ 18.5 kg/m²", "tipo_factor": "RIESGO_FACTOR_IMC", "valor_medido": 31.0, "puntaje_otorgado": 0}	2025-09-29 01:45:09.069928-03
355	53	\N	RIESGO_FACTOR_TABACO	1	\N	{"cumple": true, "puntos": 1, "dominio": "Hábitos", "criterio": "Tabaquismo activo", "tipo_factor": "RIESGO_FACTOR_TABACO", "valor_medido": true, "puntaje_otorgado": 1}	2025-09-29 01:45:09.072515-03
356	53	\N	RIESGO_FACTOR_CORTICOIDES	0	\N	{"cumple": false, "puntos": 1, "dominio": "Hábitos", "criterio": "Glucocorticoides orales crónicos ≥ 3 meses", "tipo_factor": "RIESGO_FACTOR_CORTICOIDES", "valor_medido": false, "puntaje_otorgado": 0}	2025-09-29 01:45:09.07509-03
357	53	\N	RIESGO_FACTOR_ALCOHOL	1	\N	{"cumple": true, "puntos": 1, "dominio": "Hábitos", "criterio": "Alcohol ≥ 3/día", "tipo_factor": "RIESGO_FACTOR_ALCOHOL", "valor_medido": true, "puntaje_otorgado": 1}	2025-09-29 01:45:09.077728-03
358	53	\N	RIESGO_FACTOR_SUBCAPITAL	0	\N	{"cumple": false, "puntos": 2, "dominio": "Quirúrgicos", "criterio": "Subcapital desplazada", "tipo_factor": "RIESGO_FACTOR_SUBCAPITAL", "valor_medido": false, "tipo_fractura": "INTRACAPSULAR", "puntaje_otorgado": 0}	2025-09-29 01:45:09.080316-03
359	53	\N	RIESGO_FACTOR_RETRASO_QX	1	\N	{"cumple": true, "puntos": 1, "dominio": "Quirúrgicos", "criterio": "Retraso quirúrgico > 48 h", "tipo_factor": "RIESGO_FACTOR_RETRASO_QX", "horas_retraso": 60.0, "puntaje_otorgado": 1}	2025-09-29 01:45:09.082877-03
360	53	\N	RIESGO_REFRACTURA	8	ALTO	{"color": "ROJO", "nivel": "ALTO", "criterios": [{"cumple": false, "puntos": 1, "unidad": "años", "dominio": "Generales", "criterio": "Edad ≥ 80 años", "tipo_factor": "RIESGO_FACTOR_EDAD_80", "valor_medido": 71, "puntaje_otorgado": 0}, {"cumple": false, "puntos": 1, "dominio": "Generales", "criterio": "Sexo femenino", "tipo_factor": "RIESGO_FACTOR_SEXO_FEMENINO", "valor_medido": "M", "puntaje_otorgado": 0}, {"cumple": false, "puntos": 2, "dominio": "Generales", "criterio": "Fractura previa por fragilidad", "tipo_factor": "RIESGO_FACTOR_FRACTURA_FRAGILIDAD", "valor_medido": false, "puntaje_otorgado": 0}, {"cumple": false, "puntos": 1, "dominio": "Generales", "criterio": "Fractura vertebral previa", "tipo_factor": "RIESGO_FACTOR_FRACTURA_VERTEBRAL", "valor_medido": false, "puntaje_otorgado": 0}, {"cumple": false, "puntos": 1, "dominio": "Generales", "criterio": "Antecedente familiar de fractura de cadera", "tipo_factor": "RIESGO_FACTOR_ANTECEDENTE_FAMILIAR", "valor_medido": false, "puntaje_otorgado": 0}, {"cumple": true, "puntos": 2, "unidad": "ng/mL", "dominio": "Bioquímicos", "criterio": "Vitamina D < 20 ng/mL", "tipo_factor": "RIESGO_FACTOR_VITAMINA_D", "valor_medido": 18.3, "puntaje_otorgado": 2}, {"cumple": true, "puntos": 1, "unidad": "g/dL", "dominio": "Bioquímicos", "criterio": "Albúmina < 3.5 g/dL", "tipo_factor": "RIESGO_FACTOR_ALBUMINA", "valor_medido": 3.09, "puntaje_otorgado": 1}, {"cumple": false, "puntos": 1, "unidad": "g/dL", "dominio": "Bioquímicos", "criterio": "Hemoglobina < 11 g/dL", "tipo_factor": "RIESGO_FACTOR_HEMOGLOBINA", "valor_medido": 13.8, "puntaje_otorgado": 0}, {"cumple": true, "puntos": 1, "unidad": "mg/dL", "dominio": "Bioquímicos", "criterio": "Creatinina sérica ≥ 1.3 mg/dL", "tipo_factor": "RIESGO_FACTOR_CREATININA", "valor_medido": 1.67, "puntaje_otorgado": 1}, {"cumple": true, "puntos": 1, "dominio": "Bioquímicos", "criterio": "NLR > 4.5", "tipo_factor": "RIESGO_FACTOR_NLR", "valor_medido": 6.67, "puntaje_otorgado": 1}, {"cumple": false, "puntos": 1, "dominio": "Bioquímicos", "criterio": "MLR > 0.35", "tipo_factor": "RIESGO_FACTOR_MLR", "valor_medido": 0.33, "puntaje_otorgado": 0}, {"conteo": 1, "cumple": false, "puntos": 1, "dominio": "Clínico-funcional", "criterio": "Nº comorbilidades ≥ 2", "tipo_factor": "RIESGO_FACTOR_COMORBILIDADES", "puntaje_otorgado": 0, "detalle_comorbilidades": ["DM2"]}, {"cumple": false, "puntos": 1, "dominio": "Clínico-funcional", "criterio": "Índice de Barthel ≤ 30", "tipo_factor": "RIESGO_FACTOR_BARTHEL", "puntaje_barthel": 70, "puntaje_otorgado": 0}, {"cumple": false, "puntos": 1, "unidad": "kg/m²", "dominio": "Clínico-funcional", "criterio": "IMC ≤ 18.5 kg/m²", "tipo_factor": "RIESGO_FACTOR_IMC", "valor_medido": 31.0, "puntaje_otorgado": 0}, {"cumple": true, "puntos": 1, "dominio": "Hábitos", "criterio": "Tabaquismo activo", "tipo_factor": "RIESGO_FACTOR_TABACO", "valor_medido": true, "puntaje_otorgado": 1}, {"cumple": false, "puntos": 1, "dominio": "Hábitos", "criterio": "Glucocorticoides orales crónicos ≥ 3 meses", "tipo_factor": "RIESGO_FACTOR_CORTICOIDES", "valor_medido": false, "puntaje_otorgado": 0}, {"cumple": true, "puntos": 1, "dominio": "Hábitos", "criterio": "Alcohol ≥ 3/día", "tipo_factor": "RIESGO_FACTOR_ALCOHOL", "valor_medido": true, "puntaje_otorgado": 1}, {"cumple": false, "puntos": 2, "dominio": "Quirúrgicos", "criterio": "Subcapital desplazada", "tipo_factor": "RIESGO_FACTOR_SUBCAPITAL", "valor_medido": false, "tipo_fractura": "INTRACAPSULAR", "puntaje_otorgado": 0}, {"cumple": true, "puntos": 1, "dominio": "Quirúrgicos", "criterio": "Retraso quirúrgico > 48 h", "tipo_factor": "RIESGO_FACTOR_RETRASO_QX", "horas_retraso": 60.0, "puntaje_otorgado": 1}], "puntaje_total": 8}	2025-09-29 01:45:09.085465-03
361	54	\N	RIESGO_FACTOR_EDAD_80	0	\N	{"cumple": false, "puntos": 1, "unidad": "años", "dominio": "Generales", "criterio": "Edad ≥ 80 años", "tipo_factor": "RIESGO_FACTOR_EDAD_80", "valor_medido": 72, "puntaje_otorgado": 0}	2025-09-29 01:45:09.12872-03
362	54	\N	RIESGO_FACTOR_SEXO_FEMENINO	1	\N	{"cumple": true, "puntos": 1, "dominio": "Generales", "criterio": "Sexo femenino", "tipo_factor": "RIESGO_FACTOR_SEXO_FEMENINO", "valor_medido": "F", "puntaje_otorgado": 1}	2025-09-29 01:45:09.130885-03
363	54	\N	RIESGO_FACTOR_FRACTURA_FRAGILIDAD	0	\N	{"cumple": false, "puntos": 2, "dominio": "Generales", "criterio": "Fractura previa por fragilidad", "tipo_factor": "RIESGO_FACTOR_FRACTURA_FRAGILIDAD", "valor_medido": false, "puntaje_otorgado": 0}	2025-09-29 01:45:09.133054-03
364	54	\N	RIESGO_FACTOR_FRACTURA_VERTEBRAL	0	\N	{"cumple": false, "puntos": 1, "dominio": "Generales", "criterio": "Fractura vertebral previa", "tipo_factor": "RIESGO_FACTOR_FRACTURA_VERTEBRAL", "valor_medido": false, "puntaje_otorgado": 0}	2025-09-29 01:45:09.135243-03
365	54	\N	RIESGO_FACTOR_ANTECEDENTE_FAMILIAR	0	\N	{"cumple": false, "puntos": 1, "dominio": "Generales", "criterio": "Antecedente familiar de fractura de cadera", "tipo_factor": "RIESGO_FACTOR_ANTECEDENTE_FAMILIAR", "valor_medido": false, "puntaje_otorgado": 0}	2025-09-29 01:45:09.137533-03
366	54	\N	RIESGO_FACTOR_VITAMINA_D	2	\N	{"cumple": true, "puntos": 2, "unidad": "ng/mL", "dominio": "Bioquímicos", "criterio": "Vitamina D < 20 ng/mL", "tipo_factor": "RIESGO_FACTOR_VITAMINA_D", "valor_medido": 16.8, "puntaje_otorgado": 2}	2025-09-29 01:45:09.139758-03
367	54	\N	RIESGO_FACTOR_ALBUMINA	0	\N	{"cumple": false, "puntos": 1, "unidad": "g/dL", "dominio": "Bioquímicos", "criterio": "Albúmina < 3.5 g/dL", "tipo_factor": "RIESGO_FACTOR_ALBUMINA", "valor_medido": 4.13, "puntaje_otorgado": 0}	2025-09-29 01:45:09.142084-03
368	54	\N	RIESGO_FACTOR_HEMOGLOBINA	0	\N	{"cumple": false, "puntos": 1, "unidad": "g/dL", "dominio": "Bioquímicos", "criterio": "Hemoglobina < 11 g/dL", "tipo_factor": "RIESGO_FACTOR_HEMOGLOBINA", "valor_medido": 13.5, "puntaje_otorgado": 0}	2025-09-29 01:45:09.144228-03
369	54	\N	RIESGO_FACTOR_CREATININA	1	\N	{"cumple": true, "puntos": 1, "unidad": "mg/dL", "dominio": "Bioquímicos", "criterio": "Creatinina sérica ≥ 1.3 mg/dL", "tipo_factor": "RIESGO_FACTOR_CREATININA", "valor_medido": 1.71, "puntaje_otorgado": 1}	2025-09-29 01:45:09.14637-03
370	54	\N	RIESGO_FACTOR_NLR	1	\N	{"cumple": true, "puntos": 1, "dominio": "Bioquímicos", "criterio": "NLR > 4.5", "tipo_factor": "RIESGO_FACTOR_NLR", "valor_medido": 5.24, "puntaje_otorgado": 1}	2025-09-29 01:45:09.148572-03
371	54	\N	RIESGO_FACTOR_MLR	0	\N	{"cumple": false, "puntos": 1, "dominio": "Bioquímicos", "criterio": "MLR > 0.35", "tipo_factor": "RIESGO_FACTOR_MLR", "valor_medido": 0.23, "puntaje_otorgado": 0}	2025-09-29 01:45:09.150783-03
372	54	\N	RIESGO_FACTOR_COMORBILIDADES	1	\N	{"conteo": 3, "cumple": true, "puntos": 1, "dominio": "Clínico-funcional", "criterio": "Nº comorbilidades ≥ 2", "tipo_factor": "RIESGO_FACTOR_COMORBILIDADES", "puntaje_otorgado": 1, "detalle_comorbilidades": ["Cardiopatía", "EPOC", "Demencia"]}	2025-09-29 01:45:09.153007-03
373	54	\N	RIESGO_FACTOR_BARTHEL	0	\N	{"cumple": false, "puntos": 1, "dominio": "Clínico-funcional", "criterio": "Índice de Barthel ≤ 30", "tipo_factor": "RIESGO_FACTOR_BARTHEL", "puntaje_barthel": 31, "puntaje_otorgado": 0}	2025-09-29 01:45:09.155186-03
374	54	\N	RIESGO_FACTOR_IMC	0	\N	{"cumple": false, "puntos": 1, "unidad": "kg/m²", "dominio": "Clínico-funcional", "criterio": "IMC ≤ 18.5 kg/m²", "tipo_factor": "RIESGO_FACTOR_IMC", "valor_medido": 30.5, "puntaje_otorgado": 0}	2025-09-29 01:45:09.157424-03
375	54	\N	RIESGO_FACTOR_TABACO	0	\N	{"cumple": false, "puntos": 1, "dominio": "Hábitos", "criterio": "Tabaquismo activo", "tipo_factor": "RIESGO_FACTOR_TABACO", "valor_medido": false, "puntaje_otorgado": 0}	2025-09-29 01:45:09.15967-03
376	54	\N	RIESGO_FACTOR_CORTICOIDES	0	\N	{"cumple": false, "puntos": 1, "dominio": "Hábitos", "criterio": "Glucocorticoides orales crónicos ≥ 3 meses", "tipo_factor": "RIESGO_FACTOR_CORTICOIDES", "valor_medido": false, "puntaje_otorgado": 0}	2025-09-29 01:45:09.161807-03
377	54	\N	RIESGO_FACTOR_ALCOHOL	1	\N	{"cumple": true, "puntos": 1, "dominio": "Hábitos", "criterio": "Alcohol ≥ 3/día", "tipo_factor": "RIESGO_FACTOR_ALCOHOL", "valor_medido": true, "puntaje_otorgado": 1}	2025-09-29 01:45:09.164048-03
378	54	\N	RIESGO_FACTOR_SUBCAPITAL	2	\N	{"cumple": true, "puntos": 2, "dominio": "Quirúrgicos", "criterio": "Subcapital desplazada", "tipo_factor": "RIESGO_FACTOR_SUBCAPITAL", "valor_medido": true, "tipo_fractura": "INTRACAPSULAR", "puntaje_otorgado": 2}	2025-09-29 01:45:09.166245-03
379	54	\N	RIESGO_FACTOR_RETRASO_QX	1	\N	{"cumple": true, "puntos": 1, "dominio": "Quirúrgicos", "criterio": "Retraso quirúrgico > 48 h", "tipo_factor": "RIESGO_FACTOR_RETRASO_QX", "horas_retraso": 106.0, "puntaje_otorgado": 1}	2025-09-29 01:45:09.168513-03
380	54	\N	RIESGO_REFRACTURA	10	ALTO	{"color": "ROJO", "nivel": "ALTO", "criterios": [{"cumple": false, "puntos": 1, "unidad": "años", "dominio": "Generales", "criterio": "Edad ≥ 80 años", "tipo_factor": "RIESGO_FACTOR_EDAD_80", "valor_medido": 72, "puntaje_otorgado": 0}, {"cumple": true, "puntos": 1, "dominio": "Generales", "criterio": "Sexo femenino", "tipo_factor": "RIESGO_FACTOR_SEXO_FEMENINO", "valor_medido": "F", "puntaje_otorgado": 1}, {"cumple": false, "puntos": 2, "dominio": "Generales", "criterio": "Fractura previa por fragilidad", "tipo_factor": "RIESGO_FACTOR_FRACTURA_FRAGILIDAD", "valor_medido": false, "puntaje_otorgado": 0}, {"cumple": false, "puntos": 1, "dominio": "Generales", "criterio": "Fractura vertebral previa", "tipo_factor": "RIESGO_FACTOR_FRACTURA_VERTEBRAL", "valor_medido": false, "puntaje_otorgado": 0}, {"cumple": false, "puntos": 1, "dominio": "Generales", "criterio": "Antecedente familiar de fractura de cadera", "tipo_factor": "RIESGO_FACTOR_ANTECEDENTE_FAMILIAR", "valor_medido": false, "puntaje_otorgado": 0}, {"cumple": true, "puntos": 2, "unidad": "ng/mL", "dominio": "Bioquímicos", "criterio": "Vitamina D < 20 ng/mL", "tipo_factor": "RIESGO_FACTOR_VITAMINA_D", "valor_medido": 16.8, "puntaje_otorgado": 2}, {"cumple": false, "puntos": 1, "unidad": "g/dL", "dominio": "Bioquímicos", "criterio": "Albúmina < 3.5 g/dL", "tipo_factor": "RIESGO_FACTOR_ALBUMINA", "valor_medido": 4.13, "puntaje_otorgado": 0}, {"cumple": false, "puntos": 1, "unidad": "g/dL", "dominio": "Bioquímicos", "criterio": "Hemoglobina < 11 g/dL", "tipo_factor": "RIESGO_FACTOR_HEMOGLOBINA", "valor_medido": 13.5, "puntaje_otorgado": 0}, {"cumple": true, "puntos": 1, "unidad": "mg/dL", "dominio": "Bioquímicos", "criterio": "Creatinina sérica ≥ 1.3 mg/dL", "tipo_factor": "RIESGO_FACTOR_CREATININA", "valor_medido": 1.71, "puntaje_otorgado": 1}, {"cumple": true, "puntos": 1, "dominio": "Bioquímicos", "criterio": "NLR > 4.5", "tipo_factor": "RIESGO_FACTOR_NLR", "valor_medido": 5.24, "puntaje_otorgado": 1}, {"cumple": false, "puntos": 1, "dominio": "Bioquímicos", "criterio": "MLR > 0.35", "tipo_factor": "RIESGO_FACTOR_MLR", "valor_medido": 0.23, "puntaje_otorgado": 0}, {"conteo": 3, "cumple": true, "puntos": 1, "dominio": "Clínico-funcional", "criterio": "Nº comorbilidades ≥ 2", "tipo_factor": "RIESGO_FACTOR_COMORBILIDADES", "puntaje_otorgado": 1, "detalle_comorbilidades": ["Cardiopatía", "EPOC", "Demencia"]}, {"cumple": false, "puntos": 1, "dominio": "Clínico-funcional", "criterio": "Índice de Barthel ≤ 30", "tipo_factor": "RIESGO_FACTOR_BARTHEL", "puntaje_barthel": 31, "puntaje_otorgado": 0}, {"cumple": false, "puntos": 1, "unidad": "kg/m²", "dominio": "Clínico-funcional", "criterio": "IMC ≤ 18.5 kg/m²", "tipo_factor": "RIESGO_FACTOR_IMC", "valor_medido": 30.5, "puntaje_otorgado": 0}, {"cumple": false, "puntos": 1, "dominio": "Hábitos", "criterio": "Tabaquismo activo", "tipo_factor": "RIESGO_FACTOR_TABACO", "valor_medido": false, "puntaje_otorgado": 0}, {"cumple": false, "puntos": 1, "dominio": "Hábitos", "criterio": "Glucocorticoides orales crónicos ≥ 3 meses", "tipo_factor": "RIESGO_FACTOR_CORTICOIDES", "valor_medido": false, "puntaje_otorgado": 0}, {"cumple": true, "puntos": 1, "dominio": "Hábitos", "criterio": "Alcohol ≥ 3/día", "tipo_factor": "RIESGO_FACTOR_ALCOHOL", "valor_medido": true, "puntaje_otorgado": 1}, {"cumple": true, "puntos": 2, "dominio": "Quirúrgicos", "criterio": "Subcapital desplazada", "tipo_factor": "RIESGO_FACTOR_SUBCAPITAL", "valor_medido": true, "tipo_fractura": "INTRACAPSULAR", "puntaje_otorgado": 2}, {"cumple": true, "puntos": 1, "dominio": "Quirúrgicos", "criterio": "Retraso quirúrgico > 48 h", "tipo_factor": "RIESGO_FACTOR_RETRASO_QX", "horas_retraso": 106.0, "puntaje_otorgado": 1}], "puntaje_total": 10}	2025-09-29 01:45:09.170791-03
381	55	\N	RIESGO_FACTOR_EDAD_80	0	\N	{"cumple": false, "puntos": 1, "unidad": "años", "dominio": "Generales", "criterio": "Edad ≥ 80 años", "tipo_factor": "RIESGO_FACTOR_EDAD_80", "valor_medido": 72, "puntaje_otorgado": 0}	2025-09-29 01:45:09.212682-03
382	55	\N	RIESGO_FACTOR_SEXO_FEMENINO	1	\N	{"cumple": true, "puntos": 1, "dominio": "Generales", "criterio": "Sexo femenino", "tipo_factor": "RIESGO_FACTOR_SEXO_FEMENINO", "valor_medido": "F", "puntaje_otorgado": 1}	2025-09-29 01:45:09.214881-03
383	55	\N	RIESGO_FACTOR_FRACTURA_FRAGILIDAD	0	\N	{"cumple": false, "puntos": 2, "dominio": "Generales", "criterio": "Fractura previa por fragilidad", "tipo_factor": "RIESGO_FACTOR_FRACTURA_FRAGILIDAD", "valor_medido": false, "puntaje_otorgado": 0}	2025-09-29 01:45:09.217273-03
384	55	\N	RIESGO_FACTOR_FRACTURA_VERTEBRAL	0	\N	{"cumple": false, "puntos": 1, "dominio": "Generales", "criterio": "Fractura vertebral previa", "tipo_factor": "RIESGO_FACTOR_FRACTURA_VERTEBRAL", "valor_medido": false, "puntaje_otorgado": 0}	2025-09-29 01:45:09.219686-03
385	55	\N	RIESGO_FACTOR_ANTECEDENTE_FAMILIAR	0	\N	{"cumple": false, "puntos": 1, "dominio": "Generales", "criterio": "Antecedente familiar de fractura de cadera", "tipo_factor": "RIESGO_FACTOR_ANTECEDENTE_FAMILIAR", "valor_medido": false, "puntaje_otorgado": 0}	2025-09-29 01:45:09.221993-03
386	55	\N	RIESGO_FACTOR_VITAMINA_D	0	\N	{"cumple": false, "puntos": 2, "unidad": "ng/mL", "dominio": "Bioquímicos", "criterio": "Vitamina D < 20 ng/mL", "tipo_factor": "RIESGO_FACTOR_VITAMINA_D", "valor_medido": 28.4, "puntaje_otorgado": 0}	2025-09-29 01:45:09.224189-03
387	55	\N	RIESGO_FACTOR_ALBUMINA	0	\N	{"cumple": false, "puntos": 1, "unidad": "g/dL", "dominio": "Bioquímicos", "criterio": "Albúmina < 3.5 g/dL", "tipo_factor": "RIESGO_FACTOR_ALBUMINA", "valor_medido": 4.26, "puntaje_otorgado": 0}	2025-09-29 01:45:09.226455-03
388	55	\N	RIESGO_FACTOR_HEMOGLOBINA	0	\N	{"cumple": false, "puntos": 1, "unidad": "g/dL", "dominio": "Bioquímicos", "criterio": "Hemoglobina < 11 g/dL", "tipo_factor": "RIESGO_FACTOR_HEMOGLOBINA", "valor_medido": 12.8, "puntaje_otorgado": 0}	2025-09-29 01:45:09.228716-03
389	55	\N	RIESGO_FACTOR_CREATININA	0	\N	{"cumple": false, "puntos": 1, "unidad": "mg/dL", "dominio": "Bioquímicos", "criterio": "Creatinina sérica ≥ 1.3 mg/dL", "tipo_factor": "RIESGO_FACTOR_CREATININA", "valor_medido": 1.26, "puntaje_otorgado": 0}	2025-09-29 01:45:09.231005-03
390	55	\N	RIESGO_FACTOR_NLR	1	\N	{"cumple": true, "puntos": 1, "dominio": "Bioquímicos", "criterio": "NLR > 4.5", "tipo_factor": "RIESGO_FACTOR_NLR", "valor_medido": 5.71, "puntaje_otorgado": 1}	2025-09-29 01:45:09.233153-03
391	55	\N	RIESGO_FACTOR_MLR	0	\N	{"cumple": false, "puntos": 1, "dominio": "Bioquímicos", "criterio": "MLR > 0.35", "tipo_factor": "RIESGO_FACTOR_MLR", "valor_medido": 0.33, "puntaje_otorgado": 0}	2025-09-29 01:45:09.235325-03
392	55	\N	RIESGO_FACTOR_COMORBILIDADES	0	\N	{"conteo": 0, "cumple": false, "puntos": 1, "dominio": "Clínico-funcional", "criterio": "Nº comorbilidades ≥ 2", "tipo_factor": "RIESGO_FACTOR_COMORBILIDADES", "puntaje_otorgado": 0, "detalle_comorbilidades": []}	2025-09-29 01:45:09.237549-03
393	55	\N	RIESGO_FACTOR_BARTHEL	0	\N	{"cumple": false, "puntos": 1, "dominio": "Clínico-funcional", "criterio": "Índice de Barthel ≤ 30", "tipo_factor": "RIESGO_FACTOR_BARTHEL", "puntaje_barthel": 94, "puntaje_otorgado": 0}	2025-09-29 01:45:09.239903-03
394	55	\N	RIESGO_FACTOR_IMC	0	\N	{"cumple": false, "puntos": 1, "unidad": "kg/m²", "dominio": "Clínico-funcional", "criterio": "IMC ≤ 18.5 kg/m²", "tipo_factor": "RIESGO_FACTOR_IMC", "valor_medido": 29.9, "puntaje_otorgado": 0}	2025-09-29 01:45:09.242075-03
395	55	\N	RIESGO_FACTOR_TABACO	1	\N	{"cumple": true, "puntos": 1, "dominio": "Hábitos", "criterio": "Tabaquismo activo", "tipo_factor": "RIESGO_FACTOR_TABACO", "valor_medido": true, "puntaje_otorgado": 1}	2025-09-29 01:45:09.244213-03
396	55	\N	RIESGO_FACTOR_CORTICOIDES	0	\N	{"cumple": false, "puntos": 1, "dominio": "Hábitos", "criterio": "Glucocorticoides orales crónicos ≥ 3 meses", "tipo_factor": "RIESGO_FACTOR_CORTICOIDES", "valor_medido": false, "puntaje_otorgado": 0}	2025-09-29 01:45:09.246508-03
397	55	\N	RIESGO_FACTOR_ALCOHOL	0	\N	{"cumple": false, "puntos": 1, "dominio": "Hábitos", "criterio": "Alcohol ≥ 3/día", "tipo_factor": "RIESGO_FACTOR_ALCOHOL", "valor_medido": false, "puntaje_otorgado": 0}	2025-09-29 01:45:09.248826-03
398	55	\N	RIESGO_FACTOR_SUBCAPITAL	0	\N	{"cumple": false, "puntos": 2, "dominio": "Quirúrgicos", "criterio": "Subcapital desplazada", "tipo_factor": "RIESGO_FACTOR_SUBCAPITAL", "valor_medido": false, "tipo_fractura": "INTRACAPSULAR", "puntaje_otorgado": 0}	2025-09-29 01:45:09.251185-03
399	55	\N	RIESGO_FACTOR_RETRASO_QX	1	\N	{"cumple": true, "puntos": 1, "dominio": "Quirúrgicos", "criterio": "Retraso quirúrgico > 48 h", "tipo_factor": "RIESGO_FACTOR_RETRASO_QX", "horas_retraso": 106.0, "puntaje_otorgado": 1}	2025-09-29 01:45:09.253575-03
400	55	\N	RIESGO_REFRACTURA	4	MODERADO	{"color": "AMARILLO", "nivel": "MODERADO", "criterios": [{"cumple": false, "puntos": 1, "unidad": "años", "dominio": "Generales", "criterio": "Edad ≥ 80 años", "tipo_factor": "RIESGO_FACTOR_EDAD_80", "valor_medido": 72, "puntaje_otorgado": 0}, {"cumple": true, "puntos": 1, "dominio": "Generales", "criterio": "Sexo femenino", "tipo_factor": "RIESGO_FACTOR_SEXO_FEMENINO", "valor_medido": "F", "puntaje_otorgado": 1}, {"cumple": false, "puntos": 2, "dominio": "Generales", "criterio": "Fractura previa por fragilidad", "tipo_factor": "RIESGO_FACTOR_FRACTURA_FRAGILIDAD", "valor_medido": false, "puntaje_otorgado": 0}, {"cumple": false, "puntos": 1, "dominio": "Generales", "criterio": "Fractura vertebral previa", "tipo_factor": "RIESGO_FACTOR_FRACTURA_VERTEBRAL", "valor_medido": false, "puntaje_otorgado": 0}, {"cumple": false, "puntos": 1, "dominio": "Generales", "criterio": "Antecedente familiar de fractura de cadera", "tipo_factor": "RIESGO_FACTOR_ANTECEDENTE_FAMILIAR", "valor_medido": false, "puntaje_otorgado": 0}, {"cumple": false, "puntos": 2, "unidad": "ng/mL", "dominio": "Bioquímicos", "criterio": "Vitamina D < 20 ng/mL", "tipo_factor": "RIESGO_FACTOR_VITAMINA_D", "valor_medido": 28.4, "puntaje_otorgado": 0}, {"cumple": false, "puntos": 1, "unidad": "g/dL", "dominio": "Bioquímicos", "criterio": "Albúmina < 3.5 g/dL", "tipo_factor": "RIESGO_FACTOR_ALBUMINA", "valor_medido": 4.26, "puntaje_otorgado": 0}, {"cumple": false, "puntos": 1, "unidad": "g/dL", "dominio": "Bioquímicos", "criterio": "Hemoglobina < 11 g/dL", "tipo_factor": "RIESGO_FACTOR_HEMOGLOBINA", "valor_medido": 12.8, "puntaje_otorgado": 0}, {"cumple": false, "puntos": 1, "unidad": "mg/dL", "dominio": "Bioquímicos", "criterio": "Creatinina sérica ≥ 1.3 mg/dL", "tipo_factor": "RIESGO_FACTOR_CREATININA", "valor_medido": 1.26, "puntaje_otorgado": 0}, {"cumple": true, "puntos": 1, "dominio": "Bioquímicos", "criterio": "NLR > 4.5", "tipo_factor": "RIESGO_FACTOR_NLR", "valor_medido": 5.71, "puntaje_otorgado": 1}, {"cumple": false, "puntos": 1, "dominio": "Bioquímicos", "criterio": "MLR > 0.35", "tipo_factor": "RIESGO_FACTOR_MLR", "valor_medido": 0.33, "puntaje_otorgado": 0}, {"conteo": 0, "cumple": false, "puntos": 1, "dominio": "Clínico-funcional", "criterio": "Nº comorbilidades ≥ 2", "tipo_factor": "RIESGO_FACTOR_COMORBILIDADES", "puntaje_otorgado": 0, "detalle_comorbilidades": []}, {"cumple": false, "puntos": 1, "dominio": "Clínico-funcional", "criterio": "Índice de Barthel ≤ 30", "tipo_factor": "RIESGO_FACTOR_BARTHEL", "puntaje_barthel": 94, "puntaje_otorgado": 0}, {"cumple": false, "puntos": 1, "unidad": "kg/m²", "dominio": "Clínico-funcional", "criterio": "IMC ≤ 18.5 kg/m²", "tipo_factor": "RIESGO_FACTOR_IMC", "valor_medido": 29.9, "puntaje_otorgado": 0}, {"cumple": true, "puntos": 1, "dominio": "Hábitos", "criterio": "Tabaquismo activo", "tipo_factor": "RIESGO_FACTOR_TABACO", "valor_medido": true, "puntaje_otorgado": 1}, {"cumple": false, "puntos": 1, "dominio": "Hábitos", "criterio": "Glucocorticoides orales crónicos ≥ 3 meses", "tipo_factor": "RIESGO_FACTOR_CORTICOIDES", "valor_medido": false, "puntaje_otorgado": 0}, {"cumple": false, "puntos": 1, "dominio": "Hábitos", "criterio": "Alcohol ≥ 3/día", "tipo_factor": "RIESGO_FACTOR_ALCOHOL", "valor_medido": false, "puntaje_otorgado": 0}, {"cumple": false, "puntos": 2, "dominio": "Quirúrgicos", "criterio": "Subcapital desplazada", "tipo_factor": "RIESGO_FACTOR_SUBCAPITAL", "valor_medido": false, "tipo_fractura": "INTRACAPSULAR", "puntaje_otorgado": 0}, {"cumple": true, "puntos": 1, "dominio": "Quirúrgicos", "criterio": "Retraso quirúrgico > 48 h", "tipo_factor": "RIESGO_FACTOR_RETRASO_QX", "horas_retraso": 106.0, "puntaje_otorgado": 1}], "puntaje_total": 4}	2025-09-29 01:45:09.255793-03
401	56	\N	RIESGO_FACTOR_EDAD_80	1	\N	{"cumple": true, "puntos": 1, "unidad": "años", "dominio": "Generales", "criterio": "Edad ≥ 80 años", "tipo_factor": "RIESGO_FACTOR_EDAD_80", "valor_medido": 84, "puntaje_otorgado": 1}	2025-09-29 01:45:09.441929-03
402	56	\N	RIESGO_FACTOR_SEXO_FEMENINO	1	\N	{"cumple": true, "puntos": 1, "dominio": "Generales", "criterio": "Sexo femenino", "tipo_factor": "RIESGO_FACTOR_SEXO_FEMENINO", "valor_medido": "F", "puntaje_otorgado": 1}	2025-09-29 01:45:09.446555-03
403	56	\N	RIESGO_FACTOR_FRACTURA_FRAGILIDAD	2	\N	{"cumple": true, "puntos": 2, "dominio": "Generales", "criterio": "Fractura previa por fragilidad", "tipo_factor": "RIESGO_FACTOR_FRACTURA_FRAGILIDAD", "valor_medido": true, "puntaje_otorgado": 2}	2025-09-29 01:45:09.45112-03
404	56	\N	RIESGO_FACTOR_FRACTURA_VERTEBRAL	1	\N	{"cumple": true, "puntos": 1, "dominio": "Generales", "criterio": "Fractura vertebral previa", "tipo_factor": "RIESGO_FACTOR_FRACTURA_VERTEBRAL", "valor_medido": true, "puntaje_otorgado": 1}	2025-09-29 01:45:09.455673-03
405	56	\N	RIESGO_FACTOR_ANTECEDENTE_FAMILIAR	1	\N	{"cumple": true, "puntos": 1, "dominio": "Generales", "criterio": "Antecedente familiar de fractura de cadera", "tipo_factor": "RIESGO_FACTOR_ANTECEDENTE_FAMILIAR", "valor_medido": true, "puntaje_otorgado": 1}	2025-09-29 01:45:09.460278-03
406	56	\N	RIESGO_FACTOR_VITAMINA_D	2	\N	{"cumple": true, "puntos": 2, "unidad": "ng/mL", "dominio": "Bioquímicos", "criterio": "Vitamina D < 20 ng/mL", "tipo_factor": "RIESGO_FACTOR_VITAMINA_D", "valor_medido": 14.0, "puntaje_otorgado": 2}	2025-09-29 01:45:09.464932-03
407	56	\N	RIESGO_FACTOR_ALBUMINA	1	\N	{"cumple": true, "puntos": 1, "unidad": "g/dL", "dominio": "Bioquímicos", "criterio": "Albúmina < 3.5 g/dL", "tipo_factor": "RIESGO_FACTOR_ALBUMINA", "valor_medido": 3.1, "puntaje_otorgado": 1}	2025-09-29 01:45:09.469262-03
408	56	\N	RIESGO_FACTOR_HEMOGLOBINA	1	\N	{"cumple": true, "puntos": 1, "unidad": "g/dL", "dominio": "Bioquímicos", "criterio": "Hemoglobina < 11 g/dL", "tipo_factor": "RIESGO_FACTOR_HEMOGLOBINA", "valor_medido": 9.5, "puntaje_otorgado": 1}	2025-09-29 01:45:09.473655-03
409	56	\N	RIESGO_FACTOR_CREATININA	1	\N	{"cumple": true, "puntos": 1, "unidad": "mg/dL", "dominio": "Bioquímicos", "criterio": "Creatinina sérica ≥ 1.3 mg/dL", "tipo_factor": "RIESGO_FACTOR_CREATININA", "valor_medido": 1.6, "puntaje_otorgado": 1}	2025-09-29 01:45:09.477967-03
410	56	\N	RIESGO_FACTOR_NLR	1	\N	{"cumple": true, "puntos": 1, "dominio": "Bioquímicos", "criterio": "NLR > 4.5", "tipo_factor": "RIESGO_FACTOR_NLR", "valor_medido": 5.8, "puntaje_otorgado": 1}	2025-09-29 01:45:09.482341-03
411	56	\N	RIESGO_FACTOR_MLR	1	\N	{"cumple": true, "puntos": 1, "dominio": "Bioquímicos", "criterio": "MLR > 0.35", "tipo_factor": "RIESGO_FACTOR_MLR", "valor_medido": 0.48, "puntaje_otorgado": 1}	2025-09-29 01:45:09.486505-03
412	56	\N	RIESGO_FACTOR_COMORBILIDADES	1	\N	{"conteo": 3, "cumple": true, "puntos": 1, "dominio": "Clínico-funcional", "criterio": "Nº comorbilidades ≥ 2", "tipo_factor": "RIESGO_FACTOR_COMORBILIDADES", "puntaje_otorgado": 1, "detalle_comorbilidades": ["HTA", "DM2", "EPOC"]}	2025-09-29 01:45:09.490698-03
413	56	\N	RIESGO_FACTOR_BARTHEL	1	\N	{"cumple": true, "puntos": 1, "dominio": "Clínico-funcional", "criterio": "Índice de Barthel ≤ 30", "tipo_factor": "RIESGO_FACTOR_BARTHEL", "puntaje_barthel": 25, "puntaje_otorgado": 1}	2025-09-29 01:45:09.494925-03
414	56	\N	RIESGO_FACTOR_IMC	0	\N	{"cumple": false, "puntos": 1, "unidad": "kg/m²", "dominio": "Clínico-funcional", "criterio": "IMC ≤ 18.5 kg/m²", "tipo_factor": "RIESGO_FACTOR_IMC", "valor_medido": 20.8, "puntaje_otorgado": 0}	2025-09-29 01:45:09.499006-03
415	56	\N	RIESGO_FACTOR_TABACO	1	\N	{"cumple": true, "puntos": 1, "dominio": "Hábitos", "criterio": "Tabaquismo activo", "tipo_factor": "RIESGO_FACTOR_TABACO", "valor_medido": true, "puntaje_otorgado": 1}	2025-09-29 01:45:09.502952-03
416	56	\N	RIESGO_FACTOR_CORTICOIDES	1	\N	{"cumple": true, "puntos": 1, "dominio": "Hábitos", "criterio": "Glucocorticoides orales crónicos ≥ 3 meses", "tipo_factor": "RIESGO_FACTOR_CORTICOIDES", "valor_medido": true, "puntaje_otorgado": 1}	2025-09-29 01:45:09.506951-03
417	56	\N	RIESGO_FACTOR_ALCOHOL	1	\N	{"cumple": true, "puntos": 1, "dominio": "Hábitos", "criterio": "Alcohol ≥ 3/día", "tipo_factor": "RIESGO_FACTOR_ALCOHOL", "valor_medido": true, "puntaje_otorgado": 1}	2025-09-29 01:45:09.510912-03
418	56	\N	RIESGO_FACTOR_SUBCAPITAL	2	\N	{"cumple": true, "puntos": 2, "dominio": "Quirúrgicos", "criterio": "Subcapital desplazada", "tipo_factor": "RIESGO_FACTOR_SUBCAPITAL", "valor_medido": true, "tipo_fractura": "INTRACAPSULAR", "puntaje_otorgado": 2}	2025-09-29 01:45:09.514865-03
419	56	\N	RIESGO_FACTOR_RETRASO_QX	1	\N	{"cumple": true, "puntos": 1, "dominio": "Quirúrgicos", "criterio": "Retraso quirúrgico > 48 h", "tipo_factor": "RIESGO_FACTOR_RETRASO_QX", "horas_retraso": 72.0, "puntaje_otorgado": 1}	2025-09-29 01:45:09.518778-03
420	56	\N	RIESGO_REFRACTURA	21	ALTO	{"color": "ROJO", "nivel": "ALTO", "criterios": [{"cumple": true, "puntos": 1, "unidad": "años", "dominio": "Generales", "criterio": "Edad ≥ 80 años", "tipo_factor": "RIESGO_FACTOR_EDAD_80", "valor_medido": 84, "puntaje_otorgado": 1}, {"cumple": true, "puntos": 1, "dominio": "Generales", "criterio": "Sexo femenino", "tipo_factor": "RIESGO_FACTOR_SEXO_FEMENINO", "valor_medido": "F", "puntaje_otorgado": 1}, {"cumple": true, "puntos": 2, "dominio": "Generales", "criterio": "Fractura previa por fragilidad", "tipo_factor": "RIESGO_FACTOR_FRACTURA_FRAGILIDAD", "valor_medido": true, "puntaje_otorgado": 2}, {"cumple": true, "puntos": 1, "dominio": "Generales", "criterio": "Fractura vertebral previa", "tipo_factor": "RIESGO_FACTOR_FRACTURA_VERTEBRAL", "valor_medido": true, "puntaje_otorgado": 1}, {"cumple": true, "puntos": 1, "dominio": "Generales", "criterio": "Antecedente familiar de fractura de cadera", "tipo_factor": "RIESGO_FACTOR_ANTECEDENTE_FAMILIAR", "valor_medido": true, "puntaje_otorgado": 1}, {"cumple": true, "puntos": 2, "unidad": "ng/mL", "dominio": "Bioquímicos", "criterio": "Vitamina D < 20 ng/mL", "tipo_factor": "RIESGO_FACTOR_VITAMINA_D", "valor_medido": 14.0, "puntaje_otorgado": 2}, {"cumple": true, "puntos": 1, "unidad": "g/dL", "dominio": "Bioquímicos", "criterio": "Albúmina < 3.5 g/dL", "tipo_factor": "RIESGO_FACTOR_ALBUMINA", "valor_medido": 3.1, "puntaje_otorgado": 1}, {"cumple": true, "puntos": 1, "unidad": "g/dL", "dominio": "Bioquímicos", "criterio": "Hemoglobina < 11 g/dL", "tipo_factor": "RIESGO_FACTOR_HEMOGLOBINA", "valor_medido": 9.5, "puntaje_otorgado": 1}, {"cumple": true, "puntos": 1, "unidad": "mg/dL", "dominio": "Bioquímicos", "criterio": "Creatinina sérica ≥ 1.3 mg/dL", "tipo_factor": "RIESGO_FACTOR_CREATININA", "valor_medido": 1.6, "puntaje_otorgado": 1}, {"cumple": true, "puntos": 1, "dominio": "Bioquímicos", "criterio": "NLR > 4.5", "tipo_factor": "RIESGO_FACTOR_NLR", "valor_medido": 5.8, "puntaje_otorgado": 1}, {"cumple": true, "puntos": 1, "dominio": "Bioquímicos", "criterio": "MLR > 0.35", "tipo_factor": "RIESGO_FACTOR_MLR", "valor_medido": 0.48, "puntaje_otorgado": 1}, {"conteo": 3, "cumple": true, "puntos": 1, "dominio": "Clínico-funcional", "criterio": "Nº comorbilidades ≥ 2", "tipo_factor": "RIESGO_FACTOR_COMORBILIDADES", "puntaje_otorgado": 1, "detalle_comorbilidades": ["HTA", "DM2", "EPOC"]}, {"cumple": true, "puntos": 1, "dominio": "Clínico-funcional", "criterio": "Índice de Barthel ≤ 30", "tipo_factor": "RIESGO_FACTOR_BARTHEL", "puntaje_barthel": 25, "puntaje_otorgado": 1}, {"cumple": false, "puntos": 1, "unidad": "kg/m²", "dominio": "Clínico-funcional", "criterio": "IMC ≤ 18.5 kg/m²", "tipo_factor": "RIESGO_FACTOR_IMC", "valor_medido": 20.8, "puntaje_otorgado": 0}, {"cumple": true, "puntos": 1, "dominio": "Hábitos", "criterio": "Tabaquismo activo", "tipo_factor": "RIESGO_FACTOR_TABACO", "valor_medido": true, "puntaje_otorgado": 1}, {"cumple": true, "puntos": 1, "dominio": "Hábitos", "criterio": "Glucocorticoides orales crónicos ≥ 3 meses", "tipo_factor": "RIESGO_FACTOR_CORTICOIDES", "valor_medido": true, "puntaje_otorgado": 1}, {"cumple": true, "puntos": 1, "dominio": "Hábitos", "criterio": "Alcohol ≥ 3/día", "tipo_factor": "RIESGO_FACTOR_ALCOHOL", "valor_medido": true, "puntaje_otorgado": 1}, {"cumple": true, "puntos": 2, "dominio": "Quirúrgicos", "criterio": "Subcapital desplazada", "tipo_factor": "RIESGO_FACTOR_SUBCAPITAL", "valor_medido": true, "tipo_fractura": "INTRACAPSULAR", "puntaje_otorgado": 2}, {"cumple": true, "puntos": 1, "dominio": "Quirúrgicos", "criterio": "Retraso quirúrgico > 48 h", "tipo_factor": "RIESGO_FACTOR_RETRASO_QX", "horas_retraso": 72.0, "puntaje_otorgado": 1}], "puntaje_total": 21}	2025-09-29 01:45:09.522569-03
421	57	\N	RIESGO_FACTOR_EDAD_80	0	\N	{"cumple": false, "puntos": 1, "unidad": "años", "dominio": "Generales", "criterio": "Edad ≥ 80 años", "tipo_factor": "RIESGO_FACTOR_EDAD_80", "valor_medido": 78, "puntaje_otorgado": 0}	2025-09-29 01:45:09.721894-03
422	57	\N	RIESGO_FACTOR_SEXO_FEMENINO	0	\N	{"cumple": false, "puntos": 1, "dominio": "Generales", "criterio": "Sexo femenino", "tipo_factor": "RIESGO_FACTOR_SEXO_FEMENINO", "valor_medido": "M", "puntaje_otorgado": 0}	2025-09-29 01:45:09.726605-03
423	57	\N	RIESGO_FACTOR_FRACTURA_FRAGILIDAD	2	\N	{"cumple": true, "puntos": 2, "dominio": "Generales", "criterio": "Fractura previa por fragilidad", "tipo_factor": "RIESGO_FACTOR_FRACTURA_FRAGILIDAD", "valor_medido": true, "puntaje_otorgado": 2}	2025-09-29 01:45:09.731219-03
424	57	\N	RIESGO_FACTOR_FRACTURA_VERTEBRAL	0	\N	{"cumple": false, "puntos": 1, "dominio": "Generales", "criterio": "Fractura vertebral previa", "tipo_factor": "RIESGO_FACTOR_FRACTURA_VERTEBRAL", "valor_medido": false, "puntaje_otorgado": 0}	2025-09-29 01:45:09.735896-03
425	57	\N	RIESGO_FACTOR_ANTECEDENTE_FAMILIAR	1	\N	{"cumple": true, "puntos": 1, "dominio": "Generales", "criterio": "Antecedente familiar de fractura de cadera", "tipo_factor": "RIESGO_FACTOR_ANTECEDENTE_FAMILIAR", "valor_medido": true, "puntaje_otorgado": 1}	2025-09-29 01:45:09.740552-03
426	57	\N	RIESGO_FACTOR_VITAMINA_D	2	\N	{"cumple": true, "puntos": 2, "unidad": "ng/mL", "dominio": "Bioquímicos", "criterio": "Vitamina D < 20 ng/mL", "tipo_factor": "RIESGO_FACTOR_VITAMINA_D", "valor_medido": 18.5, "puntaje_otorgado": 2}	2025-09-29 01:45:09.745237-03
427	57	\N	RIESGO_FACTOR_ALBUMINA	1	\N	{"cumple": true, "puntos": 1, "unidad": "g/dL", "dominio": "Bioquímicos", "criterio": "Albúmina < 3.5 g/dL", "tipo_factor": "RIESGO_FACTOR_ALBUMINA", "valor_medido": 3.4, "puntaje_otorgado": 1}	2025-09-29 01:45:09.749913-03
428	57	\N	RIESGO_FACTOR_HEMOGLOBINA	0	\N	{"cumple": false, "puntos": 1, "unidad": "g/dL", "dominio": "Bioquímicos", "criterio": "Hemoglobina < 11 g/dL", "tipo_factor": "RIESGO_FACTOR_HEMOGLOBINA", "valor_medido": 11.2, "puntaje_otorgado": 0}	2025-09-29 01:45:09.754328-03
429	57	\N	RIESGO_FACTOR_CREATININA	1	\N	{"cumple": true, "puntos": 1, "unidad": "mg/dL", "dominio": "Bioquímicos", "criterio": "Creatinina sérica ≥ 1.3 mg/dL", "tipo_factor": "RIESGO_FACTOR_CREATININA", "valor_medido": 1.3, "puntaje_otorgado": 1}	2025-09-29 01:45:09.758753-03
430	57	\N	RIESGO_FACTOR_NLR	1	\N	{"cumple": true, "puntos": 1, "dominio": "Bioquímicos", "criterio": "NLR > 4.5", "tipo_factor": "RIESGO_FACTOR_NLR", "valor_medido": 4.8, "puntaje_otorgado": 1}	2025-09-29 01:45:09.7632-03
431	57	\N	RIESGO_FACTOR_MLR	1	\N	{"cumple": true, "puntos": 1, "dominio": "Bioquímicos", "criterio": "MLR > 0.35", "tipo_factor": "RIESGO_FACTOR_MLR", "valor_medido": 0.37, "puntaje_otorgado": 1}	2025-09-29 01:45:09.767617-03
432	57	\N	RIESGO_FACTOR_COMORBILIDADES	1	\N	{"conteo": 2, "cumple": true, "puntos": 1, "dominio": "Clínico-funcional", "criterio": "Nº comorbilidades ≥ 2", "tipo_factor": "RIESGO_FACTOR_COMORBILIDADES", "puntaje_otorgado": 1, "detalle_comorbilidades": ["HTA", "IRC"]}	2025-09-29 01:45:09.771814-03
433	57	\N	RIESGO_FACTOR_BARTHEL	0	\N	{"cumple": false, "puntos": 1, "dominio": "Clínico-funcional", "criterio": "Índice de Barthel ≤ 30", "tipo_factor": "RIESGO_FACTOR_BARTHEL", "puntaje_barthel": 35, "puntaje_otorgado": 0}	2025-09-29 01:45:09.775942-03
434	57	\N	RIESGO_FACTOR_IMC	0	\N	{"cumple": false, "puntos": 1, "unidad": "kg/m²", "dominio": "Clínico-funcional", "criterio": "IMC ≤ 18.5 kg/m²", "tipo_factor": "RIESGO_FACTOR_IMC", "valor_medido": 22.7, "puntaje_otorgado": 0}	2025-09-29 01:45:09.780082-03
435	57	\N	RIESGO_FACTOR_TABACO	0	\N	{"cumple": false, "puntos": 1, "dominio": "Hábitos", "criterio": "Tabaquismo activo", "tipo_factor": "RIESGO_FACTOR_TABACO", "valor_medido": false, "puntaje_otorgado": 0}	2025-09-29 01:45:09.784297-03
436	57	\N	RIESGO_FACTOR_CORTICOIDES	0	\N	{"cumple": false, "puntos": 1, "dominio": "Hábitos", "criterio": "Glucocorticoides orales crónicos ≥ 3 meses", "tipo_factor": "RIESGO_FACTOR_CORTICOIDES", "valor_medido": false, "puntaje_otorgado": 0}	2025-09-29 01:45:09.788363-03
437	57	\N	RIESGO_FACTOR_ALCOHOL	1	\N	{"cumple": true, "puntos": 1, "dominio": "Hábitos", "criterio": "Alcohol ≥ 3/día", "tipo_factor": "RIESGO_FACTOR_ALCOHOL", "valor_medido": true, "puntaje_otorgado": 1}	2025-09-29 01:45:09.792319-03
438	57	\N	RIESGO_FACTOR_SUBCAPITAL	0	\N	{"cumple": false, "puntos": 2, "dominio": "Quirúrgicos", "criterio": "Subcapital desplazada", "tipo_factor": "RIESGO_FACTOR_SUBCAPITAL", "valor_medido": false, "tipo_fractura": "PERTROCANTERICA", "puntaje_otorgado": 0}	2025-09-29 01:45:09.796307-03
439	57	\N	RIESGO_FACTOR_RETRASO_QX	0	\N	{"cumple": false, "puntos": 1, "dominio": "Quirúrgicos", "criterio": "Retraso quirúrgico > 48 h", "tipo_factor": "RIESGO_FACTOR_RETRASO_QX", "horas_retraso": 40.0, "puntaje_otorgado": 0}	2025-09-29 01:45:09.800299-03
440	57	\N	RIESGO_REFRACTURA	11	ALTO	{"color": "ROJO", "nivel": "ALTO", "criterios": [{"cumple": false, "puntos": 1, "unidad": "años", "dominio": "Generales", "criterio": "Edad ≥ 80 años", "tipo_factor": "RIESGO_FACTOR_EDAD_80", "valor_medido": 78, "puntaje_otorgado": 0}, {"cumple": false, "puntos": 1, "dominio": "Generales", "criterio": "Sexo femenino", "tipo_factor": "RIESGO_FACTOR_SEXO_FEMENINO", "valor_medido": "M", "puntaje_otorgado": 0}, {"cumple": true, "puntos": 2, "dominio": "Generales", "criterio": "Fractura previa por fragilidad", "tipo_factor": "RIESGO_FACTOR_FRACTURA_FRAGILIDAD", "valor_medido": true, "puntaje_otorgado": 2}, {"cumple": false, "puntos": 1, "dominio": "Generales", "criterio": "Fractura vertebral previa", "tipo_factor": "RIESGO_FACTOR_FRACTURA_VERTEBRAL", "valor_medido": false, "puntaje_otorgado": 0}, {"cumple": true, "puntos": 1, "dominio": "Generales", "criterio": "Antecedente familiar de fractura de cadera", "tipo_factor": "RIESGO_FACTOR_ANTECEDENTE_FAMILIAR", "valor_medido": true, "puntaje_otorgado": 1}, {"cumple": true, "puntos": 2, "unidad": "ng/mL", "dominio": "Bioquímicos", "criterio": "Vitamina D < 20 ng/mL", "tipo_factor": "RIESGO_FACTOR_VITAMINA_D", "valor_medido": 18.5, "puntaje_otorgado": 2}, {"cumple": true, "puntos": 1, "unidad": "g/dL", "dominio": "Bioquímicos", "criterio": "Albúmina < 3.5 g/dL", "tipo_factor": "RIESGO_FACTOR_ALBUMINA", "valor_medido": 3.4, "puntaje_otorgado": 1}, {"cumple": false, "puntos": 1, "unidad": "g/dL", "dominio": "Bioquímicos", "criterio": "Hemoglobina < 11 g/dL", "tipo_factor": "RIESGO_FACTOR_HEMOGLOBINA", "valor_medido": 11.2, "puntaje_otorgado": 0}, {"cumple": true, "puntos": 1, "unidad": "mg/dL", "dominio": "Bioquímicos", "criterio": "Creatinina sérica ≥ 1.3 mg/dL", "tipo_factor": "RIESGO_FACTOR_CREATININA", "valor_medido": 1.3, "puntaje_otorgado": 1}, {"cumple": true, "puntos": 1, "dominio": "Bioquímicos", "criterio": "NLR > 4.5", "tipo_factor": "RIESGO_FACTOR_NLR", "valor_medido": 4.8, "puntaje_otorgado": 1}, {"cumple": true, "puntos": 1, "dominio": "Bioquímicos", "criterio": "MLR > 0.35", "tipo_factor": "RIESGO_FACTOR_MLR", "valor_medido": 0.37, "puntaje_otorgado": 1}, {"conteo": 2, "cumple": true, "puntos": 1, "dominio": "Clínico-funcional", "criterio": "Nº comorbilidades ≥ 2", "tipo_factor": "RIESGO_FACTOR_COMORBILIDADES", "puntaje_otorgado": 1, "detalle_comorbilidades": ["HTA", "IRC"]}, {"cumple": false, "puntos": 1, "dominio": "Clínico-funcional", "criterio": "Índice de Barthel ≤ 30", "tipo_factor": "RIESGO_FACTOR_BARTHEL", "puntaje_barthel": 35, "puntaje_otorgado": 0}, {"cumple": false, "puntos": 1, "unidad": "kg/m²", "dominio": "Clínico-funcional", "criterio": "IMC ≤ 18.5 kg/m²", "tipo_factor": "RIESGO_FACTOR_IMC", "valor_medido": 22.7, "puntaje_otorgado": 0}, {"cumple": false, "puntos": 1, "dominio": "Hábitos", "criterio": "Tabaquismo activo", "tipo_factor": "RIESGO_FACTOR_TABACO", "valor_medido": false, "puntaje_otorgado": 0}, {"cumple": false, "puntos": 1, "dominio": "Hábitos", "criterio": "Glucocorticoides orales crónicos ≥ 3 meses", "tipo_factor": "RIESGO_FACTOR_CORTICOIDES", "valor_medido": false, "puntaje_otorgado": 0}, {"cumple": true, "puntos": 1, "dominio": "Hábitos", "criterio": "Alcohol ≥ 3/día", "tipo_factor": "RIESGO_FACTOR_ALCOHOL", "valor_medido": true, "puntaje_otorgado": 1}, {"cumple": false, "puntos": 2, "dominio": "Quirúrgicos", "criterio": "Subcapital desplazada", "tipo_factor": "RIESGO_FACTOR_SUBCAPITAL", "valor_medido": false, "tipo_fractura": "PERTROCANTERICA", "puntaje_otorgado": 0}, {"cumple": false, "puntos": 1, "dominio": "Quirúrgicos", "criterio": "Retraso quirúrgico > 48 h", "tipo_factor": "RIESGO_FACTOR_RETRASO_QX", "horas_retraso": 40.0, "puntaje_otorgado": 0}], "puntaje_total": 11}	2025-09-29 01:45:09.804313-03
467	58	52	RIESGO_FACTOR_SEXO_FEMENINO	1	\N	{"cumple": true, "puntos": 1, "dominio": "Generales", "mensaje": "Mayor riesgo de osteoporosis y fragilidad. Mantener prevencion y tratamiento oseo.", "criterio": "Sexo femenino", "prioridad": "MEDIA", "valor_medido": "F", "puntaje_otorgado": 1}	2025-09-29 02:50:53.057-03
468	58	52	RIESGO_REFRACTURA	1	BAJO	{"color": "VERDE", "nivel": "BAJO", "criterios": [{"tipo": "RIESGO_FACTOR_EDAD_80", "cumple": false, "mensaje": "Riesgo aumentado por fragilidad. Refuerza prevencion de caidas y optimiza manejo perioperatorio.", "prioridad": "MEDIA", "puntaje_otorgado": 0}, {"tipo": "RIESGO_FACTOR_SEXO_FEMENINO", "cumple": true, "mensaje": "Mayor riesgo de osteoporosis y fragilidad. Mantener prevencion y tratamiento oseo.", "prioridad": "MEDIA", "puntaje_otorgado": 1}, {"tipo": "RIESGO_FACTOR_FRACTURA_FRAGILIDAD", "cumple": false, "mensaje": "Alto riesgo de refractura. Indicar seguimiento preventivo y optimizar tratamiento oseo.", "prioridad": "ALTA", "puntaje_otorgado": 0}, {"tipo": "RIESGO_FACTOR_FRACTURA_VERTEBRAL", "cumple": false, "mensaje": "Fragilidad esqueletica acumulada. Intensificar prevencion de nuevas fracturas.", "prioridad": "MEDIA", "puntaje_otorgado": 0}, {"tipo": "RIESGO_FACTOR_ANTECEDENTE_FAMILIAR", "cumple": false, "mensaje": "Riesgo heredofamiliar aumentado. Refuerza pesquisa y prevencion secundaria.", "prioridad": "MEDIA", "puntaje_otorgado": 0}, {"tipo": "RIESGO_FACTOR_VITAMINA_D", "cumple": false, "mensaje": "Deficiencia de vitamina D. Iniciar suplementacion y control metabolico oseo.", "prioridad": "ALTA", "puntaje_otorgado": 0}, {"tipo": "RIESGO_FACTOR_ALBUMINA", "cumple": false, "mensaje": "Riesgo nutricional. Solicitar evaluacion nutricional y correccion.", "prioridad": "MEDIA", "puntaje_otorgado": 0}, {"tipo": "RIESGO_FACTOR_HEMOGLOBINA", "cumple": false, "mensaje": "Anemia por tolerancia y complicaciones. Corregir y monitorizar.", "prioridad": "MEDIA", "puntaje_otorgado": 0}, {"tipo": "RIESGO_FACTOR_CREATININA", "cumple": false, "mensaje": "Compromiso de funcion renal. Ajustar farmacos y vigilar complicaciones.", "prioridad": "MEDIA", "puntaje_otorgado": 0}, {"tipo": "RIESGO_FACTOR_NLR", "cumple": false, "mensaje": "Inflamacion elevada, peor pronostico. Intensificar vigilancia clinica.", "prioridad": "MEDIA", "puntaje_otorgado": 0}, {"tipo": "RIESGO_FACTOR_MLR", "cumple": false, "mensaje": "Inmunosenescencia o inflamacion. Monitorizar de cerca.", "prioridad": "MEDIA", "puntaje_otorgado": 0}, {"tipo": "RIESGO_FACTOR_COMORBILIDADES", "cumple": false, "mensaje": "Mayor carga basal. Requiere seguimiento estrecho e interconsultas segun necesidad.", "prioridad": "MEDIA", "puntaje_otorgado": 0}, {"tipo": "RIESGO_FACTOR_BARTHEL", "cumple": false, "mensaje": "Dependencia funcional severa. Coordinar rehabilitacion temprana.", "prioridad": "MEDIA", "puntaje_otorgado": 0}, {"tipo": "RIESGO_FACTOR_IMC", "cumple": false, "mensaje": "Sarcopenia o malnutricion probable. Evaluar nutricion y fortalecer musculatura.", "prioridad": "MEDIA", "puntaje_otorgado": 0}, {"tipo": "RIESGO_FACTOR_TABACO", "cumple": false, "mensaje": "Factor modificable. Sugerir cese tabaco y reforzar prevencion de complicaciones.", "prioridad": "MEDIA", "puntaje_otorgado": 0}, {"tipo": "RIESGO_FACTOR_CORTICOIDES", "cumple": false, "mensaje": "Supresion hormonal y mayor riesgo de osteoporosis. Optimizar manejo y suplementacion.", "prioridad": "MEDIA", "puntaje_otorgado": 0}, {"tipo": "RIESGO_FACTOR_ALCOHOL", "cumple": false, "mensaje": "Menor densidad osea y mayor riesgo de caida. Intervenir sobre consumo.", "prioridad": "MEDIA", "puntaje_otorgado": 0}, {"tipo": "RIESGO_FACTOR_SUBCAPITAL", "cumple": false, "mensaje": "Mayor complejidad y peor recuperacion. Manejo prioritario y rehabilitacion intensiva.", "prioridad": "ALTA", "puntaje_otorgado": 0}, {"tipo": "RIESGO_FACTOR_RETRASO_QX", "cumple": false, "mensaje": "Mayor mortalidad y complicaciones. Priorizar resolucion y soporte perioperatorio.", "prioridad": "MEDIA", "puntaje_otorgado": 0}], "control_id": 52, "puntaje_total": 1, "accion_recomendada": "No se genera alerta. Seguimiento estándar."}	2025-09-29 02:50:53.063-03
\.


--
-- Data for Name: evolucion; Type: TABLE DATA; Schema: public; Owner: sofia
--

COPY public.evolucion (evolucion_id, episodio_id, transfusion_requerida, reingreso_30d, comentarios) FROM stdin;
1	1	f	f	Evolución favorable
2	2	t	f	Evolución favorable
3	3	f	f	Evolución favorable
4	4	t	f	Evolución favorable
5	5	f	f	Evolución favorable
6	6	t	f	Evolución favorable
7	7	f	f	Evolución favorable
8	8	t	f	Evolución favorable
9	9	f	f	Evolución favorable
10	10	t	f	Evolución favorable
11	11	f	f	Evolución favorable
12	12	t	f	Evolución favorable
13	13	f	f	Evolución favorable
14	14	t	f	Evolución favorable
15	15	f	f	Evolución favorable
16	16	t	f	Evolución favorable
17	17	f	f	Evolución favorable
18	18	t	f	Evolución favorable
19	19	f	f	Evolución favorable
20	20	t	f	Evolución favorable
21	21	f	f	Evolución favorable
22	22	t	f	Evolución favorable
23	23	f	f	Evolución favorable
24	24	t	f	Evolución favorable
25	25	f	f	Evolución favorable
26	26	t	f	Evolución favorable
42	50	f	f	Evolución favorable
43	51	t	f	Evolución favorable
44	52	f	f	Evolución favorable
45	53	t	f	Evolución favorable
46	54	f	f	Evolución favorable
47	55	t	f	Evolución favorable
48	56	t	t	Se indica control estrecho por anemia
49	57	f	f	Recuperación moderada
50	58	f	f	Recuperación funcional adecuada
\.


--
-- Data for Name: examen; Type: TABLE DATA; Schema: public; Owner: sofia
--

COPY public.examen (examen_id, tipo_examen, paciente_id, profesional_id) FROM stdin;
1	LABORATORIO	4	\N
2	LABORATORIO	5	\N
3	LABORATORIO	6	\N
4	LABORATORIO	4	\N
5	LABORATORIO	5	\N
6	LABORATORIO	6	\N
7	LABORATORIO	7	\N
8	LABORATORIO	8	\N
19	LABORATORIO	4	\N
20	LABORATORIO	5	\N
21	LABORATORIO	6	\N
22	LABORATORIO	18	\N
23	LABORATORIO	19	\N
24	LABORATORIO	20	\N
25	LABORATORIO	20	\N
26	LABORATORIO	20	\N
27	LABORATORIO	20	\N
\.


--
-- Data for Name: generic_report; Type: TABLE DATA; Schema: public; Owner: sofia
--

COPY public.generic_report (report_id, examen_id, modalidad, region_anat, dicom_study_uid, sitio_muestra, procedimiento, hallazgos, impresion, cod_snomed, informado_por, informado_en) FROM stdin;
\.


--
-- Data for Name: indicador_riesgo; Type: TABLE DATA; Schema: public; Owner: sofia
--

COPY public.indicador_riesgo (indicador_id, descripcion, puntaje, resultado_id) FROM stdin;
1	Riesgo por Hb baja	2.308815338331665	1
2	Riesgo por Hb baja	4.962029651492177	5
3	Riesgo por Hb baja	4.183864200784804	9
4	Riesgo por Hb baja	3.4325974840850977	13
5	Riesgo por Hb baja	1.4878732662001406	17
6	Riesgo por Hb baja	4.047343544924885	21
7	Riesgo por Hb baja	2.1243008171938187	25
8	Riesgo por Hb baja	4.520068033254043	29
9	Riesgo por Hb baja	1.3109305133074578	33
10	Riesgo por Hb baja	2.1320877120360433	37
11	Riesgo por Hb baja	4.7824082534685255	41
12	Riesgo por Hb baja	2.5376641503911057	45
13	Riesgo por Hb baja	1.6842897758053592	49
14	Riesgo por Hb baja	1.9119816299115153	53
15	Riesgo por Hb baja	2.155841848944998	57
16	Riesgo por Hb baja	1.276630726954905	61
17	Riesgo por Hb baja	4.1882553469345645	65
18	Riesgo por Hb baja	2.993060431719251	69
19	Riesgo por Hb baja	3.1549582652306905	73
20	Riesgo por Hb baja	4.523464351732448	77
21	Riesgo por Hb baja	2.533339991142608	81
22	Riesgo por Hb baja	1.3092064231539164	85
23	Riesgo por Hb baja	3.8220363726956723	89
24	Riesgo por Hb baja	3.886876695267292	93
25	Riesgo por Hb baja	3.7229656329084055	97
26	Riesgo por Hb baja	1.7890245330762542	101
40	Riesgo por Hb baja	1.3619957504922184	231
41	Riesgo por Hb baja	3.7187991957305857	238
42	Riesgo por Hb baja	2.404250127343783	245
43	Riesgo por Hb baja	3.1157925193733615	252
44	Riesgo por Hb baja	1.1444800106505642	259
45	Riesgo por Hb baja	2.3667543759715164	266
46	Riesgo por Hb baja	1.83	273
47	Riesgo por Hb baja	1.27	280
48	Riesgo por Hb baja	0.73	287
\.


--
-- Data for Name: minuta; Type: TABLE DATA; Schema: public; Owner: sofia
--

COPY public.minuta (minuta_id, ruta_pdf, fecha_creacion, funcionario_id, paciente_id, tecnologo_id, profesional_id) FROM stdin;
1	/minutas/4-1.pdf	2025-08-25 02:17:45.879758-04	1	4	2	\N
2	/minutas/4-2.pdf	2025-08-10 02:17:45.946279-04	1	4	2	\N
3	/minutas/5-3.pdf	2025-08-25 02:17:46.122866-04	1	5	2	\N
4	/minutas/5-4.pdf	2025-08-10 02:17:46.180664-04	1	5	2	\N
5	/minutas/6-5.pdf	2025-08-25 02:17:46.357657-04	1	6	2	\N
6	/minutas/6-6.pdf	2025-08-10 02:17:46.415182-04	1	6	2	\N
7	/minutas/4-7.pdf	2025-08-25 02:17:49.217961-04	1	4	2	\N
8	/minutas/4-8.pdf	2025-08-10 02:17:49.254414-04	1	4	2	\N
9	/minutas/4-9.pdf	2025-07-26 02:17:49.286702-04	1	4	2	\N
10	/minutas/4-10.pdf	2025-07-11 02:17:49.319871-04	1	4	2	\N
11	/minutas/5-11.pdf	2025-08-25 02:17:49.353789-04	1	5	2	\N
12	/minutas/5-12.pdf	2025-08-10 02:17:49.386353-04	1	5	2	\N
13	/minutas/5-13.pdf	2025-07-26 02:17:49.419078-04	1	5	2	\N
14	/minutas/5-14.pdf	2025-07-11 02:17:49.45091-04	1	5	2	\N
15	/minutas/6-15.pdf	2025-08-25 02:17:49.483391-04	1	6	2	\N
16	/minutas/6-16.pdf	2025-08-10 02:17:49.515369-04	1	6	2	\N
17	/minutas/6-17.pdf	2025-07-26 02:17:49.543972-04	1	6	2	\N
18	/minutas/6-18.pdf	2025-07-11 02:17:49.572223-04	1	6	2	\N
19	/minutas/7-19.pdf	2025-08-25 02:17:49.724258-04	1	7	2	\N
20	/minutas/7-20.pdf	2025-08-10 02:17:49.779452-04	1	7	2	\N
21	/minutas/7-21.pdf	2025-07-26 02:17:49.8302-04	1	7	2	\N
22	/minutas/7-22.pdf	2025-07-11 02:17:49.871827-04	1	7	2	\N
23	/minutas/8-23.pdf	2025-08-25 02:17:50.031909-04	1	8	2	\N
24	/minutas/8-24.pdf	2025-08-10 02:17:50.088339-04	1	8	2	\N
25	/minutas/8-25.pdf	2025-07-26 02:17:50.140266-04	1	8	2	\N
26	/minutas/8-26.pdf	2025-07-11 02:17:50.182842-04	1	8	2	\N
40	/minutas/4-50.pdf	2025-08-31 00:45:08.703636-04	1	4	2	\N
41	/minutas/4-51.pdf	2025-08-16 00:45:08.810307-04	1	4	2	\N
42	/minutas/5-52.pdf	2025-08-31 00:45:08.909469-04	1	5	2	\N
43	/minutas/5-53.pdf	2025-08-16 00:45:09.006427-04	1	5	2	\N
44	/minutas/6-54.pdf	2025-08-31 00:45:09.10414-04	1	6	2	\N
45	/minutas/6-55.pdf	2025-08-16 00:45:09.187588-04	1	6	2	\N
46	/minutas/curated-18-56.pdf	2025-08-11 00:45:09.272637-04	1	18	2	\N
47	/minutas/curated-19-57.pdf	2025-08-21 00:45:09.272637-04	1	19	2	\N
48	/minutas/curated-20-58.pdf	2025-08-31 00:45:09.272637-04	1	20	2	\N
\.


--
-- Data for Name: muestra; Type: TABLE DATA; Schema: public; Owner: sofia
--

COPY public.muestra (muestra_id, tipo_muestra, fecha_extraccion, fecha_recepcion, observaciones, examen_id, profesional_id) FROM stdin;
1	SANGRE	2025-08-24 03:17:45.879758-04	2025-08-24 05:17:45.879758-04	Muestra sin hemólisis	1	2
2	SANGRE	2025-08-09 03:17:45.946279-04	2025-08-09 05:17:45.946279-04	Muestra sin hemólisis	1	2
3	SANGRE	2025-08-24 03:17:46.122866-04	2025-08-24 05:17:46.122866-04	Muestra sin hemólisis	2	2
4	SANGRE	2025-08-09 03:17:46.180664-04	2025-08-09 05:17:46.180664-04	Muestra sin hemólisis	2	2
5	SANGRE	2025-08-24 03:17:46.357657-04	2025-08-24 05:17:46.357657-04	Muestra sin hemólisis	3	2
6	SANGRE	2025-08-09 03:17:46.415182-04	2025-08-09 05:17:46.415182-04	Muestra sin hemólisis	3	2
7	SANGRE	2025-08-24 03:17:49.217961-04	2025-08-24 05:17:49.217961-04	Muestra sin hemólisis	4	2
8	SANGRE	2025-08-09 03:17:49.254414-04	2025-08-09 05:17:49.254414-04	Muestra sin hemólisis	4	2
9	SANGRE	2025-07-25 03:17:49.286702-04	2025-07-25 05:17:49.286702-04	Muestra sin hemólisis	4	2
10	SANGRE	2025-07-10 03:17:49.319871-04	2025-07-10 05:17:49.319871-04	Muestra sin hemólisis	4	2
11	SANGRE	2025-08-24 03:17:49.353789-04	2025-08-24 05:17:49.353789-04	Muestra sin hemólisis	5	2
12	SANGRE	2025-08-09 03:17:49.386353-04	2025-08-09 05:17:49.386353-04	Muestra sin hemólisis	5	2
13	SANGRE	2025-07-25 03:17:49.419078-04	2025-07-25 05:17:49.419078-04	Muestra sin hemólisis	5	2
14	SANGRE	2025-07-10 03:17:49.45091-04	2025-07-10 05:17:49.45091-04	Muestra sin hemólisis	5	2
15	SANGRE	2025-08-24 03:17:49.483391-04	2025-08-24 05:17:49.483391-04	Muestra sin hemólisis	6	2
16	SANGRE	2025-08-09 03:17:49.515369-04	2025-08-09 05:17:49.515369-04	Muestra sin hemólisis	6	2
17	SANGRE	2025-07-25 03:17:49.543972-04	2025-07-25 05:17:49.543972-04	Muestra sin hemólisis	6	2
18	SANGRE	2025-07-10 03:17:49.572223-04	2025-07-10 05:17:49.572223-04	Muestra sin hemólisis	6	2
19	SANGRE	2025-08-24 03:17:49.724258-04	2025-08-24 05:17:49.724258-04	Muestra sin hemólisis	7	2
20	SANGRE	2025-08-09 03:17:49.779452-04	2025-08-09 05:17:49.779452-04	Muestra sin hemólisis	7	2
21	SANGRE	2025-07-25 03:17:49.8302-04	2025-07-25 05:17:49.8302-04	Muestra sin hemólisis	7	2
22	SANGRE	2025-07-10 03:17:49.871827-04	2025-07-10 05:17:49.871827-04	Muestra sin hemólisis	7	2
23	SANGRE	2025-08-24 03:17:50.031909-04	2025-08-24 05:17:50.031909-04	Muestra sin hemólisis	8	2
24	SANGRE	2025-08-09 03:17:50.088339-04	2025-08-09 05:17:50.088339-04	Muestra sin hemólisis	8	2
25	SANGRE	2025-07-25 03:17:50.140266-04	2025-07-25 05:17:50.140266-04	Muestra sin hemólisis	8	2
26	SANGRE	2025-07-10 03:17:50.182842-04	2025-07-10 05:17:50.182842-04	Muestra sin hemólisis	8	2
42	SANGRE	2025-08-30 01:45:08.703636-04	2025-08-30 03:45:08.703636-04	Muestra sin hemólisis	19	2
43	SANGRE	2025-08-15 01:45:08.810307-04	2025-08-15 03:45:08.810307-04	Muestra sin hemólisis	19	2
44	SANGRE	2025-08-30 01:45:08.909469-04	2025-08-30 03:45:08.909469-04	Muestra sin hemólisis	20	2
45	SANGRE	2025-08-15 01:45:09.006427-04	2025-08-15 03:45:09.006427-04	Muestra sin hemólisis	20	2
46	SANGRE	2025-08-30 01:45:09.10414-04	2025-08-30 03:45:09.10414-04	Muestra sin hemólisis	21	2
47	SANGRE	2025-08-15 01:45:09.187588-04	2025-08-15 03:45:09.187588-04	Muestra sin hemólisis	21	2
48	SANGRE	2025-08-10 01:45:09.272637-04	2025-08-10 03:45:09.272637-04	Muestra conservada en frío	22	2
49	SANGRE	2025-08-20 02:45:09.272637-04	2025-08-20 04:45:09.272637-04	Muestra sin incidencias	23	2
50	SANGRE	2025-08-30 01:45:09.272637-04	2025-08-30 03:45:09.272637-04	Valoración habitual	24	2
51	SANGRE	2025-09-22 02:42:27.783-03	2025-09-25 02:42:27.783-03	\N	25	2
52	SANGRE	2025-09-24 02:49:37.304-03	2025-09-29 02:49:37.304-03	\N	25	2
53	SANGRE	2025-09-29 21:46:21.179-03	\N	\N	27	2
\.


--
-- Data for Name: pacientes; Type: TABLE DATA; Schema: public; Owner: sofia
--

COPY public.pacientes (user_id, tipo_sangre, altura, edad_anios, edad_meses) FROM stdin;
4	A-	1.73	70	0
5	A+	1.67	71	2
6	A-	1.61	72	4
7	B+	1.56	73	6
8	O-	1.79	74	8
11	\N	\N	24	0
12	\N	\N	25	0
15	\N	\N	24	6
3	O+	167	\N	\N
18	A+	1.56	84	3
19	O+	1.68	78	8
20	B-	1.62	69	5
\.


--
-- Data for Name: parametro_lab; Type: TABLE DATA; Schema: public; Owner: sofia
--

COPY public.parametro_lab (codigo, nombre, unidad, ref_min, ref_max, notas) FROM stdin;
GLUCOSA	Glucosa	mg/dL	70	100	\N
COLESTEROL_TOTAL	Colesterol Total	mg/dL	0	200	\N
TRIGLICERIDOS	Triglicéridos	mg/dL	0	150	\N
HB	Hemoglobina	g/dL	11.6	15.5	\N
UREMIA	UREMIA	mg/dL	19	50	Muy variable. Valores entre 15 y 120 pueden ser transitorios y no reflejar daño renal por sí solos.
Creatinina	CREA	mg/dL	0.5	1.1	Evaluar en conjunto con uremia/TFG.
INR	INR	—	0.97	1.27	Prueba de coagulación.
Protrombina	Actividad	%	60	\N	Normal sobre 60 %.
Sodio	Sodio	mmol/L	136	146	—
Potasio	Potasio	mmol/L	3.5	5.1	Aceptable para operar: 3.2–5.5, según evolución temporal.
Hematocrito	HTO	%	35	46	—
Hemoglobina	HB	g/dL	11.6	15.5	—
Plaquetas	Plaquetas	mil/μL	150	400	100–150 mil/μL suele mejorar rápido con medidas específicas y no impacta mayormente en estos pacientes.
Vitamina D	25-OH	ng/mL	30	\N	20–29: insuficiencia. < 20: deficiencia.
Vitamina B12	B12	pg/mL	400	1200	< 400: deficiencia. > 2000: límite de lab; no indica daño por sí mismo.
Albúmina	Albúmina	g/dL	3.5	\N	3.0–3.4: hipoalbuminemia leve. 2.5–3.0: moderada. < 2.5: severa. Ideal > 4.0 (hasta 4.8).
Calcio	Corregido	mg/dL	8.3	10.6	Corregir solo si albúmina < 4.0 con: Calcio corr. = [(4 − albúmina)*0.8] + calcio.
Magnesio	Plasmático	mg/dL	1.8	2.7	—
PTH	PTH	pg/mL	11.1	79.5	Hasta 250: suele ser secundaria a déficit de Vit D (poco relevante en agudo). > 250: correlacionar con creatinina/uremia (insuficiencia renal). > 800: no operar fractura de cadera.
TSH	TSH	μUI/mL	0.35	5.5	En adultos mayores se acepta hasta 7 como normal.
T4 libre	T4L	ng/dL	0.89	1.76	—
Hierro	Fe	μg/dL	50	170	—
Transferrina	Transferrina	mg/dL	250	380	—
% Saturación	de transferrina	%	20	45	—
\.


--
-- Data for Name: professional_profiles; Type: TABLE DATA; Schema: public; Owner: sofia
--

COPY public.professional_profiles (id, user_id, rut, rut_profesional, especialidad, cargo, hospital, departamento, fecha_ingreso, historial_pacientes, created_at, updated_at) FROM stdin;
1	1	200000001	200000001	Traumatología	FUNCIONARIO	H. Demo	Trauma	2025-09-23	[]	2025-09-23 03:17:45.161284-03	2025-09-23 03:17:45.161284-03
2	2	200000002	200000002	Lab Clínico	TECNOLOGO	H. Demo	Laboratorio	2025-09-23	[]	2025-09-23 03:17:45.161284-03	2025-09-23 03:17:45.161284-03
3	3	200000003	200000003	Epidemiología	INVESTIGADOR	H. Demo	Investigación	2025-09-23	[]	2025-09-23 03:17:45.161284-03	2025-09-23 03:17:45.161284-03
4	10	\N	207311537	\N	INVESTIGADOR	\N	\N	2025-09-25	[]	2025-09-25 07:50:09.004-03	2025-09-25 07:50:09.004-03
5	13	\N	\N	Mecanico	FUNCIONARIO	Quilpué	SAPU	2025-09-26	[]	2025-09-26 01:26:42.73-03	2025-09-26 01:26:42.73-03
6	14	\N	198940828	\N	INVESTIGADOR	\N	\N	2025-09-26	[]	2025-09-26 01:56:07.756-03	2025-09-26 01:56:07.756-03
\.


--
-- Data for Name: registro; Type: TABLE DATA; Schema: public; Owner: sofia
--

COPY public.registro (registro_id, accion, fecha_registro, administrador_rut, actor_user_rut, administrador_id, actor_user_id) FROM stdin;
1	SEED_EPISODIO	2025-09-23 03:17:45.941477-03	111111111	111111111	\N	\N
2	SEED_EPISODIO	2025-09-23 03:17:45.997737-03	111111111	111111111	\N	\N
3	SEED_EPISODIO	2025-09-23 03:17:46.176282-03	111111111	111111111	\N	\N
4	SEED_EPISODIO	2025-09-23 03:17:46.231594-03	111111111	111111111	\N	\N
5	SEED_EPISODIO	2025-09-23 03:17:46.410797-03	111111111	111111111	\N	\N
6	SEED_EPISODIO	2025-09-23 03:17:46.468341-03	111111111	111111111	\N	\N
7	SEED_EPISODIO	2025-09-23 03:17:49.251889-03	111111111	111111111	\N	\N
8	SEED_EPISODIO	2025-09-23 03:17:49.28434-03	111111111	111111111	\N	\N
9	SEED_EPISODIO	2025-09-23 03:17:49.317424-03	111111111	111111111	\N	\N
10	SEED_EPISODIO	2025-09-23 03:17:49.350528-03	111111111	111111111	\N	\N
11	SEED_EPISODIO	2025-09-23 03:17:49.384119-03	111111111	111111111	\N	\N
12	SEED_EPISODIO	2025-09-23 03:17:49.416684-03	111111111	111111111	\N	\N
13	SEED_EPISODIO	2025-09-23 03:17:49.448469-03	111111111	111111111	\N	\N
14	SEED_EPISODIO	2025-09-23 03:17:49.480136-03	111111111	111111111	\N	\N
15	SEED_EPISODIO	2025-09-23 03:17:49.513021-03	111111111	111111111	\N	\N
16	SEED_EPISODIO	2025-09-23 03:17:49.54192-03	111111111	111111111	\N	\N
17	SEED_EPISODIO	2025-09-23 03:17:49.570137-03	111111111	111111111	\N	\N
18	SEED_EPISODIO	2025-09-23 03:17:49.598944-03	111111111	111111111	\N	\N
19	SEED_EPISODIO	2025-09-23 03:17:49.774998-03	111111111	111111111	\N	\N
20	SEED_EPISODIO	2025-09-23 03:17:49.826526-03	111111111	111111111	\N	\N
21	SEED_EPISODIO	2025-09-23 03:17:49.868992-03	111111111	111111111	\N	\N
22	SEED_EPISODIO	2025-09-23 03:17:49.905942-03	111111111	111111111	\N	\N
23	SEED_EPISODIO	2025-09-23 03:17:50.084074-03	111111111	111111111	\N	\N
24	SEED_EPISODIO	2025-09-23 03:17:50.136745-03	111111111	111111111	\N	\N
25	SEED_EPISODIO	2025-09-23 03:17:50.180028-03	111111111	111111111	\N	\N
26	SEED_EPISODIO	2025-09-23 03:17:50.216457-03	111111111	111111111	\N	\N
27	PACIENTE_REGISTRADO	2025-09-26 12:05:14.322-03	\N	111111111	\N	\N
28	PACIENTE_ACTUALIZADO	2025-09-26 12:06:27.06-03	\N	111111111	\N	\N
42	SEED_EPISODIO	2025-09-29 01:45:08.807642-03	111111111	111111111	\N	\N
43	SEED_EPISODIO	2025-09-29 01:45:08.906306-03	111111111	111111111	\N	\N
44	SEED_EPISODIO	2025-09-29 01:45:09.004052-03	111111111	111111111	\N	\N
45	SEED_EPISODIO	2025-09-29 01:45:09.101285-03	111111111	111111111	\N	\N
46	SEED_EPISODIO	2025-09-29 01:45:09.185479-03	111111111	111111111	\N	\N
47	SEED_EPISODIO	2025-09-29 01:45:09.270475-03	111111111	111111111	\N	\N
48	SEED_EPISODIO_CURATED	2025-09-29 01:45:09.546058-03	111111111	111111111	\N	\N
49	SEED_EPISODIO_CURATED	2025-09-29 01:45:09.828703-03	111111111	111111111	\N	\N
50	SEED_EPISODIO_CURATED	2025-09-29 01:45:10.108903-03	111111111	111111111	\N	\N
\.


--
-- Data for Name: resultado; Type: TABLE DATA; Schema: public; Owner: sofia
--

COPY public.resultado (resultado_id, episodio_id, muestra_id, examen_id, parametro, valor, unidad, fecha_resultado) FROM stdin;
1	1	1	1	HB	14.2	g/dL	2025-08-24 07:17:45.879758-04
2	1	1	1	GLUCOSA	120.2	mg/dL	2025-08-24 07:17:45.879758-04
3	1	1	1	COLESTEROL_TOTAL	202.6	mg/dL	2025-08-24 07:17:45.879758-04
4	1	1	1	TRIGLICERIDOS	130.7	mg/dL	2025-08-24 07:17:45.879758-04
5	2	2	1	HB	11.5	g/dL	2025-08-09 07:17:45.946279-04
6	2	2	1	GLUCOSA	146.6	mg/dL	2025-08-09 07:17:45.946279-04
7	2	2	1	COLESTEROL_TOTAL	209.4	mg/dL	2025-08-09 07:17:45.946279-04
8	2	2	1	TRIGLICERIDOS	160.9	mg/dL	2025-08-09 07:17:45.946279-04
9	3	3	2	HB	10.1	g/dL	2025-08-24 07:17:46.122866-04
10	3	3	2	GLUCOSA	146.8	mg/dL	2025-08-24 07:17:46.122866-04
11	3	3	2	COLESTEROL_TOTAL	157.4	mg/dL	2025-08-24 07:17:46.122866-04
12	3	3	2	TRIGLICERIDOS	126.1	mg/dL	2025-08-24 07:17:46.122866-04
13	4	4	2	HB	11.4	g/dL	2025-08-09 07:17:46.180664-04
14	4	4	2	GLUCOSA	120.7	mg/dL	2025-08-09 07:17:46.180664-04
15	4	4	2	COLESTEROL_TOTAL	225.8	mg/dL	2025-08-09 07:17:46.180664-04
16	4	4	2	TRIGLICERIDOS	148.7	mg/dL	2025-08-09 07:17:46.180664-04
17	5	5	3	HB	11.5	g/dL	2025-08-24 07:17:46.357657-04
18	5	5	3	GLUCOSA	125.4	mg/dL	2025-08-24 07:17:46.357657-04
19	5	5	3	COLESTEROL_TOTAL	202.9	mg/dL	2025-08-24 07:17:46.357657-04
20	5	5	3	TRIGLICERIDOS	166.7	mg/dL	2025-08-24 07:17:46.357657-04
21	6	6	3	HB	11.3	g/dL	2025-08-09 07:17:46.415182-04
22	6	6	3	GLUCOSA	123.5	mg/dL	2025-08-09 07:17:46.415182-04
23	6	6	3	COLESTEROL_TOTAL	185.8	mg/dL	2025-08-09 07:17:46.415182-04
24	6	6	3	TRIGLICERIDOS	136.3	mg/dL	2025-08-09 07:17:46.415182-04
25	7	7	4	HB	14	g/dL	2025-08-24 07:17:49.217961-04
26	7	7	4	GLUCOSA	126.4	mg/dL	2025-08-24 07:17:49.217961-04
27	7	7	4	COLESTEROL_TOTAL	188.5	mg/dL	2025-08-24 07:17:49.217961-04
28	7	7	4	TRIGLICERIDOS	158.1	mg/dL	2025-08-24 07:17:49.217961-04
29	8	8	4	HB	15.6	g/dL	2025-08-09 07:17:49.254414-04
30	8	8	4	GLUCOSA	87	mg/dL	2025-08-09 07:17:49.254414-04
31	8	8	4	COLESTEROL_TOTAL	228.9	mg/dL	2025-08-09 07:17:49.254414-04
32	8	8	4	TRIGLICERIDOS	126.1	mg/dL	2025-08-09 07:17:49.254414-04
33	9	9	4	HB	14.8	g/dL	2025-07-25 07:17:49.286702-04
34	9	9	4	GLUCOSA	91.1	mg/dL	2025-07-25 07:17:49.286702-04
35	9	9	4	COLESTEROL_TOTAL	189	mg/dL	2025-07-25 07:17:49.286702-04
36	9	9	4	TRIGLICERIDOS	172.7	mg/dL	2025-07-25 07:17:49.286702-04
37	10	10	4	HB	13.9	g/dL	2025-07-10 07:17:49.319871-04
38	10	10	4	GLUCOSA	108.3	mg/dL	2025-07-10 07:17:49.319871-04
39	10	10	4	COLESTEROL_TOTAL	152.9	mg/dL	2025-07-10 07:17:49.319871-04
40	10	10	4	TRIGLICERIDOS	131.6	mg/dL	2025-07-10 07:17:49.319871-04
41	11	11	5	HB	11.4	g/dL	2025-08-24 07:17:49.353789-04
42	11	11	5	GLUCOSA	123.6	mg/dL	2025-08-24 07:17:49.353789-04
43	11	11	5	COLESTEROL_TOTAL	246.5	mg/dL	2025-08-24 07:17:49.353789-04
44	11	11	5	TRIGLICERIDOS	196.5	mg/dL	2025-08-24 07:17:49.353789-04
45	12	12	5	HB	12.4	g/dL	2025-08-09 07:17:49.386353-04
46	12	12	5	GLUCOSA	139.4	mg/dL	2025-08-09 07:17:49.386353-04
47	12	12	5	COLESTEROL_TOTAL	193.1	mg/dL	2025-08-09 07:17:49.386353-04
48	12	12	5	TRIGLICERIDOS	147.1	mg/dL	2025-08-09 07:17:49.386353-04
49	13	13	5	HB	15.3	g/dL	2025-07-25 07:17:49.419078-04
50	13	13	5	GLUCOSA	146.5	mg/dL	2025-07-25 07:17:49.419078-04
51	13	13	5	COLESTEROL_TOTAL	176.1	mg/dL	2025-07-25 07:17:49.419078-04
52	13	13	5	TRIGLICERIDOS	88.5	mg/dL	2025-07-25 07:17:49.419078-04
53	14	14	5	HB	13.2	g/dL	2025-07-10 07:17:49.45091-04
54	14	14	5	GLUCOSA	144.3	mg/dL	2025-07-10 07:17:49.45091-04
55	14	14	5	COLESTEROL_TOTAL	155.3	mg/dL	2025-07-10 07:17:49.45091-04
56	14	14	5	TRIGLICERIDOS	127.8	mg/dL	2025-07-10 07:17:49.45091-04
57	15	15	6	HB	12.1	g/dL	2025-08-24 07:17:49.483391-04
58	15	15	6	GLUCOSA	96.2	mg/dL	2025-08-24 07:17:49.483391-04
59	15	15	6	COLESTEROL_TOTAL	236.7	mg/dL	2025-08-24 07:17:49.483391-04
60	15	15	6	TRIGLICERIDOS	126.3	mg/dL	2025-08-24 07:17:49.483391-04
61	16	16	6	HB	11.1	g/dL	2025-08-09 07:17:49.515369-04
62	16	16	6	GLUCOSA	70.8	mg/dL	2025-08-09 07:17:49.515369-04
63	16	16	6	COLESTEROL_TOTAL	192.9	mg/dL	2025-08-09 07:17:49.515369-04
64	16	16	6	TRIGLICERIDOS	189	mg/dL	2025-08-09 07:17:49.515369-04
65	17	17	6	HB	12.2	g/dL	2025-07-25 07:17:49.543972-04
66	17	17	6	GLUCOSA	80.1	mg/dL	2025-07-25 07:17:49.543972-04
67	17	17	6	COLESTEROL_TOTAL	161.4	mg/dL	2025-07-25 07:17:49.543972-04
68	17	17	6	TRIGLICERIDOS	130	mg/dL	2025-07-25 07:17:49.543972-04
69	18	18	6	HB	12.8	g/dL	2025-07-10 07:17:49.572223-04
70	18	18	6	GLUCOSA	122.6	mg/dL	2025-07-10 07:17:49.572223-04
71	18	18	6	COLESTEROL_TOTAL	159.2	mg/dL	2025-07-10 07:17:49.572223-04
72	18	18	6	TRIGLICERIDOS	132.4	mg/dL	2025-07-10 07:17:49.572223-04
73	19	19	7	HB	11.1	g/dL	2025-08-24 07:17:49.724258-04
74	19	19	7	GLUCOSA	140.9	mg/dL	2025-08-24 07:17:49.724258-04
75	19	19	7	COLESTEROL_TOTAL	215	mg/dL	2025-08-24 07:17:49.724258-04
76	19	19	7	TRIGLICERIDOS	106.8	mg/dL	2025-08-24 07:17:49.724258-04
77	20	20	7	HB	13.1	g/dL	2025-08-09 07:17:49.779452-04
78	20	20	7	GLUCOSA	105.1	mg/dL	2025-08-09 07:17:49.779452-04
79	20	20	7	COLESTEROL_TOTAL	175.5	mg/dL	2025-08-09 07:17:49.779452-04
80	20	20	7	TRIGLICERIDOS	168	mg/dL	2025-08-09 07:17:49.779452-04
81	21	21	7	HB	15.5	g/dL	2025-07-25 07:17:49.8302-04
82	21	21	7	GLUCOSA	111.4	mg/dL	2025-07-25 07:17:49.8302-04
83	21	21	7	COLESTEROL_TOTAL	172	mg/dL	2025-07-25 07:17:49.8302-04
84	21	21	7	TRIGLICERIDOS	190.6	mg/dL	2025-07-25 07:17:49.8302-04
85	22	22	7	HB	11	g/dL	2025-07-10 07:17:49.871827-04
86	22	22	7	GLUCOSA	125.1	mg/dL	2025-07-10 07:17:49.871827-04
87	22	22	7	COLESTEROL_TOTAL	236.2	mg/dL	2025-07-10 07:17:49.871827-04
88	22	22	7	TRIGLICERIDOS	106.3	mg/dL	2025-07-10 07:17:49.871827-04
89	23	23	8	HB	16	g/dL	2025-08-24 07:17:50.031909-04
90	23	23	8	GLUCOSA	111.4	mg/dL	2025-08-24 07:17:50.031909-04
91	23	23	8	COLESTEROL_TOTAL	236.7	mg/dL	2025-08-24 07:17:50.031909-04
92	23	23	8	TRIGLICERIDOS	192.5	mg/dL	2025-08-24 07:17:50.031909-04
93	24	24	8	HB	13	g/dL	2025-08-09 07:17:50.088339-04
94	24	24	8	GLUCOSA	123.7	mg/dL	2025-08-09 07:17:50.088339-04
95	24	24	8	COLESTEROL_TOTAL	238.5	mg/dL	2025-08-09 07:17:50.088339-04
96	24	24	8	TRIGLICERIDOS	159.2	mg/dL	2025-08-09 07:17:50.088339-04
97	25	25	8	HB	15.3	g/dL	2025-07-25 07:17:50.140266-04
98	25	25	8	GLUCOSA	78.8	mg/dL	2025-07-25 07:17:50.140266-04
99	25	25	8	COLESTEROL_TOTAL	198.5	mg/dL	2025-07-25 07:17:50.140266-04
100	25	25	8	TRIGLICERIDOS	194	mg/dL	2025-07-25 07:17:50.140266-04
101	26	26	8	HB	12.5	g/dL	2025-07-10 07:17:50.182842-04
102	26	26	8	GLUCOSA	122.5	mg/dL	2025-07-10 07:17:50.182842-04
103	26	26	8	COLESTEROL_TOTAL	197.9	mg/dL	2025-07-10 07:17:50.182842-04
104	26	26	8	TRIGLICERIDOS	199.5	mg/dL	2025-07-10 07:17:50.182842-04
107	32	\N	\N	Vitamina D	15	ng/mL	2024-06-01 05:00:00-04
108	32	\N	\N	Vitamina D	1	ng/mL	2024-06-01 05:00:00-04
109	31	\N	\N	Vitamina D	1	ng/mL	2024-06-01 05:00:00-04
110	2	2	\N	HB	12.4	g/dL	2024-05-19 20:00:00-04
111	31	\N	\N	Vitamina D	1	ng/mL	2024-06-01 05:00:00-04
231	50	42	19	HB	11.5	g/dL	2025-08-30 05:45:08.703636-04
232	50	42	19	GLUCOSA	102.6	mg/dL	2025-08-30 05:45:08.703636-04
233	50	42	19	COLESTEROL_TOTAL	236.8	mg/dL	2025-08-30 05:45:08.703636-04
234	50	42	19	TRIGLICERIDOS	127.7	mg/dL	2025-08-30 05:45:08.703636-04
235	50	42	19	Vitamina D	21.3	ng/mL	2025-08-30 05:45:08.703636-04
236	50	42	19	Albúmina	3.11	g/dL	2025-08-30 05:45:08.703636-04
237	50	42	19	Creatinina	1.28	mg/dL	2025-08-30 05:45:08.703636-04
238	51	43	19	HB	11.8	g/dL	2025-08-15 05:45:08.810307-04
239	51	43	19	GLUCOSA	117.7	mg/dL	2025-08-15 05:45:08.810307-04
240	51	43	19	COLESTEROL_TOTAL	163.9	mg/dL	2025-08-15 05:45:08.810307-04
241	51	43	19	TRIGLICERIDOS	127.6	mg/dL	2025-08-15 05:45:08.810307-04
242	51	43	19	Vitamina D	26.7	ng/mL	2025-08-15 05:45:08.810307-04
243	51	43	19	Albúmina	3.73	g/dL	2025-08-15 05:45:08.810307-04
244	51	43	19	Creatinina	0.71	mg/dL	2025-08-15 05:45:08.810307-04
245	52	44	20	HB	13.1	g/dL	2025-08-30 05:45:08.909469-04
246	52	44	20	GLUCOSA	149.4	mg/dL	2025-08-30 05:45:08.909469-04
247	52	44	20	COLESTEROL_TOTAL	246.5	mg/dL	2025-08-30 05:45:08.909469-04
248	52	44	20	TRIGLICERIDOS	189.9	mg/dL	2025-08-30 05:45:08.909469-04
249	52	44	20	Vitamina D	27.7	ng/mL	2025-08-30 05:45:08.909469-04
250	52	44	20	Albúmina	4.37	g/dL	2025-08-30 05:45:08.909469-04
251	52	44	20	Creatinina	0.86	mg/dL	2025-08-30 05:45:08.909469-04
252	53	45	20	HB	13.8	g/dL	2025-08-15 05:45:09.006427-04
253	53	45	20	GLUCOSA	75.7	mg/dL	2025-08-15 05:45:09.006427-04
254	53	45	20	COLESTEROL_TOTAL	154.6	mg/dL	2025-08-15 05:45:09.006427-04
255	53	45	20	TRIGLICERIDOS	152.4	mg/dL	2025-08-15 05:45:09.006427-04
256	53	45	20	Vitamina D	18.3	ng/mL	2025-08-15 05:45:09.006427-04
257	53	45	20	Albúmina	3.09	g/dL	2025-08-15 05:45:09.006427-04
258	53	45	20	Creatinina	1.67	mg/dL	2025-08-15 05:45:09.006427-04
259	54	46	21	HB	13.5	g/dL	2025-08-30 05:45:09.10414-04
260	54	46	21	GLUCOSA	117.6	mg/dL	2025-08-30 05:45:09.10414-04
261	54	46	21	COLESTEROL_TOTAL	173.7	mg/dL	2025-08-30 05:45:09.10414-04
262	54	46	21	TRIGLICERIDOS	129.1	mg/dL	2025-08-30 05:45:09.10414-04
263	54	46	21	Vitamina D	16.8	ng/mL	2025-08-30 05:45:09.10414-04
264	54	46	21	Albúmina	4.13	g/dL	2025-08-30 05:45:09.10414-04
265	54	46	21	Creatinina	1.71	mg/dL	2025-08-30 05:45:09.10414-04
266	55	47	21	HB	12.8	g/dL	2025-08-15 05:45:09.187588-04
267	55	47	21	GLUCOSA	140.1	mg/dL	2025-08-15 05:45:09.187588-04
268	55	47	21	COLESTEROL_TOTAL	198.4	mg/dL	2025-08-15 05:45:09.187588-04
269	55	47	21	TRIGLICERIDOS	113.3	mg/dL	2025-08-15 05:45:09.187588-04
270	55	47	21	Vitamina D	28.4	ng/mL	2025-08-15 05:45:09.187588-04
271	55	47	21	Albúmina	4.26	g/dL	2025-08-15 05:45:09.187588-04
272	55	47	21	Creatinina	1.26	mg/dL	2025-08-15 05:45:09.187588-04
273	56	48	22	HB	9.5	g/dL	2025-08-10 06:45:09.272637-04
274	56	48	22	GLUCOSA	165	mg/dL	2025-08-10 06:45:09.272637-04
275	56	48	22	COLESTEROL_TOTAL	240	mg/dL	2025-08-10 06:45:09.272637-04
276	56	48	22	TRIGLICERIDOS	195	mg/dL	2025-08-10 06:45:09.272637-04
277	56	48	22	Vitamina D	14	ng/mL	2025-08-10 06:45:09.272637-04
278	56	48	22	Albúmina	3.1	g/dL	2025-08-10 06:45:09.272637-04
279	56	48	22	Creatinina	1.6	mg/dL	2025-08-10 06:45:09.272637-04
280	57	49	23	HB	11.2	g/dL	2025-08-20 06:45:09.272637-04
281	57	49	23	GLUCOSA	140	mg/dL	2025-08-20 06:45:09.272637-04
282	57	49	23	COLESTEROL_TOTAL	205	mg/dL	2025-08-20 06:45:09.272637-04
283	57	49	23	TRIGLICERIDOS	160	mg/dL	2025-08-20 06:45:09.272637-04
284	57	49	23	Vitamina D	18.5	ng/mL	2025-08-20 06:45:09.272637-04
285	57	49	23	Albúmina	3.4	g/dL	2025-08-20 06:45:09.272637-04
286	57	49	23	Creatinina	1.3	mg/dL	2025-08-20 06:45:09.272637-04
287	58	50	24	HB	12.8	g/dL	2025-08-30 06:45:09.272637-04
288	58	50	24	GLUCOSA	102	mg/dL	2025-08-30 06:45:09.272637-04
289	58	50	24	COLESTEROL_TOTAL	180	mg/dL	2025-08-30 06:45:09.272637-04
290	58	50	24	TRIGLICERIDOS	120	mg/dL	2025-08-30 06:45:09.272637-04
291	58	50	24	Vitamina D	24	ng/mL	2025-08-30 06:45:09.272637-04
292	58	50	24	Albúmina	3.8	g/dL	2025-08-30 06:45:09.272637-04
293	58	50	24	Creatinina	0.9	mg/dL	2025-08-30 06:45:09.272637-04
294	58	51	25	TSH	0.36	μUI/mL	2025-09-29 02:48:58.877-03
295	58	52	26	Transferrina	246	mg/dL	2025-09-29 02:50:52.936-03
296	58	53	27	Transferrina	246	mg/dL	2025-09-29 21:46:45.255-03
\.


--
-- Data for Name: suspension; Type: TABLE DATA; Schema: public; Owner: sofia
--

COPY public.suspension (suspension_id, episodio_id, fecha_suspension, tipo, motivo) FROM stdin;
1	1	2025-08-25	CLINICA	Condición clínica
2	6	2025-08-10	CLINICA	Condición clínica
3	7	2025-08-25	ADMINISTRATIVA	Condición clínica
4	10	2025-07-11	CLINICA	Condición clínica
5	13	2025-07-26	CLINICA	Condición clínica
6	16	2025-08-10	ADMINISTRATIVA	Condición clínica
7	19	2025-08-25	ADMINISTRATIVA	Condición clínica
8	22	2025-07-11	CLINICA	Condición clínica
9	25	2025-07-26	ADMINISTRATIVA	Condición clínica
16	50	2025-08-31	ADMINISTRATIVA	Condición clínica
17	55	2025-08-16	ADMINISTRATIVA	Condición clínica
18	56	2025-08-11	CLINICA	Inestabilidad hemodinámica inicial
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: sofia
--

COPY public.users (id, rut, nombres, apellido_paterno, apellido_materno, correo, password_hash, telefono, sexo, fecha_nacimiento, fecha_creacion, email_verified, email_verify_token, email_verify_expires) FROM stdin;
1	200000001	Felipe	Funcionario	Perez	funcionario@demo.cl	$2b$10$dgae7/aOs4aTsZCs3QkHXOyKIC9HmDdMlGpgTO16WYJUyxPnYbJwy	\N	M	1985-02-10	2025-09-23 03:17:45.161284-03	t	\N	\N
2	200000002	Teresa	Tecnologa	Gomez	tecnologo@demo.cl	$2b$10$D9NIFnO7LM1/bKKMjb5SSuwQNZt7fCNmAjltRBp1jSHZ78ibhBqae	\N	F	1987-03-15	2025-09-23 03:17:45.161284-03	t	\N	\N
3	200000003	Iván	Investigador	Rios	investigador@demo.cl	$2b$10$ILFgVeqgcFOAXNhicC7rFugU6KRK9VSMRnGUGvMWN3vHgAZaX2Xfu	\N	M	1982-07-20	2025-09-23 03:17:45.161284-03	t	\N	\N
4	300000001	Sofía	Muñoz	Rojas	sofía.muñoz@paciente.test	$2b$10$Rk14OQCKw0X1nuw1hmlure7xDWXcniGtetmQEf2giTerZUYiX2ipS	\N	F	1975-01-01	2025-09-23 03:17:45.161284-03	t	\N	\N
5	300000002	Camilo	Soto	Pérez	camilo.soto@paciente.test	$2b$10$dKa1xekPksjU1Ya7xXMSS.waqYv6G8C1zBzmOC6ZR99Hm3qbS9OPq	\N	M	1975-02-04	2025-09-23 03:17:45.161284-03	t	\N	\N
6	300000003	Valentina	García	Lagos	valentina.garcía@paciente.test	$2b$10$1Sjw/bgmvotqMkoNldLWzevPi5kvTE3it05PwG6lNrty6t6lJgN2u	\N	F	1975-03-07	2025-09-23 03:17:45.161284-03	t	\N	\N
7	300000004	Matías	Paredes	Martínez	matías.paredes@paciente.test	$2b$10$4I3Ff/lhJk6YhOaJIG7ULuWdtPP7W6bEmP3QMo8LpQi7VoTvsawIC	\N	M	1975-04-10	2025-09-23 03:17:49.184285-03	t	\N	\N
8	300000005	Fernanda	Vega	Contreras	fernanda.vega@paciente.test	$2b$10$b4TthMY0IePc5fImcaSENuBdYObihxpJh.ZD8Rc4F/VABTTFLHzl.	\N	F	1975-05-13	2025-09-23 03:17:49.184285-03	t	\N	\N
9	111111111	Admin	Admin	Admin	Admin@admin.com	$2b$10$BcvNFXC5uXaChyq4OX9Rq.DSh.3z5CNxnRA3URvgo3BKxwezri/8S	12341234	M	2001-01-01	2025-09-23 03:30:05.049-03	f	\N	\N
10	207311537	SOFIA	lopez	OLIVARES	sofia@gmail.com	$2b$10$aVYAWHdRNf0uoorP5RU4IOtLU3EBfe/ux2agSaBt8OoATvIGCAk6K	945572264	F	2001-03-27	2025-09-25 07:50:08.997-03	f	\N	\N
11	206920416	Angel	Salgado	Mancilla	angel.salgado@alumnos.uv.cl	$2b$10$ZFCMwSCT5SE7/ydg6TVDkuZn0JTlS0bnwwk/UrZPi4nWfpzcWKahy	\N	M	2001-09-02	2025-09-26 00:14:06.556-03	t	\N	\N
12	204822484	Paul	Michea	Varas	paulmicheavaras@gmail.com	$2b$10$LYjzKldfv6CSAB0COiDLcu56nxE4ov/Gj5lst0.z0GRhOpGNmGI5O	\N	M	2000-09-15	2025-09-26 00:28:38.233-03	t	\N	\N
13	210006672	Angelo Ignacio	Estadilla	Hidalgo	aestadilla.ae@gmail.com	$2b$10$PcAFWd0VkL2rQZ5nWkbo5.ppjfgIN0PDGBchgnqIHOFG4rArt.0xG	966349791	M	2002-03-29	2025-09-26 01:26:42.718-03	f	\N	\N
14	198940828	Laura Stefania	Coronado	Domenichini	lauracoronado1998@gmail.com	$2b$10$WnoZCO0olWIjg8lx9pjjKu/ZyU.jvOS.HspB.UALZlaGuIYpDxrKK	974321494	F	1998-09-04	2025-09-26 01:56:07.753-03	f	\N	\N
15	134324414	SOFIA	sdxfsd	OLIVARES	correo@djf.com	$2b$10$YG46S5FaYGhci905Ja..w.Au00vHGeulflvwAa6nxES4kLbCI6vie	\N	F	2001-03-04	2025-09-26 02:49:32.143-03	t	\N	\N
18	310000001	Alicia	Curada	Demostracion	alicia.curada@paciente.test	$2b$10$HzI0qp.oFCkSnACKw6j.D.QRN2PvlueLoLXYDbKpYuyNTYZXVUqYK	\N	F	1940-05-10	2025-09-29 01:45:08.663087-03	t	\N	\N
19	310000002	Bruno	Controlado	Demostracion	bruno.controlado@paciente.test	$2b$10$fP5F/GSu1wym6x4BRsJG9OFlnRPwm0jUOTpaK0hctf3QN1z.nt44e	\N	M	1945-11-18	2025-09-29 01:45:08.663087-03	t	\N	\N
20	310000003	Carla	Ligera	Demostracion	carla.ligera@paciente.test	$2b$10$G0k5W5jXMEjdeCBnzvBBZOUpmZM6WkGh.MczLdSGvt/zyC.nq/H66	\N	F	1955-04-02	2025-09-29 01:45:08.663087-03	t	\N	\N
\.


--
-- Name: alerta_alerta_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sofia
--

SELECT pg_catalog.setval('public.alerta_alerta_id_seq', 75, true);


--
-- Name: antropometria_antropometria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sofia
--

SELECT pg_catalog.setval('public.antropometria_antropometria_id_seq', 52, true);


--
-- Name: cirugia_cirugia_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sofia
--

SELECT pg_catalog.setval('public.cirugia_cirugia_id_seq', 50, true);


--
-- Name: complicacion_complicacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sofia
--

SELECT pg_catalog.setval('public.complicacion_complicacion_id_seq', 50, true);


--
-- Name: control_clinico_control_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sofia
--

SELECT pg_catalog.setval('public.control_clinico_control_id_seq', 52, true);


--
-- Name: episodio_episodio_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sofia
--

SELECT pg_catalog.setval('public.episodio_episodio_id_seq', 58, true);


--
-- Name: episodio_indicador_episodio_indicador_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sofia
--

SELECT pg_catalog.setval('public.episodio_indicador_episodio_indicador_id_seq', 468, true);


--
-- Name: evolucion_evolucion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sofia
--

SELECT pg_catalog.setval('public.evolucion_evolucion_id_seq', 50, true);


--
-- Name: examen_examen_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sofia
--

SELECT pg_catalog.setval('public.examen_examen_id_seq', 27, true);


--
-- Name: generic_report_report_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sofia
--

SELECT pg_catalog.setval('public.generic_report_report_id_seq', 1, false);


--
-- Name: indicador_riesgo_indicador_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sofia
--

SELECT pg_catalog.setval('public.indicador_riesgo_indicador_id_seq', 48, true);


--
-- Name: minuta_minuta_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sofia
--

SELECT pg_catalog.setval('public.minuta_minuta_id_seq', 48, true);


--
-- Name: muestra_muestra_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sofia
--

SELECT pg_catalog.setval('public.muestra_muestra_id_seq', 53, true);


--
-- Name: professional_profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sofia
--

SELECT pg_catalog.setval('public.professional_profiles_id_seq', 6, true);


--
-- Name: registro_registro_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sofia
--

SELECT pg_catalog.setval('public.registro_registro_id_seq', 50, true);


--
-- Name: resultado_resultado_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sofia
--

SELECT pg_catalog.setval('public.resultado_resultado_id_seq', 296, true);


--
-- Name: suspension_suspension_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sofia
--

SELECT pg_catalog.setval('public.suspension_suspension_id_seq', 18, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sofia
--

SELECT pg_catalog.setval('public.users_id_seq', 20, true);


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

