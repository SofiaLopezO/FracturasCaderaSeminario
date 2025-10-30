#!/usr/bin/env node
/**
 * Importa usuarios desde CSV o XLSX a PostgreSQL (UPSERT por rut).
 * - CSV/XLSX con detección robusta de encoding (UTF-8 / Windows-1252 / ISO-8859-1)
 * - Normaliza encabezados
 * - UPSERT por 'rut'
 * - SAVEPOINT por fila
 * - Rellenos seguros:
 *     - apellido_materno vacío -> ""
 *     - correo vacío -> "<rut_sin_guion>@users.fracturas.local"
 * - Normalización Unicode (NFC) para tildes y eñes correctas
 */
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
const { parse } = require("csv-parse/sync");
const xlsx = require("xlsx");
const iconv = require("iconv-lite");
const chardet = require("chardet");
require("dotenv").config({ path: path.resolve(process.cwd(), ".env") });

const {
  PGHOST = "localhost",
  PGPORT = "5432",
  PGDATABASE = "fracturas",
  PGUSER = "sofia",
  PGPASSWORD = "Clave1234",
} = process.env;

const INPUT_PATH = process.argv[2] || path.resolve(process.cwd(), "scripts/USUARIOS.csv");
const TABLE = process.argv[3] || "public.users";
const PREVIEW = process.argv.includes("--preview");

// columnas lógicas esperadas desde el archivo
const COLS_CANON = [
  "rut","nombres","apellido_paterno","apellido_materno","sexo",
  "fecha_nacimiento","telefono","correo",
  "password_hash","email_verified","email_verify_token","email_verify_expires","fecha_creacion",
];

// ---------- helpers ----------
const deBOM = (s) => (s && s.charCodeAt(0) === 65279 ? s.slice(1) : s);

function normalizeText(v) {
  if (v === undefined || v === null) return v;
  let s = String(v);

  // quita BOM si viene
  s = deBOM(s);

  // reemplazos suaves de tipografía “smart quotes”
  s = s
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E]/g, '"')
    .replace(/\u00A0/g, " "); // NBSP -> espacio

  // normaliza unicode a forma canónica (tildes/ñ)
  try { s = s.normalize('NFC'); } catch (_) {}

  return s.trim();
}

const normHeader = (h) =>
  String(h || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^\w]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");

function buildHeaderMap(headers) {
  const map = {};
  for (const h of headers) {
    const n = normHeader(h);
    if (n && !(n in map)) map[n] = h;
  }
  return map;
}
function mapRow(raw, headerMap) {
  const out = {};
  for (const [kNorm, orig] of Object.entries(headerMap)) out[kNorm] = raw[orig];
  return out;
}

function asNull(v) {
  if (v === undefined || v === null) return null;
  const s = normalizeText(v);
  return s === "" ? null : s;
}
function asBool(v) {
  if (v === undefined || v === null) return null;
  const s = normalizeText(v).toLowerCase();
  if (s === "") return null;
  return ["1","t","true","yes","y","si","sí"].includes(s);
}
function asDate(v) {
  const s = normalizeText(v) || "";
  if (!s) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;           // yyyy-mm-dd
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);       // dd/mm/yyyy
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return s; // deja que Postgres intente parsear
}
function rutToEmail(rut) {
  const base = String(rut || "").replace(/[^\dKk]/g, "").toLowerCase();
  if (!base) return null;
  return `${base}@users.fracturas.local`;
}
function normalizeBizRow(r) {
  // Normalizamos lo que viene del archivo y aplicamos rellenos NOT NULL
  const rut = asNull(r.rut ?? r.r_u_t);
  const correoRaw = asNull(r.correo ?? r.email);
  const correo = correoRaw || rutToEmail(rut); // relleno si viene vacío
  return {
    rut,
    nombres: asNull(r.nombres),
    apellido_paterno: asNull(r.apellido_paterno) ?? "",
    apellido_materno: asNull(r.apellido_materno) ?? "",
    sexo: asNull(r.sexo),
    fecha_nacimiento: asDate(r.fecha_nacimiento),
    telefono: asNull(r.telefono),
    correo: correo ? correo.toLowerCase() : null,
    password_hash: asNull(r.password_hash ?? r.hash ?? r.password),
    email_verified: asBool(r.email_verified),
    email_verify_token: asNull(r.email_verify_token),
    email_verify_expires: asNull(r.email_verify_expires),
    fecha_creacion: asDate(r.fecha_creacion),
  };
}

// ----------- Decodificación robusta de CSV -----------
function decodeBest(buf) {
  // probamos varios encodings y elegimos el que tenga menos � y menos patrones de mojibake comunes
  const candidates = ["utf8", "win1252", "latin1"];
  let best = { txt: "", enc: "utf8", score: -Infinity };

  for (const enc of candidates) {
    const txt = iconv.decode(buf, enc);
    const repl = (txt.match(/\uFFFD/g) || []).length; // caracteres de reemplazo
    const mojis = (txt.match(/Ã.|Â.|â..|ï..|�/g) || []).length; // patrones típicos de mojibake
    const score = -repl - mojis; // menos es peor
    if (score > best.score) best = { txt, enc, score };
  }
  return best; // {txt, enc}
}

function detectDelimiter(firstLine) {
  const count = (ch) => (firstLine.match(new RegExp(`\\${ch}`, "g")) || []).length;
  return count(";") > count(",") ? ";" : ",";
}

