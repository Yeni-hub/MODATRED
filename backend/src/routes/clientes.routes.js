const express = require('express')
const router  = express.Router()
const pool    = require('../config/db')
const { verificarToken } = require('../middlewares/auth.middleware')

router.use(verificarToken)

router.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM clientes ORDER BY nombre')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Error al listar clientes' })
  }
})

router.post('/', async (req, res) => {
  const { nombre, documento, tipo_doc, telefono, email, preferencias } = req.body
  if (!nombre || !documento) return res.status(400).json({ error: 'Nombre y documento son obligatorios' })
  try {
    const [result] = await pool.query(
      'INSERT INTO clientes (nombre, documento, tipo_doc, telefono, email, preferencias) VALUES (?,?,?,?,?,?)',
      [nombre, documento, tipo_doc || 'CC', telefono, email, preferencias]
    )
    res.status(201).json({ id_cliente: result.insertId, mensaje: 'Cliente creado' })
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'El documento ya existe' })
    res.status(500).json({ error: 'Error al crear cliente' })
  }
})

router.put('/:id', async (req, res) => {
  const { nombre, documento, tipo_doc, telefono, email, preferencias, activo } = req.body
  try {
    await pool.query(
      'UPDATE clientes SET nombre=?, documento=?, tipo_doc=?, telefono=?, email=?, preferencias=?, activo=? WHERE id_cliente=?',
      [nombre, documento, tipo_doc, telefono, email, preferencias, activo ?? 1, req.params.id]
    )
    res.json({ mensaje: 'Cliente actualizado' })
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar cliente' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('UPDATE clientes SET activo = 0 WHERE id_cliente = ?', [req.params.id])
    res.json({ mensaje: 'Cliente desactivado' })
  } catch (err) {
    res.status(500).json({ error: 'Error al desactivar cliente' })
  }
})

module.exports = router