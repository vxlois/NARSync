import { dateKey, minutesSinceMidnight, parseDateKey } from '../utils/format'

/** Fictional staff accounts used to preview role-based access. */
export const ROLE_DEFINITIONS = {
  coordinator: {
    id: 'coordinator',
    label: 'RLE Coordinator',
    shortLabel: 'Coordinator',
    name: 'Ms. Andrea L. Perez, RN',
    email: 'andrea.perez@bup.edu.ph',
    initials: 'AP',
    scope: 'Full management access',
  },
  departmentHead: {
    id: 'departmentHead',
    label: 'Department Head',
    shortLabel: 'Department Head',
    name: 'Dr. Ramon B. Villafuerte, RN',
    email: 'ramon.villafuerte@bup.edu.ph',
    initials: 'RV',
    scope: 'Oversight and view-only access',
  },
}

export const INSTRUCTORS = [
  'Ms. Andrea L. Perez, RN',
  'Mr. Jerome C. Salazar, RN',
  'Ms. Charlene D. Aquino, RN',
  'Mr. Dennis R. Baldemor, RN',
]

export const YEAR_LEVELS = ['2nd Year', '3rd Year', '4th Year']

const GROUP_LOCATION = {
  'grp-01': 'loc-rhu',
  'grp-02': 'loc-libon',
  'grp-03': 'loc-oas',
}

