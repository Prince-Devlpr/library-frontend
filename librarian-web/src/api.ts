import type { Book, BookCopy, User, Loan, Reservation, PaymentReceipt } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://library-management-backend-cr47.onrender.com/api/v1';

// Initial in-memory mock catalog & loans to ensure offline resilience
let mockBooks: Book[] = [
  {
    id: 'b-1',
    isbn: '978-0132350884',
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    publisher: 'Prentice Hall',
    category: 'Software Engineering',
    publicationYear: 2008,
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg',
    totalCopies: 3,
    availableCopies: 1,
    copies: [
      { id: 'c-101', bookId: 'b-1', barcode: 'CC-001', status: 'AVAILABLE', shelfLocation: 'CS-A1-01' },
      { id: 'c-102', bookId: 'b-1', barcode: 'CC-002', status: 'BORROWED', shelfLocation: 'CS-A1-02' },
      { id: 'c-103', bookId: 'b-1', barcode: 'CC-003', status: 'RESERVED', shelfLocation: 'CS-A1-03' },
    ],
  },
  {
    id: 'b-2',
    isbn: '978-0201633610',
    title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
    author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides',
    publisher: 'Addison-Wesley',
    category: 'Computer Science',
    publicationYear: 1994,
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780201633610-L.jpg',
    totalCopies: 2,
    availableCopies: 1,
    copies: [
      { id: 'c-201', bookId: 'b-2', barcode: 'DP-001', status: 'AVAILABLE', shelfLocation: 'CS-B2-01' },
      { id: 'c-202', bookId: 'b-2', barcode: 'DP-002', status: 'BORROWED', shelfLocation: 'CS-B2-02' },
    ],
  },
  {
    id: 'b-3',
    isbn: '978-1449373320',
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    publisher: "O'Reilly Media",
    category: 'Data Engineering',
    publicationYear: 2017,
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9781449373320-L.jpg',
    totalCopies: 2,
    availableCopies: 2,
    copies: [
      { id: 'c-301', bookId: 'b-3', barcode: 'DDIA-001', status: 'AVAILABLE', shelfLocation: 'DATA-C1-01' },
      { id: 'c-302', bookId: 'b-3', barcode: 'DDIA-002', status: 'AVAILABLE', shelfLocation: 'DATA-C1-02' },
    ],
  },
  {
    id: 'b-4',
    isbn: '978-0135957059',
    title: 'The Pragmatic Programmer: Your Journey To Mastery',
    author: 'David Thomas, Andrew Hunt',
    publisher: 'Addison-Wesley',
    category: 'Software Engineering',
    publicationYear: 2019,
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780135957059-L.jpg',
    totalCopies: 2,
    availableCopies: 2,
    copies: [
      { id: 'c-401', bookId: 'b-4', barcode: 'PP-001', status: 'AVAILABLE', shelfLocation: 'CS-D1-01' },
      { id: 'c-402', bookId: 'b-4', barcode: 'PP-002', status: 'AVAILABLE', shelfLocation: 'CS-D1-02' },
    ],
  },
  {
    id: 'b-5',
    isbn: '978-0262046305',
    title: 'Introduction to Algorithms (4th Edition)',
    author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein',
    publisher: 'MIT Press',
    category: 'Algorithms',
    publicationYear: 2022,
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780262046305-L.jpg',
    totalCopies: 2,
    availableCopies: 2,
    copies: [
      { id: 'c-501', bookId: 'b-5', barcode: 'ALGO-001', status: 'AVAILABLE', shelfLocation: 'ALGO-E1-01' },
      { id: 'c-502', bookId: 'b-5', barcode: 'BC-100234', status: 'AVAILABLE', shelfLocation: 'ALGO-E1-02' },
    ],
  },
  {
    id: 'b-6',
    isbn: '978-0262035613',
    title: 'Deep Learning',
    author: 'Ian Goodfellow, Yoshua Bengio, Aaron Courville',
    publisher: 'MIT Press',
    category: 'Artificial Intelligence',
    publicationYear: 2016,
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780262035613-L.jpg',
    totalCopies: 2,
    availableCopies: 2,
    copies: [
      { id: 'c-601', bookId: 'b-6', barcode: 'DL-001', status: 'AVAILABLE', shelfLocation: 'AI-F1-01' },
      { id: 'c-602', bookId: 'b-6', barcode: 'DL-002', status: 'AVAILABLE', shelfLocation: 'AI-F1-02' },
    ],
  },
  {
    id: 'b-7',
    isbn: '978-0735211292',
    title: 'Atomic Habits: An Easy & Proven Way to Build Good Habits',
    author: 'James Clear',
    publisher: 'Avery',
    category: 'Self-Improvement',
    publicationYear: 2018,
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg',
    totalCopies: 2,
    availableCopies: 2,
    copies: [
      { id: 'c-701', bookId: 'b-7', barcode: 'AH-001', status: 'AVAILABLE', shelfLocation: 'SELF-G1-01' },
      { id: 'c-702', bookId: 'b-7', barcode: 'AH-002', status: 'AVAILABLE', shelfLocation: 'SELF-G1-02' },
    ],
  },
  {
    id: 'b-8',
    isbn: '978-0857197689',
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    publisher: 'Harriman House',
    category: 'Finance',
    publicationYear: 2020,
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780857197689-L.jpg',
    totalCopies: 1,
    availableCopies: 1,
    copies: [
      { id: 'c-801', bookId: 'b-8', barcode: 'POM-001', status: 'AVAILABLE', shelfLocation: 'FIN-H1-01' },
    ],
  },
  {
    id: 'b-9',
    isbn: '978-0441172719',
    title: 'Dune',
    author: 'Frank Herbert',
    publisher: 'Chilton Books',
    category: 'Science Fiction',
    publicationYear: 1965,
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg',
    totalCopies: 1,
    availableCopies: 1,
    copies: [
      { id: 'c-901', bookId: 'b-9', barcode: 'DUNE-001', status: 'AVAILABLE', shelfLocation: 'SCI-I1-01' },
    ],
  },
  {
    id: 'b-10',
    isbn: '978-1451648539',
    title: 'Steve Jobs',
    author: 'Walter Isaacson',
    publisher: 'Simon & Schuster',
    category: 'Biography',
    publicationYear: 2011,
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9781451648539-L.jpg',
    totalCopies: 1,
    availableCopies: 1,
    copies: [
      { id: 'c-1001', bookId: 'b-10', barcode: 'JOBS-001', status: 'AVAILABLE', shelfLocation: 'BIO-J1-01' },
    ],
  },
];

