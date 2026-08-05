import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from '../../router/Router'
import { useAuth } from '../../store/AuthProvider'
import { useTheme } from '../../store/ThemeProvider'
import { useNotifications } from '../../store/NotificationsProvider'
import { Avatar } from '../ui/display'
import Icon from '../Icon'
import { useClickOutside } from '../../hooks'

export function Topbar({ onMenuClick, onSearch, sidebarCollapsed, onToggleSidebar }) {
  const { user, logout, hasPermission } = useAuth()
  const { theme, setTheme } = useTheme()
  const { unreadCount } = useNotifications()
  const navigate = useNavigate()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const userMenuRef = useRef(null)
  const moreMenuRef = useRef(null)
  useClickOutside(userMenuRef, () => setUserMenuOpen(false))
  useClickOutside(moreMenuRef, () => setMoreMenuOpen(false))

  useEffect(() => {
    if (!userMenuOpen && !moreMenuOpen) return
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setUserMenuOpen(false)
        setMoreMenuOpen(false)
        userMenuRef.current?.querySelector('.topbar-user-btn')?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [userMenuOpen, moreMenuOpen])

  const handleSearch = (e) => {
    e.preventDefault()
    const term = searchValue.trim()
    if (!term) return
    onSearch?.(term)
    navigate(`/search?q=${encodeURIComponent(term)}`)
    setSearchOpen(false)
    setSearchValue('')
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button type="button" className="topbar-menu-btn" onClick={onMenuClick} aria-label="Open navigation menu">
          <Icon name="menu" size={20} />
        </button>
        <button
          type="button"
          className="topbar-sidebar-btn"
          onClick={onToggleSidebar}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Icon name={sidebarCollapsed ? 'chevrons-right' : 'chevrons-left'} size={18} />
        </button>
      </div>

      <form className={`topbar-search ${searchOpen ? 'is-focused' : ''}`} onSubmit={handleSearch} role="search">
        <Icon name="search" size={18} className="topbar-search-icon" aria-hidden="true" />
        <input
          type="search"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search ships, shipments, customers…"
          aria-label="Search ships, shipments, customers"
          className="topbar-search-input"
          onFocus={() => setSearchOpen(true)}
          onBlur={() => setSearchOpen(false)}
        />
        {searchValue && (
          <button type="button" className="topbar-search-clear" onClick={() => setSearchValue('')} aria-label="Clear search">
            <Icon name="close" size={14} />
          </button>
        )}
      </form>

      <div className="topbar-right">
        <div className="topbar-quick-actions" aria-label="Quick actions">
          {hasPermission('shipment.manage') && (
            <Link to="/shipments/new" className="topbar-quick-link">
              <Icon name="plus" size={16} aria-hidden="true" />
              <span>Create shipment</span>
            </Link>
          )}
          {hasPermission('report.view') && (
            <Link to="/reports/export" className="topbar-icon-btn topbar-quick-icon" aria-label="Export report" title="Export report">
              <Icon name="download" size={20} />
            </Link>
          )}
        </div>

        <div className="topbar-more" ref={moreMenuRef}>
          <button
            type="button"
            className="topbar-icon-btn topbar-more-btn"
            onClick={() => setMoreMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={moreMenuOpen}
            aria-controls={moreMenuOpen ? 'topbar-more-menu' : undefined}
            aria-label="More actions"
            title="More actions"
          >
            <Icon name="more-horizontal" size={20} />
          </button>
          {moreMenuOpen && (
            <ul className="topbar-menu topbar-more-menu" role="menu" aria-label="More actions" id="topbar-more-menu">
              {hasPermission('shipment.manage') && (
                <li role="none">
                  <Link to="/shipments/new" role="menuitem" className="topbar-menu-item" onClick={() => setMoreMenuOpen(false)}>
                    <Icon name="plus" size={17} />
                    Create shipment
                  </Link>
                </li>
              )}
              {hasPermission('report.view') && (
                <li role="none">
                  <Link to="/reports/export" role="menuitem" className="topbar-menu-item" onClick={() => setMoreMenuOpen(false)}>
                    <Icon name="download" size={17} />
                    Export report
                  </Link>
                </li>
              )}
            </ul>
          )}
        </div>

        <button
          type="button"
          className="topbar-icon-btn"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={20} />
        </button>

        <Link to="/notifications" className="topbar-icon-btn topbar-bell" aria-label={`Notifications (${unreadCount} unread)`} title="Notifications">
          <Icon name="bell" size={20} />
          {unreadCount > 0 && <span className="topbar-bell-dot" aria-hidden="true">{unreadCount > 9 ? '9+' : unreadCount}</span>}
        </Link>

        <div className="topbar-user" ref={userMenuRef}>
          <button
            type="button"
            className="topbar-user-btn"
            onClick={() => setUserMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={userMenuOpen}
            aria-controls={userMenuOpen ? 'topbar-user-menu' : undefined}
            aria-label="Account menu"
          >
            <Avatar name={user?.name || 'Guest'} size="md" />
            <span className="topbar-user-name">{user?.name?.split(' ')[0] || 'Guest'}</span>
            <Icon name="chevron-down" size={16} className="topbar-user-chevron" />
          </button>
          {userMenuOpen && (
            <ul className="topbar-menu" role="menu" aria-label="Account" id="topbar-user-menu">
              <li role="none">
                <Link to="/profile" role="menuitem" className="topbar-menu-item" onClick={() => setUserMenuOpen(false)}>
                  <Icon name="user" size={17} />
                  Profile
                </Link>
              </li>
              {hasPermission('settings.view') && (
                <li role="none">
                  <Link to="/settings" role="menuitem" className="topbar-menu-item" onClick={() => setUserMenuOpen(false)}>
                    <Icon name="settings" size={17} />
                    Settings
                  </Link>
                </li>
              )}
              <li role="none">
                <Link to="/support" role="menuitem" className="topbar-menu-item" onClick={() => setUserMenuOpen(false)}>
                  <Icon name="help-circle" size={17} />
                  Help Center
                </Link>
              </li>
              <li role="separator" className="topbar-menu-separator" />
              <li role="none">
                <button type="button" role="menuitem" className="topbar-menu-item topbar-menu-item--danger" onClick={handleLogout}>
                  <Icon name="logout" size={17} />
                  Log out
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>
    </header>
  )
}
