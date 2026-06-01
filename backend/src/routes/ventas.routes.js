const express = require('express')
const router  = express.Router()
const pool    = require('../config/db')
const { verificarToken } = require('../middlewares/auth.middleware')

router.use(verificarToken)

// Listar ventas
router.get('/', async (req, res) => {
  try {
    const { estado } = req.query
    let sql = `
      SELECT v.id_venta, v.fecha, v.descuento_pct, v.total_bruto, v.total_neto,
             v.estado, v.metodo_pago, v.observaciones,
             c.nombre AS cliente, c.documento,
             u.nombre AS vendedor
      FROM ventas v
      JOIN clientes c ON c.id_cliente = v.id_cliente
      JOIN usuarios u ON u.id_usuario = v.id_usuario
      WHERE 1=1
    `
    const params = []
    if (estado) { sql += ' AND v.estado = ?'; params.push(estado) }
    sql += ' ORDER BY v.fecha DESC'
    const [rows] = await pool.query(sql, params)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Error al listar ventas' })
  }
})

// Obtener venta con detalle
router.get('/:id', async (req, res) => {
  try {
    const [venta] = await pool.query(`
      SELECT v.*, c.nombre AS cliente, c.documento, c.saldo_favor,
             u.nombre AS vendedor
      FROM ventas v
      JOIN clientes c ON c.id_cliente = v.id_cliente
      JOIN usuarios u ON u.id_usuario = v.id_usuario
      WHERE v.id_venta = ?
    `, [req.params.id])

    if (venta.length === 0) return res.status(404).json({ error: 'Venta no encontrada' })

    const [detalle] = await pool.query(`
      SELECT dv.*, var.talla, var.color, p.nombre AS producto, p.referencia
      FROM detalle_ventas dv
      JOIN variantes var ON var.id_variante = dv.id_variante
      JOIN productos p   ON p.id_producto   = var.id_producto
      WHERE dv.id_venta = ?
    `, [req.params.id])

    res.json({ ...venta[0], detalle })
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener venta' })
  }
})

// Crear venta
router.post('/', async (req, res) => {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const { id_cliente, descuento_pct = 0, metodo_pago = 'efectivo', items, observaciones } = req.body

    if (descuento_pct > 50) throw { status: 400, message: 'El descuento no puede superar el 50%' }
    if (!items || items.length === 0) throw { status: 400, message: 'La venta debe tener al menos un producto' }

    let total_bruto = 0
    const validados = []

    for (const item of items) {
      const { id_variante, cantidad, precio_venta } = item
      const [varRows] = await conn.query(
        'SELECT * FROM variantes WHERE id_variante = ? AND activa = 1 FOR UPDATE',
        [id_variante]
      )

      if (varRows.length === 0) throw { status: 404, message: `Variante ${id_variante} no encontrada` }
      const variante = varRows[0]

      if (variante.stock < cantidad) throw {
        status: 400,
        message: `Stock insuficiente para ${variante.talla}/${variante.color}. Disponible: ${variante.stock}`
      }
      if (precio_venta < variante.precio_costo) throw {
        status: 400,
        message: `El precio de venta no puede ser menor al costo ($${variante.precio_costo})`
      }

      total_bruto += cantidad * precio_venta
      validados.push({ id_variante, cantidad, precio_venta })
    }

    // Si el método es saldo_favor verificar que el cliente tenga saldo
    if (metodo_pago === 'saldo_favor') {
      const [cliente] = await conn.query('SELECT saldo_favor FROM clientes WHERE id_cliente = ?', [id_cliente])
      const total_neto_calc = total_bruto * (1 - descuento_pct / 100)
      if (cliente[0].saldo_favor < total_neto_calc) throw {
        status: 400,
        message: `Saldo insuficiente. El cliente tiene $${cliente[0].saldo_favor} disponible`
      }
      // Descontar saldo
      await conn.query(
        'UPDATE clientes SET saldo_favor = saldo_favor - ? WHERE id_cliente = ?',
        [total_neto_calc, id_cliente]
      )
    }

    const total_neto = total_bruto * (1 - descuento_pct / 100)

    const [result] = await conn.query(
      `INSERT INTO ventas (id_cliente, id_usuario, descuento_pct, total_bruto, total_neto, metodo_pago, observaciones)
       VALUES (?,?,?,?,?,?,?)`,
      [id_cliente, req.usuario.id_usuario, descuento_pct, total_bruto, total_neto, metodo_pago, observaciones]
    )

    const id_venta = result.insertId

    for (const item of validados) {
      await conn.query(
        'INSERT INTO detalle_ventas (id_venta, id_variante, cantidad, precio_venta) VALUES (?,?,?,?)',
        [id_venta, item.id_variante, item.cantidad, item.precio_venta]
      )
      await conn.query(
        'UPDATE variantes SET stock = stock - ? WHERE id_variante = ?',
        [item.cantidad, item.id_variante]
      )
    }

    await conn.commit()
    res.status(201).json({ id_venta, total_bruto, total_neto, mensaje: 'Venta registrada exitosamente' })
  } catch (err) {
    await conn.rollback()
    if (err.status) return res.status(err.status).json({ error: err.message })
    console.error(err)
    res.status(500).json({ error: 'Error al registrar venta' })
  } finally {
    conn.release()
  }
})

