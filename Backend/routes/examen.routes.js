const express = require('express');
const router = express.Router();
const c = require('../controller/examen.controller');
const { auth } = require('../middleware/auth');

router.get('/', c.list);
router.get('/paciente/:paciente_id', c.listByPaciente);
router.get('/:id/muestras', c.downloadMuestras);
router.get('/:id', c.getOne);
router.post('/', c.create);
router.post('/complete', auth([ 'TECNOLOGO']), c.createComplete);
router.put('/:id', c.update);
router.delete('/:id', c.remove);

module.exports = router;
