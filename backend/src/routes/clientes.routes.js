const express = require('express')
const router  = express.Router()
const pool    = require('../config/db')
const { verificarToken } = require('../middlewares/auth.middleware')
const { validarCliente } = require('../validators')

router.use(verificarToken)

router.get('/', async (req, res) => {
  try {
    const { page, limit } = req.query
    const pagina = page ? Math.max(1, Number(page)) : 1
    const limite = limit ? Math.min(Number(limit), 500) : 100
    const offset = (pagina - 1) * limite

    let sql = 'SELECT id_cliente, nombre, documento, tipo_doc, telefono, email, preferencias, saldo_favor, activo, creado_en FROM clientes'
    const params = []

    sql += ' ORDER BY nombre'
    if (limite) { sql += ' LIMIT ?'; params.push(limite) }
    if (offset) { sql += ' OFFSET ?'; params.push(offset) }

    const [rows] = await pool.query(sql, params)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Error al listar clientes' })
  }
})

router.post('/', validarCliente, async (req, res) => {
  const { nombre, documento, tipo_doc, telefono, email, preferencias } = req.body
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

router.put('/:id', validarCliente, async (req, res) => {
  const { nombre, documento, tipo_doc, telefono, email, preferencias, activo } = req.body
  try {
    const [exist] = await pool.query('SELECT id_cliente FROM clientes WHERE id_cliente = ?', [req.params.id])
    if (exist.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' })

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