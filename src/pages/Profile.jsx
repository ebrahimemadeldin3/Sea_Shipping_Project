import React, { useState, useEffect } from 'react';
import { ArrowLeft, UserRound, Mail, MapPin, Phone, Building, CheckCircle, Ship, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import UserAccountMenu, { Avatar } from '../components/UserAccountMenu';
import DashboardHeader from '../components/DashboardHeader';
import { updateUser, getCurrentUser } from '../lib/auth-service';
import { getCustomerShipments } from '../lib/shipment-service';

export default function Profile({ user: initialUser, onLogout }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(initialUser);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user.fullName || '',
    phone: user.phone || '',
    country: user.country || '',
    companyName: user.companyName || ''
  });
  
  const [shipments, setShipments] = useState([]);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    // Keep user in sync if changed from other tabs
    const handleStorage = (e) => {
      if (!e || e.key === 'navora_users' || !e.key) {
        const current = getCurrentUser();
        if (current) setUser(current);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    if (user.role === 'customer') {
      setShipments(getCustomerShipments(user.id));
    }
  }, [user.id, user.role]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const updated = updateUser(user.id, formData);
    setUser(updated);
    setIsEditing(false);
    
    // Show toast
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  const handleCancel = () => {
    setFormData({
      fullName: user.fullName || '',
      phone: user.phone || '',
      country: user.country || '',
      companyName: user.companyName || ''
    });
    setIsEditing(false);
  };

  const total = shipments.length;
  const pending = shipments.filter(s => s.status === 'PENDING_REVIEW').length;
  const inTransit = shipments.filter(s => s.status === 'IN_TRANSIT').length;
  const delivered = shipments.filter(s => s.status === 'DELIVERED').length;
  
  const formattedDate = new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  const backRoute = user.role === 'company' ? '/company' : '/dashboard';

  return (
    <div className="dashboard-layout">
      {/* Sidebar - Simplified for Profile */}
      <aside className="sidebar hide-on-mobile">
        <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }} onClick={() => navigate(backRoute)}>
          <Logo variant="compact" size={32} />
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>NAVORA</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{user.role === 'company' ? 'Company Portal' : 'Shipping & Logistics'}</div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button 
            onClick={() => navigate(backRoute)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'transparent',
              color: 'rgba(255,255,255,0.7)',
              position: 'relative',
              textAlign: 'left', fontWeight: 600, transition: 'all 0.2s'
            }}
            className="sidebar-link-hover"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <UserAccountMenu user={user} onLogout={onLogout} variant="sidebar" />
        </div>
      </aside>

      <main className="main-content">
        <DashboardHeader
          user={user}
          activeTab="Profile"
          onLogout={onLogout}
          onBack={() => navigate(backRoute)}
          notifications={[]}
          unreadNotifications={0}
          isNotificationsOpen={false}
          toggleNotifications={() => {}}
          onNotificationClick={() => {}}
        />

        <div className="dashboard-scroll" style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
          
          {/* Profile Summary Hero */}
          <div className="card animate-fade-up shadow-sm" style={{ padding: 0, overflow: 'hidden', marginBottom: '2rem' }}>
            <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '2rem', borderBottom: '1px solid var(--color-border)', flexWrap: 'wrap' }}>
              <Avatar fullName={user.fullName} size={88} style={{ fontSize: '32px' }} />
              <div style={{ flex: 1, minWidth: '250px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.25rem' }}>
                  <h3 style={{ fontSize: '1.75rem', margin: 0 }}>{user.fullName}</h3>
                  <span className="badge badge-info">{user.role.toUpperCase()}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                    <Mail size={16} /> {user.email}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                    <Clock size={16} /> Member since {formattedDate}
                  </div>
                </div>
              </div>
              <div>
                {!isEditing && (
                  <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md-grid-cols-2 gap-8" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            
            {/* Personal Information */}
            <div className="card animate-stagger-1 shadow-sm">
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserRound size={18} color="var(--color-secondary)" /> Personal Information
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem', fontWeight: 600 }}>Full Name</label>
                  {isEditing ? (
                    <input type="text" className="input-field" name="fullName" value={formData.fullName} onChange={handleInputChange} />
                  ) : (
                    <div style={{ fontWeight: 600, fontSize: '1rem' }}>{user.fullName}</div>
                  )}
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem', fontWeight: 600 }}>Email Address</label>
                  <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--color-text-muted)' }}>{user.email}</div>
                  {isEditing && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: '0.25rem' }}>Email cannot be changed.</div>}
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem', fontWeight: 600 }}>Phone Number</label>
                  {isEditing ? (
                    <input type="tel" className="input-field" name="phone" value={formData.phone} onChange={handleInputChange} />
                  ) : (
                    <div style={{ fontWeight: 600, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Phone size={14} color="var(--color-text-light)" /> {user.phone || 'Not provided'}
                    </div>
                  )}
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem', fontWeight: 600 }}>Country</label>
                  {isEditing ? (
                    <input type="text" className="input-field" name="country" value={formData.country} onChange={handleInputChange} />
                  ) : (
                    <div style={{ fontWeight: 600, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={14} color="var(--color-text-light)" /> {user.country || 'Not provided'}
                    </div>
                  )}
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem', fontWeight: 600 }}>Company Name</label>
                  {isEditing ? (
                    <input type="text" className="input-field" name="companyName" value={formData.companyName} onChange={handleInputChange} />
                  ) : (
                    <div style={{ fontWeight: 600, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Building size={14} color="var(--color-text-light)" /> {user.companyName || 'Not provided'}
                    </div>
                  )}
                </div>
              </div>

              {isEditing && (
                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button className="btn btn-outline" onClick={handleCancel} style={{ flex: 1 }}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleSave} style={{ flex: 1 }} disabled={!formData.fullName.trim()}>Save Changes</button>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Account Information */}
              <div className="card animate-stagger-2 shadow-sm">
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Building size={18} color="var(--color-secondary)" /> Account Information
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem', fontWeight: 600 }}>Account Role</label>
                    <div style={{ fontWeight: 600, fontSize: '1rem', textTransform: 'capitalize' }}>{user.role}</div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem', fontWeight: 600 }}>Account ID</label>
                    <div style={{ fontWeight: 600, fontSize: '1rem', fontFamily: 'monospace' }}>{user.id}</div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem', fontWeight: 600 }}>Member Since</label>
                    <div style={{ fontWeight: 600, fontSize: '1rem' }}>{formattedDate}</div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem', fontWeight: 600 }}>Account Status</label>
                    <div><span className="badge badge-success">Active</span></div>
                  </div>
                </div>
              </div>

              {/* Shipment Activity for Customers */}
              {user.role === 'customer' && (
                <div className="card animate-stagger-3 shadow-sm">
                  <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Ship size={18} color="var(--color-secondary)" /> Shipment Activity
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ padding: '1rem', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                      <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text-main)' }}>{total}</div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</div>
                    </div>
                    <div style={{ padding: '1rem', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                      <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-secondary)' }}>{inTransit}</div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>In Transit</div>
                    </div>
                    <div style={{ padding: '1rem', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                      <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-success)' }}>{delivered}</div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Delivered</div>
                    </div>
                    <div style={{ padding: '1rem', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                      <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-warning)' }}>{pending}</div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>

      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          backgroundColor: 'var(--color-success)',
          color: 'white',
          padding: '1rem 1.5rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          animation: 'fadeInUp 0.3s ease-out forwards',
          zIndex: 9999
        }}>
          <CheckCircle size={20} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Profile Updated</div>
            <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Your account information has been saved successfully.</div>
          </div>
        </div>
      )}
    </div>
  );
}
