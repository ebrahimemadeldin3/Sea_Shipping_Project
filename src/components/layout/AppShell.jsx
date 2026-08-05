import { useState } from 'react'
import { createPortal } from 'react-dom'
import { SidebarContent } from './Sidebar'
import { Topbar } from './Topbar'
import { Footer } from './Footer'
import { useEscape, useLocalStorage, useLockBody } from '../../hooks'
import Icon from '../Icon'
import logo from '../../assets/logo.png'

export function AppShell({ children, onSearch }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage('aquaflow-sidebar-collapsed', false)
  useEscape(() => setMobileNavOpen(false), mobileNavOpen)
  useLockBody(mobileNavOpen)

  return (
    <div className={`app-shell ${sidebarCollapsed ? 'is-sidebar-collapsed' : ''}`}>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <aside className={`sidebar sidebar--desktop ${sidebarCollapsed ? 'is-collapsed' : ''}`}>
        <SidebarContent
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((collapsed) => !collapsed)}
        />
      </aside>

      <div className="app-main">
        <Topbar
          onMenuClick={() => setMobileNavOpen(true)}
          onSearch={onSearch}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed((collapsed) => !collapsed)}
        />
        <main id="main-content" className="app-content" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </div>

      {mobileNavOpen &&
        createPortal(
          <div className="mobile-nav-layer">
            <div className="mobile-nav-backdrop" onClick={() => setMobileNavOpen(false)} aria-hidden="true" />
            <div className="mobile-nav" role="dialog" aria-modal="true" aria-label="Navigation menu">
              <div className="mobile-nav-head">
                <img src={logo} alt="AquaFlow Shipping" className="mobile-nav-logo" />
                <button type="button" className="btn--square btn btn--ghost btn--sm" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation menu">
                  <Icon name="close" size={20} />
                </button>
              </div>
              <SidebarContent onNavigate={() => setMobileNavOpen(false)} />
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
