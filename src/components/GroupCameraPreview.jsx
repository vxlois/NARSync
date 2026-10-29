import { CheckCircle2, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { formatClock } from '../utils/format'

export default function GroupCameraPreview({ captured = false, capturedAt = null }) {
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
          Demo camera
        </span>
        <span className="camera-preview__clock">{formatClock(clock)}</span>
      </div>

      <div className="camera-preview__stage">
        <span className="camera-corner camera-corner--tl" aria-hidden="true" />
        <span className="camera-corner camera-corner--tr" aria-hidden="true" />
        <span className="camera-corner camera-corner--bl" aria-hidden="true" />
        <span className="camera-corner camera-corner--br" aria-hidden="true" />
        <span className="camera-preview__grid" aria-hidden="true" />

        <div className="group-silhouette" aria-hidden="true">
          <span className="group-silhouette__person group-silhouette__person--1">
            <UserRound size={54} strokeWidth={1.2} />
          </span>
          <span className="group-silhouette__person group-silhouette__person--2">
            <UserRound size={46} strokeWidth={1.2} />
          </span>
          <span className="group-silhouette__person group-silhouette__person--3">
            <UserRound size={46} strokeWidth={1.2} />
          </span>
          <span className="group-silhouette__person group-silhouette__person--4">
            <UserRound size={40} strokeWidth={1.2} />
          </span>
          <span className="group-silhouette__person group-silhouette__person--5">
            <UserRound size={40} strokeWidth={1.2} />
          </span>
        </div>

        <p className="camera-preview__guide">
          {captured ? 'Demo group photo ready' : 'Position the whole group inside the frame'}
        </p>

        {captured && (
          <div className="camera-preview__captured" role="status">
            <CheckCircle2 size={22} aria-hidden="true" />
            <span>Photo captured</span>
            <small>Demo evidence</small>
          </div>
        )}
      </div>

      <div className="camera-preview__bottom">
        <span>Simulated preview</span>
        <span>Camera access is not used</span>
      </div>
    </div>
  )
}
