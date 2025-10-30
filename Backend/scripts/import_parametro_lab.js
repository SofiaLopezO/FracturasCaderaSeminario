#!/usr/bin/env node
/**
 * Importa PARAMETRO_LAB.csv a public.parametro_lab (UPSERT por codigo).
 * Acepta CSV con:
 *  - ... , tipo_examen, tipo_muestra     (nombres)
 *  - ... , tipo_examen_id, tipo_muestra_id (IDs)
 * Si vienen ambos, prioriza *_id.
 *
 * Arreglos de robustez:
 *  - Auto-detección de encoding: utf16le, utf8, win1252, latin1
 *  - Auto-detección de delimitador: ',', ';' o TAB
 *  - Si no hay filas, muestra encabezados detectados y primeras líneas
 *
 * Uso:
 *   node scripts/import_parametro_lab.js ./scripts/PARAMETRO_LAB.csv --preview
 *   node scripts/import_parametro_lab.js ./scripts/PARAMETRO_LAB.csv
 */
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
const { parse } = require("csv-parse/sync");
const iconv = require("iconv-lite");

require("dotenv").config({ path: path.resolve(process.cwd(), ".env") });

const {
  PGHOST = "localhost",
  PGPORT = "5432",
  PGDATABASE = "fracturas",
  PGUSER = "sofia",
  PGPASSWORD = "Clave1234",
} = process.env;

const INPUT = process.argv[2] || path.resolve(process.cwd(), "scripts", "PARAMETRO_LAB.csv");
const PREVIEW = process.argv.includes("--preview");
const FQ = "public.parametro_lab";

/* ---------------- utils encoding/delimitador ---------------- */
const deBOM = (s) => (s && s.charCodeAt(0) === 65279 ? s.slice(1) : s);

// Devuelve el primer renglón NO vacío
function firstNonEmptyLine(txt) {
  for (const line of txt.split(/\r\n|\n|\r/)) {
    if (line.trim() !== "") return line;
  }
  return "";
}

function detectDelimiterFrom(line) {
  const c = (ch) => (line.match(new RegExp(`\\${ch}`, "g")) || []).length;
  // Preferimos el que más aparezca
  const counts = [
    { d: ",", n: c(",") },
    { d: ";", n: c(";") },
    { d: "\t", n: c("\t") },
  ];
  counts.sort((a, b) => b.n - a.n);
  return counts[0].n > 0 ? counts[0].d : ","; // por defecto coma
}

/** Heurística de decodificación robusta (incluye UTF-16 LE) */
function decodeBest(buf) {
  // BOM UTF-16LE
  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe) {
    return iconv.decode(buf, "utf16le");
  }
  // BOM UTF-16BE (poco común en CSV de Excel, pero por si acaso)
  if (buf.length >= 2 && buf[0] === 0xfe && buf[1] === 0xff) {
    return iconv.decode(buf, "utf16be");
  }
  // Candidatos habituales
  const cands = ["utf8", "win1252", "latin1"];
  let best = { text: "", score: -Infinity };
  for (const enc of cands) {
    const text = iconv.decode(buf, enc);
    // penaliza � y mojibake típico
    const repl = (text.match(/\uFFFD/g) || []).length;
    const mojis = (text.match(/Ã.|Â.|ï../g) || []).length;
    const score = -repl - mojis;
    if (score > best.score) best = { text, score };
  }
  return best.text;
}

