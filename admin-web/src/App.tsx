import React, { useState } from 'react';
import { DashboardAnalytics } from './components/DashboardAnalytics';
import { UserManagement } from './components/UserManagement';
import { PolicyConfig } from './components/PolicyConfig';
import { AuditLogs } from './components/AuditLogs';
import { LoginPage } from './components/LoginPage';
import { Shield, BarChart3, Users, Sliders, Terminal, LogOut } from 'lucide-react';
import { api } from './api';
import type { User } from './types';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => api.getCurrentUser());
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'policies' | 'audit'>('analytics');

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <LoginPage onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  const initials = currentUser.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      {/* Top Header */}
      <header
        style={{
          background: '#ffffff',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '12px 28px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              background: '#2563eb',
              borderRadius: 'var(--radius-md)',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Shield size={20} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              Central Library • Administrator Console
              <span className="badge badge-admin" style={{ fontSize: '0.65rem' }}>Tier 1 Superuser</span>
            </h2>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Governance, System Auditing, RBAC & Policy Engine
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', gap: '6px' }}>
          <button
            id="nav-admin-analytics"
            onClick={() => setActiveTab('analytics')}
            className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <BarChart3 size={15} />
            Analytics & Revenue
          </button>
          <button
            id="nav-admin-users"
            onClick={() => setActiveTab('users')}
            className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Users size={15} />
            Accounts & Roles
          </button>
          <button
            id="nav-admin-policies"
            onClick={() => setActiveTab('policies')}
            className={`btn ${activeTab === 'policies' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Sliders size={15} />
            Policies & 24h Window
          </button>
          <button
            id="nav-admin-audit"
            onClick={() => setActiveTab('audit')}
            className={`btn ${activeTab === 'audit' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Terminal size={15} />
            Security Audit Logs
          </button>
        </nav>

        {/* Admin Identity & Sign Out */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{currentUser.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{currentUser.email}</div>
            </div>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: '#eff6ff',
                color: '#1d4ed8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '13px',
                border: '1px solid #dbeafe',
              }}
            >
              {initials}
            </div>
          </div>

          <button
            id="admin-sign-out-btn"
            onClick={handleLogout}
            title="Sign Out"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              background: '#F1F5F9',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#475569',
              cursor: 'pointer',
            }}
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, maxWidth: '1400px', margin: '0 auto', width: '100%', padding: '24px 28px' }}>
        {activeTab === 'analytics' && <DashboardAnalytics />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'policies' && <PolicyConfig />}
        {activeTab === 'audit' && <AuditLogs />}
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '12px 28px',
          background: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
        }}
      >
        <div>LMS Administrator Console • Strict Role-Based Access Control</div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span>PostgreSQL Active</span>
          <span>•</span>
          <span>Razorpay Webhook Listener Active</span>
          <span>•</span>
          <span>Zero Client-side Secret Leakage</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
