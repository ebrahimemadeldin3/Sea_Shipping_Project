import React from 'react';

export default function Logo({ size = 32, variant = 'full', className = '' }) {
  const isCompact = variant === 'compact';

  return (
    <div className={`logo ${className}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-primary)' }}>
      {/* Custom Navora Symbol SVG */}
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 52C24 52 28 60 40 60C52 60 56 52 60 52" stroke="var(--color-secondary)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 52L12 16L32 44L32 16L52 16L52 44" stroke="var(--color-primary)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M32 44L12 16" stroke="var(--color-accent)" strokeWidth="8" strokeLinecap="round"/>
      </svg>
      
      {!isCompact && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', color: 'inherit' }}>NAVORA</span>
          <span style={{ fontWeight: 400, fontSize: '0.65rem', letterSpacing: '0.15em', color: 'inherit', opacity: 0.8 }}>SHIPPING</span>
        </div>
      )}
    </div>
  );
}
