import tokens from '../../styles/tokens'

const { colors: c } = tokens

const variantStyles = {
  warm: {
    primary:   { background: c.accent.rose, color: '#fff', border: 'none' },
    secondary: { background: c.accent.roseBg, color: c.accent.rose, border: 'none' },
    success:   { background: c.warm.success, color: '#fff', border: 'none' },
    danger:    { background: '#fef0f0', color: c.warm.danger, border: 'none' },
    outline:   { background: 'transparent', color: c.accent.rose, border: `1.5px solid ${c.warm.borderLight}` },
    ghost:     { background: c.warm.background, color: c.warm.textLabel, border: 'none' },
  },
  dark: {
    primary:   { background: c.dark.primary, color: '#fff', border: 'none' },
    secondary: { background: c.dark.secondary, color: c.dark.textLabel, border: '1px solid #2d3748' },
    success:   { background: c.dark.success, color: '#fff', border: 'none' },
    danger:    { background: c.dark.danger, color: '#fff', border: 'none' },
    outline:   { background: 'transparent', color: c.dark.textLabel, border: '1px solid #2d3748' },
    ghost:     { background: c.dark.secondary, color: c.dark.textLabel, border: '1px solid #2d3748' },
  }
}

const sizeStyles = {
  sm: { padding: '7px 16px', fontSize: '13px', borderRadius: '8px' },
  md: { padding: '12px 28px', fontSize: '15px', borderRadius: '12px' },
  lg: { padding: '14px 32px', fontSize: '16px', borderRadius: '12px' },
}

export default function Button({
  variant = 'primary',
  size = 'md',
  theme = 'warm',
  disabled = false,
  loading = false,
  icon,
  onClick,
  type = 'button',
  children,
  style,
}) {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    fontWeight: '600', cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.15s', boxSizing: 'border-box',
    opacity: disabled ? 0.5 : 1,
    fontFamily: 'inherit', lineHeight: 1.3, whiteSpace: 'nowrap',
  }

  const v = variantStyles[theme]?.[variant] || variantStyles.warm.primary
  const s = sizeStyles[size] || sizeStyles.md

  const isRosePrimary = theme === 'warm' && (variant === 'primary' || variant === 'secondary')

  return (
    <>
      <button
        type={type}
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        className={isRosePrimary ? 'btn-rose' : ''}
        style={{ ...base, ...v, ...s, ...style }}
      >
        {loading ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Spinner />
            {children}
          </span>
        ) : (
          <>
            {icon && <span style={{ fontSize: '1.2em', lineHeight: 1 }}>{icon}</span>}
            {children}
          </>
        )}
      </button>
      <style>{`
        .btn-rose:hover:not(:disabled) {
          background: #e87a92 !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(247,141,167,0.35);
        }
        .btn-rose:active:not(:disabled) {
          transform: translateY(0);
        }
      `}</style>
    </>
  )
}

function Spinner() {
  return (
    <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
  )
}
