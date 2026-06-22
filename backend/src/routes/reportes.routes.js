const express = require('express')
const router  = express.Router()
const pool    = require('../config/db')
const { verificarToken } = require('../middlewares/auth.middleware')

router.use(verificarToken)

// Dashboard resumen expandido (Dashboard v2)
router.get('/dashboard', async (_req, res) => {
  try {
    const [[ventasHoy]]      = await pool.query("SELECT COUNT(*) AS total, COALESCE(SUM(total_neto),0) AS ingresos FROM ventas WHERE DATE(fecha) = CURDATE() AND estado = 'confirmada'")
    const [[ingresosMes]]    = await pool.query("SELECT COALESCE(SUM(total_neto),0) AS total FROM ventas WHERE MONTH(fecha) = MONTH(CURDATE()) AND YEAR(fecha) = YEAR(CURDATE()) AND estado = 'confirmada'")
    const [[clientesNuevos]] = await pool.query("SELECT COUNT(*) AS total FROM clientes WHERE MONTH(creado_en) = MONTH(CURDATE()) AND YEAR(creado_en) = YEAR(CURDATE())")
    const [[productos]]      = await pool.query("SELECT COUNT(*) AS total FROM productos WHERE activo=1")
    const [[stockBajo]]      = await pool.query("SELECT COUNT(*) AS total FROM variantes WHERE stock<=5 AND activa=1")

    const [[sinMov]] = await pool.query(`
      SELECT COUNT(*) AS total FROM (
        SELECT p.id_producto FROM productos p
        JOIN variantes var ON var.id_producto = p.id_producto AND var.activa = 1
        LEFT JOIN detalle_ventas dv ON dv.id_variante = var.id_variante
        LEFT JOIN ventas v ON v.id_venta = dv.id_venta AND v.estado = 'confirmada'
        WHERE p.activo = 1
        GROUP BY p.id_producto
        HAVING COALESCE(SUM(dv.cantidad),0) = 0
      ) sm
    `)

    const alertasActivas = Number(stockBajo.total) + Number(sinMov.total)

    res.json({
      ventasHoy: ventasHoy.total,
      ingresosHoy: ventasHoy.ingresos,
      ingresosMes: ingresosMes.total,
      clientesNuevos: clientesNuevos.total,
      productosActivos: productos.total,
      stockBajo: stockBajo.total,
      alertasActivas
    })
  } catch (err) {
    console.error('Error /dashboard:', err)
    res.status(500).json({ error: 'Error al generar dashboard' })
  }
})

// Productos más vendidos
router.get('/mas-vendidos', async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.referencia, p.nombre, cat.nombre AS categoria,
             SUM(dv.cantidad) AS unidades_vendidas,
             SUM(dv.cantidad * dv.precio_venta) AS ingresos_totales
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
    console.error('Error /mas-vendidos:', err)
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
             SUM(dv.cantidad * dv.precio_venta) AS ingresos_brutos
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
    console.error('Error /ingresos-coleccion:', err)
    res.status(500).json({ error: 'Error al generar reporte' })
  }
})

// Ventas por período
router.get('/por-periodo', async (req, res) => {
  try {
    const { desde, hasta } = req.query
    let sql = `
      SELECT v.id_venta, v.fecha, v.total_neto, v.estado, v.metodo_pago,
             c.nombre AS cliente, u.nombre AS vendedor
      FROM ventas v
      JOIN clientes c ON c.id_cliente = v.id_cliente
      JOIN usuarios u ON u.id_usuario = v.id_usuario
      WHERE v.estado = 'confirmada'
    `
    const params = []
    if (desde) { sql += ' AND v.fecha >= ?'; params.push(desde) }
    if (hasta) { sql += ' AND v.fecha <= ?'; params.push(hasta) }
    sql += ' ORDER BY v.fecha DESC'
    const [rows] = await pool.query(sql, params)
    res.json(rows)
  } catch (err) {
    console.error('Error /por-periodo:', err)
    res.status(500).json({ error: 'Error al generar reporte por período' })
  }
})

