import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import type { Loan, User, Reservation, PaymentReceipt } from '../types';
import { BookOpen, UserCheck, QrCode, CheckCircle2, AlertTriangle, Clock, ShieldCheck, RefreshCw, ArrowRight, DollarSign, Receipt } from 'lucide-react';

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
  const [reservationsList, setReservationsList] = useState<Reservation[]>([]);
  const [isLoadingReservations, setIsLoadingReservations] = useState(false);

  // Return State
  const [returnBarcode, setReturnBarcode] = useState('');
  const [returnCondition, setReturnCondition] = useState('GOOD');
  const [damageFineAmount, setDamageFineAmount] = useState<string>('150');
  const [damageNotes, setDamageNotes] = useState<string>('');
  const [isProcessingReturn, setIsProcessingReturn] = useState(false);
  const [isCollectingReturnFine, setIsCollectingReturnFine] = useState(false);
  const [collectedFineReceipt, setCollectedFineReceipt] = useState<PaymentReceipt | null>(null);
  const [returnResult, setReturnResult] = useState<{
    loan: any;
    isOverdue: boolean;
    hasFine: boolean;
    fineAmount: number;
    overdueFineAmount: number;
    conditionFineAmount: number;
    condition: string;
    fine: any | null;
  } | null>(null);

  // Shared status & errors
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadReservations = useCallback(async () => {
    setIsLoadingReservations(true);
    try {
      const data = await api.getReservations();
      setReservationsList(data);
    } catch {
      // fallback handled in api
    } finally {
      setIsLoadingReservations(false);
    }
  }, []);

  useEffect(() => {
    if (activeSubTab === 'pickup') {
      loadReservations();
    }
  }, [activeSubTab, loadReservations]);

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
      loadReservations();
    } catch (err: any) {
      setError(err.message || 'Reservation fulfillment failed');
    }
  };

  // Select a reservation from the live list
  const handleSelectReservationForPickup = (r: Reservation) => {
    setReservation(r);
    setReservationQuery(r.pickupCode || r.qrToken || r.id);
    setPickupCopyBarcode(r.copy.barcode);
    setError(null);
    setSuccess(`Selected reservation for "${r.copy.book?.title || 'Book'}" - Scanned copy barcode pre-filled: ${r.copy.barcode}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConditionChange = (cond: string) => {
    setReturnCondition(cond);
    if (cond === 'DAMAGED') {
      if (!damageFineAmount || damageFineAmount === '0' || damageFineAmount === '500') {
        setDamageFineAmount('150');
      }
    } else if (cond === 'LOST') {
      if (!damageFineAmount || damageFineAmount === '0' || damageFineAmount === '150') {
        setDamageFineAmount('500');
      }
    } else {
      setDamageFineAmount('0');
    }
  };

  // Handle Book Return
  const handleConfirmReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCollectedFineReceipt(null);
    if (!returnBarcode) return;
    setIsProcessingReturn(true);
    try {
      const assessedFine = (returnCondition === 'DAMAGED' || returnCondition === 'LOST')
        ? (parseFloat(damageFineAmount) || 0)
        : 0;
      const res = await api.returnBook(
        returnBarcode.trim(),
        returnCondition,
        assessedFine,
        damageNotes.trim() || undefined
      );
      setReturnResult(res);
      setSuccess(`Book return processed. Condition: ${returnCondition}${res.hasFine ? ` - Fine assessed: ₹${res.fineAmount.toFixed(2)}` : ' - No fine assessed'}`);
      setReturnBarcode('');
      setDamageNotes('');
    } catch (err: any) {
      setError(err.message || 'Failed to process return');
    } finally {
      setIsProcessingReturn(false);
    }
  };

  // Handle immediate counter fine cash settlement
  const handleSettleReturnFineCash = async (fineId: string) => {
    setIsCollectingReturnFine(true);
    try {
      const rec = await api.recordCashPayment(fineId, `Counter cash settlement upon ${returnResult?.condition || 'RETURN'}`);
      setCollectedFineReceipt(rec);
      if (returnResult && returnResult.fine) {
        setReturnResult({
          ...returnResult,
          fine: {
            ...returnResult.fine,
            paymentStatus: 'PAID',
          },
        });
      }
      setSuccess(`Fine payment of ₹${rec.amountRupees} recorded successfully! Receipt #${rec.receiptNumber}`);
    } catch (err: any) {
      setError(err.message || 'Failed to record cash payment');
    } finally {
      setIsCollectingReturnFine(false);
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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

              {reservation && (
                <div style={{ background: '#f8fafc', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={{ color: 'var(--text-primary)' }}>{reservation.copy.book?.title}</h4>
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

          {/* Live Pending Reservations Queue from Backend */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <Clock size={18} color="var(--accent-primary)" />
                  Live Patron Reservations Awaiting Pickup
                  <span className="badge badge-reserved" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                    {reservationsList.filter((r) => r.status === 'ACTIVE').length} Active
                  </span>
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginTop: '4px', margin: 0 }}>
                  Reservations placed by patrons via Mobile App appear here in real-time.
                </p>
              </div>
              <button
                type="button"
                onClick={loadReservations}
                disabled={isLoadingReservations}
                className="btn btn-secondary"
                style={{ fontSize: '0.8125rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <RefreshCw size={14} style={{ animation: isLoadingReservations ? 'spin 1s linear infinite' : 'none' }} />
                Refresh Queue
              </button>
            </div>

            {reservationsList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                No active reservations currently waiting for pickup.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '10px 12px' }}>Book Title</th>
                      <th style={{ padding: '10px 12px' }}>Patron</th>
                      <th style={{ padding: '10px 12px' }}>Pickup Code</th>
                      <th style={{ padding: '10px 12px' }}>Copy Barcode</th>
                      <th style={{ padding: '10px 12px' }}>24h Deadline</th>
                      <th style={{ padding: '10px 12px' }}>Status</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservationsList.map((r) => {
                      const isExpired = new Date(r.expiryDate).getTime() < Date.now();
                      return (
                        <tr
                          key={r.id}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            background: reservation?.id === r.id ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
                          }}
                        >
                          <td style={{ padding: '12px', fontWeight: 600 }}>
                            {r.copy?.book?.title || 'Unknown Title'}
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 400 }}>
                              {r.copy?.book?.author}
                            </div>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <div>{r.user?.name || 'Patron'}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              {r.user?.registrationNumber || r.user?.email}
                            </div>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '3px 8px',
                                background: '#f0fdf4',
                                color: '#166534',
                                border: '1px solid #bbf7d0',
                                borderRadius: '6px',
                                fontWeight: 700,
                                fontFamily: 'monospace',
                                fontSize: '0.8125rem',
                              }}
                            >
                              {r.pickupCode || 'PENDING'}
                            </span>
                          </td>
                          <td style={{ padding: '12px', fontFamily: 'monospace' }}>
                            {r.copy?.barcode || 'N/A'}
                          </td>
                          <td style={{ padding: '12px', fontSize: '0.8125rem', color: isExpired ? '#ef4444' : 'inherit' }}>
                            {new Date(r.expiryDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(r.expiryDate).toLocaleDateString()})
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span
                              className={`badge ${
                                r.status === 'ACTIVE'
                                  ? 'badge-reserved'
                                  : r.status === 'COLLECTED'
                                    ? 'badge-available'
                                    : 'badge-overdue'
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right' }}>
                            {r.status === 'ACTIVE' && (
                              <button
                                type="button"
                                onClick={() => handleSelectReservationForPickup(r)}
                                className="btn btn-secondary"
                                style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              >
                                Select Pickup <ArrowRight size={12} />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BOOK RETURNS & CONDITION INSPECTION */}
      {activeSubTab === 'return' && (
        <div style={{ maxWidth: '720px', margin: '0 auto', width: '100%' }}>
          <div className="glass-panel" style={{ padding: '28px' }}>
            <h3 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={20} color="var(--accent-primary)" />
              Scan & Return Book Copy
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '20px' }}>
              Verify book condition on return. The system calculates overdue fines, assesses damage/loss penalties, updates copy status, and notifies the patron.
            </p>

            <form onSubmit={handleConfirmReturn}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>Book Copy Barcode</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    id="input-return-barcode"
                    type="text"
                    placeholder="Scan Barcode (e.g. BC-100311)"
                    value={returnBarcode}
                    onChange={(e) => setReturnBarcode(e.target.value)}
                    className="form-input"
                    style={{ flex: 1 }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setReturnBarcode('BC-100311')}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                  >
                    + Fill Demo Copy
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>Book Condition Inspection</label>
                <select
                  id="select-return-condition"
                  value={returnCondition}
                  onChange={(e) => handleConditionChange(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', padding: '10px 12px' }}
                >
                  <option value="GOOD">✓ Good / Pristine Condition (Restore to Shelf)</option>
                  <option value="MINOR_WEAR">✓ Acceptable / Minor Wear (Restore to Shelf)</option>
                  <option value="DAMAGED">⚠️ Damaged / Torn / Water Spill (Assess Repair Fine & Quarantine)</option>
                  <option value="LOST">❌ Declared Lost (Assess Replacement Cost & Write Off)</option>
                </select>
              </div>

              {/* Damage / Loss Penalty Assessment Inputs */}
              {(returnCondition === 'DAMAGED' || returnCondition === 'LOST') && (
                <div
                  style={{
                    marginBottom: '20px',
                    padding: '16px 20px',
                    borderRadius: 'var(--radius-md)',
                    background: returnCondition === 'DAMAGED' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                    border: `1px solid ${returnCondition === 'DAMAGED' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <AlertTriangle size={18} color={returnCondition === 'DAMAGED' ? '#f59e0b' : '#ef4444'} />
                    <strong style={{ fontSize: '0.875rem', color: returnCondition === 'DAMAGED' ? '#d97706' : '#dc2626' }}>
                      {returnCondition === 'DAMAGED' ? 'Assess Damage & Repair Charge' : 'Assess Lost Book Replacement Charge'}
                    </strong>
                  </div>

                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                      Fine Amount to Charge Patron (₹)
                    </label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--text-secondary)' }}>₹</span>
                        <input
                          id="input-damage-fine-amount"
                          type="number"
                          min="0"
                          step="10"
                          value={damageFineAmount}
                          onChange={(e) => setDamageFineAmount(e.target.value)}
                          className="form-input"
                          style={{ paddingLeft: '28px', width: '100%' }}
                          placeholder="Enter fine amount"
                        />
                      </div>
                      {/* Preset quick buttons */}
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {returnCondition === 'DAMAGED' ? (
                          <>
                            <button type="button" onClick={() => setDamageFineAmount('100')} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '6px 10px' }}>₹100</button>
                            <button type="button" onClick={() => setDamageFineAmount('150')} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '6px 10px' }}>₹150 (Std)</button>
                            <button type="button" onClick={() => setDamageFineAmount('300')} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '6px 10px' }}>₹300</button>
                          </>
                        ) : (
                          <>
                            <button type="button" onClick={() => setDamageFineAmount('300')} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '6px 10px' }}>₹300</button>
                            <button type="button" onClick={() => setDamageFineAmount('500')} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '6px 10px' }}>₹500 (Std)</button>
                            <button type="button" onClick={() => setDamageFineAmount('1000')} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '6px 10px' }}>₹1,000</button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                      Condition / Incident Notes
                    </label>
                    <input
                      id="input-damage-notes"
                      type="text"
                      value={damageNotes}
                      onChange={(e) => setDamageNotes(e.target.value)}
                      className="form-input"
                      placeholder={returnCondition === 'DAMAGED' ? 'e.g. Broken spine, torn pages 40-52, liquid stain' : 'e.g. Patron reported lost during transit'}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              )}

              <button
                id="btn-confirm-return"
                type="submit"
                disabled={!returnBarcode || isProcessingReturn}
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {isProcessingReturn ? (
                  <>
                    <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    Processing Return & Assessment...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    Confirm Book Return & Process Assessment
                  </>
                )}
              </button>
            </form>

            {/* Return Result & Receipt */}
            {returnResult && (
              <div style={{ marginTop: '24px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Receipt size={18} color="var(--accent-primary)" />
                    Book Return Receipt
                  </h4>
                  <span
                    className={`badge ${
                      returnResult.condition === 'DAMAGED'
                        ? 'badge-reserved'
                        : returnResult.condition === 'LOST'
                          ? 'badge-overdue'
                          : 'badge-available'
                    }`}
                    style={{ fontSize: '0.8125rem', padding: '4px 10px' }}
                  >
                    {returnResult.condition === 'DAMAGED'
                      ? 'DAMAGED (QUARANTINED)'
                      : returnResult.condition === 'LOST'
                        ? 'DECLARED LOST'
                        : 'RETURNED (AVAILABLE)'}
                  </span>
                </div>

                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                  <div><strong>Book:</strong> {returnResult.loan.copy?.book?.title || returnResult.loan.bookTitle}</div>
                  <div><strong>Barcode:</strong> <code style={{ fontFamily: 'monospace', color: '#0284c7', background: '#e0f2fe', padding: '2px 6px', borderRadius: '4px' }}>{returnResult.loan.copy?.barcode || returnResult.loan.barcode}</code></div>
                  <div><strong>Patron:</strong> {returnResult.loan.user?.name || 'Patron'}</div>
                  <div><strong>Inspection Condition:</strong> <span style={{ fontWeight: 600 }}>{returnResult.condition}</span></div>
                  <div><strong>Timestamp:</strong> {new Date().toLocaleString()}</div>

                  {/* Fine Breakdown */}
                  {returnResult.hasFine ? (
                    <div style={{ marginTop: '16px', padding: '16px', background: '#fff1f2', borderRadius: 'var(--radius-sm)', border: '1px solid #fecdd3' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <strong style={{ color: '#be123c', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <AlertTriangle size={18} />
                          Fine Assessed: ₹{returnResult.fineAmount.toFixed(2)}
                        </strong>
                        <span
                          className={`badge ${returnResult.fine?.paymentStatus === 'PAID' ? 'badge-available' : 'badge-overdue'}`}
                          style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                        >
                          {returnResult.fine?.paymentStatus === 'PAID' ? '✓ PAID & SETTLED' : 'UNPAID'}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.8125rem', color: '#881337', marginBottom: '12px' }}>
                        {returnResult.overdueFineAmount > 0 && (
                          <div>• Overdue Days Fine: ₹{returnResult.overdueFineAmount.toFixed(2)}</div>
                        )}
                        {returnResult.conditionFineAmount > 0 && (
                          <div>• {returnResult.condition === 'DAMAGED' ? 'Damage & Repair Fee' : 'Replacement Fee'}: ₹{returnResult.conditionFineAmount.toFixed(2)}</div>
                        )}
                        {returnResult.fine?.reason && (
                          <div style={{ marginTop: '4px', fontStyle: 'italic' }}>Reason: {returnResult.fine.reason}</div>
                        )}
                      </div>

                      {/* Instant Cash Settlement at Counter */}
                      {returnResult.fine?.paymentStatus === 'UNPAID' && returnResult.fine?.id && (
                        <div style={{ borderTop: '1px dashed #fca5a5', paddingTop: '12px', marginTop: '12px' }}>
                          <div style={{ fontSize: '0.8125rem', color: '#9f1239', marginBottom: '8px' }}>
                            Patron can pay now with cash at circulation counter or online via the Mobile App.
                          </div>
                          <button
                            id="btn-settle-return-fine-cash"
                            type="button"
                            disabled={isCollectingReturnFine}
                            onClick={() => handleSettleReturnFineCash(returnResult.fine.id)}
                            className="btn btn-primary"
                            style={{
                              background: '#059669',
                              borderColor: '#047857',
                              padding: '10px 18px',
                              fontSize: '0.875rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '8px',
                            }}
                          >
                            {isCollectingReturnFine ? (
                              <>
                                <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                                Recording Cash Payment...
                              </>
                            ) : (
                              <>
                                <DollarSign size={16} />
                                Collect Cash Now (₹{returnResult.fineAmount.toFixed(2)}) & Issue Receipt
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {collectedFineReceipt && (
                        <div style={{ marginTop: '12px', padding: '12px', background: '#ecfdf5', borderRadius: '6px', border: '1px solid #a7f3d0', color: '#065f46' }}>
                          <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <CheckCircle2 size={16} color="#059669" />
                            Cash Payment Successfully Settled!
                          </div>
                          <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                            Receipt #{collectedFineReceipt.receiptNumber} generated. Official cash transaction logged.
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ marginTop: '12px', padding: '10px 14px', background: '#ecfdf5', borderRadius: 'var(--radius-sm)', border: '1px solid #a7f3d0', color: '#047857', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={16} color="#059669" />
                      Returned in acceptable condition with zero fines.
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
