import React, { useState, useEffect } from 'react';
import { adminApi } from '../api';
import type { User, Role } from '../types';
import { UserPlus, Search, UserCheck, Shield, BookOpen, CheckCircle2 } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // New User State
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    role: 'USER' as Role,
    password: '',
  });

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getUsers(searchTerm, selectedRole);
      setUsers(data);
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [selectedRole]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers();
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.createUser(newUser);
      setShowAddModal(false);
      setActionSuccess(`Account provisioned successfully for ${newUser.name}`);
      setTimeout(() => setActionSuccess(null), 4000);
      setNewUser({
        name: '',
        email: '',
        phoneNumber: '',
        role: 'USER',
        password: '',
      });
      loadUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to create account');
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await adminApi.toggleUserStatus(user.id, user.status);
      setActionSuccess(`Account status updated for ${user.name}`);
      setTimeout(() => setActionSuccess(null), 3000);
      loadUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'ADMINISTRATOR':
        return (
          <span className="badge badge-admin" style={{ fontSize: '0.6875rem' }}>
            <Shield size={12} /> Admin
          </span>
        );
      case 'LIBRARIAN':
        return (
          <span className="badge badge-borrowed" style={{ fontSize: '0.6875rem' }}>
            <UserCheck size={12} /> Librarian
          </span>
        );
      default:
        return (
          <span className="badge badge-available" style={{ fontSize: '0.6875rem' }}>
            <BookOpen size={12} /> Patron
          </span>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Account Provisioning & Access Control</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
            Manage patron memberships, staff privileges, and cryptographic login credentials.
          </p>
        </div>

        <button
          id="btn-add-account"
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
          style={{ padding: '10px 18px', fontSize: '0.875rem' }}
        >
          <UserPlus size={18} />
          Provision New Account
        </button>
      </div>

      {actionSuccess && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '12px 16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '8px', color: '#047857', fontSize: '0.875rem', fontWeight: 600 }}>
          <CheckCircle2 size={18} color="#059669" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="glass-panel" style={{ padding: '18px 22px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              id="input-user-search"
              type="text"
              placeholder="Search patrons or staff by name, email, registration ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ width: '100%', paddingLeft: '40px' }}
            />
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="form-input"
            style={{ width: '200px' }}
          >
            <option value="ALL">All Roles</option>
            <option value="USER">Patrons (Members)</option>
            <option value="LIBRARIAN">Librarians (Staff)</option>
            <option value="ADMINISTRATOR">Administrators</option>
          </select>
          <button type="submit" className="btn btn-secondary">
            Filter Accounts
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th>Member / Staff Name</th>
                <th>Registration ID</th>
                <th>Email Address</th>
                <th>Role</th>
                <th>Account Status</th>
                <th style={{ textAlign: 'right' }}>Security Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    Loading library user records...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No user accounts matched your search criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const userInitials = u.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
                  return (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '50%',
                              background: '#f1f5f9',
                              color: 'var(--text-primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '12px',
                              border: '1px solid #e2e8f0',
                            }}
                          >
                            {userInitials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</div>
                            {u.phoneNumber && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.phoneNumber}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                        <code style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', color: 'var(--accent-primary)', fontWeight: 600 }}>
                          {u.registrationNumber}
                        </code>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td>{getRoleBadge(u.role)}</td>
                      <td>
                        <span className={`badge ${u.status === 'ACTIVE' ? 'badge-available' : 'badge-overdue'}`}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: u.status === 'ACTIVE' ? '#10b981' : '#ef4444' }} />
                          {u.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`btn ${u.status === 'ACTIVE' ? 'btn-secondary' : 'btn-primary'}`}
                          style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                        >
                          {u.status === 'ACTIVE' ? 'Suspend Account' : 'Reactivate'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PROVISION ACCOUNT MODAL */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Provision Library Account</h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  Creates persistent record with Argon2id password hashing.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label className="form-label">Full Legal Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Vikramaditya Rathore"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    required
                    type="email"
                    placeholder="name@library.local"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98..."
                    value={newUser.phoneNumber}
                    onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">System Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as Role })}
                    className="form-input"
                  >
                    <option value="USER">Patron (Member App)</option>
                    <option value="LIBRARIAN">Librarian (Circulation Station)</option>
                    <option value="ADMINISTRATOR">Administrator (Superuser)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Initial Password</label>
                  <input
                    required
                    type="password"
                    placeholder="Min 8 characters"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Provision Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
