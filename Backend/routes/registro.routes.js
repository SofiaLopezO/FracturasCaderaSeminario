// routes/registro.routes.js
const express = require('express');
const { auth } = require('../middleware/auth');
const ctrl = require('../controller/registro.controller');

const router = express.Router();

router.get('/',       auth(['ADMIN']), ctrl.list);
router.get('/:id',    auth(['ADMIN']), ctrl.getOne);
router.post('/',      auth(['ADMIN']), ctrl.create);
router.put('/:id',    auth(['ADMIN']), ctrl.update);
router.delete('/:id', auth(['ADMIN']), ctrl.remove);

module.exports = router;
