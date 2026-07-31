## Context

The Clinical Orders Engine was recently stabilized, providing a unified `ClinicalOrder` model and lifecycle (ORDERED -> ACCEPTED -> IN_PROGRESS -> VERIFIED -> COMPLETED). The Laboratory module is the first major downstream consumer of this engine. It needs to manage the physical and digital lifecycle of laboratory samples, process results against predefined reference ranges, and notify doctors of critical results.

## Goals / Non-Goals

**Goals:**
- Implement `Sample` and `LabResult` models linking to `ClinicalOrder`.
- Build the UI for Lab Technicians and Pathologists (Worklist, Result Entry, Verification).
- Implement a Test Template system (e.g., CBC, LFT) to structure results.
- Trigger Timeline events for lab activities.
- Trigger critical value alerts when results fall outside reference ranges.

**Non-Goals:**
- Direct hardware integration (HL7/LIS interfaces with laboratory machines) - this will be a future phase.
- Advanced billing ledger entries (we will only trigger hooks, the actual billing engine will be separate).

## Decisions

- **Multiple Samples per Order:** A single `ClinicalOrder` can require multiple specimens (e.g. CBC + Urine Routine requires Blood and Urine samples). 
  - *Rationale*: Reflects real-world diagnostic workflows. `Sample` has a 1:N relationship with `ClinicalOrder`.
- **Structured Test Templates and Results:** We will implement structured models (`TestTemplateParameter` and `LabResultValue`) instead of JSON blobs.
  - *Rationale*: Vital for analytics, longitudinal trends, abnormal highlighting, and AI readiness. Each parameter tracks value, unit, reference range, and flags.
- **Sample State Machine:** Samples track their own granular state (`COLLECTION_PENDING` -> `COLLECTED` -> `ACCESSIONED` -> `PROCESSING` -> `COMPLETED`, plus `REJECTED`).
  - *Rationale*: Allows tracking individual specimen progress independently of the broader order.
- **Result State Machine:** Results track lifecycle through `DRAFT` -> `UNDER_REVIEW` -> `VERIFIED` -> `AMENDED`.
  - *Rationale*: Allows peer review before finalizing, and legal trace of amendments.
- **Reusable Critical Value Engine:** Critical value logic will be extracted into a `CriticalValueEngine` rather than hardcoding it in the use case.
  - *Rationale*: Future modules (Radiology, ICU monitoring) can reuse this decoupled rule engine. Alert dispatch remains asynchronous.

## Risks / Trade-offs

- [Risk] Structured parameters result in high database row counts (e.g., 20 rows per CBC).
  - *Mitigation*: Indexing on `labResultId` and `parameterId` ensures fast queries. The benefits for analytics outweigh the storage cost.
- [Risk] Synchronization between Sample state and ClinicalOrder state.
  - *Mitigation*: The Sample State Machine triggers `ClinicalOrder` state transitions implicitly when thresholds are met (e.g. all samples accessioned -> order IN_PROGRESS).
