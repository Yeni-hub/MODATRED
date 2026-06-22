import tokens from '../../styles/tokens'

const { colors, spacing, radius, typography, transitions, shadows } = tokens

export default function MetricCard({
  titulo, valor, sub, color, icono, barWidth, theme = 'dark'
}) {
  const t = colors[theme]
  return (
    <div style={{
      background: colors.accent.surface,
      border: '1px solid #e8e8ec',
      borderRadius: '18px',
      padding: `${spacing.lg} ${spacing.lg}`,
      boxShadow: shadows.xs,
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: spacing.sm,
      }}>
        <span style={{
          fontSize: typography.fontSize.small,
          fontWeight: typography.fontWeight.semibold,
          color: t.textSecondary,
          letterSpacing: '0.5px',
        }}>{titulo}</span>
        <div style={{
          width: '34px', height: '34px',
          borderRadius: radius.sm,
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: typography.fontSize.h3,
          background: color + '15', color,
        }}>{icono}</div>
      </div>
      <div style={{
        fontSize: theme === 'warm' ? typography.fontSize.display : typography.fontSize.kpi,
        fontWeight: typography.fontWeight.bold,
        color, marginBottom: spacing.xs,
        letterSpacing: '-0.5px',
      }}>{valor}</div>
      <div style={{
        fontSize: typography.fontSize.body,
        color: t.textSecondary, marginBottom: spacing.md,
      }}>{sub}</div>
      {barWidth !== undefined && (
        <div style={{
          height: '4px', borderRadius: radius.sm,
          overflow: 'hidden', background: color + '20',
        }}>
          <div style={{
            height: '100%', borderRadius: radius.sm,
            transition: `width ${transitions.slow}`,
            background: color, width: `${barWidth}%`,
          }} />
        </div>
      )}
    </div>
  )
}
