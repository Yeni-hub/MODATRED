import { useState, useEffect } from 'react'
import api from '../services/api'
import tokens from '../styles/tokens'
import SectionHeader from '../components/ui/SectionHeader'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import DataTable from '../components/ui/DataTable'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'

const { colors, spacing, radius, typography, transitions } = tokens
const t = colors.warm

const safeArray = (data) => Array.isArray(data) ? data.filter(x => x != null) : []

const TALLAS = ['XS','S','M','L','XL','XXL','36','37','38','39','40','41','42','U']

export default function Variantes() {
  const [variantes, setVariantes] = useState([])
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [filtroProd, setFiltroProd] = useState('')
  const [form, setForm] = useState({
    id_producto: '', talla: '', color: '', stock: 0, precio_costo: ''
  })

  const cargar = async () => {
    setCargando(true)
    try {
      const params = {}
      if (filtroProd) params.id_producto = filtroProd
      const [v, p] = await Promise.all([
        api.get('/variantes', { params }),
        api.get('/productos'),
      ])
      setVariantes(safeArray(v.data))
      setProductos(safeArray(p.data))
    } catch (err) { console.error(err) } finally { setCargando(false) }
  }

  useEffect(() => { cargar() }, [filtroProd])

  const abrirNuevo = () => {
    setEditando(null)
    setForm({ id_producto: '', talla: '', color: '', stock: 0, precio_costo: '' })
    setModal(true)
  }

  const abrirEditar = (v) => {
    setEditando(v)
    setForm({
      id_producto: v.id_producto, talla: v.talla,
      color: v.color, stock: v.stock, precio_costo: String(v.precio_costo),
    })
    setModal(true)
  }

  const guardar = async () => {
    if (!form.id_producto || !form.talla || !form.color) {
      alert('Completa los campos obligatorios')
      return
    }
    const payload = { ...form, precio_costo: Number(form.precio_costo) || 0 }
    try {
      if (editando) {
        await api.put(`/variantes/${editando.id_variante}`, payload)
      } else {
        await api.post('/variantes', payload)
      }
      setModal(false)
      cargar()
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.error || 'Error al guardar variante')
    }
  }

  const eliminar = async (id) => {
    try {
      await api.delete(`/variantes/${id}`)
      setConfirmDelete(null)
      cargar()
    } catch (err) { console.error(err); alert('Error al eliminar variante') }
  }

  const columns = [
    { key: 'producto', label: 'PRODUCTO' },
    { key: 'referencia', label: 'REFERENCIA', width: '110px',
      render: (v) => <Badge theme="warm" variant="neutral">{v.referencia}</Badge> },
    { key: 'talla', label: 'TALLA', width: '70px',
      render: (v) => <Badge theme="accent" variant="blue">{v.talla}</Badge> },
    { key: 'color', label: 'COLOR', width: '130px',
      render: (v) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <div style={{
            width: '16px', height: '16px', borderRadius: '50%',
            background: v.color?.toLowerCase() || '#ccc',
            border: '1px solid rgba(0,0,0,0.1)', flexShrink: 0,
          }} />
          {v.color}
        </div>
      )},
    { key: 'stock', label: 'STOCK', width: '100px',
      render: (v) => (
        <Badge theme="warm" variant={v.stock <= 5 ? 'danger' : 'success'}>
          {v.stock} uds
        </Badge>
      )},
    { key: 'precio', label: 'P. COSTO', width: '110px',
      render: (v) => `$${Number(v.precio_costo).toLocaleString('es-CO')}` },
    { key: 'acciones', label: 'ACCIONES', width: '120px',
      render: (v) => (
        <div style={{ display: 'flex', gap: spacing.xs }}>
          <Button size="sm" variant="secondary" onClick={() => abrirEditar(v)}>✏️</Button>
          <Button size="sm" variant="danger" onClick={() => setConfirmDelete(v)}>🗑️</Button>
        </div>
      )},
  ]

  return (
    <div style={s.pagina}>

      <SectionHeader
        title="Variantes"
        subtitle="Gestiona tallas, colores y stock por producto"
        action={<Button onClick={abrirNuevo} icon="+">Nueva variante</Button>}
        theme="warm"
      />

      {/* Filtro */}
      <div style={s.filtros}>
        <select value={filtroProd} onChange={e => setFiltroProd(e.target.value)} style={s.select}>
          <option value="">Todos los productos</option>
          {safeArray(productos).map(p => (
            <option key={p.id_producto} value={p.id_producto}>{p.nombre}</option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      {cargando ? (
        <div style={s.emptyState}>Cargando...</div>
      ) : (
        <DataTable
          theme="warm"
          columns={columns}
          data={variantes}
          emptyMessage="No hay variantes registradas"
        />
      )}

      <Modal open={modal} onClose={() => setModal(false)}>
        <Modal.Header title={editando ? 'Editar variante' : 'Nueva variante'} />
        <Modal.Body>
          <div style={s.formGroup}>
            <label style={s.label}>Producto *</label>
            <select style={s.input} value={form.id_producto}
              onChange={e => setForm({...form, id_producto: e.target.value})}
              disabled={!!editando}>
              <option value="">Seleccionar producto...</option>
              {safeArray(productos).map(p => (
                <option key={p.id_producto} value={p.id_producto}>{p.nombre}</option>
              ))}
            </select>
          </div>
          <div style={s.formRow}>
            <div style={s.formGroup}>
              <label style={s.label}>Talla *</label>
              <select style={s.input} value={form.talla}
                onChange={e => setForm({...form, talla: e.target.value})}>
                <option value="">Seleccionar...</option>
                {TALLAS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Color *</label>
              <input style={s.input} value={form.color}
                onChange={e => setForm({...form, color: e.target.value})}
                placeholder="Ej: Rosa, Crema, Negro" />
            </div>
          </div>
          <div style={s.formRow}>
            <div style={s.formGroup}>
              <label style={s.label}>Stock inicial</label>
              <input style={s.input} type="number" min="0" value={form.stock}
                onChange={e => setForm({...form, stock: Number(e.target.value)})} />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Precio costo</label>
              <input style={s.input} type="number" min="0" value={form.precio_costo}
                onChange={e => setForm({...form, precio_costo: e.target.value})} />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button theme="warm" variant="ghost" onClick={() => setModal(false)}>Cancelar</Button>
          <Button theme="warm" variant="primary" onClick={guardar}>
            {editando ? '✓ Actualizar' : '✓ Guardar'}
          </Button>
        </Modal.Footer>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => eliminar(confirmDelete.id_variante)}
        title="¿Eliminar variante?"
        message={<span>
          ¿Eliminar la variante <strong>talla {confirmDelete?.talla} — {confirmDelete?.color}</strong> de <strong>{confirmDelete?.producto}</strong>?
          Si tiene ventas, solo se desactivará.
        </span>}
        confirmText="Sí, eliminar"
      />

    </div>
  )
}

const s = {
  pagina: {
    display: 'flex', flexDirection: 'column', gap: spacing.lg,
    height: '100%',
  },
  emptyState: {
    textAlign: 'center', padding: spacing.xl, color: t.textSecondary,
    fontSize: typography.fontSize.lead,
  },
  filtros: {
    display: 'flex', gap: spacing.sm, flexWrap: 'wrap', alignItems: 'center',
  },
  select: {
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: radius.md,
    border: `1.5px solid ${t.border}`,
    fontSize: typography.fontSize.lead,
    background: t.surface, outline: 'none',
    cursor: 'pointer', color: t.textPrimary, minWidth: '240px',
  },
  formRow: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md,
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
}
