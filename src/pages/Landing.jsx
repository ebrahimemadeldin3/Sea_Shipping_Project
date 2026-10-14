import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Ship, Navigation, Package, Globe, ArrowRight, CheckCircle, X, MapPin, Send } from 'lucide-react';
import Logo from '../components/Logo';
import '../styles/Landing.css';
import { getShipments, generateFullTimeline } from '../lib/shipment-service';

export default function Landing() {
  const [trackingId, setTrackingId] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [trackedShipment, setTrackedShipment] = useState(null);
  const [trackingError, setTrackingError] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut (Escape to close tracking modal)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && trackedShipment) {
        setTrackedShipment(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [trackedShipment]);

  const handleTrack = (e) => {
    e.preventDefault();
    setTrackingError('');
    const query = trackingId.trim().toUpperCase();
    if (!query) {
      setTrackingError('Please enter a shipment ID (e.g., SEA-2026-00021).');
      return;
    }
    const all = getShipments();
    const found = all.find(s => 
      (s.shipmentNumber && s.shipmentNumber.toUpperCase() === query) ||
      (s.id && s.id.toUpperCase() === query)
    );
    if (found) {
      setTrackedShipment(found);
    } else {
      setTrackingError(`Shipment "${query}" was not found. Please check your reference ID and try again.`);
      setTrackedShipment(null);
    }
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => setContactSubmitted(false), 4000);
  };

  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav className={`landing-navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <Logo />
          <div className="nav-links">
            <a href="#home" className="nav-link">Home</a>
            <a href="#how-it-works" className="nav-link">How It Works</a>
            <a href="#services" className="nav-link">Services</a>
            <a href="#track" className="nav-link">Track Shipment</a>
            <a href="#contact" className="nav-link">Contact</a>
          </div>
          <div className="nav-actions">
            <Link to="/auth" className="btn btn-secondary">Login</Link>
            <Link to="/auth" className="btn btn-primary">Start Shipping</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="container hero-grid">
          <div className="hero-content animate-stagger-1">
            <h1 className="hero-title">Ship Beyond Borders.</h1>
            <p className="hero-subtitle">
              Reliable sea freight connecting businesses and people around the world. From port to port, Navora makes international cargo shipping simple, transparent, and trackable.
            </p>
            <div className="hero-actions">
              <Link to="/auth" className="btn btn-primary btn-lg">
                Start Shipping <ArrowRight size={18} className="icon-move-right" />
              </Link>
              <a href="#track" className="btn btn-secondary btn-lg">Track Shipment</a>
            </div>
          </div>
          <div className="hero-visual animate-stagger-2">
            <div className="floating-ship" style={{ color: 'var(--color-primary)' }}>
              <Ship size={240} strokeWidth={1} style={{ margin: '0 auto', display: 'block', opacity: 0.1 }} />
              <svg width="100%" height="200" style={{ position: 'absolute', top: '50%', zIndex: -1, opacity: 0.5 }}>
                <path className="route-animation-path" d="M 0 100 Q 100 50 200 100 T 400 100" fill="none" stroke="var(--color-secondary)" strokeWidth="2" strokeDasharray="4 4"/>
              </svg>
            </div>
            
            <div className="floating-card floating-card-1">
              <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>SEA-2026-00128</div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                <span>Alexandria</span> <ArrowRight size={12}/> <span>Genoa</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-secondary)', fontWeight: 700 }}>● IN TRANSIT</div>
            </div>

            <div className="floating-card floating-card-2" style={{ alignItems: 'center', flexDirection: 'row', gap: '1rem' }}>
              <div style={{ backgroundColor: 'var(--color-info-bg)', color: 'var(--color-secondary)', padding: '0.5rem', borderRadius: '50%' }}>
                <Globe size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.25rem', lineHeight: 1 }}>120+</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Global Ports</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tracking Widget */}
      <div id="track" className="container" style={{ position: 'relative', zIndex: 20 }}>
        <div className="tracking-widget">
          <h3 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>Track Your Cargo</h3>
          {trackingError && <div style={{ color: 'var(--color-error)', fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 600 }}>{trackingError}</div>}
          <form onSubmit={handleTrack} className="tracking-input-group">
            <input 
              type="text" 
              placeholder="Enter Shipment ID (e.g., SEA-2026-00021)" 
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Track Shipment</button>
          </form>
          <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span>Quick test:</span>
            {['SEA-2026-00021', 'SEA-2026-00022', 'SEA-2026-00128'].map(id => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setTrackingId(id);
                  const all = getShipments();
                  const found = all.find(s => s.shipmentNumber === id);
                  if (found) {
                    setTrackedShipment(found);
                    setTrackingError('');
                  }
                }}
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: 'var(--color-secondary)'
                }}
              >
                {id}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="animate-stagger-1">
              <div className="stat-value">40+</div>
              <div className="stat-label">Countries Connected</div>
            </div>
            <div className="animate-stagger-2">
              <div className="stat-value">120+</div>
              <div className="stat-label">Ports Worldwide</div>
            </div>
            <div className="animate-stagger-3">
              <div className="stat-value">5K+</div>
              <div className="stat-label">Shipments Managed</div>
            </div>
            <div className="animate-stagger-4">
              <div className="stat-value">98%</div>
              <div className="stat-label">Successful Deliveries</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="section how-it-works">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3 className="step-title">Submit Request</h3>
              <p className="step-desc">Enter where your shipment is coming from, where it is going, and cargo information.</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3 className="step-title">Company Review</h3>
              <p className="step-desc">Navora reviews your shipping request and confirms shipment information.</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3 className="step-title">Ship & Track</h3>
              <p className="step-desc">Track your cargo throughout its journey until it reaches its destination.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="section">
        <div className="container">
          <h2 className="section-title">Our Services</h2>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon"><Package size={24} /></div>
              <h3 className="service-title">Full Container Load</h3>
              <p>FCL shipping for customers requiring dedicated containers.</p>
            </div>
            <div className="service-card">
              <div className="service-icon"><Package size={24} /></div>
              <h3 className="service-title">Less Than Container Load</h3>
              <p>LCL shipping for smaller cargo.</p>
            </div>
            <div className="service-card">
              <div className="service-icon"><Ship size={24} /></div>
              <h3 className="service-title">Port-to-Port Shipping</h3>
              <p>International cargo transportation between ports.</p>
            </div>
            <div className="service-card">
              <div className="service-icon"><Navigation size={24} /></div>
              <h3 className="service-title">Cargo Tracking</h3>
              <p>Real-time shipment status updates.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Global Connectivity */}
      <section className="section" style={{ backgroundColor: 'var(--color-surface)', borderTop: '1px solid var(--color-border-light)' }}>
        <div className="container text-center">
          <Globe size={48} color="var(--color-secondary)" style={{ margin: '0 auto 1.5rem auto', animation: 'pulseSubtle 4s infinite' }} />
          <h2 className="section-title" style={{ marginBottom: '2.5rem' }}>Global Coverage</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '4rem', flexWrap: 'wrap', fontSize: '1.25rem', fontWeight: '600' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--color-background)', padding: '1rem 2rem', borderRadius: 'var(--radius-lg)' }}>
              <div className="text-right">
                <div>Alexandria</div>
                <div style={{fontSize: '0.85rem', color: 'var(--color-text-muted)'}}>Egypt (EGALY)</div>
              </div>
              <div style={{ position: 'relative', width: '100px', display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '100%', height: '2px', borderTop: '2px dashed var(--color-border)' }}></div>
                <Ship size={20} color="var(--color-secondary)" style={{ position: 'absolute', animation: 'fadeRight 3s infinite linear', background: 'var(--color-background)', padding: '0 4px' }} />
              </div>
              <div className="text-left">
                <div>Genoa</div>
                <div style={{fontSize: '0.85rem', color: 'var(--color-text-muted)'}}>Italy (ITGOA)</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--color-background)', padding: '1rem 2rem', borderRadius: 'var(--radius-lg)' }}>
              <div className="text-right">
                <div>Shanghai</div>
                <div style={{fontSize: '0.85rem', color: 'var(--color-text-muted)'}}>China (CNSHA)</div>
              </div>
              <div style={{ position: 'relative', width: '100px', display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '100%', height: '2px', borderTop: '2px dashed var(--color-border)' }}></div>
                <Ship size={20} color="var(--color-secondary)" style={{ position: 'absolute', animation: 'fadeRight 3s infinite linear 1s', background: 'var(--color-background)', padding: '0 4px' }} />
              </div>
              <div className="text-left">
                <div>Rotterdam</div>
                <div style={{fontSize: '0.85rem', color: 'var(--color-text-muted)'}}>Netherlands (NLRTM)</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section" style={{ backgroundColor: 'var(--color-background)', borderTop: '1px solid var(--color-border)' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: '3rem' }}>
            <h2 className="section-title">Contact Operations & Support</h2>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0.5rem auto 0 auto' }}>
              Connect with our maritime dispatch coordinators for cargo quotes, port clearance questions, or vessel charters.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
            
            {/* Contact Details & Global Offices */}
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 700 }}>Global Operations Hubs</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '1rem', padding: '1rem', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <MapPin size={22} color="var(--color-secondary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontWeight: 700 }}>Alexandria Terminal Hub</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Port of Alexandria, Gate 4, Alexandria, Egypt</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-secondary)', marginTop: '0.25rem' }}>+20 3 487 0100 · operations@navora.demo</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', padding: '1rem', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <MapPin size={22} color="var(--color-secondary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontWeight: 700 }}>Genoa Maritime Gateway</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Ponte San Giorgio, 16126 Genoa, Italy</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-secondary)', marginTop: '0.25rem' }}>+39 010 555 4200 · genoa@navora.demo</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', padding: '1rem', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <MapPin size={22} color="var(--color-secondary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontWeight: 700 }}>Rotterdam Central Depot</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Maasvlakte 2, Rotterdam Port, Netherlands</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-secondary)', marginTop: '0.25rem' }}>+31 10 252 0900 · rotterdam@navora.demo</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Contact Form */}
            <div className="card shadow-md">
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 700 }}>Send Us an Inquiry</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Our cargo dispatch response team replies in under 2 hours.</p>

              {contactSubmitted ? (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', backgroundColor: 'var(--color-success-bg)', borderRadius: 'var(--radius-md)', color: 'var(--color-success)' }}>
                  <CheckCircle size={36} style={{ margin: '0 auto 0.75rem auto' }} />
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Inquiry Sent Successfully!</div>
                  <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>A logistics specialist will review your request and contact you.</div>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit}>
                  <div className="input-group">
                    <label className="input-label">Your Name</label>
                    <input type="text" className="input-field" placeholder="Capt. Sarah Jenkins" required />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Work Email</label>
                    <input type="email" className="input-field" placeholder="sarah@logistics.com" required />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Shipping Route or Inquiry</label>
                    <textarea className="input-field" rows={3} placeholder="Tell us about your cargo volume, origin, destination..." required></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary w-full" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <Send size={16} /> Send Inquiry
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: 'var(--color-primary-900)', color: 'rgba(255,255,255,0.7)', padding: '3rem 0 2rem 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Logo variant="compact" size={36} />
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'white' }}>NAVORA</div>
                <div style={{ fontSize: '0.75rem' }}>Moving Cargo. Connecting Worlds.</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', fontSize: '0.9rem' }}>
              <a href="#home" style={{ color: 'rgba(255,255,255,0.8)' }}>Home</a>
              <a href="#how-it-works" style={{ color: 'rgba(255,255,255,0.8)' }}>How It Works</a>
              <a href="#services" style={{ color: 'rgba(255,255,255,0.8)' }}>Services</a>
              <a href="#track" style={{ color: 'rgba(255,255,255,0.8)' }}>Track Shipment</a>
              <a href="#contact" style={{ color: 'rgba(255,255,255,0.8)' }}>Contact</a>
              <Link to="/auth" style={{ color: 'var(--color-secondary)' }}>Portal Login</Link>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8rem' }}>
            <div>&copy; {new Date().getFullYear()} Navora Shipping Enterprise Logistics. All rights reserved.</div>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Marine Cargo Compliance</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Tracking Modal */}
      {trackedShipment && (
        <div className="modal-overlay" style={{ zIndex: 1000 }} onClick={(e) => { if (e.target === e.currentTarget) setTrackedShipment(null); }}>
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>Tracking Details</h3>
              <button onClick={() => setTrackedShipment(null)}><X size={24} color="var(--color-text-muted)"/></button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{trackedShipment.shipmentNumber}</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{trackedShipment.status.replace(/_/g, ' ')}</div>
              </div>

              <div style={{ backgroundColor: 'var(--color-background)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Origin</div>
                    <div style={{ fontWeight: 600 }}>{trackedShipment.originPort}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Destination</div>
                    <div style={{ fontWeight: 600 }}>{trackedShipment.destinationPort}</div>
                  </div>
                  {trackedShipment.estimatedArrival && (
                    <div style={{ gridColumn: 'span 2' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Estimated Arrival</div>
                      <div style={{ fontWeight: 600 }}>{trackedShipment.estimatedArrival}</div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 style={{ marginBottom: '1rem', fontSize: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)' }}>Shipment Timeline</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {generateFullTimeline(trackedShipment).map((step, i, arr) => (
                    <div key={step.status} style={{ display: 'flex', gap: '1rem', opacity: step.state === 'future' ? 0.4 : 1 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ 
                          width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          backgroundColor: step.state === 'completed' ? 'var(--color-success)' : (step.state === 'current' ? 'var(--color-secondary)' : 'var(--color-border)'),
                          color: 'white',
                          boxShadow: step.state === 'current' ? '0 0 0 4px rgba(37, 99, 235, 0.2)' : 'none',
                          animation: step.state === 'current' ? 'pulseSubtle 2s infinite' : 'none'
                        }}>
                          {step.state === 'completed' ? <CheckCircle size={14} /> : (step.state === 'current' ? <div style={{ width: '8px', height: '8px', backgroundColor: 'white', borderRadius: '50%' }}></div> : '')}
                        </div>
                        {i !== arr.length - 1 && (
                          <div style={{ width: '2px', height: '100%', backgroundColor: step.state === 'completed' ? 'var(--color-success)' : 'var(--color-border)', minHeight: '30px' }}></div>
                        )}
                      </div>
                      <div style={{ paddingBottom: '1.5rem', marginTop: '2px' }}>
                        <div style={{ fontWeight: step.state === 'current' ? 700 : (step.state === 'completed' ? 600 : 500), color: step.state === 'future' ? 'var(--color-text-muted)' : 'var(--color-text-main)' }}>
                          {step.label}
                        </div>
                        {step.event && (
                          <>
                            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                              {new Date(step.event.timestamp).toLocaleString()} {step.event.location ? `• ${step.event.location}` : ''}
                            </div>
                            {step.event.note && (
                              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-main)', marginTop: '0.25rem' }}>{step.event.note}</div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
            <div className="modal-footer">
              <button className="btn btn-primary w-full" onClick={() => setTrackedShipment(null)}>Close Tracker</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
