import React from 'react';
import { Bell, Plus, Ship, ArrowLeft } from 'lucide-react';
import UserAccountMenu from './UserAccountMenu';

export default function DashboardHeader({
  user,
  activeTab,
  title: customTitle,
  subtitle: customSubtitle,
  onLogout,
  onOpenSidebar,
  onNewShipment, // If passed, show New Shipment button
  notifications,
  unreadNotifications,
  isNotificationsOpen,
  toggleNotifications,
  onNotificationClick,
  onBack, // Used for Profile page back button
}) {
  
  // Dynamic Page Context
  let title = customTitle || `Welcome back, ${user.fullName.split(' ')[0]}`;
  let subtitle = customSubtitle || "Track your shipments and manage your deliveries.";
  
  if (!customTitle && user.role === 'company') {
    title = "Shipping Operations";
    subtitle = customSubtitle || "Manage requests and monitor active cargo movements.";
  }

  if (activeTab === 'My Shipments' || activeTab === 'Active Shipments') {
    title = activeTab;
    subtitle = "View and manage all your shipping requests.";
  } else if (activeTab === 'Track Shipment') {
    title = "Track Shipment";
    subtitle = "Follow your cargo journey from port to destination.";
  } else if (activeTab === 'Requests') {
    title = "Shipping Requests";
    subtitle = "Review and process incoming customer shipments.";
  } else if (activeTab === 'Profile') {
    title = "Profile";
    subtitle = "Manage your personal information and account details.";
  }

  return (
    <header className="dashboard-header animate-fade-down" style={{ 
      position: 'sticky', top: 0, zIndex: 50,
      backgroundColor: 'rgba(255, 255, 255, 0.96)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      borderBottom: '1px solid #E5EAF1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem 2rem',
      height: '80px',
      transition: 'all var(--transition-normal)'
    }}>
      {/* LEFT: Contextual Information */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="mobile-only icon-btn" onClick={onBack || onOpenSidebar} style={{ border: 'none', background: 'none' }}>
          {onBack ? <ArrowLeft size={24} /> : '☰'}
        </button>
        
        <div className="header-text-content">
          {!onBack && (
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', 
              fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', 
              letterSpacing: '0.08em', color: 'var(--color-secondary)',
              marginBottom: '0.25rem'
            }}>
              <Ship size={12} />
              {user.role === 'company' ? 'COMPANY PORTAL' : 'CUSTOMER PORTAL'}
            </div>
          )}
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--color-text-main)', lineHeight: 1.2 }}>{title}</h2>
          <p className="hide-on-mobile" style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: '0.25rem 0 0 0' }}>{subtitle}</p>
        </div>
      </div>

      {/* RIGHT: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        
        {/* Notification Button */}
        <div style={{ position: 'relative' }}>
          <button 
            className="notification-btn"
            onClick={toggleNotifications}
            aria-label="Notifications"
          >
            <Bell size={20} color="var(--color-text-main)" />
            {unreadNotifications > 0 && (
              <span style={{
                position: 'absolute', top: '8px', right: '8px',
                width: '8px', height: '8px', borderRadius: '50%',
                backgroundColor: 'var(--color-secondary)',
                border: '2px solid white'
              }}></span>
            )}
          </button>
          
          {/* Notifications Popover */}
          {isNotificationsOpen && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={toggleNotifications}></div>
              <div className="card shadow-lg" style={{ 
                position: 'absolute', right: 0, top: 'calc(100% + 0.5rem)', width: '320px', 
                zIndex: 100, padding: 0, maxHeight: '400px', overflowY: 'auto',
                animation: 'fadeInUp 0.15s ease-out forwards'
              }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', fontWeight: 600 }}>Notifications</div>
                {notifications.length === 0 ? (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>No notifications yet.</div>
                ) : (
                  notifications.map(n => {
                    const isRead = Boolean(n.read || n.isRead);
                    return (
                      <div key={n.id} className="notification-item" style={{ 
                        padding: '1rem', borderBottom: '1px solid var(--color-border)', cursor: 'pointer', 
                        backgroundColor: isRead ? 'transparent' : 'rgba(8, 120, 209, 0.08)',
                        transition: 'background-color 0.2s',
                        position: 'relative'
                      }} onClick={() => { onNotificationClick(n.shipmentId); }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-text-main)' }}>{n.title}</div>
                          {!isRead && <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--color-secondary)' }}></span>}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{n.message}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', marginTop: '0.5rem' }}>{new Date(n.createdAt).toLocaleString()}</div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>

        {/* User Account */}
        <UserAccountMenu user={user} onLogout={onLogout} variant="navbar" />
        
        {/* New Shipment Button */}
        {onNewShipment && (
          <button 
            className="btn btn-primary btn-new-shipment hide-on-mobile" 
            onClick={onNewShipment}
            style={{ padding: '0 1.25rem', height: '44px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}
          >
            <Plus size={18} /> New Shipment
          </button>
        )}
      </div>
    </header>
  );
}
