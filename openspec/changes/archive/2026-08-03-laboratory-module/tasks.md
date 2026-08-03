## 1. Schema & Database Updates

- [x] 1.1 Create `Sample` model linking to `ClinicalOrder` with 1:N relationship
- [x] 1.2 Create structured `TestTemplate` and `TestTemplateParameter` models
- [x] 1.3 Create structured `LabResult` and `LabResultValue` models
- [x] 1.4 Generate and apply Prisma migrations

## 2. Laboratory Package Initialization (Domain Structure)

- [x] 2.1 Initialize new `@haspataal/laboratory` workspace package
- [x] 2.2 Create domain structure (`domain/entities`, `domain/state-machine`, `use-cases`)
- [x] 2.3 Implement `SampleStateMachine` and `ResultStateMachine` with expanded transitions
- [x] 2.4 Seed default test templates (CBC, LFT) with structured parameters

## 3. Sample Lifecycle Engine

- [x] 3.1 Implement use cases for sample flow (`CollectSampleUseCase`, `AccessionSampleUseCase`)
- [x] 3.2 Ensure multiple samples correctly trigger `ClinicalOrder` transition to IN_PROGRESS

## 4. Result Entry & Verification

- [x] 4.1 Implement `EnterResultUseCase` allowing draft saves of structured values
- [x] 4.2 Build `CriticalValueEngine` to evaluate results independently
- [x] 4.3 Implement `VerifyResultUseCase` and `AmendResultUseCase` integrating the CriticalValueEngine

## 5. Timeline & Billing Hooks

- [x] 5.1 Register expanded events (`LAB_ORDER_ACCEPTED`, `SAMPLE_COLLECTED`, `SAMPLE_REJECTED`, `RESULT_ENTERED`, `RESULT_VERIFIED`, `RESULT_AMENDED`, `CRITICAL_VALUE_DETECTED`)
- [x] 5.2 Implement abstract billing hook for when a result is verified

## 6. UI Implementation (Dashboard)

- [x] 6.1 Build Laboratory Dashboard mirrored around workflow (Pending Collection -> Collected -> Accessioned -> Processing -> Awaiting Verification -> Verified)
- [x] 6.2 Build Table-based Result Entry form for fast technician entry
- [x] 6.3 Build Result Verification screen with abnormal and critical highlighting

## 7. E2E Validation & Security

- [x] 7.1 Verify multiple samples per order and duplicate barcode rejection
- [x] 7.2 Verify draft saving, amendment, and out-of-range flagging
- [x] 7.3 Ensure technician cannot verify, closed encounter blocks updates, wrong hospital denied
