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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
            <Library size={20} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              Central Library • Staff Portal
              <span className="badge badge-available" style={{ fontSize: '0.65rem' }}>Counter 01 Online</span>
            </h2>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Circulation Desk, Physical Inventory & Payment Terminal
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', gap: '6px' }}>
          <button
            id="nav-circulation"
            onClick={() => setActiveTab('circulation')}
            className={`btn ${activeTab === 'circulation' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <BookOpen size={15} />
            Circulation Desk
          </button>
          <button
            id="nav-catalog"
            onClick={() => setActiveTab('catalog')}
            className={`btn ${activeTab === 'catalog' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Layers size={15} />
            Catalog & Labels
          </button>
          <button
            id="nav-payments"
            onClick={() => setActiveTab('payments')}
            className={`btn ${activeTab === 'payments' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <DollarSign size={15} />
            Counter Payments
          </button>
          <button
            id="nav-scanner"
            onClick={() => setActiveTab('scanner')}
            className={`btn ${activeTab === 'scanner' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Scan size={15} />
            Scanner Terminal
          </button>
        </nav>

        {/* Staff Identity & Sign Out */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{currentUser.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {currentUser.role === 'ADMINISTRATOR' ? 'System Administrator' : 'Librarian Staff'} • {currentUser.registrationNumber}
              </div>
            </div>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: '#e0e7ff',
                color: '#3730a3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '13px',
                border: '1px solid #c7d2fe',
              }}
            >
              {initials}
            </div>
          </div>

          <button
            id="librarian-sign-out-btn"
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

      {/* Main Workspace Body */}
      <main style={{ flex: 1, maxWidth: '1400px', margin: '0 auto', width: '100%', padding: '24px 28px' }}>
        {activeTab === 'circulation' && <CirculationDesk />}
        {activeTab === 'catalog' && <CatalogManager />}
        {activeTab === 'payments' && <CounterPayments />}
        {activeTab === 'scanner' && <ScannerTerminal />}
      </main>

      {/* Footer System Status */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '12px 28px',
          background: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
        }}
      >
        <div>Central Library Management System • Staff Operations Console</div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span>PostgreSQL Live</span>
          <span>•</span>
          <span>Razorpay Gateway</span>
          <span>•</span>
          <span>OpenLibrary Catalog Sync</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
