# ARCHITECTURAL DECISIONS LOG (ADR)
## Library Management System (LMS)

---

### ADR 001: Preservation & Extension of Node.js/TypeScript/Prisma Backend
- **Context:** The existing backend is written in TypeScript using Express, PostgreSQL, and Prisma ORM. It has established patterns for error handling, validation with Zod, and database transactions for concurrency.
- **Decision:** Retain the existing backend stack. Enhance it by adding missing models (`Payment`, `WebhookEvent`), fields (`coverUrl`, `cardQrToken`, `qrToken`, `issuedById`, `returnedById`), and services (`RazorpayService`, `CloudinaryService`, `QrService`).
- **Justification:** Avoids rewriting tested business rules and models while delivering full adherence to P0 requirements.

---

### ADR 002: Strict 24-Hour Reservation Expiry with Dual-Layer Enforcement
- **Context:** P0 requires that book reservations expire exactly 24 hours after creation, returning the allocated copy to `AVAILABLE` status. Relying only on a periodic cron job introduces a race condition where a patron could attempt pickup after 24 hours if the cron had delayed.
- **Decision:** Implement dual-layer enforcement:
  1. **Lazy Server-Side Check:** At the exact moment a librarian scans or looks up a reservation for pickup, the backend inspects `expiryDate`. If `now > expiryDate`, the reservation is automatically marked `EXPIRED`, the copy is set back to `AVAILABLE`, and the pickup is rejected with `RESERVATION_EXPIRED`.
  2. **Scheduled Worker:** A lightweight scheduled job runs periodically to expire uncollected reservations in bulk and emit notification events.
- **Justification:** Guarantees zero stale collections regardless of worker availability or cron drift.

---

### ADR 003: Monetary Integrity & Razorpay Integration Design
- **Context:** Master implementation prompt requires integer minor units (paise for INR) to prevent floating-point rounding errors and ensure 100% compatibility with Razorpay checkout and webhooks.
- **Decision:** Store fine amounts and payments with explicit integer paise calculations (`amountPaise`). All interactions with Razorpay (`orders.create`, webhook signatures, settlements) operate in paise. For legacy decimal compatibility, helper converters `paiseToRupees` and `rupeesToPaise` are standardized across the API.
- **Justification:** Eliminates precision loss, ensures idempotency on webhook deliveries, and guarantees accurate financial reporting.

---

### ADR 004: Decoupled Multi-Role Web Portals (Admin & Librarian)
- **Context:** Administrators and Librarians perform completely distinct duties: Librarians need high-velocity counter operations (scanning, quick loan/return, label generation), while Administrators need strategic oversight (user audits, dynamic policy adjustment, financial reconciliation, and analytics).
- **Decision:** Build two dedicated React + Vite + TypeScript web applications (`admin-web` and `librarian-web`) sharing a unified design system and API contract.
- **Justification:** Keeps counter staff focused on rapid operational workflows without clutter, while isolating sensitive administrative privileges.

---

### ADR 005: Member Mobile Application Architecture (Flutter)
- **Context:** Patrons interact with the library predominantly through their mobile devices to browse books, reserve titles, display library-card QR codes, and pay fines.
- **Decision:** Deliver a clean Flutter application with GoRouter, Dio HTTP client with secure token storage, and dedicated screens for Catalog, Reservation QR with 24-hour countdown, Digital Card QR, Active Loans, and Razorpay Checkout.
- **Justification:** Delivers a cross-platform mobile experience meeting all SRS user stories.
