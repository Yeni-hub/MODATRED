const express = require('express')
const router  = express.Router()
const ctrl    = require('../controllers/categorias.controller')
const { verificarToken } = require('../middlewares/auth.middleware')
const { validarCategoria } = require('../validators')

router.use(verificarToken)

router.get('/',     ctrl.listar)
router.post('/',    validarCategoria, ctrl.crear)
router.put('/:id',  validarCategoria, ctrl.actualizar)
router.delete('/:id', ctrl.eliminar)

module.exports = router
