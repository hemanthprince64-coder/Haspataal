const fs = require('fs');
let content = fs.readFileSync('packages/db/prisma/schema.prisma', 'utf8');

// Fix 1: orderId in ReferralExecution needs @unique for 1:1
content = content
  .split(
    '  orderId              String            @map("order_id")\n  order                Order             @relation(fields: [orderId], references: [id])',
  )
  .join(
    '  orderId              String            @unique @map("order_id")\n  order                Order             @relation(fields: [orderId], references: [id])',
  );

// Fix 2: Add referral relation to Patient model
// Find patient model and add referralExecutions and careTransfers relations
const patientModelPattern = '  appointments     Appointment[]';
if (content.includes(patientModelPattern)) {
  content = content
    .split(patientModelPattern)
    .join(
      patientModelPattern +
        '\n  referralExecutions ReferralExecution[]\n  careTransfers      CareTransfer[]',
    );
  console.log('Added Patient relations');
} else {
  console.log('Could not find Patient model pattern');
}

// Fix 3: Add referralItem relation to OrderItem model (already done, verify)
if (!content.includes('referralItem        ReferralExecutionItem?')) {
  content = content
    .split('  bloodBankItem       BloodBankExecutionItem?\n')
    .join(
      '  bloodBankItem       BloodBankExecutionItem?\n  referralItem        ReferralExecutionItem?\n',
    );
  console.log('Added OrderItem referralItem relation');
}

fs.writeFileSync('packages/db/prisma/schema.prisma', content);
console.log('Fixed schema relations');
