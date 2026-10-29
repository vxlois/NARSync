import { LATE_AFTER_MINUTES } from '../data/mockData'
import { dateKey, minutesSinceMidnight } from './format'

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
    return record.date === dateKey() ? 'in_progress' : 'incomplete'
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
      description: 'Submit a group photo to start your duty attendance.',
      tone: 'neutral',
    }
  }
  if (!record.timeOut) {
    return {
      key: 'on_duty',
      label: 'On duty',
      description: 'Your time in is recorded. Remember to time out after your duty.',
      tone: 'violet',
    }
  }
  return {
    key: 'completed',
    label: 'Duty complete',
    description: 'Time in and time out are both recorded for this duty day.',
    tone: 'success',
  }
}

export function matchesStatusFilter(record, filter) {
  if (filter === 'all') return true
  const status = getRecordStatus(record)
  if (filter === 'incomplete') return status === 'incomplete' || status === 'in_progress'
  return status === filter
}

/** A frozen, deterministic demo reading. Never presented as live GPS. */
export function buildDemoEvidence({ type, capturedAt, locationAvailable, location }) {
  return {
    type,
    capturedAt,
    available: locationAvailable,
    simulated: true,
    photoLabel: 'Demo group photo',
    locationName: locationAvailable ? location.name : 'Location unavailable',
    address: locationAvailable ? location.address : 'No simulated location was retrieved.',
    coords: locationAvailable ? { ...location.coords } : null,
    accuracy: locationAvailable ? location.accuracy : null,
  }
}
