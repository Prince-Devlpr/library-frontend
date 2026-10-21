# QR CODE & BARCODE SPECIFICATION
## Library Management System (LMS)

---

## 1. QR Payload Format Standard

All system QR codes are versioned, typed, and opaque to prevent identifier enumeration or sensitive data exposure:

`lms:<version>:<typeCode>:<opaqueToken>`

| Type | Type Code | Example Payload | Description |
| :--- | :--- | :--- | :--- |
| **Member Card** | `m` | `lms:v1:m:mem_98a7c2b6f103e5a4` | Unique digital patron identity. Contains no PII. |
| **Reservation** | `r` | `lms:v1:r:res_a1b2c3d4e5f6` | 24-hour pickup claim token linked to allocated copy. |
| **Book Copy** | `c` | `lms:v1:c:BC-100234` | Physical copy accession barcode identifier. |
| **Cash Voucher** | `cash` | `lms:v1:cash:CASH-7492` | Fine settlement voucher for counter cash payment. |

---

## 2. Fallback Identifiers & Scanners

1. **Member Card Fallback:**
   - Patrons can quote their human-readable Registration Number (e.g. `MEM-2026-0042`) at the counter.
2. **Reservation Fallback:**
   - 6-character short code (e.g. `RES-7492`) rendered prominently beneath the QR code on the mobile app.
3. **Physical Copy Barcode:**
   - Human-readable barcode string (e.g. `BC-100234`) printed directly underneath the QR matrix on the book spine/cover label.

---

## 3. High-Velocity Scanner Resolution

The `/api/v1/qr/resolve` endpoint accepts both raw formatted QR payloads and raw barcode keyboard-wedge strings:
- Automatically detects entity type (`MEMBER`, `RESERVATION`, or `COPY`).
- Performs permission checks and returns live database state.
- Ensures zero double-issue even under rapid duplicate scans.
