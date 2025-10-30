const express = require('express');
const controller = require('../controller/public.controller');

const router = express.Router();

router.get('/dashboard', controller.dashboard);

module.exports = router;
