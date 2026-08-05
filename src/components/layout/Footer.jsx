import { Link } from '../../router/Router'

export function Footer() {
  return (
    <footer className="app-footer">
      <p>© 2026 AquaFlow Shipping &amp; Logistics Intelligence. All rights reserved.</p>
      <div className="app-footer-links">
        <Link to="/support">Support</Link>
        <Link to="/settings">Settings</Link>
        <span className="app-footer-status">
          <span className="status-dot" aria-hidden="true" />
          All systems operational
        </span>
      </div>
    </footer>
  )
}

export function StatusDot({ color = 'var(--success)' }) {
  return <span className="status-dot" style={{ background: color }} aria-hidden="true" />
}