const STUDENT_SEED = [
  {
    id: '2022-10012',
    name: 'Maria Sofia B. Dela Cruz',
    yearLevel: '3rd Year',
    section: 'BSN 3 – Block A',
    groupId: 'grp-01',
    faceRegistered: true,
    faceCaptureStarted: true,
    accountStatus: 'Active',
  },
  {
    id: '2022-10018',
    name: 'John Paul R. Mercado',
    yearLevel: '3rd Year',
    section: 'BSN 3 – Block A',
    groupId: 'grp-01',
    faceRegistered: true,
    faceCaptureStarted: true,
    accountStatus: 'Active',
  },
  {
    id: '2022-10024',
    name: 'Althea Mae C. Rivera',
    yearLevel: '3rd Year',
    section: 'BSN 3 – Block A',
    groupId: 'grp-01',
    faceRegistered: true,
    faceCaptureStarted: true,
    accountStatus: 'Active',
  },
  {
    id: '2022-10031',
    name: 'Joshua D. Villanueva',
    yearLevel: '3rd Year',
    section: 'BSN 3 – Block A',
    groupId: 'grp-01',
    faceRegistered: true,
    faceCaptureStarted: true,
    accountStatus: 'Active',
  },
  {
    id: '2022-10037',
    name: 'Nicole Anne P. Sarmiento',
    yearLevel: '3rd Year',
    section: 'BSN 3 – Block A',
    groupId: 'grp-01',
    faceRegistered: true,
    faceCaptureStarted: true,
    accountStatus: 'Active',
  },
  {
    id: '2022-10042',
    name: 'Christian Lloyd M. Ocampo',
    yearLevel: '3rd Year',
    section: 'BSN 3 – Block A',
    groupId: 'grp-01',
    faceRegistered: true,
    faceCaptureStarted: true,
    accountStatus: 'Active',
  },
  {
    id: '2022-10048',
    name: 'Patricia Joy L. Alcantara',
    yearLevel: '3rd Year',
    section: 'BSN 3 – Block A',
    groupId: 'grp-01',
    faceRegistered: true,
    faceCaptureStarted: true,
    accountStatus: 'Active',
  },
  {
    id: '2022-10053',
    name: 'Mark Angelo T. Reyes',
    yearLevel: '3rd Year',
    section: 'BSN 3 – Block A',
    groupId: 'grp-01',
    faceRegistered: true,
    faceCaptureStarted: true,
    accountStatus: 'Active',
  },
  {
    id: '2022-10059',
    name: 'Hannah Grace V. Salcedo',
    yearLevel: '3rd Year',
    section: 'BSN 3 – Block A',
    groupId: 'grp-01',
    faceRegistered: false,
    faceCaptureStarted: true,
    accountStatus: 'Active',
  },
  {
    id: '2022-10064',
    name: 'Kevin Matthew A. Bautista',
    yearLevel: '3rd Year',
    section: 'BSN 3 – Block A',
    groupId: 'grp-01',
    faceRegistered: false,
    faceCaptureStarted: false,
    accountStatus: 'Active',
  },
  {
    id: '2022-10071',
    name: 'Angela Marie S. Nuñez',
    yearLevel: '3rd Year',
    section: 'BSN 3 – Block B',
    groupId: 'grp-02',
    faceRegistered: true,
    faceCaptureStarted: true,
    accountStatus: 'Active',
  },
  {
    id: '2022-10076',
    name: 'Bryan James L. Figueroa',
    yearLevel: '3rd Year',
    section: 'BSN 3 – Block B',
    groupId: 'grp-02',
    faceRegistered: true,
    faceCaptureStarted: true,
    accountStatus: 'Active',
  },
  {
    id: '2022-10082',
    name: 'Camille Rose T. Malabanan',
    yearLevel: '3rd Year',
    section: 'BSN 3 – Block B',
    groupId: 'grp-02',
    faceRegistered: true,
    faceCaptureStarted: true,
    accountStatus: 'Active',
  },
  {
    id: '2022-10087',
    name: 'Daniel Luis M. Perez',
    yearLevel: '3rd Year',
    section: 'BSN 3 – Block B',
    groupId: 'grp-02',
    faceRegistered: true,
    faceCaptureStarted: true,
    accountStatus: 'Active',
  },
  {
    id: '2022-10093',
    name: 'Erica Jane P. Toledo',
    yearLevel: '3rd Year',
    section: 'BSN 3 – Block B',
    groupId: 'grp-02',
    faceRegistered: true,
    faceCaptureStarted: true,
    accountStatus: 'Active',
  },
  {
    id: '2022-10098',
    name: 'Franz Xavier C. Lagman',
    yearLevel: '3rd Year',
    section: 'BSN 3 – Block B',
    groupId: 'grp-02',
    faceRegistered: false,
    faceCaptureStarted: true,
    accountStatus: 'Active',
  },
  {
    id: '2023-10104',
    name: 'Gia Samantha R. Herrera',
    yearLevel: '3rd Year',
    section: 'BSN 3 – Block B',
    groupId: 'grp-02',
    faceRegistered: false,
    faceCaptureStarted: true,
    accountStatus: 'Active',
  },
  {
    id: '2023-10112',
    name: 'Harold Miguel B. Quinto',
    yearLevel: '3rd Year',
    section: 'BSN 3 – Block B',
    groupId: 'grp-02',
    faceRegistered: false,
    faceCaptureStarted: false,
    accountStatus: 'Inactive',
  },
  {
    id: '2022-10118',
    name: 'Isabela Faye M. Rosales',
    yearLevel: '2nd Year',
    section: 'BSN 2 – Block A',
    groupId: 'grp-03',
    faceRegistered: true,
    faceCaptureStarted: true,
    accountStatus: 'Active',
  },
  {
    id: '2022-10124',
    name: 'Jerome Samuel T. Dizon',
    yearLevel: '2nd Year',
    section: 'BSN 2 – Block A',
    groupId: 'grp-03',
    faceRegistered: true,
    faceCaptureStarted: true,
    accountStatus: 'Active',
  },
  {
    id: '2022-10129',
    name: 'Kyla Marie L. Estrada',
    yearLevel: '2nd Year',
    section: 'BSN 2 – Block A',
    groupId: 'grp-03',
    faceRegistered: true,
    faceCaptureStarted: true,
    accountStatus: 'Active',
  },
  {
    id: '2022-10135',
    name: 'Lorenzo Rafael P. Gomez',
    yearLevel: '2nd Year',
    section: 'BSN 2 – Block A',
    groupId: 'grp-03',
    faceRegistered: true,
    faceCaptureStarted: true,
    accountStatus: 'Active',
  },
  {
    id: '2022-10141',
    name: 'Micaela Joy C. Navarro',
    yearLevel: '2nd Year',
    section: 'BSN 2 – Block A',
    groupId: 'grp-03',
    faceRegistered: true,
    faceCaptureStarted: true,
    accountStatus: 'Active',
  },
  {
    id: '2022-10147',
    name: 'Nathan Isaiah V. Cruz',
    yearLevel: '2nd Year',
    section: 'BSN 2 – Block A',
    groupId: 'grp-03',
    faceRegistered: true,
    faceCaptureStarted: true,
    accountStatus: 'Active',
  },
  {
    id: '2023-10153',
    name: 'Olivia Dominique R. Panganiban',
    yearLevel: '2nd Year',
    section: 'BSN 2 – Block B',
    groupId: null,
    faceRegistered: false,
    faceCaptureStarted: false,
    accountStatus: 'Active',
  },
  {
    id: '2023-10158',
    name: 'Paolo Enrique M. Sison',
    yearLevel: '2nd Year',
    section: 'BSN 2 – Block B',
    groupId: null,
    faceRegistered: false,
    faceCaptureStarted: false,
    accountStatus: 'Inactive',
  },
]

