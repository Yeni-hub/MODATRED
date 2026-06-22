import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import tokens from '../styles/tokens'

const { colors, spacing, radius, typography, shadows, transitions } = tokens
const t = colors.warm
const a = colors.accent

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
    <div className="login-root" style={s.root}>
      <div className="login-photo" style={s.photo}>
        <img src="/images/modelo.jpg" alt="" style={s.foto} />
        <div style={s.overlay} />
          <div className="login-photo-content" style={s.photoContent}>
            <span style={s.badge}>✦ Nueva colección 2026</span>
          <h2 style={s.photoTitle}>Gestiona tu tienda<br />con estilo</h2>
          <p style={s.photoSub}>Inventario · Ventas · Clientes · Reportes</p>
        </div>
      </div>

      <div className="login-form" style={s.formPanel}>
        <div className="login-card" style={s.card}>
          <div style={s.logoRow}>
              <div style={s.logoIcon}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#F78DA7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 5L8 10" />
                  <path d="M18 5L16 10" />
                  <path d="M8 10L12 14L16 10" />
                  <path d="M8 10C4 16 3 20 12 22C21 20 20 16 16 10" />
                </svg>
              </div>
            <div>
              <div style={s.logoName}>ModaTrend</div>
              <div style={s.logoSub}>Panel de administración</div>
            </div>
          </div>

          <h1 style={s.title}>Iniciar sesión</h1>
          <p style={s.subtitle}>Ingresa tus credenciales para acceder al panel</p>

          <form onSubmit={handleSubmit(onSubmit)} style={s.form}>

            <div style={s.field}>
              <label style={s.label}>Correo electrónico</label>
              <div style={s.inputBox}>
                <span style={s.inputIcon}>✉</span>
                <input
                  type="email"
                  placeholder="tu@correo.com"
                  autoComplete="off"
                  className="login-field"
                  style={{ ...s.input, borderColor: errors.email ? t.danger : t.borderLight }}
                  {...register('email', {
                    required: 'El correo es obligatorio',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Formato inválido' },
                  })}
                />
              </div>
              {errors.email && <span style={s.errorText}>{errors.email.message}</span>}
            </div>

            <div style={s.field}>
              <label style={s.label}>Contraseña</label>
              <div style={s.inputBox}>
                <span style={s.inputIcon}>🔒</span>
                <input
                  type={verPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="off"
                  className="login-field"
                  style={{ ...s.input, borderColor: errors.password ? t.danger : t.borderLight }}
                  {...register('password', {
                    required: 'La contraseña es obligatoria',
                    minLength: { value: 6, message: 'Mínimo 6 caracteres' },
                  })}
                />
                <button type="button" onClick={() => setVerPassword(!verPassword)} style={s.eyeBtn}>
                  {verPassword ? '🙈' : '👁'}
                </button>
              </div>
              {errors.password && <span style={s.errorText}>{errors.password.message}</span>}
            </div>

            {error && <div style={s.errorBox}>{error}</div>}

            <button type="submit" disabled={cargando} className="login-btn" style={{ ...s.submitBtn, opacity: cargando ? 0.6 : 1 }}>
              {cargando ? 'Ingresando...' : 'Ingresar al sistema →'}
            </button>

          </form>

          <div style={s.footer}>
            <span>🔐 Conexión cifrada</span>
            <span style={{ color: t.borderLight }}>·</span>
            <span>🛡 JWT protegido</span>
          </div>
        </div>
      </div>

      <style>{`
        .login-field:focus {
          border-color: ${a.rose} !important;
          box-shadow: 0 0 0 3px ${a.rose}26;
          outline: none;
        }
        .login-btn:hover {
          background: #e87a92 !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(247,141,167,0.35);
        }
        @media (max-width: 1024px) {
          .login-photo { width: 40% !important; }
          .login-form { width: 60% !important; }
        }
        @media (max-width: 768px) {
          .login-root { flex-direction: column !important; }
          .login-photo { width: 100% !important; height: 30vh !important; min-height: 240px !important; }
          .login-form { width: 100% !important; padding: 20px !important; }
          .login-photo-content { display: none !important; }
        }
      `}</style>
    </div>
  )
}

