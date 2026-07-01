const pool = require('../config/db')

const listar = async (req, res) => {
  try {
    const { id_coleccion, id_categoria, stock_bajo, page, limit } = req.query
    const pagina = page ? Math.max(1, Number(page)) : 1
    const limite = limit ? Math.min(Number(limit), 500) : 100
    const offset = (pagina - 1) * limite

    let sql = `
      SELECT p.id_producto, p.referencia, p.nombre, p.descripcion,
             p.precio_base, p.id_categoria, p.id_coleccion, p.activo, p.creado_en,
             c.nombre AS categoria, col.nombre AS coleccion,
             COALESCE(SUM(v.stock),0) AS stock_total
      FROM productos p
      JOIN categorias c    ON c.id_categoria  = p.id_categoria
      JOIN colecciones col ON col.id_coleccion = p.id_coleccion
      LEFT JOIN variantes v ON v.id_producto   = p.id_producto
      WHERE p.activo = 1
    `
    const params = []

    if (id_coleccion) { sql += ' AND p.id_coleccion = ?'; params.push(id_coleccion) }
    if (id_categoria) { sql += ' AND p.id_categoria = ?'; params.push(id_categoria) }

    sql += ' GROUP BY p.id_producto'
    if (stock_bajo)   { sql += ' HAVING stock_total <= 5' }
    sql += ' ORDER BY p.nombre'
    if (limite) { sql += ' LIMIT ?'; params.push(limite) }
    if (offset) { sql += ' OFFSET ?'; params.push(offset) }

    const [rows] = await pool.query(sql, params)
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al listar productos' })
  }
}

const obtener = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, c.nombre AS categoria, col.nombre AS coleccion
      FROM productos p
      JOIN categorias c    ON c.id_categoria  = p.id_categoria
      JOIN colecciones col ON col.id_coleccion = p.id_coleccion
      WHERE p.id_producto = ?
    `, [req.params.id])

    if (rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' })

    const [variantes] = await pool.query(
      'SELECT * FROM variantes WHERE id_producto = ? ORDER BY talla, color',
      [req.params.id]
    )

    res.json({ ...rows[0], variantes })
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener producto' })
  }
}

const crear = async (req, res) => {
  const { referencia, nombre, descripcion, precio_base, id_categoria, id_coleccion } = req.body
  try {
    const [col] = await pool.query('SELECT archivada FROM colecciones WHERE id_coleccion = ?', [id_coleccion])
    if (col.length === 0) return res.status(404).json({ error: 'Colección no encontrada' })
    if (col[0].archivada) return res.status(400).json({ error: 'No se pueden agregar productos a una colección archivada' })

    const [result] = await pool.query(
      'INSERT INTO productos (referencia, nombre, descripcion, precio_base, id_categoria, id_coleccion) VALUES (?,?,?,?,?,?)',
      [referencia, nombre, descripcion, precio_base, id_categoria, id_coleccion]
    )
    res.status(201).json({ id_producto: result.insertId, mensaje: 'Producto creado exitosamente' })
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'La referencia ya existe' })
    res.status(500).json({ error: 'Error al crear producto' })
  }
}

const actualizar = async (req, res) => {
  const { referencia, nombre, descripcion, precio_base, id_categoria, id_coleccion, activo } = req.body
  try {
    const [result] = await pool.query(
      `UPDATE productos SET referencia=?, nombre=?, descripcion=?,
       precio_base=?, id_categoria=?, id_coleccion=?, activo=?
       WHERE id_producto=?`,
      [referencia, nombre, descripcion, precio_base, id_categoria, id_coleccion, activo ?? 1, req.params.id]
    )
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Producto no encontrado' })
    res.json({ mensaje: 'Producto actualizado exitosamente' })
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'La referencia ya existe' })
    res.status(500).json({ error: 'Error al actualizar producto' })
  }
}

const eliminar = async (req, res) => {
  try {
    await pool.query('UPDATE productos SET activo = 0 WHERE id_producto = ?', [req.params.id])
    res.json({ mensaje: 'Producto desactivado exitosamente' })
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar producto' })
  }
}

module.exports = { listar, obtener, crear, actualizar, eliminar }