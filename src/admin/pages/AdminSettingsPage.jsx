import { useMemo, useState } from 'react'
import {
  Bell,
  Check,
  CheckCircle2,
  Eye,
  MapPin,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  UserCog,
} from 'lucide-react'
import { useAdmin } from '../AdminContext'
import { ROLE_DEFINITIONS } from '../adminData'
import { useToast } from '../../context/ToastContext'
import Avatar from '../components/Avatar'
import ViewOnlyNotice from '../components/ViewOnlyNotice'

const ACCESS_ROWS = [
  { section: 'Students & groups', coordinator: 'Manage', departmentHead: 'View' },
  { section: 'Schedules & locations', coordinator: 'Manage', departmentHead: 'View' },
  { section: 'Attendance records', coordinator: 'Manage & export', departmentHead: 'View & export' },
  { section: 'Reports', coordinator: 'Export', departmentHead: 'View & export' },
  { section: 'Settings', coordinator: 'Manage', departmentHead: 'View' },
]

function Toggle({ label, description, checked, onChange, disabled }) {
  return (
    <label className={`adm-toggle-row ${disabled ? 'is-disabled' : ''}`}>
      <span>
        <strong>{label}</strong>
        {description && <small>{description}</small>}
      </span>
      <input
        type="checkbox"
        className="adm-switch"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        disabled={disabled}
      />
    </label>
  )
}

function SliderField({
  label,
  hint,
  value,
  min,
  max,
  step = 1,
  suffix,
  onChange,
  disabled,
}) {
  const fill = `${((value - min) / (max - min)) * 100}%`

  return (
    <label className={`adm-slider ${disabled ? 'is-disabled' : ''}`}>
      <span className="adm-slider__head">
        <span>{label}</span>
        <strong>
          {value}
          {suffix && <em>{suffix}</em>}
        </strong>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(event) => onChange(Number(event.target.value))}
        disabled={disabled}
        style={{ '--adm-slider-fill': fill }}
      />
      <span className="adm-slider__scale" aria-hidden="true">
        <span>{min}{suffix ? ` ${suffix}` : ''}</span>
        <span>{max}{suffix ? ` ${suffix}` : ''}</span>
      </span>
      {hint && <small>{hint}</small>}
    </label>
  )
}

