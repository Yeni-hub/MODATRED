const express = require('express')
const router  = express.Router()
const pool    = require('../config/db')
const { verificarToken } = require('../middlewares/auth.middleware')

router.use(verificarToken)

router.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categorias ORDER BY nombre')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Error al listar categorías' })
  }
})

router.post('/', async (req, res) => {
  const { nombre, descripcion } = req.body
  if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' })
  try {
    const [result] = await pool.query(
      'INSERT INTO categorias (nombre, descripcion) VALUES (?,?)',
      [nombre, descripcion || null]
    )
    res.status(201).json({ id_categoria: result.insertId, mensaje: 'Categoría creada' })
  } catch (err) {
    res.status(500).json({ error: 'Error al crear categoría' })
  }
})

router.put('/:id', async (req, res) => {
  const { nombre, descripcion } = req.body
  if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' })
  try {
    await pool.query(
      'UPDATE categorias SET nombre=?, descripcion=? WHERE id_categoria=?',
      [nombre, descripcion || null, req.params.id]
    )
    res.json({ mensaje: 'Categoría actualizada' })
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar categoría' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const [productos] = await pool.query('SELECT COUNT(*) AS total FROM productos WHERE id_categoria = ?', [req.params.id])
    if (productos[0].total > 0) {
      return res.status(400).json({ error: 'No se puede eliminar: hay productos asociados a esta categoría' })
    }
    await pool.query('DELETE FROM categorias WHERE id_categoria = ?', [req.params.id])
    res.json({ mensaje: 'Categoría eliminada' })
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar categoría' })
  }
})

module.exports = router