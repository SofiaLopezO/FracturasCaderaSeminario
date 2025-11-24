const express = require('express');
const { auth } = require('../middleware/auth');
const paciente = require('../controller/paciente.controller');

const router = express.Router();

router.get('/search', auth(), paciente.search);
router.get('/', auth(), paciente.list);
router.get('/:user_id/datos', auth(), paciente.datosPaciente);
router.get('/:user_id/detalles', auth(), paciente.getDetalles);
router.get('/:user_id/resumen', auth(), paciente.getResumen);
router.get('/:user_id', auth(), paciente.getOne);
router.post('/', auth(), paciente.create);
router.put('/:user_id', auth(), paciente.update);
router.delete('/:user_id', auth(), paciente.remove);

module.exports = router;
