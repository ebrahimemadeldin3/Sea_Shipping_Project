import { useEffect, useRef, useState } from 'react'
import { Card, Avatar } from '../../components/ui/display'
import { Button } from '../../components/ui/Button'
import { Input, Switch } from '../../components/ui/inputs'
import { Badge } from '../../components/ui/feedback'
import { AreaChart, LineChart } from '../../components/charts/Charts'
import { useAuth } from '../../store/AuthProvider'
import { useData } from '../../store/DataProvider'
import { useToast } from '../../store/ToastProvider'
import { deliverySeries } from '../../data'
import Icon from '../../components/Icon'

function useCountUp(target, { duration = 1100, decimals = 0 } = {}) {
  const [display, setDisplay] = useState(0)
  const prev = useRef(0)
  const raf = useRef(0)

  useEffect(() => {
    const start = performance.now()
    const from = prev.current
    const delta = target - from
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(from + delta * eased)
      if (t < 1) raf.current = requestAnimationFrame(tick)
      else prev.current = target
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [target, duration])

  return decimals ? display.toFixed(decimals) : Math.round(display).toLocaleString()
}

function Reveal({ delay = 0, className = '', children }) {
  return (
    <div className={`reveal ${className}`} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

function HeroStat({ icon, label, target, decimals = 0, suffix = '' }) {
  const value = useCountUp(target, { decimals })
  return (
    <div className="profile-hero-stat">
      <span className="profile-hero-stat-icon">
        <Icon name={icon} size={16} />
      </span>
      <span className="profile-hero-stat-value">
        {value}
        {suffix}
      </span>
      <span className="profile-hero-stat-label">{label}</span>
    </div>
  )
}

const activity = [
  { action: 'Created shipment SH-2415', detail: 'Bluewave Trading · Jebel Ali → Rotterdam', time: 'Today, 09:12', icon: 'package', tone: 'royal' },
  { action: 'Approved maintenance task MT-306', detail: 'Nordic Star · fuel system service', time: 'Yesterday, 16:40', icon: 'wrench', tone: 'warning' },
  { action: 'Updated port schedule for Jebel Ali', detail: 'Berth 12 assigned to Aqua Orion', time: 'Yesterday, 11:05', icon: 'anchor', tone: 'ocean' },
  { action: 'Exported July operations report', detail: 'PDF · 2.4 MB', time: 'Jul 30, 10:22', icon: 'download', tone: 'success' },
  { action: 'Changed account theme to Dark', detail: 'Appearance preference updated', time: 'Jul 29, 14:10', icon: 'moon', tone: 'neutral' },
]

export function UserProfile() {
  const { user, updateProfile, logout } = useAuth()
  const { shipments, ships } = useData()
  const toast = useToast()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: user?.name || 'Amira Nasser',
    email: user?.email || 'amira@aquaflow.com',
    phone: user?.phone || '+1 (555) 012-7788',
    location: user?.location || 'Dubai, UAE',
    title: user?.title || 'Operations Director',
  })

  const save = () => {
    updateProfile(form)
    setEditing(false)
    toast.success('Profile updated successfully.', { title: 'Saved' })
  }

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const totalShipments = shipments.length
  const delayedCount = shipments.filter((s) => s.status === 'Delayed').length
  const onTimePct = totalShipments ? Number((((totalShipments - delayedCount) / totalShipments) * 100).toFixed(1)) : 0
  const activeVessels = ships.filter((s) => s.status !== 'Maintenance').length

  const memberSince = (() => {
    const raw = user?.joinedAt
    if (!raw) return 'March 2021'
    const d = new Date(`${raw}T00:00:00`)
    return Number.isNaN(d.getTime()) ? raw : d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  })()

  const contact = [
    { icon: 'mail', label: 'Email', value: user?.email || form.email },
    { icon: 'phone', label: 'Phone', value: user?.phone || form.phone },
    { icon: 'map-pin', label: 'Location', value: user?.location || form.location },
    { icon: 'calendar', label: 'Member since', value: memberSince },
    { icon: 'users', label: 'Department', value: user?.department || 'Operations' },
    { icon: 'flag', label: 'Employee ID', value: user?.employeesId || '—' },
  ]

  return (
    <div className="page profile-page">
      {/* ============ Profile hero ============ */}
      <section className="profile-hero">
        <div className="profile-hero-rings" aria-hidden="true">
          <span className="profile-ring profile-ring--1" />
          <span className="profile-ring profile-ring--2" />
          <span className="profile-ring profile-ring--3" />
        </div>

        <div className="profile-hero-top">
          <div className="profile-hero-identity">
            <div className="profile-avatar">
              <span className="profile-avatar-ring profile-avatar-ring--outer" aria-hidden="true" />
              <span className="profile-avatar-ring profile-avatar-ring--inner" aria-hidden="true" />
              <Avatar name={user?.name || form.name} size="xl" />
              <button type="button" className="profile-avatar-btn" onClick={() => setEditing(true)} aria-label="Update photo" title="Update photo">
                <Icon name="camera" size={14} />
              </button>
            </div>
            <div className="profile-hero-copy">
              <span className="profile-hero-eyebrow">
                <span className="hero-pulse-dot" />
                Account overview
              </span>
              <h1 className="profile-hero-name">{form.name}</h1>
              <p className="profile-hero-role">
                {form.title} · {user?.department || 'Operations'}
              </p>
              <div className="profile-hero-tags">
                <Badge tone="info" icon="star">
                  {user?.roleLabel || 'Member'}
                </Badge>
                <Badge tone="success" dot>
                  Active
                </Badge>
                <Badge tone="neutral" icon="map-pin">
                  {form.location}
                </Badge>
              </div>
            </div>
          </div>

          <div className="profile-hero-stats">
            <HeroStat icon="package" label="Shipments managed" target={totalShipments} />
            <HeroStat icon="ship" label="Vessels in operation" target={activeVessels} />
            <HeroStat icon="trending-up" label="On-time delivery" target={onTimePct} decimals={1} suffix="%" />
          </div>
        </div>

        <div className="profile-hero-actions">
          <Button variant="primary" onClick={() => (editing ? save() : setEditing(true))}>
            <Icon name={editing ? 'check' : 'edit'} size={17} />
            <span>{editing ? 'Save changes' : 'Edit profile'}</span>
          </Button>
          <Button variant="ghost" className="profile-hero-logout" onClick={logout}>
            <Icon name="logout" size={17} />
            <span>Log out</span>
          </Button>
        </div>
      </section>

      {/* ============ Details + analytics ============ */}
      <div className="grid grid-2 grid-3">
        <Reveal delay={90}>
          <Card title="Personal Details" eyebrow="About">
            {editing ? (
              <div className="profile-edit">
                <Input label="Full name" value={form.name} onChange={set('name')} icon="user" />
                <Input label="Job title" value={form.title} onChange={set('title')} icon="user" />
                <Input label="Email" type="email" value={form.email} onChange={set('email')} icon="mail" />
                <Input label="Phone" value={form.phone} onChange={set('phone')} icon="phone" />
                <Input label="Location" value={form.location} onChange={set('location')} icon="map-pin" />
              </div>
            ) : (
              <dl className="profile-spec">
                {contact.map((item) => (
                  <div key={item.label} className="profile-spec-item">
                    <span className="profile-spec-icon" aria-hidden="true">
                      <Icon name={item.icon} size={15} />
                    </span>
                    <div className="profile-spec-copy">
                      <dt>{item.label}</dt>
                      <dd>{item.value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            )}
          </Card>
        </Reveal>

        <Reveal delay={140} className="chart-span-2">
          <div className="stack">
            <div className="grid grid-2">
              <Reveal delay={200}>
                <Card title="Personal Performance" eyebrow="My contribution">
                  <AreaChart values={[4, 6, 5, 9, 8, 11, 13, 12]} labels={['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8']} height={190} />
                </Card>
              </Reveal>
              <Reveal delay={260}>
                <Card title="Shipments Managed" eyebrow="This year">
                  <LineChart series={[{ name: 'Shipments', data: deliverySeries.map((d) => d.deliveries) }]} labels={deliverySeries.map((d) => d.month)} height={190} />
                </Card>
              </Reveal>
            </div>

            <Reveal delay={320}>
              <Card title="Recent Activity" eyebrow="Audit log">
                <ol className="profile-timeline">
                  {activity.map((item, i) => (
                    <li key={item.action} className="profile-timeline-item" style={{ animationDelay: `${320 + i * 70}ms` }}>
                      <span className={`profile-timeline-icon profile-timeline-icon--${item.tone}`} aria-hidden="true">
                        <Icon name={item.icon} size={14} />
                      </span>
                      <div className="profile-timeline-copy">
                        <strong>{item.action}</strong>
                        <span>{item.detail}</span>
                      </div>
                      <time className="profile-timeline-time">{item.time}</time>
                    </li>
                  ))}
                </ol>
              </Card>
            </Reveal>
          </div>
        </Reveal>
      </div>

      {/* ============ Security ============ */}
      <Reveal delay={380}>
        <Card title="Security Preferences" eyebrow="Protection" description="Manage how you sign in and protect your account.">
          <div className="switch-list">
            <Switch label="Two-factor authentication" description="Add an extra layer of security with a verification code." checked={false} onChange={() => toast.info('2FA setup flow opened.', { title: 'Security' })} />
            <Switch label="Session alerts" description="Get notified when a new device signs in." checked onChange={() => toast.success('Session alerts updated.')} />
            <Switch label="Email digest" description="Weekly summary of activity in your inbox." checked onChange={() => toast.success('Digest preference saved.')} />
          </div>
          <div className="profile-security-row">
            <span className="profile-security-icon" aria-hidden="true">
              <Icon name="lock" size={16} />
            </span>
            <div className="fleet-row-copy">
              <strong>Password</strong>
              <span>Last changed 42 days ago · strong</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => toast.info('Password change flow opened.', { title: 'Security' })}>
              Change
            </Button>
          </div>
        </Card>
      </Reveal>
    </div>
  )
}
