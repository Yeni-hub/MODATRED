import { useState, useEffect } from 'react'
import api from '../services/api'
import tokens from '../styles/tokens'
import SectionHeader from '../components/ui/SectionHeader'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import TopProductosWidget from '../components/common/TopProductosWidget'
import IngresosColeccionWidget from '../components/common/IngresosColeccionWidget'

const { colors, spacing, radius, typography, shadows, transitions } = tokens
const t = colors.warm

const safeArray = (data) => Array.isArray(data) ? data.filter(x => x != null) : []

export default function Reportes() {
  const [masVendidos, setMasVendidos] = useState([])
  const [ingresosColeccion, setIngresosColeccion] = useState([])
  const [ventasPeriodo, setVentasPeriodo] = useState([])
  const [porVendedor, setPorVendedor] = useState([])
  const [porCliente, setPorCliente] = useState([])
  const [sinMovimiento, setSinMovimiento] = useState([])
  const [cargando, setCargando] = useState(true)
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')

  const cargar = async (exportar = false) => {
    setCargando(true)
    try {
      const params = {}
      if (desde) params.desde = desde
      if (hasta) params.hasta = hasta

      if (exportar) {
        const res = await api.get('/reportes/exportar', { params, responseType: 'blob' })
        const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'ventas_export.csv')
        document.body.appendChild(link)
        link.click()
        link.remove()
        URL.revokeObjectURL(url)
        setCargando(false)
        return
      }

      const [mv, ic, vp, pv, pc, sm] = await Promise.all([
        api.get('/reportes/mas-vendidos'),
        api.get('/reportes/ingresos-coleccion'),
        api.get('/reportes/por-periodo', { params }),
        api.get('/reportes/por-vendedor'),
        api.get('/reportes/por-cliente'),
        api.get('/reportes/productos-sin-movimiento'),
      ])
      setMasVendidos(safeArray(mv.data))
      setIngresosColeccion(safeArray(ic.data))
      setVentasPeriodo(safeArray(vp.data))
      setPorVendedor(safeArray(pv.data))
      setPorCliente(safeArray(pc.data))
      setSinMovimiento(safeArray(sm.data))
    } catch (err) { console.error(err) } finally { setCargando(false) }
  }

  useEffect(() => { cargar() }, [])

  return (
    <div style={s.pagina}>
      <SectionHeader
        title="Reportes"
        subtitle="Análisis de ventas e ingresos de ModaTrend"
        action={<Button onClick={() => cargar()} icon="🔄">Actualizar</Button>}
        theme="warm"
      />

      <div style={s.filtros}>
        <div style={s.filtroGrupo}>
          <label style={s.filtroLabel}>Desde</label>
          <input type="date" value={desde} onChange={e => setDesde(e.target.value)} style={s.filtroInput} />
        </div>
        <div style={s.filtroGrupo}>
          <label style={s.filtroLabel}>Hasta</label>
          <input type="date" value={hasta} onChange={e => setHasta(e.target.value)} style={s.filtroInput} />
        </div>
        <Button onClick={() => cargar()} icon="📊">Filtrar</Button>
        <Button variant="success" onClick={() => cargar(true)} icon="📥">Exportar CSV</Button>
      </div>

      {cargando ? <div style={s.emptyState}>Cargando reportes...</div> : (
        <div style={s.grid}>

          <div style={s.panel}>
            <div style={s.panelHeader}>
              <h2 style={s.panelTitle}>🏆 Productos más vendidos</h2>
            </div>
            <div style={{ ...s.panelBody, padding: 0 }}>
              <TopProductosWidget
                data={masVendidos}
                styles={s}
                rankStyle={(idx) => ({
                  background: idx === 0 ? '#ffd700' : idx === 1 ? '#c0c0c0' : idx === 2 ? '#cd7f32' : t.background,
                  color: idx < 3 ? t.textPrimary : t.textSecondary,
                })}
              />
            </div>
          </div>

          <div style={s.panel}>
            <div style={s.panelHeader}>
              <h2 style={s.panelTitle}>✨ Ingresos por colección</h2>
            </div>
            <div style={{ ...s.panelBody, padding: 0 }}>
              <IngresosColeccionWidget
                data={ingresosColeccion}
                styles={s}
                barColors={[t.primary, t.primary, t.primary, t.primary]}
              />
            </div>
          </div>

          <div style={{ ...s.panel, gridColumn: '1 / -1' }}>
            <div style={s.panelHeader}>
              <h2 style={s.panelTitle}>📅 Ventas por período</h2>
              <Badge theme="warm" variant="info" size="sm">{ventasPeriodo.length} ventas</Badge>
            </div>
            {ventasPeriodo.length === 0 ? (
              <div style={s.emptyData}>Selecciona un rango de fechas y presiona Filtrar</div>
            ) : (
              <table style={s.tabla}>
                <thead>
                  <tr>
                    {['ID', 'Fecha', 'Cliente', 'Vendedor', 'Total', 'Método pago', 'Estado'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {safeArray(ventasPeriodo).map(v => (
                    <tr key={v.id_venta} style={s.tr}>
                      <td style={s.td}><Badge theme="warm" variant="neutral" size="sm">#{v.id_venta}</Badge></td>
                      <td style={s.td}>{v.fecha?.split('T')[0] || v.fecha}</td>
                      <td style={s.td}>{v.cliente}</td>
                      <td style={s.td}>{v.vendedor}</td>
                      <td style={s.td}>
                        <strong style={{ color: t.primary }}>${Number(v.total_neto || 0).toLocaleString('es-CO')}</strong>
                      </td>
                      <td style={s.td}>{v.metodo_pago}</td>
                      <td style={s.td}>
                        <Badge theme="warm" variant={v.estado === 'confirmada' ? 'success' : 'danger'} size="sm">
                          {v.estado}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div style={s.panel}>
            <div style={s.panelHeader}>
              <h2 style={s.panelTitle}>👤 Ventas por vendedor</h2>
            </div>
            {porVendedor.length === 0 ? (
              <div style={s.emptyData}>Sin datos</div>
            ) : (
              <table style={s.tabla}>
                <thead>
                  <tr>
                    {['Vendedor', 'Ventas', 'Ingresos', 'Ticket prom.'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {safeArray(porVendedor).map((v, idx) => (
                    <tr key={idx} style={s.tr}>
                      <td style={s.td}>
                        <div style={{ fontWeight: typography.fontWeight.semibold }}>{v.vendedor}</div>
                        <div style={{ fontSize: typography.fontSize.small, color: t.textSecondary }}>{v.email}</div>
                      </td>
                      <td style={s.td}>
                        <Badge theme="warm" variant="neutral" size="sm">{v.total_ventas} ventas</Badge>
                      </td>
                      <td style={s.td}>
                        <strong style={{ color: t.primary }}>${Number(v.ingresos_totales || 0).toLocaleString('es-CO')}</strong>
                      </td>
                      <td style={s.td}>${Number(v.ticket_promedio || 0).toLocaleString('es-CO')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div style={s.panel}>
            <div style={s.panelHeader}>
              <h2 style={s.panelTitle}>👥 Ventas por cliente</h2>
            </div>
            {porCliente.length === 0 ? (
              <div style={s.emptyData}>Sin datos</div>
            ) : (
              <table style={s.tabla}>
                <thead>
                  <tr>
                    {['Cliente', 'Documento', 'Ventas', 'Ingresos', 'Última compra'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {safeArray(porCliente).map((c, idx) => (
                    <tr key={idx} style={s.tr}>
                      <td style={s.td}>
                        <div style={{ fontWeight: typography.fontWeight.semibold }}>{c.cliente}</div>
                      </td>
                      <td style={s.td}><Badge theme="warm" variant="neutral" size="sm">{c.documento}</Badge></td>
                      <td style={s.td}>
                        <Badge theme="warm" variant="neutral" size="sm">{c.total_ventas} ventas</Badge>
                      </td>
                      <td style={s.td}>
                        <strong style={{ color: t.primary }}>${Number(c.ingresos_totales || 0).toLocaleString('es-CO')}</strong>
                      </td>
                      <td style={s.td}>{c.ultima_compra?.split('T')[0] || c.ultima_compra || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div style={{ ...s.panel, gridColumn: '1 / -1' }}>
            <div style={s.panelHeader}>
              <h2 style={s.panelTitle}>📦 Productos sin movimiento</h2>
              <Badge theme="warm" variant="info" size="sm">{sinMovimiento.length} productos</Badge>
            </div>
            {sinMovimiento.length === 0 ? (
              <div style={s.emptyData}>Todos los productos tienen ventas registradas</div>
            ) : (
              <table style={s.tabla}>
                <thead>
                  <tr>
                    {['Referencia', 'Producto', 'Categoría', 'Colección', 'Stock', 'Estado'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {safeArray(sinMovimiento).map((p, idx) => (
                    <tr key={idx} style={s.tr}>
                      <td style={s.td}><Badge theme="warm" variant="neutral" size="sm">{p.referencia}</Badge></td>
                      <td style={s.td}>
                        <div style={{ fontWeight: typography.fontWeight.semibold }}>{p.nombre}</div>
                      </td>
                      <td style={s.td}>{p.categoria}</td>
                      <td style={s.td}>{p.coleccion}</td>
                      <td style={s.td}>
                        <Badge theme="warm" variant={p.stock_total <= 5 ? 'danger' : 'success'} size="sm">
                          {p.stock_total} uds
                        </Badge>
                      </td>
                      <td style={s.td}>
                        <Badge theme="warm" variant="warning" size="sm">Sin ventas</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>
      )}
    </div>
  )
}

const s = {
  pagina: {
    display: 'flex', flexDirection: 'column', gap: spacing.lg,
    height: '100%', overflowY: 'auto',
  },
  emptyState: {
    textAlign: 'center', padding: spacing.xl, color: t.textSecondary,
    fontSize: typography.fontSize.lead,
  },
  filtros: {
    display: 'flex', gap: spacing.sm, flexWrap: 'wrap', alignItems: 'flex-end',
  },
  filtroGrupo: {
    display: 'flex', flexDirection: 'column', gap: spacing.xs,
  },
  filtroLabel: {
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.semibold, color: t.textLabel,
  },
  filtroInput: {
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: radius.md,
    border: `1.5px solid ${t.border}`,
    fontSize: typography.fontSize.lead,
    background: t.surface, outline: 'none', color: t.textPrimary,
  },
  grid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.lg,
  },
  panel: {
    background: t.surface, borderRadius: radius.lg,
    overflow: 'hidden', boxShadow: shadows.sm,
  },
  panelHeader: {
    padding: `${spacing.md} ${spacing.lg}`,
    borderBottom: `1px solid ${t.borderLight}`,
    background: t.surface,
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  panelTitle: {
    fontSize: typography.fontSize.h3,
    fontWeight: typography.fontWeight.semibold, color: t.textPrimary, margin: 0,
  },
  panelBody: { padding: spacing.xs, overflowY: 'auto', flex: 1 },
  emptyData: {
    padding: spacing.xl, textAlign: 'center', color: t.textSecondary,
  },
  tabla: { width: '100%', borderCollapse: 'collapse' },
  th: {
    padding: `${spacing.sm} ${spacing.md}`,
    textAlign: 'left',
    fontSize: typography.fontSize.small,
    color: '#fff',
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: '0.5px',
    borderBottom: `1px solid ${t.borderLight}`,
    background: '#F78DA7',
  },
  tr: { borderBottom: `1px solid ${t.borderLight}` },
  td: {
    padding: `${spacing.sm} ${spacing.md}`,
    fontSize: typography.fontSize.lead,
    color: t.textPrimary,
  },

  /* Widget alias keys (compat con widgets Dashboard v2) */
  empty: { padding: spacing.xl, textAlign: 'center', color: t.textSecondary },
  rankNum: {
    width: '28px', height: '28px', borderRadius: radius.full,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.85rem', fontWeight: typography.fontWeight.bold,
  },
  prodNombre: { fontWeight: typography.fontWeight.semibold },
  prodRef: { fontSize: typography.fontSize.small, color: t.textSecondary },
  catBadge: { color: t.textPrimary },
  unidBadge: {
    background: t.secondary, color: t.primary,
    padding: `${spacing.xs} ${spacing.sm}`,
    borderRadius: radius.xl, fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.semibold,
  },
  ingresosVal: { color: t.primary, fontWeight: typography.fontWeight.bold },
  colItem: {
    display: 'flex', flexDirection: 'column', gap: spacing.sm,
    padding: `${spacing.md} ${spacing.lg}`,
    borderBottom: `1px solid ${t.borderLight}`,
  },
  colTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' },
  colNombre: {
    fontSize: typography.fontSize.lead,
    fontWeight: typography.fontWeight.semibold, color: t.textPrimary,
  },
  colSub: { fontSize: typography.fontSize.small, color: t.textSecondary },
  colVal: {
    color: t.primary, fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.lead,
  },
  barTrack: {
    height: '8px', background: t.background,
    borderRadius: radius.sm, overflow: 'hidden',
  },
  barFill: {
    height: '100%', background: t.primary, borderRadius: radius.sm,
    transition: `width ${transitions.slow}`,
  },
  colStats: {
    display: 'flex', gap: spacing.md, flexWrap: 'wrap',
    fontSize: typography.fontSize.body, color: t.textLabel,
  },
}
