import { memo } from 'react'
import { Link } from '../../router/Router'
import Icon from '../Icon'
import { StatusChip, ProgressBar } from '../ui/feedback'
import { Avatar } from '../ui/display'

export const ShipCard = memo(function ShipCard({ ship }) {
  return (
    <article className="ship-card">
      <div className="ship-card-head">
        <div className="ship-card-title">
          <span className="ship-card-icon" aria-hidden="true">
            <Icon name="ship" size={20} />
          </span>
          <div>
            <h3>{ship.name}</h3>
            <p>
              {ship.type} · {ship.capacity}
            </p>
          </div>
        </div>
        <StatusChip status={ship.status} />
      </div>

      <dl className="ship-card-meta">
        <div>
          <dt>Captain</dt>
          <dd>{ship.captain.replace('Captain ', '')}</dd>
        </div>
        <div>
          <dt>Current Port</dt>
          <dd>{ship.currentPort}</dd>
        </div>
        <div>
          <dt>Next Port</dt>
          <dd>{ship.nextPort}</dd>
        </div>
        <div>
          <dt>ETA</dt>
          <dd>{ship.eta}</dd>
        </div>
      </dl>

      <ProgressBar value={ship.utilization} label="Utilization" showLabel />

      <div className="ship-card-footer">
        <span className="ship-card-health">
          <span className={`health-dot health-dot--${ship.health === 'In Service' ? 'healthy' : ship.health.toLowerCase()}`} aria-hidden="true" />
          {ship.health}
        </span>
        <Link to={`/ships/${ship.id}`} className="btn btn--outline btn--sm" aria-label={`View details for ${ship.name}`}>
          <span>View details</span>
          <Icon name="chevron-right" size={15} />
        </Link>
      </div>
    </article>
  )
})

export const ShipmentCard = memo(function ShipmentCard({ shipment }) {
  return (
    <article className="shipment-card">
      <div className="shipment-card-head">
        <span className="shipment-card-id">{shipment.id}</span>
        <StatusChip status={shipment.status} />
      </div>
      <h3 className="shipment-card-customer">{shipment.customer}</h3>
      <div className="shipment-route">
        <div className="route-endpoint">
          <strong>{shipment.origin}</strong>
          <span>Origin</span>
        </div>
        <div className="route-line-mid" aria-hidden="true">
          <span className="route-plane" />
        </div>
        <div className="route-endpoint route-endpoint--dest">
          <strong>{shipment.destination}</strong>
          <span>Destination</span>
        </div>
      </div>
      <dl className="shipment-card-meta">
        <div>
          <dt>Cargo</dt>
          <dd>{shipment.cargo}</dd>
        </div>
        <div>
          <dt>Weight</dt>
          <dd>{shipment.weight}</dd>
        </div>
        <div>
          <dt>Cost</dt>
          <dd>{shipment.cost}</dd>
        </div>
      </dl>
      <div className="shipment-card-footer">
        <span className="shipment-eta">
          <Icon name="clock" size={15} /> ETA {shipment.eta}
        </span>
        <Link to={`/shipments/${shipment.id}`} className="btn btn--ghost btn--sm">
          <span>Track</span>
          <Icon name="chevron-right" size={15} />
        </Link>
      </div>
    </article>
  )
})

export const PortCard = memo(function PortCard({ port }) {
  return (
    <article className="port-card">
      <div className="port-card-head">
        <span className="port-card-icon" aria-hidden="true">
          <Icon name="anchor" size={20} />
        </span>
        <div>
          <h3>{port.name}</h3>
          <p>
            {port.country} · {port.region}
          </p>
        </div>
        <StatusChip status={port.congestion === 'High' ? 'Warning' : port.congestion === 'Moderate' ? 'Loading' : 'Good'} />
      </div>
      <dl className="port-card-meta">
        <div>
          <dt>Berths</dt>
          <dd>{port.berths}</dd>
        </div>
        <div>
          <dt>Capacity</dt>
          <dd>{port.capacity}</dd>
        </div>
        <div>
          <dt>Vessels</dt>
          <dd>{port.vesselsInPort}</dd>
        </div>
        <div>
          <dt>Depth</dt>
          <dd>{port.depth}</dd>
        </div>
      </dl>
      <div className="port-card-footer">
        <span className="port-traffic">
          <span className="port-traffic-fill" style={{ width: `${port.traffic}%` }} />
          <em>Traffic {port.traffic}%</em>
        </span>
        <Link to={`/ports/${port.id}`} className="btn btn--ghost btn--sm">
          <span>Details</span>
          <Icon name="chevron-right" size={15} />
        </Link>
      </div>
    </article>
  )
})

export const ProfileCard = memo(function ProfileCard({ user, stats, actions }) {
  return (
    <article className="profile-card">
      <Avatar name={user.name} size="lg" />
      <h3>{user.name}</h3>
      <p className="profile-card-role">{user.role}</p>
      <p className="profile-card-email">{user.email}</p>
      {stats && (
        <dl className="profile-card-stats">
          {stats.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      )}
      {actions && <div className="profile-card-actions">{actions}</div>}
    </article>
  )
})

export const NotificationCard = memo(function NotificationCard({ notification, onMarkRead }) {
  const iconMap = {
    weather: 'cloud-rain',
    delay: 'clock',
    maintenance: 'wrench',
    payment: 'credit-card',
    system: 'server',
    route: 'map-pin',
    security: 'lock',
    report: 'file-chart',
  }
  return (
    <article className={`notification-card ${notification.read ? 'is-read' : ''}`}>
      <span className="notification-card-icon" aria-hidden="true">
        <Icon name={iconMap[notification.type] || 'bell'} size={18} />
      </span>
      <div className="notification-card-body">
        <div className="notification-card-title">
          <strong>{notification.title}</strong>
          <time>{notification.time}</time>
        </div>
        <p>{notification.message}</p>
      </div>
      {!notification.read && (
        <button type="button" className="notification-card-mark" onClick={() => onMarkRead?.(notification.id)} aria-label={`Mark "${notification.title}" as read`} title="Mark as read">
          <Icon name="check" size={15} />
        </button>
      )}
    </article>
  )
})
