import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  Building2,
  CheckCircle2,
  MapPin,
  ScanFace,
  ShieldCheck,
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
  const [searchParams] = useSearchParams()
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
  const groupId = searchParams.get('group') || draft?.groupId || student.group.id
  const group = student.groups.find((item) => item.id === groupId) ?? null
  const capturePath = `/attendance/${isValidType ? type : 'time-in'}/capture?group=${groupId}`
  const draftMatches =
    draft && draft.type === type && (!draft.groupId || draft.groupId === group?.id)

  if (!isValidType || !group || !draftMatches) {
    return (
      <div className="screen">
        <PageHeader
          title={`Review ${isTimeOut ? 'time out' : 'time in'}`}
          eyebrow="Attendance review"
          backTo={capturePath}
          backLabel="Back to capture"
        />
        <EmptyState
          icon={ScanFace}
          title="No evidence captured"
          description="Capture or select your own photo before reviewing attendance evidence."
          action={
            <Button
              variant="secondary"
              onClick={() => navigate(capturePath)}
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
      locationName: group.session.facility,
      address: group.session.address,
      coords: { ...simulatedLocation.coords },
      accuracy: simulatedLocation.accuracy,
    })
    toast('Location retrieved.', 'success')
  }

  const handleConfirm = () => {
    setError('')
    setSubmitting(true)
    submitTimer.current = window.setTimeout(() => {
      try {
        const record = submitAttendance({
          type,
          groupId: group.id,
          evidence: {
            at: draft.capturedAt,
            locationName: draft.locationName,
            address: draft.address,
            coords: draft.coords,
            accuracy: draft.accuracy,
            available: draft.locationAvailable,
            simulated: true,
            photoLabel: 'Individual photo',
            studentId: draft.studentId,
            faceVerified: true,
          },
        })
        clearDraft()
        setConfirmOpen(false)
        toast(`${typeLabel} recorded.`, 'success')
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
        title={`Confirm ${typeLabel.toLowerCase()}`}
        eyebrow={group.name}
        backTo={`/attendance/${type}/capture?group=${group.id}`}
        backLabel="Back to photo"
      />

      <div className="evidence-photo">
        <span className="badge badge--light evidence-photo__badge">Individual photo</span>
        <ScanFace size={40} aria-hidden="true" />
        <strong>Your attendance photo</strong>
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
            <dd>{formatDateLong(group.session.date)}</dd>
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
            <dt>Face verification</dt>
            <dd>Registered facial data matched</dd>
          </div>
          <div className="review-row">
            <dt>RLE group</dt>
            <dd>{group.name}</dd>
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
            {draft.locationAvailable ? 'Retrieved' : 'Unavailable'}
          </Badge>
        </div>

        {draft.locationAvailable ? (
          <div className="location-card__coords">
            <span>{draft.coords.lat.toFixed(5)}, {draft.coords.lng.toFixed(5)}</span>
            <span>±{draft.accuracy} m accuracy</span>
            <span>GPS</span>
          </div>
        ) : (
          <DemoNotice tone="warning">
            No location was retrieved. You can still review and submit this attendance,
            or retry the reading.
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRetryLocation}
              style={{ marginTop: 4, marginLeft: -8 }}
            >
              Retry location
            </Button>
          </DemoNotice>
        )}
      </section>

      <section className="review-location" aria-labelledby="review-assigned-title">
        <div className="review-location__head">
          <Building2 size={17} aria-hidden="true" />
          <div className="review-location__titles">
            <p id="review-assigned-title">Assigned clinical duty location</p>
            <strong>{group.session.facility}</strong>
            <span>{group.session.address}</span>
          </div>
          <Badge tone="neutral">Assigned</Badge>
        </div>
        <div className={`compare-strip ${draft.locationAvailable ? 'is-match' : ''}`.trim()}>
          {draft.locationAvailable ? (
            <>
              <ShieldCheck size={15} aria-hidden="true" />
              Location matches your assigned duty location.
            </>
          ) : (
            <>
              <MapPin size={15} aria-hidden="true" />
              Location comparison is unavailable for this submission.
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
          Check your photo, time, and location, then submit.
        </p>
      </div>

      <ConfirmSheet
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        title={`Submit ${typeLabel.toLowerCase()}?`}
        description={`Your photo and location will be saved as your ${typeLabel.toLowerCase()} for today.`}
        confirmLabel={`Yes, submit ${typeLabel.toLowerCase()}`}
        cancelLabel="Go back"
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
            <strong>Individual photo</strong>
          </div>
        </div>
      </ConfirmSheet>
    </div>
  )
}
