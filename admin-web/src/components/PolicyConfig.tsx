import React, { useState, useEffect } from 'react';
import { adminApi } from '../api';
import type { LibraryPolicy } from '../types';
import { Sliders, Save, CheckCircle2, ShieldAlert } from 'lucide-react';

export const PolicyConfig: React.FC = () => {
  const [policy, setPolicy] = useState<LibraryPolicy | null>(null);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    adminApi.getPolicy().then(setPolicy).catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policy) return;
    setIsSaving(true);
    try {
      await adminApi.updatePolicy(policy);
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to update policy');
    } finally {
      setIsSaving(false);
    }
  };

  if (!policy) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <div className="glass-panel" style={{ padding: '32px' }}>
          <div className="skeleton" style={{ width: '40%', height: '24px', marginBottom: '16px' }} />
          <div className="skeleton" style={{ width: '70%', height: '14px', marginBottom: '24px' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="skeleton" style={{ height: '70px' }} />
            <div className="skeleton" style={{ height: '70px' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Dynamic Circulation Governance</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
          Configure system-wide limits, fine calculation rates, and automated 24h pickup expiration windows.
        </p>
      </div>

      {saved && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 'var(--radius-md)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px', color: '#047857' }}>
          <CheckCircle2 size={20} color="#059669" />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Policy Changes Successfully Propagated!</div>
            <div style={{ fontSize: '0.8125rem', marginTop: '2px' }}>
              All mobile apps and circulation counter stations are now enforcing these authoritative limits.
            </div>
          </div>
        </div>
      )}

      {/* Main Configuration Card */}
      <div className="glass-panel" style={{ padding: '32px' }}>
        <h3 style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sliders size={20} color="var(--accent-primary)" />
          Circulation Parameters & Penalties
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '24px' }}>
          Authoritative rules enforced directly within PostgreSQL transaction locks.
        </p>

        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Patron Borrow Limit (Titles)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={policy.borrowLimit}
                onChange={(e) => setPolicy({ ...policy, borrowLimit: parseInt(e.target.value, 10) })}
                className="form-input"
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Maximum active simultaneous loans permitted per patron</span>
            </div>

            <div className="form-group">
              <label className="form-label">Default Loan Duration (Days)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={policy.loanDuration}
                onChange={(e) => setPolicy({ ...policy, loanDuration: parseInt(e.target.value, 10) })}
                className="form-input"
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Standard borrowing cycle before loan transitions to OVERDUE</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '12px' }}>
            <div className="form-group">
              <label className="form-label">Online Pickup Hold Window (Days)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  min="1"
                  max="1"
                  disabled
                  value={policy.reservationPeriod}
                  className="form-input"
                  style={{ opacity: 0.85, cursor: 'not-allowed', width: '100%', background: '#f8fafc' }}
                />
              </div>
              <span style={{ fontSize: '0.75rem', color: '#d97706', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontWeight: 600 }}>
                <ShieldAlert size={14} /> Strict 24-hour collection deadline (Locked by SRS specification)
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Overdue Fine Rate per Day (₹ INR)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--text-muted)' }}>₹</span>
                <input
                  type="number"
                  min="0"
                  step="0.50"
                  value={Number(policy.finePerDay)}
                  onChange={(e) => setPolicy({ ...policy, finePerDay: parseFloat(e.target.value) })}
                  className="form-input"
                  style={{ paddingLeft: '28px', width: '100%' }}
                />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Automatically assessed daily for each unreturned loan</span>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '12px' }}>
            <label className="form-label">Maximum Loan Renewals Permitted</label>
            <input
              type="number"
              min="0"
              max="5"
              value={policy.maxRenewals}
              onChange={(e) => setPolicy({ ...policy, maxRenewals: parseInt(e.target.value, 10) })}
              className="form-input"
              style={{ maxWidth: '340px' }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Patrons can renew from mobile app if no active hold queue exists</span>
          </div>

          {/* Policy Summary Pill Box */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', padding: '16px 20px', marginTop: '24px' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Active Policy Summary
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              • Patrons may borrow up to <strong>{policy.borrowLimit} books</strong> simultaneously for <strong>{policy.loanDuration} days</strong> each.<br />
              • Online reservations must be collected in person within <strong>24 hours</strong> of placement.<br />
              • Overdue books incur <strong>₹{Number(policy.finePerDay).toFixed(2)} / day</strong> in automatic fines until physically returned.<br />
              • Loans can be renewed up to <strong>{policy.maxRenewals} time(s)</strong>.
            </div>
          </div>

          <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
            <button
              id="btn-save-policy"
              type="submit"
              disabled={isSaving}
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
            >
              <Save size={18} />
              {isSaving ? 'Synchronizing Policy Changes...' : 'Save & Propagate Policy to Live Engine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
