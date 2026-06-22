import tokens from '../../styles/tokens'

const { colors, spacing, typography } = tokens

export default function SectionHeader({ title, subtitle, action, theme = 'warm' }) {
  const t = colors[theme]
  const isWarm = theme === 'warm'

  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      alignItems: 'flex-start', marginBottom: spacing.lg,
    }}>
      <div>
        <h1 style={{
          fontSize: isWarm ? typography.fontSize.h1 : typography.fontSize.h2,
          fontWeight: typography.fontWeight.semibold,
          color: t.textPrimary, margin: 0,
        }}>{title}</h1>
        {subtitle && (
          <p style={{
            fontSize: isWarm ? typography.fontSize.lead : typography.fontSize.small,
            color: t.textSecondary,
            margin: 0, marginTop: spacing.xs,
          }}>{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
