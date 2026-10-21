# SECURITY ARCHITECTURE & POLICY
## Library Management System (LMS)

---

## 1. Authentication & Session Architecture

- **Password Hashing:** Argon2id with memory-hard parameters configured to resist GPU/ASIC rainbow table attacks.
- **Access Tokens:** Short-lived JWTs (15 minutes) carrying only essential claims (`userId`, `role`, `sessionId`).
- **Session Tracking & Inactivity:** Every session record in PostgreSQL tracks `lastActivityAt`. Requests made after 15 minutes of inactivity are terminated with `SESSION_REVOKED`.
- **Zero Secrets on Client:** Razorpay secret keys, webhook signing secrets, and Cloudinary API secrets are stored strictly in server-side environment variables.

---

## 2. Authorization & RBAC

All protected endpoints enforce backend role checks (`authorizeRoles`):
- `USER` (Patron): Can only browse catalog, reserve available books, view own loans/fines/receipts, and initiate Razorpay checkout for their own obligations.
- `LIBRARIAN`: Can issue and return books, manage inventory, generate copy labels, resolve counter scans, and record cash counter payments.
- `ADMINISTRATOR`: Full system access, dynamic policy updates, user/librarian provisioning, and immutable audit log browsing.

---

## 3. Financial & Integration Security

- **Razorpay Checkout:**
  - Order amounts are calculated and created strictly server-side in integer paise.
  - Client checkout returns `orderId`, `paymentId`, and `signature`.
  - Backend recalculates HMAC-SHA256 signature using `RAZORPAY_KEY_SECRET`. Payments are settled only upon cryptographic verification.
  - Webhooks verify raw request body signatures with duplicate delivery protection via `WebhookEvent` table.
- **Cloudinary Asset Uploads:**
  - Clients never hold upload credentials.
  - Backend issues short-lived cryptographic upload signatures (`generateUploadSignature`).
