const express = require('express')
const router  = express.Router()
const pool    = require('../config/db')
const { verificarToken } = require('../middlewares/auth.middleware')
const { validarProveedor } = require('../validators')

router.use(verificarToken)

router.get('/', async (req, res) => {
  try {
    const { page, limit } = req.query
    const pagina = page ? Math.max(1, Number(page)) : 1
    const limite = limit ? Math.min(Number(limit), 500) : 100
    const offset = (pagina - 1) * limite

    let sql = 'SELECT id_proveedor, nombre, nit, contacto, telefono, email, direccion, activo, creado_en FROM proveedores'
    const params = []

    sql += ' ORDER BY nombre'
    if (limite) { sql += ' LIMIT ?'; params.push(limite) }
    if (offset) { sql += ' OFFSET ?'; params.push(offset) }

    const [rows] = await pool.query(sql, params)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Error al listar proveedores' })
  }
})

router.post('/', validarProveedor, async (req, res) => {
  const { nombre, nit, contacto, telefono, email, direccion } = req.body
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

router.put('/:id', validarProveedor, async (req, res) => {
  const { nombre, nit, contacto, telefono, email, direccion, activo } = req.body
  try {
    const [exist] = await pool.query('SELECT id_proveedor FROM proveedores WHERE id_proveedor = ?', [req.params.id])
    if (exist.length === 0) return res.status(404).json({ error: 'Proveedor no encontrado' })

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