import React, { useState } from 'react';
import { User, Shield, Bell, Settings as SettingsIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { resetNavoraDemoData } from '../../lib/seed';
import { updateUser } from '../../lib/auth-service';

export default function Settings({ user }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [toastMessage, setToastMessage] = useState('');

  // Profile form state
  const [profileData, setProfileData] = useState({
    fullName: user.fullName || '',
    phone: user.phone || '',
    companyName: user.companyName || '',
    country: user.country || 'EG'
  });

  // Security form state
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [securityError, setSecurityError] = useState('');

  // Notification preferences state
  const [notificationPrefs, setNotificationPrefs] = useState({
    emailShipmentUpdates: true,
    emailInvoices: true,
    smsAlerts: false,
    weatherAdvisories: true,
    marketingNews: false
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    if (!profileData.fullName.trim()) return;
    updateUser(user.id, profileData);
    showToast('Profile settings saved successfully.');
  };

  const handlePasswordSave = (e) => {
    e.preventDefault();
    setSecurityError('');
    if (!securityData.currentPassword) {
      setSecurityError('Please enter your current password.');
      return;
    }
    if (securityData.newPassword.length < 6) {
      setSecurityError('New password must be at least 6 characters.');
      return;
    }
    if (securityData.newPassword !== securityData.confirmPassword) {
      setSecurityError('New passwords do not match.');
      return;
    }

    updateUser(user.id, { password: securityData.newPassword });
    setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    showToast('Password updated successfully.');
  };

  const handleNotificationsSave = (e) => {
    e.preventDefault();
    showToast('Notification preferences updated.');
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all demo data? This cannot be undone.")) {
      resetNavoraDemoData();
    }
  };

  return (
    <div className="animate-fade-up">
      <div className="card shadow-sm" style={{ padding: '0', display: 'flex', minHeight: '600px', flexWrap: 'wrap' }}>
        {/* Settings Sidebar */}
        <div style={{ width: '250px', borderRight: '1px solid var(--color-border)', padding: '1.5rem', minWidth: '220px' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { id: 'profile', icon: User, label: 'Profile' },
              { id: 'security', icon: Shield, label: 'Security' },
              { id: 'notifications', icon: Bell, label: 'Notifications' },
              { id: 'preferences', icon: SettingsIcon, label: 'Preferences' }
            ].map(tab => (
              <li key={tab.id}>
                <button
                  type="button"
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
        <div style={{ flex: 1, padding: '2rem', minWidth: '300px' }}>
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSave}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Profile Settings</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Update your contact information and company details.</p>
              
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Full Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={profileData.fullName} 
                  onChange={e => setProfileData(p => ({ ...p, fullName: e.target.value }))}
                  required
                  style={{ width: '100%', maxWidth: '450px' }} 
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Email Address</label>
                <input 
                  type="email" 
                  className="input-field" 
                  defaultValue={user.email} 
                  disabled 
                  style={{ width: '100%', maxWidth: '450px', backgroundColor: 'var(--color-background)', opacity: 0.8 }} 
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', display: 'block' }}>Email cannot be changed in demo mode.</span>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Phone Number</label>
                <input 
                  type="tel" 
                  className="input-field" 
                  value={profileData.phone} 
                  onChange={e => setProfileData(p => ({ ...p, phone: e.target.value }))}
                  placeholder="+1 234 567 890" 
                  style={{ width: '100%', maxWidth: '450px' }} 
                />
              </div>

              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Company Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={profileData.companyName} 
                  onChange={e => setProfileData(p => ({ ...p, companyName: e.target.value }))}
                  placeholder="Company or Organization" 
                  style={{ width: '100%', maxWidth: '450px' }} 
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ borderRadius: 'var(--radius-full)' }}>Save Changes</button>
            </form>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handlePasswordSave}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Security</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Manage your account password and security credentials.</p>
              
              {securityError && (
                <div style={{ backgroundColor: 'var(--color-error-bg)', color: 'var(--color-error)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
                  {securityError}
                </div>
              )}

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Current Password</label>
                <input 
                  type="password" 
                  className="input-field" 
                  value={securityData.currentPassword} 
                  onChange={e => setSecurityData(s => ({ ...s, currentPassword: e.target.value }))}
                  placeholder="••••••••" 
                  style={{ width: '100%', maxWidth: '400px' }} 
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>New Password</label>
                <input 
                  type="password" 
                  className="input-field" 
                  value={securityData.newPassword} 
                  onChange={e => setSecurityData(s => ({ ...s, newPassword: e.target.value }))}
                  placeholder="At least 6 characters" 
                  style={{ width: '100%', maxWidth: '400px' }} 
                />
              </div>

              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Confirm New Password</label>
                <input 
                  type="password" 
                  className="input-field" 
                  value={securityData.confirmPassword} 
                  onChange={e => setSecurityData(s => ({ ...s, confirmPassword: e.target.value }))}
                  placeholder="••••••••" 
                  style={{ width: '100%', maxWidth: '400px' }} 
                />
              </div>

              <button type="submit" className="btn btn-secondary">Update Password</button>
            </form>
          )}

          {activeTab === 'notifications' && (
            <form onSubmit={handleNotificationsSave}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Notification Preferences</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Choose how and when you receive freight status updates and alerts.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem', maxWidth: '550px' }}>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Shipment Status Changes</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Get notified when your cargo departs, docks, or delivers.</div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notificationPrefs.emailShipmentUpdates} 
                    onChange={e => setNotificationPrefs(p => ({ ...p, emailShipmentUpdates: e.target.checked }))} 
                    style={{ width: '18px', height: '18px', accentColor: 'var(--color-secondary)' }}
                  />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Invoice & Payment Notices</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Receive email copies of generated invoices and payment receipts.</div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notificationPrefs.emailInvoices} 
                    onChange={e => setNotificationPrefs(p => ({ ...p, emailInvoices: e.target.checked }))} 
                    style={{ width: '18px', height: '18px', accentColor: 'var(--color-secondary)' }}
                  />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Port Weather Advisories</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Receive severe marine weather and port delay advisories.</div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notificationPrefs.weatherAdvisories} 
                    onChange={e => setNotificationPrefs(p => ({ ...p, weatherAdvisories: e.target.checked }))} 
                    style={{ width: '18px', height: '18px', accentColor: 'var(--color-secondary)' }}
                  />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>SMS Real-Time Alerts</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Urgent SMS dispatch updates directly to your registered phone.</div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notificationPrefs.smsAlerts} 
                    onChange={e => setNotificationPrefs(p => ({ ...p, smsAlerts: e.target.checked }))} 
                    style={{ width: '18px', height: '18px', accentColor: 'var(--color-secondary)' }}
                  />
                </label>
              </div>

              <button type="submit" className="btn btn-primary" style={{ borderRadius: 'var(--radius-full)' }}>Save Notification Preferences</button>
            </form>
          )}

          {activeTab === 'preferences' && (
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Platform Preferences</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Customize your display and operational settings.</p>
              
              <div style={{ maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="input-group">
                  <label className="input-label">Preferred Currency</label>
                  <select className="input-field" defaultValue="USD">
                    <option value="USD">USD ($) - US Dollar</option>
                    <option value="EUR">EUR (€) - Euro</option>
                    <option value="GBP">GBP (£) - British Pound</option>
                    <option value="EGP">EGP (E£) - Egyptian Pound</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Timezone</label>
                  <select className="input-field" defaultValue="UTC">
                    <option value="UTC">UTC (Universal Coordinated Time)</option>
                    <option value="EST">EST (Eastern Standard Time)</option>
                    <option value="CET">CET (Central European Time)</option>
                    <option value="EET">EET (Eastern European Time)</option>
                  </select>
                </div>
              </div>
              
              <div style={{ padding: '1.5rem', border: '1px solid var(--color-error)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-error-bg)', maxWidth: '550px' }}>
                <h4 style={{ color: 'var(--color-error)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 700 }}>
                  <AlertCircle size={18} /> Danger Zone
                </h4>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                  Resetting the demo data will wipe all custom shipments, tickets, and invoices, and restore the initial seed state.
                </p>
                <button type="button" className="btn" style={{ backgroundColor: 'var(--color-error)', color: 'white' }} onClick={handleReset}>
                  Reset Demo Data
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings Toast */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          backgroundColor: 'var(--color-success)',
          color: 'white',
          padding: '0.85rem 1.5rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          zIndex: 9999,
          animation: 'fadeInUp 0.3s ease-out'
        }}>
          <CheckCircle size={20} />
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

