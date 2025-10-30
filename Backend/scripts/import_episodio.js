#!/usr/bin/env node
/**
 * Importa EPISODIO.csv a public.episodio (episodio_id autoincremental).
 * Soporta comorbilidades en formatos: ['DM2','EPOC'], DM2,EPOC, [], vacío.
 * Usa ::jsonb para insertar comorbilidades y corrige acentos/ñ desde cp1252.
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
  console.error("❌ Indica un CSV. Ej: node scripts/import_episodio.js ./scripts/EPISODIO.csv --preview");
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
  const txt = iconv.decode(buf, enc); // corrige VIÑA/acentos si viene cp1252
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

function fixEnumCIE10(s) {
  if (!s) return null;
  const v = String(s).toUpperCase().replace(/\s+/g, "");
  return ["S72.0","S72.1","S72.2","S00.0"].includes(v) ? v : null;
}

function fixEnumFractura(s) {
  if (!s) return null;
  const v = String(s).toUpperCase().normalize("NFKC");
  const map = {
    "INTRACAPSULAR": "INTRACAPSULAR",
    "EXTRACAPSULAR": "EXTRACAPSULAR",
    "PERTROCANTERICA": "PERTROCANTERICA",
    "PERTROCÁNTERICA": "PERTROCANTERICA",
    "SUBTROCANTERICA": "SUBTROCANTERICA",
    "SUBTROCÁNTERICA": "SUBTROCANTERICA",
  };
  return map[v] || null;
}

function fixEnumLado(s) {
  if (!s) return null;
  const v = String(s).toUpperCase();
  return ["DERECHO","IZQUIERDO","BILATERAL"].includes(v) ? v : null;
}

function fixABO(s) {
  if (!s) return null;
  const v = String(s).toUpperCase().trim();
  return ["A","B","AB","O"].includes(v) ? v : null;
}
function fixRH(s) {
  if (!s) return null;
  const v = String(s).replace(/\s+/g,"").toUpperCase();
  if (v === "RH+" || v === "POS" || v === "+") return "Rh+";
  if (v === "RH-" || v === "NEG" || v === "-") return "Rh-";
  return null;
}

/** Acepta:
 *  - "['DM2','EPOC']"
 *  - 'DM2, EPOC' | 'DM2;EPOC' | 'DM2|EPOC'
 *  - "[]" o vacío -> []
 */
function parseComorbilidades(s) {
  if (s == null) return [];
  let raw = String(s).trim();
  if (!raw) return [];
  if (raw === "[]") return [];
  // Si parece JSON-like con corchetes
  if (/^\[.*\]$/.test(raw)) {
    try {
      const fixed = raw.replace(/'/g, '"').replace(/,\s*\]/, "]");
      const arr = JSON.parse(fixed);
      return Array.isArray(arr) ? arr.map(x => String(x).normalize("NFC")) : [];
    } catch { /* fallback abajo */ }
  }
  // Fallback CSV simple
  return raw
    .split(/[;,|]/g)
    .map(x => x.trim())
    .filter(Boolean)
    .map(x => x.normalize("NFC"));
}

// ---------- MAIN ----------
(async () => {
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
        const paciente_id = r.paciente_id ? Number(r.paciente_id) : null;
        if (!paciente_id || Number.isNaN(paciente_id)) throw new Error("Falta 'paciente_id' válido.");

        const cie10 = fixEnumCIE10(r.cie10);
        if (!cie10) throw new Error(`cie10 inválido: ${r.cie10}`);

        const tipo_fractura = fixEnumFractura(r.tipo_fractura);
        if (!tipo_fractura) throw new Error(`tipo_fractura inválido: ${r.tipo_fractura}`);

        const lado = fixEnumLado(r.lado);
        const procedencia = (r.procedencia ?? "").toString().trim() || null;

        const comorbArr = parseComorbilidades(r.comorbilidades);
        const comorbilidadesParam = JSON.stringify(comorbArr); // <<< SIEMPRE JSON STRING

        const fecha_diagnostico = parseDateISO(r.fecha_diagnostico);
        if (!fecha_diagnostico) throw new Error("fecha_diagnostico inválida/ausente.");

        const fecha_ingreso_quirurgico = parseDateISO(r.fecha_ingreso_quirurgico);
        const fecha_alta = parseDateISO(r.fecha_alta);

        const no_operado = toBool(r.no_operado) ?? false;
        const causa_no_operar = (r.causa_no_operar ?? "").toString().trim() || null;

        const abo = fixABO(r.abo);
        const rh = fixRH(r.rh);

        const tabaco = toBool(r.tabaco) ?? false;
        const alcohol = toBool(r.alcohol) ?? false;
        const corticoides_cronicos = toBool(r.corticoides_cronicos) ?? false;
        const taco = toBool(r.taco) ?? false;

        const comentario_otro = ((r.describe ?? r.comentario_otro) ?? "").toString().trim() || null;

        const fallecimiento = toBool(r.fallecimiento) ?? false;
        const fecha_fallecimiento = parseDateISO(r.fecha_fallecimiento);

        const transfusion = toBool(r.transfusion);
        const reingreso = toBool(r.reingreso);

        const comentario_evolucion = (r.comentario_evolucion ?? "").toString().trim() || null;
        const notas_clinicas = (r.notas_clinicas ?? "").toString().trim() || null;
        const prequirurgicas = (r.prequirurgicas ?? "").toString().trim() || null;
        const postquirurgicas = (r.postquirurgicas ?? "").toString().trim() || null;

        const inicial = r.inicial === "" || r.inicial == null ? null : Number(r.inicial);

        // INSERT (episodio_id autoincremental) -- comorbilidades en $6::jsonb
        await client.query(
          `
          INSERT INTO public.episodio
            (paciente_id, cie10, tipo_fractura, lado, procedencia, comorbilidades,
             fecha_diagnostico, fecha_ingreso_quirurgico, fecha_alta,
             no_operado, causa_no_operar,
             abo, rh,
             tabaco, alcohol, corticoides_cronicos, taco,
             comentario_otro,
             fallecimiento, fecha_fallecimiento,
             transfusion, reingreso, comentario_evolucion,
             notas_clinicas, prequirurgicas, postquirurgicas, inicial)
          VALUES
            ($1,$2,$3,$4,$5, $6::jsonb,
             $7,$8,$9,
             $10,$11,
             $12,$13,
             $14,$15,$16,$17,
             $18,
             $19,$20,
             $21,$22,$23,
             $24,$25,$26,$27)
          `,
          [
            paciente_id, cie10, tipo_fractura, lado, procedencia, comorbilidadesParam,
            fecha_diagnostico, fecha_ingreso_quirurgico, fecha_alta,
            no_operado, causa_no_operar,
            abo, rh,
            tabaco, alcohol, corticoides_cronicos, taco,
            comentario_otro,
            fallecimiento, fecha_fallecimiento,
            transfusion, reingreso, comentario_evolucion,
            notas_clinicas, prequirurgicas, postquirurgicas, inicial
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
    console.log(`✅ Importación EPISODIO: OK=${ok}  Errores=${err}`);
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("❌ Error general:", e.message);
  } finally {
    pool.end();
  }
})();
