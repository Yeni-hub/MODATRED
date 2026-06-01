import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const API = 'http://localhost:4000/api'
const TALLAS = ['XS','S','M','L','XL','XXL','36','37','38','39','40','41','42','U']

export default function Variantes() {
  const { token } = useAuth()
  const headers   = { Authorization: `Bearer ${token}` }

  const [variantes,     setVariantes]     = useState([])
  const [productos,     setProductos]     = useState([])
  const [cargando,      setCargando]      = useState(true)
  const [modal,         setModal]         = useState(false)
  const [editando,      setEditando]      = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [filtroProd,    setFiltroProd]    = useState('')
  const [form, setForm] = useState({
    id_producto: '', talla: '', color: '', stock: 0, precio_costo: 0
  })

  const cargar = async () => {
    setCargando(true)
    try {
      const params = {}
      if (filtroProd) params.id_producto = filtroProd
      const [v, p] = await Promise.all([
        axios.get(`${API}/variantes`, { headers, params }),
        axios.get(`${API}/productos`, { headers }),
      ])
      setVariantes(v.data)
      setProductos(p.data)
    } catch { } finally { setCargando(false) }
  }

  useEffect(() => { cargar() }, [filtroProd])

  const abrirNuevo = () => {
    setEditando(null)
    setForm({ id_producto: '', talla: '', color: '', stock: 0, precio_costo: 0 })
    setModal(true)
  }

  const abrirEditar = (v) => {
    setEditando(v)
    setForm({
      id_producto:  v.id_producto,
      talla:        v.talla,
      color:        v.color,
      stock:        v.stock,
      precio_costo: v.precio_costo,
    })
    setModal(true)
  }

  const guardar = async () => {
    if (!form.id_producto || !form.talla || !form.color) {
      alert('Completa los campos obligatorios')
      return
    }
    try {
      if (editando) {
        await axios.put(`${API}/variantes/${editando.id_variante}`, form, { headers })
      } else {
        await axios.post(`${API}/variantes`, form, { headers })
      }
      setModal(false)
      cargar()
    } catch (err) {
      alert(err.response?.data?.error || 'Error al guardar variante')
    }
  }

  const eliminar = async (id) => {
    try {
      await axios.delete(`${API}/variantes/${id}`, { headers })
      setConfirmDelete(null)
      cargar()
    } catch { alert('Error al eliminar variante') }
  }

  return (
    <div style={s.pagina}>
      <div style={s.header}>
        <div>
          <h1 style={s.titulo}>Variantes</h1>
          <p style={s.subtitulo}>Gestiona tallas, colores y stock por producto</p>
        </div>
        <button onClick={abrirNuevo} style={s.btnNuevo}>+ Nueva variante</button>
      </div>

      {/* Filtro */}
      <div style={s.filtros}>
        <select value={filtroProd} onChange={e => setFiltroProd(e.target.value)} style={s.select}>
          <option value="">Todos los productos</option>
          {productos.map(p => (
            <option key={p.id_producto} value={p.id_producto}>{p.nombre}</option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      {cargando ? <div style={s.cargando}>Cargando...</div> : (
        <div style={s.tablaWrap}>
          <table style={s.tabla}>
            <thead>
              <tr>
                {['Producto','Referencia','Talla','Color','Stock','Precio costo','Acciones'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {variantes.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign:'center', padding:'40px', color:'#9e7b65' }}>No hay variantes registradas</td></tr>
              ) : variantes.map(v => (
                <tr key={v.id_variante} style={s.tr}>
                  <td style={s.td}>{v.producto}</td>
                  <td style={s.td}><span style={s.refBadge}>{v.referencia}</span></td>
                  <td style={s.td}><span style={s.tallaBadge}>{v.talla}</span></td>
                  <td style={s.td}>
                    <div style={s.colorWrap}>
                      <div style={{ ...s.colorDot, background: v.color.toLowerCase() }} />
                      {v.color}
                    </div>
                  </td>
                  <td style={s.td}>
                    <span style={{
                      ...s.stockBadge,
                      background: v.stock <= 5 ? '#fef0f0' : '#e6f4ea',
                      color:      v.stock <= 5 ? '#c45a5a' : '#2d7a3a',
                    }}>
                      {v.stock} uds
                    </span>
                  </td>
                  <td style={s.td}>${Number(v.precio_costo).toLocaleString('es-CO')}</td>
                  <td style={s.td}>
                    <div style={s.acciones}>
                      <button onClick={() => abrirEditar(v)} style={s.btnEditar}>✏️ Editar</button>
                      <button onClick={() => setConfirmDelete(v)} style={s.btnEliminar}>🗑️</button>
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
              <h2 style={s.modalTitulo}>{editando ? 'Editar variante' : 'Nueva variante'}</h2>
              <button onClick={() => setModal(false)} style={s.btnCerrar}>✕</button>
            </div>
            <div style={s.modalBody}>
              <div style={s.campo}>
                <label style={s.label}>Producto *</label>
                <select style={s.input} value={form.id_producto}
                  onChange={e => setForm({...form, id_producto: e.target.value})}
                  disabled={!!editando}>
                  <option value="">Seleccionar producto...</option>
                  {productos.map(p => (
                    <option key={p.id_producto} value={p.id_producto}>{p.nombre}</option>
                  ))}
                </select>
              </div>
              <div style={s.fila}>
                <div style={s.campo}>
                  <label style={s.label}>Talla *</label>
                  <select style={s.input} value={form.talla}
                    onChange={e => setForm({...form, talla: e.target.value})}>
                    <option value="">Seleccionar...</option>
                    {TALLAS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div style={s.campo}>
                  <label style={s.label}>Color *</label>
                  <input style={s.input} value={form.color}
                    onChange={e => setForm({...form, color: e.target.value})}
                    placeholder="Ej: Rosa, Crema, Negro" />
                </div>
              </div>
              <div style={s.fila}>
                <div style={s.campo}>
                  <label style={s.label}>Stock inicial</label>
                  <input style={s.input} type="number" min="0" value={form.stock}
                    onChange={e => setForm({...form, stock: e.target.value})} />
                </div>
                <div style={s.campo}>
                  <label style={s.label}>Precio costo</label>
                  <input style={s.input} type="number" min="0" value={form.precio_costo}
                    onChange={e => setForm({...form, precio_costo: e.target.value})} />
                </div>
              </div>
            </div>
            <div style={s.modalFooter}>
              <button onClick={() => setModal(false)} style={s.btnCancelar}>Cancelar</button>
              <button onClick={guardar} style={s.btnGuardar}>{editando ? '✓ Actualizar' : '✓ Guardar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmar eliminar */}
      {confirmDelete && (
        <div style={s.modalFondo}>
          <div style={{...s.modal, maxWidth:'420px'}}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitulo}>¿Eliminar variante?</h2>
              <button onClick={() => setConfirmDelete(null)} style={s.btnCerrar}>✕</button>
            </div>
            <div style={s.modalBody}>
              <p style={{ color:'#7a5c4a', fontSize:'1rem' }}>
                ¿Eliminar la variante <strong>talla {confirmDelete.talla} — {confirmDelete.color}</strong> de <strong>{confirmDelete.producto}</strong>?
                Si tiene ventas, solo se desactivará.
              </p>
            </div>
            <div style={s.modalFooter}>
              <button onClick={() => setConfirmDelete(null)} style={s.btnCancelar}>Cancelar</button>
              <button onClick={() => eliminar(confirmDelete.id_variante)} style={{...s.btnGuardar, background:'#c45a5a'}}>
                Sí, eliminar
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
  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  titulo:      { fontSize: '1.8rem', fontWeight: '600', color: '#2a1a12' },
  subtitulo:   { fontSize: '0.95rem', color: '#9e7b65', marginTop: '4px' },
  btnNuevo:    { background: '#c47c5a', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 24px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
  filtros:     { marginBottom: '20px' },
  select:      { padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e8d5c4', fontSize: '0.95rem', background: '#fff', outline: 'none', cursor: 'pointer', minWidth: '240px' },
  cargando:    { textAlign: 'center', padding: '60px', color: '#9e7b65' },
  tablaWrap:   { background: '#fff', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  tabla:       { width: '100%', borderCollapse: 'collapse' },
  th:          { padding: '14px 16px', textAlign: 'left', fontSize: '0.8rem', color: '#9e7b65', fontWeight: '600', letterSpacing: '0.5px', borderBottom: '1px solid #f0e6de', background: '#fffaf7' },
  tr:          { borderBottom: '0.5px solid #f7f0eb' },
  td:          { padding: '14px 16px', fontSize: '0.95rem', color: '#2a1a12' },
  refBadge:    { background: '#f7e6d8', color: '#c47c5a', padding: '3px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' },
  tallaBadge:  { background: '#f0e6de', color: '#7a5c4a', padding: '3px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' },
  colorWrap:   { display: 'flex', alignItems: 'center', gap: '8px' },
  colorDot:    { width: '14px', height: '14px', borderRadius: '50%', border: '1px solid rgba(0,0,0,0.1)', flexShrink: 0 },
  stockBadge:  { padding: '3px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' },
  acciones:    { display: 'flex', gap: '8px' },
  btnEditar:   { background: '#f7e6d8', color: '#c47c5a', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '600' },
  btnEliminar: { background: '#fef0f0', color: '#c45a5a', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '600' },
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
  btnCancelar: { background: '#f5ede6', color: '#7a5c4a', border: 'none', borderRadius: '10px', padding: '11px 24px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
  btnGuardar:  { background: '#c47c5a', color: '#fff', border: 'none', borderRadius: '10px', padding: '11px 28px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
}