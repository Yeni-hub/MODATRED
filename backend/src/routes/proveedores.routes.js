const express = require('express')
const router  = express.Router()
const ctrl    = require('../controllers/proveedores.controller')
const { verificarToken } = require('../middlewares/auth.middleware')
const { validarProveedor } = require('../validators')

router.use(verificarToken)

router.get('/',     ctrl.listar)
router.post('/',    validarProveedor, ctrl.crear)
router.put('/:id',  validarProveedor, ctrl.actualizar)
router.delete('/:id', ctrl.eliminar)

module.exports = router
