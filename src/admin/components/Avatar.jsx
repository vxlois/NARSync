import { getInitials } from '../adminData'

export default function Avatar({ name, size = 'md', tone = 'violet' }) {
  return (
    <span className={`adm-avatar adm-avatar--${size} adm-avatar--${tone}`} aria-hidden="true">
      {getInitials(name)}
    </span>
  )
}
