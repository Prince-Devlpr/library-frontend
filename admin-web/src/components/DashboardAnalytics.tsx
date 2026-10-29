import React, { useEffect, useState } from 'react';
import { adminApi } from '../api';
import type { ReportMetrics } from '../types';
import { Users, BookOpen, Clock, AlertCircle, DollarSign, TrendingUp, ShieldCheck, CreditCard, CheckCircle2 } from 'lucide-react';

export const DashboardAnalytics: React.FC = () => {
  const [metrics, setMetrics] = useState<ReportMetrics | null>(null);

  useEffect(() => {
    adminApi.getMetrics().then(setMetrics).catch(() => {});
  }, []);

  if (!metrics) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-panel" style={{ padding: '24px', height: '130px' }}>
              <div className="skeleton" style={{ width: '40%', height: '14px', marginBottom: '16px' }} />
              <div className="skeleton" style={{ width: '60%', height: '32px', marginBottom: '12px' }} />
              <div className="skeleton" style={{ width: '50%', height: '12px' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Page Title & Subtitle */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>System Analytics & Financial Telemetry</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
          Live metrics, circulation volume, fine reconciliations, and cryptographic governance status.
        </p>
      </div>

      {/* Top Stat KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        {/* Patrons Card */}
        <div className="glass-panel hover-lift" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.05em' }}>
              REGISTERED PATRONS
            </span>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} color="var(--accent-primary)" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>{metrics.totalPatrons}</div>
          <div style={{ fontSize: '0.8125rem', color: '#059669', fontWeight: 600, marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
            {metrics.activePatrons} Active & Borrowing
          </div>
        </div>

        {/* Titles & Copies Card */}
        <div className="glass-panel hover-lift" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.05em' }}>
              TITLES & COPIES
            </span>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={20} color="var(--accent-secondary)" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
            {metrics.totalTitles} <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>({metrics.totalCopies} copies)</span>
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
            <strong>{metrics.activeLoans}</strong> Copies In Circulation
          </div>
        </div>

        {/* 24h Reservations Card */}
        <div className="glass-panel hover-lift" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.05em' }}>
              24H RESERVATIONS
            </span>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={20} color="var(--accent-warning)" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>{metrics.activeReservations}</div>
          <div style={{ fontSize: '0.8125rem', color: '#b45309', fontWeight: 600, marginTop: '6px' }}>
            Awaiting Counter Pickup
          </div>
        </div>

        {/* Overdue Loans Card */}
        <div className="glass-panel hover-lift" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.05em' }}>
              OVERDUE BOOKS
            </span>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertCircle size={20} color="var(--accent-danger)" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-danger)', letterSpacing: '-0.03em' }}>{metrics.overdueLoans}</div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            Accruing ₹5/day penalty
          </div>
        </div>
      </div>

      {/* Financial Health & Revenue Reconciliation */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '26px' }}>
          <h3 style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DollarSign size={20} color="var(--accent-success)" />
            Fine Revenue Reconciliation (INR)
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '22px' }}>
            Audited financial comparison between total assessed penalties and verified revenue.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '22px' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '18px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>TOTAL FINES ASSESSED</div>
              <div style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '6px' }}>₹{metrics.totalFinesAssessedRupees.toFixed(2)}</div>
            </div>
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '18px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857', letterSpacing: '0.04em' }}>TOTAL COLLECTED REVENUE</div>
              <div style={{ fontSize: '1.625rem', fontWeight: 800, color: '#059669', marginTop: '6px' }}>₹{metrics.totalFinesCollectedRupees.toFixed(2)}</div>
            </div>
          </div>

          {/* Payment Method Split */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '18px' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Verified Collection Channels:
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1, background: '#f8fafc', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: '#2563eb', fontWeight: 600 }}>
                  <CreditCard size={16} /> Razorpay Online (Mobile App)
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '6px' }}>
                  ₹{metrics.razorpayVolumeRupees.toFixed(2)}
                </div>
              </div>
              <div style={{ flex: 1, background: '#f8fafc', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: '#0284c7', fontWeight: 600 }}>
                  <TrendingUp size={16} /> Circulation Counter Cash
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '6px' }}>
                  ₹{metrics.counterVolumeRupees.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Operational Security & Concurrency Health */}
        <div className="glass-panel" style={{ padding: '26px' }}>
          <h3 style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} color="var(--accent-primary)" />
            System Governance Invariants
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '20px' }}>
            Cryptographic guarantees & concurrency rules enforced at DB layer.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: '24-Hour Expiration Check', badge: 'Active Cron & Gateway' },
              { label: 'Inventory Allocation Concurrency', badge: 'Atomic Transaction' },
              { label: 'Razorpay Signature Verification', badge: 'HMAC-SHA256 Strict' },
              { label: 'Audit Log Tamper-Resistance', badge: 'Append-Only Stream' },
              { label: 'Password Security Hashing', badge: 'Argon2id (Memory-hard)' },
            ].map((inv, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: '#f8fafc',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #e2e8f0',
                }}
              >
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{inv.label}</span>
                <span className="badge badge-available" style={{ fontSize: '0.6875rem', padding: '3px 8px' }}>
                  <CheckCircle2 size={12} />
                  {inv.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
