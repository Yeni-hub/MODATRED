const pool = require('../config/db')
const bcrypt = require('bcryptjs')

const listar = async (req, res) => {
  try {
    const { page, limit } = req.query
    const pagina = page ? Math.max(1, Number(page)) : 1
    const limite = limit ? Math.min(Number(limit), 500) : 100
    const offset = (pagina - 1) * limite

    let sql = 'SELECT id_usuario, nombre, email, rol, activo, creado_en FROM usuarios'
    const params = []

    sql += ' ORDER BY nombre'
    if (limite) { sql += ' LIMIT ?'; params.push(limite) }
    if (offset) { sql += ' OFFSET ?'; params.push(offset) }

    const [rows] = await pool.query(sql, params)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Error al listar usuarios' })
  }
}

const crear = async (req, res) => {
  const { nombre, email, password, rol } = req.body
  try {
    const hash = await bcrypt.hash(password, 10)
    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES (?,?,?,?)',
      [nombre, email, hash, rol || 'vendedor']
    )
    res.status(201).json({ id_usuario: result.insertId, mensaje: 'Usuario creado' })
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'El email ya existe' })
    res.status(500).json({ error: 'Error al crear usuario' })
  }
}

const actualizar = async (req, res) => {
  const { nombre, email, password, rol, activo } = req.body
  try {
    if (activo === 0 || rol === 'vendedor') {
      const [target] = await pool.query('SELECT rol FROM usuarios WHERE id_usuario = ?', [req.params.id])
      if (target.length > 0 && target[0].rol === 'admin') {
        const [admins] = await pool.query('SELECT COUNT(*) AS total FROM usuarios WHERE rol = ? AND activo = 1', ['admin'])
        if (Number(admins[0].total) <= 1) {
          return res.status(400).json({ error: 'No se puede desactivar o cambiar el rol del último administrador activo' })
        }
      }
    }
    if (password && password.length >= 6) {
      const hash = await bcrypt.hash(password, 10)
      await pool.query(
        'UPDATE usuarios SET nombre=?, email=?, password_hash=?, rol=?, activo=? WHERE id_usuario=?',
        [nombre, email, hash, rol, activo ?? 1, req.params.id]
      )
    } else {
      await pool.query(
        'UPDATE usuarios SET nombre=?, email=?, rol=?, activo=? WHERE id_usuario=?',
        [nombre, email, rol, activo ?? 1, req.params.id]
      )
    }
    res.json({ mensaje: 'Usuario actualizado' })
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'El email ya existe' })
    res.status(500).json({ error: 'Error al actualizar usuario' })
  }
}

module.exports = { listar, crear, actualizar }