// Ventas por vendedor
router.get('/por-vendedor', async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.id_usuario, u.nombre AS vendedor, u.email,
             COUNT(v.id_venta) AS total_ventas,
             COALESCE(SUM(v.total_neto),0) AS ingresos_totales,
             ROUND(AVG(v.total_neto),0) AS ticket_promedio
      FROM usuarios u
      LEFT JOIN ventas v ON v.id_usuario = u.id_usuario AND v.estado = 'confirmada'
      GROUP BY u.id_usuario
      ORDER BY ingresos_totales DESC
    `)
    res.json(rows)
  } catch (err) {
    console.error('Error /por-vendedor:', err)
    res.status(500).json({ error: 'Error al generar reporte por vendedor' })
  }
})

// Ventas por cliente
router.get('/por-cliente', async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.id_cliente, c.nombre AS cliente, c.documento, c.saldo_favor,
             COUNT(v.id_venta) AS total_ventas,
             COALESCE(SUM(v.total_neto),0) AS ingresos_totales,
             MAX(v.fecha) AS ultima_compra
      FROM clientes c
      LEFT JOIN ventas v ON v.id_cliente = c.id_cliente AND v.estado = 'confirmada'
      GROUP BY c.id_cliente
      ORDER BY ingresos_totales DESC
    `)
    res.json(rows)
  } catch (err) {
    console.error('Error /por-cliente:', err)
    res.status(500).json({ error: 'Error al generar reporte por cliente' })
  }
})

