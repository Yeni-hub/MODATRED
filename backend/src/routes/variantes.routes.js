const express = require('express')
const router  = express.Router()
const ctrl    = require('../controllers/variantes.controller')
const { verificarToken } = require('../middlewares/auth.middleware')
const { validarVariante } = require('../validators')

router.use(verificarToken)

router.get('/',     ctrl.listar)
router.post('/',    validarVariante, ctrl.crear)
router.put('/:id',  validarVariante, ctrl.actualizar)
router.delete('/:id', ctrl.eliminar)

module.exports = router
