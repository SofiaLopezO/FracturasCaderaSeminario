const express = require('express');
const { auth } = require('../middleware/auth');
const ctrl = require('../controller/perfil.controller');

const router = express.Router();

router.get('/', auth(), ctrl.me);

module.exports = router;