// Productos sin movimiento
router.get('/productos-sin-movimiento', async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.id_producto, p.referencia, p.nombre, cat.nombre AS categoria,
             col.nombre AS coleccion, SUM(var.stock) AS stock_total,
             COALESCE(dv.total_vendido,0) AS unidades_vendidas
      FROM productos p
      JOIN categorias cat ON cat.id_categoria = p.id_categoria
      JOIN colecciones col ON col.id_coleccion = p.id_coleccion
      JOIN variantes var ON var.id_producto = p.id_producto AND var.activa = 1
      LEFT JOIN (
        SELECT var.id_producto, SUM(dv.cantidad) AS total_vendido
        FROM detalle_ventas dv
        JOIN ventas v ON v.id_venta = dv.id_venta AND v.estado = 'confirmada'
        JOIN variantes var ON var.id_variante = dv.id_variante
        GROUP BY var.id_producto
      ) dv ON dv.id_producto = p.id_producto
      WHERE p.activo = 1
      GROUP BY p.id_producto
      HAVING unidades_vendidas = 0
      ORDER BY stock_total DESC
    `)
    res.json(rows)
  } catch (err) {
    console.error('Error /productos-sin-movimiento:', err)
    res.status(500).json({ error: 'Error al generar reporte de productos sin movimiento' })
  }
})

// Exportar ventas como CSV
router.get('/exportar', async (req, res) => {
  try {
    const { desde, hasta } = req.query
    let sql = `
      SELECT v.id_venta, v.fecha, c.nombre AS cliente, u.nombre AS vendedor,
             v.total_neto, v.metodo_pago, v.estado
      FROM ventas v
      JOIN clientes c ON c.id_cliente = v.id_cliente
      JOIN usuarios u ON u.id_usuario = v.id_usuario
      WHERE 1=1
    `
    const params = []
    if (desde) { sql += ' AND v.fecha >= ?'; params.push(desde) }
    if (hasta) { sql += ' AND v.fecha <= ?'; params.push(hasta) }
    sql += ' ORDER BY v.fecha DESC'

    const [rows] = await pool.query(sql, params)
    const header = 'ID,Fecha,Cliente,Vendedor,Total,Metodo Pago,Estado\n'
    const csv = rows.map(r =>
      `${r.id_venta},${r.fecha?.toISOString().split('T')[0] || ''},"${r.cliente || ''}","${r.vendedor || ''}",${r.total_neto || 0},${r.metodo_pago || ''},${r.estado || ''}`
    ).join('\n')

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename=ventas_export.csv')
    res.send(header + csv)
  } catch (err) {
    console.error('Error /exportar:', err)
    res.status(500).json({ error: 'Error al exportar ventas' })
  }
})

// Ventas recientes (Dashboard v2)
router.get('/ventas-recientes', async (req, res) => {
  try {
    const limite = parseInt(req.query.limite) || 8
    const [rows] = await pool.query(`
      SELECT v.id_venta, v.fecha, v.total_neto, v.estado, v.metodo_pago,
             c.nombre AS cliente, u.nombre AS vendedor
      FROM ventas v
      JOIN clientes c ON c.id_cliente = v.id_cliente
      JOIN usuarios u ON u.id_usuario = v.id_usuario
      ORDER BY v.fecha DESC
      LIMIT ?
    `, [limite])
    res.json(rows)
  } catch (err) {
    console.error('Error /ventas-recientes:', err)
    res.status(500).json({ error: 'Error al obtener ventas recientes' })
  }
})

// Tendencia de ventas (Dashboard v2) — soporta ?dias=7|30|90 o ?meses=N
router.get('/tendencia-mensual', async (req, res) => {
  try {
    const dias  = parseInt(req.query.dias)
    const meses = parseInt(req.query.meses) || 6

    if (dias) {
      const [rows] = await pool.query(`
        SELECT DATE(fecha) AS fecha,
               COUNT(*) AS cantidad_ventas,
               COALESCE(SUM(total_neto),0) AS ingresos
        FROM ventas
        WHERE estado = 'confirmada'
          AND fecha >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        GROUP BY DATE(fecha)
        ORDER BY fecha ASC
      `, [dias])
      return res.json(rows)
    }

    const [rows] = await pool.query(`
      SELECT DATE_FORMAT(fecha, '%Y-%m') AS mes,
             COUNT(*) AS cantidad_ventas,
             COALESCE(SUM(total_neto),0) AS ingresos
      FROM ventas
      WHERE estado = 'confirmada'
        AND fecha >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
      GROUP BY DATE_FORMAT(fecha, '%Y-%m')
      ORDER BY mes ASC
    `, [meses])
    res.json(rows)
  } catch (err) {
    console.error('Error /tendencia-mensual:', err)
    res.status(500).json({ error: 'Error al generar tendencia de ventas' })
  }
})

// Resumen de inventario (Dashboard v2)
router.get('/resumen-inventario', async (_req, res) => {
  try {
    const [[productos]]  = await pool.query("SELECT COUNT(*) AS total FROM productos WHERE activo = 1")
    const [[valor]]      = await pool.query("SELECT COALESCE(SUM(stock * precio_costo),0) AS total FROM variantes WHERE activa = 1")
    const [[variantes]]  = await pool.query("SELECT COUNT(*) AS total FROM variantes WHERE activa = 1")
    const [[stockBajo]]  = await pool.query("SELECT COUNT(*) AS total FROM variantes WHERE stock <= 5 AND activa = 1")
    const [[sinMov]]     = await pool.query(`
      SELECT COUNT(*) AS total FROM (
        SELECT p.id_producto FROM productos p
        JOIN variantes var ON var.id_producto = p.id_producto AND var.activa = 1
        LEFT JOIN detalle_ventas dv ON dv.id_variante = var.id_variante
        LEFT JOIN ventas v ON v.id_venta = dv.id_venta AND v.estado = 'confirmada'
        WHERE p.activo = 1
        GROUP BY p.id_producto
        HAVING COALESCE(SUM(dv.cantidad),0) = 0
      ) sm
    `)

    const totalVariantes = Number(variantes.total)
    res.json({
      totalProductos: productos.total,
      valorInventario: valor.total,
      totalVariantes,
      stockBajo: stockBajo.total,
      porcentajeStockBajo: totalVariantes > 0 ? Math.round((Number(stockBajo.total) / totalVariantes) * 100) : 0,
      sinMovimiento: sinMov.total,
      porcentajeSinMovimiento: totalVariantes > 0 ? Math.round((Number(sinMov.total) / totalVariantes) * 100) : 0
    })
  } catch (err) {
    console.error('Error /resumen-inventario:', err)
    res.status(500).json({ error: 'Error al generar resumen de inventario' })
  }
})

// Alertas de stock detalladas (Dashboard v2)
router.get('/alertas-stock', async (_req, res) => {
  try {
    const [criticos] = await pool.query(`
      SELECT var.id_variante, var.talla, var.color, var.stock,
             p.id_producto, p.referencia, p.nombre AS producto,
             cat.nombre AS categoria
      FROM variantes var
      JOIN productos p ON p.id_producto = var.id_producto AND p.activo = 1
      JOIN categorias cat ON cat.id_categoria = p.id_categoria
      WHERE var.activa = 1 AND var.stock <= 3 AND var.stock > 0
      ORDER BY var.stock ASC
    `)
    const [bajos] = await pool.query(`
      SELECT var.id_variante, var.talla, var.color, var.stock,
             p.id_producto, p.referencia, p.nombre AS producto,
             cat.nombre AS categoria
      FROM variantes var
      JOIN productos p ON p.id_producto = var.id_producto AND p.activo = 1
      JOIN categorias cat ON cat.id_categoria = p.id_categoria
      WHERE var.activa = 1 AND var.stock > 3 AND var.stock <= 5
      ORDER BY var.stock ASC
    `)
    const [agotadas] = await pool.query(`
      SELECT var.id_variante, var.talla, var.color, var.stock,
             p.id_producto, p.referencia, p.nombre AS producto,
             cat.nombre AS categoria
      FROM variantes var
      JOIN productos p ON p.id_producto = var.id_producto AND p.activo = 1
      JOIN categorias cat ON cat.id_categoria = p.id_categoria
      WHERE var.activa = 1 AND var.stock = 0
      ORDER BY p.nombre ASC
    `)
    const [coleccionesArchivadas] = await pool.query(`
      SELECT col.id_coleccion, col.nombre, col.temporada, col.anio,
             COUNT(p.id_producto) AS total_productos
      FROM colecciones col
      LEFT JOIN productos p ON p.id_coleccion = col.id_coleccion AND p.activo = 1
      WHERE col.archivada = 1
      GROUP BY col.id_coleccion
      ORDER BY col.nombre ASC
    `)
    res.json({
      criticos,
      bajos,
      agotadas,
      coleccionesArchivadas,
      totalAlertas: criticos.length + bajos.length + agotadas.length + coleccionesArchivadas.length
    })
  } catch (err) {
    console.error('Error /alertas-stock:', err)
    res.status(500).json({ error: 'Error al obtener alertas de stock' })
  }
})

// Colecciones activas (Dashboard v2)
router.get('/colecciones-activas', async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT col.id_coleccion, col.nombre, col.temporada, col.anio,
             COUNT(p.id_producto) AS total_productos,
             COALESCE(SUM(var.stock),0) AS stock_total
      FROM colecciones col
      LEFT JOIN productos p ON p.id_coleccion = col.id_coleccion AND p.activo = 1
      LEFT JOIN variantes var ON var.id_producto = p.id_producto AND var.activa = 1
      WHERE col.archivada = 0
      GROUP BY col.id_coleccion
      ORDER BY col.anio DESC, col.nombre ASC
    `)
    res.json(rows)
  } catch (err) {
    console.error('Error /colecciones-activas:', err)
    res.status(500).json({ error: 'Error al obtener colecciones activas' })
  }
})

