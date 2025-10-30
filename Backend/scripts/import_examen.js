#!/usr/bin/env node
/**
 * Importa EXAMEN.csv a public.examen (UPSERT por PK).
 * Columnas aceptadas (con alias):
 *   - (opcional) examen_id  (alias: id, examen)
 *   - tipo_examen_id  o  tipo_examen  (alias: tipo, tipoexamen, examen_tipo)
 *   - paciente_id  (alias: paciente, id_paciente)
 *   - (opcional) profesional_id  (alias: profesional, id_profesional)
 *
 * Uso:
 *   node scripts/import_examen.js ./scripts/EXAMEN.csv --preview
 *   node scripts/import_examen.js ./scripts/EXAMEN.csv
 */
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
const { parse } = require("csv-parse/sync");
const chardet = require("chardet");
const iconv = require("iconv-lite");
require("dotenv").config({ path: path.resolve(process.cwd(), ".env") });

const INPUT = process.argv.find((a) => /\.csv$/i.test(a));
const PREVIEW = process.argv.includes("--preview");
if (!INPUT) {
  console.error("❌ Indica un CSV. Ej: node scripts/import_examen.js ./scripts/EXAMEN.csv --preview");
  process.exit(1);
}

const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  port: +(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE || "fracturas",
  user: process.env.PGUSER || "sofia",
  password: process.env.PGPASSWORD || "Clave1234",
});

