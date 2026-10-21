import React, { useState, useRef, useEffect } from 'react';
import { api } from '../api';
import { Scan, QrCode } from 'lucide-react';

export const ScannerTerminal: React.FC = () => {
  const [scanInput, setScanInput] = useState('');
  const [resolvedEntity, setResolvedEntity] = useState<{ entityType: string; data: any } | null>(null);
  const [scanHistory, setScanHistory] = useState<Array<{ time: string; input: string; entityType: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput.trim()) return;
    setError(null);

    try {
      const res = await api.resolveScan(scanInput.trim());
      setResolvedEntity(res);
      setScanHistory((prev) => [
        { time: new Date().toLocaleTimeString(), input: scanInput.trim(), entityType: res.entityType },
        ...prev.slice(0, 9),
      ]);
      setScanInput('');
    } catch (err: any) {
      setError(err.message || 'Scanned code not recognized');
    }
  };

  const triggerTestScan = (code: string) => {
    setScanInput(code);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
      {/* Scanner Input Panel */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Scan size={22} color="var(--accent-secondary)" />
          Hardware Wedge & Camera Scanner Terminal
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '20px' }}>
          This terminal is optimized for physical USB wedge barcode scanners, Bluetooth laser guns, or keyboard input.
        </p>

        <form onSubmit={handleScanSubmit}>
          <div className="form-group">
            <label className="form-label">Live Scanner Input Buffer (Auto-Focused)</label>
            <div style={{ position: 'relative' }}>
              <input
                id="scanner-active-input"
                ref={inputRef}
                type="text"
                placeholder="Ready for scan..."
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                className="form-input"
                style={{
                  width: '100%',
                  fontSize: '1.1rem',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '1px',
                  borderColor: 'var(--accent-secondary)',
                  boxShadow: 'var(--shadow-glow)',
                }}
              />
            </div>
          </div>
          <button id="btn-submit-scan" type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
            Process Scanned Token
          </button>
        </form>

        {/* Quick Simulator Buttons */}
        <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
            Simulate Hardware Scan Events:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <button
              onClick={() => triggerTestScan('lms:v1:m:mem_98a7c2b6f103e5a4')}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '6px 10px' }}
            >
              + Member Card QR
            </button>
            <button
              onClick={() => triggerTestScan('lms:v1:r:res_a1b2c3d4e5f6')}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '6px 10px' }}
            >
              + 24h Reservation QR
            </button>
            <button
              onClick={() => triggerTestScan('BC-100234')}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '6px 10px' }}
            >
              + Book Barcode (BC-100234)
            </button>
            <button
              onClick={() => triggerTestScan('RES-7492')}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '6px 10px' }}
            >
              + Fallback Code (RES-7492)
            </button>
          </div>
        </div>

        {error && (
          <div style={{ marginTop: '16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', padding: '12px', color: '#b91c1c', fontSize: '0.875rem' }}>
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Resolved Entity Details */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '16px' }}>Live Resolution Details</h3>

        {!resolvedEntity ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <QrCode size={48} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
            <p>Scan any barcode or QR code on the left to see entity verification here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
              <span className="badge badge-available">{resolvedEntity.entityType} DETECTED</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verified Authoritative</span>
            </div>

            {resolvedEntity.entityType === 'MEMBER' && (
              <div style={{ fontSize: '0.875rem', lineHeight: 1.8 }}>
                <div><strong>Patron Name:</strong> {resolvedEntity.data.name}</div>
                <div><strong>ID:</strong> {resolvedEntity.data.registrationNumber}</div>
                <div><strong>Email:</strong> {resolvedEntity.data.email}</div>
                <div><strong>Account Status:</strong> <span className="badge badge-available">{resolvedEntity.data.status}</span></div>
                <div><strong>Active Loans:</strong> {resolvedEntity.data.loans?.length || 0}</div>
              </div>
            )}

            {resolvedEntity.entityType === 'COPY' && (
              <div style={{ fontSize: '0.875rem', lineHeight: 1.8 }}>
                <div><strong>Title:</strong> {resolvedEntity.data.book?.title}</div>
                <div><strong>Barcode:</strong> <code style={{ color: '#0284c7', background: '#e0f2fe', padding: '2px 6px', borderRadius: '4px' }}>{resolvedEntity.data.barcode}</code></div>
                <div><strong>Status:</strong> <span className="badge badge-borrowed">{resolvedEntity.data.status}</span></div>
                <div><strong>Shelf Location:</strong> {resolvedEntity.data.shelfLocation}</div>
              </div>
            )}

            {resolvedEntity.entityType === 'RESERVATION' && (
              <div style={{ fontSize: '0.875rem', lineHeight: 1.8 }}>
                <div><strong>Book:</strong> {resolvedEntity.data.copy?.book?.title}</div>
                <div><strong>Patron:</strong> {resolvedEntity.data.user?.name} ({resolvedEntity.data.user?.registrationNumber})</div>
                <div><strong>Pickup Code:</strong> <strong style={{ color: '#d97706' }}>{resolvedEntity.data.pickupCode}</strong></div>
                <div><strong>Allocated Barcode:</strong> {resolvedEntity.data.copy?.barcode}</div>
                <div><strong>24h Expiry:</strong> {new Date(resolvedEntity.data.expiryDate).toLocaleString()}</div>
              </div>
            )}
          </div>
        )}

        {/* Scan History Log */}
        {scanHistory.length > 0 && (
          <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
              Recent Terminal Scans
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {scanHistory.map((h, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '6px 10px', borderRadius: '4px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{h.input}</span>
                  <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{h.entityType} ({h.time})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