const GROUP_SEED = [
  {
    id: 'grp-01',
    name: 'RLE Group 1',
    yearLevel: '3rd Year',
    block: 'Block A',
    clinicalArea: 'Community Health Nursing',
    instructor: 'Ms. Andrea L. Perez, RN',
    status: 'Active',
    memberIds: STUDENT_SEED.filter((student) => student.groupId === 'grp-01').map(
      (student) => student.id,
    ),
    notes: 'Community health rotation at the Polangui Rural Health Unit.',
  },
  {
    id: 'grp-02',
    name: 'RLE Group 2',
    yearLevel: '3rd Year',
    block: 'Block B',
    clinicalArea: 'Maternal and Child Nursing',
    instructor: 'Mr. Jerome C. Salazar, RN',
    status: 'Active',
    memberIds: STUDENT_SEED.filter((student) => student.groupId === 'grp-02').map(
      (student) => student.id,
    ),
    notes: 'Maternal and child health rotation at Libon Birthing Home.',
  },
  {
    id: 'grp-03',
    name: 'RLE Group 3',
    yearLevel: '2nd Year',
    block: 'Block A',
    clinicalArea: 'Fundamentals of Nursing',
    instructor: 'Ms. Charlene D. Aquino, RN',
    status: 'Active',
    memberIds: STUDENT_SEED.filter((student) => student.groupId === 'grp-03').map(
      (student) => student.id,
    ),
    notes: 'Foundational clinical rotation at the Oas Community Health Center.',
  },
]

const LOCATION_SEED = [
  {
    id: 'loc-rhu',
    name: 'Polangui Rural Health Unit',
    address: 'Barangay Poblacion, Polangui, Albay',
    description:
      'Municipal rural health unit used for community health nursing rotations. The main entrance is on the east side of the compound.',
    coords: { lat: 13.2918, lng: 123.4856 },
    radius: 120,
    status: 'Active',
    contact: '(052) 555-0148',
  },
  {
    id: 'loc-libon',
    name: 'Libon Birthing Home',
    address: 'Barangay San Jose, Libon, Albay',
    description:
      'Birthing home and maternal care facility for supervised maternal and child nursing duties.',
    coords: { lat: 13.2993, lng: 123.4374 },
    radius: 100,
    status: 'Active',
    contact: '(052) 555-0182',
  },
  {
    id: 'loc-oas',
    name: 'Oas Community Health Center',
    address: 'Barangay Iraya, Oas, Albay',
    description:
      'Community health center with an outpatient clinic, prenatal room, and a small demonstration area.',
    coords: { lat: 13.2554, lng: 123.3956 },
    radius: 150,
    status: 'Active',
    contact: '(052) 555-0219',
  },
  {
    id: 'loc-ligao',
    name: 'Ligao City Health Office',
    address: 'Barangay Dunao, Ligao City, Albay',
    description:
      'City health office reserved for scheduled outreach activities. Geofence is configured around the annex building.',
    coords: { lat: 13.2404, lng: 123.5355 },
    radius: 100,
    status: 'Inactive',
    contact: '(052) 555-0275',
  },
  {
    id: 'loc-skills',
    name: 'BU Polangui Clinical Skills Lab',
    address: 'Bicol University Polangui',
    description:
      'On-campus simulation laboratory used for skills validation and small-group return demonstrations.',
    coords: { lat: 13.2911, lng: 123.492 },
    radius: 75,
    status: 'Active',
    contact: 'Local 204',
  },
]

export const SETTINGS_SEED = {
  gracePeriod: 15,
  requireGeofence: true,
  autoFlagLocation: true,
  autoFlagFaceMatch: true,
  faceMatchThreshold: 85,
  notifyFlags: true,
  notifyRegistration: true,
  notifySchedules: false,
  emailDigest: 'Daily',
}

function localDate(offset = 0) {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() + offset)
  return date
}

