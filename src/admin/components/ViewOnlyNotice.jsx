import { ShieldCheck } from 'lucide-react'

export default function ViewOnlyNotice({ message }) {
  return (
    <div className="adm-view-only" role="note">
      <ShieldCheck size={17} aria-hidden="true" />
      <p>
        <strong>Department Head · view-only.</strong>{' '}
        {message || 'Management actions are disabled. Switch to the RLE Coordinator profile to make changes.'}
      </p>
    </div>
  )
}
