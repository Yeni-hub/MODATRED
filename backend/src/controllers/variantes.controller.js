const pool = require('../config/db')

const listar = async (req, res) => {
  try {
    const { id_producto, page, limit } = req.query
    const pagina = page ? Math.max(1, Number(page)) : 1
    const limite = limit ? Math.min(Number(limit), 500) : 100
    const offset = (pagina - 1) * limite

    let sql = `
      SELECT v.id_variante, v.id_producto, v.talla, v.color, v.stock, v.precio_costo, v.activa,
             p.nombre AS producto, p.referencia
      FROM variantes v
      JOIN productos p ON p.id_producto = v.id_producto
      WHERE v.activa = 1
    `
    const params = []
    if (id_producto) { sql += ' AND v.id_producto = ?'; params.push(id_producto) }
    sql += ' ORDER BY p.nombre, v.talla, v.color'
    if (limite) { sql += ' LIMIT ?'; params.push(limite) }
    if (offset) { sql += ' OFFSET ?'; params.push(offset) }

    const [rows] = await pool.query(sql, params)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Error al listar variantes' })
  }
}

const crear = async (req, res) => {
  const { id_producto, talla, color, stock, precio_costo } = req.body
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
}

const actualizar = async (req, res) => {
  const { talla, color, stock, precio_costo } = req.body
  try {
    const [exist] = await pool.query('SELECT id_variante FROM variantes WHERE id_variante = ?', [req.params.id])
    if (exist.length === 0) return res.status(404).json({ error: 'Variante no encontrada' })

    await pool.query(
      'UPDATE variantes SET talla=?, color=?, stock=?, precio_costo=? WHERE id_variante=?',
      [talla, color, stock, precio_costo, req.params.id]
    )
    res.json({ mensaje: 'Variante actualizada' })
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar variante' })
  }
}

const eliminar = async (req, res) => {
  try {
    await pool.query('UPDATE variantes SET activa = 0 WHERE id_variante = ?', [req.params.id])
    res.json({ mensaje: 'Variante desactivada' })
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar variante' })
  }
}

module.exports = { listar, crear, actualizar, eliminar }
