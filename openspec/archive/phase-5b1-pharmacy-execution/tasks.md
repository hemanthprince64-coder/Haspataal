# Tasks: Phase 5B.1 — Pharmacy Execution Engine

## 1. Schema Updates
- [ ] Add `PharmacyExecutionStatus` and `MARStatus` enums to `packages/db/prisma/schema.prisma`.
- [ ] Add `PharmacyExecution`, `PharmacyExecutionItem`, `PharmacyDispense`, `PharmacyDispenseItem`, and `MedicationAdministrationRecord` models to `schema.prisma`.
- [ ] Add relations on `Order`, `OrderItem`, and `ClinicalOrderCatalogVersion` to support Pharmacy models.
- [ ] Generate migration `18_phase5b1_pharmacy_execution.sql` using `scripts/generate-migration.ts`.

## 2. Core Domain Services (`packages/core/domain/pharmacy`)
- [ ] Implement `PharmacyExecutionService.createFromOrder()` to generate execution models.
- [ ] Implement `PharmacyExecutionService.verifyExecution()`.
- [ ] Implement `PharmacyExecutionService.substituteItem()`.
- [ ] Implement `PharmacyExecutionService.dispense()` (handle partial vs full status transitions).
- [ ] Implement `MARService.recordAdministration()`.

## 3. Event Consumer
- [ ] Create `PharmacyConsumer` under `packages/core/domain/pharmacy/consumer.ts` implementing `EventConsumer` contract.
- [ ] Handle `ORDER_REQUESTED` event: Filter pharmacy items, construct payload, and call `createFromOrder()`.
- [ ] Handle `ORDER_CANCELLED` event: Halt dispensing or transition to `CANCELLED`.
- [ ] Register `PharmacyConsumer` with `ConsumerRegistry`.

## 4. Testing & Verification
- [ ] Write integration tests for Pharmacy Execution (schema and lifecycle).
- [ ] Verify `ORDER_REQUESTED` relay correctly creates `PharmacyExecution`.
- [ ] Verify partial dispensing logic correctly transitions status.
- [ ] Validate `MAR` creation properly links back to canonical `OrderItem`.
