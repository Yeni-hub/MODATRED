export const safeArray = (data) => Array.isArray(data) ? data.filter(x => x != null) : []
export const safeObject = (obj) => obj ?? {}

export const formatCurrency = (value, locale = 'es-CO') => {
  return Number(value || 0).toLocaleString(locale)
}

export const formatDate = (date, locale = 'es-CO') => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString(locale)
}

export const formatDateTime = (date, locale = 'es-CO') => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString(locale, {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}
