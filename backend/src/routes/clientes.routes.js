const express = require('express')
const router  = express.Router()
const ctrl    = require('../controllers/clientes.controller')
const { verificarToken } = require('../middlewares/auth.middleware')
const { validarCliente } = require('../validators')

router.use(verificarToken)

router.get('/',     ctrl.listar)
router.post('/',    validarCliente, ctrl.crear)
router.put('/:id',  validarCliente, ctrl.actualizar)
router.delete('/:id', ctrl.eliminar)

module.exports = router
