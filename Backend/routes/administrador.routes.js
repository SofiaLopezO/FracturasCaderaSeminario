const express = require("express");
const router = express.Router();
const c = require("../controller/administrador.controller");

router.get("/", c.list);
router.get("/:user_id", c.getOne);
router.post("/", c.create);
router.put("/:user_id", c.update);
router.delete("/:user_id", c.remove);

module.exports = router;
