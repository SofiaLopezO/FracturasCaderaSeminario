#!/usr/bin/env node
/**
 * Importa SUSPENSION desde CSV/XLSX a PostgreSQL.
 * - UPSERT no aplica (PK auto-incremental); inserta filas tal cual.
 * - Soporta UTF-8/UTF-8-SIG/Windows-1252 (comillas y tildes OK).
 * - Admite delimitador "," o ";" automáticamente.
 * - Convierte fecha_suspension a DATEONLY (YYYY-MM-DD).
 * - Valida tipo ∈ {"CLINICA", "ADMINISTRATIVA"}.
 * - SAVEPOINT por fila (continúa aunque alguna falle).
 *
 * Uso:
 *   node scripts/import_suspension.js ./data/SUSPENSION.csv --preview
 *   node scripts/import_suspension.js ./data/SUSPENSION.csv
 *   # También acepta .xlsx
 */

const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
const { parse } = require("csv-parse/sync");
const xlsx = require("xlsx");
const chardet = require("chardet");
const iconv = require("iconv-lite");

// === ENV ===
require("dotenv").config({ path: path.resolve(process.cwd(), ".env") });
const {
  PGHOST = "localhost",
  PGPORT = "5432",
  PGDATABASE = "fracturas",
  PGUSER = "sofia",
  PGPASSWORD = "Clave1234",
  PGPSSL = "disable",
} = process.env;

// === CLI ===
const args = process.argv.slice(2).filter(a => !a.startsWith("-"));
const flags = new Set(process.argv.slice(2).filter(a => a.startsWith("-")));
if (args.length < 1) {
  console.error("Uso: node scripts/import_suspension.js <archivo.csv|xlsx> [--preview]");
  process.exit(1);
}
const INPUT_PATH = path.resolve(args[0]);
const PREVIEW = flags.has("--preview");

// === PG POOL ===
const pool = new Pool({
  host: PGHOST,
  port: Number(PGPORT),
  database: PGDATABASE,
  user: PGUSER,
  password: PGPASSWORD,
  ssl: /require|true/i.test(PGPSSL) ? { rejectUnauthorized: false } : false,
});

// === Utiles ===
const normHeader = (h) =>
  String(h || "")
    .replace(/^\uFEFF/, "")     // BOM
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

const toDateOnly = (v) => {
  if (v == null) return null;
  const s = String(v).trim();
  if (!s) return null;
  // Acepta "YYYY-MM-DD" o "YYYY-MM-DD HH:mm:ss"
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (m) return m[1];
  // Excel serial date (número)
  if (!Number.isNaN(Number(s))) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const d = new Date(excelEpoch.getTime() + (Number(s) * 86400000));
    return d.toISOString().slice(0, 10);
  }
  // Intento de parseo genérico
  const d2 = new Date(s);
  if (!isNaN(d2)) return d2.toISOString().slice(0, 10);
  return null;
};

const toTipo = (v) => {
  const t = String(v || "").trim().toUpperCase();
  if (t === "CLINICA" || t === "ADMINISTRATIVA") return t;
  return null;
};

// === Lector CSV/XLSX robusto ===
function readTable(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".xlsx") {
    const wb = xlsx.readFile(filePath, { cellDates: true });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(ws, { defval: "" });
    return rows;
  }

  // CSV
  const buf = fs.readFileSync(filePath);
  const enc = chardet.detect(buf) || "UTF-8";
  const text = iconv.decode(buf, enc);
  // detecta delimitador simple por conteo
  const commaCount = (text.split("\n")[0] || "").split(",").length;
  const semiCount = (text.split("\n")[0] || "").split(";").length;
  const delimiter = semiCount > commaCount ? ";" : ",";

  const records = parse(text, {
    columns: (hdr) => hdr.map(normHeader),
    skip_empty_lines: true,
    relax_quotes: true,
    delimiter,
    bom: true,
    trim: true,
  });
  return records;
}

// === Valida y mapea filas ===
function transformRows(rawRows) {
  // normaliza headers esperados
  const need = ["episodio_id", "fecha_suspension", "tipo", "motivo"];
  const rows = rawRows.map((r, idx) => {
    const row = {};
    for (const k of Object.keys(r)) row[normHeader(k)] = r[k];

    // episodio_id
    const episodio_id = Number(String(row.episodio_id || "").trim());
    // fecha -> DATEONLY
    const fecha_suspension = toDateOnly(row.fecha_suspension);
    // tipo
    const tipo = toTipo(row.tipo);
    // motivo: permitir vacío pero no null
    const motivo = (row.motivo ?? "").toString();

    return { __line: idx + 2, episodio_id, fecha_suspension, tipo, motivo, __raw: r };
  });

  // validación requerida
  const problems = [];
  rows.forEach((r) => {
    if (!r.episodio_id) problems.push({ line: r.__line, msg: "episodio_id inválido/ausente" });
    if (!r.fecha_suspension) problems.push({ line: r.__line, msg: "fecha_suspension inválida/ausente" });
    if (!r.tipo) problems.push({ line: r.__line, msg: 'tipo debe ser "CLINICA" o "ADMINISTRATIVA"' });
  });

  if (problems.length && !PREVIEW) {
    console.error("❌ Errores de validación:");
    problems.slice(0, 20).forEach(p => console.error(`  Línea ${p.line}: ${p.msg}`));
    if (problems.length > 20) console.error(`  (+${problems.length - 20} más)`);
    process.exit(1);
  }
  return { rows, problems };
}

// === Inserción ===
async function insertRows(client, rows) {
  const sql = `
    INSERT INTO public.suspension (episodio_id, fecha_suspension, tipo, motivo)
    VALUES ($1, $2, $3, $4)
  `;

  let ok = 0, fail = 0;
  for (const r of rows) {
    await client.query("SAVEPOINT sp_row");
    try {
      await client.query(sql, [
        r.episodio_id,
        r.fecha_suspension, // DATEONLY
        r.tipo,
        r.motivo,
      ]);
      ok++;
    } catch (e) {
      fail++;
      await client.query("ROLLBACK TO SAVEPOINT sp_row");
      console.error(`⚠️  Fila línea ${r.__line} falló: ${e.message}`);
    }
  }
  return { ok, fail };
}

// === Main ===
(async () => {
  const raw = readTable(INPUT_PATH);
  const { rows, problems } = transformRows(raw);

  console.log(`📄 Archivo: ${INPUT_PATH}`);
  console.log(`🧾 Filas leídas: ${rows.length}`);
  if (PREVIEW) {
    console.log("👀 PREVIEW (primeras 5 filas ya transformadas):");
    console.table(rows.slice(0, 5).map(({__line, episodio_id, fecha_suspension, tipo, motivo}) =>
      ({__line, episodio_id, fecha_suspension, tipo, motivo: motivo.slice(0, 60)})));
    if (problems.length) {
      console.log("⚠️ Problemas de validación (muestra):");
      problems.slice(0, 10).forEach(p => console.log(`  Línea ${p.line}: ${p.msg}`));
    }
    process.exit(0);
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { ok, fail } = await insertRows(client, rows);
    await client.query("COMMIT");
    console.log(`✅ Inserciones OK: ${ok} | ❌ Fallos: ${fail}`);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("💥 Error transacción:", err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
})().catch(e => {
  console.error("💥 Error no controlado:", e);
  process.exit(1);
});