let mockPatrons: User[] = [
  {
    id: 'u-1',
    registrationNumber: 'MEM-2026-0042',
    name: 'Prince Sharma',
    email: 'prince@library.local',
    phoneNumber: '+91 98765 43210',
    role: 'USER',
    status: 'ACTIVE',
    cardQrToken: 'mem_98a7c2b6f103e5a4',
  },
  {
    id: 'u-2',
    registrationNumber: 'MEM-2026-0089',
    name: 'Aanya Patel',
    email: 'aanya.p@college.edu',
    phoneNumber: '+91 98111 22233',
    role: 'USER',
    status: 'ACTIVE',
    cardQrToken: 'mem_55b3d9e8f7c1a0e2',
  },
];

let mockReservations: Reservation[] = [
  {
    id: 'res-101',
    userId: 'u-1',
    user: mockPatrons[0],
    copyId: 'c-102',
    copy: mockBooks[0].copies![1],
    qrToken: 'res_a1b2c3d4e5f6',
    pickupCode: 'RES-7492',
    reservationDate: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    expiryDate: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(), // 20 hours remaining
    status: 'ACTIVE',
  },
];

let mockLoans: Loan[] = [
  {
    id: 'ln-201',
    userId: 'u-2',
    user: mockPatrons[1],
    copyId: 'c-201',
    copy: mockBooks[1].copies![0],
    issueDate: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days overdue!
    status: 'OVERDUE',
    fine: {
      id: 'fn-301',
      loanId: 'ln-201',
      amount: 15.00,
      amountPaise: 1500,
      paymentStatus: 'UNPAID',
    },
  },
];

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
    try {
      const res = await fetch(`${API_BASE_URL}/books${search ? `?search=${encodeURIComponent(search)}` : ''}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        const books = Array.isArray(json.data) ? json.data : (json.data?.books || mockBooks);
        return books;
      }
    } catch {
      // Fallback to memory
    }
    if (!search) return mockBooks;
    const term = search.toLowerCase();
    return mockBooks.filter(
      (b) =>
        b.title.toLowerCase().includes(term) ||
        b.author.toLowerCase().includes(term) ||
        b.isbn.includes(term)
    );
  },

  async createBook(data: Partial<Book>): Promise<Book> {
    try {
      const token = localStorage.getItem('lms_token');
      const res = await fetch(`${API_BASE_URL}/books`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {}

    const newBook: Book = {
      id: `b-${Date.now()}`,
      isbn: data.isbn || '978-0000000000',
      title: data.title || 'Untitled Book',
      author: data.author || 'Unknown Author',
      publisher: data.publisher || 'Independent Press',
      category: data.category || 'General',
      publicationYear: data.publicationYear || new Date().getFullYear(),
      coverUrl: data.coverUrl,
      description: data.description,
      totalCopies: 0,
      availableCopies: 0,
      copies: [],
    };
    mockBooks.unshift(newBook);
    return newBook;
  },

  async addCopies(bookId: string, count: number, shelfLocation: string): Promise<BookCopy[]> {
    try {
      const token = localStorage.getItem('lms_token');
      const res = await fetch(`${API_BASE_URL}/books/${bookId}/copies/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ count, shelfLocation }),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {}

    const book = mockBooks.find((b) => b.id === bookId);
    if (!book) throw new Error('Book not found');
    const newCopies: BookCopy[] = [];
    for (let i = 0; i < count; i++) {
      const barcode = `BC-${Math.floor(100000 + Math.random() * 900000)}`;
      const copy: BookCopy = {
        id: `c-${Date.now()}-${i}`,
        bookId,
        barcode,
        status: 'AVAILABLE',
        shelfLocation,
      };
      book.copies = book.copies || [];
      book.copies.push(copy);
      newCopies.push(copy);
    }
    book.totalCopies = (book.totalCopies || 0) + count;
    book.availableCopies = (book.availableCopies || 0) + count;
    return newCopies;
  },

  // QR Label generation
  async getCopyQr(barcode: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/qr/copy/${barcode}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {}

    // In-browser fallback SVG QR renderer
    return {
      copy: { barcode, shelfLocation: 'CS-MAIN' },
      qr: {
        payload: `lms:v1:c:${barcode}`,
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="160" height="160"><rect width="100" height="100" fill="#ffffff"/><path d="M10 10h30v30h-30z M20 20h10v10h-10z M60 10h30v30h-30z M70 20h10v10h-10z M10 60h30v30h-30z M20 70h10v10h-10z M50 50h10v10h-10z M70 60h20v10h-20z M60 80h30v10h-30z" fill="#0f172a"/></svg>`,
      },
    };
  },

  // Counter Scanning & Entity Resolution
  async resolveScan(rawInput: string) {
    try {
      const token = localStorage.getItem('lms_token');
      const res = await fetch(`${API_BASE_URL}/qr/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ rawInput }),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {}

    const trimmed = rawInput.trim();
    // Patron check
    const patron = mockPatrons.find(
      (p) => p.registrationNumber === trimmed || p.cardQrToken === trimmed || trimmed.includes(p.cardQrToken || '___')
    );
    if (patron) return { entityType: 'MEMBER', data: patron };

    // Reservation check
    const reservation = mockReservations.find(
      (r) => r.pickupCode === trimmed || r.qrToken === trimmed || trimmed.includes(r.qrToken || '___')
    );
    if (reservation) return { entityType: 'RESERVATION', data: reservation };

    // Copy check
    for (const b of mockBooks) {
      const copy = b.copies?.find((c) => c.barcode === trimmed || trimmed.includes(c.barcode));
      if (copy) return { entityType: 'COPY', data: { ...copy, book: b } };
    }

    // Cash voucher check
    if (trimmed.includes('cash:') || trimmed.startsWith('CASH-')) {
      const voucherCode = trimmed.includes('cash:') ? trimmed.split('cash:')[1] : trimmed;
      const loanWithFine = mockLoans.find((l) => l.fine && l.fine.paymentStatus === 'UNPAID');
      return {
        entityType: 'CASH_VOUCHER',
        data: {
          voucherCode,
          amount: loanWithFine?.fine?.amount || 25.0,
          loanId: loanWithFine?.id || 'ln-demo',
          patron: loanWithFine?.user || mockPatrons[0],
          bookTitle: loanWithFine?.copy.book?.title || 'Clean Code',
          status: 'PENDING',
        },
      };
    }

    throw new Error('No entity matched the scanned code');
  },

  // Issue Book (Walk-in Counter)
  async issueWalkIn(userId: string, barcode: string): Promise<Loan> {
    try {
      const res = await fetch(`${API_BASE_URL}/loans/issue`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId, barcode }),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
      const errJson = await res.json().catch(() => null);
      if (errJson?.error?.message) {
        throw new Error(errJson.error.message);
      }
    } catch (e: any) {
      if (e.message && !e.message.includes('fetch') && !e.message.includes('Network')) {
        throw e;
      }
    }

    // Memory simulation fallback
    const patron = mockPatrons.find((p) => p.id === userId);
    let targetCopy: BookCopy | null = null;
    let targetBook: Book | null = null;

    for (const b of mockBooks) {
      const c = b.copies?.find((cp) => cp.barcode === barcode);
      if (c) {
        targetCopy = c;
        targetBook = b;
        break;
      }
    }

    if (!targetCopy || !targetBook) throw new Error('Physical copy not found');
    if (targetCopy.status !== 'AVAILABLE') throw new Error(`Copy is currently ${targetCopy.status}`);

    targetCopy.status = 'BORROWED';
    targetBook.availableCopies = Math.max(0, (targetBook.availableCopies || 1) - 1);

    const newLoan: Loan = {
      id: `ln-${Date.now()}`,
      userId,
      user: patron,
      copyId: targetCopy.id,
      copy: { ...targetCopy, book: targetBook },
      issueDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'ACTIVE',
    };
    mockLoans.unshift(newLoan);
    return newLoan;
  },

  // Fulfill Reservation Pickup
  async fulfillReservation(pickupCode: string, barcode: string): Promise<Loan> {
    try {
      // 1. Resolve reservation details to obtain patron userId
      const resolved = await this.resolveScan(pickupCode).catch(() => null);
      const reservation = resolved?.entityType === 'RESERVATION' ? resolved.data : null;
      const userId = reservation?.userId || reservation?.user?.id;

      if (userId) {
        const res = await fetch(`${API_BASE_URL}/loans/issue`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ userId, barcode }),
        });
        if (res.ok) {
          const json = await res.json();
          return json.data;
        }
        const errJson = await res.json().catch(() => null);
        if (errJson?.error?.message) {
          throw new Error(errJson.error.message);
        }
      }
    } catch (e: any) {
      if (e.message && !e.message.includes('fetch') && !e.message.includes('Network')) {
        throw e;
      }
    }

    const reservation = mockReservations.find(
      (r) => r.pickupCode === pickupCode || r.qrToken === pickupCode
    );
    if (!reservation) throw new Error('Reservation not found');
    if (reservation.status !== 'ACTIVE') throw new Error(`Reservation is already ${reservation.status}`);
    
    // Check 24-hour expiration deadline
    if (Date.now() > new Date(reservation.expiryDate).getTime()) {
      reservation.status = 'EXPIRED';
      reservation.copy.status = 'AVAILABLE';
      throw new Error('Reservation has expired past the 24-hour collection deadline.');
    }

    if (reservation.copy.barcode !== barcode) {
      throw new Error(`Scanned copy (${barcode}) does not match the copy reserved (${reservation.copy.barcode})`);
    }

    reservation.status = 'COLLECTED';
    reservation.copy.status = 'BORROWED';

    const newLoan: Loan = {
      id: `ln-${Date.now()}`,
      userId: reservation.userId,
      user: reservation.user,
      copyId: reservation.copyId,
      copy: reservation.copy,
      issueDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'ACTIVE',
    };
    mockLoans.unshift(newLoan);
    return newLoan;
  },

  // Return Book
  async returnBook(barcode: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/loans/return`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ barcode }),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
      const errJson = await res.json().catch(() => null);
      if (errJson?.error?.message) {
        throw new Error(errJson.error.message);
      }
    } catch (e: any) {
      if (e.message && !e.message.includes('fetch') && !e.message.includes('Network')) {
        throw e;
      }
    }

    const loan = mockLoans.find((l) => l.copy.barcode === barcode && l.status !== 'RETURNED');
    if (!loan) throw new Error(`No active loan found for barcode: ${barcode}`);

    const now = new Date();
    loan.returnDate = now.toISOString();
    loan.status = 'RETURNED';
    loan.copy.status = 'AVAILABLE';

    // Find parent book and increment available count
    const book = mockBooks.find((b) => b.id === loan.copy.bookId);
    if (book) {
      book.availableCopies = (book.availableCopies || 0) + 1;
      const cp = book.copies?.find((c) => c.barcode === barcode);
      if (cp) cp.status = 'AVAILABLE';
    }

    // Check overdue
    const isOverdue = now.getTime() > new Date(loan.dueDate).getTime();
    let fineAmount = 0;
    if (isOverdue) {
      const days = Math.ceil((now.getTime() - new Date(loan.dueDate).getTime()) / (1000 * 60 * 60 * 24));
      fineAmount = days * 5.00;
      loan.fine = {
        id: `fn-${Date.now()}`,
        loanId: loan.id,
        amount: fineAmount,
        amountPaise: fineAmount * 100,
        paymentStatus: 'UNPAID',
      };
    }

    return {
      loan,
      isOverdue,
      fineAmount,
    };
  },

  // Record Counter Cash Payment
  async recordCashPayment(fineId: string, _notes?: string): Promise<PaymentReceipt> {
    const loan = mockLoans.find((l) => l.fine?.id === fineId);
    if (!loan || !loan.fine) throw new Error('Fine record not found');

    loan.fine.paymentStatus = 'PAID';
    loan.fine.paymentDate = new Date().toISOString();

    const receipt: PaymentReceipt = {
      receiptNumber: `REC-${new Date().toISOString().slice(0, 7).replace('-', '')}-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString(),
      status: 'SUCCESS',
      method: 'CASH_COUNTER',
      amountPaise: loan.fine.amountPaise,
      amountRupees: (loan.fine.amountPaise / 100).toFixed(2),
      currency: 'INR',
      patron: {
        id: loan.user?.id || 'u-1',
        name: loan.user?.name || 'Patron',
        registrationNumber: loan.user?.registrationNumber || 'MEM-2026',
        email: loan.user?.email || 'patron@library.local',
      },
      transactionId: `cash_${Date.now()}`,
      book: {
        title: loan.copy.book?.title || 'Book',
        author: loan.copy.book?.author || 'Author',
        isbn: loan.copy.book?.isbn || 'ISBN',
        barcode: loan.copy.barcode,
      },
    };

    return receipt;
  },

  async getFines(): Promise<Loan[]> {
    return mockLoans.filter((l) => l.fine !== undefined && l.fine !== null);
  },

  async getReservations(): Promise<Reservation[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/reservations?limit=50`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        const data = Array.isArray(json.data) ? json.data : (json.data?.reservations || []);
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch {}
    return mockReservations;
  },

  async login(identifier: string, password: string): Promise<{ user: User; accessToken: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          localStorage.setItem('lms_token', json.data.accessToken);
          localStorage.setItem('lms_user', JSON.stringify(json.data.user));
          return { user: json.data.user, accessToken: json.data.accessToken };
        }
      }
      const errJson = await res.json().catch(() => null);
      if (errJson?.error?.message) {
        throw new Error(errJson.error.message);
      }
    } catch (e: any) {
      if (e.message && !e.message.includes('fetch') && !e.message.includes('Network')) {
        throw e;
      }
    }

    // Offline / Demo Fallback Mode
    if (identifier.toLowerCase().includes('admin') || password === 'Admin@123') {
      const demoAdmin: User = {
        id: '4ff188c5-62c1-4a8a-ae26-df8763e476fb',
        registrationNumber: 'ADM-001',
        name: 'System Administrator',
        email: 'admin@library.com',
        role: 'ADMINISTRATOR',
        status: 'ACTIVE',
      };
      localStorage.setItem('lms_token', 'demo_admin_jwt_token');
      localStorage.setItem('lms_user', JSON.stringify(demoAdmin));
      return { user: demoAdmin, accessToken: 'demo_admin_jwt_token' };
    }

    const demoLibrarian: User = {
      id: '3be6e073-fcb3-450a-9c1e-78f5aefbef53',
      registrationNumber: 'LIB-001',
      name: 'Eleanor Vance (Chief Librarian)',
      email: identifier || 'librarian@library.com',
      role: 'LIBRARIAN',
      status: 'ACTIVE',
    };
    localStorage.setItem('lms_token', 'demo_librarian_jwt_token');
    localStorage.setItem('lms_user', JSON.stringify(demoLibrarian));
    return { user: demoLibrarian, accessToken: 'demo_librarian_jwt_token' };
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
