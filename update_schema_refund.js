const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'packages/db/prisma/schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// Insert model Refund
const refundModel = `
model Refund {
  id              String        @id @default(uuid())
  hospitalId      String        @map("hospital_id")
  patientId       String        @map("patient_id")
  paymentId       String        @map("payment_id")
  invoiceId       String?       @map("invoice_id")
  amount          Decimal
  currency        String        @default("INR")
  refundNumber    String        @unique @map("refund_number")
  reason          String
  status          RefundStatus  @default(PENDING)
  version         Int           @default(1)
  
  gatewayRefundId String?       @map("gateway_refund_id")
  gatewayPayload  Json?         @map("gateway_payload")

  createdAt       DateTime      @default(now()) @map("created_at")
  processedAt     DateTime?     @map("processed_at")
  createdBy       String        @map("created_by")

  hospital        HospitalsMaster @relation(fields: [hospitalId], references: [id])
  patient         Patient       @relation(fields: [patientId], references: [id])
  payment         Payment       @relation(fields: [paymentId], references: [id])
  invoice         Invoice?      @relation(fields: [invoiceId], references: [id])

  @@index([hospitalId])
  @@index([patientId])
  @@index([paymentId])
  @@map("refunds")
}

enum RefundStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  REJECTED
}
`;

if (!schema.includes('model Refund {')) {
  schema = schema + '\n' + refundModel;
}

const addRelation = (modelName, relationStr) => {
  const modelRegex = new RegExp(`(model ${modelName} \\{[\\s\\S]*?\\n)(\\s*@@)`, 'm');
  schema = schema.replace(modelRegex, `$1  ${relationStr}\n$2`);
};

if (!schema.includes('refunds Refund[]')) {
  addRelation('HospitalsMaster', 'refunds Refund[]');
  addRelation('Patient', 'refunds Refund[]');
  addRelation('Payment', 'refunds Refund[]');
  addRelation('Invoice', 'refunds Refund[]');
}

fs.writeFileSync(schemaPath, schema);
console.log('Schema updated successfully');
