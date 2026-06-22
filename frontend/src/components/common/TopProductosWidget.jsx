import { useState, useEffect } from 'react'
import api from '../../services/api'

export default function TopProductosWidget({ data, maxItems, styles, rankStyle, onFetch }) {
  const [internos, setInternos] = useState(null)
  const [cargando, setCargando] = useState(!data)

  useEffect(() => {
    if (data) {
      setInternos(data)
      setCargando(false)
      return
    }
    setCargando(true)
    api.get('/reportes/mas-vendidos')
      .then(res => { setInternos(res.data); onFetch?.(res.data) })
      .catch(() => setInternos([]))
      .finally(() => setCargando(false))
  }, [data])

  const items = internos && maxItems ? internos.slice(0, maxItems) : internos

  if (cargando) return <div style={styles?.empty || emptyStyle}>Cargando...</div>
  if (!items || items.length === 0) return <div style={styles?.empty || emptyStyle}>Sin ventas registradas aún</div>

  return (
    <table>
      <thead>
        <tr>
          {['#', 'PRODUCTO', 'CATEGORÍA', 'UNID.', 'INGRESOS'].map(h => (
            <th key={h} style={styles.th}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.map((p, idx) => (
          <tr key={idx} style={styles.tr}>
            <td style={styles.td}>
              <span style={{
                ...styles.rankNum,
                ...(rankStyle ? rankStyle(idx) : {})
              }}>
                {String(idx + 1).padStart(2, '0')}
              </span>
            </td>
            <td style={styles.td}>
              <div style={styles.prodNombre || { color: '#e2e8f0', fontWeight: '500', fontSize: '12px' }}>{p.nombre}</div>
              <div style={styles.prodRef || { color: '#334155', fontSize: '10px', marginTop: '1px' }}>{p.referencia}</div>
            </td>
            <td style={styles.td}>
              <span style={styles.catBadge || { background: '#FDF2F5', color: '#F78DA7', padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '500' }}>{p.categoria}</span>
            </td>
            <td style={styles.td}>
              <span style={styles.unidBadge || { background: '#10b98120', color: '#10b981', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>{p.unidades_vendidas}</span>
            </td>
            <td style={styles.td}>
              <span style={styles.ingresosVal || { color: '#f1f5f9', fontWeight: '600', fontSize: '12px' }}>
                ${Number(p.ingresos_totales || 0).toLocaleString('es-CO')}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const emptyStyle = { padding: '40px', textAlign: 'center', color: '#334155', fontSize: '12px' }