export function shiftDate(key, days) {
  const date = parseDateKey(key)
  date.setDate(date.getDate() + days)
  return dateKey(date)
}

function isoAt(offset, hours, minutes) {
  const date = localDate(offset)
  date.setHours(hours, minutes, 0, 0)
  return date.toISOString()
}

function nameParts(name) {
  return name
    .replace(/\b[A-Z]\.\s?/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
}

export function getInitials(name) {
  const parts = nameParts(name)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function emailFor(name) {
  const parts = nameParts(name)
  return `${parts[0].toLowerCase()}.${parts[parts.length - 1].toLowerCase()}@bup.edu.ph`
}

function phoneFor(index) {
  const middle = String(2000000 + index * 13743).slice(0, 3)
  const last = String(1000 + index * 271).slice(-4)
  return `+63 917 ${middle} ${last}`
}

function buildStudents() {
  return STUDENT_SEED.map((student, index) => ({
    ...student,
    email: emailFor(student.name),
    phone: phoneFor(index),
    address:
      index % 3 === 0
        ? 'Barangay Poblacion, Polangui, Albay'
        : index % 3 === 1
          ? 'Barangay Balinad, Polangui, Albay'
          : 'Barangay Basud, Polangui, Albay',
  }))
}

function scheduleRecord({
  id,
  group,
  locationId,
  dateOffset,
  date,
  startTime,
  endTime,
  status,
  instructor = group.instructor,
  notes = '',
  createdAtOffset = -4,
}) {
  return {
    id,
    groupId: group.id,
    locationId,
    date: date || dateKey(localDate(dateOffset)),
    startTime,
    endTime,
    instructor,
    notes,
    status,
    createdAt: isoAt(createdAtOffset, 9, 15),
  }
}

function buildSchedules(groups) {
  const groupById = Object.fromEntries(groups.map((group) => [group.id, group]))
  const historicalPlan = [
    { offset: 6, groups: ['grp-03', 'grp-02'] },
    { offset: 5, groups: ['grp-02'] },
    { offset: 4, groups: ['grp-01'] },
    { offset: 3, groups: ['grp-02', 'grp-03'] },
    { offset: 2, groups: ['grp-03', 'grp-01'] },
    { offset: 1, groups: ['grp-01', 'grp-02'] },
  ]

  const schedules = []

  historicalPlan.forEach((plan) => {
    plan.groups.forEach((groupId) => {
      const group = groupById[groupId]
      schedules.push(
        scheduleRecord({
          id: `sch-h${plan.offset}-${groupId}`,
          group,
          locationId: GROUP_LOCATION[groupId],
          dateOffset: plan.offset,
          startTime: groupId === 'grp-03' ? '08:00' : '07:00',
          endTime: groupId === 'grp-03' ? '16:00' : '15:00',
          status: 'Completed',
          createdAtOffset: plan.offset - 5,
        }),
      )
    })
  })

  schedules.push(
    scheduleRecord({
      id: 'sch-today-01',
      group: groupById['grp-01'],
      locationId: 'loc-rhu',
      dateOffset: 0,
      startTime: '07:00',
      endTime: '15:00',
      status: 'Ready',
      createdAtOffset: -4,
    }),
    scheduleRecord({
      id: 'sch-today-02',
      group: groupById['grp-02'],
      locationId: 'loc-libon',
      dateOffset: 0,
      startTime: '07:00',
      endTime: '15:00',
      status: 'Ready',
      createdAtOffset: -4,
    }),
    scheduleRecord({
      id: 'sch-up-01',
      group: groupById['grp-03'],
      locationId: 'loc-oas',
      dateOffset: 1,
      startTime: '08:00',
      endTime: '16:00',
      status: 'Ready',
      createdAtOffset: -2,
    }),
    scheduleRecord({
      id: 'sch-up-02',
      group: groupById['grp-01'],
      locationId: 'loc-skills',
      dateOffset: 2,
      startTime: '07:00',
      endTime: '12:00',
      status: 'Ready',
      instructor: 'Ms. Andrea L. Perez, RN',
      notes: 'Return demonstration and skills validation.',
      createdAtOffset: -1,
    }),
    scheduleRecord({
      id: 'sch-up-03',
      group: groupById['grp-02'],
      locationId: 'loc-oas',
      dateOffset: 3,
      startTime: '07:00',
      endTime: '15:00',
      status: 'Ready',
      createdAtOffset: -1,
    }),
    {
      ...scheduleRecord({
        id: 'sch-draft-01',
        group: groupById['grp-03'],
        locationId: '',
        dateOffset: 4,
        startTime: '08:00',
        endTime: '',
        status: 'Draft',
        notes: 'Awaiting confirmation from the health center.',
        createdAtOffset: 0,
      }),
    },
    scheduleRecord({
      id: 'sch-draft-02',
      group: groupById['grp-01'],
      locationId: 'loc-ligao',
      dateOffset: 5,
      startTime: '07:00',
      endTime: '15:00',
      status: 'Draft',
      notes: 'Draft awaiting final clinical instructor assignment.',
      createdAtOffset: 0,
    }),
  )

  return schedules
}

const TODAY_OUTCOMES = {
  'grp-01': [
    'completed',
    'completed',
    'late',
    'completed',
    'incomplete',
    'flagged',
    'completed',
    'completed',
    'incomplete',
    'absent',
  ],
  'grp-02': [
    'completed',
    'late',
    'completed',
    'completed',
    'flagged',
    'completed',
    'absent',
    'incomplete',
  ],
}

const PAST_OUTCOMES = [
  'completed',
  'completed',
  'completed',
  'late',
  'completed',
  'incomplete',
  'completed',
  'flagged',
  'completed',
  'absent',
]

function flagFor({ offset, outcome, memberIndex, student, schedule, location, locations }) {
  const isOpen = offset === 0
  const isFaceIssue = (memberIndex + offset) % 2 === 0
  const alternate = locations.find((item) => item.id !== location.id) || location

  return {
    id: `flag-${schedule.date}-${student.id}`,
    reason: isFaceIssue ? 'Face match below threshold' : 'Location outside geofence',
    detail: isFaceIssue
      ? `The group capture produced a ${((68 + memberIndex) % 15 + 70).toFixed(1)}% face match for this student. Manual verification is required before the record is accepted.`
      : `The submission coordinates were approximately ${180 + memberIndex * 23} m from ${location.name}. The nearest configured location was ${alternate.name}.`,
    status: isOpen ? 'Open' : 'Resolved',
    raisedAt: isoAt(offset, 15, 22),
    raisedBy: isFaceIssue ? 'Facial verification check' : 'Geofence check',
    resolvedAt: isOpen ? null : isoAt(offset - 1, 9, 40),
    resolvedBy: isOpen ? null : 'Ms. Andrea L. Perez, RN',
    resolution: isOpen
      ? ''
      : isFaceIssue
        ? 'Reviewed the group capture with the clinical instructor. Identity confirmed.'
        : 'Clinical instructor confirmed an alternate entrance within the duty area.',
    outcome,
  }
}

function buildRecord({
  student,
  group,
  schedule,
  outcome,
  offset,
  memberIndex,
  location,
  locations,
}) {
  let timeIn = null
  let timeOut = null
  let flag = null

  const baseMinute = 42 + ((memberIndex * 3) % 16)

  if (outcome === 'completed') {
    timeIn = isoAt(offset, 6, baseMinute)
    timeOut = isoAt(offset, 15, 2 + ((memberIndex * 2) % 13))
  } else if (outcome === 'late') {
    timeIn = isoAt(offset, 7, 19 + (memberIndex % 11))
    timeOut = isoAt(offset, 15, 8 + (memberIndex % 10))
  } else if (outcome === 'incomplete') {
    timeIn = isoAt(offset, 6, 49 + (memberIndex % 12))
  } else if (outcome === 'flagged') {
    timeIn = isoAt(offset, 6, 47 + (memberIndex % 10))
    if (offset === 0 && memberIndex % 2 === 0) {
      timeOut = isoAt(offset, 15, 5)
    }
    flag = flagFor({
      offset,
      outcome,
      memberIndex,
      student,
      schedule,
      location,
      locations,
    })
  }

  if (!timeIn && outcome !== 'absent') {
    timeIn = isoAt(offset, 6, baseMinute)
  }

  return {
    id: `att-${schedule.date}-${student.id}`,
    studentId: student.id,
    groupId: group.id,
    scheduleId: schedule.id,
    locationId: location.id,
    date: schedule.date,
    timeIn,
    timeOut,
    submittedAt: timeOut || timeIn || isoAt(offset, 15, 30),
    method: 'Group facial capture',
    device: 'Student mobile · Android 14',
    faceMatch: flag?.reason === 'Face match below threshold'
      ? 72.4 + (memberIndex % 4)
      : 96.2 + ((memberIndex % 5) * 0.5),
    flag,
    note: outcome === 'late' ? 'Arrived after the 7:15 AM grace period.' : '',
  }
}

function buildAttendance({ students, groups, schedules, locations }) {
  const studentById = Object.fromEntries(students.map((student) => [student.id, student]))
  const locationById = Object.fromEntries(locations.map((location) => [location.id, location]))
  const records = []

  const todaySchedules = schedules.filter((schedule) => schedule.date === dateKey())
  todaySchedules.forEach((schedule) => {
    const group = groups.find((item) => item.id === schedule.groupId)
    const location = locationById[schedule.locationId] || locations[0]
    const outcomes = TODAY_OUTCOMES[group.id] || []

    group.memberIds.forEach((studentId, memberIndex) => {
      const student = studentById[studentId]
      const outcome = outcomes[memberIndex] || 'completed'
      if (!student || outcome === 'absent') return
      records.push(
        buildRecord({
          student,
          group,
          schedule,
          outcome,
          offset: 0,
          memberIndex,
          location,
          locations,
        }),
      )
    })
  })

  schedules
    .filter((schedule) => schedule.status === 'Completed')
    .forEach((schedule) => {
      const group = groups.find((item) => item.id === schedule.groupId)
      const location = locationById[schedule.locationId] || locations[0]
      const offset = Math.round(
        (localDate(0).getTime() - parseDateKey(schedule.date).getTime()) / 86400000,
      )
      const groupIndex = groups.findIndex((item) => item.id === group.id)

      group.memberIds.forEach((studentId, memberIndex) => {
        const student = studentById[studentId]
        if (!student) return
        const outcome = PAST_OUTCOMES[(memberIndex + offset + groupIndex) % PAST_OUTCOMES.length]
        if (outcome === 'absent') return
        records.push(
          buildRecord({
            student,
            group,
            schedule,
            outcome,
            offset,
            memberIndex,
            location,
            locations,
          }),
        )
      })
    })

  return records.sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1))
}

