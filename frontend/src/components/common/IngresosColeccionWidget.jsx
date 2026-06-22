import { useState, useEffect } from 'react'
import api from '../../services/api'

export default function IngresosColeccionWidget({ data, maxItems, styles, onFetch, barColors }) {
  const [internos, setInternos] = useState(null)
  const [cargando, setCargando] = useState(!data)

  useEffect(() => {
    if (data) {
      setInternos(data)
      setCargando(false)
      return
    }
    setCargando(true)
    api.get('/reportes/ingresos-coleccion')
      .then(res => { setInternos(res.data); onFetch?.(res.data) })
      .catch(() => setInternos([]))
      .finally(() => setCargando(false))
  }, [data])

  const items = internos && maxItems ? internos.slice(0, maxItems) : internos
  const maxIngreso = Math.max(...(items || []).map(c => Number(c.ingresos_brutos) || 0), 1)

  if (cargando) return <div style={styles?.empty || emptyStyle}>Cargando...</div>
  if (!items || items.length === 0) return <div style={styles?.empty || emptyStyle}>Sin datos aún</div>

  return items.map((c, idx) => (
    <div key={idx} style={styles.colItem}>
      <div style={styles.colTop}>
        <div>
          <div style={styles.colNombre}>{c.coleccion}</div>
          <div style={styles.colSub}>{c.temporada} · {c.anio}</div>
        </div>
        <span style={styles.colVal}>
          ${Number(c.ingresos_brutos || 0).toLocaleString('es-CO')}
        </span>
      </div>
      <div style={styles.barTrack}>
        <div style={{
          ...styles.barFill,
          ...(barColors ? { background: barColors[idx % barColors.length] } : {}),
          width: `${(Number(c.ingresos_brutos) / maxIngreso) * 100}%`
        }} />
      </div>
      <div style={styles.colStats}>
        <span>{c.numero_ventas} ventas</span>
        <span>{c.unidades_vendidas} unidades</span>
      </div>
    </div>
  ))
}

const emptyStyle = { padding: '40px', textAlign: 'center', color: '#334155', fontSize: '12px' }
