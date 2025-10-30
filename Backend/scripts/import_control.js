#!/usr/bin/env node
/**
 * Importa CONTROL.csv a public.control_clinico (control_id autoincremental).
 *
 * Encabezados aceptados (se normalizan a minúsculas con _):
 * episodio_id, profesional_id, profesional_nombre, origen, tipo_control,
 * resumen, fecha_hora_control, comorbilidades, tabaco, alcohol,
 * corticoides_cronicos, taco, prequirurgicas, postquirurgicas,
 * notas_clinicas, notas_evolucion, complicaciones, transfusion, reingreso,
 * comentario_otro
 *
 * Uso:
 *   node scripts/import_control.js ./scripts/CONTROL.csv --preview
 */

const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
const { parse } = require("csv-parse/sync");
const chardet = require("chardet");
const iconv = require("iconv-lite");
require("dotenv").config({ path: path.resolve(process.cwd(), ".env") });

// ---------- CLI ----------
const INPUT = process.argv.find(a => /\.csv$/i.test(a));
const PREVIEW = process.argv.includes("--preview");
if (!INPUT) {
  console.error("❌ Indica un CSV. Ej: node scripts/import_control.js ./scripts/CONTROL.csv --preview");
  process.exit(1);
}

// ---------- DB ----------
const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  port: +(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE || "fracturas",
  user: process.env.PGUSER || "sofia",
  password: process.env.PGPASSWORD || "Clave1234",
});

// ---------- Utils ----------
const normHeader = s =>
  String(s ?? "")
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .normalize("NFKC")
    .replace(/\s+/g, "_")
    .replace(/[^\w]/g, "_")
    .replace(/_+/g, "_");

function detectDelimiter(sample) {
  const semi = (sample.match(/;/g) || []).length;
  const comma = (sample.match(/,/g) || []).length;
  return semi > comma ? ";" : ",";
}

function readCSV(filePath) {
  const buf = fs.readFileSync(filePath);
  const enc = chardet.detect(buf) || "UTF-8";
  const txt = iconv.decode(buf, enc); // corrige VIÑA/acentos si llega cp1252
  const delimiter = detectDelimiter(txt.slice(0, 4096));
  const rows = parse(txt, {
    columns: h => h.map(normHeader),
    delimiter,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
    trim: true,
  });
  return { rows: rows.map(r => normalizeRecord(r)), delimiter };
}

function normalizeRecord(r) {
  const out = {};
  for (const k of Object.keys(r)) {
    const v = r[k];
    out[k] = typeof v === "string" ? v.normalize("NFC") : v;
  }
  return out;
}

function toBool(v) {
  if (v == null) return null;
  const s = String(v).trim().toLowerCase();
  if (s === "") return null;
  if (["true","t","1","sí","si","y","s","verdadero","v","ture","tue"].includes(s)) return true;
  if (["false","f","0","no","n","falso"].includes(s)) return false;
  return null;
}

