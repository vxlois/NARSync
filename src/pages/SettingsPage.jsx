import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BellRing,
  ChevronRight,
  Info,
  LogOut,
  Navigation,
  RotateCcw,
  Smartphone,
} from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { ConfirmSheet } from '../components/ui/Sheet'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'

function ToggleRow({ icon: Icon, title, description, checked, onChange, label }) {
  return (
    <div className="setting-row">
      <span className="setting-row__icon" aria-hidden="true">
        <Icon size={17} />
      </span>
      <div className="setting-row__text">
        <span className="setting-row__title">{title}</span>
        <span className="setting-row__sub">{description}</span>
      </div>
      <button
        type="button"
        className="switch"
        role="switch"
        aria-checked={checked}
        aria-label={label || title}
        onClick={() => onChange(!checked)}
      />
    </div>
  )
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { settings, updateSetting, resetDemoData, logout } = useApp()
  const [resetOpen, setResetOpen] = useState(false)
  const [signOutOpen, setSignOutOpen] = useState(false)

  const handleReset = () => {
    resetDemoData()
    setResetOpen(false)
    toast('Data reset to the starting state.', 'success')
  }

  const handleSignOut = () => {
    setSignOutOpen(false)
    logout()
    navigate('/login', { replace: true })
    toast('Signed out of your student account.', 'default')
  }

  return (
    <div className="screen">
      <PageHeader
        title="Settings"
        eyebrow="Preferences"
        backTo="/profile"
        backLabel="Back to profile"
      />

      <section className="settings-group">
        <h2 className="profile-section-title">Attendance</h2>
        <div className="settings-card">
          <ToggleRow
            icon={BellRing}
            title="Attendance reminders"
            description="Show reminder prompts around your duty schedule."
            checked={settings.reminders}
            onChange={(value) => updateSetting('reminders', value)}
          />
          <ToggleRow
            icon={Navigation}
            title="Location review reminder"
            description="Prompt me to check the location before submitting."
            checked={settings.locationReminder}
            onChange={(value) => updateSetting('locationReminder', value)}
          />
          <ToggleRow
            icon={Smartphone}
            title="Haptic feedback"
            description="Use subtle vibration cues where supported."
            checked={settings.haptics}
            onChange={(value) => updateSetting('haptics', value)}
          />
        </div>
      </section>

      <section className="settings-group">
        <h2 className="profile-section-title">Data</h2>
        <div className="settings-card">
          <button
            type="button"
            className="setting-row setting-row--button setting-row--danger"
            onClick={() => setResetOpen(true)}
          >
            <span className="setting-row__icon" aria-hidden="true">
              <RotateCcw size={17} />
            </span>
            <span className="setting-row__text">
              <span className="setting-row__title">Reset Data</span>
              <span className="setting-row__sub">
                Clear facial views, attendance submissions, and preferences.
              </span>
            </span>
            <ChevronRight size={17} className="profile-link__chevron" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="setting-row setting-row--button"
            onClick={() => setSignOutOpen(true)}
          >
            <span className="setting-row__icon" aria-hidden="true">
              <LogOut size={17} />
            </span>
            <span className="setting-row__text">
              <span className="setting-row__title">Sign out</span>
              <span className="setting-row__sub">Return to the sign-in screen.</span>
            </span>
            <ChevronRight size={17} className="profile-link__chevron" aria-hidden="true" />
          </button>
        </div>
      </section>

      <section className="settings-group">
        <h2 className="profile-section-title">About</h2>
        <div className="about-card">
          <div className="about-card__top">
            <span className="about-card__mark" aria-hidden="true">N</span>
            <div>
              <h2>NARSync student app</h2>
              <p>RLE attendance monitoring</p>
            </div>
            <Info size={17} className="muted" aria-hidden="true" style={{ marginLeft: 'auto' }} />
          </div>
          <div className="about-card__version">
            <span>Version 0.1.0</span>
          </div>
        </div>
      </section>

      <ConfirmSheet
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={handleReset}
        title="Reset all data?"
        description="This clears the facial registration views, all attendance submissions made in this session, and your attendance preferences. Your sign-in remains active."
        confirmLabel="Reset Data"
        tone="danger"
        icon={RotateCcw}
      />

      <ConfirmSheet
        open={signOutOpen}
        onClose={() => setSignOutOpen(false)}
        onConfirm={handleSignOut}
        title="Sign out of NARSync?"
        description="Your current session state will be cleared from the app. You can sign back in with the same account."
        confirmLabel="Sign out"
        tone="danger"
        icon={LogOut}
      />
    </div>
  )
}
