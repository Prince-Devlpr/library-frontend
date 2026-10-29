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
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '12px 32px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              borderRadius: 'var(--radius-md)',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)',
            }}
          >
            <Shield size={22} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px', margin: 0, fontWeight: 700 }}>
              Central Library • Admin Console
              <span className="badge badge-admin" style={{ fontSize: '0.6875rem', padding: '3px 8px' }}>
                <span className="status-dot-active" style={{ width: '6px', height: '6px' }} />
                Tier 1 Superuser
              </span>
            </h2>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '1px' }}>
              Governance • RBAC User Accounts • Circulation Policies • Audit Engine
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: 'var(--radius-lg)' }}>
          <button
            id="nav-admin-analytics"
            onClick={() => setActiveTab('analytics')}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.8125rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              background: activeTab === 'analytics' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'analytics' ? '#ffffff' : 'var(--text-secondary)',
              boxShadow: activeTab === 'analytics' ? '0 2px 4px rgba(37, 99, 235, 0.2)' : 'none',
            }}
          >
            <BarChart3 size={16} />
            Analytics & Revenue
          </button>
          <button
            id="nav-admin-users"
            onClick={() => setActiveTab('users')}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.8125rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              background: activeTab === 'users' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'users' ? '#ffffff' : 'var(--text-secondary)',
              boxShadow: activeTab === 'users' ? '0 2px 4px rgba(37, 99, 235, 0.2)' : 'none',
            }}
          >
            <Users size={16} />
            Accounts & Roles
          </button>
          <button
            id="nav-admin-policies"
            onClick={() => setActiveTab('policies')}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.8125rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              background: activeTab === 'policies' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'policies' ? '#ffffff' : 'var(--text-secondary)',
              boxShadow: activeTab === 'policies' ? '0 2px 4px rgba(37, 99, 235, 0.2)' : 'none',
            }}
          >
            <Sliders size={16} />
            Policies & 24h Window
          </button>
          <button
            id="nav-admin-audit"
            onClick={() => setActiveTab('audit')}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.8125rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              background: activeTab === 'audit' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'audit' ? '#ffffff' : 'var(--text-secondary)',
              boxShadow: activeTab === 'audit' ? '0 2px 4px rgba(37, 99, 235, 0.2)' : 'none',
            }}
          >
            <Terminal size={16} />
            Security Audit Logs
          </button>
        </nav>

        {/* Admin Identity & Sign Out */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{currentUser.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{currentUser.email}</div>
            </div>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '13px',
                border: '1.5px solid #bfdbfe',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              {initials}
            </div>
          </div>

          <button
            id="admin-sign-out-btn"
            onClick={handleLogout}
            title="Sign Out"
            className="btn btn-secondary"
            style={{
              padding: '6px 12px',
              fontSize: '0.75rem',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content Area with Smooth Page Entrance Animation */}
      <main style={{ flex: 1, maxWidth: '1440px', margin: '0 auto', width: '100%', padding: '28px 32px' }}>
        <div key={activeTab} className="page-fade-in">
          {activeTab === 'analytics' && <DashboardAnalytics />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'policies' && <PolicyConfig />}
          {activeTab === 'audit' && <AuditLogs />}
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '14px 32px',
          background: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.8125rem',
          color: 'var(--text-muted)',
        }}
      >
        <div>LMS Administrator Console • Strict Role-Based Access Control</div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span className="status-dot-active" style={{ width: '6px', height: '6px' }} />
            PostgreSQL Active
          </span>
          <span>•</span>
          <span>Razorpay Webhook Active</span>
          <span>•</span>
          <span>Zero Secret Leakage</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
