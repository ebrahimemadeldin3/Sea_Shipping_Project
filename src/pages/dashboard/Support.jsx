import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../lib/api';
import { Plus, Search, LifeBuoy, X, Send } from 'lucide-react';

export default function Support({ user }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Ticket Form State
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Shipment Inquiry');
  const [message, setMessage] = useState('');

  const loadTickets = useCallback(async () => {
    const data = await api.getTickets(user.id);
    setTickets(data);
    setLoading(false);
  }, [user.id]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isNewTicketOpen) setIsNewTicketOpen(false);
        else if (selectedTicket) setSelectedTicket(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isNewTicketOpen, selectedTicket]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setIsSubmitting(true);

    const newTicket = await api.createTicket({
      customerId: user.id,
      subject: `[${category}] ${subject}`,
      category,
      messages: [
        { sender: user.fullName, text: message, timestamp: new Date().toISOString() }
      ]
    });

    setTickets(prev => [newTicket, ...prev]);
    setIsSubmitting(false);
    setIsNewTicketOpen(false);
    setSubject('');
    setMessage('');
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    await api.replyToTicket(selectedTicket.id, user.fullName, replyText);
    const updatedMessages = [
      ...(selectedTicket.messages || []),
      { sender: user.fullName, text: replyText, timestamp: new Date().toISOString() }
    ];
    setSelectedTicket(prev => ({ ...prev, messages: updatedMessages }));
    setTickets(prev => prev.map(t => t.id === selectedTicket.id ? { ...t, messages: updatedMessages } : t));
    setReplyText('');
  };

  const filteredTickets = tickets.filter(t => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return t.id.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q) || t.status.toLowerCase().includes(q);
  });

  return (
    <div className="animate-fade-up">
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <div className="skeleton" style={{ height: '300px', borderRadius: 'var(--radius-lg)' }}></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Support Tickets</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>Contact Navora customer care and operations dispatch.</p>
            </div>
            <button 
              className="btn btn-primary" 
              onClick={() => setIsNewTicketOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: 'var(--radius-full)' }}
            >
              <Plus size={16} /> New Support Ticket
            </button>
          </div>
          
          <div className="card shadow-sm" style={{ padding: '0' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div className="input-group" style={{ margin: 0, position: 'relative', width: '320px' }}>
                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Search tickets by subject, ID..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '2.75rem', marginBottom: 0 }} 
                />
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                {filteredTickets.length} ticket(s) found
              </div>
            </div>

            {filteredTickets.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                <LifeBuoy size={36} style={{ margin: '0 auto 1rem auto', opacity: 0.4 }} />
                <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem' }}>No Tickets Found</div>
                <div style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>Need assistance with a shipment? Open a new ticket anytime.</div>
                <button className="btn btn-primary" onClick={() => setIsNewTicketOpen(true)}>Create Ticket</button>
              </div>
            ) : (
              <div className="responsive-table-container">
                <table className="table responsive-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead className="desktop-only-thead">
                    <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-background)', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Ticket ID</th>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Subject</th>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Status</th>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Created Date</th>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.map(tkt => (
                      <tr key={tkt.id} style={{ borderBottom: '1px solid var(--color-border)', cursor: 'pointer' }} className="table-row-hover responsive-card-row" onClick={() => setSelectedTicket(tkt)}>
                        <td data-label="Ticket ID" style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>{tkt.id}</td>
                        <td data-label="Subject" style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>{tkt.subject}</td>
                        <td data-label="Status" style={{ padding: '1rem 1.5rem' }}>
                          <span className={`badge ${tkt.status === 'Resolved' ? 'badge-success' : 'badge-warning'}`}>
                            {tkt.status}
                          </span>
                        </td>
                        <td data-label="Created Date" style={{ padding: '1rem 1.5rem' }}>{new Date(tkt.createdAt).toLocaleDateString()}</td>
                        <td data-label="Action" style={{ padding: '1rem 1.5rem' }}>
                          <button 
                            type="button" 
                            className="btn btn-secondary" 
                            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                            onClick={(e) => { e.stopPropagation(); setSelectedTicket(tkt); }}
                          >
                            Open Thread
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Ticket Modal */}
      {isNewTicketOpen && (
        <div className="modal-overlay" style={{ zIndex: 1000 }} onClick={(e) => { if (e.target === e.currentTarget) setIsNewTicketOpen(false); }}>
          <div className="modal-content" style={{ maxWidth: '550px' }}>
            <div className="modal-header">
              <h3>Create Support Ticket</h3>
              <button onClick={() => setIsNewTicketOpen(false)}><X size={24} color="var(--color-text-muted)"/></button>
            </div>
            <form onSubmit={handleCreateTicket}>
              <div className="modal-body">
                <div className="input-group">
                  <label className="input-label">Inquiry Category</label>
                  <select className="input-field" value={category} onChange={e => setCategory(e.target.value)}>
                    <option>Shipment Inquiry</option>
                    <option>Billing & Invoices</option>
                    <option>Port Delay / Weather</option>
                    <option>Customs & Clearance</option>
                    <option>Other Operational Request</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Subject</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Brief description of your issue" 
                    value={subject} 
                    onChange={e => setSubject(e.target.value)} 
                    required 
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Message Details</label>
                  <textarea 
                    className="input-field" 
                    rows={4} 
                    placeholder="Provide container number, route, or specifics..." 
                    value={message} 
                    onChange={e => setMessage(e.target.value)} 
                    required 
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsNewTicketOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Details & Conversation Drawer */}
      {selectedTicket && (
        <>
          <div className="drawer-overlay" onClick={() => setSelectedTicket(null)} style={{ zIndex: 1000 }}></div>
          <div className="drawer open" style={{ maxWidth: '600px', width: '100%', zIndex: 1001, display: 'flex', flexDirection: 'column' }}>
            <div className="drawer-header">
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{selectedTicket.subject}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
                  <span className={`badge ${selectedTicket.status === 'Resolved' ? 'badge-success' : 'badge-warning'}`}>{selectedTicket.status}</span>
                  <span style={{ color: 'var(--color-text-muted)' }}>Ticket ID: {selectedTicket.id}</span>
                </div>
              </div>
              <button onClick={() => setSelectedTicket(null)}><X size={24} color="var(--color-text-muted)"/></button>
            </div>

            <div className="drawer-body" style={{ flex: 1, overflowY: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(selectedTicket.messages && selectedTicket.messages.length > 0) ? (
                  selectedTicket.messages.map((m, idx) => {
                    const isUser = m.sender === user.fullName;
                    return (
                      <div 
                        key={idx} 
                        style={{ 
                          alignSelf: isUser ? 'flex-end' : 'flex-start',
                          maxWidth: '85%',
                          backgroundColor: isUser ? 'var(--color-primary)' : 'var(--color-background)',
                          color: isUser ? 'white' : 'var(--color-text-main)',
                          padding: '1rem',
                          borderRadius: 'var(--radius-lg)',
                          border: isUser ? 'none' : '1px solid var(--color-border)',
                          boxShadow: 'var(--shadow-sm)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem', fontSize: '0.75rem', opacity: isUser ? 0.8 : 0.6 }}>
                          <span style={{ fontWeight: 600 }}>{m.sender}</span>
                          <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div style={{ fontSize: '0.9rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{m.text}</div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No messages yet on this ticket.
                  </div>
                )}
              </div>
            </div>

            <div className="drawer-footer" style={{ borderTop: '1px solid var(--color-border)', padding: '1rem', backgroundColor: 'var(--color-surface)' }}>
              <form onSubmit={handleSendReply} style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Type a response..." 
                  value={replyText} 
                  onChange={e => setReplyText(e.target.value)} 
                  style={{ marginBottom: 0, flex: 1 }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '0 1.25rem' }}>
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

