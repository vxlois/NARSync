import { Inbox } from 'lucide-react'

export default function EmptyState({ title = 'Nothing to show yet', description, icon: Icon = Inbox, action }) {
  return (
    <div className="adm-empty">
      <span className="adm-empty__icon" aria-hidden="true">
        <Icon size={22} />
      </span>
      <div>
        <h3>{title}</h3>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  )
}
