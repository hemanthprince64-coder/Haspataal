# Design: Phase 5B.1 — Pharmacy Execution Engine

## 1. Architecture Overview
The Pharmacy Execution Engine implements the first of the Phase 5B downstream consumers. It enforces the constitutional invariant that the Canonical Order represents purely clinical intent, while this new engine represents operational fulfillment.

**Event-Driven Ingestion:**
1. A background `PharmacyConsumer` (implementing `EventConsumer`) subscribes to the canonical `OutboxRelay`.
2. When it receives an `ORDER_REQUESTED` event, it inspects the payload. If the order contains `OrderType.PHARMACY` items (or `ClinicalOrderCatalog` entries tagged as pharmacy), it generates a `PharmacyExecution` aggregate.
3. When it receives `ORDER_CANCELLED`, it attempts to halt dispensing if not already fulfilled.

**Aggregate Boundaries:**
- **PharmacyExecution**: The root operational object for the pharmacy department, mapped 1:1 to an `Order`.
- **PharmacyExecutionItem**: The line-item operational object, mapped 1:1 to an `OrderItem`. It tracks `prescribedQuantity` vs `dispensedQuantity`.
- **PharmacyDispense**: A single physical dispensing event (pharmacist clicking "Dispense").
- **MedicationAdministrationRecord (MAR)**: The nursing operational object recording the physical administration of the medication to the patient.

## 2. Prisma Schema
The following entities will be introduced:

```prisma
enum PharmacyExecutionStatus {
  PENDING_VERIFICATION
  VERIFIED
  DISPENSING
  PARTIALLY_DISPENSED
  FULLY_DISPENSED
  CANCELLED
}

model PharmacyExecution {
  id              String   @id @default(uuid())
  hospitalId      String   @map("hospital_id")
  patientId       String   @map("patient_id")
  
  orderId         String   @unique @map("order_id")
  order           Order    @relation(fields: [orderId], references: [id])
  
  status          PharmacyExecutionStatus @default(PENDING_VERIFICATION)
  
  verifiedAt      DateTime? @map("verified_at")
  verifiedById    String?   @map("verified_by_id")
  pharmacistNotes String?   @map("pharmacist_notes")
  
  items           PharmacyExecutionItem[]
  dispenses       PharmacyDispense[]

  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  @@index([hospitalId, patientId])
  @@map("pharmacy_executions")
}

model PharmacyExecutionItem {
  id                 String   @id @default(uuid())
  executionId        String   @map("execution_id")
  execution          PharmacyExecution @relation(fields: [executionId], references: [id])
  
  orderItemId        String   @unique @map("order_item_id")
  orderItem          OrderItem @relation(fields: [orderItemId], references: [id])
  
  prescribedQuantity Int      @map("prescribed_quantity")
  dispensedQuantity  Int      @default(0) @map("dispensed_quantity")
  
  substitutedCatalogVersionId String? @map("substituted_catalog_version_id")
  substitutedCatalogVersion ClinicalOrderCatalogVersion? @relation(fields: [substitutedCatalogVersionId], references: [id])
  
  dispenseItems      PharmacyDispenseItem[]
  
  createdAt          DateTime @default(now()) @map("created_at")
  updatedAt          DateTime @updatedAt @map("updated_at")

  @@map("pharmacy_execution_items")
}

model PharmacyDispense {
  id              String   @id @default(uuid())
  executionId     String   @map("execution_id")
  execution       PharmacyExecution @relation(fields: [executionId], references: [id])
  
  dispensedAt     DateTime @default(now()) @map("dispensed_at")
  dispensedById   String   @map("dispensed_by_id")
  
  items           PharmacyDispenseItem[]
  
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  @@map("pharmacy_dispenses")
}

model PharmacyDispenseItem {
  id                 String   @id @default(uuid())
  dispenseId         String   @map("dispense_id")
  dispense           PharmacyDispense @relation(fields: [dispenseId], references: [id])
  
  executionItemId    String   @map("execution_item_id")
  executionItem      PharmacyExecutionItem @relation(fields: [executionItemId], references: [id])
  
  quantityDispensed  Int      @map("quantity_dispensed")
  batchNumber        String?  @map("batch_number")
  expiryDate         DateTime? @map("expiry_date")

  @@map("pharmacy_dispense_items")
}

enum MARStatus {
  ADMINISTERED
  MISSED
  REFUSED
  OMITTED
}

model MedicationAdministrationRecord {
  id                 String   @id @default(uuid())
  hospitalId         String   @map("hospital_id")
  patientId          String   @map("patient_id")
  
  orderItemId        String   @map("order_item_id") // Links to Canonical Intent
  orderItem          OrderItem @relation(fields: [orderItemId], references: [id])
  
  scheduledFor       DateTime @map("scheduled_for")
  status             MARStatus @default(ADMINISTERED)
  administeredAt     DateTime? @map("administered_at")
  administeredById   String?   @map("administered_by_id")
  clinicalNotes      String?   @map("clinical_notes")

  createdAt          DateTime @default(now()) @map("created_at")
  updatedAt          DateTime @updatedAt @map("updated_at")

  @@index([hospitalId, patientId])
  @@map("medication_administration_records")
}
```

## 3. Operations

### 3.1 Verification
`verifyExecution(executionId, pharmacistId, notes)`
Transitions status from `PENDING_VERIFICATION` to `VERIFIED`. Required before dispensing.

### 3.2 Substitution
`substituteItem(executionItemId, newCatalogVersionId)`
Updates the `substitutedCatalogVersionId` so that dispensing uses a different barcode/item without editing the canonical order.

### 3.3 Dispensing
`dispense(executionId, items: { executionItemId, quantity, batchNumber }[])`
1. Creates a `PharmacyDispense` record.
2. Creates `PharmacyDispenseItem`s.
3. Increments `dispensedQuantity` on each `PharmacyExecutionItem`.
4. Evaluates if all items have `dispensedQuantity >= prescribedQuantity`.
5. Transitions `PharmacyExecution` to `PARTIALLY_DISPENSED` or `FULLY_DISPENSED`.

## 4. Rollback and Cancellations
If the upstream `Order` is cancelled, the consumer will catch `ORDER_CANCELLED`.
- If `PENDING_VERIFICATION` or `VERIFIED`, immediately transition execution to `CANCELLED`.
- If `PARTIALLY_DISPENSED`, transition to `CANCELLED` and require pharmacist manual return/RMA.
