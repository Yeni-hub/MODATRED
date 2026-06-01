import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const API = 'http://localhost:4000/api'

export default function Compras() {
  const { token } = useAuth()
  const headers   = { Authorization: `Bearer ${token}` }

  const [compras,       setCompras]       = useState([])
  const [proveedores,   setProveedores]   = useState([])
  const [variantes,     setVariantes]     = useState([])
  const [cargando,      setCargando]      = useState(true)
  const [modal,         setModal]         = useState(false)
  const [detalle,       setDetalle]       = useState(null)
  const [alerta,        setAlerta]        = useState({ visible: false, mensaje: '', tipo: 'exito' })
  const [form,          setForm]          = useState({ id_proveedor: '', observaciones: '', items: [] })
  const [itemActual,    setItemActual]    = useState({ id_variante: '', cantidad: 1, precio_costo: '' })

  const mostrarAlerta = (mensaje, tipo = 'exito') => {
    setAlerta({ visible: true, mensaje, tipo })
    setTimeout(() => setAlerta({ visible: false, mensaje: '', tipo: 'exito' }), 3000)
  }

  const cargar = async () => {
    setCargando(true)
    try {
      const [c, p, v] = await Promise.all([
        axios.get(`${API}/compras`,     { headers }),
        axios.get(`${API}/proveedores`, { headers }),
        axios.get(`${API}/variantes`,   { headers }),
      ])
      setCompras(c.data)
      setProveedores(p.data.filter(p => p.activo === 1))
      setVariantes(v.data)
    } catch { } finally { setCargando(false) }
  }

  useEffect(() => { cargar() }, [])

  const abrirNueva = () => {
    setForm({ id_proveedor: '', observaciones: '', items: [] })
    setItemActual({ id_variante: '', cantidad: 1, precio_costo: '' })
    setModal(true)
  }

  const agregarItem = () => {
    if (!itemActual.id_variante || !itemActual.precio_costo) {
      mostrarAlerta('Selecciona una variante y precio de costo', 'error')
      return
    }
    const variante = variantes.find(v => v.id_variante === Number(itemActual.id_variante))
    if (!variante) return
    const yaExiste = form.items.find(i => i.id_variante === Number(itemActual.id_variante))
    if (yaExiste) { mostrarAlerta('Esta variante ya está en la compra', 'error'); return }

    setForm({
      ...form,
      items: [...form.items, {
        id_variante:  Number(itemActual.id_variante),
        cantidad:     Number(itemActual.cantidad),
        precio_costo: Number(itemActual.precio_costo),
        nombre:       `${variante.producto} — ${variante.talla} / ${variante.color}`,
      }]
    })
    setItemActual({ id_variante: '', cantidad: 1, precio_costo: '' })
  }

  const quitarItem = (idx) => {
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) })
  }

  const total = form.items.reduce((acc, i) => acc + i.cantidad * i.precio_costo, 0)

  const guardar = async () => {
    if (!form.id_proveedor) { mostrarAlerta('Selecciona un proveedor', 'error'); return }
    if (form.items.length === 0) { mostrarAlerta('Agrega al menos un producto', 'error'); return }
    try {
      await axios.post(`${API}/compras`, {
        id_proveedor:  Number(form.id_proveedor),
        observaciones: form.observaciones,
        items:         form.items.map(i => ({ id_variante: i.id_variante, cantidad: i.cantidad, precio_costo: i.precio_costo }))
      }, { headers })
      mostrarAlerta('✅ Compra registrada y stock actualizado')
      setModal(false)
      cargar()
    } catch (err) {
      mostrarAlerta(err.response?.data?.error || 'Error al registrar compra', 'error')
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
          <h1 style={s.titulo}>Compras</h1>
          <p style={s.subtitulo}>Registro de compras a proveedores — actualiza el inventario automáticamente</p>
        </div>
        <button onClick={abrirNueva} style={s.btnNuevo}>+ Nueva compra</button>
      </div>

      {cargando ? <div style={s.cargando}>Cargando...</div> : (
        <div style={s.tablaWrap}>
          <table style={s.tabla}>
            <thead>
              <tr>
                {['#','Fecha','Proveedor','Usuario','Total','Acciones'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {compras.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign:'center', padding:'40px', color:'#9e7b65' }}>No hay compras registradas</td></tr>
              ) : compras.map(c => (
                <tr key={c.id_compra} style={s.tr}>
                  <td style={s.td}><span style={s.idBadge}>#{c.id_compra}</span></td>
                  <td style={s.td}>{new Date(c.fecha).toLocaleDateString('es-CO')}</td>
                  <td style={s.td}><strong>{c.proveedor}</strong></td>
                  <td style={s.td}>{c.usuario}</td>
                  <td style={s.td}><strong style={{ color: '#c47c5a' }}>${Number(c.total).toLocaleString('es-CO')}</strong></td>
                  <td style={s.td}>
                    <button onClick={() => setDetalle(c)} style={s.btnVer}>👁 Ver detalle</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal nueva compra */}
      {modal && (
        <div style={s.modalFondo}>
          <div style={{ ...s.modal, maxWidth: '700px' }}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitulo}>Nueva compra</h2>
              <button onClick={() => setModal(false)} style={s.btnCerrar}>✕</button>
            </div>
            <div style={s.modalBody}>
              <div style={s.campo}>
                <label style={s.label}>Proveedor *</label>
                <select style={s.input} value={form.id_proveedor}
                  onChange={e => setForm({...form, id_proveedor: e.target.value})}>
                  <option value="">Seleccionar proveedor...</option>
                  {proveedores.map(p => <option key={p.id_proveedor} value={p.id_proveedor}>{p.nombre}</option>)}
                </select>
              </div>

              <div style={s.seccion}>
                <p style={s.seccionTitulo}>Agregar productos</p>
                <div style={s.itemFila}>
                  <select style={{ ...s.input, flex: 2 }} value={itemActual.id_variante}
                    onChange={e => setItemActual({...itemActual, id_variante: e.target.value})}>
                    <option value="">Seleccionar variante...</option>
                    {variantes.map(v => (
                      <option key={v.id_variante} value={v.id_variante}>
                        {v.producto} — {v.talla}/{v.color}
                      </option>
                    ))}
                  </select>
                  <input style={{ ...s.input, flex: 1 }} type="number" min="1" placeholder="Cant."
                    value={itemActual.cantidad}
                    onChange={e => setItemActual({...itemActual, cantidad: e.target.value})} />
                  <input style={{ ...s.input, flex: 1 }} type="number" placeholder="Precio costo"
                    value={itemActual.precio_costo}
                    onChange={e => setItemActual({...itemActual, precio_costo: e.target.value})} />
                  <button onClick={agregarItem} style={s.btnAgregar}>+ Agregar</button>
                </div>
              </div>

              {form.items.length > 0 && (
                <div style={s.listaItems}>
                  {form.items.map((item, idx) => (
                    <div key={idx} style={s.itemRow}>
                      <span style={{ flex: 2, fontSize: '0.9rem' }}>{item.nombre}</span>
                      <span style={s.itemDato}>x{item.cantidad}</span>
                      <span style={s.itemDato}>${Number(item.precio_costo).toLocaleString('es-CO')}</span>
                      <span style={{ ...s.itemDato, fontWeight: '700', color: '#c47c5a' }}>
                        ${(item.cantidad * item.precio_costo).toLocaleString('es-CO')}
                      </span>
                      <button onClick={() => quitarItem(idx)} style={s.btnQuitar}>✕</button>
                    </div>
                  ))}
                  <div style={s.totalRow}>
                    <span>Total compra:</span>
                    <strong style={{ color: '#c47c5a' }}>${total.toLocaleString('es-CO')}</strong>
                  </div>
                </div>
              )}

              <div style={s.campo}>
                <label style={s.label}>Observaciones</label>
                <textarea style={s.textarea} value={form.observaciones}
                  onChange={e => setForm({...form, observaciones: e.target.value})}
                  placeholder="Observaciones de la compra..." rows={2} />
              </div>
            </div>
            <div style={s.modalFooter}>
              <button onClick={() => setModal(false)} style={s.btnCancelar}>Cancelar</button>
              <button onClick={guardar} style={s.btnGuardar}>✓ Registrar compra</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal detalle */}
      {detalle && (
        <div style={s.modalFondo}>
          <div style={{ ...s.modal, maxWidth: '500px' }}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitulo}>Compra #{detalle.id_compra}</h2>
              <button onClick={() => setDetalle(null)} style={s.btnCerrar}>✕</button>
            </div>
            <div style={s.modalBody}>
              <div style={s.fila}>
                <div><span style={s.detalleLabel}>Proveedor</span><p style={s.detalleValor}>{detalle.proveedor}</p></div>
                <div><span style={s.detalleLabel}>Fecha</span><p style={s.detalleValor}>{new Date(detalle.fecha).toLocaleDateString('es-CO')}</p></div>
              </div>
              <div style={s.totalRow}>
                <span>Total:</span>
                <strong style={{ color: '#c47c5a' }}>${Number(detalle.total).toLocaleString('es-CO')}</strong>
              </div>
            </div>
            <div style={s.modalFooter}>
              <button onClick={() => setDetalle(null)} style={s.btnCancelar}>Cerrar</button>
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
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  titulo:       { fontSize: '1.8rem', fontWeight: '600', color: '#2a1a12' },
  subtitulo:    { fontSize: '0.95rem', color: '#9e7b65', marginTop: '4px' },
  btnNuevo:     { background: '#c47c5a', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 24px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
  cargando:     { textAlign: 'center', padding: '60px', color: '#9e7b65' },
  tablaWrap:    { background: '#fff', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  tabla:        { width: '100%', borderCollapse: 'collapse' },
  th:           { padding: '14px 16px', textAlign: 'left', fontSize: '0.8rem', color: '#9e7b65', fontWeight: '600', letterSpacing: '0.5px', borderBottom: '1px solid #f0e6de', background: '#fffaf7' },
  tr:           { borderBottom: '0.5px solid #f7f0eb' },
  td:           { padding: '14px 16px', fontSize: '0.95rem', color: '#2a1a12' },
  idBadge:      { background: '#f7e6d8', color: '#c47c5a', padding: '3px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' },
  btnVer:       { background: '#f7e6d8', color: '#c47c5a', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '600' },
  modalFondo:   { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal:        { background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '580px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' },
  modalHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 28px', borderBottom: '1px solid #f0e6de' },
  modalTitulo:  { fontSize: '1.2rem', fontWeight: '600', color: '#2a1a12' },
  btnCerrar:    { background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#9e7b65' },
  modalBody:    { padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '16px' },
  modalFooter:  { display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '20px 28px', borderTop: '1px solid #f0e6de' },
  fila:         { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  campo:        { display: 'flex', flexDirection: 'column', gap: '6px' },
  label:        { fontSize: '0.9rem', fontWeight: '600', color: '#7a5c4a' },
  input:        { padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e8d5c4', fontSize: '0.95rem', outline: 'none', color: '#2a1a12', background: '#fffaf7', boxSizing: 'border-box', width: '100%' },
  textarea:     { padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e8d5c4', fontSize: '0.95rem', outline: 'none', color: '#2a1a12', background: '#fffaf7', resize: 'vertical', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' },
  seccion:      { background: '#fffaf7', borderRadius: '10px', padding: '16px', border: '1px solid #f0e6de' },
  seccionTitulo:{ fontSize: '0.9rem', fontWeight: '600', color: '#7a5c4a', marginBottom: '10px' },
  itemFila:     { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' },
  btnAgregar:   { background: '#c47c5a', color: '#fff', border: 'none', borderRadius: '8px', padding: '11px 16px', fontSize: '0.9rem', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap' },
  listaItems:   { background: '#f5ede6', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' },
  itemRow:      { display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', borderRadius: '8px', padding: '10px 14px' },
  itemDato:     { fontSize: '0.9rem', color: '#2a1a12', minWidth: '80px', textAlign: 'right' },
  btnQuitar:    { background: '#fef0f0', color: '#c45a5a', border: 'none', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', fontSize: '0.85rem' },
  totalRow:     { display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: '1rem', color: '#2a1a12', borderTop: '1px solid #f0e6de', marginTop: '4px' },
  detalleLabel: { fontSize: '0.78rem', color: '#9e7b65', fontWeight: '600', letterSpacing: '0.5px' },
  detalleValor: { fontSize: '0.95rem', color: '#2a1a12', marginTop: '2px', fontWeight: '500' },
  btnCancelar:  { background: '#f5ede6', color: '#7a5c4a', border: 'none', borderRadius: '10px', padding: '11px 24px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
  btnGuardar:   { background: '#c47c5a', color: '#fff', border: 'none', borderRadius: '10px', padding: '11px 28px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
}