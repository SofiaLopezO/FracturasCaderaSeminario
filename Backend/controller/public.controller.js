const { sequelize } = require('../model/initModels');

const MONTH_LABELS = [
    'Ene',
    'Feb',
    'Mar',
    'Abr',
    'May',
    'Jun',
    'Jul',
    'Ago',
    'Sep',
    'Oct',
    'Nov',
    'Dic',
];

function monthToLabel(monthNumber) {
    const idx = Number(monthNumber) - 1;
    return MONTH_LABELS[idx] ?? `M${monthNumber}`;
}

function mapTipoFracturaName(tipo) {
    if (!tipo) return 'Desconocido';
    const friendly = String(tipo)
        .toLowerCase()
        .replace(/_/g, ' ')
        .replace(/\b[a-z]/g, (char) => char.toUpperCase());
    return `Fracturas ${friendly}`;
}

async function dashboard(_req, res) {
    try {
        const [monthlyRows] = await sequelize.query(`
      SELECT
        EXTRACT(YEAR FROM u.fecha_creacion)::INT AS year,
        EXTRACT(MONTH FROM u.fecha_creacion)::INT AS month,
        COUNT(DISTINCT e.episodio_id)::INT AS total
      FROM users u
      INNER JOIN pacientes p ON u.id = p.user_id
      INNER JOIN episodio e ON p.user_id = e.paciente_id
      WHERE u.fecha_creacion IS NOT NULL
      GROUP BY year, month
      ORDER BY year ASC, month ASC;
    `);

        const [distributionRows] = await sequelize.query(`
      SELECT
        e.tipo_fractura AS tipo,
        COUNT(DISTINCT e.episodio_id)::INT AS total
      FROM users u
      INNER JOIN pacientes p ON u.id = p.user_id
      INNER JOIN episodio e ON p.user_id = e.paciente_id
      WHERE e.tipo_fractura IS NOT NULL
      GROUP BY e.tipo_fractura
      ORDER BY e.tipo_fractura;
    `);

        const yearsSet = new Set();
        const series = {};
        const totalsByYear = {};

        for (const row of monthlyRows) {
            const year = Number(row.year);
            const month = Number(row.month);
            const total = Number(row.total);
            if (!Number.isFinite(year) || !Number.isFinite(month)) continue;

            yearsSet.add(year);

            if (!series[year]) series[year] = [];
            series[year].push({ mes: monthToLabel(month), total });

            totalsByYear[year] = (totalsByYear[year] ?? 0) + total;
        }
        
        for (const yearKey of Object.keys(series)) {
            series[yearKey].sort(
                (a, b) =>
                    MONTH_LABELS.indexOf(a.mes) - MONTH_LABELS.indexOf(b.mes)
            );
        }

        const years = Array.from(yearsSet).sort((a, b) => a - b);

        const distribution = distributionRows.map((row) => {
            const raw = row.tipo;
            const count = Number(row.total) ?? 0;
            return {
                name: mapTipoFracturaName(raw),
                raw,
                value: count,
            };
        });

        res.json({
            years,
            series,
            totalsByYear,
            distribution,
            updatedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error('public.dashboard error', error);
        res.status(500).json({ error: 'Error al obtener datos públicos' });
    }
}

module.exports = { dashboard };
