const express = require('express')
const router  = express.Router()
const ctrl    = require('../controllers/colecciones.controller')
const { verificarToken } = require('../middlewares/auth.middleware')
const { validarColeccion } = require('../validators')

router.use(verificarToken)

router.get('/',     ctrl.listar)
router.post('/',    validarColeccion, ctrl.crear)
router.put('/:id',  validarColeccion, ctrl.actualizar)
router.delete('/:id', ctrl.eliminar)

module.exports = router
