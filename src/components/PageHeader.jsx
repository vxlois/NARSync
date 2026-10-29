import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function PageHeader({ title, eyebrow, onBack, right, backLabel = 'Go back', backTo }) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) {
      onBack()
      return
    }
    if (backTo) {
      navigate(backTo)
      return
    }
    navigate(-1)
  }

  return (
    <header className="page-header">
      <button
        className="icon-button"
        type="button"
        onClick={handleBack}
        aria-label={backLabel}
      >
        <ArrowLeft size={20} aria-hidden="true" />
      </button>
      <div className="page-header__text">
        {eyebrow && <p className="page-header__eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
      </div>
      {right ? <div className="page-header__right">{right}</div> : null}
    </header>
  )
}
