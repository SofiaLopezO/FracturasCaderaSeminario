#!/usr/bin/env node
/**
 * Importa CIRUGIA.csv/XLSX a la tabla `cirugia` (id autoincremental).
 * - Soporta CSV (coma o punto y coma) y XLSX.
 * - Detección robusta de encoding (UTF-8/Win-1252/ISO-8859-1) y normaliza tildes (NFC).
 * - Normaliza encabezados: trim, minúsculas, espacios→'_'.
 * - Mapeos:
 *     lado: IZQUIERDA→IZQUIERDO, DERECHA→DERECHO, BILATERAL→BILATERAL
 *     tecnica: GAMMA/DHS/ATC/APC/BIP/OTRA_OTS (acepta "OTRA OTS", "otra_ots", "g-corto/g-largo"→GAMMA)
 *     fecha: "YYYY-MM-DD" (si viene "YYYY-MM-DD hh:mm:ss" corta la fecha)
 *     reoperacion: 1/0/si/no/true/false/"" → boolean (vacío = false)
 * - Inserta por filas con SAVEPOINT (saltando filas malas y registrando motivo).
 *
 * Uso:
 *   node scripts/import_cirugia.js ./CIRUGIA.csv
 *   node scripts/import_cirugia.js ./CIRUGIA.xlsx public.cirugia --preview
 */

const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
const { parse } = require("csv-parse/sync");
const xlsx = require("xlsx");
const chardet = require("chardet");
const iconv = require("iconv-lite");
require("dotenv").config({ path: path.resolve(process.cwd(), ".env") });

// --- Config PG ---
const {
  PGHOST = "localhost",
  PGPORT = "5432",
  PGDATABASE = "fracturas",
  PGUSER = "postgres",
  PGPASSWORD = "postgres",
} = process.env;

// --- CLI args ---
const INPUT_PATH = process.argv[2];
const TABLE = process.argv[3] || "public.cirugia";
const PREVIEW = process.argv.includes("--preview");

if (!INPUT_PATH) {
  console.error("❌ Falta ruta de entrada. Ej: node scripts/import_cirugia.js ./CIRUGIA.csv");
  process.exit(1);
}

// --- Utilidades ---
const TECH_ALLOWED = new Set(["GAMMA", "DHS", "ATC", "APC", "BIP", "OTRA_OTS"]);

function normHeader(h) {
  return String(h || "")
    .replace(/^\uFEFF/, "")        // BOM
    .trim()
    .toLowerCase()
    .normalize("NFKC")
    .replace(/\s+/g, "_")
    .replace(/[^\w]/g, "_")
    .replace(/_+/g, "_");
}

function pick(obj, ...keys) {
  const out = {};
  for (const k of keys) out[k] = obj[k];
  return out;
}

function parseBool(v) {
  if (v === undefined || v === null) return false;
  const s = String(v).trim().toLowerCase();
  if (s === "" ) return false;
  if (["1","si","sí","true","t","y","yes"].includes(s)) return true;
  if (["0","no","false","f","n"].includes(s)) return false;
  return false;
}

function normDateOnly(v) {
  if (v == null) return null;
  const s = String(v).trim();
  if (!s) return null;
  // si viene "YYYY-MM-DD hh:mm:ss"
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (m) return m[1];
  // si viene fecha excel (número)
  if (!isNaN(Number(s))) {
    // XLSX serial date
    const epoch = new Date(Date.UTC(1899, 11, 30));
    const ms = Number(s) * 24 * 3600 * 1000;
    const d = new Date(epoch.getTime() + ms);
    return d.toISOString().slice(0,10);
  }
  // intentar parseo general
  const d = new Date(s);
  if (!isNaN(d)) return d.toISOString().slice(0,10);
  return null;
}

