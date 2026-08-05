import { useMemo } from 'react'
import { NavLink } from '../../router/Router'
import { navSections } from './navConfig'
import { useAuth } from '../../store/AuthProvider'
import { useNotifications } from '../../store/NotificationsProvider'
import { Avatar } from '../ui/display'
import { Badge } from '../ui/feedback'
import Icon from '../Icon'
import { useNavigate } from '../../router/Router'

export function SidebarContent({ onNavigate, collapsed = false }) {
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
