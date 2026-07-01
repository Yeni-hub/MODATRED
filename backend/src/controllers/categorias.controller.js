const pool = require('../config/db')

const listar = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id_categoria, nombre, descripcion FROM categorias ORDER BY nombre'
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Error al listar categorías' })
  }
}

const crear = async (req, res) => {
  const { nombre, descripcion } = req.body
  try {
    const [result] = await pool.query(
      'INSERT INTO categorias (nombre, descripcion) VALUES (?,?)',
      [nombre, descripcion || null]
    )
    res.status(201).json({ id_categoria: result.insertId, mensaje: 'Categoría creada' })
  } catch (err) {
    res.status(500).json({ error: 'Error al crear categoría' })
  }
}

const actualizar = async (req, res) => {
  const { nombre, descripcion } = req.body
  try {
    const [exist] = await pool.query('SELECT id_categoria FROM categorias WHERE id_categoria = ?', [req.params.id])
    if (exist.length === 0) return res.status(404).json({ error: 'Categoría no encontrada' })

    await pool.query(
      'UPDATE categorias SET nombre=?, descripcion=? WHERE id_categoria=?',
      [nombre, descripcion || null, req.params.id]
    )
    res.json({ mensaje: 'Categoría actualizada' })
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar categoría' })
  }
}

const eliminar = async (req, res) => {
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
}

module.exports = { listar, crear, actualizar, eliminar }
