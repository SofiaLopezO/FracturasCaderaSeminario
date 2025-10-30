const express = require('express');
const router = express.Router();
const c = require('../controller/parametro.controller');

// Catálogo agrupado por tipo de examen y tipo de muestra
router.get('/catalogo', c.catalogo);

router.get('/', c.list);
router.get('/:id', c.getOne);
router.post('/', c.create);
router.put('/:id', c.update);
router.delete('/:id', c.remove);

module.exports = router;
