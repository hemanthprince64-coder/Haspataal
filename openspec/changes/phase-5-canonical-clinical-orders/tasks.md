## 1. Schema Additions (Phase 5A)

- [x] 1.1 Add OrderType, OrderStatus, OrderPriority, ClinicalContext enums
- [x] 1.2 Add ClinicalOrderCatalog and ClinicalOrderCatalogVersion models
- [x] 1.3 Add Order, OrderVersion, and OrderItem models (linking to Catalog)
- [x] 1.4 Add OrderDependency, OrderExecution, and OrderCancellation models
- [x] 1.5 Generate Prisma migration script and verify it applies cleanly

## 2. Domain & Validation (Phase 5A)

- [x] 2.1 Create Order Authorization Service enforcing Phase 2 engine checks
- [x] 2.2 Create CDS Validation Pipeline (Duplicates, Interactions, Allergies) with Override support
- [x] 2.3 Create Order State Service to encapsulate canonical lifecycle
- [x] 2.4 Implement Order Versioning routine (immutable V1 -> V2 transitions)

## 3. Outbox Event Integration (Phase 5A)

- [x] 3.1 Define canonical Order event payloads in @haspataal/platform-contracts
- [x] 3.2 Ensure mutations wrap outbox emission in a single prisma.$transaction

## 4. Verification and Replay (Phase 5A)

- [x] 4.1 Write PostgreSQL integration tests for Order Creation and Version creation
- [x] 4.2 Write tests for Concurrent cancellation and Concurrent completion
- [x] 4.3 Write tests for Duplicate Override and Grouped order completion
- [x] 4.4 Write tests for Dependency ordering and Amendment replay
- [x] 4.5 Write tests for External sync retry and Replay after consumer crash
- [x] 4.6 Prove queue reconstruction: delete projections and perfectly rebuild from events
- [x] 4.7 Run full regression suite (Phase 0A-4) to verify no breakages

## 5. Department Execution Consumers (Phase 5B)

- [ ] 5.1 Implement Subtype-specific Lab execution workflow and consumer
- [ ] 5.2 Implement Subtype-specific Radiology execution workflow and consumer
- [ ] 5.3 Implement Subtype-specific Pharmacy execution workflow and consumer
- [ ] 5.4 Implement Procedure and Referral consumers
- [ ] 5.5 Register new consumers with the ConsumerRegistry