const s = {
  root: {
    display: 'flex', height: '100vh', width: '100vw',
    overflow: 'hidden', background: a.bg,
  },
  photo: {
    width: '50%', position: 'relative', overflow: 'hidden',
  },
  foto: {
    width: '100%', height: '100%',
    objectFit: 'cover', objectPosition: '50% 20%',
  },
  overlay: {
    position: 'absolute', inset: 0,
    background: `linear-gradient(135deg, ${a.rose}20, transparent 50%, ${a.rose}08)`,
  },
  photoContent: {
    position: 'absolute', bottom: spacing.xl, left: spacing.xl, right: spacing.xl,
    color: '#fff',
  },
  badge: {
    display: 'inline-block',
    background: 'rgba(255,255,255,0.15)',
    border: '0.5px solid rgba(255,255,255,0.4)',
    borderRadius: radius.xl,
    padding: `${spacing.sm} ${spacing.lg}`,
    fontSize: typography.fontSize.lead,
    marginBottom: spacing.lg,
    letterSpacing: '0.5px',
    backdropFilter: 'blur(4px)',
  },
  photoTitle: {
    fontSize: '3.6rem',
    fontWeight: typography.fontWeight.semibold,
    lineHeight: '1.2',
    marginBottom: spacing.sm,
    textShadow: '0 2px 12px rgba(0,0,0,0.3)',
  },
  photoSub: {
    fontSize: '1.1rem', opacity: 0.85, letterSpacing: '1.5px',
  },
  formPanel: {
    width: '50%', minWidth: '50%',
    display: 'flex', flexDirection: 'column',
    justifyContent: 'center', alignItems: 'center',
    padding: spacing.xl,
    overflowY: 'auto',
  },
  card: {
    width: '100%', maxWidth: '560px',
    background: a.surface,
    borderRadius: radius.xl,
    boxShadow: shadows.xs,
    padding: '60px',
    boxSizing: 'border-box',
  },
  logoRow: {
    display: 'flex', alignItems: 'center',
    gap: spacing.lg, marginBottom: spacing.xl,
  },
  logoIcon: {
    width: '80px', height: '80px',
    background: a.roseBg,
    borderRadius: radius.full,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  logoName: {
    fontSize: '2.2rem',
    fontWeight: typography.fontWeight.semibold,
    color: a.rose, letterSpacing: '2px',
    fontFamily: 'Georgia, serif',
  },
  logoSub: {
    fontSize: typography.fontSize.lead,
    color: t.textSecondary,
    marginTop: spacing.xs,
  },
  title: {
    fontSize: '30px', fontWeight: 700,
    color: t.textPrimary, marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: '19px', fontWeight: 400,
    color: t.textSecondary, marginBottom: '36px',
  },
  form: {
    display: 'flex', flexDirection: 'column', gap: '28px',
  },
  field: {
    display: 'flex', flexDirection: 'column', gap: '12px',
  },
  label: {
    fontSize: '17px', fontWeight: 500,
    color: t.textLabel,
  },
  inputBox: {
    position: 'relative', display: 'flex', alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute', left: '20px',
    fontSize: '20px', pointerEvents: 'none', zIndex: 1,
  },
  input: {
    width: '100%', height: '60px', padding: '0 60px',
    borderRadius: '14px', border: '2px solid',
    fontSize: '17px', color: t.textPrimary,
    background: '#fff', boxSizing: 'border-box',
  },
  eyeBtn: {
    position: 'absolute', right: spacing.sm,
    background: 'none', border: 'none', fontSize: '20px',
    cursor: 'pointer', padding: spacing.xs, lineHeight: 1,
  },
  errorText: {
    fontSize: '15px', color: t.danger,
  },
  errorBox: {
    background: a.roseBg,
    border: `1px solid ${a.rose}`,
    borderRadius: radius.md,
    padding: spacing.md,
    color: t.danger,
    fontSize: '15px',
    textAlign: 'center',
  },
  submitBtn: {
    width: '100%', height: '60px',
    background: a.rose, color: '#fff',
    border: 'none', borderRadius: '14px',
    fontSize: '18px', fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s',
    fontFamily: 'inherit',
  },
  footer: {
    display: 'flex', gap: spacing.md,
    justifyContent: 'center', marginTop: spacing.xl,
    fontSize: '14px', color: t.textSecondary,
  },
}
