import React, { useState, useRef, useEffect } from 'react';
import { UserRound, LogOut, ChevronUp, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function getInitials(fullName) {
  if (!fullName) return '';
  const parts = fullName.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
}

export function Avatar({ fullName, size = 40, style = {} }) {
  const initials = getInitials(fullName);
  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      backgroundColor: 'var(--color-secondary)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 700,
      fontSize: `${size * 0.4}px`,
      border: '2px solid rgba(255,255,255,0.2)',
      flexShrink: 0,
      ...style
    }}>
      {initials}
    </div>
  );
}

export default function UserAccountMenu({ user, onLogout, variant = 'sidebar' }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen]);

  const handleProfileClick = () => {
    setIsOpen(false);
    navigate('/profile');
  };

  const isSidebar = variant === 'sidebar';
  
  return (
    <div ref={menuRef} style={{ position: 'relative', width: isSidebar ? '100%' : 'auto' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={!isSidebar ? 'account-btn' : ''}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          width: '100%',
          textAlign: 'left',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: isSidebar ? '0' : '0.25rem',
          color: isSidebar ? 'white' : 'var(--color-text-main)',
        }}
        aria-label="Open account menu"
      >
        <Avatar fullName={user.fullName} size={40} />
        
        {isSidebar && (
          <>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user.fullName}</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.7, textTransform: 'capitalize' }}>{user.role}</div>
            </div>
            {isOpen ? <ChevronDown size={16} style={{ opacity: 0.7 }} /> : <ChevronUp size={16} style={{ opacity: 0.7 }} />}
          </>
        )}
        
        {!isSidebar && (
          <div className="hide-on-tablet" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textAlign: 'left', padding: '0 0.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.2 }}>{user.fullName.split(' ')[0]}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'capitalize', lineHeight: 1.2 }}>{user.role}</div>
            </div>
            <ChevronDown size={14} style={{ color: 'var(--color-text-muted)', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }} />
          </div>
        )}
      </button>

      {isOpen && (
        <div 
          className="card account-dropdown"
          style={{
            position: 'absolute',
            [isSidebar ? 'bottom' : 'top']: 'calc(100% + 0.5rem)',
            [isSidebar ? 'left' : 'right']: 0,
            width: '260px',
            padding: '0.5rem',
            zIndex: 1000,
            animation: 'fadeInUp 0.15s ease-out forwards',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--color-border)'
          }}
        >
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border-light)', marginBottom: '0.5rem' }}>
            <div style={{ fontWeight: 700, color: 'var(--color-text-main)', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.fullName}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-secondary)', marginTop: '0.25rem', fontWeight: 600, textTransform: 'uppercase' }}>{user.role}</div>
          </div>
          
          <button 
            className="dropdown-item"
            onClick={handleProfileClick}
          >
            <UserRound size={16} /> Profile
          </button>
          
          <button 
            className="dropdown-item dropdown-item-danger"
            onClick={() => {
              if (window.confirm('Log out of Navora? You will need to sign in again to access your shipments.')) {
                onLogout();
              }
            }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}
    </div>
  );
}
