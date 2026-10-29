import React, { useState } from 'react';
import { Library, Lock, Mail, Eye, EyeOff, ShieldCheck, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';
import { api } from '../api';
import type { User } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState('librarian@library.com');
  const [password, setPassword] = useState('LibrarianPassword123!');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setError('Please provide your staff email or ID and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await api.login(identifier, password);
      onLoginSuccess(result.user);
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoId: string, demoPw: string) => {
    setIdentifier(demoId);
    setPassword(demoPw);
    setError(null);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F8FAFC',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.06)',
          overflow: 'hidden',
        }}
      >
        {/* Brand Banner */}
        <div
          style={{
            padding: '32px 32px 24px',
            borderBottom: '1px solid #F1F5F9',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#2563EB',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}
          >
            <Library size={26} color="#FFFFFF" />
          </div>
          <h1
            style={{
              fontSize: '1.35rem',
              fontWeight: 700,
              color: '#0F172A',
              margin: '0 0 6px',
              letterSpacing: '-0.02em',
            }}
          >
            Central Library
          </h1>
          <p
            style={{
              fontSize: '0.875rem',
              color: '#64748B',
              margin: 0,
            }}
          >
            Staff Operations & Circulation Portal
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ padding: '28px 32px 24px' }}>
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 14px',
                background: '#FEF2F2',
                border: '1px solid #FCA5A5',
                borderRadius: '8px',
                color: '#991B1B',
                fontSize: '0.85rem',
                marginBottom: '20px',
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <div style={{ marginBottom: '18px' }}>
            <label
              htmlFor="staff-identifier"
              style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '6px',
              }}
            >
              Staff Email or Registration ID
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="staff-identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="librarian@library.com or LIB-001"
                required
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 38px',
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  color: '#0F172A',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <Mail
                size={16}
                color="#94A3B8"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label
                htmlFor="staff-password"
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: '#334155',
                }}
              >
                Password
              </label>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="staff-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{
                  width: '100%',
                  padding: '10px 38px 10px 38px',
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  color: '#0F172A',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <Lock
                size={16}
                color="#94A3B8"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: '#94A3B8',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            id="staff-login-btn"
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.925rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 1px 2px rgba(37, 99, 235, 0.2)',
              opacity: loading ? 0.8 : 1,
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Staff Console'}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Quick Demo Pre-fill Accounts */}
        <div
          style={{
            padding: '20px 32px 28px',
            background: '#F8FAFC',
            borderTop: '1px solid #E2E8F0',
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#64748B',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <ShieldCheck size={14} color="#2563EB" />
            Quick Demo Login Accounts
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              id="demo-login-librarian"
              type="button"
              onClick={() => handleQuickDemo('librarian@library.com', 'LibrarianPassword123!')}
              style={{
                padding: '10px 12px',
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#0F172A' }}>
                <UserCheck size={14} color="#2563EB" />
                Librarian
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748B' }}>librarian@library.com</div>
            </button>

            <button
              id="demo-login-admin"
              type="button"
              onClick={() => handleQuickDemo('admin@library.com', 'AdminPassword123!')}
              style={{
                padding: '10px 12px',
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#0F172A' }}>
                <ShieldCheck size={14} color="#475569" />
                Administrator
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748B' }}>admin@library.com</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
