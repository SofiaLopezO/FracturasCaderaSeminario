const models = require("../model/initModels");
const { idParam } = require("./_crud");

async function list(req, res) { try { res.json(await models.IndicadorRiesgo.findAll({ order: [["indicador_id","DESC"]] })); } catch { res.status(500).json({ error: "Error al listar indicadores" }); } }
async function getOne(req, res) { try {
  const id = idParam(req); if (!id) return res.status(400).json({ error: "id inválido" });
  const row = await models.IndicadorRiesgo.findByPk(id); if (!row) return res.status(404).json({ error: "No encontrado" }); res.json(row);
} catch { res.status(500).json({ error: "Error al obtener indicador" }); } }
async function create(req, res) { try {
  const { descripcion, puntaje, resultado_id } = req.body;
  if (puntaje === undefined || !resultado_id) return res.status(400).json({ error: "puntaje y resultado_id obligatorios" });
  const r = await models.Resultado.findByPk(resultado_id); if (!r) return res.status(400).json({ error: "resultado_id no existe" });
  const created = await models.IndicadorRiesgo.create({ descripcion, puntaje, resultado_id });
  res.status(201).json(created);
} catch { res.status(500).json({ error: "Error al crear indicador" }); } }
async function update(req, res) { try {
  const id = idParam(req); if (!id) return res.status(400).json({ error: "id inválido" });
  const row = await models.IndicadorRiesgo.findByPk(id); if (!row) return res.status(404).json({ error: "No encontrado" });
  const { descripcion, puntaje, resultado_id } = req.body;
  if (descripcion !== undefined) row.descripcion = descripcion;
  if (puntaje !== undefined) row.puntaje = puntaje;
  if (resultado_id !== undefined) {
    const r = await models.Resultado.findByPk(resultado_id); if (!r) return res.status(400).json({ error: "resultado_id no existe" });
    row.resultado_id = resultado_id;
  }
  await row.save(); res.json(row);
} catch { res.status(500).json({ error: "Error al actualizar indicador" }); } }
async function remove(req, res) { try {
  const id = idParam(req); if (!id) return res.status(400).json({ error: "id inválido" });
  const row = await models.IndicadorRiesgo.findByPk(id); if (!row) return res.status(404).json({ error: "No encontrado" });
  await row.destroy(); res.status(204).send();
} catch { res.status(500).json({ error: "Error al eliminar indicador" }); } }

module.exports = { list, getOne, create, update, remove };