export function buildInitialAdminData() {
  const students = buildStudents()
  const groups = GROUP_SEED.map((group) => ({ ...group, memberIds: [...group.memberIds] }))
  const locations = LOCATION_SEED.map((location) => ({
    ...location,
    coords: { ...location.coords },
  }))
  const schedules = buildSchedules(groups)
  const records = buildAttendance({ students, groups, schedules, locations })

  const openFlags = records.filter((record) => record.flag?.status === 'Open')
  const groupTwo = groups.find((group) => group.id === 'grp-02')
  const groupTwoRegistered = students.filter(
    (student) => student.groupId === 'grp-02' && student.faceRegistered,
  ).length

  return {
    students,
    groups,
    schedules,
    locations,
    records,
    settings: { ...SETTINGS_SEED },
    notifications: [
      {
        id: 'ntf-flags',
        title: `${openFlags.length} records flagged for review`,
        body: 'Today’s group captures need coordinator verification.',
        at: isoAt(0, 15, 26),
        read: false,
        href: '/admin/flagged',
        tone: 'danger',
      },
      {
        id: 'ntf-registration',
        title: `RLE Group 2 registration at ${Math.round((groupTwoRegistered / groupTwo.memberIds.length) * 100)}%`,
        body: `${groupTwo.memberIds.length - groupTwoRegistered} members still need to register their faces.`,
        at: isoAt(0, 11, 8),
        read: false,
        href: '/admin/groups/grp-02',
        tone: 'warning',
      },
      {
        id: 'ntf-schedule',
        title: 'Duty schedule needs attention',
        body: 'RLE Group 3 · Oas Community Health Center is missing a location and end time.',
        at: isoAt(-1, 16, 42),
        read: false,
        href: '/admin/schedules',
        tone: 'warning',
      },
      {
        id: 'ntf-report',
        title: 'Weekly attendance report is ready',
        body: 'The completion summary for the current rotation can now be reviewed.',
        at: isoAt(-2, 9, 5),
        read: true,
        href: '/admin/reports',
        tone: 'default',
      },
    ],
  }
}

