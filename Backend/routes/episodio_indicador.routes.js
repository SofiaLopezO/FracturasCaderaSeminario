const express = require('express');
const router = express.Router();
const c = require('../controller/episodio_indicador.controller');

router.get('/', c.list);
router.get('/:id', c.getOne);
router.post('/', c.create);
router.put('/:id', c.update);
router.delete('/:id', c.remove);
router.post('/episodio/:episodioId/recalcular', c.recalculate);
router.post('/control/:controlId/recalcular', c.recalculate);

module.exports = router;
