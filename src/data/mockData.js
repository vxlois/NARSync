import { dateKey, philippinesDateKey } from '../utils/format'

/**
 * Local credentials. There is no authentication server in this phase.
 */
export const DEMO_CREDENTIALS = {
  studentId: '2023-80007-12309',
  password: 'narsync',
}

export const DUTY_START_MINUTES = 7 * 60 // 7:00 AM
export const LATE_AFTER_MINUTES = 7 * 60 + 15 // 15-minute grace period

export const JBDAPH_NAME =
  'Josefina Belmonte Duran Albay Provincial Hospital (JBDAPH)'
export const ZIGA_HOSPITAL_NAME = 'Dr. Lorenzo P. Ziga Memorial District Hospital'

export const simulatedLocation = {
  name: JBDAPH_NAME,
  address: 'Barangay Tuburan, Ligao City, Albay',
  coords: { lat: 13.2404, lng: 123.5355 },
  accuracy: 12,
}

const dutyDate = philippinesDateKey()

/**
 * Group rosters shown on the attendance details page. Names are fictional demo
 * data and only used to let students see who else is assigned to their group.
 */
const GROUP_MEMBERS = {
  'rle-01': [
    'Lois Lain S. Alcantara',
    'Maria Sofia D. Reyes',
    'John Paolo M. Cruz',
    'Angelica B. Santos',
    'Mark Anthony L. Delgado',
    'Jasmine Kaye P. Flores',
    'Carlo Miguel R. Navarro',
    'Patricia Anne G. Villanueva',
  ],
  'rle-02': [
    'Rafael Luis M. Bautista',
    'Bea Andrea C. Mendoza',
    'Miguel Angelo T. Garcia',
    'Kristine Joy L. Ramos',
    'Joshua Emmanuel P. Torres',
    'Alyssa Marie D. Fernandez',
    'Nico Adrian B. Castillo',
    'Hannah Grace S. Aquino',
  ],
  'rle-03': [
    'Paolo Vincent R. Lim',
    'Charmaine Grace P. Diaz',
    'Jerome Allen M. Pascual',
    'Danica Rose T. Salvador',
    'Kevin Matthew L. Rivera',
    'Marielle Anne C. Domingo',
    'Christian James B. Mercado',
    'Stephanie Mae G. Velasco',
  ],
}

/**
 * The student's three assigned RLE groups. Each group has its own duty schedule
 * and attendance session so the attendance hub can switch between them safely.
 */
export const RLE_GROUPS = [
  {
    id: 'rle-01',
    name: 'RLE Group 1',
    code: 'BUP-RLE-01',
    members: GROUP_MEMBERS['rle-01'].length,
    memberNames: GROUP_MEMBERS['rle-01'],
    clinicalArea: 'Medical-Surgical Nursing',
    coordinator: 'Mr. Bryan Bejer, MAN',
    preceptor: 'Mr. Jerome C. Salazar, RN',
    preceptorRole: 'Clinical Instructor',
    session: {
      date: dutyDate,
      shift: '6:00 AM – 2:00 PM',
      callTime: '5:45 AM',
      facility: JBDAPH_NAME,
      address: 'Barangay Tuburan, Ligao City, Albay',
      status: 'Scheduled',
      valid: true,
    },
  },
  {
    id: 'rle-02',
    name: 'RLE Group 2',
    code: 'BUP-RLE-02',
    members: GROUP_MEMBERS['rle-02'].length,
    memberNames: GROUP_MEMBERS['rle-02'],
    clinicalArea: 'Maternal and Child Nursing',
    coordinator: 'Mr. Bryan Bejer, MAN',
    preceptor: 'Ms. Charlene D. Aquino, RN',
    preceptorRole: 'Clinical Instructor',
    session: {
      date: dutyDate,
      shift: '7:00 AM – 3:00 PM',
      callTime: '6:45 AM',
      facility: ZIGA_HOSPITAL_NAME,
      address: 'Barangay San Juan, Tabaco City, Albay',
      status: 'Scheduled',
      valid: true,
    },
  },
  {
    id: 'rle-03',
    name: 'RLE Group 3',
    code: 'BUP-RLE-03',
    members: GROUP_MEMBERS['rle-03'].length,
    memberNames: GROUP_MEMBERS['rle-03'],
    clinicalArea: 'Fundamentals of Nursing',
    coordinator: 'Mr. Bryan Bejer, MAN',
    preceptor: 'Mr. Dennis R. Baldemor, RN',
    preceptorRole: 'Clinical Instructor',
    session: {
      date: dutyDate,
      shift: 'To be announced',
      callTime: 'To be announced',
      facility: JBDAPH_NAME,
      address: 'Barangay Tuburan, Ligao City, Albay',
      status: 'Schedule planning',
      valid: false,
    },
  },
]

