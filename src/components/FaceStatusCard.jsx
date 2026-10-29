import { ChevronRight, ScanFace } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Badge from './ui/Badge'

export default function FaceStatusCard() {
  const { faceCompleted, faceCapturedCount } = useApp()
  const total = 5
  const status = faceCompleted ? 'Complete' : faceCapturedCount > 0 ? 'In progress' : 'Not started'

  return (
    <Link className="face-status" to="/face-registration">
      <span className={`face-status__icon ${faceCompleted ? 'is-complete' : ''}`.trim()}>
        <ScanFace size={21} aria-hidden="true" />
      </span>
      <span className="face-status__text">
        <span className="face-status__title">Facial registration</span>
        <span className="face-status__sub">
          {faceCapturedCount} of {total} guided views captured
        </span>
        <span className="face-status__progress" aria-hidden="true">
          <span style={{ width: `${(faceCapturedCount / total) * 100}%` }} />
        </span>
      </span>
      <span className="face-status__end">
        <Badge tone={faceCompleted ? 'success' : faceCapturedCount > 0 ? 'violet' : 'neutral'}>
          {status}
        </Badge>
        <ChevronRight size={17} aria-hidden="true" />
      </span>
    </Link>
  )
}
