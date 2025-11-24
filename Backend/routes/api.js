const express = require('express');
const { auth } = require('../middleware/auth');

const controladorMinutas = require('../controller/minuta.controller');
const controladorExamen  = require('../controller/examen.controller');
const controladorAlertas = require('../controller/alerta.controller');

const router = express.Router();

router.get('/perfil', auth(), (req, res) => res.json({ me: req.user }));

router.get('/admin/dashboard', auth(['ADMIN']), controladorMinutas.dashboard);

router.post('/examenes', auth(['TECNOLOGO', 'FUNCIONARIO']), controladorExamen.create);

router.get('/alertas', auth(['INVESTIGADOR']), controladorAlertas.listar);

module.exports = router;
