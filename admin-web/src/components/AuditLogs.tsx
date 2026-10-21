import React, { useState, useEffect } from 'react';
import { adminApi } from '../api';
import type { AuditLog } from '../types';
import { Terminal } from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filterAction, setFilterAction] = useState('ALL');

  useEffect(() => {
    adminApi.getAuditLogs().then(setLogs);
  }, []);

  const filteredLogs = filterAction === 'ALL'
    ? logs
    : logs.filter((l) => l.action.includes(filterAction));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={20} color="var(--accent-secondary)" />
            Append-Only Security Audit Trail
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Authoritative, immutable event log for compliance, circulation events, and financial reconciliation.
          </p>
        </div>

        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="form-input"
          style={{ width: '240px' }}
        >
          <option value="ALL">All Event Types</option>
          <option value="POLICY">Policy Updates</option>
          <option value="PAYMENT">Payments & Fines</option>
          <option value="RESERVATION">Reservations</option>
          <option value="LOAN">Loans & Circulation</option>
        </select>
      </div>

      <div className="glass-panel" style={{ padding: '24px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '12px' }}>Timestamp</th>
              <th style={{ padding: '12px' }}>Action</th>
              <th style={{ padding: '12px' }}>Target Entity</th>
              <th style={{ padding: '12px' }}>Actor</th>
              <th style={{ padding: '12px' }}>IP Origin</th>
              <th style={{ padding: '12px' }}>Payload Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '14px 12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td style={{ padding: '14px 12px' }}>
                  <code style={{ color: '#c084fc', fontWeight: 600 }}>{log.action}</code>
                </td>
                <td style={{ padding: '14px 12px' }}>
                  <span className="badge badge-admin">{log.entityType}</span>
                </td>
                <td style={{ padding: '14px 12px' }}>
                  <div style={{ fontWeight: 600 }}>{log.user?.name || 'System Worker'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.user?.email || 'internal'}</div>
                </td>
                <td style={{ padding: '14px 12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  {log.ipAddress || '127.0.0.1'}
                </td>
                <td style={{ padding: '14px 12px' }}>
                  <pre style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {JSON.stringify(log.details)}
                  </pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
