import { useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import tokens from '../../styles/tokens'

const { colors, spacing, radius, typography, transitions } = tokens
const t = colors.warm
const a = colors.accent

const MENU = [
  { seccion: 'PRINCIPAL', items: [
    { icono: '⊞', texto: 'Dashboard',    ruta: '/dashboard', color: a.rose },
    { icono: '◈', texto: 'Productos',    ruta: '/productos', color: a.rose },
    { icono: '❖', texto: 'Colecciones',  ruta: '/colecciones', color: a.lilac },
    { icono: '◇', texto: 'Variantes',    ruta: '/variantes', color: a.blue },
    { icono: '▣', texto: 'Categorías',   ruta: '/categorias', color: a.mint },
  ]},
  { seccion: 'OPERACIONES', items: [
    { icono: '↑', texto: 'Proveedores',  ruta: '/proveedores', color: a.blue },
    { icono: '⊕', texto: 'Compras',      ruta: '/compras', color: a.rose },
    { icono: '◉', texto: 'Clientes',     ruta: '/clientes', color: a.mint },
    { icono: '⊙', texto: 'Ventas',       ruta: '/ventas', color: a.rose },
  ]},
  { seccion: 'SISTEMA', items: [
    { icono: '▣', texto: 'Reportes',     ruta: '/reportes', color: a.lilac },
    { icono: '◎', texto: 'Usuarios',     ruta: '/usuarios', color: a.blue },
  ]},
]

const moduleColors = {
  '/dashboard': a.rose, '/productos': a.rose, '/colecciones': a.lilac,
  '/variantes': a.blue, '/categorias': a.mint, '/proveedores': a.blue,
  '/compras': a.rose, '/clientes': a.mint, '/ventas': a.rose,
  '/reportes': a.lilac, '/usuarios': a.blue,
}

export default function Layout({ children }) {
  const { usuario, token, logout, cargando } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!cargando && !token) navigate('/login', { replace: true })
  }, [token, cargando])

  if (cargando) return null

  const handleLogout = () => { logout(); navigate('/login') }
  const currentColor = moduleColors[location.pathname] || a.lilac

  return (
    <div style={s.root}>

      {/* Sidebar */}
      <aside style={s.sidebar}>

        {/* Logo */}
        <div style={s.logoArea}>
            <div style={s.logoMark}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F78DA7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 5L8 10" />
                <path d="M18 5L16 10" />
                <path d="M8 10L12 14L16 10" />
                <path d="M8 10C4 16 3 20 12 22C21 20 20 16 16 10" />
              </svg>
            </div>
          <div>
            <div style={s.logoName}>MODATREND</div>
            <div style={s.logoTag}>Panel administrativo</div>
          </div>
        </div>

        <div style={s.divider} />

        {/* Nav */}
        <nav style={s.nav}>
          {MENU.map(grupo => (
            <div key={grupo.seccion} style={s.navGrupo}>
              <p style={s.navSeccion}>{grupo.seccion}</p>
              {grupo.items.map(item => {
                const activo = location.pathname === item.ruta
                return (
                  <button
                    key={item.ruta}
                    onClick={() => navigate(item.ruta)}
                    style={{
                      ...s.navItem,
                      background: activo ? a.roseBg : 'transparent',
                      color:      activo ? a.rose : '#1F2937',
                    }}
                  >
                    <span style={{
                      ...s.navIcono,
                      background: activo ? a.roseBg : 'transparent',
                      color:      activo ? a.rose : '#1F2937',
                    }}>{item.icono}</span>
                    <span style={s.navTexto}>{item.texto}</span>
                    {activo && (
                      <span style={{ ...s.navDot, background: currentColor }} />
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Usuario */}
        <div style={s.userArea}>
          <div style={{
            ...s.userAvatar,
            background: `linear-gradient(135deg, ${a.rose}, ${a.lilac})`,
          }}>
            {usuario?.nombre?.charAt(0).toUpperCase()}
          </div>
          <div style={s.userInfo}>
            <div style={s.userName}>{usuario?.nombre}</div>
            <div style={s.userRol}>{usuario?.rol}</div>
          </div>
          <button onClick={handleLogout} style={s.logoutBtn} title="Cerrar sesión">
            ⏻
          </button>
        </div>

      </aside>

      {/* Main */}
      <main style={s.main}>
        {/* Topbar */}
        <div style={s.topbar}>
          <div style={s.topbarLeft}>
            <div style={s.breadcrumb}>
              ModaTrend <span style={s.breadSep}>/</span>
              <span style={s.breadCurrent}>
                {location.pathname.replace('/', '').charAt(0).toUpperCase() +
                 location.pathname.replace('/', '').slice(1)}
              </span>
            </div>
          </div>
          <div style={s.topbarRight}>
            <div style={s.topbarDate}>
              {new Date().toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })}
            </div>
            <div style={s.topbarUser}>
              <div style={{
                ...s.topbarAvatar,
                background: `linear-gradient(135deg, ${a.rose}, ${a.lilac})`,
              }}>
                {usuario?.nombre?.charAt(0).toUpperCase()}
              </div>
              {usuario?.nombre}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={s.content}>
          {children}
        </div>
      </main>
    </div>
  )
}

const s = {
  root: {
    display: 'flex', height: '100vh', width: '100vw',
    overflow: 'hidden', background: a.bg,
  },
  sidebar: {
    width: '240px', minWidth: '240px',
    background: a.surface,
    borderRight: `1px solid ${t.borderLight}`,
    display: 'flex', flexDirection: 'column', overflowY: 'auto',
  },
  logoArea: {
    display: 'flex', alignItems: 'center', gap: spacing.sm,
    padding: `${spacing.lg} ${spacing.md}`,
    borderBottom: `1px solid ${t.borderLight}`,
  },
  logoMark: {
    width: '40px', height: '40px',
    background: t.secondary, borderRadius: radius.md,
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', flexShrink: 0,
  },
  logoName: {
    fontSize: typography.fontSize.lead,
    fontWeight: typography.fontWeight.bold,
    color: a.rose, letterSpacing: '1.5px',
  },
  logoTag: {
    fontSize: typography.fontSize.caption,
    color: t.textSecondary, marginTop: '1px',
  },
  divider: {
    height: '1px', background: t.borderLight, margin: '0',
  },
  nav: {
    flex: 1, padding: `${spacing.sm} ${spacing.sm}`,
    display: 'flex', flexDirection: 'column', gap: '2px',
  },
  navGrupo: { marginBottom: spacing.sm },
  navSeccion: {
    fontSize: '12px',
    fontWeight: 700,
    color: a.rose,
    letterSpacing: '2px',
    textTransform: 'uppercase',
    padding: `${spacing.sm} ${spacing.sm} ${spacing.xs}`,
  },
  navItem: {
    display: 'flex', alignItems: 'center', gap: spacing.sm,
    width: '100%', padding: `${spacing.sm} ${spacing.sm}`,
    borderRadius: radius.md, border: 'none',
    fontSize: typography.fontSize.lead,
    cursor: 'pointer', textAlign: 'left',
    transition: `all ${transitions.fast}`,
    fontWeight: typography.fontWeight.medium,
  },
  navIcono: {
    fontSize: '18px', width: '28px', height: '28px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: radius.sm, flexShrink: 0,
  },
  navTexto: { flex: 1 },
  navDot: {
    width: '6px', height: '6px', borderRadius: '50%',
    flexShrink: 0,
  },
  userArea: {
    display: 'flex', alignItems: 'center', gap: spacing.sm,
    padding: `${spacing.md} ${spacing.md}`,
    borderTop: `1px solid ${t.borderLight}`,
    background: a.surface,
  },
  userAvatar: {
    width: '34px', height: '34px', borderRadius: radius.md,
    color: '#fff', display: 'flex', alignItems: 'center',
    justifyContent: 'center',
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.bold, flexShrink: 0,
  },
  userInfo: { flex: 1, minWidth: 0 },
  userName: {
    fontSize: typography.fontSize.lead,
    fontWeight: typography.fontWeight.semibold,
    color: t.textPrimary,
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  userRol: {
    fontSize: typography.fontSize.small,
    color: t.textSecondary, marginTop: '1px',
  },
  logoutBtn: {
    background: 'none', border: 'none',
    color: t.textSecondary, fontSize: typography.fontSize.h3,
    cursor: 'pointer', padding: spacing.xs, flexShrink: 0,
  },
  main: {
    flex: 1, display: 'flex', flexDirection: 'column',
    overflow: 'hidden', background: a.bg,
  },
  topbar: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${spacing.md} ${spacing.xl}`,
    borderBottom: `1px solid ${t.borderLight}`,
    background: a.surface, flexShrink: 0,
  },
  topbarLeft: { display: 'flex', alignItems: 'center', gap: spacing.md },
  breadcrumb: {
    fontSize: typography.fontSize.lead, color: t.textSecondary,
  },
  breadSep: {
    margin: `0 ${spacing.xs}`, color: t.border,
  },
  breadCurrent: { color: t.textPrimary, fontWeight: typography.fontWeight.semibold },
  topbarRight: { display: 'flex', alignItems: 'center', gap: spacing.md },
  topbarDate: {
    fontSize: typography.fontSize.body,
    color: t.textSecondary,
    background: a.bg,
    padding: `${spacing.xs} ${spacing.sm}`,
    borderRadius: radius.sm,
  },
  topbarUser: {
    display: 'flex', alignItems: 'center', gap: spacing.sm,
    fontSize: typography.fontSize.lead,
    color: t.textSecondary,
  },
  topbarAvatar: {
    width: '28px', height: '28px', borderRadius: radius.sm,
    color: '#fff', display: 'flex', alignItems: 'center',
    justifyContent: 'center',
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.bold,
  },
  content: {
    flex: 1, overflowY: 'auto', minHeight: 0,
    padding: `${spacing.xl} ${spacing.xl}`,
  },
}
