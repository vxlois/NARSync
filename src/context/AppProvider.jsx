import { useCallback, useMemo, useState } from 'react'
import {
  buildInitialRecords,
  defaultSettings,
  DEMO_CREDENTIALS,
  FACE_VIEW_KEYS,
  mockStudent,
} from '../data/mockData'
import { dateKey } from '../utils/format'
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

  const today = dateKey()
  const todayRecord = useMemo(
    () => records.find((record) => record.date === today) ?? null,
    [records, today],
  )

  const faceCapturedCount = useMemo(
    () => FACE_VIEW_KEYS.filter((key) => faceViews[key]).length,
    [faceViews],
  )
  const faceCompleted = Boolean(faceCompletedAt)

  const login = useCallback(({ studentId, password }) => {
    const id = studentId.trim()
    if (id !== DEMO_CREDENTIALS.studentId || password !== DEMO_CREDENTIALS.password) {
      throw new Error('The student ID or password does not match the demo account.')
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
    ({ type, evidence }) => {
      if (type !== 'time-in' && type !== 'time-out') {
        throw new Error('Unknown attendance type.')
      }

      if (type === 'time-in') {
        if (todayRecord?.timeIn) {
          throw new Error('A time in record already exists for today.')
        }

        const record = {
          id: `att-${today}-${Date.now()}`,
          date: today,
          duty: {
            group: mockStudent.group.name,
            clinicalArea: mockStudent.duty.clinicalArea,
            facility: mockStudent.duty.facility,
            shift: mockStudent.duty.shift,
          },
          timeIn: evidence,
          timeOut: null,
          note: '',
        }

        setRecords((current) => [
          record,
          ...current.filter((item) => item.date !== today),
        ])
        return record
      }

      if (!todayRecord?.timeIn) {
        throw new Error('A valid time in is required before you can time out.')
      }
      if (todayRecord.timeOut) {
        throw new Error('A time out record already exists for today.')
      }

      const updated = { ...todayRecord, timeOut: evidence }
      setRecords((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      )
      return updated
    },
    [today, todayRecord],
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
