const express  = require('express')
const router   = express.Router()
const pool     = require('../config/db')
const bcrypt   = require('bcryptjs')
const { verificarToken, soloAdmin } = require('../middlewares/auth.middleware')

router.use(verificarToken)
router.use(soloAdmin)

router.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id_usuario, nombre, email, rol, activo, creado_en FROM usuarios ORDER BY nombre'
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Error al listar usuarios' })
  }
})

router.post('/', async (req, res) => {
  const { nombre, email, password, rol } = req.body
  if (!nombre || !email || !password) return res.status(400).json({ error: 'Campos obligatorios incompletos' })
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
})

router.put('/:id', async (req, res) => {
  const { nombre, email, password, rol, activo } = req.body
  try {
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
    res.status(500).json({ error: 'Error al actualizar usuario' })
  }
})

module.exports = router