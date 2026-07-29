# Proposal: Phase 5B.1 — Pharmacy Execution Engine

## 1. Description
This proposal introduces the **Pharmacy Execution Engine** (Phase 5B.1) for Haspataal. It is the first department execution workflow built on top of the Canonical Clinical Orders Engine (Phase 5A). The goal is to provide a robust, event-driven subsystem dedicated to the operational fulfillment of pharmaceutical orders.

## 2. Motivation
In Phase 5A, we established that a Canonical Order represents **clinical intent** and strictly does not track department fulfillment. We must now build the corresponding operational engine for the Pharmacy department so that pharmacists can actually process the intent and fulfill the medications.

The key features of Pharmacy Execution include:
1. **Prescription Verification**: Pharmacists can verify and approve the clinical intent before fulfillment.
2. **Stock Reservation**: Hard or soft reservation of inventory for pending orders.
3. **Dispensing Workflow**: Fulfilling the order, including partial dispensing (e.g., giving 5 tablets now and 5 later).
4. **Substitution Hooks**: Allowing the pharmacist to substitute a prescribed brand with a generic equivalent without altering the canonical intent (only linking the substitution).
5. **Medication Administration Records (MAR)**: For IPD contexts, tracking exactly when the dispensed medication is actually administered to the patient by nursing staff.

## 3. Success Metrics
* **Decoupling**: The core `Order` model remains completely isolated from the dispensing state.
* **Resilience**: The Pharmacy Execution Engine reconstructs its state safely via Phase 5A canonical outbox events.
* **Accuracy**: Zero cases of stock overselling due to uncoordinated concurrent dispensings.
* **Auditability**: Every verification, substitution, and dispense action is recorded immutably.

## 4. Scope
### In Scope
- Pharmacy Execution schema additions (`PharmacyExecution`, `PharmacyDispense`, `PharmacyDispenseItem`, `PharmacyStock`, `MAR`).
- Consumer relay processing `ORDER_REQUESTED`, `ORDER_AMENDED`, `ORDER_CANCELLED`.
- Pharmacist verification and substitution state machine.
- Partial and full dispensing workflows.
- API and business logic for MAR tracking.

### Out of Scope
- Complete Enterprise ERP / Inventory Replenishment purchasing flows (we will assume manual stock entry for now).
- Payment gateways (Billing engine belongs in a separate phase).
- Laboratory or Radiology executions.
