import type { Book, BookCopy, User, Loan, Reservation, PaymentReceipt } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://library-management-backend-cr47.onrender.com/api/v1';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('lms_token') || localStorage.getItem('lms_admin_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const api = {
  // Books & Catalog
  async getBooks(search?: string): Promise<Book[]> {
    const url = `${API_BASE_URL}/books?limit=100${search ? `&search=${encodeURIComponent(search)}` : ''}`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.error?.message || 'Failed to fetch catalog from backend');
    }
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : (json.data?.books || []);
  },

  async createBook(data: Partial<Book>): Promise<Book> {
    const res = await fetch(`${API_BASE_URL}/books`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      throw new Error(json?.error?.message || 'Failed to create title on backend');
    }
    return json.data;
  },

  async updateBook(bookId: string, data: Partial<Book>): Promise<Book> {
    const res = await fetch(`${API_BASE_URL}/books/${bookId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      throw new Error(json?.error?.message || 'Failed to update book on backend');
    }
    return json.data;
  },

  async uploadImage(base64DataUri: string): Promise<{ url: string; publicId?: string | null }> {
    const res = await fetch(`${API_BASE_URL}/uploads/image`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ image: base64DataUri }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      throw new Error(json?.error?.message || 'Failed to upload photo to server');
    }
    return json.data;
  },

  async addCopies(bookId: string, count: number, shelfLocation: string): Promise<BookCopy[]> {
    const newCopies: BookCopy[] = [];
    for (let i = 0; i < count; i++) {
      const barcode = `BC-${Math.floor(100000 + Math.random() * 900000)}`;
      const res = await fetch(`${API_BASE_URL}/books/${bookId}/copies`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ barcode, shelfLocation, status: 'AVAILABLE' }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.error?.message || `Failed to create copy #${i + 1} on backend`);
      }
      newCopies.push(json.data);
    }
    return newCopies;
  },

  // QR Label generation
  async getCopyQr(barcode: string) {
    const res = await fetch(`${API_BASE_URL}/qr/copy/${barcode}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.error?.message || 'Failed to generate QR label');
    }
    const json = await res.json();
    return json.data;
  },

  // Counter Scanning & Entity Resolution
  async resolveScan(rawInput: string) {
    const token = localStorage.getItem('lms_token') || localStorage.getItem('lms_admin_token');
    const res = await fetch(`${API_BASE_URL}/qr/resolve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ rawInput: rawInput.trim() }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      throw new Error(json?.error?.message || 'No entity matched the scanned code');
    }
    return json.data;
  },

  // Issue Book (Walk-in Counter)
  async issueWalkIn(userId: string, barcode: string): Promise<Loan> {
    const res = await fetch(`${API_BASE_URL}/loans/issue`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId, barcode: barcode.trim() }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      throw new Error(json?.error?.message || 'Failed to issue loan on backend');
    }
    return json.data;
  },

  // Fulfill Reservation Pickup
  async fulfillReservation(pickupCode: string, barcode: string): Promise<Loan> {
    // 1. Resolve reservation details to obtain patron userId
    const resolved = await this.resolveScan(pickupCode);
    if (resolved?.entityType !== 'RESERVATION' || !resolved?.data) {
      throw new Error('Scanned pickup code is not a valid reservation');
    }
    const reservation = resolved.data;
    const userId = reservation.userId || reservation.user?.id;
    if (!userId) {
      throw new Error('Reservation record does not contain an associated patron ID');
    }

    const res = await fetch(`${API_BASE_URL}/loans/issue`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId, barcode: barcode.trim() }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      throw new Error(json?.error?.message || 'Failed to fulfill reservation on backend');
    }
    return json.data;
  },

  // Return Book
  async returnBook(barcode: string) {
    const res = await fetch(`${API_BASE_URL}/loans/return`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ barcode: barcode.trim() }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      throw new Error(json?.error?.message || 'Failed to process return on backend');
    }
    const raw = json.data;
    const loan = {
      ...raw,
      copy: raw.copy || { barcode: raw.barcode, book: { title: raw.bookTitle || 'Library Book' } },
      user: raw.user || { name: raw.user?.name || 'Patron' },
    };
    const isOverdue = (raw.overdueDays && raw.overdueDays > 0) || (raw.fine && Number(raw.fine.amount) > 0) || raw.status === 'OVERDUE';
    const fineAmount = raw.fine ? Number(raw.fine.amount) : 0;
    return {
      loan,
      isOverdue,
      fineAmount,
    };
  },

  // Record Counter Cash Payment
  async recordCashPayment(fineId: string, _notes?: string): Promise<PaymentReceipt> {
    const res = await fetch(`${API_BASE_URL}/fines/${fineId}/payment`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      throw new Error(json?.error?.message || 'Failed to record cash payment on backend');
    }
    const f = json.data;
    const receipt: PaymentReceipt = {
      receiptNumber: `REC-${new Date().toISOString().slice(0, 7).replace('-', '')}-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString(),
      status: 'SUCCESS',
      method: 'CASH_COUNTER',
      amountPaise: f.amountPaise || Math.round((Number(f.amount) || 0) * 100),
      amountRupees: (Number(f.amount) || (f.amountPaise ? f.amountPaise / 100 : 0)).toFixed(2),
      currency: 'INR',
      patron: {
        id: f.loan?.user?.id || 'u-patron',
        name: f.loan?.user?.name || 'Patron',
        registrationNumber: f.loan?.user?.registrationNumber || 'MEM-2026',
        email: f.loan?.user?.email || 'patron@library.local',
      },
      transactionId: `cash_${Date.now()}`,
      book: {
        title: f.loan?.copy?.book?.title || 'Book',
        author: f.loan?.copy?.book?.author || 'Author',
        isbn: f.loan?.copy?.book?.isbn || 'ISBN',
        barcode: f.loan?.copy?.barcode || 'BC-000',
      },
    };
    return receipt;
  },

  async getFines(): Promise<Loan[]> {
    const res = await fetch(`${API_BASE_URL}/fines?limit=100`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.error?.message || 'Failed to fetch fine records from backend');
    }
    const json = await res.json();
    const finesList = Array.isArray(json.data) ? json.data : (json.data?.fines || []);
    if (!Array.isArray(finesList)) return [];

    return finesList.map((f: any) => ({
      id: f.loan?.id || f.loanId || f.id,
      userId: f.loan?.user?.id || '',
      user: f.loan?.user || { name: 'Patron', registrationNumber: 'MEM-2026' },
      copyId: f.loan?.copy?.id || '',
      copy: f.loan?.copy || { barcode: 'BC-N/A', book: { title: 'Library Book' } },
      issueDate: f.loan?.issueDate || new Date().toISOString(),
      dueDate: f.loan?.dueDate || new Date().toISOString(),
      status: f.loan?.status || 'OVERDUE',
      fine: {
        id: f.id,
        loanId: f.loanId || f.id,
        amount: Number(f.amount) || (f.amountPaise ? f.amountPaise / 100 : 0),
        amountPaise: f.amountPaise || Math.round((Number(f.amount) || 0) * 100),
        paymentStatus: f.paymentStatus || 'UNPAID',
        paymentDate: f.paymentDate,
      },
    }));
  },

  async getReservations(): Promise<Reservation[]> {
    const res = await fetch(`${API_BASE_URL}/reservations?limit=100`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.error?.message || 'Failed to fetch reservations from backend');
    }
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : (json.data?.reservations || []);
  },

  async login(identifier: string, password: string): Promise<{ user: User; accessToken: string }> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: identifier.trim(), password }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      throw new Error(json?.error?.message || 'Invalid librarian credentials');
    }
    if (json.data.user.role !== 'LIBRARIAN' && json.data.user.role !== 'ADMINISTRATOR') {
      throw new Error('Access denied: Staff privileges (Librarian/Admin) required.');
    }
    localStorage.setItem('lms_token', json.data.accessToken);
    localStorage.setItem('lms_user', JSON.stringify(json.data.user));
    return { user: json.data.user, accessToken: json.data.accessToken };
  },

  getCurrentUser(): User | null {
    try {
      const raw = localStorage.getItem('lms_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  logout(): void {
    localStorage.removeItem('lms_token');
    localStorage.removeItem('lms_user');
  },
};
