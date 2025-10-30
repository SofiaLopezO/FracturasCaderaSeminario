#!/usr/bin/env node
/**
 * Importa MUESTRA.csv a public.muestra (UPSERT por muestra_id si existe).
 *
 * CSV flexible (encabezados normalizados):
 *   - (opcional) muestra_id
 *   - tipo_muestra   (o tipo_muestra_id → se resuelve a nombre si existe tabla tipo_muestra)
 *   - fecha_extraccion (opcional; acepta DD/MM/YYYY HH:mm)
 *   - fecha_recepcion  (opcional; acepta DD/MM/YYYY HH:mm)
 *   - observaciones    (opcional)
 *   - examen_id | examen | examer (requerido; detecta la FK real en BD)
 *   - profesional_id   (opcional; si la columna es NOT NULL, usa --prof=ID o env DEFAULT_PROFESIONAL_ID)
 *
 * Flags:
 *   --preview             Solo muestra lo que hará
 *   --prof=ID             Default para profesional_id si viene vacío
 *   --when=YYYY-MM-DD     Default para fecha_extraccion/recepcion si son NOT NULL y vienen vacías
 */

const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");
const chardet = require("chardet");
const iconv = require("iconv-lite");
const { Pool } = require("pg");

require("dotenv").config({ path: path.resolve(process.cwd(), ".env") });

// ---------- CLI ----------
const INPUT = process.argv.find((a) => /\.csv$/i.test(a));
const PREVIEW = process.argv.includes("--preview");
const PROF_FLAG = process.argv.find((a) => a.startsWith("--prof="));
const WHEN_FLAG = process.argv.find((a) => a.startsWith("--when="));

const DEFAULT_PROF_ID = PROF_FLAG
  ? Number(PROF_FLAG.split("=")[1])
  : (process.env.DEFAULT_PROFESIONAL_ID ? Number(process.env.DEFAULT_PROFESIONAL_ID) : null);

const DEFAULT_WHEN =
  (WHEN_FLAG && WHEN_FLAG.split("=")[1]) ||
  process.env.DEFAULT_FECHA_EXTRACCION ||
  null;

if (!INPUT) {
  console.error("❌ Indica un CSV. Ej: node scripts/import_muestra.js ./scripts/MUESTRA.csv --prof=1 --when=2025-06-01");
  process.exit(1);
}

const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  port: +(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE || "fracturas",
  user: process.env.PGUSER || "sofia",
  password: process.env.PGPASSWORD || "Clave1234",
});

// ---------- CSV utils ----------
const normHeader = (s) =>
  String(s ?? "")
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .normalize("NFKC")
    .replace(/\s+/g, "_")
    .replace(/[^\w]/g, "_")
    .replace(/_+/g, "_");

function detectDelimiter(sample) {
  const sc = (sample.match(/;/g) || []).length;
  const cc = (sample.match(/,/g) || []).length;
  return sc > cc ? ";" : ",";
}

function readCSV(filePath) {
  const buf = fs.readFileSync(filePath);
  const enc = chardet.detect(buf) || "UTF-8";
  const txt = iconv.decode(buf, enc);
  const delimiter = detectDelimiter(txt.slice(0, 4096));
  const rows = parse(txt, {
    columns: (h) => h.map(normHeader),
    delimiter,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
    trim: true,
  });
  return { rows, delimiter };
}

