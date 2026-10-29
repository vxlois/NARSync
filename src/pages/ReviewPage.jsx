import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Building2,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Users,
} from 'lucide-react'
import DemoNotice from '../components/DemoNotice'
import PageHeader from '../components/PageHeader'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import { ConfirmSheet } from '../components/ui/Sheet'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { simulatedLocation } from '../data/mockData'
import { formatDateLong, formatTimestamp } from '../utils/format'

const VALID_TYPES = ['time-in', 'time-out']

export default function ReviewPage() {
  const { type } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const {
    student,
    draft,
    setDraft,
    clearDraft,
    submitAttendance,
  } = useApp()

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const submitTimer = useRef(null)

  useEffect(() => {
    return () => {
      if (submitTimer.current) window.clearTimeout(submitTimer.current)
    }
  }, [])

  const isValidType = VALID_TYPES.includes(type)
  const isTimeOut = type === 'time-out'
  const typeLabel = isTimeOut ? 'Time out' : 'Time in'
  const draftMatches = draft && draft.type === type

  if (!isValidType || !draftMatches) {
    return (
      <div className="screen">
        <PageHeader
          title={`Review ${isTimeOut ? 'time out' : 'time in'}`}
          eyebrow="Attendance review"
          backTo={`/attendance/${isValidType ? type : 'time-in'}/capture`}
          backLabel="Back to capture"
        />
        <EmptyState
          icon={Users}
          title="No evidence captured"
          description="Capture or select a demo group photo before reviewing attendance evidence."
          action={
            <Button
              variant="secondary"
              onClick={() => navigate(`/attendance/${isValidType ? type : 'time-in'}/capture`)}
            >
              Open camera capture
            </Button>
          }
        />
      </div>
    )
  }

  const handleRetryLocation = () => {
    setDraft({
      ...draft,
      locationAvailable: true,
      locationName: simulatedLocation.name,
      address: simulatedLocation.address,
      coords: { ...simulatedLocation.coords },
      accuracy: simulatedLocation.accuracy,
    })
    toast('Simulated location retrieved.', 'success')
  }

  const handleConfirm = () => {
    setError('')
    setSubmitting(true)
    submitTimer.current = window.setTimeout(() => {
      try {
        const record = submitAttendance({
          type,
          evidence: {
            at: draft.capturedAt,
            locationName: draft.locationName,
            address: draft.address,
            coords: draft.coords,
            accuracy: draft.accuracy,
            available: draft.locationAvailable,
            simulated: true,
            photoLabel: 'Demo group photo',
          },
        })
        clearDraft()
        setConfirmOpen(false)
        toast(`${typeLabel} recorded in the prototype.`, 'success')
        navigate(`/attendance/success/${record.id}?type=${type}`, { replace: true })
      } catch (submissionError) {
        setError(submissionError.message)
        setSubmitting(false)
        setConfirmOpen(false)
      }
    }, 900)
  }

  return (
    <div className="screen">
      <PageHeader
        title={`Review ${typeLabel.toLowerCase()}`}
        eyebrow="Attendance review"
        backTo={`/attendance/${type}/capture`}
        backLabel="Back to capture"
      />

      <div className="stepper">
        <div className="stepper__meta">
          <span>
            Step <strong>2</strong> of 2
          </span>
          <span>Review & confirm</span>
        </div>
        <div className="stepper__bars" aria-hidden="true">
          <span className="stepper__bar is-active" />
          <span className="stepper__bar is-active" />
        </div>
      </div>

      <div className="evidence-photo">
        <span className="badge badge--light evidence-photo__badge">Demo image</span>
        <Users size={40} aria-hidden="true" />
        <strong>Group photo placeholder</strong>
        <small>{formatTimestamp(draft.capturedAt)}</small>
      </div>

      <Card>
        <h2 className="section__title" style={{ marginBottom: 5 }}>
          Evidence details
        </h2>
        <dl className="review-details">
          <div className="review-row">
            <dt>Attendance type</dt>
            <dd>{typeLabel}</dd>
          </div>
          <div className="review-row">
            <dt>Duty date</dt>
            <dd>{formatDateLong(student.duty.date)}</dd>
          </div>
          <div className="review-row">
            <dt>Captured at</dt>
            <dd>{formatTimestamp(draft.capturedAt)}</dd>
          </div>
          <div className="review-row">
            <dt>Photo source</dt>
            <dd>{draft.method}</dd>
          </div>
          <div className="review-row">
            <dt>RLE group</dt>
            <dd>{student.group.name}</dd>
          </div>
        </dl>
      </Card>

      <section className="review-location" aria-labelledby="review-retrieved-title">
        <div className="review-location__head">
          <MapPin size={17} aria-hidden="true" />
          <div className="review-location__titles">
            <p id="review-retrieved-title">Retrieved location</p>
            <strong>{draft.locationName}</strong>
            <span>{draft.address}</span>
          </div>
          <Badge tone={draft.locationAvailable ? 'violet' : 'warning'}>
            {draft.locationAvailable ? 'Simulated' : 'Unavailable'}
          </Badge>
        </div>

        {draft.locationAvailable ? (
          <div className="location-card__coords">
            <span>{draft.coords.lat.toFixed(5)}, {draft.coords.lng.toFixed(5)}</span>
            <span>±{draft.accuracy} m accuracy</span>
            <span>Simulated GPS</span>
          </div>
        ) : (
          <DemoNotice tone="warning">
            No simulated location was retrieved. You can still review and submit this
            demo attendance, or retry the simulated reading.
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRetryLocation}
              style={{ marginTop: 4, marginLeft: -8 }}
            >
              Retry demo location
            </Button>
          </DemoNotice>
        )}
      </section>

      <section className="review-location" aria-labelledby="review-assigned-title">
        <div className="review-location__head">
          <Building2 size={17} aria-hidden="true" />
          <div className="review-location__titles">
            <p id="review-assigned-title">Assigned clinical duty location</p>
            <strong>{student.duty.facility}</strong>
            <span>{student.duty.address}</span>
          </div>
          <Badge tone="neutral">Assigned</Badge>
        </div>
        <div className={`compare-strip ${draft.locationAvailable ? 'is-match' : ''}`.trim()}>
          {draft.locationAvailable ? (
            <>
              <ShieldCheck size={15} aria-hidden="true" />
              Simulated location matches your assigned duty location.
            </>
          ) : (
            <>
              <MapPin size={15} aria-hidden="true" />
              Location comparison is unavailable for this demo submission.
            </>
          )}
        </div>
      </section>

      {error && (
        <DemoNotice tone="danger">{error}</DemoNotice>
      )}

      <div className="submit-bar">
        <Button
          block
          icon={CheckCircle2}
          onClick={() => setConfirmOpen(true)}
          disabled={submitting}
        >
          Submit {typeLabel.toLowerCase()}
        </Button>
        <p className="submit-bar__hint">
          You will be asked to confirm the evidence before the demo submission is saved.
        </p>
      </div>

      <p className="review-footnote">
        Facial recognition, live GPS verification, and permanent storage are not
        implemented. This submission exists only in the current prototype session.
      </p>

      <ConfirmSheet
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        title={`Confirm ${typeLabel.toLowerCase()} submission`}
        description="Please check the evidence summary. Confirming creates a demo attendance record in this session only."
        confirmLabel={`Confirm & submit`}
        loading={submitting}
        icon={CheckCircle2}
      >
        <div className="confirm-summary">
          <div className="confirm-summary__row">
            <span>Type</span>
            <strong>{typeLabel}</strong>
          </div>
          <div className="confirm-summary__row">
            <span>Timestamp</span>
            <strong>{formatTimestamp(draft.capturedAt)}</strong>
          </div>
          <div className="confirm-summary__row">
            <span>Location</span>
            <strong>
              {draft.locationAvailable ? draft.locationName : 'Location unavailable'}
            </strong>
          </div>
          <div className="confirm-summary__row">
            <span>Evidence</span>
            <strong>Demo group photo</strong>
          </div>
        </div>
      </ConfirmSheet>
    </div>
  )
}
