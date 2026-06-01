const express = require('express')
const router  = express.Router()
const pool    = require('../config/db')
const { verificarToken } = require('../middlewares/auth.middleware')

router.use(verificarToken)

router.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM proveedores ORDER BY nombre')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Error al listar proveedores' })
  }
})

router.post('/', async (req, res) => {
  const { nombre, nit, contacto, telefono, email, direccion } = req.body
  if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' })
  try {
    const [result] = await pool.query(
      'INSERT INTO proveedores (nombre, nit, contacto, telefono, email, direccion) VALUES (?,?,?,?,?,?)',
      [nombre, nit, contacto, telefono, email, direccion]
    )
    res.status(201).json({ id_proveedor: result.insertId, mensaje: 'Proveedor creado' })
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'El NIT ya existe' })
    res.status(500).json({ error: 'Error al crear proveedor' })
  }
})

router.put('/:id', async (req, res) => {
  const { nombre, nit, contacto, telefono, email, direccion, activo } = req.body
  try {
    await pool.query(
      'UPDATE proveedores SET nombre=?, nit=?, contacto=?, telefono=?, email=?, direccion=?, activo=? WHERE id_proveedor=?',
      [nombre, nit, contacto, telefono, email, direccion, activo ?? 1, req.params.id]
    )
    res.json({ mensaje: 'Proveedor actualizado' })
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar proveedor' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('UPDATE proveedores SET activo = 0 WHERE id_proveedor = ?', [req.params.id])
    res.json({ mensaje: 'Proveedor desactivado' })
  } catch (err) {
    res.status(500).json({ error: 'Error al desactivar proveedor' })
  }
})

module.exports = router