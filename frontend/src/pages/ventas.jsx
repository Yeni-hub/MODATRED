import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const API = 'http://localhost:4000/api'

const ESTADOS = {
  confirmada:  { label: 'Confirmada',        color: '#2d7a3a', bg: '#e6f4ea', icono: '✅' },
  en_entrega:  { label: 'En proceso entrega', color: '#c4955a', bg: '#fef3e6', icono: '🚚' },
  entregada:   { label: 'Entregada',          color: '#7a8cb5', bg: '#eef0f8', icono: '📦' },
  anulada:     { label: 'Anulada',            color: '#c45a5a', bg: '#fef0f0', icono: '✕' },
}

const METODOS_PAGO = [
  { value: 'efectivo',    label: '💵 Efectivo' },
  { value: 'tarjeta',     label: '💳 Tarjeta' },
  { value: 'credito',     label: '📋 Crédito' },
  { value: 'saldo_favor', label: '🎁 Saldo a favor' },
]

export default function Ventas() {
  const { token } = useAuth()
  const headers   = { Authorization: `Bearer ${token}` }

  const [ventas,        setVentas]        = useState([])
  const [clientes,      setClientes]      = useState([])
  const [variantes,     setVariantes]     = useState([])
  const [cargando,      setCargando]      = useState(true)
  const [modal,         setModal]         = useState(false)
  const [detalle,       setDetalle]       = useState(null)
  const [confirmAnular, setConfirmAnular] = useState(null)
  const [filtroEstado,  setFiltroEstado]  = useState('')
  const [alerta,        setAlerta]        = useState({ visible: false, mensaje: '', tipo: 'exito' })
  const [form, setForm] = useState({
    id_cliente: '', descuento_pct: 0, metodo_pago: 'efectivo', observaciones: '', items: []
  })
  const [itemActual, setItemActual] = useState({ id_variante: '', cantidad: 1, precio_venta: '' })

  const mostrarAlerta = (mensaje, tipo = 'exito') => {
    setAlerta({ visible: true, mensaje, tipo })
    setTimeout(() => setAlerta({ visible: false, mensaje: '', tipo: 'exito' }), 3500)
  }

  const cargar = async () => {
    setCargando(true)
    try {
      const params = {}
      if (filtroEstado) params.estado = filtroEstado
      const [v, c, var_] = await Promise.all([
        axios.get(`${API}/ventas`,    { headers, params }),
        axios.get(`${API}/clientes`,  { headers }),
        axios.get(`${API}/variantes`, { headers }),
      ])
      setVentas(v.data)
      setClientes(c.data.filter(c => c.activo === 1))
      setVariantes(var_.data)
    } catch { } finally { setCargando(false) }
  }

  useEffect(() => { cargar() }, [filtroEstado])

  const clienteSeleccionado = clientes.find(c => c.id_cliente === Number(form.id_cliente))

  const abrirNueva = () => {
    setForm({ id_cliente: '', descuento_pct: 0, metodo_pago: 'efectivo', observaciones: '', items: [] })
    setItemActual({ id_variante: '', cantidad: 1, precio_venta: '' })
    setModal(true)
  }

  const agregarItem = () => {
    if (!itemActual.id_variante || !itemActual.precio_venta) {
      mostrarAlerta('Selecciona una variante y precio', 'error')
      return
    }
    const variante = variantes.find(v => v.id_variante === Number(itemActual.id_variante))
    if (!variante) return
    if (form.items.find(i => i.id_variante === Number(itemActual.id_variante))) {
      mostrarAlerta('Esta variante ya está en la venta', 'error')
      return
    }
    if (Number(itemActual.cantidad) > variante.stock) {
      mostrarAlerta(`Stock insuficiente. Disponible: ${variante.stock} uds`, 'error')
      return
    }
    setForm({
      ...form,
      items: [...form.items, {
        id_variante:  Number(itemActual.id_variante),
        cantidad:     Number(itemActual.cantidad),
        precio_venta: Number(itemActual.precio_venta),
        nombre:       `${variante.producto} — ${variante.talla} / ${variante.color}`,
        stock:        variante.stock,
        costo:        variante.precio_costo,
      }]
    })
    setItemActual({ id_variante: '', cantidad: 1, precio_venta: '' })
  }

  const quitarItem = (idx) => {
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) })
  }

  const totalBruto = form.items.reduce((acc, i) => acc + i.cantidad * i.precio_venta, 0)
  const totalNeto  = totalBruto * (1 - form.descuento_pct / 100)

  const guardar = async () => {
    if (!form.id_cliente) { mostrarAlerta('Selecciona un cliente', 'error'); return }
    if (form.items.length === 0) { mostrarAlerta('Agrega al menos un producto', 'error'); return }
    if (form.descuento_pct > 50) { mostrarAlerta('El descuento no puede superar el 50%', 'error'); return }
    if (form.metodo_pago === 'saldo_favor' && clienteSeleccionado) {
      if (clienteSeleccionado.saldo_favor < totalNeto) {
        mostrarAlerta(`Saldo insuficiente. El cliente tiene $${Number(clienteSeleccionado.saldo_favor).toLocaleString('es-CO')}`, 'error')
        return
      }
    }
    try {
      await axios.post(`${API}/ventas`, {
        id_cliente:    Number(form.id_cliente),
        descuento_pct: Number(form.descuento_pct),
        metodo_pago:   form.metodo_pago,
        observaciones: form.observaciones,
        items: form.items.map(i => ({
          id_variante:  i.id_variante,
          cantidad:     i.cantidad,
          precio_venta: i.precio_venta,
        }))
      }, { headers })
      mostrarAlerta('✅ Venta registrada exitosamente')
      setModal(false)
      cargar()
    } catch (err) {
      mostrarAlerta(err.response?.data?.error || 'Error al registrar venta', 'error')
    }
  }

  const cambiarEstado = async (id, estado) => {
    try {
      await axios.put(`${API}/ventas/${id}/estado`, { estado }, { headers })
      mostrarAlerta(`Estado actualizado: ${ESTADOS[estado].label}`)
      if (detalle) {
        const { data } = await axios.get(`${API}/ventas/${id}`, { headers })
        setDetalle(data)
      }
      cargar()
    } catch (err) {
      mostrarAlerta(err.response?.data?.error || 'Error al cambiar estado', 'error')
    }
  }

  const anular = async (id) => {
    try {
      await axios.put(`${API}/ventas/${id}/anular`, {}, { headers })
      mostrarAlerta('Venta anulada y stock restaurado')
      setConfirmAnular(null)
      setDetalle(null)
      cargar()
    } catch (err) {
      mostrarAlerta(err.response?.data?.error || 'Error al anular venta', 'error')
    }
  }

  const verDetalle = async (id) => {
    try {
      const { data } = await axios.get(`${API}/ventas/${id}`, { headers })
      setDetalle(data)
    } catch { mostrarAlerta('Error al cargar detalle', 'error') }
  }

  // Contadores por estado
  const contadores = Object.keys(ESTADOS).reduce((acc, e) => {
    acc[e] = ventas.filter(v => v.estado === e).length
    return acc
  }, {})

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
          <h1 style={s.titulo}>Ventas</h1>
          <p style={s.subtitulo}>Registro y seguimiento de pedidos</p>
        </div>
        <button onClick={abrirNueva} style={s.btnNuevo}>+ Nueva venta</button>
      </div>

      {/* Tarjetas de estado */}
      <div style={s.estadoCards}>
        {Object.entries(ESTADOS).map(([key, val]) => (
          <button
            key={key}
            onClick={() => setFiltroEstado(filtroEstado === key ? '' : key)}
            style={{
              ...s.estadoCard,
              border: filtroEstado === key ? `2px solid ${val.color}` : '2px solid transparent',
              background: filtroEstado === key ? val.bg : '#fff',
            }}
          >
            <span style={s.estadoCardIcono}>{val.icono}</span>
            <div>
              <div style={{ ...s.estadoCardNum, color: val.color }}>{contadores[key]}</div>
              <div style={s.estadoCardLabel}>{val.label}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Tabla */}
      {cargando ? <div style={s.cargando}>Cargando...</div> : (
        <div style={s.tablaWrap}>
          <table style={s.tabla}>
            <thead>
              <tr>
                {['#', 'Fecha', 'Cliente', 'Método pago', 'Descuento', 'Total neto', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ventas.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#9e7b65' }}>
                  No hay ventas {filtroEstado ? `con estado "${ESTADOS[filtroEstado]?.label}"` : 'registradas'}
                </td></tr>
              ) : ventas.map(v => (
                <tr key={v.id_venta} style={s.tr}>
                  <td style={s.td}><span style={s.idBadge}>#{v.id_venta}</span></td>
                  <td style={s.td}>{new Date(v.fecha).toLocaleDateString('es-CO')}</td>
                  <td style={s.td}>
                    <strong>{v.cliente}</strong>
                    <div style={s.docTexto}>{v.documento}</div>
                  </td>
                  <td style={s.td}>
                    <span style={s.metodoBadge}>
                      {METODOS_PAGO.find(m => m.value === v.metodo_pago)?.label || v.metodo_pago}
                    </span>
                  </td>
                  <td style={s.td}>{v.descuento_pct}%</td>
                  <td style={s.td}><strong>${Number(v.total_neto).toLocaleString('es-CO')}</strong></td>
                  <td style={s.td}>
                    <span style={{
                      ...s.estadoBadge,
                      background: ESTADOS[v.estado]?.bg || '#f5ede6',
                      color:      ESTADOS[v.estado]?.color || '#9e7b65',
                    }}>
                      {ESTADOS[v.estado]?.icono} {ESTADOS[v.estado]?.label || v.estado}
                    </span>
                  </td>
                  <td style={s.td}>
                    <div style={s.acciones}>
                      <button onClick={() => verDetalle(v.id_venta)} style={s.btnVer}>👁 Ver</button>
                      {v.estado !== 'anulada' && v.estado !== 'entregada' && (
                        <button onClick={() => setConfirmAnular(v)} style={s.btnAnular}>✕</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal nueva venta */}
      {modal && (
        <div style={s.modalFondo}>
          <div style={{ ...s.modal, maxWidth: '720px' }}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitulo}>Nueva venta</h2>
              <button onClick={() => setModal(false)} style={s.btnCerrar}>✕</button>
            </div>
            <div style={s.modalBody}>

              {/* Cliente y pago */}
              <div style={s.fila}>
                <div style={s.campo}>
                  <label style={s.label}>Cliente *</label>
                  <select style={s.input} value={form.id_cliente}
                    onChange={e => setForm({...form, id_cliente: e.target.value})}>
                    <option value="">Seleccionar cliente...</option>
                    {clientes.map(c => (
                      <option key={c.id_cliente} value={c.id_cliente}>
                        {c.nombre} {c.saldo_favor > 0 ? `(Saldo: $${Number(c.saldo_favor).toLocaleString('es-CO')})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={s.campo}>
                  <label style={s.label}>Método de pago</label>
                  <select style={s.input} value={form.metodo_pago}
                    onChange={e => setForm({...form, metodo_pago: e.target.value})}>
                    {METODOS_PAGO.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
                <div style={s.campo}>
                  <label style={s.label}>Descuento % (máx. 50%)</label>
                  <input style={s.input} type="number" min="0" max="50"
                    value={form.descuento_pct}
                    onChange={e => setForm({...form, descuento_pct: e.target.value})} />
                </div>
              </div>

              {/* Saldo disponible */}
              {form.metodo_pago === 'saldo_favor' && clienteSeleccionado && (
                <div style={s.saldoInfo}>
                  🎁 Saldo disponible del cliente:
                  <strong style={{ color: '#2d7a3a', marginLeft: '8px' }}>
                    ${Number(clienteSeleccionado.saldo_favor).toLocaleString('es-CO')}
                  </strong>
                </div>
              )}

              {/* Agregar productos */}
              <div style={s.seccion}>
                <p style={s.seccionTitulo}>Agregar productos</p>
                <div style={s.itemFila}>
                  <select style={{ ...s.input, flex: 2 }} value={itemActual.id_variante}
                    onChange={e => setItemActual({...itemActual, id_variante: e.target.value})}>
                    <option value="">Seleccionar variante...</option>
                    {variantes.map(v => (
                      <option key={v.id_variante} value={v.id_variante}>
                        {v.producto} — {v.talla}/{v.color} (Stock: {v.stock})
                      </option>
                    ))}
                  </select>
                  <input style={{ ...s.input, flex: '0 0 80px' }} type="number" min="1"
                    placeholder="Cant."
                    value={itemActual.cantidad}
                    onChange={e => setItemActual({...itemActual, cantidad: e.target.value})} />
                  <input style={{ ...s.input, flex: 1 }} type="number"
                    placeholder="Precio venta"
                    value={itemActual.precio_venta}
                    onChange={e => setItemActual({...itemActual, precio_venta: e.target.value})} />
                  <button onClick={agregarItem} style={s.btnAgregar}>+ Agregar</button>
                </div>
              </div>

              {/* Lista items */}
              {form.items.length > 0 && (
                <div style={s.listaItems}>
                  {form.items.map((item, idx) => (
                    <div key={idx} style={s.itemRow}>
                      <span style={{ flex: 2, fontSize: '0.9rem' }}>{item.nombre}</span>
                      <span style={s.itemDato}>x{item.cantidad}</span>
                      <span style={s.itemDato}>${Number(item.precio_venta).toLocaleString('es-CO')}</span>
                      <span style={{ ...s.itemDato, fontWeight: '700', color: '#c47c5a' }}>
                        ${(item.cantidad * item.precio_venta).toLocaleString('es-CO')}
                      </span>
                      <button onClick={() => quitarItem(idx)} style={s.btnQuitar}>✕</button>
                    </div>
                  ))}
                  <div style={s.totalRow}>
                    <span>Total bruto:</span>
                    <strong>${totalBruto.toLocaleString('es-CO')}</strong>
                  </div>
                  <div style={{ ...s.totalRow, color: '#c47c5a', fontSize: '1.05rem' }}>
                    <span>Total neto ({form.descuento_pct}% desc):</span>
                    <strong>${Math.round(totalNeto).toLocaleString('es-CO')}</strong>
                  </div>
                </div>
              )}

              <div style={s.campo}>
                <label style={s.label}>Observaciones</label>
                <textarea style={s.textarea} value={form.observaciones}
                  onChange={e => setForm({...form, observaciones: e.target.value})}
                  placeholder="Observaciones de la venta..." rows={2} />
              </div>
            </div>
            <div style={s.modalFooter}>
              <button onClick={() => setModal(false)} style={s.btnCancelar}>Cancelar</button>
              <button onClick={guardar} style={s.btnGuardar}>✓ Registrar venta</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal detalle */}
      {detalle && (
        <div style={s.modalFondo}>
          <div style={{ ...s.modal, maxWidth: '660px' }}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitulo}>Pedido #{detalle.id_venta}</h2>
              <button onClick={() => setDetalle(null)} style={s.btnCerrar}>✕</button>
            </div>
            <div style={s.modalBody}>

              {/* Info */}
              <div style={s.fila3}>
                <div><span style={s.detalleLabel}>Cliente</span><p style={s.detalleValor}>{detalle.cliente}</p></div>
                <div><span style={s.detalleLabel}>Vendedor</span><p style={s.detalleValor}>{detalle.vendedor}</p></div>
                <div><span style={s.detalleLabel}>Fecha</span><p style={s.detalleValor}>{new Date(detalle.fecha).toLocaleDateString('es-CO')}</p></div>
                <div><span style={s.detalleLabel}>Método pago</span><p style={s.detalleValor}>{METODOS_PAGO.find(m => m.value === detalle.metodo_pago)?.label}</p></div>
                <div><span style={s.detalleLabel}>Descuento</span><p style={s.detalleValor}>{detalle.descuento_pct}%</p></div>
                <div><span style={s.detalleLabel}>Total neto</span><p style={{ ...s.detalleValor, color: '#c47c5a', fontWeight: '700' }}>${Number(detalle.total_neto).toLocaleString('es-CO')}</p></div>
              </div>

              {/* Estado actual y cambio */}
              {detalle.estado !== 'anulada' && (
                <div style={s.estadoSection}>
                  <p style={s.label}>Estado del pedido</p>
                  <div style={s.estadoBotones}>
                    {Object.entries(ESTADOS).filter(([k]) => k !== 'anulada').map(([key, val]) => (
                      <button
                        key={key}
                        onClick={() => cambiarEstado(detalle.id_venta, key)}
                        style={{
                          ...s.estadoBtn,
                          background: detalle.estado === key ? val.bg : '#f5ede6',
                          color:      detalle.estado === key ? val.color : '#9e7b65',
                          border:     detalle.estado === key ? `1.5px solid ${val.color}` : '1.5px solid transparent',
                          fontWeight: detalle.estado === key ? '700' : '400',
                        }}
                      >
                        {val.icono} {val.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Productos */}
              <table style={s.tabla}>
                <thead>
                  <tr>
                    {['Producto', 'Talla', 'Color', 'Cant.', 'Precio', 'Subtotal'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {detalle.detalle?.map((d, i) => (
                    <tr key={i} style={s.tr}>
                      <td style={s.td}>{d.producto}</td>
                      <td style={s.td}>{d.talla}</td>
                      <td style={s.td}>{d.color}</td>
                      <td style={s.td}>{d.cantidad}</td>
                      <td style={s.td}>${Number(d.precio_venta).toLocaleString('es-CO')}</td>
                      <td style={s.td}><strong>${Number(d.subtotal).toLocaleString('es-CO')}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>

            </div>
            <div style={s.modalFooter}>
              {detalle.estado !== 'anulada' && (
                <button onClick={() => { setConfirmAnular({ id_venta: detalle.id_venta, cliente: detalle.cliente }); setDetalle(null) }}
                  style={{ ...s.btnCancelar, color: '#c45a5a' }}>
                  ✕ Anular pedido
                </button>
              )}
              <button onClick={() => setDetalle(null)} style={s.btnGuardar}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmar anular */}
      {confirmAnular && (
        <div style={s.modalFondo}>
          <div style={{ ...s.modal, maxWidth: '420px' }}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitulo}>¿Anular venta?</h2>
              <button onClick={() => setConfirmAnular(null)} style={s.btnCerrar}>✕</button>
            </div>
            <div style={s.modalBody}>
              <p style={{ color: '#7a5c4a', fontSize: '1rem' }}>
                ¿Anular la venta <strong>#{confirmAnular.id_venta}</strong> de <strong>{confirmAnular.cliente}</strong>?
                El stock será restaurado automáticamente.
              </p>
            </div>
            <div style={s.modalFooter}>
              <button onClick={() => setConfirmAnular(null)} style={s.btnCancelar}>Cancelar</button>
              <button onClick={() => anular(confirmAnular.id_venta)}
                style={{ ...s.btnGuardar, background: '#c45a5a' }}>
                ✕ Sí, anular
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
  estadoCards:   { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '24px' },
  estadoCard:    { display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' },
  estadoCardIcono:{ fontSize: '1.4rem' },
  estadoCardNum: { fontSize: '1.6rem', fontWeight: '700', lineHeight: 1 },
  estadoCardLabel:{ fontSize: '0.78rem', color: '#9e7b65', marginTop: '2px' },
  cargando:      { textAlign: 'center', padding: '60px', color: '#9e7b65' },
  tablaWrap:     { background: '#fff', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  tabla:         { width: '100%', borderCollapse: 'collapse' },
  th:            { padding: '14px 16px', textAlign: 'left', fontSize: '0.8rem', color: '#9e7b65', fontWeight: '600', letterSpacing: '0.5px', borderBottom: '1px solid #f0e6de', background: '#fffaf7' },
  tr:            { borderBottom: '0.5px solid #f7f0eb' },
  td:            { padding: '12px 16px', fontSize: '0.92rem', color: '#2a1a12' },
  idBadge:       { background: '#f7e6d8', color: '#c47c5a', padding: '3px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' },
  docTexto:      { fontSize: '0.78rem', color: '#9e7b65', marginTop: '2px' },
  metodoBadge:   { background: '#f5ede6', color: '#7a5c4a', padding: '3px 10px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: '600' },
  estadoBadge:   { padding: '4px 12px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: '600' },
  acciones:      { display: 'flex', gap: '6px' },
  btnVer:        { background: '#f7e6d8', color: '#c47c5a', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '600' },
  btnAnular:     { background: '#fef0f0', color: '#c45a5a', border: 'none', borderRadius: '8px', padding: '6px 10px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '600' },
  modalFondo:    { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal:         { background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '580px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '92vh', overflowY: 'auto' },
  modalHeader:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 28px', borderBottom: '1px solid #f0e6de' },
  modalTitulo:   { fontSize: '1.2rem', fontWeight: '600', color: '#2a1a12' },
  btnCerrar:     { background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#9e7b65' },
  modalBody:     { padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '16px' },
  modalFooter:   { display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '20px 28px', borderTop: '1px solid #f0e6de' },
  fila:          { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' },
  fila3:         { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' },
  campo:         { display: 'flex', flexDirection: 'column', gap: '6px' },
  label:         { fontSize: '0.9rem', fontWeight: '600', color: '#7a5c4a' },
  input:         { padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e8d5c4', fontSize: '0.95rem', outline: 'none', color: '#2a1a12', background: '#fffaf7', boxSizing: 'border-box', width: '100%' },
  textarea:      { padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e8d5c4', fontSize: '0.95rem', outline: 'none', color: '#2a1a12', background: '#fffaf7', resize: 'vertical', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' },
  saldoInfo:     { background: '#e6f4ea', border: '1px solid #b7dfbe', borderRadius: '10px', padding: '12px 16px', fontSize: '0.9rem', color: '#2d7a3a' },
  seccion:       { background: '#fffaf7', borderRadius: '10px', padding: '16px', border: '1px solid #f0e6de' },
  seccionTitulo: { fontSize: '0.9rem', fontWeight: '600', color: '#7a5c4a', marginBottom: '10px' },
  itemFila:      { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' },
  btnAgregar:    { background: '#c47c5a', color: '#fff', border: 'none', borderRadius: '8px', padding: '11px 16px', fontSize: '0.9rem', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap' },
  listaItems:    { background: '#f5ede6', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' },
  itemRow:       { display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', borderRadius: '8px', padding: '10px 14px' },
  itemDato:      { fontSize: '0.9rem', color: '#2a1a12', minWidth: '80px', textAlign: 'right' },
  btnQuitar:     { background: '#fef0f0', color: '#c45a5a', border: 'none', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', fontSize: '0.85rem' },
  totalRow:      { display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '0.95rem', color: '#2a1a12', borderTop: '1px solid #f0e6de', marginTop: '4px' },
  estadoSection: { background: '#fffaf7', borderRadius: '10px', padding: '16px', border: '1px solid #f0e6de' },
  estadoBotones: { display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' },
  estadoBtn:     { padding: '8px 16px', borderRadius: '20px', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s', fontWeight: '500' },
  detalleLabel:  { fontSize: '0.75rem', color: '#9e7b65', fontWeight: '600', letterSpacing: '0.5px' },
  detalleValor:  { fontSize: '0.92rem', color: '#2a1a12', marginTop: '2px', fontWeight: '500' },
  btnCancelar:   { background: '#f5ede6', color: '#7a5c4a', border: 'none', borderRadius: '10px', padding: '11px 24px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
  btnGuardar:    { background: '#c47c5a', color: '#fff', border: 'none', borderRadius: '10px', padding: '11px 28px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
}