# SYSTEM ARCHITECTURE SPECIFICATION
## Library Management System (LMS)

---

## 1. High-Level Architecture Overview

The system operates as a unified client-server architecture serving three role-specific interfaces through a shared Node.js/Express REST API and PostgreSQL database:

```
┌─────────────────────────────────┐   ┌─────────────────────────────────┐   ┌─────────────────────────────────┐
│        Patron Mobile App        │   │        Librarian Portal         │   │       Administrator Console     │
│         (Flutter / Dart)        │   │     (React + Vite + TS)         │   │      (React + Vite + TS)        │
└────────────────┬────────────────┘   └────────────────┬────────────────┘   └────────────────┬────────────────┘
                 │                                     │                                     │
                 └───────────────────────────────┬─────┴─────────────────────────────────────┘
                                                 │ HTTPS / JSON REST API (/api/v1)
                                                 ▼
                              ┌─────────────────────────────────────┐
                              │      Node.js / Express Backend      │
                              │ ─────────────────────────────────── │
                              │ • Argon2id Hashing & JWT Auth       │
                              │ • Strict RBAC & Inactivity Timeout  │
                              │ • Dual-Layer 24h Reservation Engine │
                              │ • Concurrency-Protected Circulation │
                              │ • Razorpay HMAC-SHA256 Verification │
                              │ • Cloudinary Signed Upload Manager  │
                              │ • Opaque QR Generation & Resolution │
                              └──────────────────┬──────────────────┘
                                                 │
                                                 │ Prisma ORM
                                                 ▼
                              ┌─────────────────────────────────────┐
                              │         PostgreSQL Database         │
                              │ ─────────────────────────────────── │
                              │ • Users & Multi-Session Tracking    │
                              │ • Books & Physical Copy Barcodes    │
                              │ • Active & Historic Circulation     │
                              │ • Strict 24h Reservation Deadlines  │
                              │ • Fines (Paise) & Payment Records   │
                              │ • Append-Only Audit Logging         │
                              └─────────────────────────────────────┘
```

---

## 2. Component Directory Structure

```
c:/library/
├── backend/                              # Shared Node.js/Express REST API
│   ├── prisma/                           # Schema definitions & migrations
│   ├── src/
│   │   ├── config/                       # DB singleton, logger, validated env
│   │   ├── middleware/                   # JWT auth, role authorization, validation
│   │   ├── modules/
│   │   │   ├── auth/                     # Authentication & password security
│   │   │   ├── books/                    # Catalog management & cover images
│   │   │   ├── book-copies/              # Physical copy lifecycles & barcodes
│   │   │   ├── loans/                    # Circulation (Issue, Return, Renew, Overdue)
│   │   │   ├── reservations/             # Strict 24h reservations & expiry
│   │   │   ├── fines/                    # Overdue calculation & penalties
│   │   │   ├── payments/                 # Razorpay checkout & Cash counter
│   │   │   ├── qr/                       # Opaque token generation & parsing
│   │   │   ├── uploads/                  # Signed Cloudinary asset signatures
│   │   │   ├── policies/                 # Dynamic system rules configuration
│   │   │   ├── reports/                  # Circulation & financial analytics
│   │   │   └── audit/                    # Immutable security audit log
│   │   └── server.ts                     # Server entrypoint
├── librarian-web/                        # Counter Circulation Portal
│   ├── src/components/
│   │   ├── CirculationDesk.tsx           # Walk-in issue, 24h pickup, book returns
│   │   ├── CatalogManager.tsx            # Title CRUD, copy inventory, QR label printing
│   │   ├── CounterPayments.tsx           # Cash settlements & digital receipts
│   │   └── ScannerTerminal.tsx           # Hardware wedge auto-focused scanning
├── admin-web/                            # Administrator Executive Console
│   ├── src/components/
│   │   ├── DashboardAnalytics.tsx        # Financial reconciliation & telemetry
│   │   ├── UserManagement.tsx            # Member/Librarian provisioning & status
│   │   ├── PolicyConfig.tsx              # Borrow limits, fine rates, 24h deadline
│   │   └── AuditLogs.tsx                 # System compliance & event streaming
├── member-app/                           # Flutter Patron Mobile App
│   ├── lib/main.dart                     # Explore catalog, 24h QR countdown, digital card, Razorpay
│   └── test/widget_test.dart             # Smoke & navigation tests
└── docs/                                 # Architectural specifications
```

---

## 3. Concurrency & Data Integrity Strategy

1. **Physical Copy Availability:**
   - Physical copies (`BookCopy`) are the single source of truth for inventory.
   - Status transitions (`AVAILABLE` → `RESERVED`, `AVAILABLE` → `BORROWED`, `RESERVED` → `BORROWED`, `BORROWED` → `AVAILABLE`) execute inside atomic database transactions (`prisma.$transaction`) with conditional updates (`updateMany({ where: { id, status: expected } })`).
   - If two patrons attempt to reserve or borrow the same copy simultaneously, exactly one transaction succeeds, and the other receives a `409 Conflict (BOOK_COPY_UNAVAILABLE)`.

2. **Strict 24-Hour Reservation Pickup Deadline:**
   - Authoritative expiry timestamp `expiryDate` is stored on creation (`Date.now() + 24 hours`).
   - Dual-layer enforcement:
     - **Lazy Evaluation:** Scans or issue attempts past the deadline automatically transition the reservation to `EXPIRED`, release the copy to `AVAILABLE`, and reject the pickup with `400 (RESERVATION_EXPIRED)`.
     - **Periodic Expiration Worker:** Background job periodically cleans uncollected records.

3. **Financial Consistency & Minor Units:**
   - All fine calculations, Razorpay orders, and payments are tracked in integer minor units (paise for INR).
   - Eliminates floating-point rounding errors and ensures 100% reconciliation with payment gateway logs.
