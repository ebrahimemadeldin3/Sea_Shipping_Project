import React, { useState, useEffect } from 'react';
import { Inbox, Ship, CheckCircle, Navigation, X, ArrowRight, Search, Check, AlertTriangle } from 'lucide-react';
import { getShipments, updateShipmentStatus, generateFullTimeline, STATUS_LIST } from '../lib/shipment-service';
import { createNotification, getUnreadCount, markAllAsRead, getUserNotifications } from '../lib/notification-service';
import DashboardHeader from '../components/DashboardHeader';
import Sidebar from '../components/Sidebar';

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

export default function CompanyDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('Overview');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [shipments, setShipments] = useState([]);
  
  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Keyboard shortcut listener (Escape to dismiss drawers & modals)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isAcceptModalOpen) setIsAcceptModalOpen(false);
        else if (isRejectModalOpen) setIsRejectModalOpen(false);
        else if (isUpdateModalOpen) {
          setIsUpdateModalOpen(false);
          setSelectedRequest(null);
        } else if (selectedRequest) {
          setSelectedRequest(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAcceptModalOpen, isRejectModalOpen, isUpdateModalOpen, selectedRequest]);

  // Load shipments
  useEffect(() => {
    const loadData = () => {
      setShipments(getShipments());
      setUnreadNotifications(getUnreadCount(user.id));
      setNotifications(getUserNotifications(user.id));
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
  const newRequests = shipments.filter(s => s.status === 'PENDING_REVIEW').length;
  const accepted = shipments.filter(s => s.status === 'ACCEPTED').length;
  const inTransit = shipments.filter(s => !['PENDING_REVIEW', 'REJECTED', 'DELIVERED', 'ACCEPTED', 'PREPARING'].includes(s.status)).length;
  const delivered = shipments.filter(s => s.status === 'DELIVERED').length;

  const handleAccept = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const estimatedPrice = formData.get('estimatedPrice');
    const currency = formData.get('currency');
    const vessel = formData.get('vessel');
    const containerNumber = formData.get('containerNumber');
    const departureDate = formData.get('departureDate');
    const estimatedArrival = formData.get('estimatedArrival');
    const companyNotes = formData.get('companyNotes');
    
    updateShipmentStatus(selectedRequest.id, 'ACCEPTED', {
      estimatedPrice: Number(estimatedPrice),
      currency,
      vessel,
      containerNumber,
      departureDate,
      estimatedArrival,
      companyNotes
    }, {
      title: 'Request Accepted',
      note: companyNotes || 'Quote provided and vessel assigned.'
    });

    createNotification(selectedRequest.customerId, {
      type: 'STATUS_UPDATE',
      title: 'Shipment Accepted',
      message: `Your shipment ${selectedRequest.shipmentNumber} has been accepted.`,
      shipmentId: selectedRequest.id
    });

    setShipments(getShipments());
    showToast(`Shipment ${selectedRequest.shipmentNumber} accepted and quote sent.`, 'success');
    setIsAcceptModalOpen(false);
    setSelectedRequest(null);
  };

  const handleReject = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const rejectionReason = formData.get('rejectionReason');

    updateShipmentStatus(selectedRequest.id, 'REJECTED', {
      rejectionReason
    }, {
      title: 'Request Rejected',
      note: rejectionReason
    });

    createNotification(selectedRequest.customerId, {
      type: 'STATUS_UPDATE',
      title: 'Shipment Request Rejected',
      message: `Your shipment request ${selectedRequest.shipmentNumber} was not accepted.`,
      shipmentId: selectedRequest.id
    });

    setShipments(getShipments());
    showToast(`Shipment ${selectedRequest.shipmentNumber} rejected.`, 'error');
    setIsRejectModalOpen(false);
    setSelectedRequest(null);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newStatus = formData.get('newStatus');
    const location = formData.get('location');
    const note = formData.get('note');

    updateShipmentStatus(selectedRequest.id, newStatus, {}, {
      title: getStatusLabel(newStatus),
      location,
      note
    });

    createNotification(selectedRequest.customerId, {
      type: 'STATUS_UPDATE',
      title: 'Shipment Update',
      message: `${selectedRequest.shipmentNumber} is now ${getStatusLabel(newStatus)}.`,
      shipmentId: selectedRequest.id
    });

    setShipments(getShipments());
    showToast(`Shipment ${selectedRequest.shipmentNumber} updated to ${getStatusLabel(newStatus)}.`, 'success');
    setIsUpdateModalOpen(false);
    setSelectedRequest(null);
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    if (!isNotificationsOpen && unreadNotifications > 0) {
      markAllAsRead(user.id);
      setUnreadNotifications(0);
      setNotifications(getUserNotifications(user.id));
    }
  };

  const filterShipments = (shipmentList) => {
    return shipmentList.filter(s => {
      if (statusFilter !== 'All' && s.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return s.shipmentNumber.toLowerCase().includes(q) ||
               s.senderName?.toLowerCase().includes(q) ||
               s.cargoType?.toLowerCase().includes(q) ||
               s.originPort?.toLowerCase().includes(q) ||
               s.destinationPort?.toLowerCase().includes(q);
      }
      return true;
    });
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
        setActiveTab={(tab) => { setActiveTab(tab); setSearchQuery(''); setStatusFilter('All'); }}
        isSidebarOpen={isSidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={onLogout}
        navItems={[
          { id: 'Overview', icon: Navigation, label: 'Overview' },
          { id: 'Requests', icon: Inbox, label: 'Requests', badge: newRequests },
          { id: 'Active Shipments', icon: Ship, label: 'Active Shipments' },
          { id: 'Delivered', icon: CheckCircle, label: 'Delivered' }
        ]}
      />

      {/* Main Content */}
      <main className="main-content">
        <DashboardHeader
          user={user}
          activeTab={activeTab}
          onLogout={onLogout}
          onOpenSidebar={() => setSidebarOpen(true)}
          notifications={notifications}
          unreadNotifications={unreadNotifications}
          isNotificationsOpen={isNotificationsOpen}
          toggleNotifications={toggleNotifications}
          onNotificationClick={(shipmentId) => {
            const ship = shipments.find(s => s.id === shipmentId);
            if(ship) { setSelectedRequest(ship); setIsNotificationsOpen(false); }
          }}
        />

        <div className="dashboard-scroll">
          {activeTab === 'Overview' && (
            <div className="animate-fade-up">
              {/* Stats */}
              <div className="grid grid-cols-4 gap-6 stats-grid" style={{ marginBottom: '2rem' }}>
                <div className={`card animate-stagger-1 ${isLoading ? 'skeleton' : ''}`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <div style={{ padding: '0.5rem', backgroundColor: 'var(--color-error-bg)', color: 'var(--color-error)', borderRadius: 'var(--radius-md)' }}><Inbox size={20} /></div>
                    <div className="text-overline">New Requests</div>
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{newRequests}</div>
                </div>
                <div className={`card animate-stagger-2 ${isLoading ? 'skeleton' : ''}`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <div style={{ padding: '0.5rem', backgroundColor: 'var(--color-info-bg)', color: 'var(--color-secondary)', borderRadius: 'var(--radius-md)' }}><CheckCircle size={20} /></div>
                    <div className="text-overline">Accepted</div>
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{accepted}</div>
                </div>
                <div className={`card animate-stagger-3 ${isLoading ? 'skeleton' : ''}`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <div style={{ padding: '0.5rem', backgroundColor: '#e0f2fe', color: '#0284c7', borderRadius: 'var(--radius-md)' }}><Ship size={20} /></div>
                    <div className="text-overline">In Transit</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{inTransit}</div>
                    {inTransit > 0 && <div style={{ width: '40px', height: '2px', borderTop: '2px dashed #0284c7', marginBottom: '0.5rem', opacity: 0.5 }}></div>}
                  </div>
                </div>
                <div className={`card animate-stagger-4 ${isLoading ? 'skeleton' : ''}`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <div style={{ padding: '0.5rem', backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)', borderRadius: 'var(--radius-md)' }}><CheckCircle size={20} /></div>
                    <div className="text-overline">Delivered</div>
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{delivered}</div>
                </div>
              </div>

              {/* Active Routes */}
              <div className="card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3>Active Routes</h3>
                  <button className="btn btn-outline" onClick={() => setActiveTab('Active Shipments')}>View All</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {shipments.filter(s => !['PENDING_REVIEW', 'REJECTED', 'DELIVERED', 'ACCEPTED', 'PREPARING'].includes(s.status)).slice(0, 3).length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)' }}>No active shipments currently on route.</div>
                  ) : (
                    shipments.filter(s => !['PENDING_REVIEW', 'REJECTED', 'DELIVERED', 'ACCEPTED', 'PREPARING'].includes(s.status)).slice(0, 3).map(s => (
                      <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                          <div style={{ fontWeight: 600 }}>{s.originPort.split(' ')[0]}</div>
                          <div style={{ flex: 1, maxWidth: '100px', position: 'relative' }}>
                            <div style={{ width: '100%', height: '2px', borderTop: '2px dashed var(--color-border)' }}></div>
                            <Ship size={14} color="var(--color-secondary)" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'var(--color-background)', padding: '0 2px' }} />
                          </div>
                          <div style={{ fontWeight: 600 }}>{s.destinationPort.split(' ')[0]}</div>
                        </div>
                        <span className={`badge ${getStatusBadgeClass(s.status)}`} style={{ minWidth: '120px', justifyContent: 'center' }}>{getStatusLabel(s.status)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Action Required */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3>Recent Actionable Items</h3>
                  <button className="btn btn-outline" onClick={() => setActiveTab('Requests')}>View Requests</button>
                </div>
                <div className="table-container">
                  {shipments.filter(s => s.status === 'PENDING_REVIEW' || s.status === 'IN_TRANSIT').length === 0 ? (
                    <div className="empty-state compact">
                      <CheckCircle size={32} className="empty-state-icon" style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' }} />
                      <div className="empty-state-title" style={{ fontSize: '1.1rem' }}>All Caught Up</div>
                      <div className="empty-state-desc">There are no actionable items right now.</div>
                    </div>
                  ) : (
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Request ID</th>
                          <th>Route</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shipments.filter(s => s.status === 'PENDING_REVIEW' || s.status === 'IN_TRANSIT').slice(0, 5).map(s => (
                          <tr key={s.id}>
                            <td style={{ fontWeight: 600 }}>{s.shipmentNumber}</td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span>{s.originPort}</span>
                                <ArrowRight size={14} color="var(--color-text-muted)" />
                                <span>{s.destinationPort}</span>
                              </div>
                            </td>
                            <td><span className={`badge ${getStatusBadgeClass(s.status)}`}>{getStatusLabel(s.status)}</span></td>
                            <td>
                              {s.status === 'PENDING_REVIEW' ? (
                                <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => setSelectedRequest(s)}>Review Request →</button>
                              ) : (
                                <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => { setSelectedRequest(s); setIsUpdateModalOpen(true); }}>Update Status</button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Requests' && (
            <div className="card animate-fade-up">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h3>Shipping Requests</h3>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <div className="input-group" style={{ marginBottom: 0, minWidth: '200px' }}>
                    <div style={{ position: 'relative' }}>
                      <Search size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input type="text" className="input-field" placeholder="Search customer or ID..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ paddingLeft: '2rem' }} />
                    </div>
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
                  ) : filterShipments(shipments.filter(s => s.status === 'PENDING_REVIEW' || s.status === 'REJECTED')).length === 0 ? (
                    <div className="empty-state compact" style={{ padding: '4rem 2rem', border: 'none' }}>
                      <Inbox size={32} className="empty-state-icon" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)' }} />
                      <div className="empty-state-title" style={{ fontSize: '1.1rem' }}>No New Requests</div>
                      <div className="empty-state-desc" style={{ fontSize: '0.85rem' }}>You're all caught up! New customer requests will appear here.</div>
                    </div>
                  ) : (
                    <table className="table responsive-table">
                      <thead className="desktop-only-thead">
                        <tr>
                          <th>Request ID</th>
                          <th>Customer</th>
                          <th>Route</th>
                          <th>Cargo</th>
                          <th>Created</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filterShipments(shipments.filter(s => s.status === 'PENDING_REVIEW' || s.status === 'REJECTED')).map(s => (
                          <tr key={s.id} className="animate-stagger-1 responsive-card-row">
                            <td data-label="Request ID" style={{ fontWeight: 600 }}>{s.shipmentNumber}</td>
                            <td data-label="Customer">{s.senderName}</td>
                            <td data-label="Route">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                <span>{s.originPort}</span>
                                <ArrowRight size={14} color="var(--color-text-muted)" />
                                <span>{s.destinationPort}</span>
                              </div>
                            </td>
                            <td data-label="Cargo">{s.cargoType}</td>
                            <td data-label="Created">{new Date(s.createdAt).toLocaleDateString()}</td>
                            <td data-label="Status"><span className={`badge ${getStatusBadgeClass(s.status)}`}>{getStatusLabel(s.status)}</span></td>
                            <td data-label="Action">
                              <button className="btn btn-secondary w-full" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => setSelectedRequest(s)}>Review Request →</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
            </div>
          )}

          {activeTab === 'Active Shipments' && (
            <div className="card animate-fade-up">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h3>Active Shipments</h3>
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
                      {STATUS_LIST.filter(st => !['PENDING_REVIEW', 'REJECTED', 'DELIVERED'].includes(st)).map(status => (
                        <option key={status} value={status}>{getStatusLabel(status)}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="table-container responsive-table-container">
                  {filterShipments(shipments.filter(s => s.status !== 'PENDING_REVIEW' && s.status !== 'REJECTED' && s.status !== 'DELIVERED')).length === 0 ? (
                    <div className="empty-state compact" style={{ padding: '4rem 2rem', border: 'none' }}>
                      <Ship size={32} className="empty-state-icon" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)' }} />
                      <div className="empty-state-title" style={{ fontSize: '1.1rem' }}>No Active Shipments</div>
                      <div className="empty-state-desc" style={{ fontSize: '0.85rem' }}>Accepted shipments will appear here.</div>
                    </div>
                  ) : (
                    <table className="table responsive-table">
                      <thead className="desktop-only-thead">
                        <tr>
                          <th>Shipment</th>
                          <th>Customer</th>
                          <th>Route</th>
                          <th>Vessel</th>
                          <th>ETA</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filterShipments(shipments.filter(s => s.status !== 'PENDING_REVIEW' && s.status !== 'REJECTED' && s.status !== 'DELIVERED')).map(s => (
                          <tr key={s.id} className="animate-stagger-2 responsive-card-row">
                            <td data-label="Shipment ID" style={{ fontWeight: 600 }}>{s.shipmentNumber}</td>
                            <td data-label="Customer">{s.senderName}</td>
                            <td data-label="Route">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                <span>{s.originPort}</span>
                                <ArrowRight size={14} color="var(--color-text-muted)" />
                                <span>{s.destinationPort}</span>
                              </div>
                            </td>
                            <td data-label="Vessel">{s.vessel || 'TBD'}</td>
                            <td data-label="ETA">{s.estimatedArrival ? new Date(s.estimatedArrival).toLocaleDateString() : 'TBD'}</td>
                            <td data-label="Status"><span className={`badge ${getStatusBadgeClass(s.status)}`}>{getStatusLabel(s.status)}</span></td>
                            <td data-label="Action">
                              <button className="btn btn-primary w-full" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => { setSelectedRequest(s); setIsUpdateModalOpen(true); }}>Update</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
            </div>
          )}
          
          {activeTab === 'Delivered' && (
            <div className="card animate-fade-up">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h3>Delivered Shipments</h3>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <div className="input-group" style={{ marginBottom: 0, minWidth: '200px' }}>
                    <div style={{ position: 'relative' }}>
                      <Search size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input type="text" className="input-field" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ paddingLeft: '2rem' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="table-container responsive-table-container">
                  {filterShipments(shipments.filter(s => s.status === 'DELIVERED')).length === 0 ? (
                    <div className="empty-state compact" style={{ padding: '4rem 2rem', border: 'none' }}>
                      <CheckCircle size={32} className="empty-state-icon" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)' }} />
                      <div className="empty-state-title" style={{ fontSize: '1.1rem' }}>No Completed Shipments Yet</div>
                      <div className="empty-state-desc" style={{ fontSize: '0.85rem' }}>Delivered shipments will appear here.</div>
                    </div>
                  ) : (
                    <table className="table responsive-table">
                      <thead className="desktop-only-thead">
                        <tr>
                          <th>Shipment</th>
                          <th>Customer</th>
                          <th>Route</th>
                          <th>Vessel</th>
                          <th>Container</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filterShipments(shipments.filter(s => s.status === 'DELIVERED')).map(s => (
                          <tr key={s.id} className="animate-stagger-1 responsive-card-row">
                            <td data-label="Shipment ID" style={{ fontWeight: 600 }}>{s.shipmentNumber}</td>
                            <td data-label="Customer">{s.senderName}</td>
                            <td data-label="Route">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                <span>{s.originPort}</span>
                                <ArrowRight size={14} color="var(--color-text-muted)" />
                                <span>{s.destinationPort}</span>
                              </div>
                            </td>
                            <td data-label="Vessel">{s.vessel}</td>
                            <td data-label="Container">{s.containerNumber}</td>
                            <td data-label="Status"><span className={`badge ${getStatusBadgeClass(s.status)}`}>{getStatusLabel(s.status)}</span></td>
                            <td data-label="Action">
                              <button className="btn btn-secondary w-full" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => setSelectedRequest(s)}>View Details →</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
            </div>
          )}

        </div>
      </main>

      {/* Review Request / Details Drawer */}
      {selectedRequest && !isUpdateModalOpen && (
        <>
          <div className="drawer-overlay" onClick={() => setSelectedRequest(null)}></div>
          <div className="drawer open" style={{ maxWidth: '600px', width: '100%' }}>
            <div className="drawer-header">
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{selectedRequest.status === 'PENDING_REVIEW' ? 'Review Request' : 'Shipment Details'} {selectedRequest.shipmentNumber}</h3>
                <span className={`badge ${getStatusBadgeClass(selectedRequest.status)}`}>{getStatusLabel(selectedRequest.status)}</span>
              </div>
              <button onClick={() => setSelectedRequest(null)}><X size={24} color="var(--color-text-muted)"/></button>
            </div>
            <div className="drawer-body">
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ backgroundColor: 'var(--color-background)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '1rem', letterSpacing: '0.5px' }}>CUSTOMER</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Name</div>
                      <div style={{ fontWeight: 600 }}>{selectedRequest.senderName}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Customer ID</div>
                      <div style={{ fontWeight: 600 }}>{selectedRequest.customerId}</div>
                    </div>
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--color-background)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '1rem', letterSpacing: '0.5px' }}>ROUTE</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{selectedRequest.originPort}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{selectedRequest.originCountry}</div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <ArrowRight size={14} /> SEA FREIGHT <ArrowRight size={14} />
                    </div>
                    <div className="text-right">
                      <div style={{ fontWeight: 600 }}>{selectedRequest.destinationPort}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{selectedRequest.destinationCountry}</div>
                    </div>
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--color-background)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '1rem', letterSpacing: '0.5px' }}>CARGO</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Type</div>
                      <div style={{ fontWeight: 600 }}>{selectedRequest.cargoType}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Description</div>
                      <div style={{ fontWeight: 600 }}>{selectedRequest.description || 'N/A'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Quantity</div>
                      <div style={{ fontWeight: 600 }}>{selectedRequest.quantity}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Weight</div>
                      <div style={{ fontWeight: 600 }}>{selectedRequest.weight} kg</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Container Type</div>
                      <div style={{ fontWeight: 600 }}>{selectedRequest.containerType}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Service</div>
                      <div style={{ fontWeight: 600 }}>{selectedRequest.serviceType || 'Port-to-Port'}</div>
                    </div>
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--color-background)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '1rem', letterSpacing: '0.5px' }}>CONTACT</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Sender</div>
                      <div style={{ fontWeight: 600 }}>{selectedRequest.senderName}</div>
                      <div style={{ fontSize: '0.85rem' }}>{selectedRequest.senderPhone}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Receiver</div>
                      <div style={{ fontWeight: 600 }}>{selectedRequest.receiverName}</div>
                      <div style={{ fontSize: '0.85rem' }}>{selectedRequest.receiverPhone}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>{selectedRequest.receiverAddress}</div>
                    </div>
                  </div>
                </div>

                {selectedRequest.status !== 'PENDING_REVIEW' && selectedRequest.status !== 'REJECTED' && (
                  <div style={{ backgroundColor: 'var(--color-background)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '1rem', letterSpacing: '0.5px' }}>COMPANY INFORMATION</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Estimated Price</div>
                        <div style={{ fontWeight: 600 }}>{selectedRequest.estimatedPrice ? `${selectedRequest.currency || 'USD'} ${selectedRequest.estimatedPrice}` : 'TBD'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Vessel</div>
                        <div style={{ fontWeight: 600 }}>{selectedRequest.vessel || 'TBD'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Container Number</div>
                        <div style={{ fontWeight: 600 }}>{selectedRequest.containerNumber || 'TBD'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Departure Date</div>
                        <div style={{ fontWeight: 600 }}>{selectedRequest.departureDate || 'TBD'}</div>
                      </div>
                    </div>
                    {selectedRequest.companyNotes && (
                      <div style={{ marginTop: '1rem' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Notes</div>
                        <div style={{ fontSize: '0.9rem' }}>{selectedRequest.companyNotes}</div>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <h4 style={{ marginBottom: '1.5rem', fontSize: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)' }}>Shipment Timeline</h4>
                  {renderTimeline(selectedRequest)}
                </div>

              </div>

            </div>
            {selectedRequest.status === 'PENDING_REVIEW' && (
              <div className="drawer-footer" style={{ justifyContent: 'space-between', position: 'sticky', bottom: 0, backgroundColor: 'var(--color-surface)' }}>
                <button className="btn btn-outline" style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }} onClick={() => setIsRejectModalOpen(true)}>Reject Request</button>
                <button className="btn btn-primary" onClick={() => setIsAcceptModalOpen(true)}>Accept & Quote</button>
              </div>
            )}
            {selectedRequest.status !== 'PENDING_REVIEW' && (
              <div className="drawer-footer" style={{ position: 'sticky', bottom: 0, backgroundColor: 'var(--color-surface)' }}>
                <button className="btn btn-secondary w-full" onClick={() => setSelectedRequest(null)}>Close</button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Accept Request Dialog */}
      {isAcceptModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 1000 }} onClick={(e) => { if (e.target === e.currentTarget) setIsAcceptModalOpen(false); }}>
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>Accept & Schedule Shipment</h3>
              <button onClick={() => setIsAcceptModalOpen(false)}><X size={24} color="var(--color-text-muted)"/></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div className="text-center">
                  <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>{selectedRequest.originPort}</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{selectedRequest.originCountry}</div>
                </div>
                <div style={{ flex: 1, padding: '0 2rem', position: 'relative' }}>
                  <div style={{ borderBottom: '2px dashed var(--color-secondary)' }}></div>
                  <Ship size={24} color="var(--color-secondary)" style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--color-surface)', padding: '0 2px' }} />
                </div>
                <div className="text-center">
                  <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>{selectedRequest.destinationPort}</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{selectedRequest.destinationCountry}</div>
                </div>
              </div>

              <form id="acceptForm" onSubmit={handleAccept}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="input-group">
                    <label className="input-label">Estimated Price</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <select name="currency" className="input-field" style={{ width: '80px' }} defaultValue="USD">
                        <option>USD</option><option>EUR</option>
                      </select>
                      <input type="number" name="estimatedPrice" className="input-field" required placeholder="2450" />
                    </div>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Assigned Vessel</label>
                    <input type="text" name="vessel" className="input-field" required placeholder="MV Navora Star" />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Container Number (Optional)</label>
                    <input type="text" name="containerNumber" className="input-field" placeholder="NVRU 428591 7" />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Estimated Departure</label>
                    <input type="date" name="departureDate" className="input-field" required />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Estimated Arrival</label>
                    <input type="date" name="estimatedArrival" className="input-field" required />
                  </div>
                  <div className="input-group" style={{ gridColumn: 'span 2' }}>
                    <label className="input-label">Company Notes</label>
                    <textarea name="companyNotes" className="input-field" rows="2" placeholder="Will be visible to customer..."></textarea>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setIsAcceptModalOpen(false)}>Cancel</button>
              <button type="submit" form="acceptForm" className="btn btn-primary">Confirm & Accept</button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Request Dialog */}
      {isRejectModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 1000 }} onClick={(e) => { if (e.target === e.currentTarget) setIsRejectModalOpen(false); }}>
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Reject Request</h3>
              <button onClick={() => setIsRejectModalOpen(false)}><X size={24} color="var(--color-text-muted)"/></button>
            </div>
            <div className="modal-body">
              <form id="rejectForm" onSubmit={handleReject}>
                <div className="input-group">
                  <label className="input-label">Reason for rejection</label>
                  <textarea name="rejectionReason" className="input-field" rows="3" required placeholder="Cargo type currently unsupported for this route."></textarea>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setIsRejectModalOpen(false)}>Cancel</button>
              <button type="submit" form="rejectForm" className="btn btn-danger">Confirm Rejection</button>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Dialog */}
      {isUpdateModalOpen && selectedRequest && (
        <div className="modal-overlay" style={{ zIndex: 1000 }} onClick={(e) => { if (e.target === e.currentTarget) { setIsUpdateModalOpen(false); setSelectedRequest(null); } }}>
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>Update Shipment Status</h3>
              <button onClick={() => { setIsUpdateModalOpen(false); setSelectedRequest(null); }}><X size={24} color="var(--color-text-muted)"/></button>
            </div>
            <div className="modal-body">
              <form id="updateForm" onSubmit={handleUpdate}>
                <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontWeight: 600 }}>{selectedRequest.shipmentNumber}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Current: {getStatusLabel(selectedRequest.status)}</div>
                </div>

                <div className="input-group">
                  <label className="input-label">New Status</label>
                  <select name="newStatus" className="input-field" required defaultValue={selectedRequest.status}>
                    {STATUS_LIST.filter(st => st !== 'PENDING_REVIEW' && st !== 'REJECTED').map(status => (
                      <option key={status} value={status}>{getStatusLabel(status)}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Location (Optional)</label>
                  <input type="text" name="location" className="input-field" placeholder="e.g. Mediterranean Sea" />
                </div>
                <div className="input-group">
                  <label className="input-label">Note (Optional)</label>
                  <textarea name="note" className="input-field" rows="2" placeholder="Shipment departed Alexandria Port successfully."></textarea>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => { setIsUpdateModalOpen(false); setSelectedRequest(null); }}>Cancel</button>
              <button type="submit" form="updateForm" className="btn btn-primary">Update Status</button>
            </div>
          </div>
        </div>
      )}

      {/* Action Toast Feedback */}
      {toastMessage && (
        <div className={`app-toast ${toastMessage.type === 'error' ? 'error' : 'success'}`}>
          {toastMessage.type === 'error' ? <AlertTriangle size={18} color="var(--color-error)" /> : <CheckCircle size={18} color="var(--color-success)" />}
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{toastMessage.message}</span>
        </div>
      )}

      <style>{`
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
