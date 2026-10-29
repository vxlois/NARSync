import { Info } from 'lucide-react'

export default function DemoNotice({ children, tone = 'default', icon: Icon = Info, className = '' }) {
  return (
    <div className={`notice ${tone !== 'default' ? `notice--${tone}` : ''} ${className}`.trim()}>
      <Icon size={16} aria-hidden="true" />
      <div className="notice__body">{children}</div>
    </div>
  )
}
