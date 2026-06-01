import { useAuth } from '../../context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'

export default function Layout({ children }) {
  const { usuario, logout } = useAuth()
  const navigate            = useNavigate()
  const location            = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menuItems = [
    { icono: '📊', texto: 'Dashboard',   ruta: '/dashboard' },
    { icono: '👗', texto: 'Productos',   ruta: '/productos' },
    { icono: '✨', texto: 'Colecciones', ruta: '/colecciones' },
    { icono: '🏷️', texto: 'Variantes',   ruta: '/variantes' },
    { icono: '🏪', texto: 'Proveedores', ruta: '/proveedores' },
    { icono: '📦', texto: 'Compras',     ruta: '/compras' },
    { icono: '👥', texto: 'Clientes',    ruta: '/clientes' },
    { icono: '🛍️', texto: 'Ventas',      ruta: '/ventas' },
    { icono: '📈', texto: 'Reportes',    ruta: '/reportes' },
    { icono: '👤', texto: 'Usuarios',    ruta: '/usuarios' },
  ]

  return (
    <div style={s.pagina}>
      {/* Sidebar */}
      <aside style={s.sidebar}>
        <div style={s.logoWrap}>
          <div style={s.logoIcono}>
            <svg width="28" height="28" viewBox="0 0 50 50" fill="none">
              <path d="M25 4 L46 25 L25 46 L4 25 Z" stroke="#fff" strokeWidth="1.5"/>
              <path d="M25 12 L38 25 L25 38 L12 25 Z" fill="rgba(255,255,255,0.3)"/>
              <path d="M25 20 L32 25 L25 32 L18 25 Z" fill="#fff"/>
            </svg>
          </div>
          <div>
            <div style={s.logoNombre}>ModaTrend</div>
            <div style={s.logoSub}>Panel de administración</div>
          </div>
        </div>

        <div style={s.divisor} />

        <nav style={s.nav}>
          <p style={s.menuTitulo}>MENÚ PRINCIPAL</p>
          {menuItems.slice(0, 6).map(item => (
            <button
              key={item.ruta}
              onClick={() => navigate(item.ruta)}
              style={{
                ...s.menuItem,
                background: location.pathname === item.ruta ? 'rgba(255,255,255,0.15)' : 'transparent',
                fontWeight: location.pathname === item.ruta ? '600' : '400',
                color:      location.pathname === item.ruta ? '#fff' : 'rgba(255,255,255,0.75)',
              }}
            >
              <span style={s.menuIcono}>{item.icono}</span>
              <span>{item.texto}</span>
            </button>
          ))}

          <p style={{ ...s.menuTitulo, marginTop: '20px' }}>CLIENTES</p>
          {menuItems.slice(6, 8).map(item => (
            <button
              key={item.ruta}
              onClick={() => navigate(item.ruta)}
              style={{
                ...s.menuItem,
                background: location.pathname === item.ruta ? 'rgba(255,255,255,0.15)' : 'transparent',
                fontWeight: location.pathname === item.ruta ? '600' : '400',
                color:      location.pathname === item.ruta ? '#fff' : 'rgba(255,255,255,0.75)',
              }}
            >
              <span style={s.menuIcono}>{item.icono}</span>
              <span>{item.texto}</span>
            </button>
          ))}

          <p style={{ ...s.menuTitulo, marginTop: '20px' }}>SISTEMA</p>
          {menuItems.slice(8).map(item => (
            <button
              key={item.ruta}
              onClick={() => navigate(item.ruta)}
              style={{
                ...s.menuItem,
                background: location.pathname === item.ruta ? 'rgba(255,255,255,0.15)' : 'transparent',
                fontWeight: location.pathname === item.ruta ? '600' : '400',
                color:      location.pathname === item.ruta ? '#fff' : 'rgba(255,255,255,0.75)',
              }}
            >
              <span style={s.menuIcono}>{item.icono}</span>
              <span>{item.texto}</span>
            </button>
          ))}
        </nav>

        {/* Usuario */}
        <div style={s.usuarioWrap}>
          <div style={s.usuarioAvatar}>
            {usuario?.nombre?.charAt(0).toUpperCase()}
          </div>
          <div style={s.usuarioInfo}>
            <div style={s.usuarioNombre}>{usuario?.nombre}</div>
            <div style={s.usuarioRol}>{usuario?.rol}</div>
          </div>
          <button onClick={handleLogout} style={s.btnLogout} title="Cerrar sesión">🚪</button>
        </div>
      </aside>

      {/* Contenido */}
      <main style={s.main}>
        {children}
      </main>
    </div>
  )
}

const s = {
  pagina:        { display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' },
  sidebar:       { width: '260px', minWidth: '260px', background: '#2a1a12', display: 'flex', flexDirection: 'column', padding: '24px 16px', overflowY: 'auto' },
  logoWrap:      { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' },
  logoIcono:     { width: '44px', height: '44px', background: '#c47c5a', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  logoNombre:    { fontSize: '1.1rem', fontWeight: '600', color: '#fff', letterSpacing: '1.5px', fontFamily: 'Georgia, serif' },
  logoSub:       { fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' },
  divisor:       { height: '1px', background: 'rgba(255,255,255,0.1)', margin: '16px 0' },
  nav:           { flex: '1', display: 'flex', flexDirection: 'column', gap: '2px' },
  menuTitulo:    { fontSize: '9px', color: 'rgba(255,255,255,0.35)', letterSpacing: '1.5px', marginBottom: '6px', marginTop: '4px', paddingLeft: '10px' },
  menuItem:      { display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 10px', borderRadius: '8px', border: 'none', fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s' },
  menuIcono:     { fontSize: '1rem', width: '22px' },
  usuarioWrap:   { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', padding: '12px 10px', background: 'rgba(255,255,255,0.08)', borderRadius: '10px' },
  usuarioAvatar: { width: '34px', height: '34px', borderRadius: '50%', background: '#c47c5a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '0.9rem', flexShrink: 0 },
  usuarioInfo:   { flex: 1 },
  usuarioNombre: { fontSize: '0.85rem', fontWeight: '600', color: '#fff' },
  usuarioRol:    { fontSize: '10px', color: 'rgba(255,255,255,0.45)', marginTop: '1px' },
  btnLogout:     { background: 'none', border: 'none', fontSize: '1rem', cursor: 'pointer', padding: '4px' },
  main:          { flex: '1', overflowY: 'auto', background: '#f5ede6' },
}