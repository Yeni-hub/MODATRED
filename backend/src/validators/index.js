const { body, param, query, validationResult } = require('express-validator')

const handleErrors = (req, res, next) => {
  const errores = validationResult(req)
  if (!errores.isEmpty()) {
    return res.status(422).json({
      error: 'Datos inválidos',
      detalles: errores.array().map(e => ({ campo: e.path, mensaje: e.msg })),
    })
  }
  next()
}

const validarProducto = [
  body('referencia').trim().notEmpty().withMessage('La referencia es obligatoria'),
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
  body('precio_base').isFloat({ min: 0 }).withMessage('El precio base debe ser un número positivo'),
  body('id_categoria').isInt({ min: 1 }).withMessage('La categoría es obligatoria'),
  body('id_coleccion').isInt({ min: 1 }).withMessage('La colección es obligatoria'),
  handleErrors,
]

const validarCategoria = [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
  handleErrors,
]

const validarColeccion = [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
  body('temporada').isIn(['primavera-verano', 'otoño-invierno', 'crucero', 'resort'])
    .withMessage('Temporada no válida'),
  body('anio').isInt({ min: 2000, max: 2100 }).withMessage('Año no válido'),
  handleErrors,
]

const validarVariante = [
  body('id_producto').isInt({ min: 1 }).withMessage('El producto es obligatorio'),
  body('talla').trim().notEmpty().withMessage('La talla es obligatoria'),
  body('color').trim().notEmpty().withMessage('El color es obligatorio'),
  body('stock').optional().isInt({ min: 0 }).withMessage('El stock debe ser un número positivo'),
  body('precio_costo').optional().isFloat({ min: 0 }).withMessage('El precio costo debe ser positivo'),
  handleErrors,
]

const validarProveedor = [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
  body('email').optional({ values: 'falsy' }).isEmail().withMessage('El email no es válido'),
  body('telefono').optional({ values: 'falsy' }).matches(/^\d+$/).withMessage('El teléfono solo debe contener números'),
  handleErrors,
]

const validarCliente = [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
  body('documento').trim().notEmpty().matches(/^\d+$/).withMessage('El documento debe contener solo números'),
  body('tipo_doc').optional().isIn(['CC', 'CE', 'NIT', 'PAS']).withMessage('Tipo documento no válido'),
  body('email').optional({ values: 'falsy' }).isEmail().withMessage('El email no es válido'),
  body('telefono').optional({ values: 'falsy' }).matches(/^\d+$/).withMessage('El teléfono solo debe contener números'),
  handleErrors,
]

const validarVenta = [
  body('id_cliente').isInt({ min: 1 }).withMessage('El cliente es obligatorio'),
  body('metodo_pago').isIn(['efectivo', 'tarjeta', 'credito', 'saldo_favor']).withMessage('Método de pago no válido'),
  body('descuento_pct').optional().isFloat({ min: 0, max: 50 }).withMessage('El descuento debe ser entre 0 y 50'),
  body('items').isArray({ min: 1 }).withMessage('La venta debe tener al menos un producto'),
  body('items.*.id_variante').isInt({ min: 1 }).withMessage('Variante inválida'),
  body('items.*.cantidad').isInt({ min: 1 }).withMessage('Cantidad debe ser mayor a 0'),
  body('items.*.precio_venta').isFloat({ min: 0 }).withMessage('Precio de venta inválido'),
  handleErrors,
]

const validarCompra = [
  body('id_proveedor').isInt({ min: 1 }).withMessage('El proveedor es obligatorio'),
  body('items').isArray({ min: 1 }).withMessage('La compra debe tener al menos un producto'),
  body('items.*.id_variante').isInt({ min: 1 }).withMessage('Variante inválida'),
  body('items.*.cantidad').isInt({ min: 1 }).withMessage('Cantidad debe ser mayor a 0'),
  body('items.*.precio_costo').isFloat({ min: 0 }).withMessage('Precio costo inválido'),
  handleErrors,
]

const validarUsuario = [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
  body('email').isEmail().withMessage('El email no es válido'),
  body('password').optional({ values: 'falsy' })
    .isLength({ min: 6 }).withMessage('La contraseña debe tener mínimo 6 caracteres'),
  body('rol').optional().isIn(['admin', 'vendedor']).withMessage('Rol no válido'),
  handleErrors,
]

const validarEstadoVenta = [
  body('estado').isIn(['confirmada', 'en_entrega', 'entregada', 'anulada'])
    .withMessage('Estado no válido'),
  handleErrors,
]

const validarSaldoFavor = [
  body('id_cliente').isInt({ min: 1 }).withMessage('El cliente es obligatorio'),
  body('monto').isFloat({ min: 0.01 }).withMessage('El monto debe ser mayor a 0'),
  handleErrors,
]

module.exports = {
  validarProducto,
  validarCategoria,
  validarColeccion,
  validarVariante,
  validarProveedor,
  validarCliente,
  validarVenta,
  validarCompra,
  validarUsuario,
  validarEstadoVenta,
  validarSaldoFavor,
}