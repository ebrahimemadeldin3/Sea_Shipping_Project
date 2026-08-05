import { useMemo } from 'react'
import { NavLink } from '../../router/Router'
import { navSections } from './navConfig'
import { useAuth } from '../../store/AuthProvider'
import { useNotifications } from '../../store/NotificationsProvider'
import { Avatar } from '../ui/display'
import { Badge } from '../ui/feedback'
import Icon from '../Icon'
import { useNavigate } from '../../router/Router'
import logo from '../../assets/logo.png'

export function SidebarContent({ onNavigate, collapsed = false, onToggleCollapse }) {
  const { user, logout, hasPermission } = useAuth()
  const { unreadCount } = useNotifications()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const visibleSections = useMemo(
    () =>
      navSections
        .map((section) => ({
          ...section,
          items: section.items.filter((item) => hasPermission(item.permission)),
        }))
        .filter((section) => section.items.length > 0),
    [hasPermission],
  )

  return (
    <>
      <div className="sidebar-brand">
        <div className="sidebar-brand-row">
          <NavLink to="/dashboard" className="sidebar-logo-card" onClick={onNavigate} aria-label="AquaFlow dashboard">
            <img src={logo} alt="AquaFlow Shipping" className="sidebar-logo" />
          </NavLink>
          {onToggleCollapse && (
            <button
              type="button"
              className="sidebar-collapse-btn"
              onClick={onToggleCollapse}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <Icon name={collapsed ? 'chevrons-right' : 'chevrons-left'} size={17} />
            </button>
          )}
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Primary navigation">
        {visibleSections.map((section) => (
          <div key={section.label} className="sidebar-section">
            <span className="sidebar-section-label">{section.label}</span>
            <ul>
              {section.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className="sidebar-link"
                    activeClassName="is-active"
                    onClick={onNavigate}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon name={item.icon} size={18} aria-hidden="true" />
                    <span className="sidebar-link-text">{item.label}</span>
                    {item.to === '/notifications' && unreadCount > 0 && (
                      <Badge tone="danger" className="sidebar-badge">
                        {unreadCount}
                      </Badge>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        {user && (
          <div className="sidebar-user">
            <Avatar name={user.name} />
            <div className="sidebar-user-copy">
              <strong>{user.name}</strong>
              <span>{user.role}</span>
            </div>
            <button type="button" className="sidebar-logout" onClick={handleLogout} aria-label="Log out" title="Log out">
              <Icon name="logout" size={18} />
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export function Sidebar() {
  return (
    <aside className="sidebar">
      <SidebarContent />
    </aside>
  )
}
