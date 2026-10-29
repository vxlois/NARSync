const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

function pad(value) {
  return String(value).padStart(2, '0')
}

/** Local calendar date key, e.g. 2026-10-29 */
export function dateKey(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** Parse a local YYYY-MM-DD key without UTC drift. */
export function parseDateKey(key) {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatDateLong(input) {
  const date = typeof input === 'string' && input.length === 10 ? parseDateKey(input) : new Date(input)
  return `${WEEKDAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

export function formatDateMedium(input) {
  const date = typeof input === 'string' && input.length === 10 ? parseDateKey(input) : new Date(input)
  return `${MONTHS[date.getMonth()].slice(0, 3)} ${date.getDate()}, ${date.getFullYear()}`
}

export function formatDayParts(input) {
  const date = typeof input === 'string' && input.length === 10 ? parseDateKey(input) : new Date(input)
  return {
    day: pad(date.getDate()),
    month: MONTHS[date.getMonth()].slice(0, 3).toUpperCase(),
    weekday: WEEKDAYS[date.getDay()].slice(0, 3).toUpperCase(),
  }
}

export function formatTime(iso) {
  if (!iso) return '—'
  const date = new Date(iso)
  let hours = date.getHours()
  const minutes = pad(date.getMinutes())
  const suffix = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12
  return `${hours}:${minutes} ${suffix}`
}

export function formatTimestamp(iso) {
  if (!iso) return '—'
  return `${formatDateMedium(iso)} · ${formatTime(iso)}`
}

export function formatClock(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
}

export function greeting(date = new Date()) {
  const hour = date.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export function minutesSinceMidnight(iso) {
  const date = new Date(iso)
  return date.getHours() * 60 + date.getMinutes()
}

export function formatCoords(coords) {
  if (!coords) return 'Coordinates unavailable'
  return `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
}

export function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`
}
