# REST API SPECIFICATION
## Library Management System (API v1)
**Base URL:** `http://localhost:3000/api/v1`

---

## 1. Authentication & Sessions (`/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Public | Register new member patron |
| `POST` | `/auth/login` | Public | Authenticate with email/registration and password |
| `POST` | `/auth/refresh` | Public | Rotate refresh token and issue new access token |
| `POST` | `/auth/logout` | Authenticated | Revoke active session |
| `POST` | `/auth/change-password` | Authenticated | Change user password |

---

## 2. Book Catalog & Physical Copies (`/books`, `/book-copies`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/books` | Public / Auth | Search and paginate catalog titles |
| `GET` | `/books/:id` | Public / Auth | Get title details with copy availability breakdown |
| `POST` | `/books` | Staff | Add new book title to catalog (with coverUrl) |
| `PUT` | `/books/:id` | Staff | Update catalog title |
| `DELETE` | `/books/:id` | Admin | Soft-archive catalog title |
| `POST` | `/books/:bookId/copies` | Staff | Add individual physical copy |
| `POST` | `/books/:bookId/copies/batch` | Staff | Batch-generate multiple physical copies with barcodes |
| `GET` | `/book-copies/barcode/:barcode` | Staff | Retrieve physical copy by barcode sticker |

---

## 3. Circulation & Loans (`/loans`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/loans/issue` | Staff | Walk-in counter issue or verified reservation collection |
| `POST` | `/loans/return` | Staff | Return physical copy, inspect condition, calculate fines |
| `POST` | `/loans/:id/renew` | Member / Staff | Request loan renewal according to policy limits |
| `GET` | `/loans/my-loans` | Member | List current patron loans and due dates |
| `GET` | `/loans` | Staff | Query loans with filters (active, overdue, returned) |

---

## 4. Online Reservations (`/reservations`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/reservations` | Member | Atomically reserve available copy with 24h deadline & dual payment mode (`RAZORPAY` online or `CASH_COUNTER` on pickup) |
| `GET` | `/reservations` | Member / Staff | List user reservations or staff overview |
| `GET` | `/reservations/:id` | Member / Staff | Get reservation status, remaining time, and pickup code |
| `DELETE` | `/reservations/:id` | Member / Staff | Cancel reservation and release allocated physical copy |

---

## 5. Identification & QR System (`/qr`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/qr/member/card` | Member | Generate digital member card QR code & token |
| `POST` | `/qr/member/regenerate` | Member | Invalidate existing token and issue new card QR token |
| `GET` | `/qr/copy/:barcode` | Staff | Generate printable SVG/PNG QR label for physical copy |
| `GET` | `/qr/reservation/:id` | Member / Staff | Get reservation QR and countdown data |
| `POST` | `/qr/resolve` | Staff | High-velocity scanner resolve for member, copy, or reservation |

---

## 6. Fines & Dual Payments (`/fines`, `/payments`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/payments/gateway-status` | Public / Client | Check whether Razorpay online gateway is open/active |
| `GET` | `/fines/my-fines` | Member | List unpaid fines and overdue penalty details |
| `GET` | `/fines` | Staff | Circulation desk overview of outstanding fines |
| `POST` | `/payments/create-order` | Member | Create Razorpay order in paise for settling fine online |
| `POST` | `/payments/create-reservation-order` | Member | Create Razorpay order (2000 paise / ₹20) for online reservation hold deposit |
| `POST` | `/payments/verify` | Member | Verify Razorpay HMAC-SHA256 signature and settle fine |
| `POST` | `/payments/request-cash-slip` | Member | Generate digital cash slip voucher with QR for counter payment |
| `POST` | `/payments/counter` | Staff | Record/settle cash payment or cash slip voucher at circulation desk |
| `GET` | `/payments/receipt/:receiptNumber` | Member / Staff | Retrieve full audited digital receipt |

---

## 7. Cloudinary Upload Signatures (`/uploads`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/uploads/signature` | Staff | Generate signed parameters for secure direct book cover upload |

---

## 8. Governance & Administration (`/admin`, `/audit`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/admin/users` | Admin | Search and filter patrons, librarians, and admins |
| `POST` | `/admin/users` | Admin | Provision new staff or patron account |
| `GET` | `/admin/policy` | Admin / Staff | Read current borrowing limits, fine rates, 24h window |
| `PUT` | `/admin/policy` | Admin | Update library policies with audit logging |
| `GET` | `/admin/reports/circulation` | Admin | Executive metrics on circulation, fines, and revenue |
| `GET` | `/audit` | Admin | Query append-only security and circulation audit log |
