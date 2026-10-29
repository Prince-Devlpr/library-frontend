import React, { useState, useEffect } from 'react';
import { adminApi } from '../api';
import type { AuditLog } from '../types';
import { RefreshCw, FileText } from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filterAction, setFilterAction] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getAuditLogs();
      setLogs(data);
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = filterAction === 'ALL'
    ? logs
    : logs.filter((l) => l.action.includes(filterAction));

  const getActionBadgeColor = (action: string) => {
    if (action.includes('PAY') || action.includes('SETTLE')) return 'badge-available';
    if (action.includes('POLICY') || action.includes('UPDATE')) return 'badge-reserved';
    if (action.includes('RETURN') || action.includes('DAMAGE')) return 'badge-overdue';
    return 'badge-borrowed';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title & Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Append-Only Security Audit Trail</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
            Authoritative, cryptographically sequential event logs for compliance, staff actions, and payments.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="form-input"
            style={{ width: '220px' }}
          >
            <option value="ALL">All Event Streams</option>
            <option value="POLICY">Policy Modifications</option>
            <option value="PAYMENT">Fine Payments & Receipts</option>
            <option value="RESERVATION">Reservations</option>
            <option value="LOAN">Loan Issues & Returns</option>
          </select>

          <button
            onClick={fetchLogs}
            disabled={isLoading}
            className="btn btn-secondary"
            style={{ padding: '8px 14px' }}
          >
            <RefreshCw size={14} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th>Event Timestamp</th>
                <th>Security Action</th>
                <th>Entity Scope</th>
                <th>Actor Identity</th>
                <th>IP Origin</th>
                <th style={{ textAlign: 'right' }}>Payload Inspection</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    Streaming audit log trail...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No events found for the selected filter category.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap', fontSize: '0.8125rem' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td>
                      <span className={`badge ${getActionBadgeColor(log.action)}`} style={{ fontSize: '0.6875rem' }}>
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                        {log.entityType}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                        {log.user?.name || 'System Daemon'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {log.user?.email || 'automated-task'}
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="btn btn-secondary"
                        style={{ fontSize: '0.75rem', padding: '5px 10px', gap: '4px' }}
                      >
                        <FileText size={13} />
                        View JSON
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON Payload Inspection Modal */}
      {selectedLog && (
        <div className="modal-overlay" onClick={() => setSelectedLog(null)}>
          <div className="modal-content" style={{ padding: '28px', maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Audit Event Payload</h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {selectedLog.action} • {new Date(selectedLog.timestamp).toLocaleString()}
                </div>
              </div>
              <button onClick={() => setSelectedLog(null)} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                Close
              </button>
            </div>

            <div style={{ background: '#0f172a', color: '#f8fafc', padding: '16px', borderRadius: 'var(--radius-md)', maxHeight: '360px', overflowY: 'auto' }}>
              <pre style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', lineHeight: 1.5 }}>
                {JSON.stringify(selectedLog.details || {}, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
