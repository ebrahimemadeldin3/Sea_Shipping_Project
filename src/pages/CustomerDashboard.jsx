import React, { useState, useEffect } from 'react';
import { Bell, User, Plus, Package, Clock, CheckCircle, Navigation, MapPin, X, ArrowRight, AlertTriangle, Ship, Search, Check } from 'lucide-react';
import Logo from '../components/Logo';
import { getCustomerShipments, createShipment, generateFullTimeline, STATUS_LIST } from '../lib/shipment-service';
import { createNotification, getUnreadCount, markAllAsRead, getNotifications } from '../lib/notification-service';
import UserAccountMenu from '../components/UserAccountMenu';
import DashboardHeader from '../components/DashboardHeader';
import Sidebar from '../components/Sidebar';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Invoices from './dashboard/Invoices';
import Support from './dashboard/Support';
import Settings from './dashboard/Settings';

const getStatusBadgeClass = (status) => {
  if (['DELIVERED', 'ACCEPTED'].includes(status)) return 'badge-success';
  if (['PENDING_REVIEW', 'PREPARING'].includes(status)) return 'badge-warning';
  if (status === 'REJECTED') return 'badge-error';
  return 'badge-info';
};

const getStatusLabel = (status) => {
  if (!status) return '';
  return status.replace(/_/g, ' ');
};

const PORTS = {
  Egypt: ['Alexandria Port', 'Port Said', 'Damietta Port', 'Sokhna Port'],
  Italy: ['Genoa Port', 'Trieste', 'Naples', 'La Spezia'],
  China: ['Shanghai Port', 'Shenzhen', 'Ningbo'],
  Netherlands: ['Rotterdam Port', 'Amsterdam']
};

