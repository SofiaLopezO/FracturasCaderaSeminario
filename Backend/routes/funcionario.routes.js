// routes/funcionario.routes.js
const express = require('express');
const { auth } = require('../middleware/auth');

const c = require('../controller/funcionario.controller');
const router = express.Router();

router.get('/', auth(['ADMIN']), c.list);
router.get('/:user_id', auth(['ADMIN']), c.getOne);
router.post('/', auth(['ADMIN']), c.create);
router.put('/:user_id', auth(['ADMIN']), c.update);
router.delete('/:user_id', auth(['ADMIN']), c.remove);

module.exports = router;
