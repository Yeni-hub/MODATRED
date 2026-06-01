import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const API = 'http://localhost:4000/api'

const validarForm = (form) => {
  const errores = {}
  if (!form.nombre.trim())
    errores.nombre = 'El nombre es obligatorio'
  if (form.nit && !/^[\d\-]+$/.test(form.nit))
    errores.nit = 'El NIT solo debe contener números y guiones'
  if (form.telefono && !/^\d+$/.test(form.telefono))
    errores.telefono = 'El teléfono solo debe contener números'
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errores.email = 'El correo no es válido (debe contener @)'
  return errores
}

export default function Proveedores() {
  const { token } = useAuth()
  const headers   = { Authorization: `Bearer ${token}` }

  const [proveedores,   setProveedores]   = useState([])
  const [cargando,      setCargando]      = useState(true)
  const [modal,         setModal]         = useState(false)
  const [editando,      setEditando]      = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [busqueda,      setBusqueda]      = useState('')
  const [errores,       setErrores]       = useState({})
  const [alerta,        setAlerta]        = useState({ visible: false, mensaje: '', tipo: 'exito' })
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
      const { data } = await axios.get(`${API}/proveedores`, { headers })
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
      nombre:    p.nombre,
      nit:       p.nit       || '',
      contacto:  p.contacto  || '',
      telefono:  p.telefono  || '',
      email:     p.email     || '',
      direccion: p.direccion || '',
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
        await axios.put(`${API}/proveedores/${editando.id_proveedor}`, form, { headers })
        mostrarAlerta('Proveedor actualizado exitosamente')
      } else {
        await axios.post(`${API}/proveedores`, form, { headers })
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
      await axios.put(`${API}/proveedores/${p.id_proveedor}`, { ...p, activo: nuevoEstado }, { headers })
      mostrarAlerta(nuevoEstado === 1 ? '✅ Proveedor reactivado exitosamente' : '📁 Proveedor archivado exitosamente')
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
          background: alerta.tipo === 'exito' ? '#e6f4ea' : '#fff5f5',
          border:     alerta.tipo === 'exito' ? '1px solid #b7dfbe' : '1px solid #fed7d7',
          color:      alerta.tipo === 'exito' ? '#2d7a3a' : '#c53030',
        }}>
          {alerta.tipo === 'exito' ? '✅' : '❌'} {alerta.mensaje}
        </div>
      )}

      <div style={s.header}>
        <div>
          <h1 style={s.titulo}>Proveedores</h1>
          <p style={s.subtitulo}>Gestiona los proveedores de ModaTrend</p>
        </div>
        <button onClick={abrirNuevo} style={s.btnNuevo}>+ Nuevo proveedor</button>
      </div>

      <div style={s.filtros}>
        <input
          placeholder="🔍 Buscar por nombre o NIT..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={s.inputBusqueda}
        />
      </div>

      {cargando ? <div style={s.cargando}>Cargando...</div> : (
        <div style={s.grid}>
          {filtrados.length === 0 ? (
            <div style={s.vacio}>No hay proveedores registrados</div>
          ) : filtrados.map(p => (
            <div key={p.id_proveedor} style={{ ...s.card, opacity: p.activo === 0 ? 0.6 : 1 }}>
              <div style={s.cardHeader}>
                <div style={{
                  ...s.avatar,
                  background: p.activo === 0 ? '#f0e6de' : '#f7e6d8'
                }}>
                  {p.nombre.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={s.cardNombre}>{p.nombre}</h3>
                  <div style={s.badgesFila}>
                    {p.nit && <span style={s.nitBadge}>NIT: {p.nit}</span>}
                    <span style={{
                      ...s.estadoBadge,
                      background: p.activo === 1 ? '#e6f4ea' : '#fef0f0',
                      color:      p.activo === 1 ? '#2d7a3a' : '#c45a5a',
                    }}>
                      {p.activo === 1 ? '● Activo' : '● Inactivo'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={s.cardInfo}>
                {p.contacto  && <div style={s.infoFila}>👤 {p.contacto}</div>}
                {p.telefono  && <div style={s.infoFila}>📞 {p.telefono}</div>}
                {p.email     && <div style={s.infoFila}>✉️ {p.email}</div>}
                {p.direccion && <div style={s.infoFila}>📍 {p.direccion}</div>}
              </div>

              <div style={s.cardAcciones}>
                <button onClick={() => abrirEditar(p)} style={s.btnEditar}>✏️ Editar</button>
                <button
                  onClick={() => setConfirmDelete(p)}
                  style={{
                    ...s.btnToggle,
                    background: p.activo === 1 ? '#fef0f0' : '#e6f4ea',
                    color:      p.activo === 1 ? '#c45a5a' : '#2d7a3a',
                  }}
                >
                  {p.activo === 1 ? '📁 Archivar' : '♻️ Reactivar'}
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
              <h2 style={s.modalTitulo}>{editando ? 'Editar proveedor' : 'Nuevo proveedor'}</h2>
              <button onClick={() => setModal(false)} style={s.btnCerrar}>✕</button>
            </div>
            <div style={s.modalBody}>

              <div style={s.campo}>
                <label style={s.label}>Nombre *</label>
                <input
                  style={{ ...s.input, borderColor: errores.nombre ? '#e53e3e' : '#e8d5c4' }}
                  value={form.nombre}
                  onChange={e => handleChange('nombre', e.target.value)}
                  placeholder="Nombre del proveedor" />
                {errores.nombre && <span style={s.errorTexto}>⚠ {errores.nombre}</span>}
              </div>

              <div style={s.fila}>
                <div style={s.campo}>
                  <label style={s.label}>NIT (números y guiones)</label>
                  <input
                    style={{ ...s.input, borderColor: errores.nit ? '#e53e3e' : '#e8d5c4' }}
                    value={form.nit}
                    onChange={e => handleChange('nit', e.target.value)}
                    placeholder="Ej: 900123456-1" />
                  {errores.nit && <span style={s.errorTexto}>⚠ {errores.nit}</span>}
                </div>
                <div style={s.campo}>
                  <label style={s.label}>Contacto</label>
                  <input
                    style={s.input}
                    value={form.contacto}
                    onChange={e => handleChange('contacto', e.target.value)}
                    placeholder="Nombre del contacto" />
                </div>
              </div>

              <div style={s.fila}>
                <div style={s.campo}>
                  <label style={s.label}>Teléfono (solo números)</label>
                  <input
                    style={{ ...s.input, borderColor: errores.telefono ? '#e53e3e' : '#e8d5c4' }}
                    value={form.telefono}
                    onChange={e => soloNumeros('telefono', e.target.value)}
                    placeholder="Ej: 3001234567"
                    inputMode="numeric" />
                  {errores.telefono && <span style={s.errorTexto}>⚠ {errores.telefono}</span>}
                </div>
                <div style={s.campo}>
                  <label style={s.label}>Email (debe contener @)</label>
                  <input
                    style={{ ...s.input, borderColor: errores.email ? '#e53e3e' : '#e8d5c4' }}
                    type="email"
                    value={form.email}
                    onChange={e => handleChange('email', e.target.value)}
                    placeholder="correo@proveedor.com" />
                  {errores.email && <span style={s.errorTexto}>⚠ {errores.email}</span>}
                </div>
              </div>

              <div style={s.campo}>
                <label style={s.label}>Dirección</label>
                <input
                  style={s.input}
                  value={form.direccion}
                  onChange={e => handleChange('direccion', e.target.value)}
                  placeholder="Dirección del proveedor" />
              </div>

            </div>
            <div style={s.modalFooter}>
              <button onClick={() => setModal(false)} style={s.btnCancelar}>Cancelar</button>
              <button onClick={guardar} style={s.btnGuardar}>{editando ? '✓ Actualizar' : '✓ Guardar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmar archivar/reactivar */}
      {confirmDelete && (
        <div style={s.modalFondo}>
          <div style={{...s.modal, maxWidth: '420px'}}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitulo}>
                {confirmDelete.activo === 1 ? '📁 ¿Archivar proveedor?' : '♻️ ¿Reactivar proveedor?'}
              </h2>
              <button onClick={() => setConfirmDelete(null)} style={s.btnCerrar}>✕</button>
            </div>
            <div style={s.modalBody}>
              <p style={{ color: '#7a5c4a', fontSize: '1rem' }}>
                {confirmDelete.activo === 1
                  ? <>¿Deseas archivar a <strong>{confirmDelete.nombre}</strong>? Quedará inactivo.</>
                  : <>¿Deseas reactivar a <strong>{confirmDelete.nombre}</strong>? Volverá a estar disponible.</>
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
                {confirmDelete.activo === 1 ? '📁 Sí, archivar' : '♻️ Sí, reactivar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const s = {
  pagina:        { padding: '36px 40px', height: '100%', overflowY: 'auto', background: '#f5ede6', position: 'relative' },
  alerta:        { position: 'fixed', top: '24px', right: '24px', padding: '14px 24px', borderRadius: '12px', fontSize: '1rem', fontWeight: '600', zIndex: 2000, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' },
  header:        { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  titulo:        { fontSize: '1.8rem', fontWeight: '600', color: '#2a1a12' },
  subtitulo:     { fontSize: '0.95rem', color: '#9e7b65', marginTop: '4px' },
  btnNuevo:      { background: '#c47c5a', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 24px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
  filtros:       { marginBottom: '20px' },
  inputBusqueda: { width: '100%', maxWidth: '400px', padding: '10px 16px', borderRadius: '10px', border: '1.5px solid #e8d5c4', fontSize: '0.95rem', background: '#fff', outline: 'none' },
  cargando:      { textAlign: 'center', padding: '60px', color: '#9e7b65' },
  vacio:         { textAlign: 'center', padding: '60px', color: '#9e7b65', gridColumn: '1/-1' },
  grid:          { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  card:          { background: '#fff', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '14px' },
  cardHeader:    { display: 'flex', alignItems: 'center', gap: '14px' },
  avatar:        { width: '48px', height: '48px', borderRadius: '12px', color: '#c47c5a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: '700', flexShrink: 0 },
  cardNombre:    { fontSize: '1rem', fontWeight: '600', color: '#2a1a12' },
  badgesFila:    { display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' },
  nitBadge:      { fontSize: '0.75rem', color: '#9e7b65', background: '#f5ede6', padding: '2px 8px', borderRadius: '20px' },
  estadoBadge:   { fontSize: '0.75rem', padding: '2px 8px', borderRadius: '20px', fontWeight: '600' },
  cardInfo:      { display: 'flex', flexDirection: 'column', gap: '6px' },
  infoFila:      { fontSize: '0.88rem', color: '#7a5c4a', display: 'flex', alignItems: 'center', gap: '6px' },
  cardAcciones:  { display: 'flex', gap: '8px', marginTop: '4px' },
  btnEditar:     { background: '#f7e6d8', color: '#c47c5a', border: 'none', borderRadius: '8px', padding: '7px 14px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '600' },
  btnToggle:     { border: 'none', borderRadius: '8px', padding: '7px 14px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '600' },
  modalFondo:    { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal:         { background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '580px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  modalHeader:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 28px', borderBottom: '1px solid #f0e6de' },
  modalTitulo:   { fontSize: '1.2rem', fontWeight: '600', color: '#2a1a12' },
  btnCerrar:     { background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#9e7b65' },
  modalBody:     { padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '16px' },
  modalFooter:   { display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '20px 28px', borderTop: '1px solid #f0e6de' },
  fila:          { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  campo:         { display: 'flex', flexDirection: 'column', gap: '6px' },
  label:         { fontSize: '0.9rem', fontWeight: '600', color: '#7a5c4a' },
  input:         { padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e8d5c4', fontSize: '0.95rem', outline: 'none', color: '#2a1a12', background: '#fffaf7', boxSizing: 'border-box', width: '100%' },
  errorTexto:    { fontSize: '0.78rem', color: '#e53e3e', marginTop: '2px' },
  btnCancelar:   { background: '#f5ede6', color: '#7a5c4a', border: 'none', borderRadius: '10px', padding: '11px 24px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
  btnGuardar:    { background: '#c47c5a', color: '#fff', border: 'none', borderRadius: '10px', padding: '11px 28px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
}