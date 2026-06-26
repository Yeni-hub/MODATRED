const express    = require('express')
const router     = express.Router()
const ctrl       = require('../controllers/productos.controller')
const { verificarToken } = require('../middlewares/auth.middleware')
const { validarProducto } = require('../validators')

router.use(verificarToken)

router.get('/',     ctrl.listar)
router.get('/:id',  ctrl.obtener)
router.post('/',    validarProducto, ctrl.crear)
router.put('/:id',  validarProducto, ctrl.actualizar)
router.delete('/:id', ctrl.eliminar)

module.exports = router