import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Download, CreditCard, Search, FileText, X, CheckCircle } from 'lucide-react';

export default function Invoices({ user }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paying, setPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const loadInvoices = async () => {
      const data = await api.getInvoices(user.id);
      setInvoices(data);
      setLoading(false);
    };
    loadInvoices();
  }, [user.id]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedInvoice) {
        setSelectedInvoice(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedInvoice]);

  const handlePayInvoice = async (invoiceId) => {
    setPaying(true);
    await new Promise(r => setTimeout(r, 800));
    await api.updateInvoiceStatus(invoiceId, 'PAID');
    setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, status: 'PAID' } : inv));
    if (selectedInvoice && selectedInvoice.id === invoiceId) {
      setSelectedInvoice(prev => ({ ...prev, status: 'PAID' }));
    }
    setPaying(false);
    setPaymentSuccess(true);
    setTimeout(() => setPaymentSuccess(false), 3000);
  };

  const filteredInvoices = invoices.filter(i => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return i.invoiceNumber.toLowerCase().includes(q) ||
           (i.shipmentId && i.shipmentId.toLowerCase().includes(q)) ||
           i.status.toLowerCase().includes(q);
  });

  const totalBilled = invoices.reduce((sum, i) => sum + i.amount, 0);
  const paid = invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.amount, 0);
  const outstanding = invoices.filter(i => ['UNPAID', 'DRAFT'].includes(i.status)).reduce((sum, i) => sum + i.amount, 0);
  const overdue = invoices.filter(i => i.status === 'OVERDUE').reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="animate-fade-up">
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <div className="skeleton" style={{ height: '120px', marginBottom: '1.5rem', borderRadius: 'var(--radius-lg)' }}></div>
          <div className="skeleton" style={{ height: '300px', borderRadius: 'var(--radius-lg)' }}></div>
        </div>
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
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div className="input-group" style={{ margin: 0, position: 'relative', width: '320px' }}>
                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Search invoice number, shipment..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '2.75rem', marginBottom: 0 }} 
                />
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Showing {filteredInvoices.length} of {invoices.length} invoices
              </div>
            </div>

            {filteredInvoices.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                <FileText size={36} style={{ margin: '0 auto 1rem auto', opacity: 0.4 }} />
                <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem' }}>No Invoices Found</div>
                <div style={{ fontSize: '0.85rem' }}>No billing records match your search criteria.</div>
              </div>
            ) : (
              <div className="responsive-table-container">
                <table className="table responsive-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead className="desktop-only-thead">
                    <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-background)', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Invoice Number</th>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Shipment</th>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Issue Date</th>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Due Date</th>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Amount</th>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Status</th>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map(inv => (
                      <tr key={inv.id} style={{ borderBottom: '1px solid var(--color-border)', cursor: 'pointer' }} className="table-row-hover responsive-card-row" onClick={() => setSelectedInvoice(inv)}>
                        <td data-label="Invoice" style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>{inv.invoiceNumber}</td>
                        <td data-label="Shipment" style={{ padding: '1rem 1.5rem', color: 'var(--color-text-muted)' }}>{inv.shipmentId || 'N/A'}</td>
                        <td data-label="Issue Date" style={{ padding: '1rem 1.5rem' }}>{new Date(inv.issueDate).toLocaleDateString()}</td>
                        <td data-label="Due Date" style={{ padding: '1rem 1.5rem' }}>{new Date(inv.dueDate).toLocaleDateString()}</td>
                        <td data-label="Amount" style={{ padding: '1rem 1.5rem', fontWeight: 700 }}>${inv.amount.toLocaleString()}</td>
                        <td data-label="Status" style={{ padding: '1rem 1.5rem' }}>
                          <span className={`badge ${inv.status === 'PAID' ? 'badge-success' : inv.status === 'OVERDUE' ? 'badge-error' : 'badge-warning'}`}>
                            {inv.status}
                          </span>
                        </td>
                        <td data-label="Action" style={{ padding: '1rem 1.5rem' }}>
                          <button 
                            type="button" 
                            className="btn btn-secondary" 
                            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                            onClick={(e) => { e.stopPropagation(); setSelectedInvoice(inv); }}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Invoice Details Drawer */}
      {selectedInvoice && (
        <>
          <div className="drawer-overlay" onClick={() => setSelectedInvoice(null)} style={{ zIndex: 1000 }}></div>
          <div className="drawer open" style={{ maxWidth: '550px', width: '100%', zIndex: 1001 }}>
            <div className="drawer-header">
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{selectedInvoice.invoiceNumber}</h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Invoice Details & Payment Status</div>
              </div>
              <button onClick={() => setSelectedInvoice(null)}><X size={24} color="var(--color-text-muted)"/></button>
            </div>
            
            <div className="drawer-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <span className={`badge ${selectedInvoice.status === 'PAID' ? 'badge-success' : selectedInvoice.status === 'OVERDUE' ? 'badge-error' : 'badge-warning'}`} style={{ fontSize: '1rem', padding: '0.4rem 0.85rem' }}>
                  {selectedInvoice.status}
                </span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>${selectedInvoice.amount.toLocaleString()}</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ backgroundColor: 'var(--color-background)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '1rem' }}>INVOICE SUMMARY</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Customer</div>
                      <div style={{ fontWeight: 600 }}>{user.fullName}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Shipment Reference</div>
                      <div style={{ fontWeight: 600 }}>{selectedInvoice.shipmentId || 'SEA-2026-00021'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Issue Date</div>
                      <div style={{ fontWeight: 600 }}>{new Date(selectedInvoice.issueDate).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Due Date</div>
                      <div style={{ fontWeight: 600 }}>{new Date(selectedInvoice.dueDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--color-background)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '1rem' }}>FEE BREAKDOWN</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Ocean Freight Base Tariff</span>
                      <span style={{ fontWeight: 600 }}>${(selectedInvoice.amount * 0.75).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Port Handling & Terminal Surcharge</span>
                      <span style={{ fontWeight: 600 }}>${(selectedInvoice.amount * 0.15).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Bunker Adjustment Factor (BAF)</span>
                      <span style={{ fontWeight: 600 }}>${(selectedInvoice.amount * 0.10).toFixed(2)}</span>
                    </div>
                    <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1rem' }}>
                      <span>Total Due</span>
                      <span>${selectedInvoice.amount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="drawer-footer" style={{ display: 'flex', gap: '1rem', position: 'sticky', bottom: 0, backgroundColor: 'var(--color-surface)' }}>
              {selectedInvoice.status !== 'PAID' && (
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  onClick={() => handlePayInvoice(selectedInvoice.id)}
                  disabled={paying}
                >
                  <CreditCard size={18} /> {paying ? 'Processing...' : 'Pay Invoice Online'}
                </button>
              )}
              <button 
                className="btn btn-secondary" 
                style={{ flex: selectedInvoice.status === 'PAID' ? 1 : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                onClick={() => { alert(`Downloading invoice ${selectedInvoice.invoiceNumber}...`); }}
              >
                <Download size={18} /> Download PDF
              </button>
            </div>
          </div>
        </>
      )}

      {paymentSuccess && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          backgroundColor: 'var(--color-success)',
          color: 'white',
          padding: '1rem 1.5rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          zIndex: 9999,
          animation: 'fadeInUp 0.3s ease-out'
        }}>
          <CheckCircle size={20} />
          <div>
            <div style={{ fontWeight: 700 }}>Payment Received</div>
            <div style={{ fontSize: '0.85rem' }}>Invoice status updated to PAID.</div>
          </div>
        </div>
      )}
    </div>
  );
}

