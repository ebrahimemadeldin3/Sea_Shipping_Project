import React, { useState } from 'react';
import DashboardHeader from '../../components/DashboardHeader';
import { User, Shield, Bell, Settings as SettingsIcon, AlertCircle } from 'lucide-react';
import { resetNavoraDemoData } from '../../lib/seed';

export default function Settings({ user, onLogout, onOpenSidebar, notifications, unreadNotifications, toggleNotifications }) {
  const [activeTab, setActiveTab] = useState('profile');

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all demo data? This cannot be undone.")) {
      resetNavoraDemoData();
    }
  };

  return (
    <div className="animate-fade-up">
      <div className="card shadow-sm" style={{ padding: '0', display: 'flex', minHeight: '600px' }}>
            {/* Settings Sidebar */}
            <div style={{ width: '250px', borderRight: '1px solid var(--color-border)', padding: '1.5rem' }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[{ id: 'profile', icon: User, label: 'Profile' },
                  { id: 'security', icon: Shield, label: 'Security' },
                  { id: 'notifications', icon: Bell, label: 'Notifications' },
                  { id: 'preferences', icon: SettingsIcon, label: 'Preferences' }].map(tab => (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        backgroundColor: activeTab === tab.id ? 'var(--color-info-bg)' : 'transparent',
                        color: activeTab === tab.id ? 'var(--color-info)' : 'var(--color-text-muted)',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        fontWeight: 600,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <tab.icon size={18} />
                      {tab.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Settings Content */}
            <div style={{ flex: 1, padding: '2rem' }}>
              {activeTab === 'profile' && (
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem' }}>Profile Settings</h3>
                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Full Name</label>
                    <input type="text" className="form-control" defaultValue={user.fullName} style={{ width: '100%', maxWidth: '400px' }} />
                  </div>
                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Email</label>
                    <input type="email" className="form-control" defaultValue={user.email} disabled style={{ width: '100%', maxWidth: '400px' }} />
                  </div>
                  <button className="btn btn-primary" style={{ borderRadius: 'var(--radius-full)' }}>Save Changes</button>
                </div>
              )}

              {activeTab === 'security' && (
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem' }}>Security</h3>
                  <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Manage your password and authentication settings.</p>
                  <button className="btn btn-secondary">Change Password</button>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem' }}>Preferences</h3>
                  
                  <div style={{ marginTop: '3rem', padding: '1.5rem', border: '1px solid var(--color-error)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-error-bg)' }}>
                    <h4 style={{ color: 'var(--color-error)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 700 }}>
                      <AlertCircle size={18} /> Danger Zone
                    </h4>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                      Resetting the demo data will wipe all custom shipments, tickets, and invoices, and restore the initial state.
                    </p>
                    <button className="btn" style={{ backgroundColor: 'var(--color-error)', color: 'white' }} onClick={handleReset}>
                      Reset Demo Data
                    </button>
                  </div>
                </div>
              )}
            </div>
      </div>
    </div>
  );
}
