import { dateKey } from '../utils/format'

/**
 * Prototype-only credentials. There is no authentication server in this phase.
 * The account and all student details below are fictional.
 */
export const DEMO_CREDENTIALS = {
  studentId: '2022-10345',
  password: 'narsync',
}

export const DUTY_START_MINUTES = 7 * 60 // 7:00 AM
export const LATE_AFTER_MINUTES = 7 * 60 + 15 // 15-minute grace period

export const simulatedLocation = {
  name: 'Polangui Rural Health Unit',
  address: 'Barangay Poblacion, Polangui, Albay',
  coords: { lat: 13.2918, lng: 123.4856 },
  accuracy: 12,
}

const dutyDate = dateKey()

export const mockStudent = {
  id: DEMO_CREDENTIALS.studentId,
  name: 'Arjay V. Begino',
  firstName: 'Arjay',
  initials: 'Jay',
  email: 'arjaybegino@bup.edu.ph',
  program: 'Bachelor of Science in Nursing',
  yearLevel: '3rd Year',
  section: 'BSN 3 – Block A'  ,
  university: 'Bicol University Polangui',
  college: 'Bicol University Polangui',
  group: {
    name: 'RLE Group 4',
    code: 'BUP-RLE-04',
    members: 8,
    clinicalArea: 'Community Health Nursing',
  },
  duty: {
    date: dutyDate,
    shift: '7:00 AM – 3:00 PM',
    callTime: '6:45 AM',
    facility: simulatedLocation.name,
    address: simulatedLocation.address,
    clinicalArea: 'Community Health Nursing',
    coordinator: 'Ms. Andrea L. Perez, RN',
    preceptor: 'Mr. Jerome C. Salazar, RN',
  },
}

export const FACE_VIEWS = [
  {
    id: 'front',
    label: 'Front',
    instruction: 'Look straight into the camera with a neutral expression.',
    hint: 'Center your face inside the guide.',
  },
  {
    id: 'left',
    label: 'Left',
    instruction: 'Slowly turn your head to your left.',
    hint: 'Keep your shoulders facing forward.',
  },
  {
    id: 'right',
    label: 'Right',
    instruction: 'Slowly turn your head to your right.',
    hint: 'Keep your face inside the guide.',
  },
  {
    id: 'up',
    label: 'Up',
    instruction: 'Tilt your head slightly upward.',
    hint: 'Keep your eyes on the camera.',
  },
  {
    id: 'down',
    label: 'Down',
    instruction: 'Tilt your head slightly downward.',
    hint: 'Do not cover your face.',
  },
]

export const defaultSettings = {
  reminders: true,
  locationReminder: true,
  haptics: true,
}

export const FACE_VIEW_KEYS = FACE_VIEWS.map((view) => view.id)

function localDate(daysAgo = 0) {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date
}

function at(daysAgo, hours, minutes) {
  const date = localDate(daysAgo)
  date.setHours(hours, minutes, 0, 0)
  return date.toISOString()
}

function evidence(daysAgo, hours, minutes) {
  return {
    at: at(daysAgo, hours, minutes),
    locationName: simulatedLocation.name,
    address: simulatedLocation.address,
    coords: { ...simulatedLocation.coords },
    accuracy: simulatedLocation.accuracy,
    available: true,
    simulated: true,
    photoLabel: 'Demo group photo',
  }
}

function historyRecord({ daysAgo, timeIn, timeOut, note }) {
  const date = dateKey(localDate(daysAgo))
  return {
    id: `demo-att-${date}`,
    date,
    duty: {
      group: mockStudent.group.name,
      clinicalArea: mockStudent.duty.clinicalArea,
      facility: mockStudent.duty.facility,
      shift: mockStudent.duty.shift,
    },
    timeIn: timeIn ? evidence(daysAgo, timeIn[0], timeIn[1]) : null,
    timeOut: timeOut ? evidence(daysAgo, timeOut[0], timeOut[1]) : null,
    note: note || '',
  }
}

/** Sample history. Every record is synthetic and only lives in React state. */
export function buildInitialRecords() {
  const records = [
    historyRecord({ daysAgo: 1, timeIn: [6, 48], timeOut: [15, 6] }),
    historyRecord({ daysAgo: 2, timeIn: [7, 32], timeOut: [15, 12] }),
    historyRecord({ daysAgo: 3, timeIn: [6, 55], timeOut: null }),
    historyRecord({
      daysAgo: 4,
      timeIn: null,
      timeOut: null,
      note: 'No attendance was submitted for this duty day.',
    }),
    historyRecord({ daysAgo: 6, timeIn: [6, 43], timeOut: [15, 2] }),
    historyRecord({ daysAgo: 7, timeIn: [7, 5], timeOut: [15, 18] }),
    historyRecord({ daysAgo: 8, timeIn: [6, 51], timeOut: [15, 4] }),
  ]

  return records.sort((a, b) => (a.date < b.date ? 1 : -1))
}
