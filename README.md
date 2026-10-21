# Production-Ready Integrated Library Management System (LMS)

A complete, production-grade Library Management System featuring:
- **Shared Backend:** Node.js, Express, TypeScript, PostgreSQL, and Prisma ORM
- **Librarian Website:** React + Vite + TypeScript (Counter circulation, 24h pickup, label printing, counter payments)
- **Administrator Website:** React + Vite + TypeScript (Governance, dynamic policies, financial reconciliation, audit logs)
- **Member Mobile Application:** Flutter and Dart (Catalog discovery, 24h reservation QR with countdown, digital card QR, Razorpay checkout)
- **Integrations:** Razorpay fine payments (server-side HMAC verification) & Cloudinary book cover storage

---

## Repository Structure

```
c:/library/
├── backend/            # Express REST API (/api/v1) with Prisma ORM
├── librarian-web/      # Staff counter circulation portal
├── admin-web/          # Executive administrator governance console
├── member-app/         # Patron Flutter mobile application
└── docs/               # Comprehensive architectural & compliance specifications
    ├── GAP_ANALYSIS.md     # Initial state, delta audit & roadmap
    ├── DECISIONS.md        # Architectural decision records (ADRs)
    ├── ARCHITECTURE.md     # System design & concurrency guarantees
    ├── API.md              # REST API v1 endpoint specification
    ├── STATE_MACHINES.md   # Copy, reservation, and loan state transitions
    ├── QR_SPEC.md          # Opaque token format & scanner resolution
    ├── SECURITY.md         # Cryptographic standards & zero-secret policy
    ├── TESTING.md          # Test execution matrix & verification report
    └── DEPLOYMENT.md       # Local startup & environment setup guide
```

---

## Core Implemented Workflows

1. **Strict 24-Hour Reservation Pickup Deadline:**
   - Real-time atomic physical copy allocation.
   - Dual-layer expiration: server-side lazy check during pickup and background expiration worker.
   - Live 24-hour countdown and high-contrast QR display in mobile app.
2. **Walk-in Counter Borrowing:**
   - Scan member card QR or enter registration ID.
   - Scan physical book barcode with instant limit and eligibility verification.
   - Single-transaction loan creation and copy status update.
3. **QR Code & Barcode System:**
   - Opaque member digital card QR with token regeneration.
   - Individual physical copy QR labels with SVG print preview.
   - High-velocity scanner terminal supporting USB keyboard-wedge readers.
4. **Fines & Multi-Channel Payments:**
   - Server-side Razorpay order generation in integer paise.
   - Cryptographic HMAC-SHA256 signature verification.
   - Counter cash settlement with audited digital receipts.
5. **Security & Governance:**
   - Memory-hard Argon2id password hashing and short-lived JWT sessions.
   - Dynamic library policy configuration with append-only audit trail.
