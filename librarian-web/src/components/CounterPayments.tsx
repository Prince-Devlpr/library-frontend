import React, { useState, useEffect } from 'react';
import { api } from '../api';
import type { Loan, PaymentReceipt } from '../types';
import { DollarSign, Receipt, CheckCircle, Printer } from 'lucide-react';

export const CounterPayments: React.FC = () => {
  const [fines, setFines] = useState<Loan[]>([]);
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);
  const [cashNotes] = useState('Paid in cash at circulation counter');

  const loadFines = async () => {
    const data = await api.getFines();
    setFines(data);
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <DollarSign size={20} color="var(--accent-success)" />
          Counter Fine Collection Desk
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '20px' }}>
          Collect cash fine payments for overdue or damaged books and immediately issue an audited digital receipt.
        </p>

        {fines.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <CheckCircle size={40} color="#10b981" style={{ margin: '0 auto 12px' }} />
            <h4>No Outstanding Library Fines</h4>
            <p style={{ fontSize: '0.875rem' }}>All patron loan obligations are completely settled.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px' }}>Patron</th>
                  <th style={{ padding: '12px' }}>Book Title</th>
                  <th style={{ padding: '12px' }}>Barcode</th>
                  <th style={{ padding: '12px' }}>Due Date</th>
                  <th style={{ padding: '12px' }}>Fine Amount</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {fines.map((loan) => (
                  <tr key={loan.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '14px 12px' }}>
                      <div style={{ fontWeight: 600 }}>{loan.user?.name || 'Patron'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{loan.user?.registrationNumber}</div>
                    </td>
                    <td style={{ padding: '14px 12px' }}>{loan.copy.book?.title}</td>
                    <td style={{ padding: '14px 12px', fontFamily: 'var(--font-mono)' }}>{loan.copy.barcode}</td>
                    <td style={{ padding: '14px 12px' }}>{new Date(loan.dueDate).toLocaleDateString()}</td>
                    <td style={{ padding: '14px 12px', fontWeight: 700, color: 'var(--accent-danger)' }}>
                      ₹{Number(loan.fine?.amount || 0).toFixed(2)}
                      {loan.fine?.reason && (
                        <div style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {loan.fine.reason}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      <span className={`badge ${loan.fine?.paymentStatus === 'PAID' ? 'badge-paid' : 'badge-unpaid'}`}>
                        {loan.fine?.paymentStatus}
                      </span>
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      {loan.fine?.paymentStatus === 'UNPAID' ? (
                        <button
                          id={`btn-collect-fine-${loan.id}`}
                          onClick={() => handleSettleCash(loan.fine!.id)}
                          className="btn btn-primary"
                          style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                        >
                          Collect Cash (₹{Number(loan.fine?.amount || 0).toFixed(2)})
                        </button>
                      ) : (
                        <span style={{ color: '#059669', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                          <CheckCircle size={14} /> Settled
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RECEIPT MODAL */}
      {receipt && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '28px', maxWidth: '480px' }}>
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Receipt size={20} color="var(--accent-success)" />
              Payment Receipt
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
              }}
            >
              <div style={{ textAlign: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '12px' }}>
                <div style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Central Library Official Receipt</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Receipt #: {receipt.receiptNumber}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>{new Date(receipt.date).toLocaleString()}</div>
              </div>

              <div style={{ fontSize: '13px', lineHeight: 1.8 }}>
                <div><strong>Patron:</strong> {receipt.patron.name} ({receipt.patron.registrationNumber})</div>
                <div><strong>Book:</strong> {receipt.book.title}</div>
                <div><strong>Barcode:</strong> {receipt.book.barcode}</div>
                <div><strong>Payment Method:</strong> Counter Cash</div>
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '2px solid #0f172a', display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 800 }}>
                  <span>Total Amount Paid:</span>
                  <span>₹{receipt.amountRupees}</span>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '11px', color: '#10b981', fontWeight: 700 }}>
                ✓ PAYMENT VERIFIED & AUDITED
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
              <button onClick={() => setReceipt(null)} className="btn btn-secondary">
                Close
              </button>
              <button onClick={() => window.print()} className="btn btn-primary">
                <Printer size={18} />
                Print Official Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
