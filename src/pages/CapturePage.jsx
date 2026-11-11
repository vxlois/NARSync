import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  Camera,
  CheckCircle2,
  Loader2,
  Lock,
  MapPin,
  RotateCcw,
  ScanFace,
  ShieldCheck,
} from 'lucide-react'
import IndividualCameraPreview from '../components/IndividualCameraPreview'
import PageHeader from '../components/PageHeader'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { getGroupLocation } from '../data/mockData'
import { formatCountdown, getTimeInAccess, getTimeOutAccess } from '../utils/attendance'

const VALID_TYPES = ['time-in', 'time-out']

export default function CapturePage() {
  const { type } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { student, getTodayRecord, setDraft, faceCompleted } = useApp()

  const [captured, setCaptured] = useState(false)
  const [capturedAt, setCapturedAt] = useState(null)
  const [capturing, setCapturing] = useState(false)
  const [locationState, setLocationState] = useState('loading')
  const [now, setNow] = useState(() => Date.now())
  const captureTimer = useRef(null)

  const isValidType = VALID_TYPES.includes(type)
  const isTimeOut = type === 'time-out'
  const groupId = searchParams.get('group') || student.group.id
  const group = student.groups.find((item) => item.id === groupId) ?? null
  const groupRecord = group ? getTodayRecord(group.id) : null
  const alreadyTimedIn = Boolean(groupRecord?.timeIn)
  const alreadyTimedOut = Boolean(groupRecord?.timeOut)
  const hasValidSchedule = Boolean(group?.session?.valid)
  const retrievedLocation = group ? getGroupLocation(group) : null
  const attendancePath = group
    ? `/attendance/details?group=${group.id}`
    : '/attendance/details'
  const timeInAccess = getTimeInAccess(group, now)
  const timeOutAccess = getTimeOutAccess(group, now)

  useEffect(() => {
    return () => {
      if (captureTimer.current) window.clearTimeout(captureTimer.current)
    }
  }, [])

  useEffect(() => {
    if (!isValidType) return undefined
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [isValidType])

  useEffect(() => {
    if (!isValidType) return undefined
    const timer = window.setTimeout(() => setLocationState('ready'), 1100)
    return () => window.clearTimeout(timer)
  }, [isValidType])

  const blockedReason = (() => {
    if (!isValidType) {
      return {
        title: 'Attendance type not found',
        description: 'This page is not available. Return to attendance to start again.',
      }
    }
    if (!group) {
      return {
        title: 'Group not available',
        description:
          'Attendance can only be taken for your assigned RLE groups.',
      }
    }
    if (!faceCompleted) {
      return {
        title: 'Add your face photos first',
        description:
          'Finish your facial registration before taking attendance. Time In and Time Out stay locked until it is complete.',
        actionLabel: 'Open facial registration',
        actionTo: '/face-registration',
      }
    }
    if (!hasValidSchedule) {
      return {
        title: 'Your schedule is not ready yet',
        description:
          'You can take attendance once your RLE Coordinator publishes your duty schedule for today.',
      }
    }
    if (type === 'time-in' && alreadyTimedIn) {
      return {
        title: 'You have already timed in',
        description:
          'Your time in for today is saved. Come back here when your duty ends to time out.',
      }
    }
    if (type === 'time-in' && !timeInAccess.hasSchedule) {
      return {
        title: 'Your duty time is not set yet',
        description:
          'Time In opens 30 minutes before your duty starts. Please check your schedule.',
      }
    }
    if (type === 'time-in' && !timeInAccess.isOpen) {
      return {
        title: 'Time In is not open yet',
        description: `Time In opens at ${timeInAccess.label}, 30 minutes before your ${timeInAccess.startLabel} duty. It opens in ${formatCountdown(
          timeInAccess.remainingMs,
        )}.`,
      }
    }
    if (type === 'time-out' && !alreadyTimedIn) {
      return {
        title: 'Time Out is locked',
        description: 'Please time in first. Time Out unlocks after you have timed in.',
      }
    }
    if (type === 'time-out' && alreadyTimedOut) {
      return {
        title: 'You have already timed out',
        description:
          'Your time in and time out are both saved for today. You can review them in your history.',
      }
    }
    if (type === 'time-out' && !timeOutAccess.hasSchedule) {
      return {
        title: 'Your duty end time is not set yet',
        description:
          'Time Out opens automatically once your duty end time is published.',
      }
    }
    if (type === 'time-out' && !timeOutAccess.isOpen) {
      return {
        title: 'Time Out is not open yet',
        description: `Time Out opens at ${timeOutAccess.label}, when your duty ends. It opens in ${formatCountdown(
          timeOutAccess.remainingMs,
        )}.`,
      }
    }
    return null
  })()

  const handleCapture = () => {
    if (capturing || blockedReason) return
    setCapturing(true)
    captureTimer.current = window.setTimeout(() => {
      setCapturedAt(new Date().toISOString())
      setCaptured(true)
      setCapturing(false)
      toast('Photo captured and matched to your registered face.', 'success')
    }, 650)
  }

  const handleRetake = () => {
    setCaptured(false)
    setCapturedAt(null)
  }

  const handleContinue = () => {
    if (!captured || !capturedAt || locationState === 'loading') return
    const available = locationState === 'ready'

    setDraft({
      type,
      groupId: group.id,
      groupName: group.name,
      studentId: student.id,
      studentName: student.name,
      faceVerified: true,
      capturedAt,
      method: 'Camera capture',
      locationAvailable: available,
      locationName: available ? retrievedLocation.name : 'Location unavailable',
      address: available
        ? retrievedLocation.address
        : 'No location was retrieved.',
      coords: available ? { ...retrievedLocation.coords } : null,
      accuracy: available ? retrievedLocation.accuracy : null,
    })

    navigate(`/attendance/${type}/review?group=${group.id}`)
  }

  if (blockedReason) {
    return (
      <div className="screen">
        <PageHeader
          title={isTimeOut ? 'Time out' : 'Time in'}
          eyebrow="Attendance"
          backTo={attendancePath}
          backLabel="Back to attendance"
        />
        <EmptyState
          icon={Lock}
          title={blockedReason.title}
          description={blockedReason.description}
          action={
            <Button
              variant="secondary"
              onClick={() => navigate(blockedReason.actionTo || attendancePath)}
            >
              {blockedReason.actionLabel || 'Back to attendance'}
            </Button>
          }
        />
      </div>
    )
  }

  const typeLabel = isTimeOut ? 'Time Out' : 'Time In'

  return (
    <div className="screen capture-screen">
      <PageHeader
        title={typeLabel}
        eyebrow={group ? `${group.name} · Take your attendance photo` : 'Take your attendance photo'}
        backTo={attendancePath}
        backLabel="Back to attendance"
      />

      <div className="capture-guide">
        <span className="capture-guide__icon" aria-hidden="true">
          <ScanFace size={19} />
        </span>
        <div>
          <strong>Take your own photo</strong>
          <p>
            Find a well-lit spot, keep your face inside the circle, then tap
            the camera button. We will match it to your registered face.
          </p>
        </div>
      </div>

      <div className="capture-camera-wrap">
        <IndividualCameraPreview
          captured={captured}
          capturedAt={capturedAt}
          studentName={student.name}
        />

        {captured ? (
          <Button
            variant="outline"
            size="sm"
            icon={RotateCcw}
            onClick={handleRetake}
            disabled={capturing}
          >
            Take another photo
          </Button>
        ) : (
          <>
            <div className="capture-controls">
              <button
                type="button"
                className="shutter-button"
                onClick={handleCapture}
                disabled={capturing}
                aria-label="Take your attendance photo"
              >
                {capturing ? (
                  <Loader2 className="spinner" size={25} aria-hidden="true" />
                ) : (
                  <Camera size={25} aria-hidden="true" />
                )}
              </button>
            </div>
            <p className="capture-controls__note">
              {capturing
                ? 'Taking your photo…'
                : 'Tap the camera button when your face is inside the frame.'}
            </p>
          </>
        )}

        <div className="compare-strip is-match">
          <ScanFace size={15} aria-hidden="true" />
          Your photo is matched to your registered facial data.
        </div>
      </div>

      <section className="location-card" aria-labelledby="retrieved-location-title">
        <div className="location-card__head">
          <span className="location-card__icon" aria-hidden="true">
            <MapPin size={18} />
          </span>
          <div className="location-card__head-text">
            <span className="location-card__label" id="retrieved-location-title">
              Your location
            </span>
            {locationState === 'loading' && (
              <div className="location-card__spinner" role="status">
                <Loader2 size={15} aria-hidden="true" />
                Checking your location…
              </div>
            )}
            {locationState === 'ready' && (
              <>
                <span className="location-card__name">{retrievedLocation.name}</span>
                <span className="location-card__address">{retrievedLocation.address}</span>
              </>
            )}
          </div>
          <Badge tone={locationState === 'ready' ? 'violet' : 'neutral'}>
            {locationState === 'ready' ? 'Confirmed' : 'Checking'}
          </Badge>
        </div>

        <div
          className={`compare-strip ${locationState === 'ready' ? 'is-match' : ''}`.trim()}
        >
          {locationState === 'ready' ? (
            <>
              <ShieldCheck size={15} aria-hidden="true" />
              This matches your assigned duty location.
            </>
          ) : (
            <>
              <MapPin size={15} aria-hidden="true" />
              Checking your location against {group.session.facility}…
            </>
          )}
        </div>
      </section>

      <Button
        block
        icon={CheckCircle2}
        onClick={handleContinue}
        disabled={!captured || locationState === 'loading'}
      >
        Continue
      </Button>
      <p className="submit-bar__hint">
        {!captured
          ? 'Take your photo to continue.'
          : locationState === 'loading'
            ? 'Checking your location…'
            : 'Next, check your details and submit your attendance.'}
      </p>
    </div>
  )
}
