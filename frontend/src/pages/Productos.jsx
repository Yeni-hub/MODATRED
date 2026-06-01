import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const API = 'http://localhost:4000/api'

export default function Productos() {
  const { token } = useAuth()
  const headers   = { Authorization: `Bearer ${token}` }

  const [productos,    setProductos]    = useState([])
  const [categorias,   setCategorias]   = useState([])
  const [colecciones,  setColecciones]  = useState([])
  const [cargando,     setCargando]     = useState(true)
  const [error,        setError]        = useState('')
  const [busqueda,     setBusqueda]     = useState('')
  const [filtrocat,    setFiltrocat]    = useState('')
  const [filtrocol,    setFiltrocol]    = useState('')
  const [stockBajo,    setStockBajo]    = useState(false)
  const [modal,        setModal]        = useState(false)
  const [editando,     setEditando]     = useState(null)
  const [confirmDelete,setConfirmDelete]= useState(null)

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
      if (stockBajo) params.stock_bajo   = true

      const [p, c, col] = await Promise.all([
        axios.get(`${API}/productos`, { headers, params }),
        axios.get(`${API}/categorias`, { headers }),
        axios.get(`${API}/colecciones`, { headers }),
      ])
      setProductos(p.data)
      setCategorias(c.data)
      setColecciones(col.data)
    } catch (err) {
      setError('Error al cargar datos')
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
      referencia:   p.referencia,
      nombre:       p.nombre,
      descripcion:  p.descripcion || '',
      precio_base:  p.precio_base,
      id_categoria: p.id_categoria,
      id_coleccion: p.id_coleccion,
    })
    setModal(true)
  }

  const guardar = async () => {
    if (!form.referencia || !form.nombre || !form.precio_base || !form.id_categoria || !form.id_coleccion) {
      alert('Por favor completa todos los campos obligatorios')
      return
    }
    try {
      if (editando) {
        await axios.put(`${API}/productos/${editando.id_producto}`, form, { headers })
      } else {
        await axios.post(`${API}/productos`, form, { headers })
      }
      setModal(false)
      cargarDatos()
    } catch (err) {
      alert(err.response?.data?.error || 'Error al guardar producto')
    }
  }

  const eliminar = async (id) => {
    try {
      await axios.delete(`${API}/productos/${id}`, { headers })
      setConfirmDelete(null)
      cargarDatos()
    } catch (err) {
      alert('Error al eliminar producto')
    }
  }

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.referencia.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div style={s.pagina}>

      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.titulo}>Productos</h1>
          <p style={s.subtitulo}>Gestiona el catálogo de productos de ModaTrend</p>
        </div>
        <button onClick={abrirNuevo} style={s.btnNuevo}>+ Nuevo producto</button>
      </div>

      {/* Filtros */}
      <div style={s.filtros}>
        <input
          placeholder="🔍 Buscar por nombre o referencia..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={s.inputBusqueda}
        />
        <select value={filtrocat} onChange={e => setFiltrocat(e.target.value)} style={s.select}>
          <option value="">Todas las categorías</option>
          {categorias.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
        </select>
        <select value={filtrocol} onChange={e => setFiltrocol(e.target.value)} style={s.select}>
          <option value="">Todas las colecciones</option>
          {colecciones.map(c => <option key={c.id_coleccion} value={c.id_coleccion}>{c.nombre}</option>)}
        </select>
        <label style={s.checkLabel}>
          <input type="checkbox" checked={stockBajo} onChange={e => setStockBajo(e.target.checked)} />
          &nbsp;Stock bajo
        </label>
      </div>

      {/* Tabla */}
      {cargando ? (
        <div style={s.cargando}>Cargando productos...</div>
      ) : productosFiltrados.length === 0 ? (
        <div style={s.vacio}>No hay productos registrados</div>
      ) : (
        <div style={s.tablaWrap}>
          <table style={s.tabla}>
            <thead>
              <tr>
                {['Referencia','Nombre','Categoría','Colección','Precio','Stock','Acciones'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map(p => (
                <tr key={p.id_producto} style={s.tr}>
                  <td style={s.td}><span style={s.refBadge}>{p.referencia}</span></td>
                  <td style={s.td}>{p.nombre}</td>
                  <td style={s.td}>{p.categoria}</td>
                  <td style={s.td}>{p.coleccion}</td>
                  <td style={s.td}>${Number(p.precio_base).toLocaleString('es-CO')}</td>
                  <td style={s.td}>
                    <span style={{
                      ...s.stockBadge,
                      background: p.stock_total <= 5 ? '#fef0f0' : '#e6f4ea',
                      color:      p.stock_total <= 5 ? '#c45a5a' : '#2d7a3a',
                    }}>
                      {p.stock_total} uds
                    </span>
                  </td>
                  <td style={s.td}>
                    <div style={s.acciones}>
                      <button onClick={() => abrirEditar(p)} style={s.btnEditar}>✏️ Editar</button>
                      <button onClick={() => setConfirmDelete(p)} style={s.btnEliminar}>🗑️ Eliminar</button>
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
              <h2 style={s.modalTitulo}>{editando ? 'Editar producto' : 'Nuevo producto'}</h2>
              <button onClick={() => setModal(false)} style={s.btnCerrar}>✕</button>
            </div>

            <div style={s.modalBody}>
              <div style={s.fila}>
                <div style={s.campo}>
                  <label style={s.label}>Referencia *</label>
                  <input style={s.input} value={form.referencia}
                    onChange={e => setForm({...form, referencia: e.target.value})}
                    placeholder="Ej: BL-001" />
                </div>
                <div style={s.campo}>
                  <label style={s.label}>Precio base *</label>
                  <input style={s.input} type="number" value={form.precio_base}
                    onChange={e => setForm({...form, precio_base: e.target.value})}
                    placeholder="Ej: 89000" />
                </div>
              </div>

              <div style={s.campo}>
                <label style={s.label}>Nombre del producto *</label>
                <input style={s.input} value={form.nombre}
                  onChange={e => setForm({...form, nombre: e.target.value})}
                  placeholder="Ej: Blusa Floral Rosa" />
              </div>

              <div style={s.campo}>
                <label style={s.label}>Descripción</label>
                <textarea style={s.textarea} value={form.descripcion}
                  onChange={e => setForm({...form, descripcion: e.target.value})}
                  placeholder="Descripción del producto..." rows={3} />
              </div>

              <div style={s.fila}>
                <div style={s.campo}>
                  <label style={s.label}>Categoría *</label>
                  <select style={s.input} value={form.id_categoria}
                    onChange={e => setForm({...form, id_categoria: e.target.value})}>
                    <option value="">Seleccionar...</option>
                    {categorias.map(c => (
                      <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
                <div style={s.campo}>
                  <label style={s.label}>Colección *</label>
                  <select style={s.input} value={form.id_coleccion}
                    onChange={e => setForm({...form, id_coleccion: e.target.value})}>
                    <option value="">Seleccionar...</option>
                    {colecciones.map(c => (
                      <option key={c.id_coleccion} value={c.id_coleccion}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div style={s.modalFooter}>
              <button onClick={() => setModal(false)} style={s.btnCancelar}>Cancelar</button>
              <button onClick={guardar} style={s.btnGuardar}>
                {editando ? '✓ Actualizar' : '✓ Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmar eliminar */}
      {confirmDelete && (
        <div style={s.modalFondo}>
          <div style={{...s.modal, maxWidth: '420px'}}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitulo}>¿Eliminar producto?</h2>
              <button onClick={() => setConfirmDelete(null)} style={s.btnCerrar}>✕</button>
            </div>
            <div style={s.modalBody}>
              <p style={{ color: '#7a5c4a', fontSize: '1rem' }}>
                ¿Estás segura de que deseas desactivar el producto <strong>{confirmDelete.nombre}</strong>?
                Esta acción no se puede deshacer.
              </p>
            </div>
            <div style={s.modalFooter}>
              <button onClick={() => setConfirmDelete(null)} style={s.btnCancelar}>Cancelar</button>
              <button onClick={() => eliminar(confirmDelete.id_producto)} style={{...s.btnGuardar, background:'#c45a5a'}}>
                🗑️ Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

const s = {
  pagina:       { padding: '36px 40px', height: '100%', overflowY: 'auto', background: '#f5ede6' },
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  titulo:       { fontSize: '1.8rem', fontWeight: '600', color: '#2a1a12' },
  subtitulo:    { fontSize: '0.95rem', color: '#9e7b65', marginTop: '4px' },
  btnNuevo:     { background: '#c47c5a', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 24px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
  filtros:      { display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' },
  inputBusqueda:{ flex: '1', minWidth: '220px', padding: '10px 16px', borderRadius: '10px', border: '1.5px solid #e8d5c4', fontSize: '0.95rem', background: '#fff', outline: 'none' },
  select:       { padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e8d5c4', fontSize: '0.95rem', background: '#fff', outline: 'none', cursor: 'pointer' },
  checkLabel:   { display: 'flex', alignItems: 'center', fontSize: '0.95rem', color: '#7a5c4a', cursor: 'pointer' },
  cargando:     { textAlign: 'center', padding: '60px', color: '#9e7b65', fontSize: '1rem' },
  vacio:        { textAlign: 'center', padding: '60px', color: '#9e7b65', fontSize: '1rem' },
  tablaWrap:    { background: '#fff', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  tabla:        { width: '100%', borderCollapse: 'collapse' },
  th:           { padding: '14px 16px', textAlign: 'left', fontSize: '0.8rem', color: '#9e7b65', fontWeight: '600', letterSpacing: '0.5px', borderBottom: '1px solid #f0e6de', background: '#fffaf7' },
  tr:           { borderBottom: '0.5px solid #f7f0eb' },
  td:           { padding: '14px 16px', fontSize: '0.95rem', color: '#2a1a12' },
  refBadge:     { background: '#f7e6d8', color: '#c47c5a', padding: '3px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' },
  stockBadge:   { padding: '3px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' },
  acciones:     { display: 'flex', gap: '8px' },
  btnEditar:    { background: '#f7e6d8', color: '#c47c5a', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '600' },
  btnEliminar:  { background: '#fef0f0', color: '#c45a5a', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '600' },
  modalFondo:   { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal:        { background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '600px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  modalHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 28px', borderBottom: '1px solid #f0e6de' },
  modalTitulo:  { fontSize: '1.2rem', fontWeight: '600', color: '#2a1a12' },
  btnCerrar:    { background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#9e7b65' },
  modalBody:    { padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '16px' },
  modalFooter:  { display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '20px 28px', borderTop: '1px solid #f0e6de' },
  fila:         { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  campo:        { display: 'flex', flexDirection: 'column', gap: '6px' },
  label:        { fontSize: '0.9rem', fontWeight: '600', color: '#7a5c4a' },
  input:        { padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e8d5c4', fontSize: '0.95rem', outline: 'none', color: '#2a1a12', background: '#fffaf7', boxSizing: 'border-box', width: '100%' },
  textarea:     { padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e8d5c4', fontSize: '0.95rem', outline: 'none', color: '#2a1a12', background: '#fffaf7', resize: 'vertical', fontFamily: 'inherit' },
  btnCancelar:  { background: '#f5ede6', color: '#7a5c4a', border: 'none', borderRadius: '10px', padding: '11px 24px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
  btnGuardar:   { background: '#c47c5a', color: '#fff', border: 'none', borderRadius: '10px', padding: '11px 28px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
}