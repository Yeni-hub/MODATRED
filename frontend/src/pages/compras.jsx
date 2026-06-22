import { useState, useEffect } from 'react'
import api from '../services/api'
import tokens from '../styles/tokens'
import SectionHeader from '../components/ui/SectionHeader'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'

const { colors, spacing, radius, typography, shadows, transitions } = tokens
const t = colors.warm

const safeArray = (data) => Array.isArray(data) ? data.filter(x => x != null) : []

export default function Compras() {
  const [compras, setCompras] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [variantes, setVariantes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [modal, setModal] = useState(false)
  const [detalle, setDetalle] = useState(null)
  const [alerta, setAlerta] = useState({ visible: false, mensaje: '', tipo: 'exito' })
  const [form, setForm] = useState({ id_proveedor: '', observaciones: '', items: [] })
  const [itemActual, setItemActual] = useState({ id_variante: '', cantidad: 1, precio_costo: '' })

  const mostrarAlerta = (mensaje, tipo = 'exito') => {
    setAlerta({ visible: true, mensaje, tipo })
    setTimeout(() => setAlerta({ visible: false, mensaje: '', tipo: 'exito' }), 3000)
  }

  const cargar = async () => {
    setCargando(true)
    try {
      const [c, p, v] = await Promise.all([
        api.get('/compras'),
        api.get('/proveedores'),
        api.get('/variantes'),
      ])
      setCompras(safeArray(c.data))
      setProveedores(safeArray(p.data).filter(p => p.activo === 1))
      setVariantes(safeArray(v.data))
    } catch (err) { console.error(err) } finally { setCargando(false) }
  }

  useEffect(() => { cargar() }, [])

  const abrirNueva = () => {
    setForm({ id_proveedor: '', observaciones: '', items: [] })
    setItemActual({ id_variante: '', cantidad: 1, precio_costo: '' })
    setModal(true)
  }

  const agregarItem = () => {
    if (!itemActual.id_variante || !itemActual.precio_costo) {
      mostrarAlerta('Selecciona una variante y precio de costo', 'error')
      return
    }
    const variante = safeArray(variantes).find(v => v.id_variante === Number(itemActual.id_variante))
    if (!variante) return
    const yaExiste = form.items.find(i => i.id_variante === Number(itemActual.id_variante))
    if (yaExiste) { mostrarAlerta('Esta variante ya está en la compra', 'error'); return }

    setForm({
      ...form,
      items: [...form.items, {
        id_variante: Number(itemActual.id_variante),
        cantidad: Number(itemActual.cantidad),
        precio_costo: Number(itemActual.precio_costo),
        nombre: `${variante.producto} — ${variante.talla} / ${variante.color}`,
      }]
    })
    setItemActual({ id_variante: '', cantidad: 1, precio_costo: '' })
  }

  const quitarItem = (idx) => {
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) })
  }

  const total = form.items.reduce((acc, i) => acc + i.cantidad * i.precio_costo, 0)

  const guardar = async () => {
    if (!form.id_proveedor) { mostrarAlerta('Selecciona un proveedor', 'error'); return }
    if (form.items.length === 0) { mostrarAlerta('Agrega al menos un producto', 'error'); return }
    try {
      await api.post('/compras', {
        id_proveedor: Number(form.id_proveedor),
        observaciones: form.observaciones,
        items: safeArray(form.items).map(i => ({ id_variante: i.id_variante, cantidad: i.cantidad, precio_costo: i.precio_costo }))
      })
      mostrarAlerta('✅ Compra registrada y stock actualizado')
      setModal(false)
      cargar()
    } catch (err) {
      console.error(err)
      mostrarAlerta(err.response?.data?.error || 'Error al registrar compra', 'error')
    }
  }

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
        title="Compras"
        subtitle="Registro de compras a proveedores — actualiza el inventario automáticamente"
        action={<Button onClick={abrirNueva} icon="+">Nueva compra</Button>}
        theme="warm"
      />

      {cargando ? (
        <div style={s.emptyState}>Cargando...</div>
      ) : compras.length === 0 ? (
        <div style={s.emptyState}>No hay compras registradas</div>
      ) : (
        <div style={s.tablaWrap}>
          <table style={s.tabla}>
            <thead>
              <tr>
                {['#', 'Fecha', 'Proveedor', 'Usuario', 'Total', 'Acciones'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {safeArray(compras).map(c => (
                <tr key={c.id_compra} style={s.tr}>
                  <td style={s.td}>
                    <Badge theme="warm" variant="neutral" size="sm">#{c.id_compra}</Badge>
                  </td>
                  <td style={s.td}>{new Date(c.fecha).toLocaleDateString('es-CO')}</td>
                  <td style={s.td}><span style={{ fontWeight: typography.fontWeight.semibold }}>{c.proveedor}</span></td>
                  <td style={s.td}>{c.usuario}</td>
                  <td style={s.td}>
                    <strong style={{ color: t.primary }}>
                      ${Number(c.total).toLocaleString('es-CO')}
                    </strong>
                  </td>
                  <td style={s.td}>
                    <Button size="sm" variant="secondary" onClick={() => setDetalle(c)} icon="👁">
                      Ver detalle
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} maxWidth="700px">
        <Modal.Header title="Nueva compra" />
        <Modal.Body>
          <div style={s.formGroup}>
            <label style={s.label}>Proveedor *</label>
            <select style={s.input} value={form.id_proveedor}
              onChange={e => setForm({ ...form, id_proveedor: e.target.value })}>
              <option value="">Seleccionar proveedor...</option>
              {safeArray(proveedores).map(p => <option key={p.id_proveedor} value={p.id_proveedor}>{p.nombre}</option>)}
            </select>
          </div>

          <div style={s.seccion}>
            <p style={s.seccionTitulo}>Agregar productos</p>
            <div style={s.itemFila}>
              <select style={{ ...s.input, flex: 2 }} value={itemActual.id_variante}
                onChange={e => setItemActual({ ...itemActual, id_variante: e.target.value })}>
                <option value="">Seleccionar variante...</option>
                {safeArray(variantes).map(v => (
                  <option key={v.id_variante} value={v.id_variante}>
                    {v.producto} — {v.talla}/{v.color}
                  </option>
                ))}
              </select>
              <input style={{ ...s.input, flex: 1 }} type="number" min="1" placeholder="Cant."
                value={itemActual.cantidad}
                onChange={e => setItemActual({ ...itemActual, cantidad: e.target.value })} />
              <input style={{ ...s.input, flex: 1 }} type="number" placeholder="Precio costo"
                value={itemActual.precio_costo}
                onChange={e => setItemActual({ ...itemActual, precio_costo: e.target.value })} />
              <Button size="sm" variant="primary" onClick={agregarItem}>+ Agregar</Button>
            </div>
          </div>

          {form.items.length > 0 && (
            <div style={s.listaItems}>
              {safeArray(form.items).map((item, idx) => (
                <div key={idx} style={s.itemRow}>
                  <span style={{ flex: 2, fontSize: typography.fontSize.body }}>{item.nombre}</span>
                  <span style={s.itemDato}>x{item.cantidad}</span>
                  <span style={s.itemDato}>${Number(item.precio_costo).toLocaleString('es-CO')}</span>
                  <span style={{ ...s.itemDato, fontWeight: typography.fontWeight.bold, color: t.primary }}>
                    ${(item.cantidad * item.precio_costo).toLocaleString('es-CO')}
                  </span>
                  <Button size="sm" variant="danger" onClick={() => quitarItem(idx)}>✕</Button>
                </div>
              ))}
              <div style={s.totalRow}>
                <span>Total compra:</span>
                <strong style={{ color: t.primary }}>${total.toLocaleString('es-CO')}</strong>
              </div>
            </div>
          )}

          <div style={s.formGroup}>
            <label style={s.label}>Observaciones</label>
            <textarea style={s.textarea} value={form.observaciones}
              onChange={e => setForm({ ...form, observaciones: e.target.value })}
              placeholder="Observaciones de la compra..." rows={2} />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button theme="warm" variant="ghost" onClick={() => setModal(false)}>Cancelar</Button>
          <Button theme="warm" variant="primary" onClick={guardar}>✓ Registrar compra</Button>
        </Modal.Footer>
      </Modal>

      <Modal open={!!detalle} onClose={() => setDetalle(null)} maxWidth="500px">
        <Modal.Header title={`Compra #${detalle?.id_compra}`} />
        <Modal.Body>
          <div style={s.detalleGrid}>
            <div>
              <span style={s.detalleLabel}>Proveedor</span>
              <p style={s.detalleValor}>{detalle?.proveedor}</p>
            </div>
            <div>
              <span style={s.detalleLabel}>Fecha</span>
              <p style={s.detalleValor}>{detalle && new Date(detalle.fecha).toLocaleDateString('es-CO')}</p>
            </div>
          </div>
          <div style={s.totalRow}>
            <span>Total:</span>
            <strong style={{ color: t.primary }}>${Number(detalle?.total || 0).toLocaleString('es-CO')}</strong>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button theme="warm" variant="ghost" onClick={() => setDetalle(null)}>Cerrar</Button>
        </Modal.Footer>
      </Modal>
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
  tablaWrap: {
    background: t.surface, borderRadius: radius.lg,
    overflow: 'hidden',
    boxShadow: shadows.sm,
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
    display: 'flex', flexDirection: 'column', gap: spacing.sm,
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
    marginTop: spacing.xs,
  },
  detalleGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md,
  },
  detalleLabel: {
    fontSize: typography.fontSize.small,
    color: t.textSecondary,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: '0.5px',
  },
  detalleValor: {
    fontSize: typography.fontSize.lead,
    color: t.textPrimary,
    marginTop: spacing.xs,
    fontWeight: typography.fontWeight.medium,
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
}
