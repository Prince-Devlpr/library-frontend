import React, { useState, useEffect } from 'react';
import { api } from '../api';
import type { Loan, PaymentReceipt } from '../types';
import { DollarSign, Receipt, CheckCircle, Printer, AlertTriangle, Search, RefreshCw, UserCheck } from 'lucide-react';

export const CounterPayments: React.FC = () => {
  const [fines, setFines] = useState<Loan[]>([]);
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);
  const [cashNotes] = useState('Paid in cash at circulation counter');
  const [isLoading, setIsLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNPAID' | 'PAID'>('ALL');

  const loadFines = async () => {
    setIsLoading(true);
    try {
      const data = await api.getFines();
      setFines(data);
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFines();
  }, []);

  const handleSettleCash = async (fineId: string) => {
    try {
      const rec = await api.recordCashPayment(fineId, cashNotes);
      setReceipt(rec);
      loadFines();
    } catch (err: any) {
      alert(err.message || 'Payment processing failed');
    }
  };

  // Filtered fines
  const filteredFines = fines.filter((loan) => {
    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'UNPAID'
          ? loan.fine?.paymentStatus === 'UNPAID'
          : loan.fine?.paymentStatus === 'PAID';

    if (!matchesStatus) return false;

    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      loan.user?.name?.toLowerCase().includes(q) ||
      loan.user?.registrationNumber?.toLowerCase().includes(q) ||
      loan.copy?.barcode?.toLowerCase().includes(q) ||
      loan.copy?.book?.title?.toLowerCase().includes(q)
    );
  });

  // Calculate Metrics
  const totalUnpaidAmount = fines
    .filter((l) => l.fine?.paymentStatus === 'UNPAID')
    .reduce((sum, l) => sum + (Number(l.fine?.amount) || 0), 0);

  const unpaidCount = fines.filter((l) => l.fine?.paymentStatus === 'UNPAID').length;
  const settledCount = fines.filter((l) => l.fine?.paymentStatus === 'PAID').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Counter Fine Collection & Reconciliation</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
            Collect cash fine payments for overdue or damaged books and immediately issue an audited digital receipt.
          </p>
        </div>
        <button
          onClick={loadFines}
          disabled={isLoading}
          className="btn btn-secondary"
          style={{ padding: '8px 14px' }}
        >
          <RefreshCw size={14} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
          Refresh Records
        </button>
      </div>

      {/* KPI Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <div className="glass-panel hover-lift" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.04em' }}>
              OUTSTANDING FINES (UNPAID)
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={18} color="var(--accent-danger)" />
            </div>
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--accent-danger)' }}>
            ₹{totalUnpaidAmount.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {unpaidCount} loans awaiting settlement
          </div>
        </div>

        <div className="glass-panel hover-lift" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.04em' }}>
              SETTLED RECEIPTS
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={18} color="var(--accent-success)" />
            </div>
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: '#059669' }}>
            {settledCount}
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Paid in full & reconciled
          </div>
        </div>

        <div className="glass-panel hover-lift" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.04em' }}>
              DESK CASH HANDLER
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserCheck size={18} color="var(--accent-primary)" />
            </div>
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Active
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#059669', fontWeight: 600, marginTop: '4px' }}>
            Digital Receipts Auto-Generated
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '480px' }}>
          <input
            type="text"
            placeholder="Search by patron name, ID, book barcode, or title..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="form-input"
            style={{ width: '100%', paddingLeft: '38px' }}
          />
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '3px', borderRadius: 'var(--radius-md)' }}>
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`tab-pill ${statusFilter === 'ALL' ? 'active' : ''}`}
            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
          >
            All Fines
          </button>
          <button
            onClick={() => setStatusFilter('UNPAID')}
            className={`tab-pill ${statusFilter === 'UNPAID' ? 'active' : ''}`}
            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
          >
            Unpaid Only ({unpaidCount})
          </button>
          <button
            onClick={() => setStatusFilter('PAID')}
            className={`tab-pill ${statusFilter === 'PAID' ? 'active' : ''}`}
            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
          >
            Settled ({settledCount})
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th>Patron Identity</th>
                <th>Book Title</th>
                <th>Copy Barcode</th>
                <th>Due Date</th>
                <th>Fine Assessed</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Counter Settlement</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    Loading fine records from database...
                  </td>
                </tr>
              ) : filteredFines.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    <CheckCircle size={36} color="#10b981" style={{ margin: '0 auto 8px', display: 'block' }} />
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>No Outstanding Library Fines</div>
                    <div style={{ fontSize: '0.8125rem', marginTop: '2px' }}>All patron loan obligations are completely settled.</div>
                  </td>
                </tr>
              ) : (
                filteredFines.map((loan) => (
                  <tr key={loan.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{loan.user?.name || 'Patron'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{loan.user?.registrationNumber}</div>
                    </td>
                    <td style={{ fontWeight: 500 }}>{loan.copy?.book?.title || 'Library Title'}</td>
                    <td>
                      <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: 'var(--accent-primary)', fontWeight: 600 }}>
                        {loan.copy?.barcode || 'BC-N/A'}
                      </code>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {new Date(loan.dueDate).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ fontWeight: 800, color: loan.fine?.paymentStatus === 'PAID' ? '#059669' : 'var(--accent-danger)', fontSize: '0.9375rem' }}>
                        ₹{Number(loan.fine?.amount || 0).toFixed(2)}
                      </div>
                      {loan.fine?.reason && (
                        <div style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)', marginTop: '2px', maxWidth: '240px' }}>
                          {loan.fine.reason}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${loan.fine?.paymentStatus === 'PAID' ? 'badge-available' : 'badge-overdue'}`}>
                        {loan.fine?.paymentStatus === 'PAID' ? '✓ SETTLED' : 'UNPAID'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {loan.fine?.paymentStatus === 'UNPAID' ? (
                        <button
                          id={`btn-collect-fine-${loan.id}`}
                          onClick={() => handleSettleCash(loan.fine!.id)}
                          className="btn btn-primary"
                          style={{ fontSize: '0.8125rem', padding: '7px 14px', gap: '6px' }}
                        >
                          <DollarSign size={14} />
                          Collect Cash (₹{Number(loan.fine?.amount || 0).toFixed(2)})
                        </button>
                      ) : (
                        <span style={{ color: '#059669', fontSize: '0.8125rem', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                          <CheckCircle size={15} /> Paid in Full
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECEIPT MODAL */}
      {receipt && (
        <div className="modal-overlay" onClick={() => setReceipt(null)}>
          <div className="modal-content" style={{ padding: '28px', maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Receipt size={20} color="var(--accent-success)" />
              Official Cash Receipt
            </h3>

            <div
              className="printable-area"
              style={{
                background: 'white',
                color: '#0f172a',
                padding: '24px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                margin: '16px 0',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              <div style={{ textAlign: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '14px' }}>
                <div style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#0f172a' }}>Central Library Official Receipt</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Receipt #: <strong>{receipt.receiptNumber}</strong></div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '1px' }}>{new Date(receipt.date).toLocaleString()}</div>
              </div>

              <div style={{ fontSize: '13px', lineHeight: 1.8 }}>
                <div><strong>Patron:</strong> {receipt.patron.name} ({receipt.patron.registrationNumber})</div>
                <div><strong>Book:</strong> {receipt.book.title}</div>
                <div><strong>Barcode:</strong> <code>{receipt.book.barcode}</code></div>
                <div><strong>Payment Method:</strong> Counter Cash (Staff Verified)</div>
                <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '2px solid #0f172a', display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 800 }}>
                  <span>Total Amount Paid:</span>
                  <span style={{ color: '#059669' }}>₹{receipt.amountRupees}</span>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '11px', color: '#10b981', fontWeight: 700, background: '#ecfdf5', padding: '6px', borderRadius: '4px' }}>
                ✓ PAYMENT VERIFIED & AUDITED IN DATABASE
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
              <button onClick={() => setReceipt(null)} className="btn btn-secondary">
                Done / Close
              </button>
              <button onClick={() => window.print()} className="btn btn-primary">
                <Printer size={16} />
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
