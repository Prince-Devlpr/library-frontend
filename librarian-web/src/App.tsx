import React, { useState } from 'react';
import { CirculationDesk } from './components/CirculationDesk';
import { CatalogManager } from './components/CatalogManager';
import { CounterPayments } from './components/CounterPayments';
import { ScannerTerminal } from './components/ScannerTerminal';
import { LoginPage } from './components/LoginPage';
import { BookOpen, Layers, DollarSign, Scan, Library, LogOut } from 'lucide-react';
import { api } from './api';
import type { User } from './types';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => api.getCurrentUser());
  const [activeTab, setActiveTab] = useState<'circulation' | 'catalog' | 'payments' | 'scanner'>('circulation');

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
            <Library size={22} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px', margin: 0, fontWeight: 700 }}>
              Central Library • Staff Console
              <span className="badge badge-available" style={{ fontSize: '0.6875rem', padding: '3px 8px' }}>
                <span className="status-dot-active" style={{ width: '6px', height: '6px' }} />
                Counter 01 Online
              </span>
            </h2>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '1px' }}>
              Circulation Desk • Physical Inventory • Counter Payments
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: 'var(--radius-lg)' }}>
          <button
            id="nav-circulation"
            onClick={() => setActiveTab('circulation')}
            className={`tab-pill ${activeTab === 'circulation' ? 'active' : ''}`}
          >
            <BookOpen size={16} />
            Circulation Desk
          </button>
          <button
            id="nav-catalog"
            onClick={() => setActiveTab('catalog')}
            className={`tab-pill ${activeTab === 'catalog' ? 'active' : ''}`}
          >
            <Layers size={16} />
            Catalog & Labels
          </button>
          <button
            id="nav-payments"
            onClick={() => setActiveTab('payments')}
            className={`tab-pill ${activeTab === 'payments' ? 'active' : ''}`}
          >
            <DollarSign size={16} />
            Counter Payments
          </button>
          <button
            id="nav-scanner"
            onClick={() => setActiveTab('scanner')}
            className={`tab-pill ${activeTab === 'scanner' ? 'active' : ''}`}
          >
            <Scan size={16} />
            Scanner Terminal
          </button>
        </nav>

        {/* Staff Identity & Sign Out */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{currentUser.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {currentUser.role === 'ADMINISTRATOR' ? 'Superuser' : 'Librarian'} • {currentUser.registrationNumber}
              </div>
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
            id="librarian-sign-out-btn"
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

      {/* Main Workspace Body with Smooth Page Entrance Animation */}
      <main style={{ flex: 1, maxWidth: '1440px', margin: '0 auto', width: '100%', padding: '28px 32px' }}>
        <div key={activeTab} className="page-fade-in">
          {activeTab === 'circulation' && <CirculationDesk />}
          {activeTab === 'catalog' && <CatalogManager />}
          {activeTab === 'payments' && <CounterPayments />}
          {activeTab === 'scanner' && <ScannerTerminal />}
        </div>
      </main>

      {/* Footer System Status */}
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
        <div>Central Library Management System • Staff Operations Console</div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span className="status-dot-active" style={{ width: '6px', height: '6px' }} />
            PostgreSQL Live
          </span>
          <span>•</span>
          <span>Razorpay Active</span>
          <span>•</span>
          <span>OpenLibrary Sync</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