export function getStudentById(students, studentId) {
  return students.find((student) => student.id === studentId) || null
}

export function getGroupById(groups, groupId) {
  return groups.find((group) => group.id === groupId) || null
}

export function getLocationById(locations, locationId) {
  return locations.find((location) => location.id === locationId) || null
}

export function getScheduleById(schedules, scheduleId) {
  return schedules.find((schedule) => schedule.id === scheduleId) || null
}

export function getFaceStatus(student) {
  if (!student?.groupId) {
    return { key: 'not-eligible', label: 'Not eligible', tone: 'neutral' }
  }
  if (student.faceRegistered) {
    return { key: 'registered', label: 'Registered', tone: 'success' }
  }
  if (student.faceCaptureStarted) {
    return { key: 'pending', label: 'Pending capture', tone: 'warning' }
  }
  return { key: 'not-started', label: 'Not started', tone: 'neutral' }
}

export function getGroupStats(group, students) {
  const members = students.filter((student) => group?.memberIds.includes(student.id))
  const registered = members.filter((student) => student.faceRegistered).length
  const pending = members.filter(
    (student) => !student.faceRegistered && student.faceCaptureStarted,
  ).length
  const notStarted = members.length - registered - pending
  return {
    members,
    total: members.length,
    registered,
    pending,
    notStarted,
    percent: members.length ? Math.round((registered / members.length) * 100) : 0,
  }
}

