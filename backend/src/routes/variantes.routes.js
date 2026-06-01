const express = require('express')
const router  = express.Router()
const pool    = require('../config/db')
const { verificarToken } = require('../middlewares/auth.middleware')

router.use(verificarToken)

// Listar todas o por producto
router.get('/', async (req, res) => {
  try {
    const { id_producto } = req.query
    let sql = `
      SELECT v.*, p.nombre AS producto, p.referencia
      FROM variantes v
      JOIN productos p ON p.id_producto = v.id_producto
      WHERE v.activa = 1
    `
    const params = []
    if (id_producto) { sql += ' AND v.id_producto = ?'; params.push(id_producto) }
    sql += ' ORDER BY p.nombre, v.talla, v.color'
    const [rows] = await pool.query(sql, params)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Error al listar variantes' })
  }
})

// Crear
router.post('/', async (req, res) => {
  const { id_producto, talla, color, stock, precio_costo } = req.body
  if (!id_producto || !talla || !color) return res.status(400).json({ error: 'Campos obligatorios incompletos' })
  try {
    const [result] = await pool.query(
      'INSERT INTO variantes (id_producto, talla, color, stock, precio_costo) VALUES (?,?,?,?,?)',
      [id_producto, talla, color, stock || 0, precio_costo || 0]
    )
    res.status(201).json({ id_variante: result.insertId, mensaje: 'Variante creada' })
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Ya existe esta combinación de talla y color' })
    res.status(500).json({ error: 'Error al crear variante' })
  }
})

// Actualizar
router.put('/:id', async (req, res) => {
  const { talla, color, stock, precio_costo } = req.body
  try {
    await pool.query(
      'UPDATE variantes SET talla=?, color=?, stock=?, precio_costo=? WHERE id_variante=?',
      [talla, color, stock, precio_costo, req.params.id]
    )
    res.json({ mensaje: 'Variante actualizada' })
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar variante' })
  }
})

// Desactivar (no eliminar si tiene ventas)
router.delete('/:id', async (req, res) => {
  try {
    const [ventas] = await pool.query(
      'SELECT COUNT(*) AS total FROM detalle_ventas WHERE id_variante = ?',
      [req.params.id]
    )
    if (ventas[0].total > 0) {
      await pool.query('UPDATE variantes SET activa = 0 WHERE id_variante = ?', [req.params.id])
      return res.json({ mensaje: 'Variante desactivada (tiene ventas registradas)' })
    }
    await pool.query('DELETE FROM variantes WHERE id_variante = ?', [req.params.id])
    res.json({ mensaje: 'Variante eliminada' })
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar variante' })
  }
})

module.exports = router