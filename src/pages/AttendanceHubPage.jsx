import { Check, ChevronRight, ScanFace } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import AttendanceActions from '../components/AttendanceActions'
import RecordCard from '../components/RecordCard'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { useApp } from '../context/AppContext'
import { getAttendanceSnapshot, getTimeInAccess } from '../utils/attendance'

const STEPS = [
  { id: 1, title: 'Register face' },
  { id: 2, title: 'Time in' },
  { id: 3, title: 'Time out' },
]

function StepMarker({ step, state }) {
  if (state === 'is-done') {
    return (
      <span className={`attendance-step__marker ${state}`} aria-hidden="true">
        <Check size={11} strokeWidth={3} />
      </span>
    )
  }

  return (
    <span className={`attendance-step__marker ${state}`.trim()} aria-hidden="true">
      {step}
    </span>
  )
}

export default function AttendanceHubPage() {
  const navigate = useNavigate()
  const { student, records, faceCompleted, getTodayRecord } = useApp()
  const assignedGroup =
    student.groups.find((group) => group.id === student.group.id) ??
    student.groups[0]
  const sessionRecord = getTodayRecord(assignedGroup.id)
  const groupRecords = records.filter(
    (record) => (record.groupId || student.group.id) === assignedGroup.id,
  )

  const hasValidSchedule = Boolean(assignedGroup.session.valid)
  const canSubmit = hasValidSchedule && faceCompleted
  const lockReason = !hasValidSchedule
    ? 'Time In and Time Out will unlock once your schedule is published.'
    : !faceCompleted
      ? 'Complete facial registration to unlock attendance.'
      : ''

  const timeInAccess = getTimeInAccess(assignedGroup)
  const hasTimedIn = Boolean(sessionRecord?.timeIn)
  const hasTimedOut = Boolean(sessionRecord?.timeOut)
  const status = hasValidSchedule
    ? getAttendanceSnapshot(sessionRecord)
    : { label: 'Schedule not ready', tone: 'neutral' }

  const stepState = {
    1: faceCompleted ? 'is-done' : 'is-current',
    2: hasTimedIn ? 'is-done' : faceCompleted ? 'is-current' : '',
    3: hasTimedOut ? 'is-done' : hasTimedIn ? 'is-current' : '',
  }

  const stepMeta = {
    1: 'Required once',
    2: hasValidSchedule
      ? `Opens ${timeInAccess.label}, 30 minutes before duty`
      : 'Waiting for your duty schedule',
    3: hasTimedOut
      ? 'Time out recorded'
      : hasTimedIn
        ? 'Available now'
        : 'Available after you time in',
  }

  return (
    <div className="screen attendance-screen">
      <header className="attendance-header">
        <div className="attendance-header__copy">
          <p className="eyebrow">Today&apos;s duty</p>
          <h1>Attendance</h1>
        </div>
        <Badge tone={status.tone} dot>
          {status.label}
        </Badge>
      </header>

      {!faceCompleted && (
        <section className="attendance-register" aria-labelledby="attendance-register-title">
          <span className="attendance-register__icon" aria-hidden="true">
            <ScanFace size={22} strokeWidth={1.8} />
          </span>
          <div className="attendance-register__copy">
            <h2 id="attendance-register-title">Register your face to start</h2>
            <p>Complete registration to unlock Time In and Time Out.</p>
          </div>
          <Button block onClick={() => navigate('/face-registration')}>
            Register face
          </Button>
        </section>
      )}

      <section className="attendance-steps" aria-label="Attendance steps">
        {STEPS.map((step, index) => {
          const state = stepState[step.id]
          return (
            <div
              className={`attendance-step ${state}`.trim()}
              key={step.id}
              aria-current={state === 'is-current' ? 'step' : undefined}
            >
              <StepMarker step={index + 1} state={state} />
              <div className="attendance-step__copy">
                <h2>{step.title}</h2>
                <p>{stepMeta[step.id]}</p>
              </div>
            </div>
          )
        })}
      </section>

      <AttendanceActions
        record={sessionRecord}
        group={assignedGroup}
        groupId={assignedGroup.id}
        canSubmit={canSubmit}
        lockReason={lockReason}
        variant="dock"
      />

      {groupRecords.length > 0 && (
        <section className="section" aria-labelledby="recent-attendance-title">
          <div className="section__head">
            <h2 className="section__title" id="recent-attendance-title">
              Recent attendance
            </h2>
            <Link className="section__link" to="/history">
              View all
              <ChevronRight size={14} aria-hidden="true" />
            </Link>
          </div>
          <div className="record-list">
            {groupRecords.slice(0, 3).map((record) => (
              <RecordCard key={record.id} record={record} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