export default function AdminSettingsPage() {
  const { settings, canManage, role, setRole, updateSettings } = useAdmin()
  const { toast } = useToast()
  const [form, setForm] = useState({ ...settings })

  const isDirty = useMemo(
    () => Object.keys(settings).some((key) => form[key] !== settings[key]),
    [form, settings],
  )

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const handleSave = () => {
    if (!isDirty) return
    updateSettings(form)
    toast('Settings saved.', 'success')
  }

  const switchRole = (nextRole) => {
    if (nextRole === role) return
    setRole(nextRole)
    toast(`Now viewing as ${ROLE_DEFINITIONS[nextRole].label}.`, 'success')
  }

  return (
    <div className="adm-page">
      {!canManage && (
        <ViewOnlyNotice message="Switch to the RLE Coordinator profile to make changes." />
      )}

      <div className="adm-settings-columns">
        <div className="adm-settings-col">
          <section className="adm-card" aria-labelledby="profile-settings-title">
            <div className="adm-card__head">
              <h3 id="profile-settings-title">Profile</h3>
              <UserCog size={19} aria-hidden="true" />
            </div>
            <p className="adm-card__description">Switch to preview each role.</p>

            <div className="adm-role-grid">
              {Object.values(ROLE_DEFINITIONS).map((roleOption) => {
                const selected = roleOption.id === role
                return (
                  <button
                    type="button"
                    key={roleOption.id}
                    className={`adm-role-option ${selected ? 'is-selected' : ''}`}
                    onClick={() => switchRole(roleOption.id)}
                    aria-pressed={selected}
                  >
                    <Avatar name={roleOption.name} size="md" />
                    <span>
                      <strong>{roleOption.name}</strong>
                      <span>{roleOption.label}</span>
                    </span>
                    {selected ? (
                      <span className="adm-role-option__check" aria-label="Current profile">
                        <Check size={15} aria-hidden="true" />
                      </span>
                    ) : (
                      <span className="adm-role-option__switch">Switch</span>
                    )}
                  </button>
                )
              })}
            </div>
          </section>

          <section className="adm-card" aria-labelledby="access-matrix-title">
            <div className="adm-card__head">
              <h3 id="access-matrix-title">Access</h3>
              <ShieldCheck size={19} aria-hidden="true" />
            </div>

            <div className="adm-table-wrap">
              <table className="adm-table adm-table--compact adm-access-table">
                <thead>
                  <tr>
                    <th>Section</th>
                    <th>Coordinator</th>
                    <th>Department Head</th>
                  </tr>
                </thead>
                <tbody>
                  {ACCESS_ROWS.map((row) => (
                    <tr key={row.section}>
                      <td>{row.section}</td>
                      <td>
                        <span className="adm-access-cell adm-access-cell--manage">
                          <CheckCircle2 size={13} aria-hidden="true" />
                          {row.coordinator}
                        </span>
                      </td>
                      <td>
                        <span className="adm-access-cell">
                          <Eye size={13} aria-hidden="true" />
                          {row.departmentHead}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="adm-settings-col">
          <section className="adm-card" aria-labelledby="rules-settings-title">
            <div className="adm-card__head">
              <h3 id="rules-settings-title">Attendance rules</h3>
              <SlidersHorizontal size={19} aria-hidden="true" />
            </div>

            <div className="adm-slider-grid">
              <SliderField
                label="Late grace period"
                hint="Time-ins after this are late."
                value={form.gracePeriod}
                min={0}
                max={60}
                suffix="min"
                onChange={(value) => update('gracePeriod', value)}
                disabled={!canManage}
              />
              <SliderField
                label="Face match threshold"
                hint="Minimum accepted confidence."
                value={form.faceMatchThreshold}
                min={50}
                max={100}
                suffix="%"
                onChange={(value) => update('faceMatchThreshold', value)}
                disabled={!canManage}
              />
            </div>

            <div className="adm-toggle-group">
              <p className="adm-toggle-group__head">
                <MapPin size={15} aria-hidden="true" />
                Verification
              </p>
              <div className="adm-toggle-list">
                <Toggle
                  label="Require geofence"
                  description="Check submissions are within the location radius."
                  checked={form.requireGeofence}
                  onChange={(value) => update('requireGeofence', value)}
                  disabled={!canManage}
                />
              </div>
            </div>
          </section>

          <section className="adm-card" aria-labelledby="notifications-settings-title">
            <div className="adm-card__head">
              <h3 id="notifications-settings-title">Notifications</h3>
              <Bell size={19} aria-hidden="true" />
            </div>

            <div className="adm-toggle-list">
              <Toggle
                label="Attendance alerts"
                description="When late or incomplete attendance is recorded."
                checked={form.notifyAttendance}
                onChange={(value) => update('notifyAttendance', value)}
                disabled={!canManage}
              />
              <Toggle
                label="Registration reminders"
                description="When captures are incomplete."
                checked={form.notifyRegistration}
                onChange={(value) => update('notifyRegistration', value)}
                disabled={!canManage}
              />
              <Toggle
                label="Schedule alerts"
                description="When schedules are published."
                checked={form.notifySchedules}
                onChange={(value) => update('notifySchedules', value)}
                disabled={!canManage}
              />
            </div>

            <div className="adm-digest-row">
              <span>
                <strong>Email digest</strong>
                <small>Workspace activity summary.</small>
              </span>
              <select
                value={form.emailDigest}
                aria-label="Email digest frequency"
                onChange={(event) => update('emailDigest', event.target.value)}
                disabled={!canManage}
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Off">Off</option>
              </select>
            </div>
          </section>
        </div>
      </div>

      {canManage && (
        <div className="adm-form-actions adm-form-actions--bar adm-settings-bar">
          <span
            className={`adm-settings-status ${isDirty ? 'is-dirty' : 'is-saved'}`}
            aria-live="polite"
          >
            {isDirty ? 'Unsaved changes' : 'All changes saved'}
          </span>
          <button
            type="button"
            className="adm-btn adm-btn--primary"
            onClick={handleSave}
            disabled={!isDirty}
          >
            <Save size={16} aria-hidden="true" />
            Save changes
          </button>
        </div>
      )}
    </div>
  )
}
