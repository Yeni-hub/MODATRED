import tokens from '../../styles/tokens'

const { colors: c, typography, radius: r, spacing } = tokens

const variantMap = {
  warm: {
    neutral: { bg: '#FDF2F5',               color: '#F78DA7' },
    success: { bg: '#e6f4ea',               color: c.warm.success },
    danger:  { bg: '#fef0f0',               color: c.warm.danger },
    warning: { bg: '#fff3e0',               color: '#e65100' },
    info:    { bg: c.warm.background,        color: c.warm.textLabel },
  },
  dark: {
    neutral: { bg: '#FDF2F5',               color: '#F78DA7' },
    success: { bg: c.dark.success + '20',   color: c.dark.success },
    danger:  { bg: c.dark.danger + '20',    color: c.dark.danger },
    warning: { bg: c.dark.warning + '20',   color: c.dark.warning },
    info:    { bg: c.dark.surface,           color: c.dark.textSecondary },
  },
  accent: {
    rose:    { bg: c.accent.roseBg,       color: c.accent.rose },
    lilac:   { bg: c.accent.lilacBg,      color: c.accent.lilac },
    mint:    { bg: c.accent.mintBg,       color: c.accent.mint },
    blue:    { bg: c.accent.blueBg,       color: c.accent.blue },
  },
}

export default function Badge({
  variant = 'neutral', theme = 'warm', children, style,
}) {
  const v = variantMap[theme]?.[variant] || variantMap.warm.neutral
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: `${spacing.xs} ${spacing.sm}`,
      borderRadius: r.xl,
      fontSize: typography.fontSize.caption,
      fontWeight: typography.fontWeight.semibold,
      background: v.bg, color: v.color,
      lineHeight: 1.5, whiteSpace: 'nowrap',
      ...style,
    }}>
      {children}
    </span>
  )
}