export function isScheduleComplete(schedule) {
  return Boolean(
    schedule?.groupId &&
      schedule?.locationId &&
      schedule?.date &&
      schedule?.startTime &&
      schedule?.endTime,
  )
}

export function getScheduleStatus(schedule) {
  if (!isScheduleComplete(schedule)) {
    return {
      key: 'incomplete',
      label: 'Incomplete',
      tone: 'danger',
      attendanceReady: false,
    }
  }

  const map = {
    Draft: { key: 'draft', label: 'Draft', tone: 'warning', attendanceReady: false },
    Ready: { key: 'ready', label: 'Ready', tone: 'success', attendanceReady: true },
    Completed: {
      key: 'completed',
      label: 'Completed',
      tone: 'neutral',
      attendanceReady: false,
    },
    Cancelled: {
      key: 'cancelled',
      label: 'Cancelled',
      tone: 'danger',
      attendanceReady: false,
    },
  }

  return map[schedule.status] || map.Draft
}

export function scheduleWarnings(schedule) {
  const warnings = []
  if (!schedule?.groupId) warnings.push('Assign an RLE group.')
  if (!schedule?.locationId) warnings.push('Assign a clinical location.')
  if (!schedule?.date) warnings.push('Set a duty date.')
  if (!schedule?.startTime) warnings.push('Set a scheduled start time.')
  if (!schedule?.endTime) warnings.push('Set a scheduled end time.')
  if (schedule?.startTime && schedule?.endTime && schedule.endTime <= schedule.startTime) {
    warnings.push('End time must be later than the start time.')
  }
  return warnings
}

export function getRecordStatus(record, today = dateKey()) {
  if (record.flag?.status === 'Open') {
    return { key: 'flagged', label: 'Flagged', tone: 'danger' }
  }
  if (!record.timeIn) {
    return { key: 'absent', label: 'Absent', tone: 'danger' }
  }
  if (!record.timeOut) {
    return record.date === today
      ? { key: 'timed-in', label: 'Timed in', tone: 'info' }
      : { key: 'missing-out', label: 'Missing time out', tone: 'warning' }
  }
  if (minutesSinceMidnight(record.timeIn) > 7 * 60 + 15) {
    return { key: 'late', label: 'Late', tone: 'warning' }
  }
  return { key: 'completed', label: 'Completed', tone: 'success' }
}

export function getScheduledStudentsForDate({
  schedules,
  students,
  date,
  groupId = 'all',
  yearLevel = 'all',
  locationId = 'all',
}) {
  const scheduledIds = new Set()

  schedules
    .filter((schedule) => {
      const status = getScheduleStatus(schedule)
      if (schedule.date !== date) return false
      if (!['ready', 'completed'].includes(status.key)) return false
      if (groupId !== 'all' && schedule.groupId !== groupId) return false
      if (locationId !== 'all' && schedule.locationId !== locationId) return false
      return true
    })
    .forEach((schedule) => {
      students
        .filter((student) => student.groupId === schedule.groupId)
        .filter((student) => yearLevel === 'all' || student.yearLevel === yearLevel)
        .forEach((student) => scheduledIds.add(student.id))
    })

  return scheduledIds
}