// Actividad reciente (Dashboard v2)
router.get('/actividad-reciente', async (req, res) => {
  try {
    const limite = parseInt(req.query.limite) || 10
    const [rows] = await pool.query(`
      (SELECT 'venta' AS tipo, v.id_venta AS id, v.fecha,
              CONCAT('Venta #', v.id_venta, ' · ', c.nombre, ' · $', FORMAT(v.total_neto, 0)) AS descripcion,
              u.nombre AS actor
       FROM ventas v
       JOIN clientes c ON c.id_cliente = v.id_cliente
       JOIN usuarios u ON u.id_usuario = v.id_usuario
       WHERE v.estado = 'confirmada')
      UNION ALL
      (SELECT 'anulacion' AS tipo, v.id_venta AS id, v.fecha,
              CONCAT('Venta #', v.id_venta, ' anulada · $', FORMAT(v.total_neto, 0)) AS descripcion,
              u.nombre AS actor
       FROM ventas v
       JOIN usuarios u ON u.id_usuario = v.id_usuario
       WHERE v.estado = 'anulada')
      UNION ALL
      (SELECT 'compra' AS tipo, co.id_compra AS id, co.fecha,
              CONCAT('Compra #', co.id_compra, ' · ', pr.nombre, ' · $', FORMAT(co.total, 0)) AS descripcion,
              u.nombre AS actor
       FROM compras co
       JOIN proveedores pr ON pr.id_proveedor = co.id_proveedor
       JOIN usuarios u ON u.id_usuario = co.id_usuario)
      UNION ALL
      (SELECT 'cliente' AS tipo, cl.id_cliente AS id, cl.creado_en AS fecha,
              CONCAT('Nuevo cliente: ', cl.nombre) AS descripcion,
              '' AS actor
       FROM clientes cl)
      ORDER BY fecha DESC
      LIMIT ?
    `, [limite])
    res.json(rows)
  } catch (err) {
    console.error('Error /actividad-reciente:', err)
    res.status(500).json({ error: 'Error al obtener actividad reciente' })
  }
})

module.exports = router