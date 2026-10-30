import { useState } from 'react'
import {
  Bell,
  Check,
  CheckCircle2,
  Eye,
  GraduationCap,
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
import PageIntro from '../components/PageIntro'
import ViewOnlyNotice from '../components/ViewOnlyNotice'

/**
 * Grouped so the matrix stays short: the Coordinator manages workspace data,
 * while the Department Head observes and exports.
 */
const ACCESS_ROWS = [
  { section: 'Students & groups', coordinator: 'Manage assignments', departmentHead: 'View progress' },
  { section: 'Duty schedules & locations', coordinator: 'Create & publish', departmentHead: 'View' },
  { section: 'Attendance & flagged records', coordinator: 'Review & resolve', departmentHead: 'View & export' },
  { section: 'Reports', coordinator: 'Generate & export', departmentHead: 'View & export' },
  { section: 'Workspace settings', coordinator: 'Configure', departmentHead: 'View only' },
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
  const { settings, canManage, role, setRole, currentUser, updateSettings } = useAdmin()
  const { toast } = useToast()
  const [form, setForm] = useState({ ...settings })

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const handleSave = () => {
    updateSettings(form)
    toast('Workspace settings saved.', 'success')
  }

  const switchRole = (nextRole) => {
    if (nextRole === role) return
    setRole(nextRole)
    toast(`Now viewing as ${ROLE_DEFINITIONS[nextRole].label}.`, 'success')
  }

  return (
    <div className="adm-page">
      <PageIntro
        eyebrow="Workspace administration"
        title="Settings"
        meta={
          <>
            <span className="adm-meta-pill"><strong>{currentUser.label}</strong></span>
            <span className="adm-meta-pill">Prototype configuration</span>
          </>
        }
        actions={
          <button
            type="button"
            className="adm-btn adm-btn--primary"
            onClick={handleSave}
            disabled={!canManage}
            title={!canManage ? 'Department Head access is view-only.' : undefined}
          >
            <Save size={16} aria-hidden="true" />
            Save settings
          </button>
        }
      />

      {!canManage && (
        <ViewOnlyNotice message="Settings can be reviewed, but changes are restricted to the RLE Coordinator." />
      )}

      <div className="adm-settings-columns">
        <div className="adm-settings-col">
          <section className="adm-card" aria-labelledby="profile-settings-title">
            <div className="adm-card__head">
              <div>
                <p className="adm-eyebrow">Workspace profile &amp; role</p>
                <h3 id="profile-settings-title">Active profile</h3>
              </div>
              <UserCog size={19} aria-hidden="true" />
            </div>

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
                      <small>{roleOption.scope}</small>
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

            <div className="adm-profile-list">
              <div>
                <span>Workspace</span>
                <strong>RLE Attendance Monitoring</strong>
              </div>
              <div>
                <span>College</span>
                <strong>
                  <GraduationCap size={13} aria-hidden="true" />
                  Nursing Department
                </strong>
              </div>
              <div>
                <span>University</span>
                <strong>Bicol University Polangui</strong>
              </div>
            </div>
          </section>

          <section className="adm-card" aria-labelledby="access-matrix-title">
            <div className="adm-card__head">
              <div>
                <p className="adm-eyebrow">Role-based access</p>
                <h3 id="access-matrix-title">Section permissions</h3>
              </div>
              <ShieldCheck size={19} aria-hidden="true" />
            </div>

            <div className="adm-table-wrap">
              <table className="adm-table adm-table--compact adm-access-table">
                <thead>
                  <tr>
                    <th>Section</th>
                    <th>RLE Coordinator</th>
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

            <p className="adm-fineprint adm-access-note">
              Management actions stay with the RLE Coordinator. Department Head accounts can view
              every section and export reports.
            </p>
          </section>
        </div>

        <div className="adm-settings-col">
          <section className="adm-card" aria-labelledby="rules-settings-title">
            <div className="adm-card__head">
              <div>
                <p className="adm-eyebrow">Attendance &amp; notification rules</p>
                <h3 id="rules-settings-title">Verification defaults</h3>
              </div>
              <SlidersHorizontal size={19} aria-hidden="true" />
            </div>

            <div className="adm-slider-grid">
              <SliderField
                label="Late grace period"
                hint="Time-ins after this window are marked late."
                value={form.gracePeriod}
                min={0}
                max={60}
                suffix="min"
                onChange={(value) => update('gracePeriod', value)}
                disabled={!canManage}
              />
              <SliderField
                label="Face match threshold"
                hint="Minimum confidence accepted for a facial match."
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
                Geofencing &amp; verification
              </p>
              <div className="adm-toggle-list">
                <Toggle
                  label="Require geofence verification"
                  description="Check that submissions are within the location radius."
                  checked={form.requireGeofence}
                  onChange={(value) => update('requireGeofence', value)}
                  disabled={!canManage}
                />
                <Toggle
                  label="Auto-flag location mismatches"
                  description="Open a review flag for submissions outside the radius."
                  checked={form.autoFlagLocation}
                  onChange={(value) => update('autoFlagLocation', value)}
                  disabled={!canManage}
                />
                <Toggle
                  label="Auto-flag low facial match scores"
                  description="Open a flag when a capture falls below the threshold."
                  checked={form.autoFlagFaceMatch}
                  onChange={(value) => update('autoFlagFaceMatch', value)}
                  disabled={!canManage}
                />
              </div>
            </div>

            <div className="adm-toggle-group">
              <p className="adm-toggle-group__head">
                <Bell size={15} aria-hidden="true" />
                Notifications
              </p>
              <div className="adm-toggle-list">
                <Toggle
                  label="Flag review alerts"
                  description="Notify coordinators when a new flag is opened."
                  checked={form.notifyFlags}
                  onChange={(value) => update('notifyFlags', value)}
                  disabled={!canManage}
                />
                <Toggle
                  label="Facial registration reminders"
                  description="Remind groups with incomplete member captures."
                  checked={form.notifyRegistration}
                  onChange={(value) => update('notifyRegistration', value)}
                  disabled={!canManage}
                />
                <Toggle
                  label="Schedule publishing alerts"
                  description="Notify the department when schedules are published."
                  checked={form.notifySchedules}
                  onChange={(value) => update('notifySchedules', value)}
                  disabled={!canManage}
                />
              </div>

              <div className="adm-digest-row">
                <span>
                  <strong>Email digest</strong>
                  <small>Summary of workspace activity.</small>
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
            </div>

            <p className="adm-settings-note">
              <MapPin size={14} aria-hidden="true" />
              Demonstration values only. No live GPS or facial recognition service is connected.
            </p>
          </section>

          {canManage && (
            <div className="adm-form-actions adm-form-actions--end">
              <button type="button" className="adm-btn adm-btn--primary" onClick={handleSave}>
                <Save size={16} aria-hidden="true" />
                Save settings
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
