import { useCallback, useMemo, useState } from 'react'
import {
  buildInitialRecords,
  defaultSettings,
  DEMO_CREDENTIALS,
  FACE_VIEW_KEYS,
  mockStudent,
} from '../data/mockData'
import {
  formatPhilippinesTime,
  getScheduledTimeOut,
  getTimeInAccess,
} from '../utils/attendance'
import { philippinesDateKey } from '../utils/format'
import { AppContext } from './AppContext'

const emptyFaceViews = () =>
  FACE_VIEW_KEYS.reduce((views, key) => {
    views[key] = false
    return views
  }, {})

export default function AppProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [records, setRecords] = useState(buildInitialRecords)
  const [faceViews, setFaceViews] = useState(emptyFaceViews)
  const [faceCompletedAt, setFaceCompletedAt] = useState(null)
  const [settings, setSettings] = useState(defaultSettings)
  const [draft, setDraft] = useState(null)

  const today = philippinesDateKey()
  const getTodayRecord = useCallback(
    (groupId = mockStudent.group.id) =>
      records.find(
        (record) =>
          record.date === today &&
          (record.groupId || mockStudent.group.id) === groupId,
      ) ?? null,
    [records, today],
  )
  const todayRecord = useMemo(
    () => getTodayRecord(mockStudent.group.id),
    [getTodayRecord],
  )

  const faceCapturedCount = useMemo(
    () => FACE_VIEW_KEYS.filter((key) => faceViews[key]).length,
    [faceViews],
  )
  const faceCompleted = Boolean(faceCompletedAt)

  const login = useCallback(({ studentId, password }) => {
    const id = studentId.trim()
    if (id !== DEMO_CREDENTIALS.studentId || password !== DEMO_CREDENTIALS.password) {
      throw new Error('The student ID or password is incorrect.')
    }
    setIsAuthenticated(true)
  }, [])

  const logout = useCallback(() => {
    setIsAuthenticated(false)
    setDraft(null)
  }, [])

  const captureFaceView = useCallback((viewId) => {
    if (!FACE_VIEW_KEYS.includes(viewId)) return
    setFaceViews((current) => ({ ...current, [viewId]: true }))
  }, [])

  const completeFaceRegistration = useCallback(() => {
    const allCaptured = FACE_VIEW_KEYS.every((key) => faceViews[key])
    if (!allCaptured) {
      throw new Error('Capture all five facial views before completing registration.')
    }
    const completedAt = new Date().toISOString()
    setFaceCompletedAt(completedAt)
    return completedAt
  }, [faceViews])

  const resetFaceRegistration = useCallback(() => {
    setFaceViews(emptyFaceViews())
    setFaceCompletedAt(null)
  }, [])

  const submitAttendance = useCallback(
    ({ type, evidence, groupId = mockStudent.group.id }) => {
      if (type !== 'time-in' && type !== 'time-out') {
        throw new Error('Unknown attendance type.')
      }

      const group = mockStudent.groups.find((item) => item.id === groupId)
      if (!group) {
        throw new Error(
          'Attendance can only be submitted for your assigned RLE groups.',
        )
      }
      if (!group.session.valid) {
        throw new Error(
          'Your group does not have a published duty schedule for today yet.',
        )
      }
      if (!faceCompleted) {
        throw new Error(
          'Please finish your facial registration before taking attendance.',
        )
      }

      const groupRecord = getTodayRecord(group.id)

      if (type === 'time-in') {
        if (groupRecord?.timeIn) {
          throw new Error('You have already timed in for this duty day.')
        }

        // Backend enforcement: Time In opens 30 minutes before the published
        // duty start in Philippine Standard Time (UTC+8). The early window is
        // calculated from an absolute timestamp, so the device time zone does
        // not change when students may time in.
        const timeInAccess = getTimeInAccess(group)
        if (!timeInAccess.hasSchedule) {
          throw new Error(
            'Your duty start time is not available yet. Please check your schedule.',
          )
        }
        if (!timeInAccess.isOpen) {
          throw new Error(
            `Time In is not open yet. You can time in starting ${timeInAccess.label} Philippine Standard Time, 30 minutes before your ${timeInAccess.startLabel} duty.`,
          )
        }

        const record = {
          id: `att-${today}-${group.id}-${Date.now()}`,
          date: today,
          groupId: group.id,
          duty: {
            group: group.name,
            clinicalArea: group.clinicalArea,
            facility: group.session.facility,
            shift: group.session.shift,
          },
          timeIn: evidence,
          timeOut: null,
          note: '',
        }

        setRecords((current) => [
          record,
          ...current.filter(
            (item) =>
              !(item.date === today && (item.groupId || mockStudent.group.id) === group.id),
          ),
        ])
        return record
      }

      if (!groupRecord?.timeIn) {
        throw new Error('Please time in first before you time out.')
      }
      if (groupRecord.timeOut) {
        throw new Error('You have already timed out for this duty day.')
      }

      // Backend enforcement: time out follows the published shift end in
      // Philippine Standard Time (UTC+8), regardless of the device time zone.
      const scheduledTimeOut = getScheduledTimeOut(group)
      if (!scheduledTimeOut) {
        throw new Error(
          'Your duty end time is not available yet. Please check your schedule.',
        )
      }
      if (Date.now() < scheduledTimeOut.getTime()) {
        throw new Error(
          `Time Out is not open yet. You can time out starting ${formatPhilippinesTime(
            scheduledTimeOut,
          )} Philippine Standard Time, when your duty ends.`,
        )
      }

      const updated = { ...groupRecord, timeOut: evidence }
      setRecords((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      )
      return updated
    },
    [faceCompleted, getTodayRecord, today],
  )

  const updateSetting = useCallback((key, value) => {
    setSettings((current) => ({ ...current, [key]: value }))
  }, [])

  const resetDemoData = useCallback(() => {
    setRecords(buildInitialRecords())
    setFaceViews(emptyFaceViews())
    setFaceCompletedAt(null)
    setSettings(defaultSettings)
    setDraft(null)
  }, [])

  const value = useMemo(
    () => ({
      isAuthenticated,
      student: mockStudent,
      records,
      todayRecord,
      getTodayRecord,
      hasTimedIn: Boolean(todayRecord?.timeIn),
      hasTimedOut: Boolean(todayRecord?.timeOut),
      faceViews,
      faceCapturedCount,
      faceCompleted,
      faceCompletedAt,
      settings,
      draft,
      setDraft,
      clearDraft: () => setDraft(null),
      login,
      logout,
      captureFaceView,
      completeFaceRegistration,
      resetFaceRegistration,
      submitAttendance,
      updateSetting,
      resetDemoData,
    }),
    [
      isAuthenticated,
      records,
      todayRecord,
      getTodayRecord,
      faceViews,
      faceCapturedCount,
      faceCompleted,
      faceCompletedAt,
      settings,
      draft,
      login,
      logout,
      captureFaceView,
      completeFaceRegistration,
      resetFaceRegistration,
      submitAttendance,
      updateSetting,
      resetDemoData,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