function readCSV(filePath) {
  const buf = fs.readFileSync(filePath);

  // Usa chardet como hint, pero decide con decodeBest
  let encHint = "utf8";
  try {
    const det = chardet.detect(buf);
    if (det && det.encoding) encHint = det.encoding.toLowerCase();
  } catch (_) {}

  const best = decodeBest(buf); // {txt, enc}
  const txt = best.txt;

  const firstLine = txt.split(/\r?\n/)[0] || "";
  const delimiter = detectDelimiter(firstLine);

  const rows = parse(txt, {
    columns: (headers) => headers.map((h) => deBOM(h)),
    bom: true,
    skip_empty_lines: true,
    relax_column_count: true,
    trim: true,
    delimiter,
  });

  const headers = Object.keys(rows[0] || {});
  const headerMap = buildHeaderMap(headers);
  const normalizedRows = rows.map((row) => {
    // normaliza TODOS los campos del CSV (tildes/ñ)
    const nr = {};
    for (const [k, v] of Object.entries(row)) nr[k] = normalizeText(v);
    return mapRow(nr, headerMap);
  });

  return normalizedRows.map(normalizeBizRow);
}

function readXLSX(filePath) {
  const wb = xlsx.readFile(filePath, { cellDates: false });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });

  // normaliza campos antes de mapear
  const rowsNorm = rows.map((row) => {
    const nr = {};
    for (const [k, v] of Object.entries(row)) nr[k] = normalizeText(v);
    return nr;
  });

  const headers = Object.keys(rowsNorm[0] || {});
  const headerMap = buildHeaderMap(headers);
  const normalizedRows = rowsNorm.map((row) => mapRow(row, headerMap));
  return normalizedRows.map(normalizeBizRow);
}

function readRecords(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`No existe el archivo: ${filePath}`);
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".csv")  return readCSV(filePath);
  if (ext === ".xlsx") return readXLSX(filePath);
  throw new Error(`Extensión no soportada: ${ext} (usa .csv o .xlsx)`);
}

// columnas reales de la tabla destino
async function getTableColumns(client, tableFQN) {
  const [schema, table] = tableFQN.includes('.') ? tableFQN.split('.') : ['public', tableFQN];
  const q = `
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = $1 AND table_name = $2
    ORDER BY ordinal_position
  `;
  const { rows } = await client.query(q, [schema, table]);
  return rows.map(r => r.column_name.toLowerCase());
}

// ---------- main ----------
(async () => {
  console.log(`Archivo de entrada: ${INPUT_PATH}`);
  console.log(`Tabla destino:      ${TABLE}`);

  const pool = new Pool({
    host: PGHOST, port: Number(PGPORT), database: PGDATABASE,
    user: PGUSER, password: PGPASSWORD, ssl: false,
  });
  const client = await pool.connect();

  try {
    const records = readRecords(INPUT_PATH);
    console.log(`Filas leídas: ${records.length}`);

    if (PREVIEW) {
      console.log("Preview (primeras 3 filas mapeadas):");
      console.log(records.slice(0, 3));
      process.exit(0);
    }

    // Fuerza cliente a UTF-8 (debe coincidir con SERVER_ENCODING=UTF8)
    await client.query("SET client_encoding TO 'UTF8'");

    // columnas de la tabla → usamos solo intersección
    const tableCols = (await getTableColumns(client, TABLE)).map(c => c.toLowerCase());
    const usedCols = COLS_CANON.filter(c => tableCols.includes(c.toLowerCase()));
    if (!usedCols.includes("rut")) {
      throw new Error(`La tabla ${TABLE} no tiene columna 'rut' (requerida para upsert).`);
    }

    // Crea tabla mínima si no existe (compatibilidad)
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${TABLE} (
        id BIGINT GENERATED BY DEFAULT AS IDENTITY,
        rut TEXT UNIQUE,
        nombres TEXT,
        apellido_paterno TEXT,
        apellido_materno TEXT,
        sexo CHAR(1),
        fecha_nacimiento DATE,
        telefono TEXT,
        correo TEXT UNIQUE,
        password_hash TEXT,
        email_verified BOOLEAN DEFAULT FALSE,
        email_verify_token TEXT,
        email_verify_expires TIMESTAMP NULL,
        fecha_creacion DATE DEFAULT CURRENT_DATE,
        PRIMARY KEY (id)
      );
    `);

    // UPSERT por rut
    const placeholders = usedCols.map((_, i) => `$${i + 1}`).join(", ");
    const updates = usedCols.filter(c => c !== "rut").map(c => `${c} = EXCLUDED.${c}`).join(", ");
    const sql = `
      INSERT INTO ${TABLE} (${usedCols.join(", ")})
      VALUES (${placeholders})
      ON CONFLICT (rut) DO UPDATE SET ${updates};
    `;

    let ok = 0, bad = 0;
    await client.query("BEGIN");
    for (const row of records) {
      await client.query("SAVEPOINT sp");
      try {
        const params = usedCols.map(c => row[c] ?? null);
        await client.query(sql, params);
        await client.query("RELEASE SAVEPOINT sp");
        ok++;
      } catch (e) {
        bad++;
        console.error("Fila con error:", row.rut, "-", e.message);
        await client.query("ROLLBACK TO SAVEPOINT sp");
      }
    }
    await client.query("COMMIT");
    console.log(`Importación terminada. OK: ${ok}, Errores: ${bad}`);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Fallo general:", err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
})();