// Actualizar estado del pedido
router.put('/:id/estado', async (req, res) => {
  const { estado } = req.body
  const estadosValidos = ['confirmada', 'en_entrega', 'entregada', 'anulada']
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ error: 'Estado no válido' })
  }
  try {
    await pool.query('UPDATE ventas SET estado = ? WHERE id_venta = ?', [estado, req.params.id])
    res.json({ mensaje: `Estado actualizado a: ${estado}` })
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar estado' })
  }
})

// Anular venta y restaurar stock
router.put('/:id/anular', async (req, res) => {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const [venta] = await conn.query('SELECT * FROM ventas WHERE id_venta = ?', [req.params.id])
    if (venta.length === 0) return res.status(404).json({ error: 'Venta no encontrada' })
    if (venta[0].estado === 'anulada') return res.status(400).json({ error: 'La venta ya está anulada' })

    const [detalle] = await conn.query('SELECT * FROM detalle_ventas WHERE id_venta = ?', [req.params.id])
    for (const item of detalle) {
      await conn.query(
        'UPDATE variantes SET stock = stock + ? WHERE id_variante = ?',
        [item.cantidad, item.id_variante]
      )
    }

    // Si era saldo a favor devolver el saldo
    if (venta[0].metodo_pago === 'saldo_favor') {
      await conn.query(
        'UPDATE clientes SET saldo_favor = saldo_favor + ? WHERE id_cliente = ?',
        [venta[0].total_neto, venta[0].id_cliente]
      )
    }

    await conn.query("UPDATE ventas SET estado = 'anulada' WHERE id_venta = ?", [req.params.id])
    await conn.commit()
    res.json({ mensaje: 'Venta anulada y stock restaurado' })
  } catch (err) {
    await conn.rollback()
    res.status(500).json({ error: 'Error al anular venta' })
  } finally {
    conn.release()
  }
})

// Agregar saldo a favor a un cliente
router.post('/saldo-favor', async (req, res) => {
  const { id_cliente, monto } = req.body
  if (!id_cliente || !monto || monto <= 0) {
    return res.status(400).json({ error: 'Cliente y monto válido son obligatorios' })
  }
  try {
    await pool.query(
      'UPDATE clientes SET saldo_favor = saldo_favor + ? WHERE id_cliente = ?',
      [monto, id_cliente]
    )
    res.json({ mensaje: `Saldo de $${monto} agregado exitosamente` })
  } catch (err) {
    res.status(500).json({ error: 'Error al agregar saldo' })
  }
})

module.exports = router