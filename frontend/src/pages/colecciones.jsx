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
const a = colors.accent

const TEMPORADAS = ['primavera-verano', 'otoño-invierno', 'crucero', 'resort']

export default function Colecciones() {
  const [colecciones, setColecciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [form, setForm] = useState({ nombre: '', temporada: '', anio: '', descripcion: '', archivada: 0 })

  const cargar = async () => {
    setCargando(true)
    try {
      const { data } = await api.get('/colecciones')
      setColecciones(data)
    } catch { } finally { setCargando(false) }
  }

  useEffect(() => { cargar() }, [])

  const abrirNuevo = () => {
    setEditando(null)
    setForm({ nombre: '', temporada: '', anio: new Date().getFullYear(), descripcion: '', archivada: 0 })
    setModal(true)
  }

  const abrirEditar = (c) => {
    setEditando(c)
    setForm({ nombre: c.nombre, temporada: c.temporada, anio: c.anio, descripcion: c.descripcion || '', archivada: c.archivada })
    setModal(true)
  }

  const guardar = async () => {
    if (!form.nombre || !form.temporada || !form.anio) { alert('Completa los campos obligatorios'); return }
    try {
      if (editando) {
        await api.put(`/colecciones/${editando.id_coleccion}`, form)
      } else {
        await api.post('/colecciones', form)
      }
      setModal(false)
      cargar()
    } catch (err) { alert(err.response?.data?.error || 'Error al guardar') }
  }

  const eliminar = async (id) => {
    try {
      await api.delete(`/colecciones/${id}`)
      setConfirmDelete(null)
      cargar()
    } catch { alert('Error al archivar colección') }
  }

  const badgeVariant = (temporada) => {
    const map = {
      'primavera-verano': 'rose',
      'otoño-invierno': 'lilac',
      'crucero': 'mint',
      'resort': 'blue',
    }
    return map[temporada] || 'neutral'
  }

  return (
    <div style={s.pagina}>

      <SectionHeader
        title="Colecciones"
        subtitle="Gestiona las temporadas y colecciones de ModaTrend"
        action={<Button onClick={abrirNuevo} icon="+">Nueva colección</Button>}
        theme="warm"
      />

      {cargando ? (
        <div style={s.emptyState}>Cargando...</div>
      ) : colecciones.length === 0 ? (
        <div style={s.emptyState}>No hay colecciones registradas</div>
      ) : (
        <div style={s.grid}>
          {colecciones.map(c => (
            <div key={c.id_coleccion} style={{ ...s.card, opacity: c.archivada ? 0.6 : 1 }}>
              <div style={s.cardRoseLine} />
              <div style={s.cardBody}>
                <div style={s.cardTop}>
                  <Badge theme="warm" variant="neutral">{c.archivada ? 'Archivada' : c.temporada}</Badge>
                  <span style={s.anioBadge}>{c.anio}</span>
                </div>
                <h3 style={s.cardNombre}>{c.nombre}</h3>
                <p style={s.cardDesc}>{c.descripcion || 'Sin descripción'}</p>
                <div style={s.cardMeta}>{(c.total_productos || 0) + ' productos'}</div>
                <div style={s.cardAcciones}>
                  <Button size="sm" variant="secondary" onClick={() => abrirEditar(c)}>
                    Editar
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => setConfirmDelete(c)}>
                    {c.archivada ? 'Eliminar' : 'Archivar'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)}>
        <Modal.Header title={editando ? 'Editar colección' : 'Nueva colección'} />
        <Modal.Body>
          <div style={s.formGroup}>
            <label style={s.label}>Nombre *</label>
            <input style={s.input} value={form.nombre}
              onChange={e => setForm({...form, nombre: e.target.value})}
              placeholder="Ej: Colección Rosa 2025" />
          </div>
          <div style={s.formRow}>
            <div style={s.formGroup}>
              <label style={s.label}>Temporada *</label>
              <select style={s.input} value={form.temporada}
                onChange={e => setForm({...form, temporada: e.target.value})}>
                <option value="">Seleccionar...</option>
                {TEMPORADAS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Año *</label>
              <input style={s.input} type="number" value={form.anio}
                onChange={e => setForm({...form, anio: e.target.value})}
                placeholder="2025" />
            </div>
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>Descripción</label>
            <textarea style={s.textarea} value={form.descripcion}
              onChange={e => setForm({...form, descripcion: e.target.value})}
              placeholder="Descripción de la colección..." rows={3} />
          </div>
          {editando && (
            <label style={s.checkLabel}>
              <input type="checkbox" checked={form.archivada === 1}
                onChange={e => setForm({...form, archivada: e.target.checked ? 1 : 0})} />
              <span>Marcar como archivada</span>
            </label>
          )}
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
        onConfirm={() => eliminar(confirmDelete.id_coleccion)}
        title="¿Archivar colección?"
        message={<span>¿Deseas archivar la colección <strong>{confirmDelete?.nombre}</strong>? No podrá recibir nuevos productos.</span>}
        confirmText="Sí, archivar"
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
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
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
  cardTop: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  anioBadge: {
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.semibold,
    color: '#6B7280',
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
    resize: 'vertical', fontFamily: 'inherit', width: '100%',
    boxSizing: 'border-box',
    transition: `border-color ${transitions.fast}`,
  },
  checkLabel: {
    display: 'flex', alignItems: 'center', gap: spacing.xs,
    fontSize: typography.fontSize.lead, color: t.textLabel,
    cursor: 'pointer',
  },
}
