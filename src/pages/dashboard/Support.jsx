import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import DashboardHeader from '../../components/DashboardHeader';
import { Plus, Search, MessageSquare, LifeBuoy } from 'lucide-react';

export default function Support({ user, onLogout, onOpenSidebar, notifications, unreadNotifications, toggleNotifications }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTickets = async () => {
      const data = await api.getTickets(user.id);
      setTickets(data);
      setLoading(false);
    };
    loadTickets();
  }, [user.id]);

  return (
    <div className="animate-fade-up">
      {loading ? (
            <div>Loading tickets...</div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Your Tickets</h3>
                <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: 'var(--radius-full)' }}>
                  <Plus size={16} /> New Ticket
                </button>
              </div>
              
              <div className="card shadow-sm" style={{ padding: '0' }}>
                 <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-background)', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                        <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>ID</th>
                        <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Subject</th>
                        <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Status</th>
                        <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.map(tkt => (
                        <tr key={tkt.id} style={{ borderBottom: '1px solid var(--color-border)', cursor: 'pointer' }} className="table-row-hover">
                          <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>{tkt.id}</td>
                          <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>{tkt.subject}</td>
                          <td style={{ padding: '1rem 1.5rem' }}>
                             <span className={`badge ${tkt.status === 'Resolved' ? 'badge-success' : 'badge-warning'}`}>
                               {tkt.status}
                             </span>
                          </td>
                          <td style={{ padding: '1rem 1.5rem' }}>{new Date(tkt.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
              </div>
            </div>
          )}
    </div>
  );
}
