import { useState, useEffect } from 'react'
import api from '../services/api'
import tokens from '../styles/tokens'
import SectionHeader from '../components/ui/SectionHeader'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'

const { colors, spacing, radius, typography, shadows, transitions } = tokens
const t = colors.warm

const safeArray = (data) => Array.isArray(data) ? data.filter(x => x != null) : []
const safeObject = (obj) => obj ?? {}

const ESTADOS = {
  confirmada:  { label: 'Confirmada',        color: t.success, bg: '#e6f4ea', icono: '✅' },
  en_entrega:  { label: 'En proceso entrega', color: '#c4955a', bg: '#fef3e6', icono: '🚚' },
  entregada:   { label: 'Entregada',          color: '#7a8cb5', bg: '#eef0f8', icono: '📦' },
  anulada:     { label: 'Anulada',            color: t.danger,  bg: '#fef0f0', icono: '✕' },
}

const METODOS_PAGO = [
  { value: 'efectivo',    label: '💵 Efectivo' },
  { value: 'tarjeta',     label: '💳 Tarjeta' },
  { value: 'credito',     label: '📋 Crédito' },
  { value: 'saldo_favor', label: '🎁 Saldo a favor' },
]

export default function Ventas() {
  console.log('🧪 Ventas component MOUNTED');
  const [ventas, setVentas] = useState([])
  const [clientes, setClientes] = useState([])
  const [variantes, setVariantes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [modal, setModal] = useState(false)
  const [detalle, setDetalle] = useState(null)
  const [confirmAnular, setConfirmAnular] = useState(null)
  const [filtroEstado, setFiltroEstado] = useState('')
  const [alerta, setAlerta] = useState({ visible: false, mensaje: '', tipo: 'exito' })
  const [form, setForm] = useState({
    id_cliente: '', descuento_pct: 0, metodo_pago: 'efectivo', observaciones: '', items: []
  })
  const [itemActual, setItemActual] = useState({ id_variante: '', cantidad: 1, precio_venta: '' })

  const mostrarAlerta = (mensaje, tipo = 'exito') => {
    setAlerta({ visible: true, mensaje, tipo })
    setTimeout(() => setAlerta({ visible: false, mensaje: '', tipo: 'exito' }), 3500)
  }

  const cargar = async () => {
    setCargando(true)
    try {
      const params = {}
      if (filtroEstado) params.estado = filtroEstado
      const [v, c, var_] = await Promise.all([
        api.get('/ventas', { params }),
        api.get('/clientes'),
        api.get('/variantes'),
      ])
      setVentas(safeArray(v.data))
      setClientes(safeArray(c.data).filter(c => c.activo === 1))
      setVariantes(safeArray(var_.data))
    } catch (err) {
      console.error(err)
      mostrarAlerta(err.response?.data?.error || 'Error al cargar datos', 'error')
    } finally { setCargando(false) }
  }

  useEffect(() => { cargar() }, [filtroEstado])

  const clienteSeleccionado = safeArray(clientes).find(c => c.id_cliente === Number(form.id_cliente))

  const abrirNueva = () => {
    setForm({ id_cliente: '', descuento_pct: 0, metodo_pago: 'efectivo', observaciones: '', items: [] })
    setItemActual({ id_variante: '', cantidad: 1, precio_venta: '' })
    setModal(true)
  }

  const agregarItem = () => {
    if (!itemActual.id_variante || !itemActual.precio_venta) {
      mostrarAlerta('Selecciona una variante y precio', 'error')
      return
    }
    const variante = safeArray(variantes).find(v => v.id_variante === Number(itemActual.id_variante))
    if (!variante) return
    if (safeArray(form.items).find(i => i.id_variante === Number(itemActual.id_variante))) {
      mostrarAlerta('Esta variante ya está en la venta', 'error')
      return
    }
    if (Number(itemActual.cantidad) > variante.stock) {
      mostrarAlerta(`Stock insuficiente. Disponible: ${variante.stock} uds`, 'error')
      return
    }
    setForm({
      ...form,
      items: [...form.items, {
        id_variante: Number(itemActual.id_variante),
        cantidad: Number(itemActual.cantidad),
        precio_venta: Number(itemActual.precio_venta),
        nombre: `${variante.producto} — ${variante.talla} / ${variante.color}`,
        stock: variante.stock,
        costo: variante.precio_costo,
      }]
    })
    setItemActual({ id_variante: '', cantidad: 1, precio_venta: '' })
  }

  const quitarItem = (idx) => {
    setForm({ ...form, items: safeArray(form.items).filter((_, i) => i !== idx) })
  }

  const totalBruto = safeArray(form.items).reduce((acc, i) => acc + i.cantidad * i.precio_venta, 0)
  const totalNeto = totalBruto * (1 - form.descuento_pct / 100)

  const guardar = async () => {
    if (!form.id_cliente) { mostrarAlerta('Selecciona un cliente', 'error'); return }
    if (safeArray(form.items).length === 0) { mostrarAlerta('Agrega al menos un producto', 'error'); return }
    if (form.descuento_pct > 50) { mostrarAlerta('El descuento no puede superar el 50%', 'error'); return }
    if (form.metodo_pago === 'saldo_favor' && clienteSeleccionado) {
      if (clienteSeleccionado.saldo_favor < totalNeto) {
        mostrarAlerta(`Saldo insuficiente. El cliente tiene $${Number(clienteSeleccionado.saldo_favor).toLocaleString('es-CO')}`, 'error')
        return
      }
    }
    try {
      await api.post('/ventas', {
        id_cliente: Number(form.id_cliente),
        descuento_pct: Number(form.descuento_pct),
        metodo_pago: form.metodo_pago,
        observaciones: form.observaciones,
        items: safeArray(form.items).map(i => ({
          id_variante: i.id_variante, cantidad: i.cantidad, precio_venta: i.precio_venta,
        }))
      })
      mostrarAlerta('✅ Venta registrada exitosamente')
      setModal(false)
      cargar()
    } catch (err) {
      console.error(err)
      mostrarAlerta(err.response?.data?.error || 'Error al registrar venta', 'error')
    }
  }

  const cambiarEstado = async (id, estado) => {
    try {
      await api.put(`/ventas/${id}/estado`, { estado })
      mostrarAlerta(`Estado actualizado: ${ESTADOS[estado].label}`)
      if (detalle) {
        const { data } = await api.get(`/ventas/${id}`)
        setDetalle(data)
      }
      cargar()
    } catch (err) {
      console.error(err)
      mostrarAlerta(err.response?.data?.error || 'Error al cambiar estado', 'error')
    }
  }

  const anular = async (id) => {
    try {
      await api.put(`/ventas/${id}/anular`, {})
      mostrarAlerta('Venta anulada y stock restaurado')
      setConfirmAnular(null)
      setDetalle(null)
      cargar()
    } catch (err) {
      console.error(err)
      mostrarAlerta(err.response?.data?.error || 'Error al anular venta', 'error')
    }
  }

  const verDetalle = async (id) => {
    try {
      const { data } = await api.get(`/ventas/${id}`)
      if (data == null) return
      setDetalle(data)
    } catch (err) {
      console.error(err)
      mostrarAlerta(err.response?.data?.error || 'Error al cargar detalle', 'error')
    }
  }

  const ventasSeguras = safeArray(ventas)

  const contadores = Object.keys(ESTADOS).reduce((acc, e) => {
    acc[e] = safeArray(ventasSeguras).filter(v => v?.estado === e).length
    return acc
  }, {})

  console.log('🧪 ventas:', ventas, '| cargando:', cargando, '| modal:', modal);
  console.log('🧪 clientes:', clientes);
  console.log('🧪 variantes:', variantes);
  console.log('🧪 form:', form);
  console.log('🧪 detalle:', detalle);

  return (
    <div style={s.pagina}>
      {alerta.visible && (
        <div style={{
          ...s.alerta,
          background: alerta.tipo === 'exito' ? '#e6f4ea' : '#fff5f5',
          borderColor: alerta.tipo === 'exito' ? t.success : t.danger,
          color: alerta.tipo === 'exito' ? t.success : t.danger,
        }}>
          {alerta.tipo === 'exito' ? '✅' : '❌'} {alerta.mensaje}
        </div>
      )}

      <SectionHeader
        title="Ventas"
        subtitle="Registro y seguimiento de pedidos"
        action={<Button onClick={abrirNueva} icon="+">Nueva venta</Button>}
        theme="warm"
      />

      <div style={s.estadoCards}>
        {Object.entries(ESTADOS).map(([key, val]) => (
          <button
            key={key}
            onClick={() => setFiltroEstado(filtroEstado === key ? '' : key)}
            style={{
              ...s.estadoCard,
              borderColor: filtroEstado === key ? val.color : 'transparent',
              background: filtroEstado === key ? val.bg : t.surface,
            }}
          >
            <span style={s.estadoCardIcono}>{val.icono}</span>
            <div>
              <div style={{ ...s.estadoCardNum, color: val.color }}>{contadores[key]}</div>
              <div style={s.estadoCardLabel}>{val.label}</div>
            </div>
          </button>
        ))}
      </div>

      {cargando ? (
        <div style={s.emptyState}>Cargando...</div>
      ) : ventasSeguras.length === 0 ? (
        <div style={s.emptyState}>
          No hay ventas {filtroEstado ? `con estado "${ESTADOS[filtroEstado]?.label ?? filtroEstado}"` : 'registradas'}
        </div>
      ) : (
        <div style={s.tablaWrap}>
          <table style={s.tabla}>
            <thead>
              <tr>
                {['#', 'Fecha', 'Cliente', 'Método pago', 'Descuento', 'Total neto', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {console.log('🧪 ventasSeguras (corregido):', ventasSeguras, '| nulos:', ventasSeguras.filter(x => x == null))}
              {ventasSeguras.filter(v => v != null).map(v => (
                <tr key={v?.id_venta} style={s.tr}>
                  <td style={s.td}>
                    <Badge theme="warm" variant="neutral" size="sm">#{v?.id_venta}</Badge>
                  </td>
                  <td style={s.td}>{v?.fecha ? new Date(v.fecha).toLocaleDateString('es-CO') : '-'}</td>
                  <td style={s.td}>
                    <span style={{ fontWeight: typography.fontWeight.semibold }}>{v?.cliente ?? 'Sin cliente'}</span>
                    <div style={s.docText}>{v?.documento ?? ''}</div>
                  </td>
                  <td style={s.td}>
                    <Badge theme="warm" variant="info" size="sm">
                      {METODOS_PAGO.find(m => m.value === v?.metodo_pago)?.label || v?.metodo_pago}
                    </Badge>
                  </td>
                  <td style={s.td}>{v?.descuento_pct ?? '-'}%</td>
                  <td style={s.td}>
                    <strong>${Number(v?.total_neto ?? 0).toLocaleString('es-CO')}</strong>
                  </td>
                  <td style={s.td}>
                    <span style={{
                      ...s.estadoBadge,
                      background: ESTADOS[v?.estado]?.bg || t.background,
                      color: ESTADOS[v?.estado]?.color || t.textSecondary,
                    }}>
                      {ESTADOS[v?.estado]?.icono} {ESTADOS[v?.estado]?.label ?? 'Desconocido'}
                    </span>
                  </td>
                  <td style={s.td}>
                    <div style={s.acciones}>
                      <Button size="sm" variant="secondary" onClick={() => verDetalle(v?.id_venta)} icon="👁">
                        Ver
                      </Button>
                      {v?.estado !== 'anulada' && v?.estado !== 'entregada' && (
                        <Button size="sm" variant="danger" onClick={() => setConfirmAnular(v)}>✕</Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} maxWidth="720px">
        <Modal.Header title="Nueva venta" />
        <Modal.Body>
          <div style={s.formRow3}>
            <div style={s.formGroup}>
              <label style={s.label}>Cliente *</label>
              <select style={s.input} value={form.id_cliente}
                onChange={e => setForm({ ...form, id_cliente: e.target.value })}>
                <option value="">Seleccionar cliente...</option>
                {safeArray(clientes).map(c => (
                  <option key={c.id_cliente} value={c.id_cliente}>
                    {c.nombre} {c.saldo_favor > 0 ? `(Saldo: $${Number(c.saldo_favor).toLocaleString('es-CO')})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Método de pago</label>
              <select style={s.input} value={form.metodo_pago}
                onChange={e => setForm({ ...form, metodo_pago: e.target.value })}>
                {METODOS_PAGO.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Descuento % (máx. 50%)</label>
              <input style={s.input} type="number" min="0" max="50"
                value={form.descuento_pct}
                onChange={e => setForm({ ...form, descuento_pct: e.target.value })} />
            </div>
          </div>

          {form.metodo_pago === 'saldo_favor' && clienteSeleccionado && (
            <div style={s.saldoInfo}>
              🎁 Saldo disponible del cliente:
              <strong style={{ color: t.success, marginLeft: spacing.sm }}>
                ${Number(clienteSeleccionado.saldo_favor).toLocaleString('es-CO')}
              </strong>
            </div>
          )}

          <div style={s.seccion}>
            <p style={s.seccionTitulo}>Agregar productos</p>
            <div style={s.itemFila}>
              <select style={{ ...s.input, flex: 2 }} value={itemActual.id_variante}
                onChange={e => setItemActual({ ...itemActual, id_variante: e.target.value })}>
                <option value="">Seleccionar variante...</option>
                {safeArray(variantes).map(v => (
                  <option key={v.id_variante} value={v.id_variante}>
                    {v.producto} — {v.talla}/{v.color} (Stock: {v.stock})
                  </option>
                ))}
              </select>
              <input style={{ ...s.input, flex: '0 0 80px' }} type="number" min="1"
                placeholder="Cant."
                value={itemActual.cantidad}
                onChange={e => setItemActual({ ...itemActual, cantidad: e.target.value })} />
              <input style={{ ...s.input, flex: 1 }} type="number"
                placeholder="Precio venta"
                value={itemActual.precio_venta}
                onChange={e => setItemActual({ ...itemActual, precio_venta: e.target.value })} />
              <Button size="sm" variant="primary" onClick={agregarItem}>+ Agregar</Button>
            </div>
          </div>

          {form.items.length > 0 && (
            <div style={s.listaItems}>
              {safeArray(form.items).map((item, idx) => (
                <div key={idx} style={s.itemRow}>
                  <span style={{ flex: 2, fontSize: typography.fontSize.body }}>{item.nombre}</span>
                  <span style={s.itemDato}>x{item.cantidad}</span>
                  <span style={s.itemDato}>${Number(item.precio_venta).toLocaleString('es-CO')}</span>
                  <span style={{ ...s.itemDato, fontWeight: typography.fontWeight.bold, color: t.primary }}>
                    ${(item.cantidad * item.precio_venta).toLocaleString('es-CO')}
                  </span>
                  <Button size="sm" variant="danger" onClick={() => quitarItem(idx)}>✕</Button>
                </div>
              ))}
              <div style={s.totalRow}>
                <span>Total bruto:</span>
                <strong>${totalBruto.toLocaleString('es-CO')}</strong>
              </div>
              <div style={{ ...s.totalRow, color: t.primary, fontSize: typography.fontSize.h3 }}>
                <span>Total neto ({form.descuento_pct}% desc):</span>
                <strong>${Math.round(totalNeto).toLocaleString('es-CO')}</strong>
              </div>
            </div>
          )}

          <div style={s.formGroup}>
            <label style={s.label}>Observaciones</label>
            <textarea style={s.textarea} value={form.observaciones}
              onChange={e => setForm({ ...form, observaciones: e.target.value })}
              placeholder="Observaciones de la venta..." rows={2} />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button theme="warm" variant="ghost" onClick={() => setModal(false)}>Cancelar</Button>
          <Button theme="warm" variant="primary" onClick={guardar}>✓ Registrar venta</Button>
        </Modal.Footer>
      </Modal>

      <Modal open={!!detalle} onClose={() => setDetalle(null)} maxWidth="660px">
        <Modal.Header title={`Pedido #${detalle?.id_venta}`} />
        <Modal.Body>
          <div style={s.detalleGrid}>
            <div>
              <span style={s.detalleLabel}>Cliente</span>
              <p style={s.detalleValor}>{detalle?.cliente ?? 'Sin cliente'}</p>
            </div>
            <div>
              <span style={s.detalleLabel}>Vendedor</span>
              <p style={s.detalleValor}>{detalle?.vendedor ?? 'Sin vendedor'}</p>
            </div>
            <div>
              <span style={s.detalleLabel}>Fecha</span>
              <p style={s.detalleValor}>{detalle && new Date(detalle.fecha).toLocaleDateString('es-CO')}</p>
            </div>
            <div>
              <span style={s.detalleLabel}>Método pago</span>
              <p style={s.detalleValor}>{METODOS_PAGO.find(m => m.value === detalle?.metodo_pago)?.label ?? detalle?.metodo_pago ?? '-'}</p>
            </div>
            <div>
              <span style={s.detalleLabel}>Descuento</span>
              <p style={s.detalleValor}>{detalle?.descuento_pct}%</p>
            </div>
            <div>
              <span style={s.detalleLabel}>Total neto</span>
              <p style={{ ...s.detalleValor, color: t.primary, fontWeight: typography.fontWeight.bold }}>
                ${Number(detalle?.total_neto || 0).toLocaleString('es-CO')}
              </p>
            </div>
          </div>

          {detalle?.estado != null && detalle.estado !== 'anulada' && (
            <div style={s.estadoSection}>
              <p style={s.label}>Estado del pedido</p>
              <div style={s.estadoBotones}>
                {Object.entries(ESTADOS).filter(([k]) => k !== 'anulada').map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => detalle && cambiarEstado(detalle.id_venta, key)}
                    style={{
                      ...s.estadoBtn,
                      background: detalle?.estado === key ? val.bg : t.background,
                      color: detalle?.estado === key ? val.color : t.textSecondary,
                      borderColor: detalle?.estado === key ? val.color : 'transparent',
                      fontWeight: detalle?.estado === key ? typography.fontWeight.bold : typography.fontWeight.regular,
                    }}
                  >
                    {val.icono} {val.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <table style={s.tabla}>
            <thead>
              <tr>
                {['Producto', 'Talla', 'Color', 'Cant.', 'Precio', 'Subtotal'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {safeArray(detalle?.detalle).map((d, i) => (
                <tr key={i} style={s.tr}>
                  <td style={s.td}>{d.producto}</td>
                  <td style={s.td}>{d.talla}</td>
                  <td style={s.td}>{d.color}</td>
                  <td style={s.td}>{d.cantidad}</td>
                  <td style={s.td}>${Number(d.precio_venta).toLocaleString('es-CO')}</td>
                  <td style={s.td}><strong>${Number(d.cantidad * d.precio_venta).toLocaleString('es-CO')}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Modal.Body>
        <Modal.Footer>
          {detalle?.estado != null && detalle.estado !== 'anulada' && (
            <Button theme="warm" variant="ghost"
              onClick={() => { setConfirmAnular({ id_venta: detalle.id_venta, cliente: detalle.cliente }); setDetalle(null) }}>
              ✕ Anular pedido
            </Button>
          )}
          <Button theme="warm" variant="primary" onClick={() => setDetalle(null)}>Cerrar</Button>
        </Modal.Footer>
      </Modal>

      <ConfirmDialog
        open={!!confirmAnular}
        onClose={() => setConfirmAnular(null)}
        onConfirm={() => anular(confirmAnular.id_venta)}
        title="¿Anular venta?"
        message={
          <>¿Anular la venta <strong>#{confirmAnular?.id_venta}</strong> de <strong>{confirmAnular?.cliente ?? 'cliente desconocido'}</strong>? El stock será restaurado automáticamente.</>
        }
        confirmText="✕ Sí, anular"
      />
    </div>
  )
}

const s = {
  pagina: {
    display: 'flex', flexDirection: 'column', gap: spacing.lg,
    height: '100%', position: 'relative',
  },
  alerta: {
    position: 'fixed', top: spacing.lg, right: spacing.lg,
    padding: `${spacing.md} ${spacing.lg}`,
    borderRadius: radius.md,
    fontSize: typography.fontSize.lead,
    fontWeight: typography.fontWeight.semibold,
    zIndex: 2000, border: '1px solid',
    boxShadow: shadows.md,
  },
  emptyState: {
    textAlign: 'center', padding: spacing.xl, color: t.textSecondary,
    fontSize: typography.fontSize.lead,
  },
  estadoCards: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: spacing.sm,
  },
  estadoCard: {
    display: 'flex', alignItems: 'center', gap: spacing.sm,
    padding: `${spacing.md} ${spacing.lg}`,
    borderRadius: radius.md, cursor: 'pointer',
    transition: `all ${transitions.fast}`, border: '2px solid',
  },
  estadoCardIcono: { fontSize: '1.4rem' },
  estadoCardNum: {
    fontSize: typography.fontSize.kpi,
    fontWeight: typography.fontWeight.bold, lineHeight: 1,
  },
  estadoCardLabel: {
    fontSize: typography.fontSize.small,
    color: t.textSecondary, marginTop: '2px',
  },
  tablaWrap: {
    background: t.surface, borderRadius: radius.lg,
    overflow: 'hidden', boxShadow: shadows.sm,
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
  docText: {
    fontSize: typography.fontSize.small,
    color: t.textSecondary, marginTop: '2px',
  },
  estadoBadge: {
    padding: `${spacing.xs} ${spacing.sm}`,
    borderRadius: radius.xl,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.semibold,
    display: 'inline-flex', alignItems: 'center', gap: spacing.xs,
  },
  acciones: { display: 'flex', gap: spacing.xs },
  formRow3: {
    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: spacing.sm,
  },
  formGroup: {
    display: 'flex', flexDirection: 'column', gap: spacing.xs,
  },
  label: {
    fontSize: typography.fontSize.lead,
    fontWeight: typography.fontWeight.semibold,
    color: t.textLabel,
  },
  input: {
    padding: '14px 16px',
    borderRadius: radius.md,
    border: `1.5px solid ${t.border}`,
    fontSize: typography.fontSize.lead,
    outline: 'none', color: t.textPrimary,
    background: t.surface,
    boxSizing: 'border-box', width: '100%',
    transition: `border-color ${transitions.fast}`,
  },
  textarea: {
    padding: '14px 16px',
    borderRadius: radius.md,
    border: `1.5px solid ${t.border}`,
    fontSize: typography.fontSize.lead,
    outline: 'none', color: t.textPrimary,
    background: t.surface,
    resize: 'vertical', fontFamily: typography.fontFamily,
    width: '100%', boxSizing: 'border-box',
    transition: `border-color ${transitions.fast}`,
  },
  saldoInfo: {
    background: '#e6f4ea', border: `1px solid ${t.success}`,
    borderRadius: radius.md, padding: `${spacing.sm} ${spacing.md}`,
    fontSize: typography.fontSize.lead, color: t.success,
  },
  seccion: {
    background: t.surface, borderRadius: radius.md,
    padding: spacing.md, border: `1px solid ${t.borderLight}`,
  },
  seccionTitulo: {
    fontSize: typography.fontSize.lead,
    fontWeight: typography.fontWeight.semibold,
    color: t.textLabel, margin: `0 0 ${spacing.sm} 0`,
  },
  itemFila: {
    display: 'flex', gap: spacing.sm, alignItems: 'center', flexWrap: 'wrap',
  },
  listaItems: {
    background: t.background, borderRadius: radius.md,
    padding: spacing.md,
    display: 'flex', flexDirection: 'column', gap: spacing.xs,
  },
  itemRow: {
    display: 'flex', alignItems: 'center', gap: spacing.sm,
    background: t.surface, borderRadius: radius.sm,
    padding: `${spacing.sm} ${spacing.md}`,
  },
  itemDato: {
    fontSize: typography.fontSize.body, color: t.textPrimary,
    minWidth: '80px', textAlign: 'right',
  },
  totalRow: {
    display: 'flex', justifyContent: 'space-between',
    padding: `${spacing.sm} 0`,
    fontSize: typography.fontSize.lead,
    color: t.textPrimary,
    borderTop: `1px solid ${t.borderLight}`,
  },
  detalleGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: spacing.sm,
  },
  detalleLabel: {
    fontSize: typography.fontSize.small,
    color: t.textSecondary,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: '0.5px',
  },
  detalleValor: {
    fontSize: typography.fontSize.lead,
    color: t.textPrimary, marginTop: spacing.xs,
    fontWeight: typography.fontWeight.medium,
  },
  estadoSection: {
    background: t.surface, borderRadius: radius.md,
    padding: spacing.md, border: `1px solid ${t.borderLight}`,
  },
  estadoBotones: {
    display: 'flex', gap: spacing.sm, marginTop: spacing.sm, flexWrap: 'wrap',
  },
  estadoBtn: {
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: radius.xl, border: '1.5px solid',
    fontSize: typography.fontSize.body, cursor: 'pointer',
    transition: `all ${transitions.fast}`,
  },
}
