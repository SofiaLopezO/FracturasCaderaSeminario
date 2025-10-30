const express = require('express');
const { auth } = require('../middleware/auth');
const paciente = require('../controller/paciente.controller');

const router = express.Router();

// ✅ RUTAS RELATIVAS (el prefijo /pacientes lo pone initRoutes)
router.get('/search', auth(), paciente.search);
router.get('/', auth(), paciente.list);
// Datos básicos del paciente (nombre, rut, fecha_nacimiento, tipo_sangre, edad)
router.get('/:user_id/datos', auth(), paciente.datosPaciente);
// Detalles del paciente (incluye exámenes, muestras, resultados, indicadores, alertas y minutas según rol)
router.get('/:user_id/detalles', auth(), paciente.getDetalles);
// Resumen clínico consolidado del paciente (consulta integral)
router.get('/:user_id/resumen', auth(), paciente.getResumen);
router.get('/:user_id', auth(), paciente.getOne);
router.post('/', auth(), paciente.create);
router.put('/:user_id', auth(), paciente.update);
router.delete('/:user_id', auth(), paciente.remove);

module.exports = router;
