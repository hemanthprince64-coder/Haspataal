const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'packages/db/prisma/schema.prisma');
let schemaContent = fs.readFileSync(schemaPath, 'utf8');

// Update HospitalsMaster
if (!schemaContent.includes('billingAudits       BillingAudit[]')) {
  schemaContent = schemaContent.replace(
    '  invoices                 Invoice[]',
    '  invoices                 Invoice[]\n  billingAudits       BillingAudit[]\n  paymentIntents      PaymentIntent[]',
  );
}

// Update Patient
if (!schemaContent.includes('billingAudits       BillingAudit[]')) {
  schemaContent = schemaContent.replace(
    '  invoices                 Invoice[]',
    '  invoices                 Invoice[]\n  billingAudits       BillingAudit[]\n  paymentIntents      PaymentIntent[]',
  );
}

// Update Invoice
if (!schemaContent.includes('version           Int')) {
  schemaContent = schemaContent.replace(
    '  updatedAt         DateTime           @updatedAt @map("updated_at")',
    '  updatedAt         DateTime           @updatedAt @map("updated_at")\n  version           Int                @default(1)',
  );
}

if (!schemaContent.includes('billingAudits     BillingAudit[]')) {
  schemaContent = schemaContent.replace(
    '  lineItems         InvoiceLineItem[]',
    '  lineItems         InvoiceLineItem[]\n  billingAudits     BillingAudit[]\n  paymentIntents    PaymentIntent[]',
  );
}

// Append new Enums and Models
const newModels = `
enum BillingAuditAction {
  CHARGE_CREATED
  INVOICE_GENERATED
  INVOICE_ISSUED
  INVOICE_PRINTED
  PAYMENT_INTENT_CREATED
  PAYMENT_INITIATED
  PAYMENT_COMPLETED
  PAYMENT_FAILED
  PAYMENT_CANCELLED
  PAYMENT_REFUNDED
  ADJUSTMENT_CREATED
  INVOICE_VOIDED
}

enum PaymentMethod {
  CASH
  CARD
  UPI
  NET_BANKING
  WALLET
  CHEQUE
  INSURANCE
}

enum PaymentIntentStatus {
  CREATED
  PENDING
  AUTHORIZED
  CAPTURED
  FAILED
  CANCELLED
  EXPIRED
}

model BillingAudit {
  id          String             @id @default(uuid())
  hospitalId  String             @map("hospital_id")
  invoiceId   String?            @map("invoice_id")
  patientId   String?            @map("patient_id")
  action      BillingAuditAction
  performedBy String?            @map("performed_by")
  metadata    Json?              @default("{}")
  createdAt   DateTime           @default(now()) @map("created_at")

  hospital HospitalsMaster @relation(fields: [hospitalId], references: [id], onDelete: Cascade)
  invoice  Invoice?        @relation(fields: [invoiceId], references: [id])
  patient  Patient?        @relation(fields: [patientId], references: [id])

  @@index([hospitalId, invoiceId])
  @@map("billing_audit")
}

model PaymentIntent {
  id            String              @id @default(uuid())
  hospitalId    String              @map("hospital_id")
  invoiceId     String              @map("invoice_id")
  patientId     String              @map("patient_id")
  amount        Decimal
  currency      String              @default("INR")
  status        PaymentIntentStatus @default(PENDING)
  paymentMethod PaymentMethod?      @map("payment_method")
  gatewayId     String?             @map("gateway_id")
  metadata      Json?               @default("{}")
  createdAt     DateTime            @default(now()) @map("created_at")
  updatedAt     DateTime            @updatedAt @map("updated_at")

  hospital HospitalsMaster @relation(fields: [hospitalId], references: [id], onDelete: Cascade)
  invoice  Invoice         @relation(fields: [invoiceId], references: [id])
  patient  Patient         @relation(fields: [patientId], references: [id])

  @@index([hospitalId, invoiceId])
  @@map("payment_intents")
}

// Scaffolds for Phase 10D
model CreditNote {
  id         String   @id @default(uuid())
  hospitalId String   @map("hospital_id")
  createdAt  DateTime @default(now()) @map("created_at")
}

model Adjustment {
  id         String   @id @default(uuid())
  hospitalId String   @map("hospital_id")
  createdAt  DateTime @default(now()) @map("created_at")
}

model PaymentAllocation {
  id         String   @id @default(uuid())
  hospitalId String   @map("hospital_id")
  createdAt  DateTime @default(now()) @map("created_at")
}

model Receipt {
  id         String   @id @default(uuid())
  hospitalId String   @map("hospital_id")
  createdAt  DateTime @default(now()) @map("created_at")
}

model ReceiptLine {
  id         String   @id @default(uuid())
  hospitalId String   @map("hospital_id")
  createdAt  DateTime @default(now()) @map("created_at")
}

model PaymentReconciliation {
  id         String   @id @default(uuid())
  hospitalId String   @map("hospital_id")
  createdAt  DateTime @default(now()) @map("created_at")
}
`;

if (!schemaContent.includes('enum BillingAuditAction')) {
  schemaContent += newModels;
}

fs.writeFileSync(schemaPath, schemaContent);
console.log('Schema updated successfully.');
