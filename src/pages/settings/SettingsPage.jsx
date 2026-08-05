import { useState } from 'react'
import { PageHeader, Card } from '../../components/ui/display'
import { Input, Switch } from '../../components/ui/inputs'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { useTheme } from '../../store/ThemeProvider'
import { useAuth } from '../../store/AuthProvider'
import { useToast } from '../../store/ToastProvider'
import { useLocalStorage } from '../../hooks'
import { resetApplication } from '../../services/reset'
import Icon from '../../components/Icon'

function SettingCard({ title, eyebrow, description, children }) {
  return (
    <Card>
      <div className="setting-card-head">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h3>{title}</h3>
          {description && <p className="card-desc">{description}</p>}
        </div>
      </div>
      <div className="setting-card-body">{children}</div>
    </Card>
  )
}

export function Settings() {
  const { theme, setTheme } = useTheme()
  const { user, updateProfile, isAdmin } = useAuth()
  const toast = useToast()
  const [resetOpen, setResetOpen] = useState(false)
  const [profile, setProfile] = useLocalStorage('aquaflow-profile-draft', {
    name: user?.name || 'Amira Nasser',
    email: user?.email || 'amira@aquaflow.com',
    phone: user?.phone || '+1 (555) 012-7788',
    company: 'AquaFlow Shipping',
  })
  const [notifPrefs, setNotifPrefs] = useLocalStorage('aquaflow-notif-prefs', {
    weather: true,
    delays: true,
    maintenance: true,
    payments: true,
    system: true,
  })
  const [security, setSecurity] = useLocalStorage('aquaflow-security', { twoFactor: false, sessionAlerts: true })

  const saveProfile = () => {
    updateProfile(profile)
    toast.success('Your profile has been updated.', { title: 'Saved' })
  }

  const togglePref = (key) => setNotifPrefs((p) => ({ ...p, [key]: !p[key] }))

  return (
    <div className="page">
      <PageHeader
        eyebrow="Configuration"
        title="Settings"
        description="Manage your theme, profile, security, and notification preferences."
        breadcrumbs={[{ label: 'System' }, { label: 'Settings' }]}
      />

      <div className="settings-layout">
        <div className="stack">
          <SettingCard eyebrow="Appearance" title="Theme">
            <div className="row">
              {['light', 'dark', 'system'].map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`theme-option ${theme === t ? 'is-selected' : ''}`}
                  onClick={() => setTheme(t)}
                  aria-pressed={theme === t}
                >
                  <span className={`theme-swatch theme-swatch--${t}`} aria-hidden="true" />
                  <span>{t[0].toUpperCase() + t.slice(1)}</span>
                </button>
              ))}
            </div>
            <p className="field-hint">Choose between light, dark, or follow your system preference.</p>
          </SettingCard>

          <SettingCard eyebrow="Profile" title="Personal Information">
            <div className="grid grid-2">
              <Input label="Full name" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} icon="user" />
              <Input label="Email" type="email" value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} icon="mail" />
              <Input label="Phone" value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} icon="phone" />
              <Input label="Company" value={profile.company} onChange={(e) => setProfile((p) => ({ ...p, company: e.target.value }))} icon="container" />
            </div>
            <div className="row" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
              <Button variant="outline" onClick={() => setProfile({ name: user?.name || 'Amira Nasser', email: user?.email || 'amira@aquaflow.com', phone: user?.phone || '', company: 'AquaFlow Shipping' })}>
                Reset
              </Button>
              <Button onClick={saveProfile}>
                Save changes
              </Button>
            </div>
          </SettingCard>
        </div>

        <div className="stack">
          <SettingCard eyebrow="Security" title="Account Security">
            <div className="switch-list">
              <Switch
                label="Two-factor authentication"
                description="Require a verification code on sign-in from new devices."
                checked={security.twoFactor}
                onChange={(e) => setSecurity((s) => ({ ...s, twoFactor: e.target.checked }))}
              />
              <Switch
                label="Login alerts"
                description="Notify me when a new device signs in to my account."
                checked={security.sessionAlerts}
                onChange={(e) => setSecurity((s) => ({ ...s, sessionAlerts: e.target.checked }))}
              />
            </div>
            <div className="row" style={{ marginTop: 8 }}>
              <Button variant="outline" size="sm">
                <Icon name="lock" size={15} />
                <span>Change password</span>
              </Button>
            </div>
          </SettingCard>

          <SettingCard eyebrow="Notifications" title="Alert Preferences">
            <div className="switch-list">
              <Switch label="Weather alerts" description="Storm warnings and adverse conditions on active routes." checked={notifPrefs.weather} onChange={() => togglePref('weather')} />
              <Switch label="Shipment delays" description="ETA changes and congestion-driven delays." checked={notifPrefs.delays} onChange={() => togglePref('delays')} />
              <Switch label="Maintenance reminders" description="Scheduled and overdue service tasks." checked={notifPrefs.maintenance} onChange={() => togglePref('maintenance')} />
              <Switch label="Payment status" description="Invoices, payments, and outstanding balances." checked={notifPrefs.payments} onChange={() => togglePref('payments')} />
              <Switch label="System messages" description="Platform maintenance and security notices." checked={notifPrefs.system} onChange={() => togglePref('system')} />
            </div>
          </SettingCard>

          <SettingCard eyebrow="Integrations" title="Connect Services">
            <div className="switch-list">
              <Switch label="AIS data feed" description="Live vessel positioning from satellite AIS." checked onChange={() => toast.info('AIS feed is always on.')} />
              <Switch label="Weather API" description="Forecast data for route planning." checked onChange={() => toast.info('Weather API is connected.')} />
              <Switch label="Accounting export" description="Sync invoices to your accounting platform." checked={false} onChange={() => toast.info('Accounting integration coming soon.')} />
            </div>
          </SettingCard>

          {isAdmin && (
            <SettingCard eyebrow="Danger zone" title="Reset Application">
              <p className="card-desc">
                Clear the database, your session, theme, settings, notification preferences, and all cached data. This restores the app to its default seeded state and signs you out.
              </p>
              <div className="row" style={{ marginTop: 8 }}>
                <Button variant="danger" icon="trash" onClick={() => setResetOpen(true)}>
                  Reset everything
                </Button>
              </div>
            </SettingCard>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={() => resetApplication()}
        title="Reset the entire application?"
        description="This permanently clears the database, session, theme, settings, notifications and all cached preferences, then restores the seeded demo data and signs you out. This cannot be undone."
        confirmLabel="Reset everything"
        danger
      />
    </div>
  )
}