function readCSVFlexible(filePath) {
  const buf = fs.readFileSync(filePath);
  const txt = decodeBest(buf);

  const delimiters = [",", ";", "\t"];
  let best = null;

  for (const delimiter of delimiters) {
    try {
      const parsed = parse(txt, {
        columns: (h) => h.map((x) => deBOM(String(x).trim().toLowerCase())),
        bom: true,
        skip_empty_lines: true,
        relax_column_count: true,
        relax_quotes: true,
        trim: true,
        delimiter,
      });

      if (!parsed || parsed.length === 0) continue;

      // calidad del intento: ¿tiene columnas que nos importan?
      const cols = Object.keys(parsed[0] || {});
      const hasCodigo = cols.includes("codigo");
      const hasNombre = cols.includes("nombre");
      const score =
        (hasCodigo ? 10 : 0) +
        (hasNombre ? 10 : 0) +
        Math.min(cols.length, 20); // más columnas suele ser mejor

      if (!best || score > best.score) {
        best = { rows: parsed, delimiter, score, headerRaw: cols.join(delimiter) };
      }
    } catch (_) {}
  }

  // Fallback: intenta coma aunque no haya filas válidas
  if (!best) {
    const parsed = parse(txt, {
      columns: true, bom: true, skip_empty_lines: true, trim: true, delimiter: ",",
    });
    best = { rows: parsed || [], delimiter: ",", score: 0, headerRaw: "" };
  }

  // Muestra un resumen de lo detectado
  console.log(`Delimitador elegido: ${JSON.stringify(best.delimiter)}`);
  return { rows: best.rows, delimiter: best.delimiter, headerRaw: best.headerRaw, textSample: txt.split(/\r\n|\n|\r/).slice(0, 3).join("\n") };
}


/* ---------------- normalización y FK helpers ---------------- */
const norm = (s) =>
  String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();

const TM_SYN = new Map([
  ["ecografia", "Ecografía (US)"],
  ["us", "Ecografía (US)"],
  ["ultrasonido", "Ecografía (US)"],
  ["rx", "Rayos X (RX)"],
  ["rayos x", "Rayos X (RX)"],
  ["dxa", "DXA (densitometría)"],
  ["densitometria", "DXA (densitometría)"],
  ["tc", "TC (TAC/CT)"],
  ["tac", "TC (TAC/CT)"],
  ["ct", "TC (TAC/CT)"],
  ["rm", "RM (MRI)"],
  ["mri", "RM (MRI)"],
  ["bdat", "BDAT (US antebrazo)"],
  ["tejido", "Tejido (biopsia)"],
]);
const canonicalTM = (s) => (TM_SYN.get(norm(s)) ?? s);

async function loadFkCaches(cx) {
  const te = await cx.query("SELECT id, nombre FROM public.tipo_examen");
  const tm = await cx.query("SELECT id, nombre FROM public.tipo_muestra");
  const TE = new Map();
  const TM = new Map();
  te.rows.forEach((r) => TE.set(norm(r.nombre), r.id));
  tm.rows.forEach((r) => TM.set(norm(r.nombre), r.id));
  return { TE, TM };
}

function mapRowGeneric(r) {
  const g = {};
  for (const [k, v] of Object.entries(r)) g[String(k).trim().toLowerCase()] = v;

  const codigo = String(g.codigo || "").trim();
  const nombre = String(g.nombre || "").trim();
  const unidad = g.unidad == null || g.unidad === "" ? null : String(g.unidad).trim();
  const ref_min = g.ref_min === "" || g.ref_min == null ? null : Number(g.ref_min);
  const ref_max = g.ref_max === "" || g.ref_max == null ? null : Number(g.ref_max);
  const notas = g.notas == null || g.notas === "" ? null : String(g.notas).trim();

  // IDs si vienen
  let tipo_examen_id = g.tipo_examen_id === "" || g.tipo_examen_id == null ? null : Number(g.tipo_examen_id);
  let tipo_muestra_id = g.tipo_muestra_id === "" || g.tipo_muestra_id == null ? null : Number(g.tipo_muestra_id);

  // nombres si vienen
  const tipo_examen = g.tipo_examen == null ? null : String(g.tipo_examen).trim();
  const tipo_muestra = g.tipo_muestra == null ? null : String(g.tipo_muestra).trim();

  return { codigo, nombre, unidad, ref_min, ref_max, notas, tipo_examen_id, tipo_muestra_id, tipo_examen, tipo_muestra };
}

