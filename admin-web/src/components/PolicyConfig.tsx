import React, { useState, useEffect } from 'react';
import { adminApi } from '../api';
import type { LibraryPolicy } from '../types';
import { Sliders, Save, CheckCircle2, ShieldAlert } from 'lucide-react';

export const PolicyConfig: React.FC = () => {
  const [policy, setPolicy] = useState<LibraryPolicy | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    adminApi.getPolicy().then(setPolicy);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policy) return;
    await adminApi.updatePolicy(policy);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!policy) return <div style={{ color: 'var(--text-muted)' }}>Loading policy settings...</div>;

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', width: '100%' }}>
      <div className="glass-panel" style={{ padding: '32px' }}>
        <h3 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sliders size={22} color="var(--accent-primary)" />
          Dynamic Library Policy Configuration
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '24px' }}>
          Changes applied here update authoritative circulation constraints immediately across the Flutter Member App and Librarian Portal.
        </p>

        {saved && (
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: 'var(--radius-md)', padding: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#6ee7b7' }}>
            <CheckCircle2 size={18} />
            <span>Policy settings successfully synchronized and logged to audit stream.</span>
          </div>
        )}

        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Patron Borrow Limit</label>
              <input
                type="number"
                min="1"
                max="10"
                value={policy.borrowLimit}
                onChange={(e) => setPolicy({ ...policy, borrowLimit: parseInt(e.target.value, 10) })}
                className="form-input"
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Max active loans permitted simultaneously</span>
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
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Standard borrowing window before overdue status</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '12px' }}>
            <div className="form-group">
              <label className="form-label">Online Reservation Pickup Window (Days)</label>
              <input
                type="number"
                min="1"
                max="1"
                disabled
                value={policy.reservationPeriod}
                className="form-input"
                style={{ opacity: 0.8, cursor: 'not-allowed' }}
              />
              <span style={{ fontSize: '0.75rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                <ShieldAlert size={12} /> Strict 24-hour collection deadline (Locked by SRS)
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Overdue Fine Rate per Day (₹ INR)</label>
              <input
                type="number"
                min="0"
                step="0.50"
                value={Number(policy.finePerDay)}
                onChange={(e) => setPolicy({ ...policy, finePerDay: parseFloat(e.target.value) })}
                className="form-input"
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Auto-calculated upon return or batch inspection</span>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '12px' }}>
            <label className="form-label">Maximum Renewals Permitted</label>
            <input
              type="number"
              min="0"
              max="5"
              value={policy.maxRenewals}
              onChange={(e) => setPolicy({ ...policy, maxRenewals: parseInt(e.target.value, 10) })}
              className="form-input"
              style={{ maxWidth: '340px' }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Patrons can request renewal if no waitlist exists</span>
          </div>

          <div style={{ marginTop: '28px', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
            <button id="btn-save-policy" type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1rem' }}>
              <Save size={18} />
              Save & Propagate Policy Updates
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
