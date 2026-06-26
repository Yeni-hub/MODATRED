const xss = require('xss')

const sanitizeValue = (value) => {
  if (typeof value === 'string') return xss(value.trim())
  if (Array.isArray(value)) return value.map(sanitizeValue)
  if (value && typeof value === 'object') return sanitizeObject(value)
  return value
}

const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj
  const sanitized = Array.isArray(obj) ? [...obj] : { ...obj }
  for (const key of Object.keys(sanitized)) {
    sanitized[key] = sanitizeValue(sanitized[key])
  }
  return sanitized
}

const sanitizeInput = (req, _res, next) => {
  if (req.body) req.body = sanitizeObject(req.body)
  if (req.query) {
    for (const key of Object.keys(req.query)) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = xss(req.query[key].trim())
      }
    }
  }
  if (req.params) {
    for (const key of Object.keys(req.params)) {
      if (typeof req.params[key] === 'string') {
        req.params[key] = xss(req.params[key].trim())
      }
    }
  }
  next()
}

module.exports = sanitizeInput
