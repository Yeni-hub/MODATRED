const errorHandler = (err, _req, res, _next) => {
  console.error('Error:', err)

  if (err.status) {
    return res.status(err.status).json({ error: err.message })
  }

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'El registro ya existe' })
  }

  res.status(500).json({ error: 'Error interno del servidor' })
}

module.exports = errorHandler
