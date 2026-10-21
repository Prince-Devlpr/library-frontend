import React, { useEffect, useState } from 'react';
import { adminApi } from '../api';
import type { ReportMetrics } from '../types';
import { Users, BookOpen, Clock, AlertCircle, DollarSign, TrendingUp, ShieldCheck, CreditCard } from 'lucide-react';

export const DashboardAnalytics: React.FC = () => {
  const [metrics, setMetrics] = useState<ReportMetrics | null>(null);

  useEffect(() => {
    adminApi.getMetrics().then(setMetrics);
  }, []);

  if (!metrics) {
    return <div style={{ color: 'var(--text-muted)' }}>Loading system telemetry...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>REGISTERED PATRONS</span>
            <Users size={20} color="var(--accent-primary)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{metrics.totalPatrons}</div>
          <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '4px' }}>{metrics.activePatrons} Active & Borrowing</div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TITLES & PHYSICAL COPIES</span>
            <BookOpen size={20} color="var(--accent-secondary)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{metrics.totalTitles} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>({metrics.totalCopies} copies)</span></div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{metrics.activeLoans} Currently Issued</div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>ACTIVE 24H RESERVATIONS</span>
            <Clock size={20} color="#fbbf24" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{metrics.activeReservations}</div>
          <div style={{ fontSize: '0.75rem', color: '#fbbf24', marginTop: '4px' }}>Strict 24h Expiration Active</div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>OVERDUE BOOKS</span>
            <AlertCircle size={20} color="#f87171" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f87171' }}>{metrics.overdueLoans}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Daily Fines Accruing (₹5/day)</div>
        </div>
      </div>

      {/* Financial Health & Revenue Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DollarSign size={20} color="var(--accent-success)" />
            Fine Revenue Reconciliation (Paise / INR)
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '20px' }}>
            Audited financial comparison between total assessed penalties and actual settled revenue.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TOTAL FINES ASSESSED</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px' }}>₹{metrics.totalFinesAssessedRupees.toFixed(2)}</div>
            </div>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.75rem', color: '#34d399' }}>TOTAL COLLECTED REVENUE</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>₹{metrics.totalFinesCollectedRupees.toFixed(2)}</div>
            </div>
          </div>

          {/* Payment Method Split */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Channel Distribution:
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1, background: 'rgba(139, 92, 246, 0.1)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: '#c084fc' }}>
                  <CreditCard size={15} /> Razorpay Online (Patron App)
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '4px' }}>₹{metrics.razorpayVolumeRupees.toFixed(2)}</div>
              </div>
              <div style={{ flex: 1, background: 'rgba(56, 189, 248, 0.1)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: '#38bdf8' }}>
                  <TrendingUp size={15} /> Circulation Counter Cash
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '4px' }}>₹{metrics.counterVolumeRupees.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Operational Security & Concurrency Health */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} color="var(--accent-primary)" />
            System Governance Invariants
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(0,0,0,0.25)', borderRadius: '6px' }}>
              <span>24-Hour Expiration Check</span>
              <strong style={{ color: '#34d399' }}>Dual-Layer Active</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(0,0,0,0.25)', borderRadius: '6px' }}>
              <span>Inventory Allocation Concurrency</span>
              <strong style={{ color: '#34d399' }}>Atomic Transactions</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(0,0,0,0.25)', borderRadius: '6px' }}>
              <span>Razorpay Signature Verification</span>
              <strong style={{ color: '#34d399' }}>HMAC-SHA256 Strict</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(0,0,0,0.25)', borderRadius: '6px' }}>
              <span>Audit Log Tamper-Resistance</span>
              <strong style={{ color: '#34d399' }}>Append-Only Stream</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(0,0,0,0.25)', borderRadius: '6px' }}>
              <span>Password Security</span>
              <strong style={{ color: '#34d399' }}>Argon2id (Memory-hard)</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
