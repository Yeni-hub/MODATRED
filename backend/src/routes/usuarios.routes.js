const express = require('express')
const router  = express.Router()
const ctrl    = require('../controllers/usuarios.controller')
const { verificarToken, soloAdmin } = require('../middlewares/auth.middleware')
const { validarUsuario } = require('../validators')

router.use(verificarToken)
router.use(soloAdmin)

router.get('/',     ctrl.listar)
router.post('/',    validarUsuario, ctrl.crear)
router.put('/:id',  validarUsuario, ctrl.actualizar)

module.exports = router
