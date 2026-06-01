const express    = require('express');
const router     = express.Router();
const { login }  = require('../controllers/auth.controller');
const { validarLogin } = require('../validators/auth.validator');

// POST /api/auth/login
router.post('/login', validarLogin, login);

module.exports = router;