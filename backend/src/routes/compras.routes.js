const express = require('express')
const router  = express.Router()
const ctrl    = require('../controllers/compras.controller')
const { verificarToken } = require('../middlewares/auth.middleware')
const { validarCompra } = require('../validators')

router.use(verificarToken)

router.get('/',   ctrl.listar)
router.post('/',  validarCompra, ctrl.crear)

module.exports = router
