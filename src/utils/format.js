const dateFormatter = new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
const dateTimeFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})
const relativeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

export function formatDate(value) {
  return value ? dateFormatter.format(new Date(value)) : '—'
}

export function formatDateTime(value) {
  return value ? dateTimeFormatter.format(new Date(value)) : '—'
}

export function formatRelative(value) {
  if (!value) return '—'
  const seconds = Math.round((new Date(value).getTime() - Date.now()) / 1000)
  const units = [
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return relativeFormatter.format(Math.round(seconds / size), unit)
  }
  return 'just now'
}

export function formatPercent(value) {
  return value === null || value === undefined ? '—' : `${Number(value).toFixed(1).replace(/\.0$/, '')}%`
}

/** yyyy-mm-dd for <input type="date"> (local date, not UTC). */
export function toDateInputValue(value = new Date()) {
  const date = new Date(value)
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

export function initials(name = '') {
  return name
    .replace(/^(Dr|Prof|Mr|Mrs|Ms)\.?\s+/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

/** "Dr. R. Venkatesan" → "Venkatesan", "Arun Kumar" → "Arun" */
export function firstName(name = '') {
  const parts = name
    .replace(/^(Dr|Prof|Mr|Mrs|Ms)\.?\s+/i, '')
    .split(/\s+/)
    .filter(Boolean)
  return parts.find((part) => !/^[A-Z]\.?$/i.test(part)) ?? parts[0] ?? ''
}

export function titleCase(value = '') {
  return value.charAt(0) + value.slice(1).toLowerCase()
}
