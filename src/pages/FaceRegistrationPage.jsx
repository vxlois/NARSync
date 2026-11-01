import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Camera,
  Check,
  CheckCircle2,
  Loader2,
  RotateCcw,
  ScanFace,
} from 'lucide-react'
import DemoNotice from '../components/DemoNotice'
import PageHeader from '../components/PageHeader'
import { ConfirmSheet } from '../components/ui/Sheet'
import Button from '../components/ui/Button'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { FACE_VIEWS } from '../data/mockData'
import { formatDateMedium } from '../utils/format'

export default function FaceRegistrationPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const {
    faceViews,
    faceCapturedCount,
    faceCompleted,
    faceCompletedAt,
    captureFaceView,
    completeFaceRegistration,
    resetFaceRegistration,
  } = useApp()

  const [activeId, setActiveId] = useState(
    () => FACE_VIEWS.find((view) => !faceViews[view.id])?.id ?? FACE_VIEWS[0].id,
  )
  const [scanningId, setScanningId] = useState(null)
  const [resetOpen, setResetOpen] = useState(false)
  const [error, setError] = useState('')
  const timers = useRef([])

  useEffect(() => {
    const activeTimers = timers.current
    return () => {
      activeTimers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [])

  const schedule = (callback, delay) => {
    const timer = window.setTimeout(callback, delay)
    timers.current.push(timer)
    return timer
  }

  const activeView = FACE_VIEWS.find((view) => view.id === activeId) ?? FACE_VIEWS[0]
  const activeIndex = FACE_VIEWS.findIndex((view) => view.id === activeView.id)
  const isCaptured = Boolean(faceViews[activeView.id])

  const handleCapture = () => {
    if (scanningId) return
    setError('')
    const viewId = activeView.id
    setScanningId(viewId)

    schedule(() => {
      captureFaceView(viewId)
      setScanningId(null)
      const next = FACE_VIEWS.find(
        (view) => view.id !== viewId && !faceViews[view.id],
      )
      if (next) {
        schedule(() => setActiveId(next.id), 550)
      }
    }, 950)
  }

  const handleComplete = () => {
    setError('')
    try {
      completeFaceRegistration()
      toast('Facial registration marked complete.', 'success')
      navigate('/dashboard')
    } catch (completionError) {
      setError(completionError.message)
    }
  }

  const handleReset = () => {
    resetFaceRegistration()
    setActiveId(FACE_VIEWS[0].id)
    setResetOpen(false)
    toast('Facial registration has been reset.', 'default')
  }

  const handleDemoFill = () => {
    if (scanningId) return
    FACE_VIEWS.forEach((view) => captureFaceView(view.id))
    setActiveId(FACE_VIEWS[FACE_VIEWS.length - 1].id)
    toast('All five views captured.', 'success')
  }

  return (
    <div className="screen">
      <PageHeader
        title="Facial registration"
        eyebrow="Identity setup"
        backTo="/dashboard"
        backLabel="Back to dashboard"
      />

      {faceCompleted && (
        <div className="face-complete-panel">
          <div className="face-complete-panel__head">
            <CheckCircle2 size={20} aria-hidden="true" />
            <div>
              <h2>Facial registration complete</h2>
              <p>
                Completed {formatDateMedium(faceCompletedAt)}. You can retake any view.
              </p>
            </div>
          </div>
          <div className="row">
            <Button
              variant="outline"
              size="sm"
              icon={RotateCcw}
              onClick={() => setResetOpen(true)}
            >
              Reset registration
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              Back to dashboard
            </Button>
          </div>
        </div>
      )}

      <section className="face-progress" aria-label="Facial view progress">
        <div className="face-progress__head">
          <p>Guided views</p>
          <span>{faceCapturedCount} of 5 complete</span>
        </div>
        <div
          className="face-progress__track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={5}
          aria-valuenow={faceCapturedCount}
          aria-label="Facial views captured"
        >
          <span style={{ width: `${(faceCapturedCount / 5) * 100}%` }} />
        </div>
        <div className="face-steps">
          {FACE_VIEWS.map((view, index) => {
            const complete = faceViews[view.id]
            const active = view.id === activeId
            return (
              <button
                key={view.id}
                type="button"
                className={`face-step ${active ? 'is-active' : ''} ${complete ? 'is-complete' : ''}`.trim()}
                onClick={() => setActiveId(view.id)}
                disabled={Boolean(scanningId)}
                aria-label={`${view.label} view${complete ? ', captured' : ''}`}
                aria-current={active ? 'step' : undefined}
              >
                <span className="face-step__dot">
                  {complete ? <Check size={13} strokeWidth={3} aria-hidden="true" /> : index + 1}
                </span>
                {view.label}
              </button>
            )
          })}
        </div>
      </section>

      <div className="face-camera-wrap">
        <div
          className={`face-camera is-${activeView.id} ${isCaptured ? 'is-captured' : ''}`.trim()}
          aria-label={`Camera preview for the ${activeView.label.toLowerCase()} facial view`}
        >
          <span className="face-camera__ring" aria-hidden="true" />
          {!isCaptured && !scanningId && (
            <span className="face-camera__scanline" aria-hidden="true" />
          )}
          <div className="face-camera__silhouette" aria-hidden="true">
            <div className="face-shape__head" />
            <div className="face-shape__shoulders" />
          </div>
          <span className="face-camera__view">{activeView.label} view</span>

          {scanningId === activeView.id && (
            <div className="face-camera__scanning" role="status">
              <Loader2 className="spinner" size={24} aria-hidden="true" />
              Scanning…
            </div>
          )}
          {isCaptured && scanningId !== activeView.id && (
            <div className="face-camera__captured" role="status">
              <CheckCircle2 size={30} aria-hidden="true" />
              <span>View captured</span>
            </div>
          )}
        </div>

        <div className="face-instruction">
          <p className="eyebrow">
            View {activeIndex + 1} of 5 · {activeView.label}
          </p>
          <h2>{activeView.label} view</h2>
          <p>{activeView.instruction}</p>
          <p className="small muted" style={{ marginTop: 3 }}>{activeView.hint}</p>
        </div>

        <div className="face-capture-actions">
          <Button
            block
            icon={Camera}
            onClick={handleCapture}
            loading={scanningId === activeView.id}
            disabled={Boolean(scanningId)}
          >
            {isCaptured ? `Retake ${activeView.label.toLowerCase()} view` : `Capture ${activeView.label.toLowerCase()} view`}
          </Button>
        </div>
      </div>

      {error && (
        <DemoNotice tone="danger">
          {error}
        </DemoNotice>
      )}

      {faceCapturedCount === 5 && !faceCompleted && (
        <div className="face-complete-panel">
          <div className="face-complete-panel__head">
            <CheckCircle2 size={20} aria-hidden="true" />
            <div>
              <h2>All five views captured</h2>
              <p>
                Finish registration to mark your facial registration as complete on the
                dashboard.
              </p>
            </div>
          </div>
          <Button
            block
            icon={ScanFace}
            onClick={handleComplete}
          >
            Complete registration
          </Button>
        </div>
      )}

      <button type="button" className="text-link" onClick={handleDemoFill} disabled={Boolean(scanningId)}>
        Fill all five views automatically
      </button>

      <ConfirmSheet
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={handleReset}
        title="Reset facial registration?"
        description="This clears all five captured views and removes the completed status from your dashboard. This cannot be undone."
        confirmLabel="Reset Data"
        tone="danger"
        icon={RotateCcw}
      />
    </div>
  )
}
