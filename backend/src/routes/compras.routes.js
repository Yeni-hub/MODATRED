const express = require('express')
const router  = express.Router()
const pool    = require('../config/db')
const { verificarToken } = require('../middlewares/auth.middleware')

router.use(verificarToken)

router.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.id_compra, c.fecha, c.total, c.observaciones,
             p.nombre AS proveedor, u.nombre AS usuario
      FROM compras c
      JOIN proveedores p ON p.id_proveedor = c.id_proveedor
      JOIN usuarios u    ON u.id_usuario   = c.id_usuario
      ORDER BY c.fecha DESC
    `)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Error al listar compras' })
  }
})

router.post('/', async (req, res) => {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const { id_proveedor, items, observaciones } = req.body
    let total = 0

    for (const item of items) total += item.cantidad * item.precio_costo

    const [result] = await conn.query(
      'INSERT INTO compras (id_proveedor, id_usuario, total, observaciones) VALUES (?,?,?,?)',
      [id_proveedor, req.usuario.id_usuario, total, observaciones]
    )

    const id_compra = result.insertId

    for (const item of items) {
      await conn.query(
        'INSERT INTO detalle_compras (id_compra, id_variante, cantidad, precio_costo) VALUES (?,?,?,?)',
        [id_compra, item.id_variante, item.cantidad, item.precio_costo]
      )
      await conn.query(
        'UPDATE variantes SET stock = stock + ?, precio_costo = ? WHERE id_variante = ?',
        [item.cantidad, item.precio_costo, item.id_variante]
      )
    }

    await conn.commit()
    res.status(201).json({ id_compra, total, mensaje: 'Compra registrada y stock actualizado' })
  } catch (err) {
    await conn.rollback()
    res.status(500).json({ error: 'Error al registrar compra' })
  } finally {
    conn.release()
  }
})

module.exports = router