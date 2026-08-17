# 🇮🇳 Digital Personal Data Protection Act (DPDP) 2023 Compliance

This document outlines how Haspataal adheres to India's DPDP Act 2023 regarding the collection, processing, and erasure of personal data.

## SECTION 1 — Data Inventory & Classification

All data in Haspataal is classified based on its sensitivity and the required level of protection.

| Data Type | Fields | Classification |
| :--- | :--- | :--- |
| **Personal Data** | `name`, `phone`, `email`, `dateOfBirth`, `address`, `gender` | Personal Data |
| **Sensitive Data** | `appointmentHistory`, `medicalRecords`, `prescriptions`, `bloodGroup` | Sensitive Personal Data |
| **Non-personal** | `slotTimes`, `hospitalCapacity`, `departmentNames`, `agentCommissionRates` | Non-personal Data |

## SECTION 2 — Consent Implementation (Informed & Specific)

The DPDP Act mandates that personal data can only be processed for a **specified purpose** for which the Data Principal (Patient) has given **free, informed, and specific consent**.

### Implementation Details
- **Consent Model**: A dedicated `Consent` model in PostgreSQL tracks individual consent for specific purposes.
- **Purposes**: 
  - `APPOINTMENT_BOOKING`: Required to process name/phone for hospital visits.
  - `HEALTH_RECORDS`: Required for storing and retrieving prescriptions/history.
  - `MARKETING`: Optional for promotional updates.
- **Enforcement**: The `createVisit` use-case explicitly checks for an active `APPOINTMENT_BOOKING` consent before proceeding with a booking.

### Actions
- `recordConsent(patientId, purpose)`: Records a timestamped consent entry.
- `withdrawConsent(patientId, purpose)`: Marks a consent entry as withdrawn (timestamped).

## SECTION 3 — Right to Erasure (Data Deletion)

Data Principals have the right to have their personal data erased unless retention is required by law (e.g., medical record retention laws).

### Anonymization Strategy
When a deletion request is processed via `deletePatientData(patientId)`:
1. The `Patient` record is **anonymized**: Name, Phone, and Email are replaced with generic placeholders.
2. Identifiers like `abhaAddress` are nullified.
3. Appointments are marked as `CANCELLED` and audit logs are generated.
4. Access is restricted to `PLATFORM_ADMIN` to ensure regulatory oversight.

## SECTION 4 — Data Protection Officer (DPO) & Breach Notification

In accordance with Section 8(6) of the DPDP Act, Haspataal will notify the Data Protection Board and affected Data Principals in the event of a personal data breach.

- **Notification Timeline**: Within 72 hours of discovery.
- **Runbook**: See [Breach Response Runbook](./breach-response-runbook.md).
