---
version: 2.0
owner: Haspataal Engineering
last_updated: 2026-08-04
status: Active
---

# Current Sprint: Phase 10 - Billing Engine

## Objective
Implement a billing system integrating with Laboratory, Radiology, and Pharmacy using the Financial Bounded Context orchestration pattern.

## Billing Architecture Rules
1. Billing never modifies clinical data.
2. Clinical modules never create invoices directly.
3. Only Billing owns invoice lifecycle.
4. All charges originate from immutable events.
5. Payments are append-only.
6. Never delete financial records (use adjustments/reversals).
7. Billing computations must be deterministic and reproducible from stored data (e.g., `Sum(ChargeItems) + Taxes - Discounts`).
8. Financial events are immutable. (Use Adjustment, Credit Note, Refund, Void, Reversal instead of Updates).

## Phase 10 Breakdown

### Phase 10A — Billing Core
- Billing domain package
- Invoice model
- ChargeItem model
- `BillingPublisher` consumer
- Billing state machine

### Phase 10B — Charge Generation
- Automatic billing events from: OPD Consultation, Laboratory, Radiology, Pharmacy, Procedures.

### Phase 10C — Cashier
- Cashier dashboard, Invoice review, Discounts, Refunds, Partial payments, Multiple payment methods.

### Phase 10D — Payment Engine
- Cash, UPI, Card, Insurance, Split payments.

### Phase 10E — Reports
- Daily collections, Doctor/Department revenue, Outstanding invoices, Financial audit trail.

## Definition of Done
- Must pass `npm run test` and `npm run lint`.
- Must include DB migrations for `Invoice` and `ChargeItem` entities.
- Must emit `BILL_GENERATED`.
- Must verify RLS scoping for multi-tenant isolation.
