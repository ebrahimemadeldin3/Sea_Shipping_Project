import React, { useState } from 'react';
import { 
  Package, Navigation, MapPin, Plus, FileText, 
  LifeBuoy, Settings, ChevronLeft, ChevronRight 
} from 'lucide-react';
import Logo from './Logo';
import UserAccountMenu from './UserAccountMenu';

import { useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar({ 
  user, 
  activeTab,
  setActiveTab,
  isSidebarOpen, 
  setSidebarOpen, 
  onLogout,
  onNewShipment,
  navItems = []
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const defaultCustomerNavItems = [
    { id: 'Overview', path: '/dashboard', icon: Package, label: 'Overview' },
    { id: 'My Shipments', path: '/dashboard/shipments', icon: Navigation, label: 'My Shipments' },
    { id: 'Track Shipment', path: '/dashboard/track', icon: MapPin, label: 'Track Shipment' },
    { id: 'Invoices', path: '/dashboard/invoices', icon: FileText, label: 'Invoices' },
    { id: 'Support', path: '/dashboard/support', icon: LifeBuoy, label: 'Support' },
    { id: 'Settings', path: '/dashboard/settings', icon: Settings, label: 'Settings' }
  ];

  const itemsToRender = navItems.length > 0 ? navItems : defaultCustomerNavItems;

  return (
    <aside 
      className={`sidebar ${isSidebarOpen ? 'open' : ''}`} 
      style={{ 
        zIndex: 100, 
        width: isCollapsed ? '80px' : '260px',
        transition: 'width 0.3s ease'
      }}
    >
      <div style={{ 
        padding: '1.5rem', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: isCollapsed ? 'center' : 'space-between',
        gap: '0.75rem', 
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Logo variant="compact" size={32} />
          {!isCollapsed && (
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em', color: 'white' }}>NAVORA</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)' }}>Shipping & Logistics</div>
            </div>
          )}
        </div>
        
        {/* Collapse Toggle Button (desktop only) */}
        <button 
          className="hide-on-mobile"
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{ 
            background: 'rgba(255,255,255,0.1)', 
            border: 'none', 
            borderRadius: '50%',
            width: '24px', 
            height: '24px',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'white',
            cursor: 'pointer',
            position: isCollapsed ? 'absolute' : 'relative',
            right: isCollapsed ? '-12px' : '0',
            zIndex: 10
          }}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      <nav style={{ 
        flex: 1, 
        padding: '1.5rem 1rem', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0.5rem',
        overflowY: 'auto'
      }}>
        {itemsToRender.map(item => {
          const isActive = (activeTab && item.id === activeTab) || (item.path 
            ? (item.path === '/dashboard' || item.path === '/company' 
                ? currentPath === item.path 
                : currentPath.startsWith(item.path))
            : false);
          const Icon = item.icon;
          
          return (
            <button 
              key={item.id}
              onClick={() => { 
                if (item.path) navigate(item.path);
                if (setActiveTab) setActiveTab(item.id);
                if (item.onClick) item.onClick();
                if (window.innerWidth <= 768) setSidebarOpen(false); 
              }}
              style={{
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                gap: '0.75rem', 
                padding: isCollapsed ? '0.75rem 0' : '0.75rem 1rem',
                borderRadius: 'var(--radius-full)', // Rounder corners (pill shape)
                backgroundColor: isActive ? 'var(--color-secondary)' : 'transparent', // Filled pill active state
                color: isActive ? 'white' : 'rgba(255,255,255,0.7)',
                textAlign: 'left', 
                fontWeight: 600, 
                transition: 'all 0.2s ease',
                border: 'none',
                cursor: 'pointer'
              }}
              className="sidebar-link-hover"
              title={isCollapsed ? item.label : undefined}
            >
              <Icon size={isCollapsed ? 22 : 18} />
              {!isCollapsed && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
                  <span>{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <div style={{ backgroundColor: 'var(--color-error)', color: 'white', fontSize: '0.75rem', padding: '0.1rem 0.5rem', borderRadius: 'var(--radius-full)' }}>
                      {item.badge}
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
        
        {onNewShipment && (
          <button 
            className="btn btn-primary sidebar-action" 
            style={{ 
              marginTop: '1rem', 
              padding: isCollapsed ? '0.75rem 0' : undefined,
              display: 'flex',
              justifyContent: 'center',
              borderRadius: 'var(--radius-full)'
            }}
            onClick={() => {
              onNewShipment();
              if (window.innerWidth <= 768) setSidebarOpen(false);
            }}
            title={isCollapsed ? "New Shipment" : undefined}
          >
            <Plus size={isCollapsed ? 22 : 18} /> 
            {!isCollapsed && <span>New Shipment</span>}
          </button>
        )}
      </nav>

      {/* User Profile / Logout pinned to bottom */}
      <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        {!isCollapsed ? (
          <UserAccountMenu user={user} onLogout={onLogout} variant="sidebar" />
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div 
              style={{ 
                width: '40px', height: '40px', borderRadius: '50%', 
                backgroundColor: 'var(--color-secondary)', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 'bold', fontSize: '16px', cursor: 'pointer',
                border: '2px solid rgba(255,255,255,0.2)'
              }}
              title={user.fullName}
            >
              {user.fullName.charAt(0)}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
