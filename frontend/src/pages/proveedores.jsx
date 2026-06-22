import { useState, useEffect } from 'react'
import api from '../services/api'
import tokens from '../styles/tokens'
import SectionHeader from '../components/ui/SectionHeader'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'

const { colors, spacing, radius, typography, shadows, transitions } = tokens
const t = colors.warm
const a = colors.accent

const validarForm = (form) => {
  const errores = {}
  if (!form.nombre.trim()) errores.nombre = 'El nombre es obligatorio'
  if (form.nit && !/^[\d\-]+$/.test(form.nit)) errores.nit = 'El NIT solo debe contener números y guiones'
  if (form.telefono && !/^\d+$/.test(form.telefono)) errores.telefono = 'El teléfono solo debe contener números'
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errores.email = 'El correo no es válido (debe contener @)'
  return errores
}

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([])
  const [cargando, setCargando] = useState(true)
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [errores, setErrores] = useState({})
  const [alerta, setAlerta] = useState({ visible: false, mensaje: '', tipo: 'exito' })
  const [form, setForm] = useState({
    nombre: '', nit: '', contacto: '', telefono: '', email: '', direccion: ''
  })

  const mostrarAlerta = (mensaje, tipo = 'exito') => {
    setAlerta({ visible: true, mensaje, tipo })
    setTimeout(() => setAlerta({ visible: false, mensaje: '', tipo: 'exito' }), 3000)
  }

  const cargar = async () => {
    setCargando(true)
    try {
      const { data } = await api.get('/proveedores')
      setProveedores(data)
    } catch { } finally { setCargando(false) }
  }

  useEffect(() => { cargar() }, [])

  const abrirNuevo = () => {
    setEditando(null)
    setErrores({})
    setForm({ nombre: '', nit: '', contacto: '', telefono: '', email: '', direccion: '' })
    setModal(true)
  }

  const abrirEditar = (p) => {
    setEditando(p)
    setErrores({})
    setForm({
      nombre: p.nombre, nit: p.nit || '', contacto: p.contacto || '',
      telefono: p.telefono || '', email: p.email || '', direccion: p.direccion || '',
    })
    setModal(true)
  }

  const handleChange = (campo, valor) => {
    setForm({ ...form, [campo]: valor })
    if (errores[campo]) setErrores({ ...errores, [campo]: '' })
  }

  const soloNumeros = (campo, valor) => {
    if (/^\d*$/.test(valor)) handleChange(campo, valor)
  }

  const guardar = async () => {
    const errs = validarForm(form)
    if (Object.keys(errs).length > 0) {
      setErrores(errs)
      mostrarAlerta('Corrige los errores antes de guardar', 'error')
      return
    }
    try {
      if (editando) {
        await api.put(`/proveedores/${editando.id_proveedor}`, form)
        mostrarAlerta('Proveedor actualizado exitosamente')
      } else {
        await api.post('/proveedores', form)
        mostrarAlerta('Proveedor creado exitosamente')
      }
      setModal(false)
      cargar()
    } catch (err) {
      mostrarAlerta(err.response?.data?.error || 'Error al guardar proveedor', 'error')
    }
  }

  const toggleActivo = async (p) => {
    try {
      const nuevoEstado = p.activo === 1 ? 0 : 1
      await api.put(`/proveedores/${p.id_proveedor}`, { ...p, activo: nuevoEstado })
      mostrarAlerta(
        nuevoEstado === 1 ? '✅ Proveedor reactivado exitosamente' : '📁 Proveedor archivado exitosamente'
      )
      setConfirmDelete(null)
      cargar()
    } catch {
      mostrarAlerta('Error al cambiar estado del proveedor', 'error')
    }
  }

  const filtrados = proveedores.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.nit || '').toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div style={s.pagina}>
      {alerta.visible && (
        <div style={{
          ...s.alerta,
          background: alerta.tipo === 'exito' ? a.mintBg : '#FDF2F5',
          borderColor: alerta.tipo === 'exito' ? a.mint : a.rose,
          color: alerta.tipo === 'exito' ? t.success : t.danger,
        }}>
          {alerta.tipo === 'exito' ? '✅' : '❌'} {alerta.mensaje}
        </div>
      )}

      <SectionHeader
        title="Proveedores"
        subtitle="Gestiona los proveedores de ModaTrend"
        action={<Button onClick={abrirNuevo} icon="+">Nuevo proveedor</Button>}
        theme="warm"
      />

      <div style={s.filtros}>
        <input
          placeholder="🔍 Buscar por nombre o NIT..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={s.inputSearch}
        />
      </div>

      {cargando ? (
        <div style={s.emptyState}>Cargando...</div>
      ) : filtrados.length === 0 ? (
        <div style={s.emptyState}>No hay proveedores registrados</div>
      ) : (
        <div style={s.grid}>
          {filtrados.map(p => (
            <div key={p.id_proveedor} style={{ ...s.card, opacity: p.activo === 0 ? 0.6 : 1 }}>
              <div style={s.cardRoseLine} />
              <div style={s.cardBody}>
                <h3 style={s.cardNombre}>{p.nombre}</h3>
                <div style={s.cardInfo}>
                  {p.email && <div style={s.infoFila}>{p.email}</div>}
                  {p.telefono && <div style={s.infoFila}>{p.telefono}</div>}
                  {p.nit && <div style={s.infoFila}>NIT: {p.nit}</div>}
                </div>
                <div style={s.cardMeta}>{(p.total_compras || 0) + ' compras registradas'}</div>
                <div style={s.cardAcciones}>
                  <Button size="sm" variant="secondary" onClick={() => abrirEditar(p)}>
                    Editar
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => setConfirmDelete(p)}>
                    {p.activo === 1 ? 'Archivar' : 'Reactivar'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div style={s.modalFondo}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>{editando ? 'Editar proveedor' : 'Nuevo proveedor'}</h2>
              <Button theme="warm" variant="ghost" size="sm" onClick={() => setModal(false)}>✕</Button>
            </div>
            <div style={s.modalBody}>
              <div style={s.formGroup}>
                <label style={s.label}>Nombre *</label>
                <input
                  style={{ ...s.input, borderColor: errores.nombre ? t.danger : t.border }}
                  value={form.nombre}
                  onChange={e => handleChange('nombre', e.target.value)}
                  placeholder="Nombre del proveedor" />
                {errores.nombre && <span style={s.errorText}>⚠ {errores.nombre}</span>}
              </div>

              <div style={s.formRow}>
                <div style={s.formGroup}>
                  <label style={s.label}>NIT (números y guiones)</label>
                  <input
                    style={{ ...s.input, borderColor: errores.nit ? t.danger : t.border }}
                    value={form.nit}
                    onChange={e => handleChange('nit', e.target.value)}
                    placeholder="Ej: 900123456-1" />
                  {errores.nit && <span style={s.errorText}>⚠ {errores.nit}</span>}
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Contacto</label>
                  <input style={s.input} value={form.contacto}
                    onChange={e => handleChange('contacto', e.target.value)}
                    placeholder="Nombre del contacto" />
                </div>
              </div>

              <div style={s.formRow}>
                <div style={s.formGroup}>
                  <label style={s.label}>Teléfono (solo números)</label>
                  <input
                    style={{ ...s.input, borderColor: errores.telefono ? t.danger : t.border }}
                    value={form.telefono}
                    onChange={e => soloNumeros('telefono', e.target.value)}
                    placeholder="Ej: 3001234567" inputMode="numeric" />
                  {errores.telefono && <span style={s.errorText}>⚠ {errores.telefono}</span>}
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Email (debe contener @)</label>
                  <input
                    style={{ ...s.input, borderColor: errores.email ? t.danger : t.border }}
                    type="email" value={form.email}
                    onChange={e => handleChange('email', e.target.value)}
                    placeholder="correo@proveedor.com" />
                  {errores.email && <span style={s.errorText}>⚠ {errores.email}</span>}
                </div>
              </div>

              <div style={s.formGroup}>
                <label style={s.label}>Dirección</label>
                <input style={s.input} value={form.direccion}
                  onChange={e => handleChange('direccion', e.target.value)}
                  placeholder="Dirección del proveedor" />
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

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => toggleActivo(confirmDelete)}
        title={confirmDelete?.activo === 1 ? '📁 ¿Archivar proveedor?' : '♻️ ¿Reactivar proveedor?'}
        message={
          confirmDelete?.activo === 1
            ? <>¿Deseas archivar a <strong>{confirmDelete?.nombre}</strong>? Quedará inactivo.</>
            : <>¿Deseas reactivar a <strong>{confirmDelete?.nombre}</strong>? Volverá a estar disponible.</>
        }
        confirmText={confirmDelete?.activo === 1 ? '📁 Sí, archivar' : '♻️ Sí, reactivar'}
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
  filtros: { marginBottom: spacing.xs },
  inputSearch: {
    width: '100%', maxWidth: '400px',
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: radius.md,
    border: `1.5px solid ${t.border}`,
    fontSize: typography.fontSize.lead,
    background: t.surface, outline: 'none', color: t.textPrimary,
    transition: `border-color ${transitions.fast}`,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: spacing.md,
  },
  card: {
    background: '#FCFCFD', borderRadius: '18px',
    border: '1px solid #E8E8EC', boxShadow: shadows.xs,
    overflow: 'hidden',
  },
  cardRoseLine: {
    height: '4px', background: '#F78DA7',
    borderRadius: '18px 18px 0 0',
  },
  cardBody: {
    padding: spacing.lg,
    display: 'flex', flexDirection: 'column', gap: spacing.sm,
  },
  cardNombre: {
    fontSize: typography.fontSize.h3,
    fontWeight: typography.fontWeight.semibold,
    color: '#111827', margin: 0,
  },
  cardInfo: {
    display: 'flex', flexDirection: 'column', gap: spacing.xs,
  },
  infoFila: {
    fontSize: typography.fontSize.lead, color: '#6B7280',
  },
  cardMeta: {
    fontSize: typography.fontSize.small,
    color: '#6B7280',
  },
  cardAcciones: {
    display: 'flex', gap: spacing.sm, marginTop: spacing.xs,
  },
  modalFondo: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: t.surface, borderRadius: radius.xl,
    width: '100%', maxWidth: '600px',
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
    border: '1.5px solid',
    fontSize: typography.fontSize.lead,
    outline: 'none', color: t.textPrimary,
    background: t.surface,
    boxSizing: 'border-box', width: '100%',
    transition: `border-color ${transitions.fast}`,
  },
  errorText: {
    fontSize: typography.fontSize.small,
    color: t.danger, marginTop: '2px',
  },
}