function normTime(v) {
  if (v == null) return null;
  let s = String(v).trim();
  if (!s) return null;
  // aceptar HH:mm, HH:mm:ss
  const m = s.match(/^(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (m) {
    const hh = m[1].padStart(2,"0");
    const mm = m[2].padStart(2,"0");
    const ss = m[3] ? m[3].padStart(2,"0") : null;
    return ss ? `${hh}:${mm}:${ss}` : `${hh}:${mm}`;
  }
  // si viene "HH:mm:ss.sss"
  const m2 = s.match(/^(\d{2}:\d{2}:\d{2})/);
  if (m2) return m2[1];
  return s;
}

function normLado(v) {
  if (v == null) return null;
  const s = String(v).trim().toUpperCase();
  if (s.startsWith("IZQ")) return "IZQUIERDO";
  if (s.startsWith("DER")) return "DERECHO";
  if (s.startsWith("BIL")) return "BILATERAL";
  // variantes exactas
  if (s === "IZQUIERDA") return "IZQUIERDO";
  if (s === "DERECHA") return "DERECHO";
  if (s === "BILATERAL") return "BILATERAL";
  return null;
}

function normTecnica(v) {
  if (v == null) return null;
  let s = String(v).trim().toUpperCase().replace(/\s+/g, "_");
  // casos comunes
  if (/^G[-_ ]?(CORTO|LARGO)$/i.test(String(v))) return "GAMMA";
  if (s === "OTRA_OTS" || s === "OTRAOTS" || s === "OTRA_OTs".toUpperCase()) return "OTRA_OTS";
  // limpiar acentos/guiones
  s = s.replace(/[^A-Z_]/g, "");
  if (s === "OTRAOTS" || s === "OTRA") s = "OTRA_OTS";
  if (s === "G") s = "GAMMA";
  if (!TECH_ALLOWED.has(s)) return null;
  return s;
}

function detectDelimiter(sampleText) {
  // contar comas vs punto y coma en primeras líneas
  const first = sampleText.split(/\r?\n/).slice(0, 5).join("\n");
  const commas = (first.match(/,/g) || []).length;
  const semis  = (first.match(/;/g) || []).length;
  return semis > commas ? ";" : ",";
}

function readCSVorXLSX(inputPath) {
  const ext = path.extname(inputPath).toLowerCase();
  if (ext === ".xlsx" || ext === ".xls") {
    const wb = xlsx.readFile(inputPath);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const raw = xlsx.utils.sheet_to_json(ws, { defval: "" });
    const rows = raw.map(r => {
      const o = {};
      for (const [k,v] of Object.entries(r)) o[normHeader(k)] = (""+v).normalize("NFC");
      return o;
    });
    return rows;
  }
  // CSV
  const buf = fs.readFileSync(inputPath);
  const enc = chardet.detect(buf) || "UTF-8";
  const txt = iconv.decode(buf, enc).normalize("NFC");
  const delimiter = detectDelimiter(txt);
  const records = parse(txt, {
    columns: (h) => h.map(normHeader),
    skip_empty_lines: true,
    relax_column_count: true,
    delimiter,
    trim: true,
  });
  return records;
}

// --- Carga y normalización ---
const rawRows = readCSVorXLSX(INPUT_PATH);
if (!rawRows.length) {
  console.error("⚠️  No se leyeron filas del archivo.");
  process.exit(1);
}

const normRows = [];
const errors = [];
const warnings = [];

for (let i = 0; i < rawRows.length; i++) {
  const r0 = rawRows[i] || {};
  // admitir alias simples en encabezados
  const r = {
    episodio_id: r0.episodio_id ?? r0.episodio ?? r0["id_episodio"],
    fecha: r0.fecha,
    hora_inicio: r0.hora_inicio ?? r0.hora_ini ?? r0.inicio,
    hora_fin: r0.hora_fin ?? r0.fin,
    tecnica: r0.tecnica ?? r0["técnica"],
    lado: r0.lado,
    reoperacion: r0.reoperacion ?? r0.reop,
    complicacion_intraop: r0.complicacion_intraop ?? r0.complicacion ?? r0.complicación,
    operador_id: r0.operador_id ?? r0.operador,
  };

  try {
    const episodio_id = r.episodio_id != null && String(r.episodio_id).trim() !== "" ? Number(r.episodio_id) : null;
    if (!episodio_id || Number.isNaN(episodio_id)) throw new Error("episodio_id inválido");

    const fecha = normDateOnly(r.fecha);
    if (!fecha) throw new Error("fecha inválida");

    const hora_inicio = normTime(r.hora_inicio);
    const hora_fin = normTime(r.hora_fin);

    let tecnica = normTecnica(r.tecnica);
    if (!tecnica && r.tecnica && String(r.tecnica).trim() !== "") {
      warnings.push(`Fila ${i+1}: técnica '${r.tecnica}' no válida para ENUM → se deja NULL`);
    }

    const lado = normLado(r.lado);
    if (!lado && r.lado && String(r.lado).trim() !== "") {
      warnings.push(`Fila ${i+1}: lado '${r.lado}' no reconocido → se deja NULL`);
    }

    const reoperacion = parseBool(r.reoperacion);
    const operador_id = r.operador_id && String(r.operador_id).trim() !== "" ? Number(r.operador_id) : null;
    const complicacion_intraop = r.complicacion_intraop ? String(r.complicacion_intraop).trim() : null;

    normRows.push({
      episodio_id, fecha, hora_inicio, hora_fin, tecnica, lado,
      reoperacion, complicacion_intraop, operador_id
    });
  } catch (e) {
    errors.push(`Fila ${i+1}: ${e.message}`);
  }
}

if (PREVIEW) {
  console.log("🔎 PREVIEW (primeras 5 filas normalizadas):");
  console.table(normRows.slice(0, 5));
  if (warnings.length) console.log("\n⚠️  Warnings:\n - " + warnings.join("\n - "));
  if (errors.length) console.log("\n❌ Filas descartadas:\n - " + errors.join("\n - "));
  process.exit(0);
}

// --- Inserción PG ---
(async () => {
  const pool = new Pool({ host: PGHOST, port: PGPORT, database: PGDATABASE, user: PGUSER, password: PGPASSWORD });
  const client = await pool.connect();
  let ok = 0, fail = 0;

  try {
    await client.query("BEGIN");
    for (let i = 0; i < normRows.length; i++) {
      const r = normRows[i];
      await client.query(`SAVEPOINT sp_${i}`);
      try {
        const sql = `
          INSERT INTO ${TABLE} 
          (episodio_id, fecha, hora_inicio, hora_fin, tecnica, lado, reoperacion, complicacion_intraop, operador_id)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
          RETURNING cirugia_id
        `;
        const params = [
          r.episodio_id,
          r.fecha,
          r.hora_inicio,
          r.hora_fin,
          r.tecnica,
          r.lado,
          r.reoperacion,
          r.complicacion_intraop,
          r.operador_id
        ];
        const res = await client.query(sql, params);
        ok++;
        // console.log(`+ Fila ${i+1} → cirugia_id=${res.rows[0].cirugia_id}`);
      } catch (e) {
        fail++;
        await client.query(`ROLLBACK TO SAVEPOINT sp_${i}`);
        console.error(`❌ Fila ${i+1} falló: ${e.message}`);
      }
    }
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("⛔ Error general, se hizo ROLLBACK:", e.message);
  } finally {
    client.release();
    await pool.end();
  }

  if (warnings.length) {
    console.log("\n⚠️  Warnings:\n - " + warnings.join("\n - "));
  }
  if (errors.length) {
    console.log("\n❌ Filas descartadas por validación previa:\n - " + errors.join("\n - "));
  }
  console.log(`\n✅ Importación terminada. OK=${ok}, FALLIDAS=${fail}, TOTAL_ENTRADA=${normRows.length}`);
})();
