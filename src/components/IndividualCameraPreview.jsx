import { CheckCircle2, ScanFace, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { formatClock } from '../utils/format'

/**
 * Simulated camera preview for individual attendance photos. The photo is
 * matched against the student's registered facial data before submission.
 */
export default function IndividualCameraPreview({
  captured = false,
  capturedAt = null,
  studentName = '',
}) {
  const [now, setNow] = useState(() => new Date().toISOString())

  useEffect(() => {
    if (captured) return undefined
    const timer = window.setInterval(() => setNow(new Date().toISOString()), 1000)
    return () => window.clearInterval(timer)
  }, [captured])

  const clock = captured && capturedAt ? capturedAt : now

  return (
    <div className={`camera-preview ${captured ? 'is-captured' : ''}`.trim()}>
      <div className="camera-preview__top">
        <span className="camera-preview__demo">
          <span className="camera-preview__dot" aria-hidden="true" />
          Camera preview
        </span>
        <span className="camera-preview__clock">{formatClock(clock)}</span>
      </div>

      <div className="camera-preview__stage">
        <span className="camera-corner camera-corner--tl" aria-hidden="true" />
        <span className="camera-corner camera-corner--tr" aria-hidden="true" />
        <span className="camera-corner camera-corner--bl" aria-hidden="true" />
        <span className="camera-corner camera-corner--br" aria-hidden="true" />
        <span className="camera-preview__grid" aria-hidden="true" />

        <div className="individual-silhouette" aria-hidden="true">
          <span className="individual-silhouette__ring" />
          <UserRound size={92} strokeWidth={1.1} />
        </div>

        <p className="camera-preview__guide">
          {captured
            ? 'Your photo is ready'
            : 'Position your face inside the frame'}
        </p>

        {!captured && studentName && (
          <p className="camera-preview__identity">
            <ScanFace size={13} aria-hidden="true" />
            Matching against {studentName}&apos;s registered face
          </p>
        )}

        {captured && (
          <div className="camera-preview__captured" role="status">
            <CheckCircle2 size={22} aria-hidden="true" />
            <span>Photo captured</span>
            <small>Individual photo · Face matched</small>
          </div>
        )}
      </div>

      <div className="camera-preview__bottom">
        <span>Individual photo evidence</span>
        <span>Registered facial data</span>
      </div>
    </div>
  )
}
