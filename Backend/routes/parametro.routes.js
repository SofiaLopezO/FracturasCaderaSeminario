const express = require('express');
const router = express.Router();
const c = require('../controller/parametro.controller');

router.get('/catalogo', c.catalogo);

router.get('/', c.list);
router.get('/:id', c.getOne);
router.post('/', c.create);
router.put('/:id', c.update);
router.delete('/:id', c.remove);

module.exports = router;