export default function CustomerDashboard({ user, onLogout }) {
  const location = useLocation();
  const path = location.pathname;
  
  let activeTab = 'Overview';
  let titleOverride = null;
  let subtitleOverride = null;
  
  if (path.includes('/shipments')) activeTab = 'My Shipments';
  else if (path.includes('/track')) activeTab = 'Track Shipment';
  else if (path.includes('/invoices')) { activeTab = 'Invoices'; titleOverride = 'Invoices'; subtitleOverride = 'Manage your billing and payments.'; }
  else if (path.includes('/support')) { activeTab = 'Support'; titleOverride = 'Support'; subtitleOverride = 'Get help with your shipments and billing.'; }
  else if (path.includes('/settings')) { activeTab = 'Settings'; titleOverride = 'Settings'; subtitleOverride = 'Manage your account preferences and security.'; }
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isNewShipmentOpen, setIsNewShipmentOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  
  // Storage state
  const [shipments, setShipments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // My Shipments filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // New Shipment State
  const [newShipmentStep, setNewShipmentStep] = useState(1);
  const [formData, setFormData] = useState({
    originCountry: '', originPort: '', destinationCountry: '', destinationPort: '',
    cargoType: '', description: '', weight: '', quantity: '', length: '', width: '', height: '', containerType: '',
    senderName: user.fullName, senderPhone: '', senderAddress: '',
    receiverName: '', receiverPhone: '', receiverAddress: '', serviceType: 'Port-to-Port'
  });
  const [formErrors, setFormErrors] = useState({});
  const [createdShipmentRef, setCreatedShipmentRef] = useState(null);

  // Track Shipment state
  const [trackSearch, setTrackSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load shipments
  useEffect(() => {
    const loadData = () => {
      setShipments(getCustomerShipments(user.id));
      setUnreadNotifications(getUnreadCount(user.id));
      setNotifications(getNotifications(user.id));
    };
    loadData();
    const timer = setTimeout(() => setIsLoading(false), 500);
    
    const handleStorage = (e) => {
      if (e.key === 'navora_shipments' || e.key === 'navora_notifications') loadData();
    };
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearTimeout(timer);
    };
  }, [user.id]);

  // Stats
  const total = shipments.length;
  const pending = shipments.filter(s => s.status === 'PENDING_REVIEW').length;
  const inTransit = shipments.filter(s => s.status === 'IN_TRANSIT').length;
  const delivered = shipments.filter(s => s.status === 'DELIVERED').length;

  // Filtered shipments
  const filteredShipments = shipments.filter(s => {
    if (statusFilter !== 'All' && s.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return s.shipmentNumber.toLowerCase().includes(q) ||
             s.originCountry?.toLowerCase().includes(q) ||
             s.destinationCountry?.toLowerCase().includes(q) ||
             s.cargoType?.toLowerCase().includes(q);
    }
    return true;
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
    // Reset port if country changes
    if (name === 'originCountry') setFormData(prev => ({ ...prev, originPort: '' }));
    if (name === 'destinationCountry') setFormData(prev => ({ ...prev, destinationPort: '' }));
  };

  const validateStep = () => {
    const errors = {};
    if (newShipmentStep === 1) {
      if (!formData.originCountry) errors.originCountry = 'Origin Country is required';
      if (!formData.originPort) errors.originPort = 'Origin Port is required';
      if (!formData.destinationCountry) errors.destinationCountry = 'Destination Country is required';
      if (!formData.destinationPort) errors.destinationPort = 'Destination Port is required';
    } else if (newShipmentStep === 2) {
      if (!formData.cargoType) errors.cargoType = 'Cargo Type is required';
      if (!formData.weight || formData.weight <= 0) errors.weight = 'Valid weight is required';
      if (!formData.quantity || formData.quantity <= 0) errors.quantity = 'Valid quantity is required';
      if (!formData.containerType) errors.containerType = 'Container selection is required';
    } else if (newShipmentStep === 3) {
      if (!formData.senderName) errors.senderName = 'Sender Name is required';
      if (!formData.receiverName) errors.receiverName = 'Receiver Name is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) setNewShipmentStep(s => s + 1);
  };

  const handleNewShipmentSubmit = (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    
    const newShipment = createShipment(user.id, formData);

    createNotification('usr_admin', {
      type: 'NEW_REQUEST',
      title: 'New Shipping Request',
      message: `${user.fullName} submitted request ${newShipment.shipmentNumber}.`,
      shipmentId: newShipment.id
    });

    setShipments(getCustomerShipments(user.id));
    setCreatedShipmentRef(newShipment);
    setNewShipmentStep(5); // Success step
  };

  const closeNewShipment = () => {
    setIsNewShipmentOpen(false);
    setNewShipmentStep(1);
    setCreatedShipmentRef(null);
    setFormData({
      originCountry: '', originPort: '', destinationCountry: '', destinationPort: '',
      cargoType: '', description: '', weight: '', quantity: '', length: '', width: '', height: '', containerType: '',
      senderName: user.fullName, senderPhone: '', senderAddress: '',
      receiverName: '', receiverPhone: '', receiverAddress: '', serviceType: 'Port-to-Port'
    });
    setFormErrors({});
  };

  const handleTrack = () => {
    const found = shipments.find(s => s.shipmentNumber === trackSearch.trim().toUpperCase());
    if (found) {
      setSelectedShipment(found);
    } else {
      alert('We couldn\'t find a shipment matching that ID.');
    }
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    if (!isNotificationsOpen && unreadNotifications > 0) {
      markAllAsRead(user.id);
      setUnreadNotifications(0);
      // Reload notifications to update their isRead status visually
      setNotifications(getNotifications(user.id));
    }
  };

  const renderTimeline = (shipment) => {
    const fullTimeline = generateFullTimeline(shipment);
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {fullTimeline.map((step, i) => (
          <div key={step.status} style={{ display: 'flex', gap: '1rem', opacity: step.state === 'future' ? 0.4 : 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ 
                width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: step.state === 'completed' ? 'var(--color-success)' : (step.state === 'current' ? 'var(--color-secondary)' : 'var(--color-border)'),
                color: 'white',
                boxShadow: step.state === 'current' ? '0 0 0 4px rgba(37, 99, 235, 0.2)' : 'none',
                animation: step.state === 'current' ? 'pulseSubtle 2s infinite' : 'none'
              }}>
                {step.state === 'completed' ? <Check size={14} /> : (step.state === 'current' ? <div style={{ width: '8px', height: '8px', backgroundColor: 'white', borderRadius: '50%' }}></div> : '')}
              </div>
              {i !== fullTimeline.length - 1 && (
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
    );
  };

  return (
    <div className="dashboard-layout">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="drawer-overlay" onClick={() => setSidebarOpen(false)} style={{ zIndex: 99 }}></div>
      )}

      <Sidebar 
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarOpen={isSidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={onLogout}
        onNewShipment={() => setIsNewShipmentOpen(true)}
      />

      {/* Main Content */}
      <main className="main-content">
        <DashboardHeader
          user={user}
          activeTab={activeTab}
          title={titleOverride}
          subtitle={subtitleOverride}
          onLogout={onLogout}
          onOpenSidebar={() => setSidebarOpen(true)}
          onNewShipment={() => setIsNewShipmentOpen(true)}
          notifications={notifications}
          unreadNotifications={unreadNotifications}
          isNotificationsOpen={isNotificationsOpen}
          toggleNotifications={toggleNotifications}
          onNotificationClick={(shipmentId) => {
            const ship = shipments.find(s => s.id === shipmentId);
            if(ship) { setSelectedShipment(ship); setIsNotificationsOpen(false); }
          }}
        />

        <div className="dashboard-scroll">
          {activeTab === 'Overview' && (
            <div className="animate-fade-up">
              {/* Stats */}
              <div className="grid grid-cols-4 gap-6 stats-grid" style={{ marginBottom: '2rem' }}>
                <div className="card animate-stagger-1">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <div style={{ padding: '0.5rem', backgroundColor: 'var(--color-info-bg)', color: 'var(--color-secondary)', borderRadius: 'var(--radius-md)' }}><Package size={20} /></div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Total Shipments</div>
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{total}</div>
                </div>
                <div className="card animate-stagger-2">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <div style={{ padding: '0.5rem', backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning)', borderRadius: 'var(--radius-md)' }}><Clock size={20} /></div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Pending Requests</div>
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{pending}</div>
                </div>
                <div className="card animate-stagger-3">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <div style={{ padding: '0.5rem', backgroundColor: '#e0f2fe', color: '#0284c7', borderRadius: 'var(--radius-md)' }}><Navigation size={20} /></div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>In Transit</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{inTransit}</div>
                    {inTransit > 0 && <div style={{ width: '40px', height: '2px', borderTop: '2px dashed #0284c7', marginBottom: '0.5rem', opacity: 0.5 }}></div>}
                  </div>
                </div>
                <div className="card animate-stagger-4">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <div style={{ padding: '0.5rem', backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)', borderRadius: 'var(--radius-md)' }}><CheckCircle size={20} /></div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Delivered</div>
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{delivered}</div>
                </div>
              </div>

              {/* Active Shipment Hero Widget */}
              {inTransit > 0 && shipments.find(s => !['PENDING_REVIEW', 'REJECTED', 'DELIVERED', 'ACCEPTED', 'PREPARING'].includes(s.status)) && (() => {
                const activeS = shipments.find(s => !['PENDING_REVIEW', 'REJECTED', 'DELIVERED', 'ACCEPTED', 'PREPARING'].includes(s.status));
                return (
                  <div className="card animate-stagger-4" style={{ marginBottom: '2rem', padding: '1.5rem', borderLeft: '4px solid var(--color-accent)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>YOUR ACTIVE SHIPMENT</div>
                      <span className={`badge ${getStatusBadgeClass(activeS.status)}`} style={{ padding: '0.2rem 0.75rem' }}>{getStatusLabel(activeS.status)}</span>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
                      <div style={{ minWidth: '150px' }}>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{activeS.shipmentNumber}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{activeS.vessel || 'Vessel Assigned'}</div>
                      </div>
                      
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '300px' }}>
                        <div className="text-right" style={{ width: '120px' }}>
                          <div style={{ fontWeight: 700 }}>{activeS.originPort.split(' ')[0]}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{activeS.originCountry}</div>
                        </div>
                        <div style={{ flex: 1, padding: '0 1rem', position: 'relative' }}>
                          <div style={{ width: '100%', height: '2px', borderTop: '2px dashed var(--color-border)' }}></div>
                          <Ship size={18} color="var(--color-accent)" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'var(--color-surface)', padding: '0 4px', animation: 'fadeRight 3s infinite linear' }} />
                        </div>
                        <div className="text-left" style={{ width: '120px' }}>
                          <div style={{ fontWeight: 700 }}>{activeS.destinationPort.split(' ')[0]}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{activeS.destinationCountry}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <div style={{ minWidth: '100px' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Estimated Arrival</div>
                          <div style={{ fontWeight: 600 }}>{activeS.estimatedArrival ? new Date(activeS.estimatedArrival).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'TBD'}</div>
                        </div>
                        <button className="btn btn-outline" style={{ padding: '0.5rem 1rem' }} onClick={() => setSelectedShipment(activeS)}>View Shipment →</button>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Recent Shipments */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3>Recent Shipments</h3>
                  <button className="btn btn-outline" onClick={() => setActiveTab('My Shipments')}>View All</button>
                </div>
                <div className="table-container">
                  {shipments.length === 0 ? (
                    <div className="empty-state compact">
                      <div className="empty-state-icon" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-secondary)' }}><Ship size={32} /></div>
                      <div className="empty-state-title" style={{ fontSize: '1.1rem' }}>No Shipments Yet</div>
                      <div className="empty-state-desc" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>Your first international shipment starts here.</div>
                      <button className="btn btn-primary" onClick={() => setIsNewShipmentOpen(true)}>Create Shipment</button>
                    </div>
                  ) : (
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Shipment ID</th>
                          <th>Route</th>
                          <th>Cargo</th>
                          <th>Date</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shipments.slice(0, 5).map(s => (
                          <tr key={s.id}>
                            <td style={{ fontWeight: 600 }}>{s.shipmentNumber}</td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span>{s.originPort}</span>
                                <ArrowRight size={14} color="var(--color-text-muted)" />
                                <span>{s.destinationPort}</span>
                              </div>
                            </td>
                            <td>{s.cargoType}</td>
                            <td>{s.createdAt.split('T')[0]}</td>
                            <td><span className={`badge ${getStatusBadgeClass(s.status)}`}>{getStatusLabel(s.status)}</span></td>
                            <td><button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => setSelectedShipment(s)}>View Details →</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'My Shipments' && (
            <div className="card animate-fade-up">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h3>All Shipments</h3>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <div className="input-group" style={{ marginBottom: 0, minWidth: '200px' }}>
                    <div style={{ position: 'relative' }}>
                      <Search size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input type="text" className="input-field" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ paddingLeft: '2rem' }} />
                    </div>
                  </div>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <select className="input-field" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                      <option value="All">All Statuses</option>
                      {STATUS_LIST.map(status => (
                        <option key={status} value={status}>{getStatusLabel(status)}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="table-container responsive-table-container">
                  {isLoading ? (
                <div style={{ marginTop: '2rem' }}>
                  {[1, 2, 3, 4, 5].map(i => (
                     <div key={i} className="skeleton" style={{ height: '80px', marginBottom: '0.5rem' }}></div>
                  ))}
                </div>
              ) : filteredShipments.length === 0 ? (
                    <div className="empty-state compact">
                      <Package size={32} className="empty-state-icon" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)' }} />
                      <div className="empty-state-title" style={{ fontSize: '1.1rem' }}>No Shipments Found</div>
                      <div className="empty-state-desc" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>Adjust your filters or create a new shipment.</div>
                      <button className="btn btn-primary" onClick={() => setIsNewShipmentOpen(true)}>New Shipment</button>
                    </div>
                  ) : (
                    <table className="table responsive-table">
                      <thead className="desktop-only-thead">
                        <tr>
                          <th>Shipment ID</th>
                          <th>Route</th>
                          <th>Cargo</th>
                          <th>Created</th>
                          <th>ETA</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredShipments.map(s => (
                          <tr key={s.id} className="animate-stagger-1 responsive-card-row">
                            <td data-label="Shipment ID" style={{ fontWeight: 600 }}>{s.shipmentNumber}</td>
                            <td data-label="Route">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span>{s.originPort}</span>
                                <ArrowRight size={14} color="var(--color-text-muted)" />
                                <span>{s.destinationPort}</span>
                              </div>
                            </td>
                            <td data-label="Cargo">{s.cargoType} · {s.weight}kg</td>
                            <td data-label="Created">{new Date(s.createdAt).toLocaleDateString()}</td>
                            <td data-label="ETA">{s.estimatedArrival ? new Date(s.estimatedArrival).toLocaleDateString() : 'TBD'}</td>
                            <td data-label="Status"><span className={`badge ${getStatusBadgeClass(s.status)}`}>{getStatusLabel(s.status)}</span></td>
                            <td data-label="Action"><button className="btn btn-secondary w-full" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => setSelectedShipment(s)}>View Details →</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
            </div>
          )}
          
          {activeTab === 'Track Shipment' && (
            <div className="animate-fade-up">
              {!selectedShipment || selectedShipment.status === 'PENDING_REVIEW' ? (
                <div className="grid grid-cols-2 gap-8 items-center" style={{ minHeight: '60vh' }}>
                  <div>
                    <h3 style={{ marginBottom: '1rem', fontSize: '2rem' }}>Track Shipment</h3>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '2.5rem', fontSize: '1.05rem', maxWidth: '400px' }}>
                      Enter your Navora shipment reference to follow your cargo journey from origin to destination.
                    </p>
                    <div className="input-group" style={{ maxWidth: '400px', marginBottom: '1.5rem' }}>
                      <input 
                        type="text" 
                        value={trackSearch} 
                        onChange={e => setTrackSearch(e.target.value)} 
                        className="input-field" 
                        placeholder="Shipment ID (e.g., SEA-2026-00021)" 
                        style={{ padding: '1rem', fontSize: '1.1rem' }}
                        onKeyDown={e => e.key === 'Enter' && handleTrack()} 
                      />
                    </div>
                    <button className="btn btn-primary btn-lg" style={{ maxWidth: '400px', width: '100%' }} onClick={handleTrack}>Track Shipment</button>
                  </div>
                  <div className="hide-on-mobile text-center">
                     <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', padding: '2rem 3rem', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}>
                       <div className="text-right">
                         <div style={{ fontWeight: 800 }}>Alexandria</div>
                         <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>● Origin</div>
                       </div>
                       <div style={{ position: 'relative', width: '120px' }}>
                         <div style={{ width: '100%', height: '2px', borderTop: '2px dashed var(--color-secondary)', opacity: 0.5 }}></div>
                         <Ship size={24} color="var(--color-secondary)" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'var(--color-surface)', padding: '0 4px', animation: 'floatVertical 3s ease-in-out infinite' }} />
                       </div>
                       <div className="text-left">
                         <div style={{ fontWeight: 800 }}>Genoa</div>
                         <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>○ Destination</div>
                       </div>
                     </div>
                  </div>
                </div>
              ) : (
                <div className="card shadow-lg" style={{ padding: '0', overflow: 'hidden' }}>
                  <div style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', opacity: 0.8, letterSpacing: '0.05em', marginBottom: '0.25rem' }}>SHIPMENT ID</div>
                      <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>{selectedShipment.shipmentNumber}</div>
                      <span className={`badge ${getStatusBadgeClass(selectedShipment.status)}`} style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' }}>{getStatusLabel(selectedShipment.status)}</span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '3rem', alignItems: 'center' }}>
                      <div className="text-right">
                        <div style={{ fontSize: '0.85rem', opacity: 0.8, letterSpacing: '0.05em', marginBottom: '0.25rem' }}>FROM</div>
                        <div style={{ fontWeight: 700, fontSize: '1.25rem' }}>{selectedShipment.originPort}</div>
                        <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>{selectedShipment.originCountry}</div>
                      </div>
                      <div style={{ width: '150px', position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: '100%', height: '2px', borderTop: '2px dashed rgba(255,255,255,0.4)' }}></div>
                        <Ship size={24} color="white" style={{ position: 'absolute', left: '50%', transform: 'translate(-50%, 0)', padding: '0 4px' }} />
                        <ArrowRight size={16} color="white" style={{ position: 'absolute', right: '-8px' }} />
                      </div>
                      <div className="text-left">
                        <div style={{ fontSize: '0.85rem', opacity: 0.8, letterSpacing: '0.05em', marginBottom: '0.25rem' }}>TO</div>
                        <div style={{ fontWeight: 700, fontSize: '1.25rem' }}>{selectedShipment.destinationPort}</div>
                        <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>{selectedShipment.destinationCountry}</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-6" style={{ padding: '2rem', borderBottom: '1px solid var(--color-border)' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Estimated Arrival</div>
                      <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{selectedShipment.estimatedArrival ? new Date(selectedShipment.estimatedArrival).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Vessel</div>
                      <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{selectedShipment.vessel || 'TBD'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Container</div>
                      <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{selectedShipment.containerNumber || 'TBD'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Cargo</div>
                      <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{selectedShipment.cargoType} · {selectedShipment.weight}kg</div>
                    </div>
                  </div>

                  <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
                    {renderTimeline(selectedShipment)}
                  </div>
                  
                  <div style={{ padding: '1.5rem', backgroundColor: 'var(--color-background)', borderTop: '1px solid var(--color-border)', textAlign: 'right' }}>
                     <button className="btn btn-outline" onClick={() => { setSelectedShipment(null); setTrackSearch(''); }}>Track Another Shipment</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* New Sub-pages */}
          {activeTab === 'Invoices' && (
            <Invoices user={user} notifications={notifications} unreadNotifications={unreadNotifications} />
          )}
          {activeTab === 'Support' && (
            <Support user={user} notifications={notifications} unreadNotifications={unreadNotifications} />
          )}
          {activeTab === 'Settings' && (
            <Settings user={user} notifications={notifications} unreadNotifications={unreadNotifications} />
          )}
        </div>
      </main>

      {/* New Shipment Modal / Drawer */}
      {isNewShipmentOpen && (
        <div className="modal-overlay" style={{ zIndex: 1000, overflowY: 'auto' }}>
          <div className="modal-content new-shipment-modal" style={{ maxWidth: '700px', margin: '2rem auto', maxHeight: 'none' }}>
            <div className="modal-header sticky top-0" style={{ backgroundColor: 'var(--color-surface)', zIndex: 10, borderBottom: '1px solid var(--color-border)' }}>
              <h3>New Shipping Request</h3>
              <button onClick={closeNewShipment}><X size={24} color="var(--color-text-muted)"/></button>
            </div>
            <div className="modal-body">
              {/* Progress */}
              {newShipmentStep < 5 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '15px', left: 0, right: 0, height: '2px', backgroundColor: 'var(--color-border)', zIndex: 0 }}>
                    <div style={{ height: '100%', backgroundColor: 'var(--color-secondary)', width: `${((newShipmentStep - 1) / 3) * 100}%`, transition: 'width 0.3s ease' }}></div>
                  </div>
                  {['Route', 'Cargo', 'Contact', 'Review'].map((step, i) => (
                    <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, gap: '0.5rem' }}>
                      <div style={{ 
                        width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backgroundColor: newShipmentStep > i+1 ? 'var(--color-secondary)' : (newShipmentStep === i+1 ? 'var(--color-surface)' : 'var(--color-surface)'),
                        color: newShipmentStep > i+1 ? 'white' : (newShipmentStep === i+1 ? 'var(--color-secondary)' : 'var(--color-text-muted)'),
                        border: `2px solid ${newShipmentStep >= i+1 ? 'var(--color-secondary)' : 'var(--color-border)'}`,
                        fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.3s ease'
                      }}>
                        {newShipmentStep > i+1 ? <CheckCircle size={16} /> : (i + 1)}
                      </div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: newShipmentStep >= i+1 ? 'var(--color-text-main)' : 'var(--color-text-muted)' }}>{step}</span>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleNewShipmentSubmit}>
                {newShipmentStep === 1 && (
                  <div className="animate-fade-right">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="input-group">
                        <label className="input-label">Origin Country</label>
                        <select className={`input-field ${formErrors.originCountry ? 'input-error' : ''}`} name="originCountry" value={formData.originCountry} onChange={handleInputChange}>
                          <option value="" disabled>Select</option>
                          {Object.keys(PORTS).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        {formErrors.originCountry && <div className="error-text"><AlertTriangle size={12}/> {formErrors.originCountry}</div>}
                      </div>
                      <div className="input-group">
                        <label className="input-label">Origin Port</label>
                        <select className={`input-field ${formErrors.originPort ? 'input-error' : ''}`} name="originPort" value={formData.originPort} onChange={handleInputChange} disabled={!formData.originCountry}>
                          <option value="" disabled>Select</option>
                          {formData.originCountry && PORTS[formData.originCountry].map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        {formErrors.originPort && <div className="error-text"><AlertTriangle size={12}/> {formErrors.originPort}</div>}
                      </div>
                      <div className="input-group">
                        <label className="input-label">Destination Country</label>
                        <select className={`input-field ${formErrors.destinationCountry ? 'input-error' : ''}`} name="destinationCountry" value={formData.destinationCountry} onChange={handleInputChange}>
                          <option value="" disabled>Select</option>
                          {Object.keys(PORTS).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        {formErrors.destinationCountry && <div className="error-text"><AlertTriangle size={12}/> {formErrors.destinationCountry}</div>}
                      </div>
                      <div className="input-group">
                        <label className="input-label">Destination Port</label>
                        <select className={`input-field ${formErrors.destinationPort ? 'input-error' : ''}`} name="destinationPort" value={formData.destinationPort} onChange={handleInputChange} disabled={!formData.destinationCountry}>
                          <option value="" disabled>Select</option>
                          {formData.destinationCountry && PORTS[formData.destinationCountry].map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        {formErrors.destinationPort && <div className="error-text"><AlertTriangle size={12}/> {formErrors.destinationPort}</div>}
                      </div>
                    </div>
                    
                    {formData.originPort && formData.destinationPort && (
                      <div className="route-visualization" style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div className="text-center">
                          <div style={{ fontWeight: 700 }}>{formData.originPort}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{formData.originCountry}</div>
                        </div>
                        <div style={{ flex: 1, padding: '0 2rem', position: 'relative' }}>
                          <div style={{ borderBottom: '2px dashed var(--color-border)' }}></div>
                          <Ship size={20} color="var(--color-secondary)" style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--color-background)', padding: '0 4px', animation: 'fadeRight 3s infinite linear' }} />
                        </div>
                        <div className="text-center">
                          <div style={{ fontWeight: 700 }}>{formData.destinationPort}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{formData.destinationCountry}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {newShipmentStep === 2 && (
                  <div className="animate-fade-right">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="input-group">
                        <label className="input-label">Cargo Type</label>
                        <select className={`input-field ${formErrors.cargoType ? 'input-error' : ''}`} name="cargoType" value={formData.cargoType} onChange={handleInputChange}>
                          <option value="" disabled>Select</option>
                          <option>Electronics</option><option>Textiles</option><option>Machinery</option><option>Automotive Parts</option><option>Other</option>
                        </select>
                        {formErrors.cargoType && <div className="error-text"><AlertTriangle size={12}/> {formErrors.cargoType}</div>}
                      </div>
                      <div className="input-group">
                        <label className="input-label">Container Requirement</label>
                        <select className={`input-field ${formErrors.containerType ? 'input-error' : ''}`} name="containerType" value={formData.containerType} onChange={handleInputChange}>
                          <option value="" disabled>Select</option>
                          <option>20ft Standard</option><option>40ft Standard</option><option>40ft High Cube</option><option>LCL / Shared Container</option>
                        </select>
                        {formErrors.containerType && <div className="error-text"><AlertTriangle size={12}/> {formErrors.containerType}</div>}
                      </div>
                      <div className="floating-group">
                        <input type="number" min="1" className={`floating-input ${formErrors.weight ? 'input-error' : ''}`} name="weight" value={formData.weight} onChange={handleInputChange} placeholder=" " />
                        <label className="floating-label">Weight (kg)</label>
                        {formErrors.weight && <div className="error-text"><AlertTriangle size={12}/> {formErrors.weight}</div>}
                      </div>
                      <div className="floating-group">
                        <input type="number" min="1" className={`floating-input ${formErrors.quantity ? 'input-error' : ''}`} name="quantity" value={formData.quantity} onChange={handleInputChange} placeholder=" " />
                        <label className="floating-label">Quantity</label>
                        {formErrors.quantity && <div className="error-text"><AlertTriangle size={12}/> {formErrors.quantity}</div>}
                      </div>
                      <div className="floating-group" style={{ gridColumn: 'span 2' }}>
                        <textarea className="floating-input" rows="2" name="description" value={formData.description} onChange={handleInputChange} placeholder=" "></textarea>
                        <label className="floating-label">Cargo Description (Optional)</label>
                      </div>
                    </div>
                  </div>
                )}

                {newShipmentStep === 3 && (
                  <div className="animate-fade-right">
                    <div className="input-group">
                      <label className="input-label">Service Type</label>
                      <select className="input-field" name="serviceType" value={formData.serviceType} onChange={handleInputChange}>
                        <option>Port-to-Port</option>
                        <option>Door-to-Door</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                      <div style={{ gridColumn: 'span 2', fontWeight: 600, paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)', marginBottom: '0.5rem' }}>Sender Information</div>
                      <div className="floating-group">
                        <input type="text" className={`floating-input ${formErrors.senderName ? 'input-error' : ''}`} name="senderName" value={formData.senderName} onChange={handleInputChange} placeholder=" " />
                        <label className="floating-label">Name</label>
                        {formErrors.senderName && <div className="error-text"><AlertTriangle size={12}/> {formErrors.senderName}</div>}
                      </div>
                      <div className="floating-group">
                        <input type="text" className="floating-input" name="senderPhone" value={formData.senderPhone} onChange={handleInputChange} placeholder=" " />
                        <label className="floating-label">Phone</label>
                      </div>
                      
                      <div style={{ gridColumn: 'span 2', fontWeight: 600, paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)', marginBottom: '0.5rem', marginTop: '1rem' }}>Receiver Information</div>
                      <div className="floating-group">
                        <input type="text" className={`floating-input ${formErrors.receiverName ? 'input-error' : ''}`} name="receiverName" value={formData.receiverName} onChange={handleInputChange} placeholder=" " />
                        <label className="floating-label">Name</label>
                        {formErrors.receiverName && <div className="error-text"><AlertTriangle size={12}/> {formErrors.receiverName}</div>}
                      </div>
                      <div className="floating-group">
                        <input type="text" className="floating-input" name="receiverPhone" value={formData.receiverPhone} onChange={handleInputChange} placeholder=" " />
                        <label className="floating-label">Phone</label>
                      </div>
                      <div className="floating-group" style={{ gridColumn: 'span 2' }}>
                        <textarea className="floating-input" rows="2" name="receiverAddress" value={formData.receiverAddress} onChange={handleInputChange} placeholder=" "></textarea>
                        <label className="floating-label">Destination Address</label>
                      </div>
                    </div>
                  </div>
                )}

                {newShipmentStep === 4 && (
                  <div className="animate-fade-right">
                    <div style={{ backgroundColor: 'var(--color-background)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div className="text-center">
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>From</div>
                          <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>{formData.originPort}</div>
                          <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{formData.originCountry}</div>
                        </div>
                        <div style={{ flex: 1, padding: '0 2rem', position: 'relative', textAlign: 'center' }}>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-secondary)', fontWeight: 600, marginBottom: '0.25rem' }}>SEA FREIGHT</div>
                          <div style={{ borderBottom: '2px dashed var(--color-secondary)' }}></div>
                          <Ship size={20} color="var(--color-secondary)" style={{ position: 'absolute', top: '15px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--color-background)', padding: '0 4px' }} />
                        </div>
                        <div className="text-center">
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>To</div>
                          <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>{formData.destinationPort}</div>
                          <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{formData.destinationCountry}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
                        <div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Cargo</div>
                          <div style={{ fontWeight: 600 }}>{formData.cargoType}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Weight</div>
                          <div style={{ fontWeight: 600 }}>{formData.weight} kg</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Container</div>
                          <div style={{ fontWeight: 600 }}>{formData.containerType}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Service</div>
                          <div style={{ fontWeight: 600 }}>{formData.serviceType}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Sender</div>
                          <div style={{ fontWeight: 600 }}>{formData.senderName}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Receiver</div>
                          <div style={{ fontWeight: 600 }}>{formData.receiverName}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {newShipmentStep === 5 && (
                  <div className="animate-fade-up text-center" style={{ padding: '2rem' }}>
                    <div style={{ 
                      width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', animation: 'scaleIn 0.5s ease-out'
                    }}>
                      <Check size={32} />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Shipping Request Submitted</h3>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Navora has received your request and will review it shortly.</p>
                    
                    <div style={{ backgroundColor: 'var(--color-background)', padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'inline-block', marginBottom: '2rem', textAlign: 'left' }}>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Shipment Reference</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '1px' }}>{createdShipmentRef?.shipmentNumber}</div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                      <button type="button" className="btn btn-secondary" onClick={() => {
                        const s = shipments.find(sh => sh.id === createdShipmentRef.id);
                        closeNewShipment();
                        if(s) setSelectedShipment(s);
                      }}>View Shipment</button>
                      <button type="button" className="btn btn-primary" onClick={closeNewShipment}>Done</button>
                    </div>
                  </div>
                )}
                
                {newShipmentStep < 5 && (
                  <div className="modal-footer" style={{ marginTop: '2rem', padding: '1.5rem 0 0 0', position: 'sticky', bottom: 0, backgroundColor: 'var(--color-surface)' }}>
                    {newShipmentStep > 1 ? (
                      <button type="button" className="btn btn-secondary" onClick={() => setNewShipmentStep(s => s - 1)}>Back</button>
                    ) : <div></div>}
                    {newShipmentStep < 4 ? (
                      <button type="button" className="btn btn-primary" onClick={nextStep}>Continue</button>
                    ) : (
                      <button type="submit" className="btn btn-primary">Submit Shipping Request</button>
                    )}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Shipment Details Drawer */}
      {selectedShipment && (
        <>
          <div className="drawer-overlay" onClick={() => setSelectedShipment(null)}></div>
          <div className="drawer open" style={{ maxWidth: '600px', width: '100%' }}>
            <div className="drawer-header">
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{selectedShipment.shipmentNumber}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                  <span>{selectedShipment.originPort}, {selectedShipment.originCountry}</span>
                  <ArrowRight size={14} />
                  <span>{selectedShipment.destinationPort}, {selectedShipment.destinationCountry}</span>
                </div>
              </div>
              <button onClick={() => setSelectedShipment(null)}><X size={24} color="var(--color-text-muted)"/></button>
            </div>
            <div className="drawer-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <span className={`badge ${getStatusBadgeClass(selectedShipment.status)}`} style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                  {getStatusLabel(selectedShipment.status)}
                </span>
                {selectedShipment.estimatedArrival && (
                  <div className="text-right">
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Est. Arrival</div>
                    <div style={{ fontWeight: 700 }}>{selectedShipment.estimatedArrival}</div>
                  </div>
                )}
              </div>

              {/* Sections */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* Route Header Style requested by User */}
                <div style={{ backgroundColor: 'var(--color-background)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '1rem', letterSpacing: '0.5px' }}>ROUTE</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{selectedShipment.originPort}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{selectedShipment.originCountry}</div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <ArrowRight size={14} /> SEA FREIGHT <ArrowRight size={14} />
                    </div>
                    <div className="text-right">
                      <div style={{ fontWeight: 600 }}>{selectedShipment.destinationPort}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{selectedShipment.destinationCountry}</div>
                    </div>
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--color-background)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '1rem', letterSpacing: '0.5px' }}>CARGO</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Cargo Type</div>
                      <div style={{ fontWeight: 600 }}>{selectedShipment.cargoType}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Description</div>
                      <div style={{ fontWeight: 600 }}>{selectedShipment.description || 'N/A'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Quantity</div>
                      <div style={{ fontWeight: 600 }}>{selectedShipment.quantity}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Weight</div>
                      <div style={{ fontWeight: 600 }}>{selectedShipment.weight} kg</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Container Type</div>
                      <div style={{ fontWeight: 600 }}>{selectedShipment.containerType}</div>
                    </div>
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--color-background)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '1rem', letterSpacing: '0.5px' }}>SHIPPING INFORMATION</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Estimated Price</div>
                      <div style={{ fontWeight: 600 }}>{selectedShipment.estimatedPrice ? `${selectedShipment.currency || 'USD'} ${selectedShipment.estimatedPrice}` : 'TBD'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Vessel</div>
                      <div style={{ fontWeight: 600 }}>{selectedShipment.vessel || 'TBD'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Container Number</div>
                      <div style={{ fontWeight: 600 }}>{selectedShipment.containerNumber || 'TBD'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Departure Date</div>
                      <div style={{ fontWeight: 600 }}>{selectedShipment.departureDate || 'TBD'}</div>
                    </div>
                  </div>
                </div>
                
                <div style={{ backgroundColor: 'var(--color-background)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '1rem', letterSpacing: '0.5px' }}>CONTACT</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Sender</div>
                      <div style={{ fontWeight: 600 }}>{selectedShipment.senderName}</div>
                      <div style={{ fontSize: '0.85rem' }}>{selectedShipment.senderPhone}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Receiver</div>
                      <div style={{ fontWeight: 600 }}>{selectedShipment.receiverName}</div>
                      <div style={{ fontSize: '0.85rem' }}>{selectedShipment.receiverPhone}</div>
                    </div>
                  </div>
                </div>

                {selectedShipment.companyNotes && (
                  <div style={{ backgroundColor: 'var(--color-background)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '1rem', letterSpacing: '0.5px' }}>COMPANY INFORMATION</div>
                    <div style={{ fontSize: '0.9rem' }}>{selectedShipment.companyNotes}</div>
                  </div>
                )}
                
                {selectedShipment.rejectionReason && (
                  <div style={{ backgroundColor: 'var(--color-error-bg)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-error)' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-error)', fontWeight: 600, marginBottom: '0.5rem', letterSpacing: '0.5px' }}>REJECTION REASON</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--color-error)' }}>{selectedShipment.rejectionReason}</div>
                  </div>
                )}

                <div>
                  <h4 style={{ marginBottom: '1.5rem', fontSize: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)' }}>Shipment Timeline</h4>
                  {renderTimeline(selectedShipment)}
                </div>
              </div>
            </div>
            <div className="drawer-footer">
              <button className="btn btn-secondary w-full" onClick={() => setSelectedShipment(null)}>Close</button>
            </div>
          </div>
        </>
      )}

      {/* Global overrides needed for this specific page structure */}
      <style>{`
        .input-error { border-color: var(--color-error) !important; background-color: var(--color-error-bg) !important; }
        .error-text { display: flex; alignItems: center; gap: 0.25rem; color: var(--color-error); font-size: 0.75rem; margin-top: 0.25rem; font-weight: 500; }
        
        .responsive-table-container { overflow-x: auto; }
        @media (max-width: 768px) {
          .mobile-only { display: block !important; background: none; border: none; font-size: 1.5rem; color: var(--color-text-main); cursor: pointer; }
          .hide-on-mobile { display: none !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          
          /* Card-style tables for mobile */
          .responsive-table, .responsive-table tbody, .responsive-table tr, .responsive-table td { display: block; width: 100%; }
          .desktop-only-thead { display: none; }
          .responsive-card-row { border: 1px solid var(--color-border); border-radius: var(--radius-md); margin-bottom: 1rem; padding: 1rem; box-shadow: var(--shadow-sm); }
          .responsive-card-row td { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid var(--color-border-light); text-align: right; }
          .responsive-card-row td:last-child { border-bottom: none; }
          .responsive-card-row td::before { content: attr(data-label); font-weight: 600; color: var(--color-text-muted); font-size: 0.85rem; text-align: left; }
          .responsive-card-row td[data-label="Action"] { justify-content: center; padding-top: 1rem; }
          .responsive-card-row td[data-label="Action"]::before { display: none; }
        }
      `}</style>
    </div>
  );
}
