require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') })
const express           = require('express')
const cors              = require('cors')
const morgan            = require('morgan')
const helmet            = require('helmet')
const cookieParser      = require('cookie-parser')
const rateLimit         = require('express-rate-limit')
const { generarCsrf, verificarCsrf } = require('./middlewares/csrf.middleware')
const sanitizeInput = require('./middlewares/sanitize.middleware')
const errorHandler = require('./middlewares/error.middleware')

const authRoutes        = require('./routes/auth.routes')
const productosRoutes   = require('./routes/productos.routes')
const categoriasRoutes  = require('./routes/categorias.routes')
const coleccionesRoutes = require('./routes/colecciones.routes')
const variantesRoutes   = require('./routes/variantes.routes')
const proveedoresRoutes = require('./routes/proveedores.routes')
const clientesRoutes    = require('./routes/clientes.routes')
const ventasRoutes      = require('./routes/ventas.routes')
const comprasRoutes     = require('./routes/compras.routes')
const reportesRoutes    = require('./routes/reportes.routes')
const usuariosRoutes    = require('./routes/usuarios.routes')

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 20) {
  console.error('JWT_SECRET debe tener al menos 20 caracteres')
  process.exit(1)
}

const app  = express()
const PORT = process.env.PORT || 4000

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'", "'unsafe-inline'"],
      styleSrc:   ["'self'", "'unsafe-inline'"],
      imgSrc:     ["'self'", "data:", "blob:"],
    },
  },
}))
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(morgan('dev'))
app.use(express.json())
app.use(cookieParser())
app.use(sanitizeInput)
app.use(generarCsrf)
app.use(verificarCsrf)

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Demasiados intentos. Intenta de nuevo en 15 minutos' },
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api/auth/login', authLimiter)

const operacionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  message: { error: 'Demasiadas solicitudes. Intenta de nuevo en 1 minuto' },
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api/ventas', operacionLimiter)
app.use('/api/compras', operacionLimiter)

app.use('/api/auth',        authRoutes)
app.use('/api/productos',   productosRoutes)
app.use('/api/categorias',  categoriasRoutes)
app.use('/api/colecciones', coleccionesRoutes)
app.use('/api/variantes',   variantesRoutes)
app.use('/api/proveedores', proveedoresRoutes)
app.use('/api/clientes',    clientesRoutes)
app.use('/api/ventas',      ventasRoutes)
app.use('/api/compras',     comprasRoutes)
app.use('/api/reportes',    reportesRoutes)
app.use('/api/usuarios',    usuariosRoutes)

app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))
app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada' }))
app.use(errorHandler)

app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`))