import { Component, memo } from 'react'
import Icon from '../Icon'
import { useToast } from '../../store/ToastProvider'
import { clearAll } from '../../services/storage/localStorage'

export const Badge = memo(function Badge({ children, tone = 'neutral', dot = false, icon, className = '' }) {
  return (
    <span className={`badge badge--${tone} ${className}`}>
      {dot && <span className="badge-dot" aria-hidden="true" />}
      {icon && <Icon name={icon} size={13} aria-hidden="true" />}
      {children}
    </span>
  )
})

const statusTones = {
  'On Route': 'info',
  'In Transit': 'info',
  Active: 'success',
  Completed: 'success',
  Delivered: 'success',
  Paid: 'success',
  Resolved: 'success',
  Available: 'success',
  Healthy: 'success',
  Approved: 'success',
  Scheduled: 'info',
  Pending: 'warning',
  Loading: 'warning',
  Processing: 'warning',
  'In Port': 'info',
  Maintenance: 'warning',
  Delayed: 'danger',
  Overdue: 'danger',
  Outstanding: 'danger',
  Failed: 'danger',
  Cancelled: 'danger',
  Unpaid: 'danger',
  Refunded: 'info',
  Dismissed: 'neutral',
  Read: 'neutral',
  Unread: 'info',
  Open: 'info',
  'In Progress': 'info',
  'On Leave': 'warning',
  Closed: 'success',
  Draft: 'neutral',
  Outdated: 'warning',
  Critical: 'danger',
  Warning: 'warning',
  Good: 'success',
  Empty: 'neutral',
  Docked: 'info',
  'En Route': 'info',
  Returning: 'info',
  'Out for Delivery': 'info',
}

export const StatusChip = memo(function StatusChip({ status, className = '' }) {
  const tone = statusTones[status] || 'neutral'
  return (
    <Badge tone={tone} dot className={className}>
      {status}
    </Badge>
  )
})

export function Spinner({ size = 28, label = 'Loading', className = '' }) {
  return (
    <span className={`spinner ${className}`} style={{ width: size, height: size }} role="status" aria-label={label}>
      <span className="spinner-inner" />
    </span>
  )
}

export const ProgressBar = memo(function ProgressBar({ value = 0, max = 100, tone = 'brand', size = 'md', showLabel = false, label }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className="progress">
      {(showLabel || label) && (
        <div className="progress-head">
          {label && <span className="progress-label">{label}</span>}
          {showLabel && <strong className="progress-value">{Math.round(pct)}%</strong>}
        </div>
      )}
      <div className={`progress-track progress-track--${size}`} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
        <div className={`progress-fill progress-fill--${tone}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
})

export function Skeleton({ width = '100%', height = 14, radius = 'var(--radius-sm)', className = '', ...rest }) {
  return <div className={`skeleton ${className}`} style={{ width, height, borderRadius: radius }} {...rest} aria-hidden="true" />
}

export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="card skeleton-card">
      <Skeleton height={16} width="40%" radius={999} />
      <div className="stack" style={{ gap: 10, marginTop: 14 }}>
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} height={12} width={`${90 - i * 15}%`} />
        ))}
      </div>
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="page" aria-busy="true" role="status" aria-label="Loading page">
      <div className="stack" style={{ gap: 20 }}>
        <div>
          <Skeleton height={12} width={110} radius={999} />
          <div style={{ marginTop: 10 }}>
            <Skeleton height={28} width="34%" radius={999} />
          </div>
          <div style={{ marginTop: 10 }}>
            <Skeleton height={13} width="56%" radius={999} />
          </div>
        </div>
        <div className="grid grid-2 grid-3 grid-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card skeleton-card" style={{ minHeight: 104 }} />
          ))}
        </div>
        <div className="grid grid-2 grid-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card skeleton-card" style={{ minHeight: 230 }} />
          ))}
        </div>
      </div>
    </div>
  )
}

export function EmptyState({ icon = 'box', title, description, action, className = '' }) {
  return (
    <div className={`empty-state ${className}`}>
      <div className="empty-state-icon" aria-hidden="true">
        <Icon name={icon} size={30} />
      </div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  )
}

export function ErrorState({ title = 'Something went wrong', description, onRetry, className = '' }) {
  return (
    <div className={`empty-state error-state ${className}`} role="alert">
      <div className="empty-state-icon empty-state-icon--danger" aria-hidden="true">
        <Icon name="alert-triangle" size={30} />
      </div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {onRetry && (
        <div className="empty-state-action">
          <button type="button" className="btn btn--outline btn--sm" onClick={onRetry}>
            <Icon name="refresh" size={16} />
            <span>Retry</span>
          </button>
        </div>
      )}
    </div>
  )
}

export function Toasts() {
  const { toasts, dismiss } = useToastsFromStore()
  return (
    <div className="toast-region" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast--${toast.type}`} role="status">
          <span className="toast-icon" aria-hidden="true">
            <Icon
              name={toast.type === 'success' ? 'check-circle' : toast.type === 'danger' ? 'alert-circle' : toast.type === 'warning' ? 'alert-triangle' : 'info'}
              size={19}
            />
          </span>
          <div className="toast-body">
            {toast.title && <strong>{toast.title}</strong>}
            <p>{toast.message}</p>
            {toast.action && <div className="toast-action">{toast.action}</div>}
          </div>
          <button type="button" className="toast-close" onClick={() => dismiss(toast.id)} aria-label="Dismiss notification">
            <Icon name="close" size={15} />
          </button>
        </div>
      ))}
    </div>
  )
}

function useToastsFromStore() {
  const api = useToast()
  return { toasts: api ? api.toasts : [], dismiss: api ? api.dismiss : () => {} }
}

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Unknown error' }
  }

  componentDidCatch(error, info) {
    console.error('UI crashed:', error, info)
  }

  handleReset = () => {
    try {
      clearAll()
    } catch {
      /* ignore */
    }
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div className="app-error">
        <div className="app-error-inner">
          <span className="app-error-icon" aria-hidden="true">
            <Icon name="alert-triangle" size={40} />
          </span>
          <h1>Something went wrong</h1>
          <p>The app hit an unexpected error. Reset your local data and reload to continue.</p>
          {this.props.showDetail && this.state.message && <code className="app-error-detail">{this.state.message}</code>}
          <div className="app-error-actions">
            <button type="button" className="btn btn--primary" onClick={this.handleReset}>
              <Icon name="refresh" size={17} />
              <span>Reset & reload</span>
            </button>
            <button type="button" className="btn btn--outline" onClick={() => window.location.reload()}>
              <span>Just reload</span>
            </button>
          </div>
        </div>
      </div>
    )
  }
}
