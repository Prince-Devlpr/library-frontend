import React, { useState, useEffect } from 'react';
import { adminApi } from '../api';
import type { User, Role } from '../types';
import { UserPlus, Search } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // New User State
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    role: 'USER' as Role,
    password: '',
  });

  const loadUsers = async () => {
    const data = await adminApi.getUsers(searchTerm, selectedRole);
    setUsers(data);
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
    await adminApi.createUser(newUser);
    setShowAddModal(false);
    setNewUser({
      name: '',
      email: '',
      phoneNumber: '',
      role: 'USER',
      password: '',
    });
    loadUsers();
  };

  const handleToggleStatus = async (user: User) => {
    await adminApi.toggleUserStatus(user.id, user.status);
    loadUsers();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Search & Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', flex: 1, maxWidth: '600px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              id="input-user-search"
              type="text"
              placeholder="Search patrons or staff by name, email, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ width: '100%', paddingLeft: '38px' }}
            />
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="form-input"
            style={{ width: '180px' }}
          >
            <option value="ALL">All Roles</option>
            <option value="USER">Patrons (Members)</option>
            <option value="LIBRARIAN">Librarians</option>
            <option value="ADMINISTRATOR">Administrators</option>
          </select>
          <button type="submit" className="btn btn-secondary">
            Filter
          </button>
        </form>

        <button
          id="btn-add-account"
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
        >
          <UserPlus size={18} />
          Provision Account
        </button>
      </div>

      {/* Users Table */}
      <div className="glass-panel" style={{ padding: '24px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '12px' }}>Member / Staff Name</th>
              <th style={{ padding: '12px' }}>Registration ID</th>
              <th style={{ padding: '12px' }}>Email Address</th>
              <th style={{ padding: '12px' }}>Role</th>
              <th style={{ padding: '12px' }}>Account Status</th>
              <th style={{ padding: '12px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '14px 12px', fontWeight: 600 }}>{u.name}</td>
                <td style={{ padding: '14px 12px', fontFamily: 'var(--font-mono)' }}>{u.registrationNumber}</td>
                <td style={{ padding: '14px 12px', color: 'var(--text-secondary)' }}>{u.email}</td>
                <td style={{ padding: '14px 12px' }}>
                  <span className={`badge badge-${u.role.toLowerCase()}`}>{u.role}</span>
                </td>
                <td style={{ padding: '14px 12px' }}>
                  <span className={`badge ${u.status === 'ACTIVE' ? 'badge-active' : 'badge-inactive'}`}>
                    {u.status}
                  </span>
                </td>
                <td style={{ padding: '14px 12px' }}>
                  <button
                    onClick={() => handleToggleStatus(u)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '6px 10px' }}
                  >
                    {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PROVISION ACCOUNT MODAL */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '28px' }}>
            <h3 style={{ marginBottom: '18px' }}>Provision New Library Account</h3>
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
                    <option value="USER">Patron (Member App Access)</option>
                    <option value="LIBRARIAN">Librarian (Counter Station Access)</option>
                    <option value="ADMINISTRATOR">Administrator (Full Access)</option>
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
