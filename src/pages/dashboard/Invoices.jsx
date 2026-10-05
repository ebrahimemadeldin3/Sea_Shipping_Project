import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import DashboardHeader from '../../components/DashboardHeader';
import { Download, CreditCard, Search, FileText } from 'lucide-react';

export default function Invoices({ user, onLogout, onOpenSidebar, notifications, unreadNotifications, toggleNotifications }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInvoices = async () => {
      const data = await api.getInvoices(user.id);
      setInvoices(data);
      setLoading(false);
    };
    loadInvoices();
  }, [user.id]);

  const totalBilled = invoices.reduce((sum, i) => sum + i.amount, 0);
  const paid = invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.amount, 0);
  const outstanding = invoices.filter(i => ['UNPAID', 'DRAFT'].includes(i.status)).reduce((sum, i) => sum + i.amount, 0);
  const overdue = invoices.filter(i => i.status === 'OVERDUE').reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="animate-fade-up">
      {loading ? (
            <div>Loading invoices...</div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-4 gap-6 stats-grid" style={{ marginBottom: '2rem' }}>
                <div className="card shadow-sm">
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Total Billed</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>${totalBilled.toLocaleString()}</div>
                </div>
                <div className="card shadow-sm">
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Paid</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-success)' }}>${paid.toLocaleString()}</div>
                </div>
                <div className="card shadow-sm">
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Outstanding</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-warning)' }}>${outstanding.toLocaleString()}</div>
                </div>
                <div className="card shadow-sm">
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Overdue</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-error)' }}>${overdue.toLocaleString()}</div>
                </div>
              </div>
              
              <div className="card shadow-sm" style={{ padding: '0' }}>
                 <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between' }}>
                    <div className="form-group" style={{ margin: 0, position: 'relative', width: '300px' }}>
                      <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                      <input type="text" className="form-control" placeholder="Search invoices..." style={{ paddingLeft: '2.5rem' }} />
                    </div>
                 </div>
                 <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-background)', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                        <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Invoice Number</th>
                        <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Shipment</th>
                        <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Issue Date</th>
                        <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Due Date</th>
                        <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Amount</th>
                        <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map(inv => (
                        <tr key={inv.id} style={{ borderBottom: '1px solid var(--color-border)', cursor: 'pointer' }} className="table-row-hover">
                          <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>{inv.invoiceNumber}</td>
                          <td style={{ padding: '1rem 1.5rem', color: 'var(--color-text-muted)' }}>{inv.shipmentId}</td>
                          <td style={{ padding: '1rem 1.5rem' }}>{new Date(inv.issueDate).toLocaleDateString()}</td>
                          <td style={{ padding: '1rem 1.5rem' }}>{new Date(inv.dueDate).toLocaleDateString()}</td>
                          <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>${inv.amount.toLocaleString()}</td>
                          <td style={{ padding: '1rem 1.5rem' }}>
                             <span className={`badge ${inv.status === 'PAID' ? 'badge-success' : inv.status === 'OVERDUE' ? 'badge-error' : 'badge-warning'}`}>
                               {inv.status}
                             </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
              </div>
            </>
          )}
    </div>
  );
}
