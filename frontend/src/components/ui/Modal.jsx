import { createContext, useContext } from 'react'
import tokens from '../../styles/tokens'

const { colors, spacing, radius, typography, shadows } = tokens
const t = colors.warm

const ModalCtx = createContext()

export default function Modal({ open, onClose, children, maxWidth }) {
  if (!open) return null
  return (
    <ModalCtx.Provider value={{ onClose }}>
      <div style={s.overlay} onClick={onClose}>
        <div style={{ ...s.container, maxWidth: maxWidth || '560px' }} onClick={e => e.stopPropagation()}>
          {children}
        </div>
      </div>
    </ModalCtx.Provider>
  )
}

function Header({ title }) {
  const { onClose } = useContext(ModalCtx)
  return (
    <div style={s.header}>
      <h2 style={s.title}>{title}</h2>
      <button onClick={onClose} style={s.closeBtn}>✕</button>
    </div>
  )
}

function Body({ children }) {
  return <div style={s.body}>{children}</div>
}

function Footer({ children }) {
  return <div style={s.footer}>{children}</div>
}

Modal.Header = Header
Modal.Body = Body
Modal.Footer = Footer

const s = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  container: {
    background: t.surface, borderRadius: radius.lg, width: '100%',
    boxShadow: shadows.lg,
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: `${spacing.lg} ${spacing.xl}`,
    borderBottom: `1px solid ${t.borderLight}`,
  },
  title: {
    fontSize: typography.fontSize.h3,
    fontWeight: typography.fontWeight.semibold,
    color: t.textPrimary, margin: 0,
  },
  closeBtn: {
    background: 'none', border: 'none', fontSize: '1.2rem',
    cursor: 'pointer', color: t.textSecondary, padding: spacing.xs,
  },
  body: {
    padding: spacing.xl,
    display: 'flex', flexDirection: 'column', gap: spacing.md,
  },
  footer: {
    display: 'flex', justifyContent: 'flex-end', gap: spacing.sm,
    padding: `${spacing.md} ${spacing.xl}`,
    borderTop: `1px solid ${t.borderLight}`,
  },
}
