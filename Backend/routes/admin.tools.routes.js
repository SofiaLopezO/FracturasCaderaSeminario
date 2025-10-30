// routes/admin.tools.routes.js
const express = require('express');
const { auth } = require('../middleware/auth');
const { backfillEdades } = require('../controller/admin.tools');

const router = express.Router();
router.post('/backfill/edades', auth(['ADMIN']), backfillEdades);
module.exports = router;