/* ---------------- main ---------------- */
(async () => {
  console.log(`Archivo: ${INPUT}`);
  const pool = new Pool({
    host: PGHOST, port: Number(PGPORT), database: PGDATABASE, user: PGUSER, password: PGPASSWORD,
  });
  const cx = await pool.connect();

  try {
    try { await cx.query("ROLLBACK"); } catch (_) {}

    // Asegura PK (codigo)
    await cx.query("BEGIN");
    await cx.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint c
          JOIN pg_class t ON t.oid = c.conrelid
          JOIN pg_namespace n ON n.oid = t.relnamespace
          WHERE c.contype='p' AND n.nspname='public' AND t.relname='parametro_lab'
        ) THEN
          ALTER TABLE ${FQ} ADD PRIMARY KEY (codigo);
        END IF;
      END $$;
    `);
    await cx.query("COMMIT");

    const { rows: parsed, delimiter, headerRaw, textSample } = readCSVFlexible(INPUT);
    let rows = parsed.map(mapRowGeneric).filter((r) => r.codigo && r.nombre);

    console.log(`Delimitador detectado: ${JSON.stringify(delimiter)}`);
    if (rows.length === 0) {
      console.log("⚠️ No se detectaron filas con 'codigo' y 'nombre'.");
      console.log("Header detectado:", headerRaw);
      console.log("Primeras líneas del archivo:\n" + textSample);
    }
    console.log(`Filas leídas: ${rows.length}`);

    if (PREVIEW) {
      console.dir(rows.slice(0, 10), { depth: null });
      return;
    }

    const fk = await loadFkCaches(cx);
    const teId = (s) => fk.TE.get(norm(s || ""));
    const tmId = (s) => fk.TM.get(norm(canonicalTM(s || "")));

    const isBDAT = (c) => /^vf(as)?$|^va0$|^ct_th$|^ct_po$|^st_th$|^max_inv$|^diff_max$|^lowk$/i.test(c);
    const isFTIR = (c) => /^(amida_i|amida_ii|po4|co3|po4_co3|irsf)$/i.test(c);

    // Resolver FKs si faltan
    for (const r of rows) {
      if (!r.tipo_examen_id) {
        if (r.tipo_examen) r.tipo_examen_id = teId(r.tipo_examen);
        if (!r.tipo_examen_id) r.tipo_examen_id = (isBDAT(r.codigo) || isFTIR(r.codigo)) ? teId("Imagen") : teId("Laboratorio");
      }
      if (!r.tipo_muestra_id) {
        if (r.tipo_muestra) r.tipo_muestra_id = tmId(r.tipo_muestra);
        if (!r.tipo_muestra_id) {
          r.tipo_muestra_id = isBDAT(r.codigo)
            ? tmId("BDAT (US antebrazo)")
            : isFTIR(r.codigo)
              ? tmId("Tejido (biopsia)")
              : tmId("Sangre");
        }
      }
    }

    await cx.query("BEGIN");
    const upsert = `
      INSERT INTO ${FQ}
        (codigo, nombre, unidad, ref_min, ref_max, notas, tipo_examen_id, tipo_muestra_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      ON CONFLICT (codigo) DO UPDATE SET
        nombre = EXCLUDED.nombre,
        unidad = EXCLUDED.unidad,
        ref_min = EXCLUDED.ref_min,
        ref_max = EXCLUDED.ref_max,
        notas = EXCLUDED.notas,
        tipo_examen_id = EXCLUDED.tipo_examen_id,
        tipo_muestra_id = EXCLUDED.tipo_muestra_id
    `;
    let ok = 0, bad = 0;
    for (const r of rows) {
      try {
        await cx.query(upsert, [
          r.codigo, r.nombre, r.unidad, r.ref_min, r.ref_max, r.notas, r.tipo_examen_id, r.tipo_muestra_id,
        ]);
        ok++;
      } catch (e) {
        bad++;
        console.error(`Error codigo=${r.codigo}: ${e.message}`);
      }
    }
    await cx.query("COMMIT");
    console.log(`Importación parametro_lab: OK=${ok}  Errores=${bad}`);
  } catch (err) {
    try { await cx.query("ROLLBACK"); } catch (_) {}
    console.error("Fallo general:", err.message);
    process.exit(1);
  } finally {
    cx.release();
    await pool.end();
  }
})();
