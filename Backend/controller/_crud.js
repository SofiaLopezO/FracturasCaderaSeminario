// controller/_crud.js
function idParam(req) {
  const n = Number(req.params.id);
  return Number.isNaN(n) ? null : n;
}

function okOr404(row, res) {
  if (!row) return res.status(404).json({ error: "No encontrado" });
  return res.json(row);
}

module.exports = { idParam, okOr404 };
