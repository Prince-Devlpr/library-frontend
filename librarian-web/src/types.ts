export type Role = 'USER' | 'LIBRARIAN' | 'ADMINISTRATOR';
export type CopyStatus = 'AVAILABLE' | 'RESERVED' | 'BORROWED' | 'LOST' | 'DAMAGED';
export type LoanStatus = 'ACTIVE' | 'RETURNED' | 'OVERDUE';
export type ReservationStatus = 'ACTIVE' | 'COLLECTED' | 'CANCELLED' | 'EXPIRED';
export type PaymentStatus = 'PAID' | 'UNPAID';

export interface BookCopy {
  id: string;
  bookId: string;
  barcode: string;
  status: CopyStatus;
  shelfLocation: string;
  createdAt?: string;
  book?: Book;
}

export interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  category: string;
  publicationYear: number;
  description?: string;
  coverUrl?: string;
  copies?: BookCopy[];
  totalCopies?: number;
  availableCopies?: number;
}

export interface User {
  id: string;
  registrationNumber: string;
  name: string;
  email: string;
  phoneNumber?: string;
  role: Role;
  status: 'ACTIVE' | 'INACTIVE';
  cardQrToken?: string;
  loans?: Loan[];
  reservations?: Reservation[];
}

export interface Loan {
  id: string;
  userId: string;
  user?: User;
  copyId: string;
  copy: BookCopy;
  issueDate: string;
  dueDate: string;
  returnDate?: string | null;
  status: LoanStatus;
  fine?: Fine | null;
}

export interface Reservation {
  id: string;
  userId: string;
  user?: User;
  copyId: string;
  copy: BookCopy;
  qrToken?: string;
  pickupCode?: string;
  reservationDate: string;
  expiryDate: string;
  status: ReservationStatus;
  remainingMs?: number;
}

export interface Fine {
  id: string;
  loanId: string;
  amount: number | string;
  amountPaise: number;
  paymentStatus: PaymentStatus;
  paymentDate?: string | null;
  loan?: Loan;
}

export interface PaymentReceipt {
  receiptNumber: string;
  date: string;
  status: string;
  method: string;
  amountPaise: number;
  amountRupees: string;
  currency: string;
  patron: {
    id: string;
    name: string;
    registrationNumber: string;
    email: string;
  };
  transactionId: string;
  book: {
    title: string;
    author: string;
    isbn: string;
    barcode: string;
  };
}
