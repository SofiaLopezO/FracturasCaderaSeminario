// routes/auth.js
const express = require('express');
const { login, logout, me } = require('../controller/login');
const { registerPaciente, verifyEmail } = require('../controller/register');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);    
router.get('/me', auth(), me);   
router.post('/register', registerPaciente);
router.get('/verify', verifyEmail);

module.exports = router;