// ---------- helpers CSV ----------
const norm = (s) =>
  String(s ?? "")
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .normalize("NFKC")
    .replace(/\s+/g, "_")
    .replace(/[^\w]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

function detectDelimiter(sample) {
  const sc = (sample.match(/;/g) || []).length;
  const cc = (sample.match(/,/g) || []).length;
  return sc > cc ? ";" : ",";
}

function mapHeaderAliases(headers) {
  const map = {
    examen_id: ["examen_id", "id", "examen"],
    tipo_examen_id: ["tipo_examen_id", "tipo_id", "id_tipo_examen", "tipoid"],
    tipo_examen: ["tipo_examen", "tipo", "tipoexamen", "examen_tipo"],
    paciente_id: ["paciente_id", "paciente", "id_paciente", "pacienteid"],
    profesional_id: ["profesional_id", "profesional", "id_profesional", "profesionalid"],
  };

  // construir renombrado
  const rename = {};
  for (const h of headers) {
    const n = norm(h);
    let key = null;
    for (const canon in map) {
      if (map[canon].some((a) => norm(a) === n)) {
        key = canon;
        break;
      }
    }
    rename[h] = key || n; // si no hay alias, usar normalizado tal cual
  }
  return rename;
}

function readCSV(p) {
  const buf = fs.readFileSync(p);
  const enc = chardet.detect(buf) || "UTF-8";
  const txt = iconv.decode(buf, enc);
  const delimiter = detectDelimiter(txt.slice(0, 4096));
  const rows = parse(txt, {
    columns: (hdr) => {
      const aliasMap = mapHeaderAliases(hdr);
      return hdr.map((h) => aliasMap[h]);
    },
    delimiter,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
    trim: true,
  });
  return { rows, delimiter };
}

// ---------- helpers DB ----------
async function tableHasColumn(client, table, col) {
  const q = `
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema='public' AND table_name=$1 AND column_name=$2
    LIMIT 1`;
  return !!(await client.query(q, [table, col])).rows[0];
}

async function resolveTipoExamenId(client, val) {
  if (val == null || val === "") return null;
  if (/^\d+$/.test(String(val))) return Number(val);

  const name = String(val).trim().toLowerCase();
  // exacto
  let r = await client.query(
    "SELECT id FROM public.tipo_examen WHERE lower(nombre)=lower($1) LIMIT 1",
    [name]
  );
  if (r.rows[0]) return r.rows[0].id;
  // heurísticas
  if (/(img|imagen)/.test(name)) {
    r = await client.query("SELECT id FROM public.tipo_examen WHERE lower(nombre)='imagen' LIMIT 1");
    if (r.rows[0]) return r.rows[0].id;
  }
  if (/(lab|laboratorio)/.test(name)) {
    r = await client.query(
      "SELECT id FROM public.tipo_examen WHERE lower(nombre)='laboratorio' LIMIT 1"
    );
    if (r.rows[0]) return r.rows[0].id;
  }
  return null;
}

async function resolveTipoExamenNombre(client, val) {
  if (val == null || val === "") return null;
  if (/^\d+$/.test(String(val))) {
    const r = await client.query("SELECT nombre FROM public.tipo_examen WHERE id=$1 LIMIT 1", [
      Number(val),
    ]);
    return r.rows[0]?.nombre || null;
  }
  return String(val).trim();
}

// ---------- main ----------
(async () => {
  console.log(`Archivo: ${INPUT}`);
  const { rows, delimiter } = readCSV(INPUT);
  console.log(`Delimitador detectado: "${delimiter}"`);
  if (!rows.length) return console.log("⚠️ CSV vacío.");

  const cols = Object.keys(rows[0]);
  const hasPaciente = cols.includes("paciente_id");
  const hasTipoTxt = cols.includes("tipo_examen");
  const hasTipoId = cols.includes("tipo_examen_id");
  console.log("Encabezados detectados (normalizados):", cols);

  if (!hasPaciente || (!hasTipoId && !hasTipoTxt)) {
    console.log("⚠️ Requeridos: paciente_id y (tipo_examen_id o tipo_examen).");
    return;
  }

  console.log("Primeras filas:");
  console.dir(rows.slice(0, 3), { depth: null });
  if (PREVIEW) {
    console.log(`🟡 PREVIEW: ${rows.length} filas. No se escribe en BD.`);
    return;
  }

  const client = await pool.connect();
  try {
    // Esquema real
    const pkCol = (await tableHasColumn(client, "examen", "examen_id")) ? "examen_id" : "examen";
    const hasTipoIdCol = await tableHasColumn(client, "examen", "tipo_examen_id");
    const hasTipoTxtCol = await tableHasColumn(client, "examen", "tipo_examen");
    if (!hasTipoIdCol && !hasTipoTxtCol) {
      throw new Error("La tabla examen no tiene ni tipo_examen_id ni tipo_examen.");
    }

    await client.query("BEGIN");
    let ok = 0,
      err = 0;

    for (const r of rows) {
      await client.query("SAVEPOINT fila");
      try {
        const pkProvided = r.examen_id !== "" && r.examen_id != null;
        const pkVal = pkProvided ? Number(r.examen_id) : null;

        const paciente_id =
          r.paciente_id === "" || r.paciente_id == null ? null : Number(r.paciente_id);
        const profesional_id =
          r.profesional_id === "" || r.profesional_id == null
            ? null
            : Number(r.profesional_id);

        if (!paciente_id) throw new Error("Falta paciente_id");

        if (hasTipoIdCol) {
          const tipo_examen_id = hasTipoId
            ? Number(r.tipo_examen_id)
            : await resolveTipoExamenId(client, r.tipo_examen);
          if (!tipo_examen_id) throw new Error("No se pudo resolver tipo_examen_id");

          if (pkProvided) {
            await client.query(
              `
              INSERT INTO public.examen (${pkCol}, tipo_examen_id, paciente_id, profesional_id)
              VALUES ($1,$2,$3,$4)
              ON CONFLICT (${pkCol}) DO UPDATE
                SET tipo_examen_id = EXCLUDED.tipo_examen_id,
                    paciente_id    = EXCLUDED.paciente_id,
                    profesional_id  = EXCLUDED.profesional_id
              `,
              [pkVal, tipo_examen_id, paciente_id, profesional_id]
            );
          } else {
            await client.query(
              `
              INSERT INTO public.examen (tipo_examen_id, paciente_id, profesional_id)
              VALUES ($1,$2,$3)
              RETURNING ${pkCol}
              `,
              [tipo_examen_id, paciente_id, profesional_id]
            );
          }
        } else {
          const tipo_examen = hasTipoTxt
            ? await resolveTipoExamenNombre(client, r.tipo_examen)
            : await resolveTipoExamenNombre(client, r.tipo_examen_id);
          if (!tipo_examen) throw new Error("No se pudo resolver tipo_examen (texto)");

          if (pkProvided) {
            await client.query(
              `
              INSERT INTO public.examen (${pkCol}, tipo_examen, paciente_id, profesional_id)
              VALUES ($1,$2,$3,$4)
              ON CONFLICT (${pkCol}) DO UPDATE
                SET tipo_examen   = EXCLUDED.tipo_examen,
                    paciente_id    = EXCLUDED.paciente_id,
                    profesional_id  = EXCLUDED.profesional_id
              `,
              [pkVal, tipo_examen, paciente_id, profesional_id]
            );
          } else {
            await client.query(
              `
              INSERT INTO public.examen (tipo_examen, paciente_id, profesional_id)
              VALUES ($1,$2,$3)
              RETURNING ${pkCol}
              `,
              [tipo_examen, paciente_id, profesional_id]
            );
          }
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
    console.log(`✅ Importación EXAMEN: OK=${ok}  Errores=${err}`);
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("❌ Error general:", e.message);
  } finally {
    client.release();
    await pool.end();
  }
})();
