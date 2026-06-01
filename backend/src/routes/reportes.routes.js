const express = require('express')
const router  = express.Router()
const pool    = require('../config/db')
const { verificarToken } = require('../middlewares/auth.middleware')

router.use(verificarToken)

// Dashboard resumen
router.get('/dashboard', async (_req, res) => {
  try {
    const [[ventas]]     = await pool.query("SELECT COUNT(*) AS total, COALESCE(SUM(total_neto),0) AS ingresos FROM ventas WHERE estado='confirmada'")
    const [[productos]]  = await pool.query("SELECT COUNT(*) AS total FROM productos WHERE activo=1")
    const [[clientes]]   = await pool.query("SELECT COUNT(*) AS total FROM clientes WHERE activo=1")
    const [[stock_bajo]] = await pool.query("SELECT COUNT(*) AS total FROM variantes WHERE stock<=5 AND activa=1")
    res.json({ ventas_total: ventas.total, ingresos_total: ventas.ingresos, productos: productos.total, clientes: clientes.total, alertas_stock: stock_bajo.total })
  } catch (err) {
    res.status(500).json({ error: 'Error al generar dashboard' })
  }
})

// Productos más vendidos
router.get('/mas-vendidos', async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.referencia, p.nombre, cat.nombre AS categoria,
             SUM(dv.cantidad) AS unidades_vendidas,
             SUM(dv.subtotal) AS ingresos_totales
      FROM detalle_ventas dv
      JOIN ventas v       ON v.id_venta     = dv.id_venta    AND v.estado = 'confirmada'
      JOIN variantes var  ON var.id_variante = dv.id_variante
      JOIN productos p    ON p.id_producto   = var.id_producto
      JOIN categorias cat ON cat.id_categoria = p.id_categoria
      GROUP BY p.id_producto
      ORDER BY unidades_vendidas DESC
      LIMIT 10
    `)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Error al generar reporte' })
  }
})

// Ingresos por colección
router.get('/ingresos-coleccion', async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT col.nombre AS coleccion, col.temporada, col.anio,
             COUNT(DISTINCT v.id_venta) AS numero_ventas,
             SUM(dv.cantidad)           AS unidades_vendidas,
             SUM(dv.subtotal)           AS ingresos_brutos
      FROM detalle_ventas dv
      JOIN ventas v        ON v.id_venta     = dv.id_venta   AND v.estado = 'confirmada'
      JOIN variantes var   ON var.id_variante = dv.id_variante
      JOIN productos p     ON p.id_producto   = var.id_producto
      JOIN colecciones col ON col.id_coleccion = p.id_coleccion
      GROUP BY col.id_coleccion
      ORDER BY ingresos_brutos DESC
    `)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Error al generar reporte' })
  }
})

module.exports = router