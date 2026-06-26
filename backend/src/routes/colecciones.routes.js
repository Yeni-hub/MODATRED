const express = require('express')
const router  = express.Router()
const pool    = require('../config/db')
const { verificarToken } = require('../middlewares/auth.middleware')
const { validarColeccion } = require('../validators')

router.use(verificarToken)

router.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id_coleccion, nombre, temporada, anio, archivada, descripcion, creado_en FROM colecciones ORDER BY anio DESC'
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Error al listar colecciones' })
  }
})

router.post('/', validarColeccion, async (req, res) => {
  const { nombre, temporada, anio, descripcion } = req.body
  try {
    const [result] = await pool.query(
      'INSERT INTO colecciones (nombre, temporada, anio, descripcion) VALUES (?,?,?,?)',
      [nombre, temporada, anio, descripcion]
    )
    res.status(201).json({ id_coleccion: result.insertId, mensaje: 'Colección creada' })
  } catch (err) {
    res.status(500).json({ error: 'Error al crear colección' })
  }
})

router.put('/:id', validarColeccion, async (req, res) => {
  const { nombre, temporada, anio, descripcion, archivada } = req.body
  try {
    await pool.query(
      'UPDATE colecciones SET nombre=?, temporada=?, anio=?, descripcion=?, archivada=? WHERE id_coleccion=?',
      [nombre, temporada, anio, descripcion, archivada ?? 0, req.params.id]
    )
    res.json({ mensaje: 'Colección actualizada' })
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar colección' })
  }
})

// Eliminar
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('UPDATE colecciones SET archivada = 1 WHERE id_coleccion = ?', [req.params.id])
    res.json({ mensaje: 'Colección archivada' })
  } catch (err) {
    res.status(500).json({ error: 'Error al archivar colección' })
  }
})

module.exports = router