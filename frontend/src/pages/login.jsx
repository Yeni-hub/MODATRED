import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login }                     = useAuth()
  const navigate                      = useNavigate()
  const [error, setError]             = useState('')
  const [cargando, setCargando]       = useState(false)
  const [verPassword, setVerPassword] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (datos) => {
    setError('')
    setCargando(true)
    try {
      const res = await axios.post('http://localhost:4000/api/auth/login', datos)
      login(res.data)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div style={s.pagina}>

      {/* ── Panel izquierdo — foto ── */}
      <div style={s.panelFoto}>
        <img
          src="/images/modelo.jpg"
          alt="Modelo ModaTrend colección verano"
          style={s.foto}
        />
        <div style={s.overlay} />
        <div style={s.fotoContenido}>
          <span style={s.badge}>✦ Nueva colección 2026</span>
          <h2 style={s.fotoTitulo}>Gestiona tu tienda<br />con estilo</h2>
          <p style={s.fotoSub}>Inventario · Ventas · Clientes · Reportes</p>
        </div>
      </div>

      {/* ── Panel derecho — formulario ── */}
      <div style={s.panelForm}>

        {/* Logo */}
        <div style={s.logo}>
          <div style={s.logoIcono}>
            <svg width="32" height="32" viewBox="0 0 50 50" fill="none">
              <path d="M25 4 L46 25 L25 46 L4 25 Z"
                stroke="#c47c5a" strokeWidth="1.5"/>
              <path d="M25 12 L38 25 L25 38 L12 25 Z"
                fill="#f7e6d8"/>
              <path d="M25 20 L32 25 L25 32 L18 25 Z"
                fill="#c47c5a"/>
            </svg>
          </div>
          <div>
            <div style={s.logoNombre}>ModaTrend</div>
            <div style={s.logoSub}>Panel de administración</div>
          </div>
        </div>

        {/* Línea divisora */}
        <div style={s.divisor} />

        {/* Encabezado */}
        <h1 style={s.titulo}>Bienvenida de nuevo</h1>
        <p style={s.subtitulo}>Ingresa tus credenciales para continuar</p>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} style={s.form} noValidate>

          {/* Email */}
          <div style={s.campo}>
            <label style={s.label} htmlFor="email">Correo electrónico</label>
            <div style={s.inputWrap}>
              <span style={s.icono}>✉</span>
              <input
                id="email"
                type="email"
                placeholder="email"
                autoComplete="off"
                style={{
                  ...s.input,
                  borderColor: errors.email ? '#e53e3e' : '#e8d5c4',
                }}
                {...register('email', {
                  required: 'El correo es obligatorio',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Formato de correo inválido',
                  },
                })}
              />
            </div>
            {errors.email && <span style={s.errorCampo}>{errors.email.message}</span>}
          </div>

          {/* Contraseña */}
          <div style={s.campo}>
            <label style={s.label} htmlFor="password">Contraseña</label>
            <div style={s.inputWrap}>
              <span style={s.icono}>🔒</span>
              <input
                id="password"
                type={verPassword ? 'text' : 'password'}
                placeholder="contraseña"
                autoComplete="new-password"
                style={{
                  ...s.input,
                  borderColor: errors.password ? '#e53e3e' : '#e8d5c4',
                }}
                {...register('password', {
                  required: 'La contraseña es obligatoria',
                  minLength: { value: 6, message: 'Mínimo 6 caracteres' },
                })}
              />
              <button
                type="button"
                onClick={() => setVerPassword(!verPassword)}
                style={s.btnVer}
                aria-label={verPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {verPassword ? '🙈' : '👁'}
              </button>
            </div>
            {errors.password && <span style={s.errorCampo}>{errors.password.message}</span>}
          </div>

          {/* Error general */}
          {error && <div style={s.errorGeneral} role="alert">{error}</div>}

          {/* Botón */}
          <button
            type="submit"
            disabled={cargando}
            style={{ ...s.boton, opacity: cargando ? 0.75 : 1 }}
          >
            {cargando ? 'Ingresando...' : 'Ingresar al sistema →'}
          </button>

        </form>

        {/* Seguridad */}
        <div style={s.seguridad}>
          <span>🔐 Conexión cifrada</span>
          <span style={{ color: '#ddd' }}>·</span>
          <span>🛡 JWT protegido</span>
        </div>

        <p style={s.pie}>ModaTrend © 2026 · Todos los derechos reservados</p>
      </div>
    </div>
  )
}

