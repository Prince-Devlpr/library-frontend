# STATE MACHINES & TRANSITION INVARIANTS
## Library Management System (LMS)

---

## 1. Physical Book Copy State Machine (`CopyStatus`)

Every physical book copy exists in exactly one state at any time:

```
        ┌──────────────┐
        │  AVAILABLE   │ ◄─────────────────────────┐
        └──┬────────┬──┘                           │
           │        │                              │
Reserve    │        │ Walk-in Issue                │ Return / Expire
(Atomically)│        │ (No Res)                     │
           ▼        │                              │
     ┌───────────┐  │                              │
     │ RESERVED  │  │                              │
     └─────┬─────┘  │                              │
           │        │                              │
    Pickup │        │                              │
    Issue  │        │                              │
           ▼        ▼                              │
        ┌──────────────┐                           │
        │   BORROWED   ├───────────────────────────┘
        └──┬────────┬──┘
           │        │
  Report   │        │ Report
  Lost     │        │ Damage
           ▼        ▼
     ┌──────────┐ ┌──────────┐
     │   LOST   │ │ DAMAGED  │
     └──────────┘ └──────────┘
```

### Invariants:
1. `AVAILABLE → RESERVED`: Permitted only if status is strictly `AVAILABLE` and patron has no active reservation for this copy.
2. `RESERVED → BORROWED`: Permitted only when the borrowing patron matches the reservation holder. If attempted past 24 hours, rejected with `RESERVATION_EXPIRED`.
3. `AVAILABLE → BORROWED`: Permitted during walk-in borrowing only if no active reservation exists on the copy.
4. `BORROWED → AVAILABLE`: Permitted only by librarian confirming return.

---

## 2. Reservation State Machine (`ReservationStatus`)

```
               ┌──────────┐
               │  ACTIVE  │ (Strict 24h Deadline)
               └────┬─────┘
                    │
       ┌────────────┼────────────┐
       │            │            │
24h Expire      Counter      Patron
(Lazy/Job)      Pickup       Cancel
       │            │            │
       ▼            ▼            ▼
 ┌──────────┐ ┌───────────┐ ┌───────────┐
 │ EXPIRED  │ │ COLLECTED │ │ CANCELLED │
 └──────────┘ └───────────┘ └───────────┘
```

### Invariants:
1. An `ACTIVE` reservation allocates exactly one physical copy.
2. Transitions to `EXPIRED` or `CANCELLED` immediately restore the allocated copy's status to `AVAILABLE` within the same database transaction.
3. Transition to `COLLECTED` immediately transitions the copy to `BORROWED` and creates an active `Loan`.

---

## 3. Loan & Fine State Machine

```
   ┌──────────┐
   │  ACTIVE  │
   └────┬─────┘
        │
        ├──────────────────────┐
        │ Return on time       │ Due Date passes
        ▼                      ▼
  ┌──────────┐           ┌──────────┐
  │ RETURNED │           │ OVERDUE  │ (Fines accrue daily)
  └──────────┘           └────┬─────┘
                              │
                              │ Return & assess fine
                              ▼
                        ┌──────────┐
                        │ RETURNED │
                        │  (FINE   │
                        │ UNPAID)  │
                        └─────┬────┘
                              │
                    Razorpay / Counter Cash
                              │
                              ▼
                        ┌──────────┐
                        │ RETURNED │
                        │  (FINE   │
                        │  PAID)   │
                        └──────────┘
```
