import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Ship, Navigation, Package, Globe, Clock, ArrowRight, CheckCircle, MapPin, X } from 'lucide-react';
import Logo from '../components/Logo';
import '../styles/Landing.css';
import { getShipmentByNumber, generateFullTimeline } from '../lib/shipment-service';

export default function Landing() {
  const [trackingId, setTrackingId] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [trackedShipment, setTrackedShipment] = useState(null);
  const [trackingError, setTrackingError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTrack = (e) => {
    e.preventDefault();
    setTrackingError('');
    if (trackingId) {
      const shipment = getShipmentByNumber(trackingId);
      if (shipment) {
        setTrackedShipment(shipment);
      } else {
        setTrackingError('Shipment not found. Check your shipment ID and try again.');
        setTrackedShipment(null);
      }
    }
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

      {/* Tracking Modal */}
      {trackedShipment && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
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