// ---------- fechas ----------
function parseDateToISO(s) {
  if (s == null) return null;
  const raw = String(s).trim();
  if (!raw) return null;
  const r = raw.replace(/\s+/g, " ").replace(/\./g, ":");
  // DD/MM/YYYY [HH:mm[:ss]]
  const m = r.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (m) {
    let [_, d, mo, y, hh = "00", mm = "00", ss = "00"] = m;
    if (y.length === 2) y = (Number(y) + 2000).toString();
    const dt = new Date(Number(y), Number(mo) - 1, Number(d), Number(hh), Number(mm), Number(ss));
    return isNaN(dt.getTime()) ? null : dt.toISOString();
  }
  // intentar Date.parse
  const t = Date.parse(r.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$3-$2-$1"));
  return isNaN(t) ? null : new Date(t).toISOString();
}

// ---------- DB helpers ----------
async function tableExists(client, schema, table) {
  const q = `SELECT 1 FROM information_schema.tables WHERE table_schema=$1 AND table_name=$2 LIMIT 1`;
  return !!(await client.query(q, [schema, table])).rows[0];
}

async function tableHasColumn(client, table, col) {
  const q = `
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema='public' AND table_name=$1 AND column_name=$2
    LIMIT 1`;
  return !!(await client.query(q, [table, col])).rows[0];
}

async function columnInfo(client, table, col) {
  const q = `
    SELECT is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema='public' AND table_name=$1 AND column_name=$2`;
  const r = await client.query(q, [table, col]);
  return r.rows[0] || { is_nullable: "YES", column_default: null };
}

async function resolveTipoMuestraNombre(client, val) {
  if (val == null || val === "") return null;
  const s = String(val).trim();
  if (/^\d+$/.test(s)) {
    // sólo consultar si existe la tabla tipo_muestra
    if (await tableExists(client, "public", "tipo_muestra")) {
      const r = await client.query(
        "SELECT nombre FROM public.tipo_muestra WHERE id=$1 LIMIT 1",
        [Number(s)]
      );
      return r.rows[0]?.nombre || s; // si no hay match, devolver tal cual
    }
    return s;
  }
  return s;
}

// ---------- MAIN ----------
(async () => {
  console.log(`Archivo: ${INPUT}`);
  const { rows, delimiter } = readCSV(INPUT);
  console.log(`Delimitador detectado: "${delimiter}"`);
  if (!rows.length) return console.log("⚠️ CSV vacío.");

  const cols = Object.keys(rows[0]);
  const hasPk       = cols.includes("muestra_id") || cols.includes("muestra");
  const hasTipoTxt  = cols.includes("tipo_muestra");
  const hasTipoId   = cols.includes("tipo_muestra_id");
  const hasObs      = cols.includes("observaciones");
  const hasFechaE   = cols.includes("fecha_extraccion");
  const hasFechaR   = cols.includes("fecha_recepcion");
  const hasExamenAny= cols.includes("examen_id") || cols.includes("examen") || cols.includes("examer");
  const hasProf     = cols.includes("profesional_id");

  if (!hasExamenAny) {
    console.log("⚠️ Requerido: 'examen_id' o 'examen' (o 'examer'). Encabezados:", cols);
    return;
  }
  if (!hasTipoTxt && !hasTipoId) {
    console.log("⚠️ Requerido: 'tipo_muestra' o 'tipo_muestra_id'. Encabezados:", cols);
    return;
  }

  console.log("Primeras filas normalizadas:");
  console.dir(rows.slice(0, 3), { depth: null });
  if (PREVIEW) {
    console.log(`🟡 PREVIEW: ${rows.length} filas. No se escribe en BD.`);
    return;
  }

  const client = await pool.connect();
  try {
    // Detectar nombres reales en BD
    const pkCol = (await tableHasColumn(client, "muestra", "muestra_id")) ? "muestra_id" : "muestra";
    let fkExamenCol = "examen";
    if (await tableHasColumn(client, "muestra", "examen_id")) fkExamenCol = "examen_id";
    else if (await tableHasColumn(client, "muestra", "examer")) fkExamenCol = "examer";

    const infoProf  = await columnInfo(client, "muestra", "profesional_id");
    const infoFExt  = await columnInfo(client, "muestra", "fecha_extraccion");
    const infoFRec  = await columnInfo(client, "muestra", "fecha_recepcion");
    const profNotNull  = infoProf.is_nullable === "NO";
    const fextNotNull  = infoFExt.is_nullable === "NO";
    const frecNotNull  = infoFRec.is_nullable === "NO";

    // Defaults efectivos
    let PROF_FALLBACK = profNotNull
      ? (Number.isFinite(DEFAULT_PROF_ID) ? DEFAULT_PROF_ID : null)
      : null;

    let WHEN_FALLBACK_ISO = DEFAULT_WHEN ? parseDateToISO(DEFAULT_WHEN) : null;

    // Si columnas de fecha son NOT NULL y no nos dieron --when, usa NOW() (aviso 1 sola vez)
    if ((fextNotNull || frecNotNull) && !WHEN_FALLBACK_ISO) {
      WHEN_FALLBACK_ISO = new Date().toISOString();
      console.log(`ℹ️  Columnas de fecha NOT NULL sin --when: se usará NOW() (${WHEN_FALLBACK_ISO}) cuando falte.`);
    }
    if (profNotNull && PROF_FALLBACK == null) {
      console.log("ℹ️  'profesional_id' es NOT NULL y no diste --prof: intentaré usar el valor del CSV; si falta, la fila fallará.");
    }

    await client.query("BEGIN");
    let ok = 0, err = 0;

    for (const r of rows) {
      await client.query("SAVEPOINT fila");
      try {
        const pkVal =
          r[pkCol] !== undefined && r[pkCol] !== null && r[pkCol] !== "" ? Number(r[pkCol]) : null;

        // tipo_muestra
        let tipo_muestra = hasTipoTxt
          ? String(r.tipo_muestra ?? "").trim()
          : await resolveTipoMuestraNombre(client, r.tipo_muestra_id);
        if (!tipo_muestra) throw new Error("Falta/No se pudo resolver 'tipo_muestra'.");

        // examen*
        const examen_csv = r.examen_id ?? r.examen ?? r.examer ?? null;
        const examen_val = examen_csv === "" || examen_csv == null ? null : Number(examen_csv);
        if (!examen_val) throw new Error("Falta 'examen' para la muestra.");

        // profesional_id
        let profesional_id = hasProf && r.profesional_id !== "" && r.profesional_id != null
          ? Number(r.profesional_id)
          : null;
        if (profesional_id == null && profNotNull) {
          if (PROF_FALLBACK != null) profesional_id = PROF_FALLBACK;
          else throw new Error("profesional_id es NOT NULL y no se recibió valor (ni --prof/env).");
        }

        // fechas
        let fecha_extraccion = hasFechaE ? parseDateToISO(r.fecha_extraccion) : null;
        let fecha_recepcion  = hasFechaR ? parseDateToISO(r.fecha_recepcion)  : null;

        // Si falta extracción y hay recepción, copiar
        if (!fecha_extraccion && fecha_recepcion) fecha_extraccion = fecha_recepcion;

        // Si siguen faltando y son NOT NULL, usar fallback NOW/--when
        if (!fecha_extraccion && fextNotNull) fecha_extraccion = WHEN_FALLBACK_ISO;
        if (!fecha_recepcion  && frecNotNull) fecha_recepcion  = WHEN_FALLBACK_ISO;

        const observaciones = (hasObs ? (r.observaciones ?? "") : "").toString().trim() || null;

        // INSERT / UPSERT
        if (pkVal != null) {
          await client.query(
            `
            INSERT INTO public.muestra (${pkCol}, tipo_muestra, fecha_extraccion, fecha_recepcion, observaciones, ${fkExamenCol}, profesional_id)
            VALUES ($1,$2,$3,$4,$5,$6,$7)
            ON CONFLICT (${pkCol}) DO UPDATE SET
              tipo_muestra     = EXCLUDED.tipo_muestra,
              fecha_extraccion = EXCLUDED.fecha_extraccion,
              fecha_recepcion  = EXCLUDED.fecha_recepcion,
              observaciones    = EXCLUDED.observaciones,
              ${fkExamenCol}   = EXCLUDED.${fkExamenCol},
              profesional_id   = EXCLUDED.profesional_id
            `,
            [pkVal, tipo_muestra, fecha_extraccion, fecha_recepcion, observaciones, examen_val, profesional_id]
          );
        } else {
          await client.query(
            `
            INSERT INTO public.muestra (tipo_muestra, fecha_extraccion, fecha_recepcion, observaciones, ${fkExamenCol}, profesional_id)
            VALUES ($1,$2,$3,$4,$5,$6)
            RETURNING ${pkCol}
            `,
            [tipo_muestra, fecha_extraccion, fecha_recepcion, observaciones, examen_val, profesional_id]
          );
        }

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
    console.log(`✅ Importación MUESTRA: OK=${ok}  Errores=${err}`);
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("❌ Error general:", e.message);
  } finally {
    client.release();
    await pool.end();
  }
})();
