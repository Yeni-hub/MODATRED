import tokens from '../../styles/tokens'

const { colors: c, typography, radius, spacing, shadows } = tokens

export default function DataTable({
  columns = [], data = [], emptyMessage = 'Sin datos',
  theme = 'warm', onRowClick, keyExtractor = (item) => item.id,
  style, wrapperStyle,
}) {
  const t = c[theme]
  const isWarm = theme === 'warm'
  const thBg    = '#F78DA7'
  const thColor = '#fff'
  const tdColor = t.textPrimary

  return (
    <div style={{
      background: t.surface, borderRadius: radius.lg,
      overflow: 'hidden', boxShadow: shadows.sm,
      ...wrapperStyle,
    }}>
      <table style={{
        width: '100%', borderCollapse: 'collapse',
        ...style,
      }}>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} style={{
                padding: `${spacing.md} ${spacing.md}`,
                textAlign: 'left',
                fontSize: isWarm ? typography.fontSize.small : typography.fontSize.caption,
                fontWeight: typography.fontWeight.semibold,
                color: thColor,
                letterSpacing: '0.3px',
                borderBottom: `1px solid ${t.borderLight}`,
                background: thBg,
                width: col.width,
              }}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{
                textAlign: 'center', padding: spacing.xl,
                color: t.textSecondary,
                fontSize: typography.fontSize.lead,
              }}>{emptyMessage}</td>
            </tr>
          ) : data.map((item, i) => (
            <tr key={keyExtractor(item, i)} style={{
              borderBottom: `0.5px solid ${t.borderLight}`,
              cursor: onRowClick ? 'pointer' : undefined,
              transition: 'background 0.15s',
            }} onClick={() => onRowClick?.(item)}>
              {columns.map(col => (
                <td key={col.key} style={{
                  padding: `${spacing.md} ${spacing.md}`,
                  fontSize: isWarm ? typography.fontSize.lead : typography.fontSize.small,
                  color: tdColor,
                }}>
                  {col.render ? col.render(item) : item[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
