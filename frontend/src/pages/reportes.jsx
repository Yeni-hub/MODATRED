import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const API = 'http://localhost:4000/api'

export default function Reportes() {
  const { token } = useAuth()
  const headers   = { Authorization: `Bearer ${token}` }

  const [masVendidos,      setMasVendidos]      = useState([])
  const [ingresosColeccion,setIngresosColeccion]= useState([])
  const [cargando,         setCargando]         = useState(true)

  const cargar = async () => {
    setCargando(true)
    try {
      const [mv, ic] = await Promise.all([
        axios.get(`${API}/reportes/mas-vendidos`,     { headers }),
        axios.get(`${API}/reportes/ingresos-coleccion`, { headers }),
      ])
      setMasVendidos(mv.data)
      setIngresosColeccion(ic.data)
    } catch { } finally { setCargando(false) }
  }

  useEffect(() => { cargar() }, [])

  const maxIngresos = Math.max(...ingresosColeccion.map(c => c.ingresos_brutos || 0), 1)

  return (
    <div style={s.pagina}>
      <div style={s.header}>
        <div>
          <h1 style={s.titulo}>Reportes</h1>
          <p style={s.subtitulo}>Análisis de ventas e ingresos de ModaTrend</p>
        </div>
        <button onClick={cargar} style={s.btnRefresh}>🔄 Actualizar</button>
      </div>

      {cargando ? <div style={s.cargando}>Cargando reportes...</div> : (
        <div style={s.grid}>

          {/* Productos más vendidos */}
          <div style={s.panel}>
            <div style={s.panelHeader}>
              <h2 style={s.panelTitulo}>🏆 Productos más vendidos</h2>
            </div>
            {masVendidos.length === 0 ? (
              <div style={s.vacio}>Sin datos de ventas aún</div>
            ) : (
              <table style={s.tabla}>
                <thead>
                  <tr>
                    {['#','Producto','Categoría','Unidades','Ingresos'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {masVendidos.map((p, idx) => (
                    <tr key={idx} style={s.tr}>
                      <td style={s.td}>
                        <span style={{
                          ...s.rankBadge,
                          background: idx === 0 ? '#ffd700' : idx === 1 ? '#c0c0c0' : idx === 2 ? '#cd7f32' : '#f5ede6',
                          color:      idx < 3 ? '#2a1a12' : '#9e7b65',
                        }}>
                          {idx + 1}
                        </span>
                      </td>
                      <td style={s.td}>
                        <div style={{ fontWeight: '600' }}>{p.nombre}</div>
                        <div style={{ fontSize: '0.8rem', color: '#9e7b65' }}>{p.referencia}</div>
                      </td>
                      <td style={s.td}>{p.categoria}</td>
                      <td style={s.td}><span style={s.unidadesBadge}>{p.unidades_vendidas} uds</span></td>
                      <td style={s.td}><strong style={{ color: '#c47c5a' }}>${Number(p.ingresos_totales || 0).toLocaleString('es-CO')}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Ingresos por colección */}
          <div style={s.panel}>
            <div style={s.panelHeader}>
              <h2 style={s.panelTitulo}>✨ Ingresos por colección</h2>
            </div>
            {ingresosColeccion.length === 0 ? (
              <div style={s.vacio}>Sin datos de ventas aún</div>
            ) : (
              <div style={s.colecciones}>
                {ingresosColeccion.map((c, idx) => (
                  <div key={idx} style={s.coleccionItem}>
                    <div style={s.coleccionInfo}>
                      <div style={s.coleccionNombre}>{c.coleccion}</div>
                      <div style={s.coleccionSub}>{c.temporada} · {c.anio}</div>
                    </div>
                    <div style={s.coleccionDatos}>
                      <div style={s.barraWrap}>
                        <div style={{
                          ...s.barra,
                          width: `${(c.ingresos_brutos / maxIngresos) * 100}%`
                        }} />
                      </div>
                      <div style={s.coleccionStats}>
                        <span style={s.statItem}>🛍️ {c.numero_ventas} ventas</span>
                        <span style={s.statItem}>📦 {c.unidades_vendidas} uds</span>
                        <span style={{ ...s.statItem, color: '#c47c5a', fontWeight: '700' }}>
                          ${Number(c.ingresos_brutos || 0).toLocaleString('es-CO')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  )
}

const s = {
  pagina:          { padding: '36px 40px', height: '100%', overflowY: 'auto', background: '#f5ede6' },
  header:          { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' },
  titulo:          { fontSize: '1.8rem', fontWeight: '600', color: '#2a1a12' },
  subtitulo:       { fontSize: '0.95rem', color: '#9e7b65', marginTop: '4px' },
  btnRefresh:      { background: '#f7e6d8', color: '#c47c5a', border: 'none', borderRadius: '10px', padding: '12px 20px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
  cargando:        { textAlign: 'center', padding: '60px', color: '#9e7b65' },
  grid:            { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
  panel:           { background: '#fff', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  panelHeader:     { padding: '20px 24px', borderBottom: '1px solid #f0e6de', background: '#fffaf7' },
  panelTitulo:     { fontSize: '1.1rem', fontWeight: '600', color: '#2a1a12' },
  vacio:           { padding: '40px', textAlign: 'center', color: '#9e7b65' },
  tabla:           { width: '100%', borderCollapse: 'collapse' },
  th:              { padding: '12px 16px', textAlign: 'left', fontSize: '0.78rem', color: '#9e7b65', fontWeight: '600', letterSpacing: '0.5px', borderBottom: '1px solid #f0e6de', background: '#fffaf7' },
  tr:              { borderBottom: '0.5px solid #f7f0eb' },
  td:              { padding: '12px 16px', fontSize: '0.9rem', color: '#2a1a12' },
  rankBadge:       { width: '28px', height: '28px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: '700' },
  unidadesBadge:   { background: '#f7e6d8', color: '#c47c5a', padding: '3px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' },
  colecciones:     { padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' },
  coleccionItem:   { display: 'flex', flexDirection: 'column', gap: '8px' },
  coleccionInfo:   { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' },
  coleccionNombre: { fontSize: '0.95rem', fontWeight: '600', color: '#2a1a12' },
  coleccionSub:    { fontSize: '0.78rem', color: '#9e7b65' },
  coleccionDatos:  { display: 'flex', flexDirection: 'column', gap: '6px' },
  barraWrap:       { height: '8px', background: '#f5ede6', borderRadius: '4px', overflow: 'hidden' },
  barra:           { height: '100%', background: '#c47c5a', borderRadius: '4px', transition: 'width 0.5s' },
  coleccionStats:  { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  statItem:        { fontSize: '0.82rem', color: '#7a5c4a' },
}