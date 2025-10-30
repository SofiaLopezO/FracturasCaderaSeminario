#!/usr/bin/env node
/**
 * Importa RESULTADO.csv a public.resultado (resultado_id autoincremental).
 *
 * Encabezados aceptados (se normalizan a minúsculas con _):
 * episodio_id, muestra_id, examen_id, parametro, valor, unidad|unida, fecha_resultado
 *
 * Uso:
 *   node scripts/import_resultado.js ./scripts/RESULTADO.csv --preview
 *   node scripts/import_resultado.js ./scripts/RESULTADO.csv
 */

const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
const { parse } = require("csv-parse/sync");
const chardet = require("chardet");
const iconv = require("iconv-lite");
require("dotenv").config({ path: path.resolve(process.cwd(), ".env") });

// ---------- CLI ----------
const INPUT = process.argv.find((a) => /\.csv$/i.test(a));
const PREVIEW = process.argv.includes("--preview");
if (!INPUT) {
  console.error("❌ Indica un CSV. Ej: node scripts/import_resultado.js ./scripts/RESULTADO.csv --preview");
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
    columns: (h) => h.map(normHeader),
    delimiter,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
    trim: true,
  });
  // normaliza a NFC para que tildes/ñ queden bien en PG
  return { rows: rows.map((r) => normalizeRecord(r)), delimiter };
}

function normalizeRecord(r) {
  const out = {};
  for (const k of Object.keys(r)) {
    const v = r[k];
    out[k] = typeof v === "string" ? v.normalize("NFC") : v;
  }
  // tolerar encabezado "unida"
  if (out.unida != null && out.unidad == null) out.unidad = out.unida;
  return out;
}

// Acepta:
//  - 2025-06-18
//  - 2025-06-18 00:00:00
//  - 2025/06/18 00:00:00
//  - 2025-06-18 00:00:11,90  (coma o punto en fracción)
//  - 2025-06-18 00:00:00-04 / -0400 / -04:00
function parseDateISO(s) {
  if (s == null) return null;
  let raw = String(s).trim().replace(/\u00A0/g, ""); // quita NBSP
  if (!raw) return null;

  // fecha sola
  let m = raw.match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/);
  if (m) {
    const [_, Y, Mo, D] = m;
    const d = new Date(Date.UTC(+Y, +Mo - 1, +D, 0, 0, 0, 0));
    return isNaN(d) ? null : d.toISOString();
  }

  // fecha + hora [+ fracción] [+ tz]
  // tz puede ser -04, -0400 o -04:00
  m = raw.match(
    /^(\d{4})[-/](\d{2})[-/](\d{2})[ T](\d{2}):(\d{2})(?::(\d{2})(?:[.,](\d{1,3}))?)?(?:\s*([+-]\d{2})(?::?(\d{2}))?)?$/
  );
  if (m) {
    let [, Y, Mo, D, h, mi, se = "00", frac = "0", tzH, tzM] = m;

    // normaliza fracción: "90" -> 900 ms, "1" -> 100 ms
    let ms = 0;
    if (frac) {
      if (frac.length === 1) ms = +frac * 100;
      else if (frac.length === 2) ms = +frac * 10;
      else ms = +frac.slice(0, 3);
    }

    // arma sufijo TZ si viene
    let tz = "Z";
    if (tzH) {
      const hh = tzH; // incluye signo
      const mm = tzM ?? "00";
      tz = `${hh}:${mm}`;
    }

    // construye string ISO-like con tz explícita
    const isoLike = `${Y}-${Mo}-${D}T${h}:${mi}:${se}.${String(ms).padStart(3, "0")}${tz}`;
    const d = new Date(isoLike);
    if (!isNaN(d)) return d.toISOString();
  }

  // fallback a Date.parse si calza algo entendible
  const t = Date.parse(raw.replace(/,(\d{1,3})$/, ".$1")); // por si quedó "...,ddd"
  return isNaN(t) ? null : new Date(t).toISOString();
}

function parseFloatFlexible(v) {
  if (v == null) return null;
  let s = String(v).trim();
  if (!s) return null;
  // elimina separadores de miles como "." cuando hay coma decimal (1.234,56)
  if (/[0-9]\.[0-9]{3}/.test(s) && s.includes(",")) s = s.replace(/\./g, "");
  // cambia coma decimal por punto
  s = s.replace(/,/g, ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function toInt(v) {
  if (v == null || String(v).trim() === "") return null;
  const n = Number(String(v).trim());
  return Number.isInteger(n) ? n : null;
}

// ---------- MAIN ----------
(async () => {
  console.log(`Archivo: ${INPUT}`);
  const { rows, delimiter } = readCSV(INPUT);
  console.log(`Delimitador detectado: "${delimiter}"`);
  if (!rows.length) return console.log("⚠️ CSV vacío.");

  // vista previa
  console.log("Ejemplo normalizado:", rows.slice(0, 3));

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
        const episodio_id = toInt(r.episodio_id);
        if (!episodio_id) throw new Error("Falta episodio_id válido.");

        const muestra_id = toInt(r.muestra_id);
        const examen_id  = toInt(r.examen_id);

        const parametro = (r.parametro ?? "").toString().trim();
        if (!parametro) throw new Error("Falta parametro.");

        const valor = parseFloatFlexible(r.valor);
        if (valor == null) throw new Error(`valor inválido: ${r.valor}`);

        const unidad = (r.unidad ?? "").toString().trim() || null;

        const fecha_resultado = parseDateISO(r.fecha_resultado);
        if (!fecha_resultado) throw new Error("fecha_resultado inválida/ausente.");

        await client.query(
          `
          INSERT INTO public.resultado
            (episodio_id, muestra_id, examen_id, parametro, valor, unidad, fecha_resultado)
          VALUES ($1,$2,$3,$4,$5,$6,$7)
          `,
          [episodio_id, muestra_id, examen_id, parametro, valor, unidad, fecha_resultado]
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
    console.log(`✅ Importación RESULTADO: OK=${ok}  Errores=${err}`);
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("❌ Error general:", e.message);
  } finally {
    client.release();
    pool.end();
  }
})();
