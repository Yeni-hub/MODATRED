import { useState, useEffect, useMemo } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import tokens from '../styles/tokens'
import MetricCard from '../components/ui/MetricCard'
import SectionHeader from '../components/ui/SectionHeader'
import Badge from '../components/ui/Badge'
import DataTable from '../components/ui/DataTable'
import Button from '../components/ui/Button'
import TopProductosWidget from '../components/common/TopProductosWidget'
import IngresosColeccionWidget from '../components/common/IngresosColeccionWidget'

const { colors, spacing, radius, typography, shadows, transitions } = tokens
const t = colors.dark

const safeArray = (data) => Array.isArray(data) ? data.filter(x => x != null) : []
const safeObject = (obj) => obj ?? {}

export default function Dashboard() {
  const { usuario } = useAuth()

  const [stats, setStats] = useState(null)
  const [masVendidos, setMasVendidos] = useState([])
  const [ingresos, setIngresos] = useState([])
  const [tendencia, setTendencia] = useState([])
  const [diasFilter, setDiasFilter] = useState(30)
  const [alertas, setAlertas] = useState(null)
  const [actividad, setActividad] = useState([])
  const [colecciones, setColecciones] = useState([])
  const [cargando, setCargando] = useState(true)

  const cargar = async () => {
    setCargando(true)
    try {
      const [dash, top, cols, trend, alerts, act, col] = await Promise.allSettled([
        api.get('/reportes/dashboard'),
        api.get('/reportes/mas-vendidos'),
        api.get('/reportes/ingresos-coleccion'),
        api.get('/reportes/tendencia-mensual', { params: { dias: diasFilter } }),
        api.get('/reportes/alertas-stock'),
        api.get('/reportes/actividad-reciente'),
        api.get('/colecciones'),
      ])
      if (dash.status === 'fulfilled') setStats(dash.value.data)
      if (top.status === 'fulfilled') setMasVendidos(safeArray(top.value.data).slice(0, 5))
      if (cols.status === 'fulfilled') setIngresos(safeArray(cols.value.data).slice(0, 4))
      if (trend.status === 'fulfilled') setTendencia(safeArray(trend.value.data))
      if (alerts.status === 'fulfilled') setAlertas(alerts.value.data)
      if (act.status === 'fulfilled') setActividad(safeArray(act.value.data).slice(0, 10))
      if (col.status === 'fulfilled') setColecciones(safeArray(col.value.data))
    } catch (err) {
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const maxIngresos = useMemo(() =>
    Math.max(...safeArray(tendencia).map(d => Number(d.ingresos) || 0), 1),
    [tendencia]
  )

  const ventasPorCategoria = useMemo(() => {
    const map = {}
    masVendidos.forEach(p => {
      const cat = p.categoria || 'Sin categoría'
      map[cat] = (map[cat] || 0) + Number(p.unidades_vendidas || 0)
    })
    return Object.entries(map)
      .map(([categoria, unidades]) => ({ categoria, unidades }))
      .sort((a, b) => b.unidades - a.unidades)
  }, [masVendidos])

  const maxCategoria = useMemo(() =>
    Math.max(...ventasPorCategoria.map(c => c.unidades), 1),
    [ventasPorCategoria]
  )

  const barColorsCiclo = [t.primary, t.success, t.warning, t.danger, t.info]

  if (cargando) return (
    <div style={styles.loading}>Cargando dashboard...</div>
  )

  return (
    <div style={styles.pagina}>

      { /* ===== HEADER ===== */ }
      <div style={styles.header}>
        <div>
          <h1 style={styles.welcomeTitle}>
            Bienvenida, {usuario?.nombre || 'Admin'}
          </h1>
          <p style={styles.welcomeSub}>
            {new Date().toLocaleDateString('es-CO', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
            })}
          </p>
        </div>
        <div style={styles.headerActions}>
          <Button theme="warm" variant="primary" size="sm" onClick={cargar} style={{ background: '#F78DA7', borderRadius: '12px' }}>
            ↻ Actualizar
          </Button>
        </div>
      </div>

      { /* ===== MÉTRICAS ===== */ }
      <div style={styles.metricGrid}>
        <MetricCard
          titulo="VENTAS TOTALES"
          valor={`$${Number(stats?.ingresosMes || 0).toLocaleString('es-CO')}`}
          sub="ingresos del mes"
          color={t.primary}
          icono="💰"
          theme="dark"
        />
        <MetricCard
          titulo="PEDIDOS"
          valor={stats?.ventasHoy ?? 0}
          sub="ventas del día"
          color={t.success}
          icono="🛍"
          theme="dark"
        />
        <MetricCard
          titulo="CLIENTES"
          valor={stats?.clientesNuevos ?? 0}
          sub="nuevos este mes"
          color={t.warning}
          icono="👤"
          theme="dark"
        />
        <MetricCard
          titulo="PRODUCTOS"
          valor={stats?.productosActivos ?? 0}
          sub="activos en catálogo"
          color={t.info}
          icono="📦"
          theme="dark"
        />
        <MetricCard
          titulo="STOCK BAJO"
          valor={stats?.stockBajo ?? 0}
          sub="variantes con ≤ 5 uds"
          color={t.danger}
          icono="⚠"
          barWidth={stats
            ? Math.max(0, Math.min(100,
                (1 - (stats.stockBajo / Math.max(stats.productosActivos, 1))) * 100
              ))
            : 100}
          theme="dark"
        />
      </div>

      { /* ===== ANALÍTICAS ===== */ }
      <SectionHeader
        title="Analíticas"
        subtitle="Rendimiento de ventas por período, categoría, colección y canal"
        theme="dark"
      />
      <div style={styles.analyticsGrid}>

        { /* Ventas por período */ }
        <div style={styles.panel}>
          <div style={styles.panelHeaderBar}>
            <span style={styles.panelTitle}>📈 Ventas por período</span>
            <div style={styles.filterGroup}>
              {[7, 30, 90].map(d => (
                <Button
                  key={d}
                  theme="warm"
                  variant={diasFilter === d ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => { setDiasFilter(d); cargar() }}
                  style={{ borderRadius: '12px' }}
                >{d}d</Button>
              ))}
            </div>
          </div>
          {tendencia.length === 0 ? (
            <div style={styles.emptyState}>Sin datos de ventas en este período</div>
          ) : (
            <div style={styles.panelBody}>
              <div style={styles.chartContainer}>
                {safeArray(tendencia).map((d, idx) => {
                  const pct = (Number(d.ingresos) / maxIngresos) * 100
                  const barBg = pct > 70 ? t.success
                    : pct > 40 ? t.primary
                    : t.primary + '60'
                  return (
                    <div key={idx} style={styles.chartCol}>
                      <div style={styles.chartValue}>
                        ${(Number(d.ingresos) / 1000).toFixed(0)}k
                      </div>
                      <div style={styles.chartTrack}>
                        <div style={{
                          ...styles.chartBar,
                          height: `${Math.max(pct, 4)}%`,
                          background: barBg,
                        }} />
                      </div>
                      <div style={styles.chartDate}>
                        {d.fecha?.slice(5) || d.mes?.slice(5) || ''}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        { /* Ventas por categoría */ }
        <div style={styles.panel}>
          <div style={styles.panelHeaderBar}>
            <span style={styles.panelTitle}>🏷 Ventas por categoría</span>
          </div>
          {ventasPorCategoria.length === 0 ? (
            <div style={styles.emptyState}>Sin datos de categorías</div>
          ) : (
            <div style={styles.panelBody}>
              <div style={styles.catChart}>
                {ventasPorCategoria.map((cat, i) => {
                  const pct = (cat.unidades / maxCategoria) * 100
                  return (
                    <div key={i} style={styles.catGroup}>
                      <div style={styles.catRow}>
                        <span style={styles.catName}>{cat.categoria}</span>
                        <span style={styles.catValue}>{cat.unidades} uds</span>
                      </div>
                      <div style={styles.barTrack}>
                        <div style={{
                          height: '100%',
                          borderRadius: radius.sm,
                          width: `${pct}%`,
                          background: barColorsCiclo[i % barColorsCiclo.length],
                          transition: `width ${transitions.slow}`,
                        }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        { /* Ventas por colección */ }
        <div style={styles.panel}>
          <div style={styles.panelHeaderBar}>
            <span style={styles.panelTitle}>📊 Ventas por colección</span>
          </div>
          {ingresos.length === 0 ? (
            <div style={styles.emptyState}>Sin datos de colecciones</div>
          ) : (
            <div style={{ padding: `0 ${spacing.md}`, flex: 1, overflowY: 'auto' }}>
              <IngresosColeccionWidget
                data={ingresos}
                styles={wStyles}
                barColors={[t.primary, t.success, t.warning, t.info]}
              />
            </div>
          )}
        </div>

        { /* Ventas por canal */ }
        <div style={styles.panel}>
          <div style={styles.panelHeaderBar}>
            <span style={styles.panelTitle}>📡 Ventas por canal</span>
          </div>
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: spacing.md, padding: spacing.xl,
            flex: 1,
          }}>
            <span style={{ fontSize: '36px', opacity: 0.3 }}>📊</span>
            <p style={{
              fontSize: typography.fontSize.small,
              color: t.textSecondary, textAlign: 'center',
              maxWidth: '200px',
            }}>
              Próximamente: desglose de ventas por canal de venta
            </p>
            <Badge theme="warm" variant="neutral">En desarrollo</Badge>
          </div>
        </div>

      </div>

      { /* ===== PRODUCTOS DESTACADOS ===== */ }
      <SectionHeader
        title="Productos destacados"
        subtitle="Top ventas, novedades y alertas de inventario"
        theme="dark"
      />
      <div style={styles.featuredGrid}>

        { /* Más vendidos */ }
        <div style={styles.panel}>
          <div style={styles.panelHeaderBar}>
            <span style={styles.panelTitle}>🔥 Más vendidos</span>
            <Badge theme="warm" variant="neutral">{masVendidos.length} prod.</Badge>
          </div>
          {masVendidos.length === 0 ? (
            <div style={styles.emptyState}>Sin ventas registradas aún</div>
          ) : (
            <div style={{ padding: spacing.xs }}>
              <TopProductosWidget data={masVendidos} styles={wStyles} />
            </div>
          )}
        </div>

        { /* Nuevas colecciones */ }
        <div style={styles.panel}>
          <div style={styles.panelHeaderBar}>
            <span style={styles.panelTitle}>✨ Nuevas colecciones</span>
            <Badge theme="warm" variant="neutral">{colecciones.length} cols.</Badge>
          </div>
          {colecciones.length === 0 ? (
            <div style={styles.emptyState}>Sin colecciones registradas</div>
          ) : (
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {safeArray(colecciones).slice(0, 6).map((c, i) => (
                <div key={c.id || i} style={styles.colCard}>
                  <div style={styles.colCardTop}>
                    <div style={styles.colCardInfo}>
                      <div style={styles.colCardName}>{c.nombre}</div>
                      <div style={styles.colCardMeta}>
                        {c.temporada} · {c.anio}
                      </div>
                    </div>
                    <Badge theme="warm" variant="neutral">{c.temporada}</Badge>
                  </div>
                  <div style={styles.colCardFooter}>
                    {c.total_productos || 0} productos
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        { /* Bajo stock */ }
        <div style={styles.panel}>
          <div style={styles.panelHeaderBar}>
            <span style={styles.panelTitle}>⚠ Bajo stock</span>
            {alertas && (
              <Badge theme="warm" variant="neutral">
                {(alertas.criticos?.length || 0) + (alertas.bajos?.length || 0)} alertas
              </Badge>
            )}
          </div>
          {(!alertas || (!alertas.criticos?.length && !alertas.bajos?.length)) ? (
            <div style={styles.emptyState}>Sin alertas de stock</div>
          ) : (
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {alertas.criticos?.slice(0, 3).map((v, i) => (
                <div key={`c-${i}`} style={styles.alertRow}>
                  <div style={styles.alertInfo}>
                    <div style={styles.alertName}>{v.producto}</div>
                    <div style={styles.alertDetail}>{v.talla} / {v.color}</div>
                  </div>
                  <Badge theme="warm" variant="neutral">{v.stock} uds</Badge>
                </div>
              ))}
              {alertas.bajos?.slice(0, 3).map((v, i) => (
                <div key={`b-${i}`} style={styles.alertRow}>
                  <div style={styles.alertInfo}>
                    <div style={styles.alertName}>{v.producto}</div>
                    <div style={styles.alertDetail}>{v.talla} / {v.color}</div>
                  </div>
                  <Badge theme="warm" variant="neutral">{v.stock} uds</Badge>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      { /* ===== ACTIVIDAD RECIENTE ===== */ }
      <SectionHeader
        title="Actividad reciente"
        subtitle="Últimos movimientos en el sistema"
        theme="dark"
      />

      <DataTable
        theme="dark"
        wrapperStyle={{
          background: colors.accent.surface,
          borderRadius: '18px',
          border: '1px solid #e8e8ec',
          boxShadow: shadows.xs,
        }}
        columns={[
          { key: 'usuario', label: 'USUARIO', width: '120px',
            render: (item) => item.usuario_nombre || item.usuario || '—' },
          { key: 'accion', label: 'ACCIÓN', width: '130px',
            render: (item) => {
              const iconos = {
                venta: '💰 Venta', compra: '📦 Compra',
                anulacion: '❌ Anulación', cliente: '👤 Nuevo cliente',
              }
              return iconos[item.tipo] || item.tipo || item.accion || '—'
            }},
          { key: 'detalle', label: 'DETALLE',
            render: (item) => {
              const d = item.descripcion || item.detalle || ''
              return d.length > 45 ? d.slice(0, 45) + '...' : d || '—'
            }},
          { key: 'fecha', label: 'FECHA', width: '140px',
            render: (item) => {
              const f = item.fecha || item.created_at
              if (!f) return '—'
              const d = new Date(f)
              const fecha = d.toLocaleDateString('es-CO', {
                day: '2-digit', month: 'short'
              })
              const hora = d.toLocaleTimeString('es-CO', {
                hour: '2-digit', minute: '2-digit'
              })
              return `${fecha} ${hora}`
            }},
        ]}
        data={actividad}
        emptyMessage="Sin actividad reciente"
      />

    </div>
  )
}

const wStyles = {
  empty: {
    padding: spacing.xl, textAlign: 'center',
    color: t.textSecondary, fontSize: typography.fontSize.small,
  },
  th: {
    padding: `${spacing.sm} ${spacing.md}`,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.semibold,
    color: '#fff', letterSpacing: '0.5px',
    borderBottom: `1px solid ${t.borderLight}`,
    background: '#F78DA7',
  },
  tr: { borderBottom: `1px solid ${t.borderLight}` },
  td: {
    padding: `${spacing.sm} ${spacing.md}`,
    fontSize: typography.fontSize.small, color: t.textPrimary,
  },
  rankNum: {
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.body,
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  prodNombre: {
    color: t.textPrimary, fontWeight: typography.fontWeight.medium,
    fontSize: typography.fontSize.small,
  },
  prodRef: {
    color: t.textSecondary, fontSize: typography.fontSize.caption,
    marginTop: '1px',
  },
  catBadge: {
    background: '#FDF2F5', color: '#F78DA7',
    padding: `${spacing.xs} ${spacing.sm}`,
    borderRadius: radius.xl, fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.medium,
  },
  unidBadge: {
    background: t.success + '20', color: t.success,
    padding: `${spacing.xs} ${spacing.sm}`,
    borderRadius: radius.sm, fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.semibold,
  },
  ingresosVal: {
    color: t.textPrimary, fontWeight: typography.fontWeight.semibold,
    fontSize: typography.fontSize.small,
  },
  colItem: {
    padding: `${spacing.md}`,
    borderBottom: `1px solid ${t.borderLight}`,
  },
  colTop: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: spacing.sm,
  },
  colNombre: {
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.medium,
    color: t.textPrimary,
  },
  colSub: {
    fontSize: typography.fontSize.caption,
    color: t.textSecondary, marginTop: '2px',
  },
  colVal: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.bold,
    color: t.textPrimary,
  },
  barTrack: {
    height: '4px', background: t.secondary,
    borderRadius: radius.sm, overflow: 'hidden',
  },
  barFill: {
    height: '100%', borderRadius: radius.sm,
    transition: `width ${transitions.slow}`,
  },
  colStats: {
    display: 'flex', gap: spacing.md,
    fontSize: typography.fontSize.caption,
    color: t.textSecondary,
  },
}

const styles = {
  pagina: {
    display: 'flex', flexDirection: 'column',
    gap: spacing.lg, height: '100%',
  },
  loading: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '100%', color: t.textSecondary,
    fontSize: typography.fontSize.body,
  },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  welcomeTitle: {
    fontSize: '28px',
    fontWeight: 700,
    color: t.textPrimary, margin: 0,
  },
  welcomeSub: {
    fontSize: typography.fontSize.small,
    color: t.textSecondary, marginTop: spacing.xs,
  },
  headerActions: {
    display: 'flex', alignItems: 'center', gap: spacing.sm,
  },
  filterGroup: {
    display: 'flex', gap: spacing.xs,
  },
  metricGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: spacing.md,
  },
  analyticsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: spacing.md,
  },
  featuredGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: spacing.md,
  },
  panel: {
    background: colors.accent.surface, border: '1px solid #e8e8ec',
    borderRadius: '18px', display: 'flex',
    flexDirection: 'column', overflow: 'hidden',
    boxShadow: shadows.xs,
  },
  panelHeaderBar: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${spacing.md} ${spacing.lg}`,
    borderBottom: '1px solid #e8e8ec',
    background: '#F78DA7', color: '#fff',
  },
  panelTitle: {
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.semibold,
    color: '#fff',
  },
  panelBody: {
    padding: spacing.md, flex: 1, overflowY: 'auto',
  },
  emptyState: {
    padding: spacing.xl, textAlign: 'center',
    color: t.textSecondary, fontSize: typography.fontSize.small,
  },
  chartContainer: {
    display: 'flex', alignItems: 'flex-end', gap: '3px',
    height: '150px', padding: `${spacing.xs} 0`,
    overflowX: 'auto',
  },
  chartCol: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'flex-end',
    height: '100%', minWidth: '20px',
  },
  chartValue: {
    fontSize: typography.fontSize.caption,
    color: t.textSecondary, marginBottom: spacing.xs,
    whiteSpace: 'nowrap',
  },
  chartTrack: {
    width: '100%', maxWidth: '28px', height: '110px',
    display: 'flex', alignItems: 'flex-end',
    justifyContent: 'center',
  },
  chartBar: {
    width: '100%', maxWidth: '28px',
    borderRadius: `${radius.sm} ${radius.sm} 0 0`,
    transition: `height ${transitions.slow}`,
    minHeight: '4px',
  },
  chartDate: {
    fontSize: '8px', color: t.textSecondary,
    marginTop: spacing.xs, whiteSpace: 'nowrap',
  },
  catChart: {
    display: 'flex', flexDirection: 'column', gap: spacing.md,
    padding: `${spacing.xs} 0`,
  },
  catGroup: {
    display: 'flex', flexDirection: 'column', gap: spacing.xs,
  },
  catRow: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center',
  },
  catName: {
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.medium, color: t.textPrimary,
  },
  catValue: {
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.semibold,
    color: t.textSecondary,
  },
  barTrack: {
    height: '6px', background: t.secondary,
    borderRadius: radius.sm, overflow: 'hidden',
  },
  colCard: {
    padding: `${spacing.sm} ${spacing.lg}`,
    borderBottom: '1px solid #e8e8ec',
  },
  colCardTop: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: spacing.xs,
  },
  colCardInfo: { flex: 1, minWidth: 0, marginRight: spacing.sm },
  colCardName: {
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.medium,
    color: t.textPrimary,
    overflow: 'hidden', textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  colCardMeta: {
    fontSize: typography.fontSize.caption,
    color: t.textSecondary, marginTop: '1px',
  },
  colCardFooter: {
    fontSize: typography.fontSize.caption,
    color: t.textSecondary,
  },
  alertRow: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${spacing.sm} ${spacing.lg}`,
    borderBottom: '1px solid #e8e8ec',
    gap: spacing.sm,
  },
  alertInfo: { flex: 1, minWidth: 0 },
  alertName: {
    fontSize: typography.fontSize.small,
    color: t.textPrimary,
    overflow: 'hidden', textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  alertDetail: {
    fontSize: typography.fontSize.caption,
    color: t.textSecondary, marginTop: '1px',
  },
}
