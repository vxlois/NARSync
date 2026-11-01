import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Camera,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  Lock,
  MapPin,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react'
import GroupCameraPreview from '../components/GroupCameraPreview'
import PageHeader from '../components/PageHeader'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { simulatedLocation } from '../data/mockData'
import { formatTimestamp } from '../utils/format'

const VALID_TYPES = ['time-in', 'time-out']

export default function CapturePage() {
  const { type } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { student, todayRecord, setDraft } = useApp()

  const [captured, setCaptured] = useState(false)
  const [capturedAt, setCapturedAt] = useState(null)
  const [captureMethod, setCaptureMethod] = useState('camera')
  const [capturing, setCapturing] = useState(false)
  const [locationState, setLocationState] = useState('loading')
  const [simulateUnavailable, setSimulateUnavailable] = useState(false)
  const [locationAttempt, setLocationAttempt] = useState(0)
  const captureTimer = useRef(null)

  const isValidType = VALID_TYPES.includes(type)
  const isTimeOut = type === 'time-out'
  const alreadyTimedIn = Boolean(todayRecord?.timeIn)
  const alreadyTimedOut = Boolean(todayRecord?.timeOut)

  useEffect(() => {
    return () => {
      if (captureTimer.current) window.clearTimeout(captureTimer.current)
    }
  }, [])

  useEffect(() => {
    if (!isValidType || simulateUnavailable) return undefined
    const timer = window.setTimeout(() => setLocationState('ready'), 1100)
    return () => window.clearTimeout(timer)
  }, [isValidType, simulateUnavailable, locationAttempt])

  const toggleUnavailable = () => {
    const next = !simulateUnavailable
    setSimulateUnavailable(next)
    setLocationState(next ? 'unavailable' : 'loading')
    if (!next) setLocationAttempt((attempt) => attempt + 1)
  }

  const retryLocation = () => {
    setSimulateUnavailable(false)
    setLocationState('loading')
    setLocationAttempt((attempt) => attempt + 1)
  }

  const blockedReason = (() => {
    if (!isValidType) {
      return {
        title: 'Attendance type not found',
        description: 'This capture link is not valid. Return to attendance to start again.',
      }
    }
    if (type === 'time-in' && alreadyTimedIn) {
      return {
        title: 'Time in already recorded',
        description: 'A valid time in already exists for today. You can proceed to time out after your duty.',
      }
    }
    if (type === 'time-out' && !alreadyTimedIn) {
      return {
        title: 'Time out is locked',
        description: 'Record a valid time in for this duty day before submitting your time out.',
      }
    }
    if (type === 'time-out' && alreadyTimedOut) {
      return {
        title: 'Time out already recorded',
        description: 'Both time in and time out are complete for today. Review the record in your history.',
      }
    }
    return null
  })()

  const handleCapture = (method = 'camera') => {
    if (capturing || blockedReason) return
    setCapturing(true)
    captureTimer.current = window.setTimeout(() => {
      setCapturedAt(new Date().toISOString())
      setCaptureMethod(method)
      setCaptured(true)
      setCapturing(false)
      toast(
        method === 'image'
          ? 'Image selected as attendance evidence.'
          : 'Group photo captured.',
        'success',
      )
    }, 650)
  }

  const handleRetake = () => {
    setCaptured(false)
    setCapturedAt(null)
    setCaptureMethod('camera')
  }

  const handleContinue = () => {
    if (!captured || !capturedAt || locationState === 'loading') return
    const available = locationState === 'ready'

    setDraft({
      type,
      capturedAt,
      method: captureMethod === 'image' ? 'Image selection' : 'Camera capture',
      locationAvailable: available,
      locationName: available ? simulatedLocation.name : 'Location unavailable',
      address: available
        ? simulatedLocation.address
        : 'No location was retrieved.',
      coords: available ? { ...simulatedLocation.coords } : null,
      accuracy: available ? simulatedLocation.accuracy : null,
    })

    navigate(`/attendance/${type}/review`)
  }

  if (blockedReason) {
    return (
      <div className="screen">
        <PageHeader
          title={isTimeOut ? 'Time out' : 'Time in'}
          eyebrow="Attendance capture"
          backTo="/attendance"
          backLabel="Back to attendance"
        />
        <EmptyState
          icon={Lock}
          title={blockedReason.title}
          description={blockedReason.description}
          action={
            <Button variant="secondary" onClick={() => navigate('/attendance')}>
              Back to attendance
            </Button>
          }
        />
      </div>
    )
  }

  const typeLabel = isTimeOut ? 'Time out' : 'Time in'

  return (
    <div className="screen">
      <PageHeader
        title={`${typeLabel} capture`}
        eyebrow="Attendance evidence"
        backTo="/attendance"
        backLabel="Back to attendance"
      />

      <div className="stepper">
        <div className="stepper__meta">
          <span>
            Step <strong>1</strong> of 2
          </span>
          <span>Capture photo</span>
        </div>
        <div className="stepper__bars" aria-hidden="true">
          <span className="stepper__bar is-active" />
          <span className="stepper__bar" />
        </div>
      </div>

      <div className="capture-camera-wrap">
        <GroupCameraPreview captured={captured} capturedAt={capturedAt} />

        {captured ? (
          <div className="capture-actions">
            <Button
              variant="outline"
              size="sm"
              icon={RotateCcw}
              onClick={handleRetake}
            >
              Retake
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={ImageIcon}
              onClick={() => handleCapture('image')}
              disabled={capturing}
            >
              Use image
            </Button>
          </div>
        ) : (
          <>
            <div className="capture-controls">
              <button
                type="button"
                className="shutter-button"
                onClick={() => handleCapture('camera')}
                disabled={capturing}
                aria-label="Capture group photo"
              >
                {capturing ? (
                  <Loader2 className="spinner" size={25} aria-hidden="true" />
                ) : (
                  <Camera size={25} aria-hidden="true" />
                )}
              </button>
            </div>
            <div className="capture-actions">
              <Button
                variant="ghost"
                size="sm"
                icon={ImageIcon}
                onClick={() => handleCapture('image')}
                disabled={capturing}
              >
                Select an image instead
              </Button>
            </div>
            <p className="capture-controls__note">
              Tap the shutter to capture a group photo.
            </p>
          </>
        )}

        <div className="capture-meta">
          <div>
            <p className="capture-meta__label">Attendance type</p>
            <p className="capture-meta__value">{typeLabel}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p className="capture-meta__label">Captured at</p>
            <p className="capture-meta__value">
              {capturedAt ? formatTimestamp(capturedAt) : 'Not captured yet'}
            </p>
          </div>
        </div>
      </div>

      <section className="location-card" aria-labelledby="retrieved-location-title">
        <div className="location-card__head">
          <span className="location-card__icon" aria-hidden="true">
            <MapPin size={18} />
          </span>
          <div className="location-card__head-text">
            <span className="location-card__label" id="retrieved-location-title">
              Retrieved location
            </span>
            {locationState === 'loading' && (
              <div className="location-card__spinner" role="status">
                <Loader2 size={15} aria-hidden="true" />
                Retrieving location…
              </div>
            )}
            {locationState === 'ready' && (
              <>
                <span className="location-card__name">{simulatedLocation.name}</span>
                <span className="location-card__address">{simulatedLocation.address}</span>
              </>
            )}
            {locationState === 'unavailable' && (
              <>
                <span className="location-card__name">Location unavailable</span>
                <span className="location-card__address">
                  No GPS reading was retrieved.
                </span>
              </>
            )}
          </div>
          <Badge tone={locationState === 'ready' ? 'violet' : 'neutral'}>
            GPS
          </Badge>
        </div>

        {locationState === 'ready' && (
          <div className="location-card__coords">
            <span>{simulatedLocation.coords.lat.toFixed(5)}, {simulatedLocation.coords.lng.toFixed(5)}</span>
            <span>±{simulatedLocation.accuracy} m accuracy</span>
          </div>
        )}

        <div
          className={`compare-strip ${locationState === 'ready' ? 'is-match' : ''}`.trim()}
        >
          {locationState === 'ready' ? (
            <>
              <ShieldCheck size={15} aria-hidden="true" />
              Matches your assigned duty location · {student.duty.facility}
            </>
          ) : (
            <>
              <MapPin size={15} aria-hidden="true" />
              {locationState === 'loading'
                ? 'Waiting for the location check…'
                : `Could not compare with ${student.duty.facility}. You may still review the evidence.`}
            </>
          )}
        </div>
      </section>

      <details className="demo-panel">
        <summary>Preview controls</summary>
        <div className="demo-panel__body">
          <p>Preview how the app behaves when a location cannot be retrieved.</p>
          <div className="setting-row" style={{ padding: 0 }}>
            <div className="setting-row__text">
              <span className="setting-row__title">Unavailable GPS</span>
              <span className="setting-row__sub">Preview the missing-location error state.</span>
            </div>
            <button
              type="button"
              className="switch"
              role="switch"
              aria-checked={simulateUnavailable}
              aria-label="Unavailable GPS"
              onClick={toggleUnavailable}
            />
          </div>
          {simulateUnavailable && (
            <Button variant="ghost" size="sm" onClick={retryLocation}>
              Retry location
            </Button>
          )}
        </div>
      </details>

      <Button
        block
        icon={CheckCircle2}
        onClick={handleContinue}
        disabled={!captured || locationState === 'loading'}
      >
        Continue to review
      </Button>
      <p className="submit-bar__hint">
        {captured
          ? locationState === 'loading'
            ? 'Waiting for the location check…'
            : 'You will review all evidence before confirming the submission.'
          : 'Capture or select a group photo to continue.'}
      </p>
    </div>
  )
}
