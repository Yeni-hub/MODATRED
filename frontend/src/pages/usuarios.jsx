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

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [alerta, setAlerta] = useState({ visible: false, mensaje: '', tipo: 'exito' })
  const [form, setForm] = useState({
    nombre: '', email: '', password: '', rol: 'vendedor'
  })

  const mostrarAlerta = (mensaje, tipo = 'exito') => {
    setAlerta({ visible: true, mensaje, tipo })
    setTimeout(() => setAlerta({ visible: false, mensaje: '', tipo: 'exito' }), 3000)
  }

  const cargar = async () => {
    setCargando(true)
    try {
      const { data } = await api.get('/usuarios')
      setUsuarios(data)
    } catch { /* ignore */ } finally { setCargando(false) }
  }

  useEffect(() => { cargar() }, [])

  const abrirNuevo = () => {
    setEditando(null)
    setForm({ nombre: '', email: '', password: '', rol: 'vendedor' })
    setModal(true)
  }

  const abrirEditar = (u) => {
    setEditando(u)
    setForm({ nombre: u.nombre, email: u.email, password: '', rol: u.rol })
    setModal(true)
  }

  const guardar = async () => {
    if (!form.nombre || !form.email) {
      mostrarAlerta('Nombre y email son obligatorios', 'error')
      return
    }
    if (!editando && !form.password) {
      mostrarAlerta('La contraseña es obligatoria', 'error')
      return
    }
    if (form.password && form.password.length < 6) {
      mostrarAlerta('La contraseña debe tener mínimo 6 caracteres', 'error')
      return
    }
    try {
      if (editando) {
        await api.put(`/usuarios/${editando.id_usuario}`, form)
        mostrarAlerta('Usuario actualizado exitosamente')
      } else {
        await api.post('/usuarios', form)
        mostrarAlerta('Usuario creado exitosamente')
      }
      setModal(false)
      cargar()
    } catch (err) {
      mostrarAlerta(err.response?.data?.error || 'Error al guardar usuario', 'error')
    }
  }

  const toggleActivo = async (u) => {
    try {
      const nuevoEstado = u.activo === 1 ? 0 : 1
      await api.put(`/usuarios/${u.id_usuario}`, { ...u, activo: nuevoEstado })
      mostrarAlerta(nuevoEstado === 1 ? '✅ Usuario reactivado' : '📁 Usuario desactivado')
      setConfirmDelete(null)
      cargar()
    } catch {
      mostrarAlerta('Error al cambiar estado del usuario', 'error')
    }
  }

  return (
    <div style={s.pagina}>
      {alerta.visible && (
        <div style={{
          ...s.alerta,
          background: alerta.tipo === 'exito' ? a.lilacBg : '#FDF2F5',
          borderColor: alerta.tipo === 'exito' ? a.lilac : a.rose,
          color: alerta.tipo === 'exito' ? t.success : t.danger,
        }}>
          {alerta.tipo === 'exito' ? '✅' : '❌'} {alerta.mensaje}
        </div>
      )}

      <SectionHeader
        title="Usuarios"
        subtitle="Gestiona los usuarios del sistema ModaTrend"
        action={<Button onClick={abrirNuevo} icon="+">Nuevo usuario</Button>}
        theme="warm"
      />

      {cargando ? (
        <div style={s.emptyState}>Cargando...</div>
      ) : usuarios.length === 0 ? (
        <div style={s.emptyState}>No hay usuarios registrados</div>
      ) : (
        <div style={s.grid}>
          {usuarios.map(u => (
            <div key={u.id_usuario} style={{ ...s.card, opacity: u.activo === 0 ? 0.6 : 1 }}>
              <div style={s.cardHeader}>
                <div style={{
                  ...s.avatar,
                  background: u.rol === 'admin' ? a.rose : a.lilac,
                }}>
                  {u.nombre.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={s.cardNombre}>{u.nombre}</h3>
                  <div style={s.badgesFila}>
                    <Badge theme="accent" variant={u.rol === 'admin' ? 'rose' : 'lilac'}>
                      {u.rol === 'admin' ? '👑 Admin' : '🛍️ Vendedor'}
                    </Badge>
                    <Badge theme="warm" variant={u.activo === 1 ? 'success' : 'danger'}>
                      {u.activo === 1 ? '● Activo' : '● Inactivo'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div style={s.cardInfo}>
                <div style={s.infoFila}>✉️ {u.email}</div>
                <div style={s.infoFila}>📅 Creado: {new Date(u.creado_en).toLocaleDateString('es-CO')}</div>
              </div>

              <div style={s.cardAcciones}>
                <Button size="sm" variant="secondary" onClick={() => abrirEditar(u)}>
                  ✏️ Editar
                </Button>
                <Button size="sm" variant={u.activo === 1 ? 'ghost' : 'success'}
                  onClick={() => setConfirmDelete(u)}>
                  {u.activo === 1 ? '📁 Desactivar' : '♻️ Reactivar'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)}>
        <Modal.Header title={editando ? 'Editar usuario' : 'Nuevo usuario'} />
        <Modal.Body>
          <div style={s.formGroup}>
            <label style={s.label}>Nombre completo *</label>
            <input style={s.input} value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              placeholder="Nombre del usuario" />
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>Email *</label>
            <input style={s.input} type="email" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="correo@modatrend.com" />
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>
              {editando ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}
            </label>
            <input style={s.input} type="password" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="Mínimo 6 caracteres" />
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>Rol *</label>
            <select style={s.input} value={form.rol}
              onChange={e => setForm({ ...form, rol: e.target.value })}>
              <option value="vendedor">🛍️ Vendedor</option>
              <option value="admin">👑 Administrador</option>
            </select>
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
        onConfirm={() => toggleActivo(confirmDelete)}
        title={confirmDelete?.activo === 1 ? '📁 ¿Desactivar usuario?' : '♻️ ¿Reactivar usuario?'}
        message={
          confirmDelete?.activo === 1
            ? <>¿Desactivar a <strong>{confirmDelete?.nombre}</strong>? No podrá iniciar sesión.</>
            : <>¿Reactivar a <strong>{confirmDelete?.nombre}</strong>? Podrá iniciar sesión nuevamente.</>
        }
        confirmText={confirmDelete?.activo === 1 ? '📁 Sí, desactivar' : '♻️ Sí, reactivar'}
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: spacing.md,
  },
  card: {
    background: t.surface, borderRadius: radius.lg,
    padding: spacing.lg, boxShadow: shadows.sm,
    display: 'flex', flexDirection: 'column', gap: spacing.sm,
    border: `1px solid ${t.borderLight}`,
  },
  cardHeader: { display: 'flex', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: '48px', height: '48px', borderRadius: radius.md,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.4rem', fontWeight: typography.fontWeight.bold,
    color: '#fff', flexShrink: 0,
  },
  cardNombre: {
    fontSize: typography.fontSize.h3,
    fontWeight: typography.fontWeight.semibold,
    color: t.textPrimary, margin: 0,
  },
  badgesFila: {
    display: 'flex', gap: spacing.xs, marginTop: spacing.xs, flexWrap: 'wrap',
  },
  cardInfo: {
    display: 'flex', flexDirection: 'column', gap: spacing.xs,
  },
  infoFila: {
    fontSize: typography.fontSize.lead, color: t.textLabel,
    display: 'flex', alignItems: 'center', gap: spacing.xs,
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
}
