const express    = require('express');
const router     = express.Router();
const { login, me, logout }  = require('../controllers/auth.controller');
const { validarLogin } = require('../validators/auth.validator');
const { verificarToken } = require('../middlewares/auth.middleware');

router.post('/login', validarLogin, login);
router.get('/me', verificarToken, me);
router.post('/logout', logout);

module.exports = router;