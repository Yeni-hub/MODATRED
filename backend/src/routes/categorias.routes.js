const express = require('express')
const router  = express.Router()
const pool    = require('../config/db')
const { verificarToken } = require('../middlewares/auth.middleware')

router.use(verificarToken)

router.get('/', async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM categorias ORDER BY nombre')
  res.json(rows)
})

module.exports = router