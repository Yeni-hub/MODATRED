import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const API = 'http://localhost:4000/api'
const TEMPORADAS = ['primavera-verano', 'otoño-invierno', 'crucero', 'resort']

export default function Colecciones() {
  const { token } = useAuth()
  const headers   = { Authorization: `Bearer ${token}` }

  const [colecciones,   setColecciones]   = useState([])
  const [cargando,      setCargando]      = useState(true)
  const [modal,         setModal]         = useState(false)
  const [editando,      setEditando]      = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [form, setForm] = useState({ nombre: '', temporada: '', anio: '', descripcion: '', archivada: 0 })

  const cargar = async () => {
    setCargando(true)
    try {
      const { data } = await axios.get(`${API}/colecciones`, { headers })
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
        await axios.put(`${API}/colecciones/${editando.id_coleccion}`, form, { headers })
      } else {
        await axios.post(`${API}/colecciones`, form, { headers })
      }
      setModal(false)
      cargar()
    } catch (err) { alert(err.response?.data?.error || 'Error al guardar') }
  }

  const eliminar = async (id) => {
    try {
      await axios.delete(`${API}/colecciones/${id}`, { headers })
      setConfirmDelete(null)
      cargar()
    } catch { alert('Error al archivar colección') }
  }

  return (
    <div style={s.pagina}>
      <div style={s.header}>
        <div>
          <h1 style={s.titulo}>Colecciones</h1>
          <p style={s.subtitulo}>Gestiona las temporadas y colecciones de ModaTrend</p>
        </div>
        <button onClick={abrirNuevo} style={s.btnNuevo}>+ Nueva colección</button>
      </div>

      {cargando ? <div style={s.cargando}>Cargando...</div> : (
        <div style={s.grid}>
          {colecciones.map(c => (
            <div key={c.id_coleccion} style={{ ...s.card, opacity: c.archivada ? 0.6 : 1 }}>
              <div style={s.cardTop}>
                <span style={{ ...s.tempBadge, background: c.archivada ? '#f0e6de' : '#f7e6d8' }}>
                  {c.archivada ? '📁 Archivada' : `✨ ${c.temporada}`}
                </span>
                <span style={s.anioBadge}>{c.anio}</span>
              </div>
              <h3 style={s.cardNombre}>{c.nombre}</h3>
              <p style={s.cardDesc}>{c.descripcion || 'Sin descripción'}</p>
              <div style={s.cardAcciones}>
                <button onClick={() => abrirEditar(c)} style={s.btnEditar}>✏️ Editar</button>
                <button onClick={() => setConfirmDelete(c)} style={s.btnEliminar}>
                  {c.archivada ? '🗑️ Eliminar' : '📁 Archivar'}
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
              <h2 style={s.modalTitulo}>{editando ? 'Editar colección' : 'Nueva colección'}</h2>
              <button onClick={() => setModal(false)} style={s.btnCerrar}>✕</button>
            </div>
            <div style={s.modalBody}>
              <div style={s.campo}>
                <label style={s.label}>Nombre *</label>
                <input style={s.input} value={form.nombre}
                  onChange={e => setForm({...form, nombre: e.target.value})}
                  placeholder="Ej: Colección Rosa 2025" />
              </div>
              <div style={s.fila}>
                <div style={s.campo}>
                  <label style={s.label}>Temporada *</label>
                  <select style={s.input} value={form.temporada}
                    onChange={e => setForm({...form, temporada: e.target.value})}>
                    <option value="">Seleccionar...</option>
                    {TEMPORADAS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div style={s.campo}>
                  <label style={s.label}>Año *</label>
                  <input style={s.input} type="number" value={form.anio}
                    onChange={e => setForm({...form, anio: e.target.value})}
                    placeholder="2025" />
                </div>
              </div>
              <div style={s.campo}>
                <label style={s.label}>Descripción</label>
                <textarea style={s.textarea} value={form.descripcion}
                  onChange={e => setForm({...form, descripcion: e.target.value})}
                  placeholder="Descripción de la colección..." rows={3} />
              </div>
              {editando && (
                <label style={s.checkLabel}>
                  <input type="checkbox" checked={form.archivada === 1}
                    onChange={e => setForm({...form, archivada: e.target.checked ? 1 : 0})} />
                  &nbsp;Marcar como archivada
                </label>
              )}
            </div>
            <div style={s.modalFooter}>
              <button onClick={() => setModal(false)} style={s.btnCancelar}>Cancelar</button>
              <button onClick={guardar} style={s.btnGuardar}>{editando ? '✓ Actualizar' : '✓ Guardar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmar */}
      {confirmDelete && (
        <div style={s.modalFondo}>
          <div style={{...s.modal, maxWidth: '420px'}}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitulo}>¿Archivar colección?</h2>
              <button onClick={() => setConfirmDelete(null)} style={s.btnCerrar}>✕</button>
            </div>
            <div style={s.modalBody}>
              <p style={{ color: '#7a5c4a', fontSize: '1rem' }}>
                ¿Deseas archivar la colección <strong>{confirmDelete.nombre}</strong>?
                No podrá recibir nuevos productos.
              </p>
            </div>
            <div style={s.modalFooter}>
              <button onClick={() => setConfirmDelete(null)} style={s.btnCancelar}>Cancelar</button>
              <button onClick={() => eliminar(confirmDelete.id_coleccion)} style={{...s.btnGuardar, background:'#c45a5a'}}>
                Sí, archivar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const s = {
  pagina:      { padding: '36px 40px', height: '100%', overflowY: 'auto', background: '#f5ede6' },
  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' },
  titulo:      { fontSize: '1.8rem', fontWeight: '600', color: '#2a1a12' },
  subtitulo:   { fontSize: '0.95rem', color: '#9e7b65', marginTop: '4px' },
  btnNuevo:    { background: '#c47c5a', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 24px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
  cargando:    { textAlign: 'center', padding: '60px', color: '#9e7b65' },
  grid:        { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
  card:        { background: '#fff', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '12px' },
  cardTop:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  tempBadge:   { padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', color: '#c47c5a' },
  anioBadge:   { fontSize: '0.85rem', color: '#9e7b65', fontWeight: '600' },
  cardNombre:  { fontSize: '1.1rem', fontWeight: '600', color: '#2a1a12' },
  cardDesc:    { fontSize: '0.9rem', color: '#9e7b65', flex: 1 },
  cardAcciones:{ display: 'flex', gap: '8px', marginTop: '8px' },
  btnEditar:   { background: '#f7e6d8', color: '#c47c5a', border: 'none', borderRadius: '8px', padding: '7px 14px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '600' },
  btnEliminar: { background: '#fef0f0', color: '#c45a5a', border: 'none', borderRadius: '8px', padding: '7px 14px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '600' },
  modalFondo:  { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal:       { background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '560px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 28px', borderBottom: '1px solid #f0e6de' },
  modalTitulo: { fontSize: '1.2rem', fontWeight: '600', color: '#2a1a12' },
  btnCerrar:   { background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#9e7b65' },
  modalBody:   { padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '16px' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '20px 28px', borderTop: '1px solid #f0e6de' },
  fila:        { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  campo:       { display: 'flex', flexDirection: 'column', gap: '6px' },
  label:       { fontSize: '0.9rem', fontWeight: '600', color: '#7a5c4a' },
  input:       { padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e8d5c4', fontSize: '0.95rem', outline: 'none', color: '#2a1a12', background: '#fffaf7', boxSizing: 'border-box', width: '100%' },
  textarea:    { padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e8d5c4', fontSize: '0.95rem', outline: 'none', color: '#2a1a12', background: '#fffaf7', resize: 'vertical', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' },
  checkLabel:  { display: 'flex', alignItems: 'center', fontSize: '0.95rem', color: '#7a5c4a', cursor: 'pointer' },
  btnCancelar: { background: '#f5ede6', color: '#7a5c4a', border: 'none', borderRadius: '10px', padding: '11px 24px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
  btnGuardar:  { background: '#c47c5a', color: '#fff', border: 'none', borderRadius: '10px', padding: '11px 28px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
}