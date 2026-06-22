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

export default function Categorias() {
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [form, setForm] = useState({ nombre: '', descripcion: '' })

  const cargar = async () => {
    setCargando(true)
    try {
      const { data } = await api.get('/categorias')
      setCategorias(data)
    } catch { } finally { setCargando(false) }
  }

  useEffect(() => { cargar() }, [])

  const abrirNuevo = () => {
    setEditando(null)
    setForm({ nombre: '', descripcion: '' })
    setModal(true)
  }

  const abrirEditar = (c) => {
    setEditando(c)
    setForm({ nombre: c.nombre, descripcion: c.descripcion || '' })
    setModal(true)
  }

  const guardar = async () => {
    if (!form.nombre) { alert('El nombre es obligatorio'); return }
    try {
      if (editando) {
        await api.put(`/categorias/${editando.id_categoria}`, form)
      } else {
        await api.post('/categorias', form)
      }
      setModal(false)
      cargar()
    } catch (err) { alert(err.response?.data?.error || 'Error al guardar') }
  }

  const eliminar = async (id) => {
    try {
      await api.delete(`/categorias/${id}`)
      setConfirmDelete(null)
      cargar()
    } catch (err) { alert(err.response?.data?.error || 'Error al eliminar categoría') }
  }

  return (
    <div style={s.pagina}>

      <SectionHeader
        title="Categorías"
        subtitle="Gestiona las categorías de productos de ModaTrend"
        action={<Button onClick={abrirNuevo} icon="+">Nueva categoría</Button>}
        theme="warm"
      />

      {cargando ? (
        <div style={s.emptyState}>Cargando...</div>
      ) : categorias.length === 0 ? (
        <div style={s.emptyState}>No hay categorías registradas</div>
      ) : (
        <div style={s.grid}>
          {categorias.map(c => (
            <div key={c.id_categoria} style={s.card}>
              <div style={s.cardRoseLine} />
              <div style={s.cardBody}>
                <h3 style={s.cardNombre}>{c.nombre}</h3>
                <p style={s.cardDesc}>{c.descripcion || 'Sin descripción'}</p>
                <div style={s.cardMeta}>{(c.total_productos || 0) + ' productos'}</div>
                <div style={s.cardAcciones}>
                  <Button size="sm" variant="secondary" onClick={() => abrirEditar(c)}>
                    Editar
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => setConfirmDelete(c)}>
                    Eliminar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)}>
        <Modal.Header title={editando ? 'Editar categoría' : 'Nueva categoría'} />
        <Modal.Body>
          <div style={s.formGroup}>
            <label style={s.label}>Nombre *</label>
            <input style={s.input} value={form.nombre}
              onChange={e => setForm({...form, nombre: e.target.value})}
              placeholder="Ej: Blusas" />
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>Descripción</label>
            <textarea style={s.textarea} value={form.descripcion}
              onChange={e => setForm({...form, descripcion: e.target.value})}
              placeholder="Descripción de la categoría..." rows={3} />
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
        onConfirm={() => eliminar(confirmDelete.id_categoria)}
        title="¿Eliminar categoría?"
        message={<span>¿Estás segura de eliminar la categoría <strong>{confirmDelete?.nombre}</strong>? Esta acción no se puede deshacer.</span>}
        confirmText="🗑️ Sí, eliminar"
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
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
  cardDesc: {
    fontSize: typography.fontSize.lead,
    color: '#6B7280', flex: 1, margin: 0,
  },
  cardMeta: {
    fontSize: typography.fontSize.small,
    color: '#6B7280',
  },
  cardAcciones: {
    display: 'flex', gap: spacing.sm, marginTop: spacing.xs,
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
    resize: 'vertical', fontFamily: 'inherit', width: '100%',
    boxSizing: 'border-box',
    transition: `border-color ${transitions.fast}`,
  },
}
