const express    = require('express')
const router     = express.Router()
const ctrl       = require('../controllers/productos.controller')
const { verificarToken } = require('../middlewares/auth.middleware')

router.use(verificarToken) // todas las rutas requieren token

router.get('/',     ctrl.listar)
router.get('/:id',  ctrl.obtener)
router.post('/',    ctrl.crear)
router.put('/:id',  ctrl.actualizar)
router.delete('/:id', ctrl.eliminar)

module.exports = router