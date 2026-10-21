export type Role = 'USER' | 'LIBRARIAN' | 'ADMINISTRATOR';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface User {
  id: string;
  registrationNumber: string;
  name: string;
  email: string;
  phoneNumber?: string;
  role: Role;
  status: UserStatus;
  registrationDate: string;
}

export interface LibraryPolicy {
  id?: string;
  borrowLimit: number;
  loanDuration: number;
  reservationPeriod: number;
  finePerDay: number | string;
  maxRenewals: number;
  updatedAt?: string;
}

export interface ReportMetrics {
  totalPatrons: number;
  activePatrons: number;
  totalLibrarians: number;
  totalTitles: number;
  totalCopies: number;
  activeLoans: number;
  overdueLoans: number;
  activeReservations: number;
  totalFinesAssessedRupees: number;
  totalFinesCollectedRupees: number;
  razorpayVolumeRupees: number;
  counterVolumeRupees: number;
}

export interface AuditLog {
  id: string;
  userId?: string;
  user?: { name: string; email: string };
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, any>;
  timestamp: string;
  ipAddress?: string;
}
