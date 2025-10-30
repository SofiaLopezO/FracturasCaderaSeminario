#!/usr/bin/env node
/**
 * Importa PACIENTES.csv/XLSX a la tabla `pacientes` con UPSERT por user/user_id.
 * Columnas esperadas (cualquier orden):
 *   user | user_id , tipo_sangre , altura , edad_anios , edad_meses
 */
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
const { parse } = require("csv-parse/sync");
const xlsx = require("xlsx");
const chardet = require("chardet");
const iconv = require("iconv-lite");
require("dotenv").config({ path: path.resolve(process.cwd(), ".env") });

const {
  PGHOST = "localhost",
  PGPORT = "5432",
  PGDATABASE = "fracturas",
  PGUSER = "sofia",
  PGPASSWORD = "Clave1234",
} = process.env;

const INPUT_PATH = process.argv[2] || path.resolve(process.cwd(), "PACIENTES.csv");
const TABLE = "public.pacientes";
const PREVIEW = process.argv.includes("--preview");

const deBOM = (s) => (s && s.charCodeAt(0) === 65279 ? s.slice(1) : s);
const norm = (c) =>
  String(c || "")
    .trim()
    .toLowerCase()
    .replace(/[áàä]/g, "a")
    .replace(/[éèë]/g, "e")
    .replace(/[íìï]/g, "i")
    .replace(/[óòö]/g, "o")
    .replace(/[úùü]/g, "u")
    .replace(/ñ/g, "n")
    .replace(/\s+/g, "_")
    .replace(/[^\w]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");

function detectDelimiter(firstLine) {
  const count = (ch) => (firstLine.match(new RegExp(`\\${ch}`, "g")) || []).length;
  return count(";") > count(",") ? ";" : ",";
}
function decodeBest(buf) {
  const cands = ["utf8", "win1252", "latin1"];
  let best = { txt: "", score: -Infinity, enc: "utf8" };
  for (const enc of cands) {
    const txt = iconv.decode(buf, enc);
    const repl = (txt.match(/\uFFFD/g) || []).length;
    const mojis = (txt.match(/Ã.|Â.|ï../g) || []).length;
    const score = -repl - mojis;
    if (score > best.score) best = { txt, score, enc };
  }
  return best.txt;
}

function readCSV(filePath) {
  const buf = fs.readFileSync(filePath);
  let txt = decodeBest(buf);
  const first = txt.split(/\r?\n/)[0] || "";
  const delimiter = detectDelimiter(first);
  const rows = parse(txt, {
    columns: (headers) => headers.map((h) => deBOM(h)),
    bom: true,
    skip_empty_lines: true,
    relax_column_count: true,
    trim: true,
    delimiter,
  });
  return rows;
}
function readXLSX(filePath) {
  const wb = xlsx.readFile(filePath, { cellDates: false });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  return xlsx.utils.sheet_to_json(sheet, { defval: "" });
}
function readRecords(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".csv") return readCSV(filePath);
  if (ext === ".xlsx") return readXLSX(filePath);
  throw new Error(`Extensión no soportada: ${ext} (usa .csv o .xlsx)`);
}

function mapAndNormalize(raw) {
  const out = {};
  for (const [k, v] of Object.entries(raw)) out[norm(k)] = typeof v === "string" ? v.trim() : v;

  // alias id
  const id = out["user_id"] ?? out["user"];
  return {
    _id: id, // se resolverá a user o user_id según tabla
    tipo_sangre: out["tipo_sangre"] ?? "",
    altura: out["altura"] === "" ? null : Number(out["altura"]),
    edad_anios: out["edad_anios"] === "" ? null : Number(out["edad_anios"]),
    edad_meses: out["edad_meses"] === "" ? 0 : Number(out["edad_meses"]),
  };
}

async function getColumns(client, fqn) {
  const [schema, table] = fqn.includes(".") ? fqn.split(".") : ["public", fqn];
  const q = `
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = $1 AND table_name = $2
  `;
  const { rows } = await client.query(q, [schema, table]);
  return rows.map((r) => r.column_name.toLowerCase());
}

(async () => {
  console.log(`Archivo: ${INPUT_PATH}`);
  const pool = new Pool({
    host: PGHOST,
    port: Number(PGPORT),
    database: PGDATABASE,
    user: PGUSER,
    password: PGPASSWORD,
    ssl: false,
  });
  const client = await pool.connect();
  try {
    const raw = readRecords(INPUT_PATH);
    const records = raw.map(mapAndNormalize).filter((r) => r._id != null && String(r._id).trim() !== "");
    console.log(`Filas leídas: ${records.length}`);

    if (PREVIEW) {
      console.log(records.slice(0, 5));
      process.exit(0);
    }

    await client.query("SET client_encoding TO 'UTF8'");

    // detectar si la tabla usa 'user' o 'user_id'
    const cols = await getColumns(client, TABLE);
    const idCol = cols.includes("user") ? "user" : cols.includes("user_id") ? "user_id" : null;
    if (!idCol) throw new Error("La tabla 'pacientes' no tiene columna 'user' ni 'user_id'.");

    // columnas destino válidas:
    const targetCols = [idCol, "tipo_sangre", "altura", "edad_anios", "edad_meses"].filter((c) => cols.includes(c));
    const placeholders = targetCols.map((_, i) => `$${i + 1}`).join(", ");
    const updateSet = targetCols
      .filter((c) => c !== idCol)
      .map((c) => `${c} = EXCLUDED.${c}`)
      .join(", ");

    const sql = `
      INSERT INTO ${TABLE} (${targetCols.join(", ")})
      VALUES (${placeholders})
      ON CONFLICT (${idCol}) DO UPDATE SET ${updateSet};
    `;

    let ok = 0,
      bad = 0;
    await client.query("BEGIN");
    for (const r of records) {
      await client.query("SAVEPOINT sp");
      try {
        const rowObj = {
          [idCol]: Number(r._id),
          tipo_sangre: r.tipo_sangre || null,
          altura: r.altura ?? null,
          edad_anios: r.edad_anios ?? null,
          edad_meses: r.edad_meses ?? 0,
        };
        const params = targetCols.map((c) => rowObj[c] ?? null);
        await client.query(sql, params);
        await client.query("RELEASE SAVEPOINT sp");
        ok++;
      } catch (e) {
        bad++;
        console.error("Error fila", r._id, "-", e.message);
        await client.query("ROLLBACK TO SAVEPOINT sp");
      }
    }
    await client.query("COMMIT");
    console.log(`Importación PACIENTES terminada. OK: ${ok}, Errores: ${bad}`);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Fallo general:", err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
})();