const s = {
  pagina: {
    display:        'flex',
    height:         '100vh',
    width:          '100vw',
    overflow:       'hidden',
    background:     '#fdf6f0',
  },
  panelFoto: {
    width:          '55%',
    position:       'relative',
    overflow:       'hidden',
  },
  foto: {
    width:          '100%',
    height:         '100%',
    objectFit:      'cover',
    objectPosition: '50% 20%',
  },
  overlay: {
    position:       'absolute',
    inset:          0,
    background:     'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 45%, rgba(0,0,0,0.05) 100%)',
  },
  fotoContenido: {
    position:       'absolute',
    bottom:         '52px',
    left:           '48px',
    right:          '48px',
    color:          '#fff',
  },
  badge: {
    display:        'inline-block',
    background:     'rgba(255,255,255,0.15)',
    border:         '0.5px solid rgba(255,255,255,0.4)',
    borderRadius:   '20px',
    padding:        '6px 18px',
    fontSize:       '18px',
    marginBottom:   '18px',
    letterSpacing:  '0.5px',
  },
  fotoTitulo: {
    fontSize:       '3.8rem',
    fontWeight:     '600',
    lineHeight:     '1.2',
    marginBottom:   '12px',
    textShadow:     '0 2px 12px rgba(0,0,0,0.4)',
  },
  fotoSub: {
    fontSize:       '1.2rem',
    opacity:        0.85,
    letterSpacing:  '1.5px',
  },
  panelForm: {
    width:          '45%',
    minWidth:       '45%',
    background:     '#ffffff',
    display:        'flex',
    flexDirection:  'column',
    justifyContent: 'center',
    padding:        '60px 70px',
    boxShadow:      '-4px 0 30px rgba(0,0,0,0.08)',
    overflowY:      'auto',
  },
  logo: {
    display:        'flex',
    alignItems:     'center',
    gap:            '16px',
    marginBottom:   '32px',
  },
  logoIcono: {
    width:          '58px',
    height:         '58px',
    background:     '#fdf0e8',
    borderRadius:   '14px',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    border:         '1px solid #f0d5c0',
  },
  logoNombre: {
    fontSize:       '3.8rem',
    fontWeight:     '600',
    color:          '#c47c5a',
    letterSpacing:  '2px',
    fontFamily:     'Georgia, serif',
  },
  logoSub: {
    fontSize:       '18px',
    color:          '#b89a8a',
    marginTop:      '3px',
    letterSpacing:  '0.5px',
  },
  divisor: {
    height:         '1px',
    background:     'linear-gradient(to right, #f0d5c0, transparent)',
    marginBottom:   '30px',
  },
  titulo: {
    fontSize:       '3.8rem',
    fontWeight:     '600',
    color:          '#2a1a12',
    marginBottom:   '8px',
  },
  subtitulo: {
    fontSize:       '1.2rem',
    color:          '#9e7b65',
    marginBottom:   '30px',
  },
  form: {
    display:        'flex',
    flexDirection:  'column',
    gap:            '20px',
  },
  campo: {
    display:        'flex',
    flexDirection:  'column',
    gap:            '8px',
  },
  label: {
    fontSize:       '1.2rem',
    fontWeight:     '600',
    color:          '#7a5c4a',
    letterSpacing:  '0.3px',
  },
  inputWrap: {
    position:       'relative',
    display:        'flex',
    alignItems:     'center',
  },
  icono: {
    position:       'absolute',
    left:           '16px',
    fontSize:       '18px',
    pointerEvents:  'none',
    zIndex:         1,
  },
  input: {
    width:          '100%',
    padding:        '16px 52px',
    borderRadius:   '12px',
    border:         '1.5px solid #e8d5c4',
    fontSize:       '1.2rem',
    outline:        'none',
    color:          '#2a1a12',
    background:     '#fffaf7',
    boxSizing:      'border-box',
    transition:     'border-color 0.2s',
  },
  btnVer: {
    position:       'absolute',
    right:          '14px',
    background:     'none',
    border:         'none',
    fontSize:       '18px',
    cursor:         'pointer',
    padding:        '4px',
  },
  errorCampo: {
    fontSize:       '0.9rem',
    color:          '#e53e3e',
  },
  errorGeneral: {
    background:     '#fff5f5',
    border:         '1px solid #fed7d7',
    borderRadius:   '10px',
    padding:        '14px',
    color:          '#c53030',
    fontSize:       '1rem',
    textAlign:      'center',
  },
  boton: {
    background:     '#c47c5a',
    color:          '#ffffff',
    border:         'none',
    borderRadius:   '12px',
    padding:        '18px',
    fontSize:       '2.15rem',
    fontWeight:     '600',
    cursor:         'pointer',
    marginTop:      '8px',
    letterSpacing:  '0.5px',
  },
  seguridad: {
    display:        'flex',
    gap:            '12px',
    justifyContent: 'center',
    marginTop:      '28px',
    fontSize:       '16px',
    color:          '#b89a8a',
  },
  pie: {
    textAlign:      'center',
    marginTop:      '16px',
    fontSize:       '16px',
    color:          '#c9b0a2',
  },
}