export const STUDENT_GROUP_IDS = RLE_GROUPS.map((group) => group.id)
export const STUDENT_GROUP_ID = STUDENT_GROUP_IDS[0]

const assignedGroups = RLE_GROUPS.filter((group) =>
  STUDENT_GROUP_IDS.includes(group.id),
)
const assignedGroup =
  assignedGroups.find((group) => group.id === STUDENT_GROUP_ID) ?? assignedGroups[0]

export const mockStudent = {
  id: DEMO_CREDENTIALS.studentId,
  name: 'Lois Lain S. Alcantara',
  initials: 'LA',
  email: 'llsa2023-8007-12309@bicol-u.edu.ph',
  program: 'Bachelor of Science in Nursing',
  yearLevel: 'Level 4',
  block: 'Block B',
  section: 'BSN 4 – Block B',
  groups: assignedGroups.map((group) => ({
    id: group.id,
    name: group.name,
    code: group.code,
    members: group.members,
    memberNames: group.memberNames,
    clinicalArea: group.clinicalArea,
    session: group.session,
  })),
  group: {
    id: assignedGroup.id,
    name: assignedGroup.name,
    code: assignedGroup.code,
    members: assignedGroup.members,
    memberNames: assignedGroup.memberNames,
    clinicalArea: assignedGroup.clinicalArea,
  },
  duty: {
    date: assignedGroup.session.date,
    shift: assignedGroup.session.shift,
    callTime: assignedGroup.session.callTime,
    facility: assignedGroup.session.facility,
    address: assignedGroup.session.address,
    clinicalArea: assignedGroup.clinicalArea,
    coordinator: assignedGroup.coordinator,
    preceptor: assignedGroup.preceptor,
    preceptorRole: assignedGroup.preceptorRole,
  },
}

export function getAssignedGroup(groupId) {
  return mockStudent.groups.find((group) => group.id === groupId) ?? null
}

export function getGroupLocation(group) {
  return {
    name: group?.session?.facility || simulatedLocation.name,
    address: group?.session?.address || simulatedLocation.address,
    coords: { ...simulatedLocation.coords },
    accuracy: simulatedLocation.accuracy,
  }
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
    photoLabel: 'Individual photo',
  }
}

function historyRecord({ daysAgo, timeIn, timeOut, note }) {
  const date = dateKey(localDate(daysAgo))
  return {
    id: `att-${date}`,
    date,
    groupId: mockStudent.group.id,
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

function completedGroupRecord(group, daysAgo) {
  const date = dateKey(localDate(daysAgo))
  return {
    id: `att-${date}-${group.id}`,
    date,
    groupId: group.id,
    duty: {
      group: group.name,
      clinicalArea: group.clinicalArea,
      facility: group.session.facility,
      shift: group.session.shift,
    },
    timeIn: {
      ...evidence(daysAgo, 7, 8),
      locationName: group.session.facility,
      address: group.session.address,
    },
    timeOut: {
      ...evidence(daysAgo, 15, 4),
      locationName: group.session.facility,
      address: group.session.address,
    },
    note: '',
  }
}

/** Initial history. Records only live in React state. */
export function buildInitialRecords() {
  const completedGroup = assignedGroups.find((group) => group.id === 'rle-02')
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

  if (completedGroup) {
    records.push(completedGroupRecord(completedGroup, 0))
  }

  return records.sort((a, b) => (a.date < b.date ? 1 : -1))
}
