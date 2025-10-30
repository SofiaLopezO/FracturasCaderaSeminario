#!/usr/bin/env node
/**
 * Importa ANTROPOMETRIA.csv a public.antropometria (antropometria_id autoincremental).
 *
 * Columnas aceptadas (se normalizan a minúsculas con _):
 *   episodio_id, peso_kg, altura_m
 *
 * Reglas:
 *  - altura_m: si > 3, se interpreta como centímetros y se divide por 100.
 *  - 0, "", "NA", "null" -> NULL en peso/altura.
 *
 * Uso:
 *   node scripts/import_antropometria.js ./scripts/ANTROPOMETRIA.csv --preview
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
  console.error("❌ Indica un CSV. Ej: node scripts/import_antropometria.js ./scripts/ANTROPOMETRIA.csv --preview");
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
  const txt = iconv.decode(buf, enc);
  const delimiter = detectDelimiter(txt.slice(0, 4096));
  const rows = parse(txt, {
    columns: h => h.map(normHeader),
    delimiter,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
    trim: true,
  });
  return rows.map(r => {
    const out = {};
    for (const k of Object.keys(r)) {
      const v = r[k];
      out[k] = typeof v === "string" ? v.normalize("NFC") : v;
    }
    return out;
  });
}

function numOrNull(v) {
  if (v == null) return null;
  const s = String(v).trim().toLowerCase();
  if (s === "" || s === "0" || s === "na" || s === "null") return null;
  const n = Number(s.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function normalizeAlturaM(v) {
  const n = numOrNull(v);
  return n == null ? null : +n.toFixed(3); // deja 180 como 180.000
}


// ---------- MAIN ----------
(async () => {
  console.log(`Archivo: ${INPUT}`);
  const rows = readCSV(INPUT);
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
        const episodio_id = r.episodio_id ? Number(r.episodio_id) : null;
        if (!episodio_id || Number.isNaN(episodio_id)) throw new Error("Falta 'episodio_id' válido.");

        const peso_kg = numOrNull(r.peso_kg);
        const altura_m = normalizeAlturaM(r.altura_m);

        await client.query(
          `
          INSERT INTO public.antropometria
            (episodio_id, peso_kg, altura_m)
          VALUES ($1, $2, $3)
          `,
          [episodio_id, peso_kg, altura_m]
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
    console.log(`✅ Importación ANTROPOMETRIA: OK=${ok}  Errores=${err}`);
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("❌ Error general:", e.message);
  } finally {
    pool.end();
  }
})();
