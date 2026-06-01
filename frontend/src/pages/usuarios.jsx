import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const API = 'http://localhost:4000/api'

export default function Usuarios() {
  const { token } = useAuth()
  const headers   = { Authorization: `Bearer ${token}` }

  const [usuarios,      setUsuarios]      = useState([])
  const [cargando,      setCargando]      = useState(true)
  const [modal,         setModal]         = useState(false)
  const [editando,      setEditando]      = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [alerta,        setAlerta]        = useState({ visible: false, mensaje: '', tipo: 'exito' })
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
      const { data } = await axios.get(`${API}/usuarios`, { headers })
      setUsuarios(data)
    } catch { } finally { setCargando(false) }
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
        await axios.put(`${API}/usuarios/${editando.id_usuario}`, form, { headers })
        mostrarAlerta('Usuario actualizado exitosamente')
      } else {
        await axios.post(`${API}/usuarios`, form, { headers })
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
      await axios.put(`${API}/usuarios/${u.id_usuario}`, { ...u, activo: nuevoEstado }, { headers })
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
          background: alerta.tipo === 'exito' ? '#e6f4ea' : '#fff5f5',
          border:     alerta.tipo === 'exito' ? '1px solid #b7dfbe' : '1px solid #fed7d7',
          color:      alerta.tipo === 'exito' ? '#2d7a3a' : '#c53030',
        }}>
          {alerta.tipo === 'exito' ? '✅' : '❌'} {alerta.mensaje}
        </div>
      )}

      <div style={s.header}>
        <div>
          <h1 style={s.titulo}>Usuarios</h1>
          <p style={s.subtitulo}>Gestiona los usuarios del sistema ModaTrend</p>
        </div>
        <button onClick={abrirNuevo} style={s.btnNuevo}>+ Nuevo usuario</button>
      </div>

      {cargando ? <div style={s.cargando}>Cargando...</div> : (
        <div style={s.grid}>
          {usuarios.map(u => (
            <div key={u.id_usuario} style={{ ...s.card, opacity: u.activo === 0 ? 0.6 : 1 }}>
              <div style={s.cardHeader}>
                <div style={{
                  ...s.avatar,
                  background: u.rol === 'admin' ? '#c47c5a' : '#7b9e87',
                }}>
                  {u.nombre.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={s.cardNombre}>{u.nombre}</h3>
                  <div style={s.badgesFila}>
                    <span style={{
                      ...s.rolBadge,
                      background: u.rol === 'admin' ? '#f7e6d8' : '#e6f4ea',
                      color:      u.rol === 'admin' ? '#c47c5a' : '#2d7a3a',
                    }}>
                      {u.rol === 'admin' ? '👑 Admin' : '🛍️ Vendedor'}
                    </span>
                    <span style={{
                      ...s.estadoBadge,
                      background: u.activo === 1 ? '#e6f4ea' : '#fef0f0',
                      color:      u.activo === 1 ? '#2d7a3a' : '#c45a5a',
                    }}>
                      {u.activo === 1 ? '● Activo' : '● Inactivo'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={s.cardInfo}>
                <div style={s.infoFila}>✉️ {u.email}</div>
                <div style={s.infoFila}>📅 Creado: {new Date(u.creado_en).toLocaleDateString('es-CO')}</div>
              </div>

              <div style={s.cardAcciones}>
                <button onClick={() => abrirEditar(u)} style={s.btnEditar}>✏️ Editar</button>
                <button
                  onClick={() => setConfirmDelete(u)}
                  style={{
                    ...s.btnToggle,
                    background: u.activo === 1 ? '#fef0f0' : '#e6f4ea',
                    color:      u.activo === 1 ? '#c45a5a' : '#2d7a3a',
                  }}
                >
                  {u.activo === 1 ? '📁 Desactivar' : '♻️ Reactivar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal formulario */}
      {modal && (
        <div style={s.modalFondo}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitulo}>{editando ? 'Editar usuario' : 'Nuevo usuario'}</h2>
              <button onClick={() => setModal(false)} style={s.btnCerrar}>✕</button>
            </div>
            <div style={s.modalBody}>
              <div style={s.campo}>
                <label style={s.label}>Nombre completo *</label>
                <input style={s.input} value={form.nombre}
                  onChange={e => setForm({...form, nombre: e.target.value})}
                  placeholder="Nombre del usuario" />
              </div>
              <div style={s.campo}>
                <label style={s.label}>Email *</label>
                <input style={s.input} type="email" value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  placeholder="correo@modatrend.com" />
              </div>
              <div style={s.campo}>
                <label style={s.label}>
                  {editando ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}
                </label>
                <input style={s.input} type="password" value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  placeholder="Mínimo 6 caracteres" />
              </div>
              <div style={s.campo}>
                <label style={s.label}>Rol *</label>
                <select style={s.input} value={form.rol}
                  onChange={e => setForm({...form, rol: e.target.value})}>
                  <option value="vendedor">🛍️ Vendedor</option>
                  <option value="admin">👑 Administrador</option>
                </select>
              </div>
            </div>
            <div style={s.modalFooter}>
              <button onClick={() => setModal(false)} style={s.btnCancelar}>Cancelar</button>
              <button onClick={guardar} style={s.btnGuardar}>{editando ? '✓ Actualizar' : '✓ Guardar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmar */}
      {confirmDelete && (
        <div style={s.modalFondo}>
          <div style={{...s.modal, maxWidth: '420px'}}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitulo}>
                {confirmDelete.activo === 1 ? '📁 ¿Desactivar usuario?' : '♻️ ¿Reactivar usuario?'}
              </h2>
              <button onClick={() => setConfirmDelete(null)} style={s.btnCerrar}>✕</button>
            </div>
            <div style={s.modalBody}>
              <p style={{ color: '#7a5c4a', fontSize: '1rem' }}>
                {confirmDelete.activo === 1
                  ? <>¿Desactivar a <strong>{confirmDelete.nombre}</strong>? No podrá iniciar sesión.</>
                  : <>¿Reactivar a <strong>{confirmDelete.nombre}</strong>? Podrá iniciar sesión nuevamente.</>
                }
              </p>
            </div>
            <div style={s.modalFooter}>
              <button onClick={() => setConfirmDelete(null)} style={s.btnCancelar}>Cancelar</button>
              <button
                onClick={() => toggleActivo(confirmDelete)}
                style={{
                  ...s.btnGuardar,
                  background: confirmDelete.activo === 1 ? '#c45a5a' : '#2d7a3a'
                }}
              >
                {confirmDelete.activo === 1 ? '📁 Sí, desactivar' : '♻️ Sí, reactivar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const s = {
  pagina:       { padding: '36px 40px', height: '100%', overflowY: 'auto', background: '#f5ede6', position: 'relative' },
  alerta:       { position: 'fixed', top: '24px', right: '24px', padding: '14px 24px', borderRadius: '12px', fontSize: '1rem', fontWeight: '600', zIndex: 2000, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' },
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' },
  titulo:       { fontSize: '1.8rem', fontWeight: '600', color: '#2a1a12' },
  subtitulo:    { fontSize: '0.95rem', color: '#9e7b65', marginTop: '4px' },
  btnNuevo:     { background: '#c47c5a', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 24px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
  cargando:     { textAlign: 'center', padding: '60px', color: '#9e7b65' },
  grid:         { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  card:         { background: '#fff', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '14px' },
  cardHeader:   { display: 'flex', alignItems: 'center', gap: '14px' },
  avatar:       { width: '48px', height: '48px', borderRadius: '12px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: '700', flexShrink: 0 },
  cardNombre:   { fontSize: '1rem', fontWeight: '600', color: '#2a1a12' },
  badgesFila:   { display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' },
  rolBadge:     { fontSize: '0.75rem', padding: '2px 8px', borderRadius: '20px', fontWeight: '600' },
  estadoBadge:  { fontSize: '0.75rem', padding: '2px 8px', borderRadius: '20px', fontWeight: '600' },
  cardInfo:     { display: 'flex', flexDirection: 'column', gap: '6px' },
  infoFila:     { fontSize: '0.88rem', color: '#7a5c4a' },
  cardAcciones: { display: 'flex', gap: '8px', marginTop: '4px' },
  btnEditar:    { background: '#f7e6d8', color: '#c47c5a', border: 'none', borderRadius: '8px', padding: '7px 14px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '600' },
  btnToggle:    { border: 'none', borderRadius: '8px', padding: '7px 14px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '600' },
  modalFondo:   { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal:        { background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  modalHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 28px', borderBottom: '1px solid #f0e6de' },
  modalTitulo:  { fontSize: '1.2rem', fontWeight: '600', color: '#2a1a12' },
  btnCerrar:    { background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#9e7b65' },
  modalBody:    { padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '16px' },
  modalFooter:  { display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '20px 28px', borderTop: '1px solid #f0e6de' },
  campo:        { display: 'flex', flexDirection: 'column', gap: '6px' },
  label:        { fontSize: '0.9rem', fontWeight: '600', color: '#7a5c4a' },
  input:        { padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e8d5c4', fontSize: '0.95rem', outline: 'none', color: '#2a1a12', background: '#fffaf7', boxSizing: 'border-box', width: '100%' },
  btnCancelar:  { background: '#f5ede6', color: '#7a5c4a', border: 'none', borderRadius: '10px', padding: '11px 24px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
  btnGuardar:   { background: '#c47c5a', color: '#fff', border: 'none', borderRadius: '10px', padding: '11px 28px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
}