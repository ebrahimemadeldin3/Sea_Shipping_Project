import { useEffect } from 'react'
import { Link, useNavigate } from '../../router/Router'
import { Button } from '../../components/ui/Button'
import Icon from '../../components/Icon'

export function Forbidden() {
  return (
    <div className="system-page">
      <div className="system-inner">
        <p className="system-code system-code--sm">403</p>
        <h1>Access denied</h1>
        <p>You don't have permission to view this page. Contact your administrator if you believe this is a mistake.</p>
        <div className="system-actions">
          <Link to="/dashboard" className="btn btn--primary">
            <Icon name="dashboard" size={17} />
            <span>Back to dashboard</span>
          </Link>
          <Link to="/" className="btn btn--outline">
            <span>Back home</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export function NotFound() {
  return (
    <div className="system-page">
      <div className="system-inner">
        <p className="system-code">404</p>
        <h1>Page not found</h1>
        <p>The page you're looking for doesn't exist or may have been moved. Let's get you back to active operations.</p>
        <div className="system-actions">
          <Link to="/dashboard" className="btn btn--primary">
            <Icon name="dashboard" size={17} />
            <span>Go to dashboard</span>
          </Link>
          <Link to="/" className="btn btn--outline">
            <span>Back home</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export function ErrorPage() {
  return (
    <div className="system-page">
      <div className="system-inner">
        <span className="system-icon" aria-hidden="true">
          <Icon name="alert-triangle" size={44} />
        </span>
        <p className="system-code system-code--sm">500</p>
        <h1>Something went wrong</h1>
        <p>An unexpected error occurred while loading this view. Try refreshing, or contact support if it persists.</p>
        <div className="system-actions">
          <Button variant="danger" onClick={() => window.location.reload()}>
            <Icon name="refresh" size={17} />
            <span>Reload page</span>
          </Button>
          <Link to="/support" className="btn btn--outline">
            <span>Contact support</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export function Loading() {
  useEffect(() => {
    document.title = 'Loading… · AquaFlow'
  }, [])
  return (
    <div className="loading-screen" role="status" aria-live="polite">
      <div className="loading-inner">
        <span className="loading-ring" aria-hidden="true" />
        <h2>Loading operations data</h2>
        <p>Fetching fleet, shipments, and port status…</p>
      </div>
    </div>
  )
}

export function Success() {
  const navigate = useNavigate()
  return (
    <div className="system-page">
      <div className="system-inner">
        <span className="system-success-icon" aria-hidden="true">
          <Icon name="check-circle" size={52} />
        </span>
        <h1>All done</h1>
        <p>Your action was completed successfully. Head back to the dashboard or continue exploring.</p>
        <div className="system-actions">
          <Button onClick={() => navigate('/dashboard')}>
            <span>Go to dashboard</span>
          </Button>
          <Button variant="outline" onClick={() => navigate('/')}>
            <span>Back home</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
