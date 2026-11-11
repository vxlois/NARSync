import { LATE_AFTER_MINUTES } from '../data/mockData'
import { minutesSinceMidnight, philippinesDateKey } from './format'

export const STATUS_META = {
  present: { label: 'Present', tone: 'success' },
  late: { label: 'Late', tone: 'warning' },
  incomplete: { label: 'Missing time out', tone: 'warning' },
  in_progress: { label: 'On duty', tone: 'violet' },
  absent: { label: 'Absent', tone: 'danger' },
}

export function isLate(timeInISO) {
  if (!timeInISO) return false
  return minutesSinceMidnight(timeInISO) > LATE_AFTER_MINUTES
}

/**
 * Presence is derived from the evidence actually stored in the session.
 * A record with a time in but no time out is still in progress today.
 */
export function getRecordStatus(record) {
  if (!record || !record.timeIn) return 'absent'
  if (!record.timeOut) {
    return record.date === philippinesDateKey() ? 'in_progress' : 'incomplete'
  }
  return isLate(record.timeIn.at) ? 'late' : 'present'
}

export function statusMeta(record) {
  return STATUS_META[getRecordStatus(record)] ?? STATUS_META.absent
}

export function getAttendanceSnapshot(record) {
  if (!record || !record.timeIn) {
    return {
      key: 'not_started',
      label: 'Not timed in',
      description: 'Take your photo to start your duty.',
      tone: 'neutral',
    }
  }
  if (!record.timeOut) {
    return {
      key: 'on_duty',
      label: 'On duty',
      description: 'Time in recorded. Remember to time out.',
      tone: 'violet',
    }
  }
  return {
    key: 'completed',
    label: 'Duty complete',
    description: 'Time in and time out recorded.',
    tone: 'success',
  }
}

export function matchesStatusFilter(record, filter) {
  if (filter === 'all') return true
  const status = getRecordStatus(record)
  if (filter === 'incomplete') return status === 'incomplete' || status === 'in_progress'
  return status === filter
}

export function getGroupSessionStatus(group, record, now = Date.now()) {
  if (!group.session.valid) {
    return { key: 'planning', label: 'Schedule not ready', tone: 'warning' }
  }
  if (record?.timeOut) {
    return { key: 'completed', label: 'Duty complete', tone: 'success' }
  }
  if (record?.timeIn) {
    return { key: 'on-duty', label: 'On duty', tone: 'violet' }
  }
  const timeIn = getTimeInAccess(group, now)
  if (timeIn.hasSchedule && !timeIn.isOpen) {
    return { key: 'waiting', label: 'Starts soon', tone: 'neutral' }
  }
  return { key: 'ready', label: 'Ready to time in', tone: 'violet' }
}

const PHILIPPINES_UTC_OFFSET_HOURS = 8
const SHIFT_TIME_PATTERN = /(\d{1,2}):(\d{2})\s*(AM|PM)/gi

/** Students may time in this many minutes before their duty starts. */
export const TIME_IN_EARLY_MINUTES = 30

function to24Hour(hours, meridiem) {
  const value = Number(hours) % 12
  return meridiem.toUpperCase() === 'PM'
    ? value + 12
    : value
}

/**
 * Build an absolute timestamp for a Philippine Standard Time (UTC+8) clock
 * time on a duty date. The date key is interpreted as a PHT calendar date, not
 * as the device's local time zone.
 */
function philippinesTimestamp(dateKeyValue, hours, minutes) {
  const [year, month, day] = String(dateKeyValue).split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(
    Date.UTC(year, month - 1, day, hours - PHILIPPINES_UTC_OFFSET_HOURS, minutes, 0, 0),
  )
}

/** Parse the start and end clock times from a session shift string. */
export function getSessionWindow(group) {
  const shift = group?.session?.shift
  const dateKeyValue = group?.session?.date
  if (!shift || !dateKeyValue) return { start: null, end: null }

  const matches = [...String(shift).matchAll(SHIFT_TIME_PATTERN)]
  if (matches.length === 0) return { start: null, end: null }

  const toTimestamp = (match) => {
    if (!match) return null
    return philippinesTimestamp(
      dateKeyValue,
      to24Hour(match[1], match[3]),
      Number(match[2]),
    )
  }

  return {
    start: toTimestamp(matches[0]),
    end: toTimestamp(matches[1] ?? null),
  }
}

/** Scheduled time out for a group, expressed as an absolute Date. */
export function getScheduledTimeOut(group) {
  return getSessionWindow(group).end
}

/** Format any timestamp in Philippine Standard Time. */
export function formatPhilippinesTime(input) {
  if (!input) return '—'
  const date = input instanceof Date ? input : new Date(input)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleTimeString('en-US', {
    timeZone: 'Asia/Manila',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function formatCountdown(milliseconds) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) return `${hours}h ${String(minutes).padStart(2, '0')}m`
  if (minutes > 0) return `${minutes}m ${String(seconds).padStart(2, '0')}s`
  return `${seconds}s`
}

/**
 * Time In opens 30 minutes before the published duty start and stays available
 * afterwards. The window is anchored to Philippine Standard Time (UTC+8), so
 * the comparison is correct even when the device uses another time zone.
 */
export function getTimeInAccess(group, now = Date.now()) {
  const start = getSessionWindow(group).start
  if (!start) {
    return {
      startAt: null,
      opensAt: null,
      hasSchedule: false,
      isOpen: false,
      remainingMs: 0,
      label: '—',
      startLabel: '—',
    }
  }

  const opensAt = new Date(start.getTime() - TIME_IN_EARLY_MINUTES * 60 * 1000)
  const nowMs = now instanceof Date ? now.getTime() : Number(now)
  const remainingMs = Math.max(0, opensAt.getTime() - nowMs)

  return {
    startAt: start,
    opensAt,
    hasSchedule: true,
    isOpen: remainingMs === 0,
    remainingMs,
    label: formatPhilippinesTime(opensAt),
    startLabel: formatPhilippinesTime(start),
  }
}

/**
 * Whether the scheduled time out has arrived. Uses an absolute timestamp, so
 * the comparison is correct on devices set to any time zone while the schedule
 * remains anchored to Philippine Standard Time (UTC+8).
 */
export function getTimeOutAccess(group, now = Date.now()) {
  const scheduledAt = getScheduledTimeOut(group)
  if (!scheduledAt) {
    return {
      scheduledAt: null,
      hasSchedule: false,
      isOpen: false,
      remainingMs: 0,
      label: '—',
    }
  }

  const nowMs = now instanceof Date ? now.getTime() : Number(now)
  const remainingMs = Math.max(0, scheduledAt.getTime() - nowMs)

  return {
    scheduledAt,
    hasSchedule: true,
    isOpen: remainingMs === 0,
    remainingMs,
    label: formatPhilippinesTime(scheduledAt),
  }
}

