import { useCallback, useMemo, useState } from 'react'
import { AdminContext } from './AdminContext'
import {
  buildInitialAdminData,
  isScheduleComplete,
  ROLE_DEFINITIONS,
} from './adminData'

const initialData = buildInitialAdminData()

function reconcileMemberships({ students, groups, targetGroupId, memberIds }) {
  const uniqueMembers = [...new Set(memberIds)]
  const previous = groups.find((group) => group.id === targetGroupId)
  const previousMembers = previous?.memberIds || []

  const nextGroups = groups.map((group) => {
    if (group.id === targetGroupId) {
      return { ...group, memberIds: uniqueMembers }
    }
    return {
      ...group,
      memberIds: group.memberIds.filter((studentId) => !uniqueMembers.includes(studentId)),
    }
  })

  const nextStudents = students.map((student) => {
    if (uniqueMembers.includes(student.id)) {
      return student.groupId === targetGroupId ? student : { ...student, groupId: targetGroupId }
    }
    if (previousMembers.includes(student.id)) {
      return { ...student, groupId: null }
    }
    return student
  })

  return { students: nextStudents, groups: nextGroups }
}

export default function AdminProvider({ children }) {
  const [role, setRole] = useState('coordinator')
  const [students, setStudents] = useState(initialData.students)
  const [groups, setGroups] = useState(initialData.groups)
  const [schedules, setSchedules] = useState(initialData.schedules)
  const [locations, setLocations] = useState(initialData.locations)
  const [records, setRecords] = useState(initialData.records)
  const [notifications, setNotifications] = useState(initialData.notifications)
  const [settings, setSettings] = useState(initialData.settings)

  const canManage = role === 'coordinator'
  const currentUser = ROLE_DEFINITIONS[role]

  const assertManage = useCallback(() => {
    if (!canManage) {
      throw new Error('Department Head access is view-only for this action.')
    }
  }, [canManage])

  const assignStudentToGroup = useCallback(
    (studentId, groupId) => {
      assertManage()
      const student = students.find((item) => item.id === studentId)
      if (!student) throw new Error('The selected student could not be found.')
      if (groupId && !groups.some((group) => group.id === groupId)) {
        throw new Error('The selected group could not be found.')
      }

      const nextGroups = groups.map((group) => {
        if (group.id === groupId) {
          return group.memberIds.includes(studentId)
            ? group
            : { ...group, memberIds: [...group.memberIds, studentId] }
        }
        return {
          ...group,
          memberIds: group.memberIds.filter((id) => id !== studentId),
        }
      })

      setGroups(nextGroups)
      setStudents((current) =>
        current.map((item) => (item.id === studentId ? { ...item, groupId: groupId || null } : item)),
      )
    },
    [assertManage, groups, students],
  )

  const saveGroup = useCallback(
    (groupId, payload) => {
      assertManage()
      const now = new Date().toISOString()
      const targetId = groupId || `grp-${Date.now()}`
      const existing = groups.find((group) => group.id === targetId)
      const nextGroup = {
        ...existing,
        ...payload,
        id: targetId,
        memberIds: [...new Set(payload.memberIds || [])],
        createdAt: existing?.createdAt || now,
        updatedAt: now,
      }

      const withGroup = groupId
        ? groups.map((group) => (group.id === groupId ? nextGroup : group))
        : [...groups, nextGroup]

      const reconciled = reconcileMemberships({
        students,
        groups: withGroup,
        targetGroupId: targetId,
        memberIds: nextGroup.memberIds,
      })

      setGroups(reconciled.groups)
      setStudents(reconciled.students)
      return nextGroup
    },
    [assertManage, groups, students],
  )

  const updateGroupMembers = useCallback(
    (groupId, memberIds) => {
      assertManage()
      if (!groups.some((group) => group.id === groupId)) {
        throw new Error('The selected group could not be found.')
      }
      const reconciled = reconcileMemberships({
        students,
        groups,
        targetGroupId: groupId,
        memberIds,
      })
      setGroups(
        reconciled.groups.map((group) =>
          group.id === groupId ? { ...group, updatedAt: new Date().toISOString() } : group,
        ),
      )
      setStudents(reconciled.students)
    },
    [assertManage, groups, students],
  )

  const saveSchedule = useCallback(
    (scheduleId, payload) => {
      assertManage()
      const nextSchedule = {
        ...payload,
        id: scheduleId || `sch-${Date.now()}`,
        createdAt: schedules.find((schedule) => schedule.id === scheduleId)?.createdAt || new Date().toISOString(),
      }

      if (nextSchedule.status === 'Ready' && !isScheduleComplete(nextSchedule)) {
        throw new Error('Complete every required field before marking this schedule ready.')
      }

      setSchedules((current) =>
        scheduleId
          ? current.map((schedule) => (schedule.id === scheduleId ? nextSchedule : schedule))
          : [nextSchedule, ...current],
      )
      return nextSchedule
    },
    [assertManage, schedules],
  )

  const publishSchedule = useCallback(
    (scheduleId) => {
      assertManage()
      const schedule = schedules.find((item) => item.id === scheduleId)
      if (!schedule) throw new Error('The selected schedule could not be found.')
      if (!isScheduleComplete(schedule)) {
        throw new Error('Complete every required field before publishing this schedule.')
      }
      setSchedules((current) =>
        current.map((item) =>
          item.id === scheduleId ? { ...item, status: 'Ready' } : item,
        ),
      )
    },
    [assertManage, schedules],
  )

  const saveLocation = useCallback(
    (locationId, payload) => {
      assertManage()
      const nextLocation = {
        ...payload,
        id: locationId || `loc-${Date.now()}`,
      }
      setLocations((current) =>
        locationId
          ? current.map((location) => (location.id === locationId ? nextLocation : location))
          : [...current, nextLocation],
      )
      return nextLocation
    },
    [assertManage],
  )

  const resolveFlag = useCallback(
    (recordId, resolution) => {
      assertManage()
      if (!resolution.trim()) {
        throw new Error('Add a short resolution note before closing this flag.')
      }
      setRecords((current) =>
        current.map((record) => {
          if (record.id !== recordId || !record.flag) return record
          return {
            ...record,
            flag: {
              ...record.flag,
              status: 'Resolved',
              resolution: resolution.trim(),
              resolvedAt: new Date().toISOString(),
              resolvedBy: currentUser.name,
            },
          }
        }),
      )
    },
    [assertManage, currentUser.name],
  )

  const updateSettings = useCallback(
    (patch) => {
      assertManage()
      setSettings((current) => ({ ...current, ...patch }))
    },
    [assertManage],
  )

  const markNotificationRead = useCallback((notificationId) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId ? { ...notification, read: true } : notification,
      ),
    )
  }, [])

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((current) => current.map((notification) => ({ ...notification, read: true })))
  }, [])

  const openFlagCount = useMemo(
    () => records.filter((record) => record.flag?.status === 'Open').length,
    [records],
  )

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  )

  const value = useMemo(
    () => ({
      role,
      setRole,
      currentUser,
      canManage,
      students,
      groups,
      schedules,
      locations,
      records,
      notifications,
      settings,
      openFlagCount,
      unreadCount,
      assignStudentToGroup,
      saveGroup,
      updateGroupMembers,
      saveSchedule,
      publishSchedule,
      saveLocation,
      resolveFlag,
      updateSettings,
      markNotificationRead,
      markAllNotificationsRead,
    }),
    [
      role,
      currentUser,
      canManage,
      students,
      groups,
      schedules,
      locations,
      records,
      notifications,
      settings,
      openFlagCount,
      unreadCount,
      assignStudentToGroup,
      saveGroup,
      updateGroupMembers,
      saveSchedule,
      publishSchedule,
      saveLocation,
      resolveFlag,
      updateSettings,
      markNotificationRead,
      markAllNotificationsRead,
    ],
  )

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}
