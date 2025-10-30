const models = require("../model/initModels");
const { idParam, okOr404 } = require("./_crud");

async function list(req, res) {
  try {
    const rows = await models.User.findAll({ order: [["id", "DESC"]] });
    res.json(rows);
  } catch (e) { res.status(500).json({ error: "Error al listar usuarios" }); }
}

async function getOne(req, res) {
  try {
    const id = idParam(req); if (!id) return res.status(400).json({ error: "id inválido" });
    const row = await models.User.findByPk(id);
    return okOr404(row, res);
  } catch (e) { res.status(500).json({ error: "Error al obtener usuario" }); }
}

async function create(req, res) {
  try {
    const { rut, nombre, correo, password_hash, sexo, fecha_nacimiento } = req.body;
    if (!rut || !nombre || !correo || !password_hash) {
      return res.status(400).json({ error: "rut, nombre, correo, password_hash son obligatorios" });
    }
    const created = await models.User.create({
      rut, nombre, correo, password_hash, sexo, fecha_nacimiento
    });
    res.status(201).json(created);
  } catch (e) {
    if (e?.name === "SequelizeUniqueConstraintError")
      return res.status(409).json({ error: "rut o correo ya existen" });
    res.status(500).json({ error: "Error al crear usuario" });
  }
}

async function update(req, res) {
  try {
    const id = idParam(req); if (!id) return res.status(400).json({ error: "id inválido" });
    const row = await models.User.findByPk(id); if (!row) return res.status(404).json({ error: "No encontrado" });

    const { rut, nombre, correo, password_hash, sexo, fecha_nacimiento } = req.body;
    if (rut !== undefined) row.rut = rut;
    if (nombre !== undefined) row.nombre = nombre;
    if (correo !== undefined) row.correo = correo;
    if (password_hash !== undefined) row.password_hash = password_hash;
    if (sexo !== undefined) row.sexo = sexo;
    if (fecha_nacimiento !== undefined) row.fecha_nacimiento = fecha_nacimiento;

    await row.save();
    res.json(row);
  } catch (e) {
    if (e?.name === "SequelizeUniqueConstraintError")
      return res.status(409).json({ error: "rut o correo ya existen" });
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
}

async function remove(req, res) {
  try {
    const id = idParam(req); if (!id) return res.status(400).json({ error: "id inválido" });
    const row = await models.User.findByPk(id); if (!row) return res.status(404).json({ error: "No encontrado" });
    await row.destroy();
    res.status(204).send();
  } catch (e) { res.status(500).json({ error: "Error al eliminar usuario" }); }
}

module.exports = { list, getOne, create, update, remove };
