import { useState, useEffect } from 'react'
import tokens from '../../styles/tokens'

const { spacing, radius, typography, shadows } = tokens

const variants = {
  success: { bg: '#e6f4ea', border: '#2d7a3a', color: '#2d7a3a' },
  error: { bg: '#fff5f5', border: '#c45a5a', color: '#c45a5a' },
  info: { bg: '#f0f9f6', border: '#8FD9C8', color: '#8FD9C8' },
  warning: { bg: '#fff3e0', border: '#f59e0b', color: '#e65100' },
}

export default function Alert({ mensaje, tipo = 'success', duracion = 3000, onClose }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      onClose?.()
    }, duracion)
    return () => clearTimeout(timer)
  }, [duracion, onClose])

  if (!visible || !mensaje) return null

  const v = variants[tipo] || variants.success
  const icono = tipo === 'success' ? '✅' : tipo === 'error' ? '❌' : tipo === 'warning' ? '⚠️' : 'ℹ️'

  return (
    <div style={{
      position: 'fixed', top: spacing.lg, right: spacing.lg,
      padding: `${spacing.md} ${spacing.lg}`,
      borderRadius: radius.md,
      fontSize: typography.fontSize.lead,
      fontWeight: typography.fontWeight.semibold,
      zIndex: 2000, border: `1px solid ${v.border}`,
      boxShadow: shadows.md,
      background: v.bg,
      color: v.color,
      display: 'flex', alignItems: 'center', gap: spacing.sm,
    }}>
      {icono} {mensaje}
    </div>
  )
}
