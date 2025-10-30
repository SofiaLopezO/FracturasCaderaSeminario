const models = require("../model/initModels");
const { idParam } = require("./_crud");

async function list(req, res) { try { res.json(await models.Alerta.findAll({ order: [["alerta_id","DESC"]] })); } catch { res.status(500).json({ error: "Error al listar alertas" }); } }
async function getOne(req, res) { try {
  const id = idParam(req); if (!id) return res.status(400).json({ error: "id inválido" });
  const row = await models.Alerta.findByPk(id); if (!row) return res.status(404).json({ error: "No encontrado" }); res.json(row);
} catch { res.status(500).json({ error: "Error al obtener alerta" }); } }


async function create(req, res) { try {
  const { tipo, mensaje, indicador_id } = req.body;
  if (!tipo || !indicador_id) return res.status(400).json({ error: "tipo e indicador_id obligatorios" });
  const ind = await models.IndicadorRiesgo.findByPk(indicador_id); if (!ind) return res.status(400).json({ error: "indicador_id no existe" });
  const created = await models.Alerta.create({ tipo, mensaje, indicador_id });
  res.status(201).json(created);
} catch { res.status(500).json({ error: "Error al crear alerta" }); } }


async function update(req, res) { try {
  const id = idParam(req); if (!id) return res.status(400).json({ error: "id inválido" });
  const row = await models.Alerta.findByPk(id); if (!row) return res.status(404).json({ error: "No encontrado" });
  const { tipo, mensaje, indicador_id } = req.body;
  if (tipo !== undefined) row.tipo = tipo;
  if (mensaje !== undefined) row.mensaje = mensaje;
  if (indicador_id !== undefined) {
    const ind = await models.IndicadorRiesgo.findByPk(indicador_id); if (!ind) return res.status(400).json({ error: "indicador_id no existe" });
    row.indicador_id = indicador_id;
  }
  await row.save(); res.json(row);
} catch { res.status(500).json({ error: "Error al actualizar alerta" }); } }


async function remove(req, res) { try {
  const id = idParam(req); if (!id) return res.status(400).json({ error: "id inválido" });
  const row = await models.Alerta.findByPk(id); if (!row) return res.status(404).json({ error: "No encontrado" });
  await row.destroy(); res.status(204).send();
} catch { res.status(500).json({ error: "Error al eliminar alerta" }); } }

module.exports = { list, getOne, create, update, remove };
