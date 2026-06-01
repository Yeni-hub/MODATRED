import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const API = 'http://localhost:4000/api'
const TIPOS_DOC = ['CC', 'CE', 'NIT', 'PAS']

const validarForm = (form) => {
  const errores = {}
  if (!form.nombre.trim())                          errores.nombre    = 'El nombre es obligatorio'
  if (!form.documento.trim())                       errores.documento = 'El documento es obligatorio'
  if (!/^\d+$/.test(form.documento))               errores.documento = 'El documento solo debe contener números'
  if (form.telefono && !/^\d+$/.test(form.telefono)) errores.telefono = 'El teléfono solo debe contener números'
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errores.email = 'El correo no es válido (debe contener @)'
  return errores
}

export default function Clientes() {
  const { token } = useAuth()
  const headers   = { Authorization: `Bearer ${token}` }

  const [clientes,      setClientes]      = useState([])
  const [cargando,      setCargando]      = useState(true)
  const [modal,         setModal]         = useState(false)
  const [modalSaldo,    setModalSaldo]    = useState(false)
  const [clienteSaldo,  setClienteSaldo]  = useState(null)
  const [montoSaldo,    setMontoSaldo]    = useState('')
  const [editando,      setEditando]      = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [busqueda,      setBusqueda]      = useState('')
  const [errores,       setErrores]       = useState({})
  const [alerta,        setAlerta]        = useState({ visible: false, mensaje: '', tipo: 'exito' })
  const [form, setForm] = useState({
    nombre: '', documento: '', tipo_doc: 'CC', telefono: '', email: '', preferencias: ''
  })

  const mostrarAlerta = (mensaje, tipo = 'exito') => {
    setAlerta({ visible: true, mensaje, tipo })
    setTimeout(() => setAlerta({ visible: false, mensaje: '', tipo: 'exito' }), 3000)
  }

  const cargar = async () => {
    setCargando(true)
    try {
      const { data } = await axios.get(`${API}/clientes`, { headers })
      setClientes(data)
    } catch { } finally { setCargando(false) }
  }

  useEffect(() => { cargar() }, [])

  const abrirNuevo = () => {
    setEditando(null)
    setErrores({})
    setForm({ nombre: '', documento: '', tipo_doc: 'CC', telefono: '', email: '', preferencias: '' })
    setModal(true)
  }

  const abrirEditar = (c) => {
    setEditando(c)
    setErrores({})
    setForm({
      nombre:       c.nombre,
      documento:    c.documento,
      tipo_doc:     c.tipo_doc,
      telefono:     c.telefono     || '',
      email:        c.email        || '',
      preferencias: c.preferencias || '',
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
        await axios.put(`${API}/clientes/${editando.id_cliente}`, form, { headers })
        mostrarAlerta('Cliente actualizado exitosamente')
      } else {
        await axios.post(`${API}/clientes`, form, { headers })
        mostrarAlerta('Cliente creado exitosamente')
      }
      setModal(false)
      cargar()
    } catch (err) {
      mostrarAlerta(err.response?.data?.error || 'Error al guardar cliente', 'error')
    }
  }

  const agregarSaldo = async () => {
    if (!montoSaldo || Number(montoSaldo) <= 0) {
      mostrarAlerta('Ingresa un monto válido mayor a 0', 'error')
      return
    }
    try {
      await axios.post(`${API}/ventas/saldo-favor`,
        { id_cliente: clienteSaldo.id_cliente, monto: Number(montoSaldo) },
        { headers }
      )
      mostrarAlerta(`✅ Saldo de $${Number(montoSaldo).toLocaleString('es-CO')} agregado a ${clienteSaldo.nombre}`)
      setModalSaldo(false)
      setMontoSaldo('')
      cargar()
    } catch (err) {
      mostrarAlerta(err.response?.data?.error || 'Error al agregar saldo', 'error')
    }
  }

  const toggleActivo = async (c) => {
    try {
      const nuevoEstado = c.activo === 1 ? 0 : 1
      await axios.put(`${API}/clientes/${c.id_cliente}`, { ...c, activo: nuevoEstado }, { headers })
      mostrarAlerta(nuevoEstado === 1 ? '✅ Cliente reactivado' : '📁 Cliente archivado')
      setConfirmDelete(null)
      cargar()
    } catch {
      mostrarAlerta('Error al cambiar estado del cliente', 'error')
    }
  }

  const filtrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.documento.includes(busqueda)
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
          <h1 style={s.titulo}>Clientes</h1>
          <p style={s.subtitulo}>Gestiona los clientes de ModaTrend</p>
        </div>
        <button onClick={abrirNuevo} style={s.btnNuevo}>+ Nuevo cliente</button>
      </div>

      <div style={s.filtros}>
        <input
          placeholder="🔍 Buscar por nombre o documento..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={s.inputBusqueda}
        />
      </div>

      {cargando ? <div style={s.cargando}>Cargando...</div> : (
        <div style={s.tablaWrap}>
          <table style={s.tabla}>
            <thead>
              <tr>
                {['Nombre','Documento','Teléfono','Email','Preferencias','Saldo favor','Estado','Acciones'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign:'center', padding:'40px', color:'#9e7b65' }}>
                  No hay clientes registrados
                </td></tr>
              ) : filtrados.map(c => (
                <tr key={c.id_cliente} style={{ ...s.tr, opacity: c.activo === 0 ? 0.6 : 1 }}>
                  <td style={s.td}><div style={s.clienteNombre}>{c.nombre}</div></td>
                  <td style={s.td}><span style={s.docBadge}>{c.tipo_doc}</span> {c.documento}</td>
                  <td style={s.td}>{c.telefono || '—'}</td>
                  <td style={s.td}>{c.email || '—'}</td>
                  <td style={s.td}><span style={s.prefTexto}>{c.preferencias || '—'}</span></td>
                  <td style={s.td}>
                    {Number(c.saldo_favor) > 0
                      ? <span style={{ color: '#2d7a3a', fontWeight: '600' }}>${Number(c.saldo_favor).toLocaleString('es-CO')}</span>
                      : <span style={{ color: '#b89a8a' }}>—</span>
                    }
                  </td>
                  <td style={s.td}>
                    <span style={{
                      ...s.estadoBadge,
                      background: c.activo === 1 ? '#e6f4ea' : '#fef0f0',
                      color:      c.activo === 1 ? '#2d7a3a' : '#c45a5a',
                    }}>
                      {c.activo === 1 ? '● Activo' : '● Inactivo'}
                    </span>
                  </td>
                  <td style={s.td}>
                    <div style={s.acciones}>
                      <button onClick={() => abrirEditar(c)} style={s.btnEditar}>✏️</button>
                      <button onClick={() => { setClienteSaldo(c); setMontoSaldo(''); setModalSaldo(true) }} style={s.btnSaldo}>🎁</button>
                      <button onClick={() => setConfirmDelete(c)} style={{
                        ...s.btnToggle,
                        background: c.activo === 1 ? '#fef0f0' : '#e6f4ea',
                        color:      c.activo === 1 ? '#c45a5a' : '#2d7a3a',
                      }}>
                        {c.activo === 1 ? '📁' : '♻️'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal formulario */}
      {modal && (
        <div style={s.modalFondo}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitulo}>{editando ? 'Editar cliente' : 'Nuevo cliente'}</h2>
              <button onClick={() => setModal(false)} style={s.btnCerrar}>✕</button>
            </div>
            <div style={s.modalBody}>

              <div style={s.campo}>
                <label style={s.label}>Nombre completo *</label>
                <input
                  style={{ ...s.input, borderColor: errores.nombre ? '#e53e3e' : '#e8d5c4' }}
                  value={form.nombre}
                  onChange={e => handleChange('nombre', e.target.value)}
                  placeholder="Nombre completo del cliente" />
                {errores.nombre && <span style={s.errorTexto}>⚠ {errores.nombre}</span>}
              </div>

              <div style={s.fila}>
                <div style={s.campo}>
                  <label style={s.label}>Tipo documento *</label>
                  <select style={s.input} value={form.tipo_doc}
                    onChange={e => handleChange('tipo_doc', e.target.value)}>
                    {TIPOS_DOC.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div style={s.campo}>
                  <label style={s.label}>Número documento * (solo números)</label>
                  <input
                    style={{ ...s.input, borderColor: errores.documento ? '#e53e3e' : '#e8d5c4' }}
                    value={form.documento}
                    onChange={e => soloNumeros('documento', e.target.value)}
                    placeholder="Ej: 52456789"
                    inputMode="numeric" />
                  {errores.documento && <span style={s.errorTexto}>⚠ {errores.documento}</span>}
                </div>
              </div>

              <div style={s.fila}>
                <div style={s.campo}>
                  <label style={s.label}>Teléfono (solo números)</label>
                  <input
                    style={{ ...s.input, borderColor: errores.telefono ? '#e53e3e' : '#e8d5c4' }}
                    value={form.telefono}
                    onChange={e => soloNumeros('telefono', e.target.value)}
                    placeholder="Ej: 3156789012"
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
                    placeholder="correo@email.com" />
                  {errores.email && <span style={s.errorTexto}>⚠ {errores.email}</span>}
                </div>
              </div>

              <div style={s.campo}>
                <label style={s.label}>Preferencias</label>
                <textarea style={s.textarea} value={form.preferencias}
                  onChange={e => handleChange('preferencias', e.target.value)}
                  placeholder="Ej: Talla M, colores pasteles, ropa casual..." rows={3} />
              </div>

            </div>
            <div style={s.modalFooter}>
              <button onClick={() => setModal(false)} style={s.btnCancelar}>Cancelar</button>
              <button onClick={guardar} style={s.btnGuardar}>{editando ? '✓ Actualizar' : '✓ Guardar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal saldo a favor */}
      {modalSaldo && (
        <div style={s.modalFondo}>
          <div style={{...s.modal, maxWidth: '420px'}}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitulo}>🎁 Agregar saldo a favor</h2>
              <button onClick={() => setModalSaldo(false)} style={s.btnCerrar}>✕</button>
            </div>
            <div style={s.modalBody}>
              <p style={{ color: '#7a5c4a', fontSize: '0.95rem' }}>
                Cliente: <strong>{clienteSaldo?.nombre}</strong>
              </p>
              <p style={{ color: '#7a5c4a', fontSize: '0.95rem' }}>
                Saldo actual: <strong style={{ color: '#2d7a3a' }}>
                  ${Number(clienteSaldo?.saldo_favor || 0).toLocaleString('es-CO')}
                </strong>
              </p>
              <div style={s.campo}>
                <label style={s.label}>Monto a agregar *</label>
                <input style={s.input} type="number" min="1"
                  value={montoSaldo}
                  onChange={e => setMontoSaldo(e.target.value)}
                  placeholder="Ej: 50000" />
              </div>
            </div>
            <div style={s.modalFooter}>
              <button onClick={() => setModalSaldo(false)} style={s.btnCancelar}>Cancelar</button>
              <button onClick={agregarSaldo} style={s.btnGuardar}>✓ Agregar saldo</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmar archivar/reactivar */}
      {confirmDelete && (
        <div style={s.modalFondo}>
          <div style={{...s.modal, maxWidth:'420px'}}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitulo}>
                {confirmDelete.activo === 1 ? '📁 ¿Archivar cliente?' : '♻️ ¿Reactivar cliente?'}
              </h2>
              <button onClick={() => setConfirmDelete(null)} style={s.btnCerrar}>✕</button>
            </div>
            <div style={s.modalBody}>
              <p style={{ color:'#7a5c4a', fontSize:'1rem' }}>
                {confirmDelete.activo === 1
                  ? <>¿Archivar a <strong>{confirmDelete.nombre}</strong>?</>
                  : <>¿Reactivar a <strong>{confirmDelete.nombre}</strong>?</>
                }
              </p>
            </div>
            <div style={s.modalFooter}>
              <button onClick={() => setConfirmDelete(null)} style={s.btnCancelar}>Cancelar</button>
              <button onClick={() => toggleActivo(confirmDelete)} style={{
                ...s.btnGuardar,
                background: confirmDelete.activo === 1 ? '#c45a5a' : '#2d7a3a'
              }}>
                {confirmDelete.activo === 1 ? '📁 Archivar' : '♻️ Reactivar'}
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
  tablaWrap:     { background: '#fff', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  tabla:         { width: '100%', borderCollapse: 'collapse' },
  th:            { padding: '14px 16px', textAlign: 'left', fontSize: '0.8rem', color: '#9e7b65', fontWeight: '600', letterSpacing: '0.5px', borderBottom: '1px solid #f0e6de', background: '#fffaf7' },
  tr:            { borderBottom: '0.5px solid #f7f0eb' },
  td:            { padding: '14px 16px', fontSize: '0.95rem', color: '#2a1a12' },
  clienteNombre: { fontWeight: '600' },
  docBadge:      { background: '#f7e6d8', color: '#c47c5a', padding: '2px 8px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' },
  prefTexto:     { fontSize: '0.85rem', color: '#9e7b65', fontStyle: 'italic' },
  estadoBadge:   { padding: '3px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' },
  acciones:      { display: 'flex', gap: '6px' },
  btnEditar:     { background: '#f7e6d8', color: '#c47c5a', border: 'none', borderRadius: '8px', padding: '6px 10px', fontSize: '0.9rem', cursor: 'pointer' },
  btnSaldo:      { background: '#e6f4ea', color: '#2d7a3a', border: 'none', borderRadius: '8px', padding: '6px 10px', fontSize: '0.9rem', cursor: 'pointer' },
  btnToggle:     { border: 'none', borderRadius: '8px', padding: '6px 10px', fontSize: '0.9rem', cursor: 'pointer' },
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
  textarea:      { padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e8d5c4', fontSize: '0.95rem', outline: 'none', color: '#2a1a12', background: '#fffaf7', resize: 'vertical', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' },
  errorTexto:    { fontSize: '0.78rem', color: '#e53e3e', marginTop: '2px' },
  btnCancelar:   { background: '#f5ede6', color: '#7a5c4a', border: 'none', borderRadius: '10px', padding: '11px 24px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
  btnGuardar:    { background: '#c47c5a', color: '#fff', border: 'none', borderRadius: '10px', padding: '11px 28px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
}