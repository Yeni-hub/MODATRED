require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const pool   = require('../config/db');
const { validationResult } = require('express-validator');

const login = async (req, res) => {
  // Verificar si hay errores de validación
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(422).json({
      error:    'Datos inválidos',
      detalles: errores.array().map(e => ({ campo: e.path, mensaje: e.msg })),
    });
  }

  const { email, password } = req.body;

  try {
    // Buscar el usuario en la base de datos
    const [rows] = await pool.query(
      'SELECT * FROM usuarios WHERE email = ? AND activo = 1',
      [email]
    );

    // Si no existe el usuario
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const usuario = rows[0];

    // Comparar la contraseña con el hash guardado
    const coincide = await bcrypt.compare(password, usuario.password_hash);
    if (!coincide) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // Crear el token JWT
    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        nombre:     usuario.nombre,
        rol:        usuario.rol,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    const SEGUNDOS_8H = 8 * 60 * 60

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: SEGUNDOS_8H * 1000,
    })

    res.json({
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre:     usuario.nombre,
        email:      usuario.email,
        rol:        usuario.rol,
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const me = async (req, res) => {
  res.json({
    usuario: {
      id_usuario: req.usuario.id_usuario,
      nombre: req.usuario.nombre,
      rol: req.usuario.rol,
    },
  })
}

const logout = async (_req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'strict' })
  res.json({ mensaje: 'Sesión cerrada' })
}

module.exports = { login, me, logout };