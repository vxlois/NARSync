import PageHeader from '../components/PageHeader'
import TodayAttendanceCard from '../components/TodayAttendanceCard'
import { useApp } from '../context/AppContext'

export default function AttendanceDetailsPage() {
  const { student, faceCompleted, getTodayRecord } = useApp()
  const assignedGroup =
    student.groups.find((group) => group.id === student.group.id) ??
    student.groups[0]
  const sessionRecord = getTodayRecord(assignedGroup.id)

  const hasValidSchedule = Boolean(assignedGroup.session.valid)
  const canSubmit = hasValidSchedule && faceCompleted
  const lockReason = !hasValidSchedule
    ? 'Time In and Time Out will unlock once your schedule is published.'
    : !faceCompleted
      ? 'Complete facial registration to unlock attendance.'
      : ''

  return (
    <div className="screen">
      <PageHeader
        title="Attendance"
        eyebrow="Today's session"
        backTo="/attendance"
        backLabel="Back to attendance"
      />

      <TodayAttendanceCard
        group={assignedGroup}
        record={sessionRecord}
        faceCompleted={faceCompleted}
        canSubmit={canSubmit}
        lockReason={lockReason}
      />
    </div>
  )
}
