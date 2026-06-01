import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const API = 'http://localhost:4000/api'

export default function Dashboard() {
  const { usuario, token } = useAuth()
  const headers = { Authorization: `Bearer ${token}` }

  const [stats,         setStats]         = useState(null)
  const [masVendidos,   setMasVendidos]   = useState([])
  const [ingresos,      setIngresos]      = useState([])
  const [cargando,      setCargando]      = useState(true)

  const cargar = async () => {
    setCargando(true)
    try {
      const [s, mv, ic] = await Promise.all([
        axios.get(`${API}/reportes/dashboard`,         { headers }),
        axios.get(`${API}/reportes/mas-vendidos`,      { headers }),
        axios.get(`${API}/reportes/ingresos-coleccion`,{ headers }),
      ])
      setStats(s.data)
      setMasVendidos(mv.data.slice(0, 5))
      setIngresos(ic.data.slice(0, 3))
    } catch (err) {
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const maxIngresos = Math.max(...ingresos.map(c => Number(c.ingresos_brutos) || 0), 1)

  return (
    <div style={s.pagina}>

      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.titulo}>Dashboard</h1>
          <p style={s.subtitulo}>Bienvenida, {usuario?.nombre} 👋</p>
        </div>
        <div style={s.fecha}>
          {new Date().toLocaleDateString('es-CO', {
            weekday: 'long', year: 'numeric',
            month: 'long', day: 'numeric'
          })}
        </div>
      </div>

      {cargando ? (
        <div style={s.cargando}>Cargando dashboard...</div>
      ) : (
        <>
          {/* Tarjetas */}
          <div style={s.tarjetas}>
            <Tarjeta
              icono="🛍️"
              titulo="Total ventas"
              valor={stats?.ventas_total || 0}
              subtitulo="ventas confirmadas"
              color="#c47c5a"
            />
            <Tarjeta
              icono="💰"
              titulo="Ingresos totales"
              valor={`$${Number(stats?.ingresos_total || 0).toLocaleString('es-CO')}`}
              subtitulo="en ventas confirmadas"
              color="#7b9e87"
            />
            <Tarjeta
              icono="👥"
              titulo="Clientes"
              valor={stats?.clientes || 0}
              subtitulo="clientes activos"
              color="#7a8cb5"
            />
            <Tarjeta
              icono="⚠️"
              titulo="Stock bajo"
              valor={stats?.alertas_stock || 0}
              subtitulo="variantes con ≤ 5 uds"
              color="#c4955a"
            />
          </div>

          {/* Contenido */}
          <div style={s.grid}>

            {/* Productos más vendidos */}
            <div style={s.panel}>
              <div style={s.panelHeader}>
                <h2 style={s.panelTitulo}>🏆 Productos más vendidos</h2>
              </div>
              {masVendidos.length === 0 ? (
                <div style={s.vacio}>Sin ventas registradas aún</div>
              ) : (
                <table style={s.tabla}>
                  <thead>
                    <tr>
                      {['#', 'Producto', 'Unidades', 'Ingresos'].map(h => (
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
                            background: idx === 0 ? '#ffd700' : idx === 1 ? '#e8e8e8' : idx === 2 ? '#f0c090' : '#f5ede6',
                            color: '#2a1a12',
                          }}>
                            {idx + 1}
                          </span>
                        </td>
                        <td style={s.td}>
                          <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{p.nombre}</div>
                          <div style={{ fontSize: '0.78rem', color: '#9e7b65' }}>{p.referencia}</div>
                        </td>
                        <td style={s.td}>
                          <span style={s.unidadesBadge}>{p.unidades_vendidas} uds</span>
                        </td>
                        <td style={s.td}>
                          <strong style={{ color: '#c47c5a' }}>
                            ${Number(p.ingresos_totales || 0).toLocaleString('es-CO')}
                          </strong>
                        </td>
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
              {ingresos.length === 0 ? (
                <div style={s.vacio}>Sin ventas registradas aún</div>
              ) : (
                <div style={s.colecciones}>
                  {ingresos.map((c, idx) => (
                    <div key={idx} style={s.coleccionItem}>
                      <div style={s.coleccionInfo}>
                        <div style={s.coleccionNombre}>{c.coleccion}</div>
                        <div style={s.coleccionSub}>{c.temporada} · {c.anio}</div>
                      </div>
                      <div style={s.barraWrap}>
                        <div style={{
                          ...s.barra,
                          width: `${(Number(c.ingresos_brutos) / maxIngresos) * 100}%`
                        }} />
                      </div>
                      <div style={s.coleccionStats}>
                        <span>🛍️ {c.numero_ventas} ventas</span>
                        <span style={{ color: '#c47c5a', fontWeight: '700' }}>
                          ${Number(c.ingresos_brutos || 0).toLocaleString('es-CO')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </>
      )}
    </div>
  )
}

// Componente tarjeta
function Tarjeta({ icono, titulo, valor, subtitulo, color }) {
  return (
    <div style={s.tarjeta}>
      <div style={{ ...s.tarjetaIcono, background: color + '20', color }}>
        {icono}
      </div>
      <div>
        <div style={s.tarjetaTitulo}>{titulo}</div>
        <div style={{ ...s.tarjetaValor, color }}>{valor}</div>
        <div style={s.tarjetaSub}>{subtitulo}</div>
      </div>
    </div>
  )
}

const s = {
  pagina:          { padding: '36px 40px', height: '100%', overflowY: 'auto', background: '#f5ede6' },
  header:          { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' },
  titulo:          { fontSize: '1.8rem', fontWeight: '600', color: '#2a1a12' },
  subtitulo:       { fontSize: '0.95rem', color: '#9e7b65', marginTop: '4px' },
  fecha:           { fontSize: '0.88rem', color: '#b89a8a', textAlign: 'right', textTransform: 'capitalize' },
  cargando:        { textAlign: 'center', padding: '60px', color: '#9e7b65', fontSize: '1rem' },
  tarjetas:        { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '20px', marginBottom: '24px' },
  tarjeta:         { background: '#fff', borderRadius: '14px', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  tarjetaIcono:    { width: '52px', height: '52px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 },
  tarjetaTitulo:   { fontSize: '0.82rem', color: '#9e7b65', marginBottom: '4px' },
  tarjetaValor:    { fontSize: '1.6rem', fontWeight: '700', lineHeight: 1 },
  tarjetaSub:      { fontSize: '0.75rem', color: '#b89a8a', marginTop: '4px' },
  grid:            { display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' },
  panel:           { background: '#fff', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  panelHeader:     { padding: '18px 24px', borderBottom: '1px solid #f0e6de', background: '#fffaf7' },
  panelTitulo:     { fontSize: '1rem', fontWeight: '600', color: '#2a1a12' },
  vacio:           { padding: '40px', textAlign: 'center', color: '#9e7b65', fontSize: '0.95rem' },
  tabla:           { width: '100%', borderCollapse: 'collapse' },
  th:              { padding: '12px 16px', textAlign: 'left', fontSize: '0.78rem', color: '#9e7b65', fontWeight: '600', letterSpacing: '0.5px', borderBottom: '1px solid #f0e6de', background: '#fffaf7' },
  tr:              { borderBottom: '0.5px solid #f7f0eb' },
  td:              { padding: '12px 16px', fontSize: '0.9rem', color: '#2a1a12' },
  rankBadge:       { width: '26px', height: '26px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', fontWeight: '700' },
  unidadesBadge:   { background: '#f7e6d8', color: '#c47c5a', padding: '3px 10px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: '600' },
  colecciones:     { padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '18px' },
  coleccionItem:   { display: 'flex', flexDirection: 'column', gap: '6px' },
  coleccionInfo:   { display: 'flex', justifyContent: 'space-between' },
  coleccionNombre: { fontSize: '0.9rem', fontWeight: '600', color: '#2a1a12' },
  coleccionSub:    { fontSize: '0.75rem', color: '#9e7b65' },
  barraWrap:       { height: '8px', background: '#f5ede6', borderRadius: '4px', overflow: 'hidden' },
  barra:           { height: '100%', background: '#c47c5a', borderRadius: '4px', transition: 'width 0.5s' },
  coleccionStats:  { display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#7a5c4a' },
}