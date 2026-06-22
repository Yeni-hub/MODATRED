const tokens = {
  colors: {
    warm: {
      primary:        '#c47c5a',
      primaryHover:   '#b56a47',
      secondary:      '#f7e6d8',
      success:        '#2d7a3a',
      warning:        '#f59e0b',
      danger:         '#c45a5a',
      info:           '#7b9e87',
      background:     '#f5ede6',
      surface:        '#ffffff',
      border:         '#e8d5c4',
      borderLight:    '#f0e6de',
      textPrimary:    '#111827',
      textSecondary:  '#4B5563',
      textLabel:      '#374151',
    },
    dark: {
      primary:        '#6366f1',
      primaryHover:   '#5558e6',
      secondary:      '#1e2030',
      success:        '#10b981',
      warning:        '#f59e0b',
      danger:         '#ef4444',
      info:           '#8b5cf6',
      background:     '#0f1117',
      surface:        '#13151f',
      border:         '#2d3748',
      borderLight:    '#1e2030',
      textPrimary:    '#f1f5f9',
      textSecondary:  '#475569',
      textLabel:      '#94a3b8',
    },
    accent: {
      rose:      '#F78DA7',
      roseBg:    '#FDF2F5',
      lilac:     '#BFA8F8',
      lilacBg:   '#F6F2FD',
      mint:      '#8FD9C8',
      mintBg:    '#F0F9F6',
      blue:      '#8FC8FF',
      blueBg:    '#F2F8FF',
      bg:        '#FAFAFB',
      surface:   '#FCFCFD',
    },
  },

  typography: {
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    fontSize: {
      caption:  '12px',
      small:    '13px',
      body:     '14px',
      lead:     '16px',
      h3:       '18px',
      h2:       '22px',
      h1:       '24px',
      display:  '32px',
      kpi:      '36px',
    },
    fontWeight: {
      regular:  400,
      medium:   500,
      semibold: 600,
      bold:     700,
    },
  },

  spacing: {
    xs:  '4px',
    sm:  '8px',
    md:  '16px',
    lg:  '24px',
    xl:  '40px',
    '2xl': '56px',
  },

  radius: {
    sm:  '6px',
    md:  '10px',
    lg:  '16px',
    xl:  '20px',
    full: '50%',
  },

  shadows: {
    xs: '0 1px 4px rgba(0,0,0,0.04)',
    sm: '0 2px 12px rgba(0,0,0,0.06)',
    md: '0 4px 20px rgba(0,0,0,0.08)',
    lg: '0 20px 60px rgba(0,0,0,0.12)',
  },

  transitions: {
    fast:   '0.15s',
    normal: '0.3s',
    slow:   '0.5s',
  },
}

export default tokens
