const { body } = require('express-validator');

const validarLogin = [
  body('email')
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('El email no tiene un formato válido'),

  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener mínimo 6 caracteres'),
];

module.exports = { validarLogin };