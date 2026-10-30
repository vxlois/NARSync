export default function PageIntro({ eyebrow, title, description, actions, meta }) {
  return (
    <div className="adm-page-intro">
      <div className="adm-page-intro__copy">
        {eyebrow && <p className="adm-eyebrow">{eyebrow}</p>}
        {title && <h2>{title}</h2>}
        {description && <p className="adm-page-intro__description">{description}</p>}
        {meta && <div className="adm-page-intro__meta">{meta}</div>}
      </div>
      {actions && <div className="adm-page-intro__actions">{actions}</div>}
    </div>
  )
}