function parseDateISO(s) {
  if (s == null) return null;
  const raw = String(s).trim();
  if (!raw) return null;

  // 2025-06-12 00:00:00
  const isoLike = raw.match(/^(\d{4})[-/](\d{2})[-/](\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/);
  if (isoLike) {
    const [, Y, M, D, h="00", m="00", sec="00"] = isoLike;
    const dt = new Date(Number(Y), Number(M)-1, Number(D), Number(h), Number(m), Number(sec));
    return isNaN(dt.getTime()) ? null : dt.toISOString();
  }

  // 12/06/2025 0:00
  const dmy = raw.replace(/\./g, ":").match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (dmy) {
    let [, d, mo, y, h="00", m="00", sec="00"] = dmy;
    if (y.length === 2) y = (Number(y) + 2000).toString();
    const dt = new Date(Number(y), Number(mo)-1, Number(d), Number(h), Number(m), Number(sec));
    return isNaN(dt.getTime()) ? null : dt.toISOString();
  }

  const t = Date.parse(raw);
  return isNaN(t) ? null : new Date(t).toISOString();
}

function fixOrigen(s) {
  if (!s) return "Guardado";
  const v = String(s).trim().toLowerCase();
  if (["guardado","minuta","otro"].includes(v)) {
    return v[0].toUpperCase() + v.slice(1);
  }
  return "Guardado";
}

function fixTipoControl(s) {
  if (!s) return "SEGUIMIENTO";
  const v = String(s).trim().toUpperCase();
  const ok = ["INICIAL","SEGUIMIENTO","INTERCONSULTA","ALTA","OTRO"];
  return ok.includes(v) ? v : "SEGUIMIENTO";
}

/** Acepta:
 *  - "['DM2','EPOC']"
 *  - 'DM2, EPOC' | 'DM2;EPOC' | 'DM2|EPOC'
 *  - "[]" o vacío -> []
 */
function parseStringArrayToJSON(s) {
  if (s == null) return [];
  let raw = String(s).trim();
  if (!raw || raw === "[]") return [];
  if (/^\[.*\]$/.test(raw)) {
    try {
      const fixed = raw.replace(/'/g, '"').replace(/,\s*\]/, "]");
      const arr = JSON.parse(fixed);
      return Array.isArray(arr) ? arr.map(x => String(x).normalize("NFC")) : [];
    } catch { /* fallback a split */ }
  }
  return raw
    .split(/[;,|]/g)
    .map(x => x.trim())
    .filter(Boolean)
    .map(x => x.normalize("NFC"));
}

// ---------- MAIN ----------
;(async () => {
  console.log(`Archivo: ${INPUT}`);
  const { rows, delimiter } = readCSV(INPUT);
  console.log(`Delimitador detectado: "${delimiter}"`);
  if (!rows.length) return console.log("⚠️ CSV vacío.");

  console.log("Ejemplo normalizado:", rows.slice(0, 2));

  if (PREVIEW) {
    console.log(`🟡 PREVIEW: ${rows.length} filas. No se escribe en BD.`);
    return;
  }

  const client = await pool.connect();
  let ok = 0, err = 0;

  try {
    await client.query("BEGIN");

    for (const r of rows) {
      await client.query("SAVEPOINT fila");
      try {
        const episodio_id = r.episodio_id ? Number(r.episodio_id) : null;
        if (!episodio_id || Number.isNaN(episodio_id)) throw new Error("Falta 'episodio_id' válido.");

        const profesional_id = r.profesional_id ? Number(r.profesional_id) : null;
        const profesional_nombre = (r.profesional_nombre ?? "").toString().trim() || null;

        const origen = fixOrigen(r.origen);
        const tipo_control = fixTipoControl(r.tipo_control);

        const resumen = (r.resumen ?? "").toString().trim() || null;
        const fecha_hora_control = parseDateISO(r.fecha_hora_control) || new Date().toISOString();

        const comorbilidadesArr = parseStringArrayToJSON(r.comorbilidades);
        const comorbilidadesParam = JSON.stringify(comorbilidadesArr);

        const tabaco = toBool(r.tabaco);
        const alcohol = toBool(r.alcohol);
        const corticoides_cronicos = toBool(r.corticoides_cronicos);
        const taco = toBool(r.taco);

        const prequirurgicas = (r.prequirurgicas ?? "").toString().trim() || null;
        const postquirurgicas = (r.postquirurgicas ?? "").toString().trim() || null;
        const notas_clinicas = (r.notas_clinicas ?? "").toString().trim() || null;
        const notas_evolucion = (r.notas_evolucion ?? "").toString().trim() || null;

        const complicacionesArr = parseStringArrayToJSON(r.complicaciones);
        const complicacionesParam = JSON.stringify(complicacionesArr);

        const transfusion = toBool(r.transfusion);
        const reingreso = toBool(r.reingreso);

        const comentario_otro = (r.comentario_otro ?? "").toString().trim() || null;

        // INSERT (control_id autoincremental)
        await client.query(
          `
          INSERT INTO public.control_clinico
            (episodio_id, profesional_id, profesional_nombre, origen, tipo_control,
             resumen, fecha_hora_control, comorbilidades,
             tabaco, alcohol, corticoides_cronicos, taco,
             prequirurgicas, postquirurgicas, notas_clinicas, notas_evolucion,
             complicaciones, transfusion, reingreso, comentario_otro)
          VALUES
            ($1,$2,$3,$4,$5,
             $6,$7, $8::jsonb,
             $9,$10,$11,$12,
             $13,$14,$15,$16,
             $17::jsonb,$18,$19,$20)
          `,
          [
            episodio_id, profesional_id, profesional_nombre, origen, tipo_control,
            resumen, fecha_hora_control, comorbilidadesParam,
            tabaco, alcohol, corticoides_cronicos, taco,
            prequirurgicas, postquirurgicas, notas_clinicas, notas_evolucion,
            complicacionesParam, transfusion, reingreso, comentario_otro
          ]
        );

        await client.query("RELEASE SAVEPOINT fila");
        ok++;
      } catch (e) {
        await client.query("ROLLBACK TO SAVEPOINT fila");
        await client.query("RELEASE SAVEPOINT fila");
        err++;
        console.error("Fila con error:", r, "\n→", e.message);
      }
    }

    await client.query("COMMIT");
    console.log(`✅ Importación CONTROL_CLINICO: OK=${ok}  Errores=${err}`);
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("❌ Error general:", e.message);
  } finally {
    pool.end();
  }
})();
