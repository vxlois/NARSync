import { statusMeta } from '../utils/attendance'
import Badge from './ui/Badge'

export default function StatusPill({ record }) {
  const meta = statusMeta(record)
  return (
    <Badge tone={meta.tone} dot>
      {meta.label}
    </Badge>
  )
}
