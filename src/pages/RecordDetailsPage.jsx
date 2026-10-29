import { useNavigate, useParams } from 'react-router-dom'
import {
  CalendarX2,
  Check,
  ClipboardList,
  Clock3,
  Image as ImageIcon,
  MapPin,
  Stethoscope,
  Users,
} from 'lucide-react'
import DemoNotice from '../components/DemoNotice'
import PageHeader from '../components/PageHeader'
import StatusPill from '../components/StatusPill'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import { useApp } from '../context/AppContext'
import { dateKey, formatCoords, formatDateLong, formatDayParts, formatTime } from '../utils/format'

function TimelineEntry({ label, evidence, emptyText }) {
  return (
    <div className="record-timeline__item">
      <span className={`record-timeline__dot ${evidence ? 'is-done' : ''}`.trim()} aria-hidden="true">
        {evidence && <Check size={9} strokeWidth={3} />}
      </span>
      <div className="record-timeline__title">
        <strong>{label}</strong>
        <span>{evidence ? formatTime(evidence.at) : 'Not recorded'}</span>
      </div>
      {evidence ? (
        <>
          <p className="record-timeline__meta">{evidence.locationName}</p>
          <div className="record-timeline__foot">
            <span>
              <MapPin size={11} aria-hidden="true" />
              {formatCoords(evidence.coords)}
            </span>
            <span>
              <ImageIcon size={11} aria-hidden="true" />
              Demo group photo
            </span>
          </div>
        </>
      ) : (
        <p className="record-timeline__meta">{emptyText}</p>
      )}
    </div>
  )
}

export default function RecordDetailsPage() {
  const { recordId } = useParams()
  const navigate = useNavigate()
  const { records, todayRecord } = useApp()
  const record = records.find((item) => item.id === recordId)

  if (!record) {
    return (
      <div className="screen">
        <PageHeader
          title="Attendance record"
          eyebrow="History"
          backTo="/history"
          backLabel="Back to history"
        />
        <EmptyState
          icon={CalendarX2}
          title="Record not found"
          description="This record is not available in the current prototype session."
          action={
            <Button variant="secondary" onClick={() => navigate('/history')}>
              Back to history
            </Button>
          }
        />
      </div>
    )
  }

  const day = formatDayParts(record.date)
  const isToday = record.date === dateKey()
  const isOpenSession = isToday && record.timeIn && !record.timeOut

  return (
    <div className="screen">
      <PageHeader
        title="Attendance record"
        eyebrow="Attendance history"
        backTo="/history"
        backLabel="Back to history"
      />

      <section className="record-hero">
        <div className="record-hero__top">
          <div className="record-hero__date">
            <span className="record-hero__day" aria-hidden="true">{day.day}</span>
            <div>
              <h2>{formatDateLong(record.date)}</h2>
              <p>
                {record.duty?.group} · {record.duty?.clinicalArea}
              </p>
            </div>
          </div>
          <StatusPill record={record} />
        </div>

        <div className="record-hero__summary">
          <span>
            Time in
            <strong>{record.timeIn ? formatTime(record.timeIn.at) : '—'}</strong>
          </span>
          <span>
            Time out
            <strong>{record.timeOut ? formatTime(record.timeOut.at) : '—'}</strong>
          </span>
          <span>
            Duty hours
            <strong>{record.duty?.shift || '—'}</strong>
          </span>
        </div>
      </section>

      <Card>
        <h2 className="section__title" style={{ marginBottom: 12 }}>
          Attendance timeline
        </h2>
        {!record.timeIn ? (
          <EmptyState
            compact
            icon={CalendarX2}
            title="No attendance submitted"
            description="There is no time in or time out evidence for this duty day."
          />
        ) : (
          <div className="record-timeline">
            <TimelineEntry
              label="Time in"
              evidence={record.timeIn}
              emptyText="No time in evidence."
            />
            <TimelineEntry
              label="Time out"
              evidence={record.timeOut}
              emptyText="No time out evidence was submitted for this duty day."
            />
          </div>
        )}
      </Card>

      <Card>
        <h2 className="section__title" style={{ marginBottom: 5 }}>
          Duty details
        </h2>
        <div className="detail-list">
          <div className="detail-row">
            <span className="detail-row__icon" aria-hidden="true">
              <Users size={16} />
            </span>
            <div className="detail-row__text">
              <span className="detail-row__label">RLE group</span>
              <span className="detail-row__value">{record.duty?.group || 'RLE group'}</span>
            </div>
          </div>
          <div className="detail-row">
            <span className="detail-row__icon" aria-hidden="true">
              <Stethoscope size={16} />
            </span>
            <div className="detail-row__text">
              <span className="detail-row__label">Clinical area</span>
              <span className="detail-row__value">{record.duty?.clinicalArea || '—'}</span>
            </div>
          </div>
          <div className="detail-row">
            <span className="detail-row__icon" aria-hidden="true">
              <MapPin size={16} />
            </span>
            <div className="detail-row__text">
              <span className="detail-row__label">Assigned facility</span>
              <span className="detail-row__value">{record.duty?.facility || '—'}</span>
            </div>
          </div>
          <div className="detail-row">
            <span className="detail-row__icon" aria-hidden="true">
              <Clock3 size={16} />
            </span>
            <div className="detail-row__text">
              <span className="detail-row__label">Duty hours</span>
              <span className="detail-row__value">{record.duty?.shift || '—'}</span>
            </div>
          </div>
        </div>
      </Card>

      {record.note && <DemoNotice tone="warning">{record.note}</DemoNotice>}

      <DemoNotice>
        This record is synthetic prototype data. GPS coordinates and photo labels are
        simulated; no biometric or location verification was performed.
      </DemoNotice>

      {isOpenSession && todayRecord?.timeIn && (
        <Button
          block
          icon={ClipboardList}
          onClick={() => navigate('/attendance/time-out/capture')}
        >
          Continue to time out
        </Button>
      )}
    </div>
  )
}
