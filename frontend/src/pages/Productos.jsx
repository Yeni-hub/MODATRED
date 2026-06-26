import { useState, useEffect } from 'react'
import api from '../services/api'
import tokens from '../styles/tokens'
import SectionHeader from '../components/ui/SectionHeader'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import DataTable from '../components/ui/DataTable'

const { colors, spacing, radius, typography, shadows, transitions } = tokens
const t = colors.warm

const safeArray = (data) => Array.isArray(data) ? data.filter(x => x != null) : []

export default function Productos() {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [colecciones, setColecciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtrocat, setFiltrocat] = useState('')
  const [filtrocol, setFiltrocol] = useState('')
  const [stockBajo, setStockBajo] = useState(false)
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [alerta, setAlerta] = useState({ visible: false, mensaje: '', tipo: 'exito' })

  const mostrarAlerta = (mensaje, tipo = 'exito') => {
    setAlerta({ visible: true, mensaje, tipo })
    setTimeout(() => setAlerta({ visible: false, mensaje: '', tipo: 'exito' }), 3000)
  }

  const [form, setForm] = useState({
    referencia: '', nombre: '', descripcion: '',
    precio_base: '', id_categoria: '', id_coleccion: ''
  })

  const cargarDatos = async () => {
    setCargando(true)
    try {
      const params = {}
      if (filtrocat) params.id_categoria = filtrocat
      if (filtrocol) params.id_coleccion = filtrocol
      if (stockBajo) params.stock_bajo = true

      const [p, c, col] = await Promise.all([
        api.get('/productos', { params }),
        api.get('/categorias'),
        api.get('/colecciones'),
      ])
      setProductos(safeArray(p.data))
      setCategorias(safeArray(c.data))
      setColecciones(safeArray(col.data))
    } catch (err) {
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargarDatos() }, [filtrocat, filtrocol, stockBajo])

  const abrirNuevo = () => {
    setEditando(null)
    setForm({ referencia: '', nombre: '', descripcion: '', precio_base: '', id_categoria: '', id_coleccion: '' })
    setModal(true)
  }

  const abrirEditar = (p) => {
    setEditando(p)
    setForm({
      referencia: p.referencia, nombre: p.nombre,
      descripcion: p.descripcion || '', precio_base: p.precio_base,
      id_categoria: p.id_categoria, id_coleccion: p.id_coleccion,
    })
    setModal(true)
  }

  const guardar = async () => {
    if (!form.referencia || !form.nombre || !form.precio_base || !form.id_categoria || !form.id_coleccion) {
      mostrarAlerta('Completa todos los campos obligatorios', 'error')
      return
    }
    try {
      if (editando) {
        await api.put(`/productos/${editando.id_producto}`, form)
      } else {
        await api.post('/productos', form)
      }
      setModal(false)
      cargarDatos()
    } catch (err) {
      mostrarAlerta(err.response?.data?.error || 'Error al guardar', 'error')
    }
  }

  const eliminar = async (id) => {
    try {
      await api.delete(`/productos/${id}`)
      setConfirmDelete(null)
      cargarDatos()
    } catch (err) {
      console.error(err)
      mostrarAlerta('Error al eliminar producto', 'error')
    }
  }

  const productosFiltrados = safeArray(productos).filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.referencia.toLowerCase().includes(busqueda.toLowerCase())
  )

  const columns = [
    { key: 'referencia', label: 'REFERENCIA', width: '130px',
      render: (p) => <Badge theme="warm" variant="neutral">{p.referencia}</Badge> },
    { key: 'nombre', label: 'NOMBRE' },
    { key: 'categoria', label: 'CATEGORÍA' },
    { key: 'coleccion', label: 'COLECCIÓN' },
    { key: 'precio', label: 'PRECIO', width: '120px',
      render: (p) => `$${Number(p.precio_base).toLocaleString('es-CO')}` },
    { key: 'stock', label: 'STOCK', width: '100px',
      render: (p) => {
        const bajo = p.stock_total <= 5
        return <Badge theme="warm" variant={bajo ? 'danger' : 'success'}>{p.stock_total} uds</Badge>
      }},
    { key: 'acciones', label: 'ACCIONES', width: '150px',
      render: (p) => (
        <div style={{ display: 'flex', gap: spacing.xs }}>
          <Button size="sm" variant="secondary" onClick={() => abrirEditar(p)}>✏️</Button>
          <Button size="sm" variant="danger" onClick={() => setConfirmDelete(p)}>🗑️</Button>
        </div>
      )},
  ]

  return (
    <div style={s.pagina}>
      {alerta.visible && (
        <div style={{
          position: 'fixed', top: spacing.lg, right: spacing.lg,
          padding: `${spacing.md} ${spacing.lg}`,
          borderRadius: radius.md,
          fontSize: typography.fontSize.lead,
          fontWeight: typography.fontWeight.semibold,
          zIndex: 2000, border: '1px solid',
          boxShadow: shadows.md,
          background: alerta.tipo === 'exito' ? '#e6f4ea' : '#fff5f5',
          borderColor: alerta.tipo === 'exito' ? t.success : t.danger,
          color: alerta.tipo === 'exito' ? t.success : t.danger,
        }}>
          {alerta.tipo === 'exito' ? '✅' : '❌'} {alerta.mensaje}
        </div>
      )}

      <SectionHeader
        title="Productos"
        subtitle="Gestiona el catálogo de productos de ModaTrend"
        action={<Button onClick={abrirNuevo} icon="+">Nuevo producto</Button>}
        theme="warm"
      />

      {/* Filtros */}
      <div style={s.filtros}>
        <input
          placeholder="🔍 Buscar por nombre o referencia..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={s.inputSearch}
        />
        <select value={filtrocat} onChange={e => setFiltrocat(e.target.value)} style={s.select}>
          <option value="">Todas las categorías</option>
          {safeArray(categorias).map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
        </select>
        <select value={filtrocol} onChange={e => setFiltrocol(e.target.value)} style={s.select}>
          <option value="">Todas las colecciones</option>
          {safeArray(colecciones).map(c => <option key={c.id_coleccion} value={c.id_coleccion}>{c.nombre}</option>)}
        </select>
        <label style={s.checkLabel}>
          <input type="checkbox" checked={stockBajo} onChange={e => setStockBajo(e.target.checked)} />
          <span>Stock bajo</span>
        </label>
      </div>

      {/* Tabla */}
      {cargando ? (
        <div style={s.emptyState}>Cargando productos...</div>
      ) : (
        <DataTable
          theme="warm"
          columns={columns}
          data={productosFiltrados}
          emptyMessage="No hay productos registrados"
        />
      )}

      {/* Modal formulario */}
      {modal && (
        <div style={s.modalFondo}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>{editando ? 'Editar producto' : 'Nuevo producto'}</h2>
              <Button theme="warm" variant="ghost" size="sm" onClick={() => setModal(false)}>✕</Button>
            </div>

            <div style={s.modalBody}>
              <div style={s.formRow}>
                <div style={s.formGroup}>
                  <label style={s.label}>Referencia *</label>
                  <input style={s.input} value={form.referencia}
                    onChange={e => setForm({...form, referencia: e.target.value})}
                    placeholder="Ej: BL-001" />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Precio base *</label>
                  <input style={s.input} type="number" value={form.precio_base}
                    onChange={e => setForm({...form, precio_base: e.target.value})}
                    placeholder="Ej: 89000" />
                </div>
              </div>

              <div style={s.formGroup}>
                <label style={s.label}>Nombre del producto *</label>
                <input style={s.input} value={form.nombre}
                  onChange={e => setForm({...form, nombre: e.target.value})}
                  placeholder="Ej: Blusa Floral Rosa" />
              </div>

              <div style={s.formGroup}>
                <label style={s.label}>Descripción</label>
                <textarea style={s.textarea} value={form.descripcion}
                  onChange={e => setForm({...form, descripcion: e.target.value})}
                  placeholder="Descripción del producto..." rows={3} />
              </div>

              <div style={s.formRow}>
                <div style={s.formGroup}>
                  <label style={s.label}>Categoría *</label>
                  <select style={s.input} value={form.id_categoria}
                    onChange={e => setForm({...form, id_categoria: e.target.value})}>
                    <option value="">Seleccionar...</option>
                    {safeArray(categorias).map(c => (
                      <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Colección *</label>
                  <select style={s.input} value={form.id_coleccion}
                    onChange={e => setForm({...form, id_coleccion: e.target.value})}>
                    <option value="">Seleccionar...</option>
                    {safeArray(colecciones).map(c => (
                      <option key={c.id_coleccion} value={c.id_coleccion}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div style={s.modalFooter}>
              <Button theme="warm" variant="ghost" onClick={() => setModal(false)}>Cancelar</Button>
              <Button theme="warm" variant="primary" onClick={guardar}>
                {editando ? '✓ Actualizar' : '✓ Guardar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmar eliminar */}
      {confirmDelete && (
        <div style={s.modalFondo}>
          <div style={{ ...s.modal, maxWidth: '440px' }}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>¿Eliminar producto?</h2>
              <Button theme="warm" variant="ghost" size="sm" onClick={() => setConfirmDelete(null)}>✕</Button>
            </div>
            <div style={s.modalBody}>
              <p style={{ color: t.textSecondary, fontSize: typography.fontSize.lead, lineHeight: 1.6 }}>
                ¿Estás segura de que deseas desactivar el producto <strong style={{ color: t.textPrimary }}>{confirmDelete.nombre}</strong>?
                Esta acción no se puede deshacer.
              </p>
            </div>
            <div style={s.modalFooter}>
              <Button theme="warm" variant="ghost" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
              <Button theme="warm" variant="danger" onClick={() => eliminar(confirmDelete.id_producto)}>
                🗑️ Sí, eliminar
              </Button>
            </div>
          </div>
        </div>
      )}

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
  inputSearch: {
    flex: 1, minWidth: '200px',
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: radius.md,
    border: `1.5px solid ${t.border}`,
    fontSize: typography.fontSize.lead,
    outline: 'none', color: t.textPrimary,
    background: t.surface,
    boxSizing: 'border-box',
    transition: `border-color ${transitions.fast}`,
  },
  select: {
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: radius.md,
    border: `1.5px solid ${t.border}`,
    fontSize: typography.fontSize.lead,
    background: t.surface,
    outline: 'none', cursor: 'pointer', color: t.textPrimary,
  },
  checkLabel: {
    display: 'flex', alignItems: 'center', gap: spacing.xs,
    fontSize: typography.fontSize.lead, color: t.textLabel,
    cursor: 'pointer',
  },
  modalFondo: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: t.surface, borderRadius: radius.xl,
    width: '100%', maxWidth: '620px',
    boxShadow: shadows.lg,
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${spacing.lg} ${spacing.xl}`,
    borderBottom: `1px solid ${t.borderLight}`,
  },
  modalTitle: {
    fontSize: typography.fontSize.h3,
    fontWeight: typography.fontWeight.semibold,
    color: t.textPrimary,
  },
  modalBody: {
    padding: spacing.xl,
    display: 'flex', flexDirection: 'column', gap: spacing.md,
  },
  modalFooter: {
    display: 'flex', justifyContent: 'flex-end', gap: spacing.sm,
    padding: `${spacing.md} ${spacing.xl}`,
    borderTop: `1px solid ${t.borderLight}`,
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
  textarea: {
    padding: '14px 16px',
    borderRadius: radius.md,
    border: `1.5px solid ${t.border}`,
    fontSize: typography.fontSize.lead,
    outline: 'none', color: t.textPrimary,
    background: t.surface,
    resize: 'vertical', fontFamily: 'inherit',
    transition: `border-color ${transitions.fast}`,
  },
}
