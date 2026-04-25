// ---------- Currency ----------
const CURRENCY = 'PKR'
const LOCALE   = 'en-PK'

export function formatCurrency(amount, currency = CURRENCY) {
  const n = Number(amount) || 0
  try {
    return new Intl.NumberFormat(LOCALE, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(n)
  } catch {
    return `${currency} ${n.toLocaleString()}`
  }
}

export function formatNumber(n) {
  return (Number(n) || 0).toLocaleString(LOCALE)
}

// ---------- Dates ----------
export function formatDate(value) {
  const d = value instanceof Date ? value : new Date(value)
  if (isNaN(d)) return '—'
  return d.toLocaleDateString(LOCALE, { year: 'numeric', month: 'short', day: 'numeric' })
}

export function formatDateTime(value) {
  const d = value instanceof Date ? value : new Date(value)
  if (isNaN(d)) return '—'
  return d.toLocaleString(LOCALE, {
    year:   'numeric',
    month:  'short',
    day:    'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  })
}

export function relativeTime(value) {
  const d = value instanceof Date ? value : new Date(value)
  const diffMs = Date.now() - d.getTime()
  const mins   = Math.round(diffMs / 60000)
  if (mins < 1)     return 'just now'
  if (mins < 60)    return `${mins}m ago`
  const hrs  = Math.round(mins / 60)
  if (hrs  < 24)    return `${hrs}h ago`
  const days = Math.round(hrs  / 24)
  if (days < 30)    return `${days}d ago`
  return formatDate(d)
}

// ---------- IDs ----------
export function shortId(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`
}
