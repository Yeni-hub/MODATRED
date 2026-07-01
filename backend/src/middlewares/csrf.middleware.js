const crypto = require('crypto')

const CSRF_COOKIE = 'csrf_token'
const CSRF_HEADER = 'x-csrf-token'

const generarCsrf = (req, res, next) => {
  if (!req.cookies?.[CSRF_COOKIE]) {
    const token = crypto.randomBytes(32).toString('hex')
    res.cookie(CSRF_COOKIE, token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    })
  }
  next()
}

const verificarCsrf = (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next()
  const headerToken = req.headers[CSRF_HEADER]
  const cookieToken = req.cookies?.[CSRF_COOKIE]
  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    return res.status(403).json({ error: 'CSRF token inválido' })
  }
  next()
}

module.exports = { generarCsrf, verificarCsrf }
