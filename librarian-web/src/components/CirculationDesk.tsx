import React, { useState } from 'react';
import { api } from '../api';
import type { Loan, User, Reservation } from '../types';
import { BookOpen, UserCheck, QrCode, CheckCircle2, AlertTriangle, Clock, ShieldCheck } from 'lucide-react';

export const CirculationDesk: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'walkin' | 'pickup' | 'return'>('walkin');

  // Walk-in State
  const [memberQuery, setMemberQuery] = useState('');
  const [patron, setPatron] = useState<User | null>(null);
  const [copyBarcode, setCopyBarcode] = useState('');
  const [walkinLoanResult, setWalkinLoanResult] = useState<Loan | null>(null);

  // Reservation Pickup State
  const [reservationQuery, setReservationQuery] = useState('');
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [pickupCopyBarcode, setPickupCopyBarcode] = useState('');
  const [pickupLoanResult, setPickupLoanResult] = useState<Loan | null>(null);

  // Return State
  const [returnBarcode, setReturnBarcode] = useState('');
  const [returnCondition, setReturnCondition] = useState('GOOD');
  const [returnResult, setReturnResult] = useState<{ loan: Loan; isOverdue: boolean; fineAmount: number } | null>(null);

  // Shared status & errors
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Handle Patron Lookup
  const handleLookupMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await api.resolveScan(memberQuery);
      if (res.entityType === 'MEMBER') {
        setPatron(res.data);
        setSuccess(`Patron verified: ${res.data.name} (${res.data.registrationNumber})`);
      } else {
        setError('Scanned code is not a valid member token');
      }
    } catch (err: any) {
      setError(err.message || 'Patron lookup failed');
    }
  };

  // Handle Walk-in Issue Confirmation
  const handleConfirmWalkin = async () => {
    if (!patron || !copyBarcode) {
      setError('Please identify both a patron and a physical copy');
      return;
    }
    setError(null);
    try {
      const loan = await api.issueWalkIn(patron.id, copyBarcode.trim());
      setWalkinLoanResult(loan);
      setSuccess(`Book issued successfully! Due on ${new Date(loan.dueDate).toLocaleDateString()}`);
      setCopyBarcode('');
    } catch (err: any) {
      setError(err.message || 'Failed to issue book');
    }
  };

  // Handle Reservation Lookup
  const handleLookupReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await api.resolveScan(reservationQuery);
      if (res.entityType === 'RESERVATION') {
        setReservation(res.data);
        setSuccess(`Reservation found for "${res.data.copy.book?.title || 'Book'}"`);
      } else {
        setError('Scanned token is not a reservation');
      }
    } catch (err: any) {
      setError(err.message || 'Reservation lookup failed');
    }
  };

  // Handle Reservation Pickup Confirmation
  const handleConfirmPickup = async () => {
    if (!reservation || !pickupCopyBarcode) {
      setError('Scan the physical copy to verify before issuing');
      return;
    }
    setError(null);
    try {
      const code = reservation.pickupCode || reservation.qrToken || reservation.id;
      const loan = await api.fulfillReservation(code, pickupCopyBarcode.trim());
      setPickupLoanResult(loan);
      setSuccess(`Reservation fulfilled and issued to ${reservation.user?.name || 'Patron'}`);
      setReservation(null);
      setPickupCopyBarcode('');
    } catch (err: any) {
      setError(err.message || 'Reservation fulfillment failed');
    }
  };

  // Handle Book Return
  const handleConfirmReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!returnBarcode) return;
    try {
      const res = await api.returnBook(returnBarcode.trim());
      setReturnResult(res);
      setSuccess(`Book return processed. Status: Returned [Condition: ${returnCondition}]`);
      setReturnBarcode('');
    } catch (err: any) {
      setError(err.message || 'Failed to process return');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Subtabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
        <button
          id="tab-walkin"
          onClick={() => { setActiveSubTab('walkin'); setError(null); setSuccess(null); }}
          className={`btn ${activeSubTab === 'walkin' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <UserCheck size={18} />
          Walk-in Borrowing
        </button>
        <button
          id="tab-pickup"
          onClick={() => { setActiveSubTab('pickup'); setError(null); setSuccess(null); }}
          className={`btn ${activeSubTab === 'pickup' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Clock size={18} />
          Online Reservation Pickup (24h)
        </button>
        <button
          id="tab-return"
          onClick={() => { setActiveSubTab('return'); setError(null); setSuccess(null); }}
          className={`btn ${activeSubTab === 'return' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <BookOpen size={18} />
          Book Returns & Condition Inspection
        </button>
      </div>

      {/* Global Alerts */}
      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 'var(--radius-md)', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px', color: '#fca5a5' }}>
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: 'var(--radius-md)', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px', color: '#6ee7b7' }}>
          <CheckCircle2 size={20} />
          <span>{success}</span>
        </div>
      )}

      {/* WALK-IN BORROWING */}
      {activeSubTab === 'walkin' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Step 1: Patron Lookup */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ background: 'var(--accent-primary)', borderRadius: '50%', width: '28px', height: '28px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>1</span>
              Identify Patron
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '16px' }}>
              Scan patron library card QR code or type registration number.
            </p>
            <form onSubmit={handleLookupMember} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input
                id="input-member-query"
                type="text"
                placeholder="Scan Card QR or MEM-2026-..."
                value={memberQuery}
                onChange={(e) => setMemberQuery(e.target.value)}
                className="form-input"
                style={{ flex: 1 }}
              />
              <button id="btn-lookup-member" type="submit" className="btn btn-secondary">
                Verify
              </button>
            </form>

            {/* Quick Demo Fill Buttons */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button type="button" onClick={() => setMemberQuery('MEM-2026-0042')} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                + Fill Prince (MEM-2026-0042)
              </button>
              <button type="button" onClick={() => setMemberQuery('MEM-2026-0089')} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                + Fill Aanya (MEM-2026-0089)
              </button>
            </div>

            {patron && (
              <div style={{ background: '#f8fafc', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 style={{ color: 'var(--text-primary)' }}>{patron.name}</h4>
                  <span className="badge badge-available">{patron.status}</span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  <div><strong>ID:</strong> {patron.registrationNumber}</div>
                  <div><strong>Email:</strong> {patron.email}</div>
                  <div><strong>Borrow Limit:</strong> 3 titles (Eligible)</div>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Book Copy Scan & Confirmation */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ background: 'var(--accent-secondary)', borderRadius: '50%', width: '28px', height: '28px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>2</span>
              Scan Book Copy & Issue
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '16px' }}>
              Scan the physical copy barcode sticker on the book.
            </p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input
                id="input-copy-barcode"
                type="text"
                placeholder="Scan Barcode (e.g. BC-100234)"
                value={copyBarcode}
                onChange={(e) => setCopyBarcode(e.target.value)}
                className="form-input"
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={() => setCopyBarcode('BC-100234')}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '4px 8px' }}
              >
                + Fill Sample Barcode
              </button>
            </div>

            <button
              id="btn-confirm-walkin-issue"
              onClick={handleConfirmWalkin}
              disabled={!patron || !copyBarcode}
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
            >
              <ShieldCheck size={20} />
              Confirm Issue Loan
            </button>

            {walkinLoanResult && (
              <div style={{ marginTop: '20px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                <h4 style={{ color: '#34d399', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={18} /> Loan Confirmed!
                </h4>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <div><strong>Title:</strong> {walkinLoanResult.copy.book?.title}</div>
                  <div><strong>Barcode:</strong> {walkinLoanResult.copy.barcode}</div>
                  <div><strong>Due Date:</strong> {new Date(walkinLoanResult.dueDate).toLocaleDateString()}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ONLINE RESERVATION PICKUP (24H) */}
      {activeSubTab === 'pickup' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={20} color="var(--accent-primary)" />
              Step 1: Scan Reservation QR / Code
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '16px' }}>
              Enter the patron's 6-character Pickup Code or scan the QR from their mobile app.
            </p>
            <form onSubmit={handleLookupReservation} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input
                id="input-reservation-query"
                type="text"
                placeholder="e.g. RES-7492 or scan QR"
                value={reservationQuery}
                onChange={(e) => setReservationQuery(e.target.value)}
                className="form-input"
                style={{ flex: 1 }}
              />
              <button id="btn-lookup-reservation" type="submit" className="btn btn-secondary">
                Search
              </button>
            </form>
            <button
              type="button"
              onClick={() => setReservationQuery('RES-7492')}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '4px 8px', marginBottom: '16px' }}
            >
              + Fill Active Demo Reservation (RES-7492)
            </button>

            {reservation && (
              <div style={{ background: '#f8fafc', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4>{reservation.copy.book?.title}</h4>
                  <span className="badge badge-reserved">{reservation.status}</span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  <div><strong>Reserved For:</strong> {reservation.user?.name} ({reservation.user?.registrationNumber})</div>
                  <div><strong>Allocated Copy Barcode:</strong> <code style={{ color: '#0284c7', background: '#e0f2fe', padding: '2px 6px', borderRadius: '4px' }}>{reservation.copy.barcode}</code></div>
                  <div><strong>Shelf Location:</strong> {reservation.copy.shelfLocation}</div>
                  <div><strong>24h Expiry:</strong> {new Date(reservation.expiryDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(reservation.expiryDate).toLocaleDateString()})</div>
                </div>
              </div>
            )}
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <QrCode size={20} color="var(--accent-secondary)" />
              Step 2: Verify Physical Copy & Confirm Issue
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '16px' }}>
              Scan the physical barcode of the book in your hand to prevent issuing the wrong copy.
            </p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input
                id="input-pickup-copy-barcode"
                type="text"
                placeholder="Scan matching book barcode"
                value={pickupCopyBarcode}
                onChange={(e) => setPickupCopyBarcode(e.target.value)}
                className="form-input"
                style={{ flex: 1 }}
              />
              {reservation && (
                <button
                  type="button"
                  onClick={() => setPickupCopyBarcode(reservation.copy.barcode)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                >
                  + Match {reservation.copy.barcode}
                </button>
              )}
            </div>

            <button
              id="btn-confirm-pickup-issue"
              onClick={handleConfirmPickup}
              disabled={!reservation || !pickupCopyBarcode}
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
            >
              <CheckCircle2 size={20} />
              Confirm Pickup & Issue Book
            </button>

            {pickupLoanResult && (
              <div style={{ marginTop: '20px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                <h4 style={{ color: '#34d399', marginBottom: '8px' }}>✓ Reservation Successfully Fulfilled!</h4>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <div>Patron now has an active loan until <strong>{new Date(pickupLoanResult.dueDate).toLocaleDateString()}</strong>.</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BOOK RETURNS & CONDITION INSPECTION */}
      {activeSubTab === 'return' && (
        <div style={{ maxWidth: '680px', margin: '0 auto', width: '100%' }}>
          <div className="glass-panel" style={{ padding: '28px' }}>
            <h3 style={{ marginBottom: '8px' }}>Scan & Return Book Copy</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '20px' }}>
              The system automatically checks for active loans, calculates overdue fines, and restores the copy to AVAILABLE status.
            </p>

            <form onSubmit={handleConfirmReturn}>
              <div className="form-group">
                <label className="form-label">Book Copy Barcode</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    id="input-return-barcode"
                    type="text"
                    placeholder="Scan Barcode (e.g. BC-100311)"
                    value={returnBarcode}
                    onChange={(e) => setReturnBarcode(e.target.value)}
                    className="form-input"
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={() => setReturnBarcode('BC-100311')}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                  >
                    + Fill Overdue Copy
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Book Condition Inspection</label>
                <select
                  value={returnCondition}
                  onChange={(e) => setReturnCondition(e.target.value)}
                  className="form-input"
                >
                  <option value="GOOD">Good / Pristine Condition</option>
                  <option value="MINOR_WEAR">Acceptable / Minor Page Wear</option>
                  <option value="DAMAGED">Damaged / Requires Repair Charge</option>
                  <option value="LOST">Declared Lost</option>
                </select>
              </div>

              <button
                id="btn-confirm-return"
                type="submit"
                disabled={!returnBarcode}
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: '8px' }}
              >
                Confirm Book Return
              </button>
            </form>

            {returnResult && (
              <div style={{ marginTop: '24px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4>Return Receipt</h4>
                  <span className="badge badge-available">RETURNED</span>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  <div><strong>Book:</strong> {returnResult.loan.copy.book?.title}</div>
                  <div><strong>Barcode:</strong> {returnResult.loan.copy.barcode}</div>
                  <div><strong>Patron:</strong> {returnResult.loan.user?.name}</div>
                  <div><strong>Return Timestamp:</strong> {new Date().toLocaleString()}</div>
                  {returnResult.isOverdue ? (
                    <div style={{ marginTop: '10px', padding: '10px', background: '#fef2f2', borderRadius: 'var(--radius-sm)', border: '1px solid #fecaca', color: '#b91c1c' }}>
                      <strong>⚠️ Overdue Fine Assessed: ₹{returnResult.fineAmount.toFixed(2)}</strong>
                      <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                        Settlement can be made via Counter Cash or Online via Razorpay in Patron App.
                      </div>
                    </div>
                  ) : (
                    <div style={{ marginTop: '10px', color: '#059669', fontWeight: 600 }}>
                      ✓ Returned on time with zero fines.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
