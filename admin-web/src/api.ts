import type { User, LibraryPolicy, ReportMetrics, AuditLog } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://library-management-backend-cr47.onrender.com/api/v1';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('lms_admin_token') || localStorage.getItem('lms_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const adminApi = {
  async getMetrics(): Promise<ReportMetrics> {
    const res = await fetch(`${API_BASE_URL}/admin/reports/circulation`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.error?.message || 'Failed to fetch circulation metrics from backend');
    }
    const json = await res.json();
    const data = json.data || {};
    return {
      totalPatrons: data.totalPatrons ?? 0,
      activePatrons: data.activePatrons ?? 0,
      totalLibrarians: data.totalLibrarians ?? 0,
      totalTitles: data.totalTitles ?? 0,
      totalCopies: data.totalCopies ?? 0,
      activeLoans: data.activeLoans ?? (data.summary?.activeLoans ?? 0),
      overdueLoans: data.overdueLoans ?? (data.summary?.overdueLoans ?? 0),
      activeReservations: data.activeReservations ?? 0,
      totalFinesAssessedRupees: data.totalFinesAssessedRupees ?? 0,
      totalFinesCollectedRupees: data.totalFinesCollectedRupees ?? 0,
      razorpayVolumeRupees: data.razorpayVolumeRupees ?? 0,
      counterVolumeRupees: data.counterVolumeRupees ?? 0,
    };
  },

  async getUsers(search?: string, role?: string): Promise<User[]> {
    const params = new URLSearchParams();
    params.append('limit', '100');
    if (search) params.append('search', search);
    if (role && role !== 'ALL') params.append('role', role);

    const res = await fetch(`${API_BASE_URL}/admin/users?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.error?.message || 'Failed to fetch users from backend');
    }
    const json = await res.json();
    return json.data?.users || [];
  },

  async createUser(data: Partial<User> & { password?: string }): Promise<User> {
    const endpoint = data.role === 'LIBRARIAN' ? `${API_BASE_URL}/admin/librarians` : `${API_BASE_URL}/admin/users`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber || '+91 99999 88888',
        password: data.password || 'UserPassword123!',
        registrationNumber: data.registrationNumber,
      }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      throw new Error(json?.error?.message || 'Failed to create user on backend');
    }
    return json.data;
  },

  async toggleUserStatus(userId: string, currentStatus: string): Promise<User> {
    const endpoint = currentStatus === 'ACTIVE' ? 'deactivate' : 'activate';
    const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      throw new Error(json?.error?.message || `Failed to ${endpoint} user on backend`);
    }
    return json.data;
  },

  async getPolicy(): Promise<LibraryPolicy> {
    const res = await fetch(`${API_BASE_URL}/admin/policy`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.error?.message || 'Failed to fetch library policy from backend');
    }
    const json = await res.json();
    return json.data;
  },

  async updatePolicy(data: Partial<LibraryPolicy>): Promise<LibraryPolicy> {
    const res = await fetch(`${API_BASE_URL}/admin/policy`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      throw new Error(json?.error?.message || 'Failed to update policy on backend');
    }
    return json.data;
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch(`${API_BASE_URL}/audit?limit=100`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.error?.message || 'Failed to fetch audit logs from backend');
    }
    const json = await res.json();
    return json.data?.logs || [];
  },

  async login(identifier: string, password: string): Promise<{ user: User; accessToken: string }> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: identifier.trim(), password }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      throw new Error(json?.error?.message || 'Invalid administrator credentials');
    }
    if (json.data.user.role !== 'ADMINISTRATOR') {
      throw new Error('Access denied: Administrator privileges required.');
    }
    localStorage.setItem('lms_admin_token', json.data.accessToken);
    localStorage.setItem('lms_admin_user', JSON.stringify(json.data.user));
    return { user: json.data.user, accessToken: json.data.accessToken };
  },

  getCurrentUser(): User | null {
    try {
      const raw = localStorage.getItem('lms_admin_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  logout(): void {
    localStorage.removeItem('lms_admin_token');
    localStorage.removeItem('lms_admin_user');
  },
};

export const api = adminApi;
