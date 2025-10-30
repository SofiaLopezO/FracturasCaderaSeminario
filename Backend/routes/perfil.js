const express = require('express');
const { auth } = require('../middleware/auth');
const ctrl = require('../controller/perfil.controller');

const router = express.Router();

// ✅ Ruta relativa: quedará /api/v1/perfil
router.get('/', auth(), ctrl.me);

module.exports = router;
