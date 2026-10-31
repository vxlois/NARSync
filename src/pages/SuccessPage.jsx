import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { CheckCircle2, History, House } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import { useApp } from '../context/AppContext'
import { formatDateLong, formatTime, formatTimestamp } from '../utils/format'

export default function SuccessPage() {
  const { recordId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { records, student } = useApp()
  const record = records.find((item) => item.id === recordId)
  const type = searchParams.get('type') === 'time-out' ? 'time-out' : 'time-in'
  const typeLabel = type === 'time-out' ? 'Time out' : 'Time in'
  const evidence = type === 'time-out' ? record?.timeOut : record?.timeIn

  if (!record || !evidence) {
    return (
      <div className="screen">
        <PageHeader
          title="Submission status"
          eyebrow="Attendance"
          backTo="/attendance"
          backLabel="Back to attendance"
        />
        <EmptyState
          icon={CheckCircle2}
          title="Submission not found"
          description="This record is not available in the current session. It may have been reset."
          action={
            <Button variant="secondary" onClick={() => navigate('/attendance')}>
              Back to attendance
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="success-screen">
      <div className="success-hero">
        <span className="success-mark" aria-hidden="true">
          <CheckCircle2 size={38} strokeWidth={1.8} />
        </span>
        <h1>{typeLabel} recorded</h1>
        <p>
          Your attendance submission was successful. The dashboard and attendance
          history have been updated for this session.
        </p>
        <p className="success-time">{formatTime(evidence.at)}</p>
        <Badge tone="success">Submission successful</Badge>
      </div>

      <div className="success-card">
        <dl className="review-details">
          <div className="review-row">
            <dt>Attendance type</dt>
            <dd>{typeLabel}</dd>
          </div>
          <div className="review-row">
            <dt>Duty date</dt>
            <dd>{formatDateLong(record.date)}</dd>
          </div>
          <div className="review-row">
            <dt>Timestamp</dt>
            <dd>{formatTimestamp(evidence.at)}</dd>
          </div>
          <div className="review-row">
            <dt>Retrieved location</dt>
            <dd>{evidence.available ? evidence.locationName : 'Location unavailable'}</dd>
          </div>
          <div className="review-row">
            <dt>Assigned location</dt>
            <dd>{student.duty.facility}</dd>
          </div>
          <div className="review-row">
            <dt>Evidence</dt>
            <dd>Group photo</dd>
          </div>
        </dl>
      </div>

      <div className="success-actions">
        <Button block icon={House} onClick={() => navigate('/dashboard')}>
          Return to dashboard
        </Button>
        <Button
          variant="outline"
          block
          icon={History}
          onClick={() => navigate(`/history/${record.id}`)}
        >
          View attendance record
        </Button>
      </div>
    </div>
  )
}
