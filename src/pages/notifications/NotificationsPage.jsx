import { useMemo, useState } from 'react'
import { PageHeader, Card, StatCard } from '../../components/ui/display'
import { NotificationCard } from '../../components/domain/cards'
import { Dropdown, Tabs } from '../../components/ui/navigation'
import { Badge, EmptyState } from '../../components/ui/feedback'
import { useNotifications } from '../../store/NotificationsProvider'
import { notificationTemplates } from '../../data'
import { useToast } from '../../store/ToastProvider'
import Icon from '../../components/Icon'

export function Notifications() {
  const { notifications, markRead, markAllRead } = useNotifications()
  const toast = useToast()
  const [filter, setFilter] = useState('All')
  const [tab, setTab] = useState('all')

  const filtered = useMemo(() => {
    let list = notifications
    if (tab === 'unread') list = list.filter((n) => !n.read)
    if (filter !== 'All') list = list.filter((n) => n.type === filter.toLowerCase())
    return list
  }, [notifications, tab, filter])

  const unread = notifications.filter((n) => !n.read).length

  const tabs = [
    { id: 'all', label: 'All', count: notifications.length },
    { id: 'unread', label: 'Unread', count: unread },
  ]

  return (
    <div className="page">
      <PageHeader
        eyebrow="Notifications"
        title="Notifications Center"
        description="Alerts, weather updates, delays, and system messages."
        breadcrumbs={[{ label: 'System' }, { label: 'Notifications' }]}
        actions={
          <button type="button" className="btn btn--outline" onClick={() => { markAllRead(); toast.success('All notifications marked as read.', { title: 'Inbox cleared' }) }}>
            <Icon name="check-circle" size={17} />
            <span>Mark all as read</span>
          </button>
        }
      />

      <div className="grid grid-2 grid-3 grid-4">
        <StatCard label="Total" value={notifications.length} icon="bell" hint="last 7 days" />
        <StatCard label="Unread" value={unread} icon="alert-circle" hint="needs attention" />
        <StatCard label="Weather Alerts" value={notifications.filter((n) => n.type === 'weather').length} icon="cloud-rain" hint="active" />
        <StatCard label="Delays" value={notifications.filter((n) => n.type === 'delay').length} icon="clock" hint="shipments" />
      </div>

      <div className="toolbar">
        <Tabs tabs={tabs} active={tab} onChange={setTab} />
        <Dropdown label="Type" value={filter} onChange={setFilter} options={[{ value: 'All', label: 'All types' }, ...notificationTemplates.map((t) => ({ value: t.type, label: t.label }))]} icon="filter" />
        <span className="toolbar-note" aria-hidden="true">
          {filtered.length} notification{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState icon="bell" title="All caught up" description="No notifications match your current filter. New alerts will appear here." />
        </Card>
      ) : (
        <div className="notification-list">
          {filtered.map((n) => (
            <NotificationCard key={n.id} notification={n} onMarkRead={markRead} />
          ))}
        </div>
      )}

      <div className="row" style={{ justifyContent: 'center' }}>
        <Badge tone="info" icon="settings">Notification preferences can be managed in Settings</Badge>
      </div>
    </div>
  )
}
