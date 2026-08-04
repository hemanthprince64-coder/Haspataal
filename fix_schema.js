const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'packages/db/prisma/schema.prisma');
let schemaContent = fs.readFileSync(schemaPath, 'utf8');

// The first run already added 'billingAudits' to HospitalsMaster, so replaceAll is safe but we should only replace if not already replaced.
// Since HospitalsMaster has it, but Patient doesn't, let's fix Patient explicitly.
// Find Patient model
const patientStartIndex = schemaContent.indexOf('model Patient {');
const patientEndIndex = schemaContent.indexOf('@@map("patients")', patientStartIndex);

let patientContent = schemaContent.substring(patientStartIndex, patientEndIndex);
if (!patientContent.includes('billingAudits')) {
  patientContent = patientContent.replace(
    '  invoices                 Invoice[]',
    '  invoices                 Invoice[]\n  billingAudits       BillingAudit[]\n  paymentIntents      PaymentIntent[]',
  );
  schemaContent =
    schemaContent.substring(0, patientStartIndex) +
    patientContent +
    schemaContent.substring(patientEndIndex);
}

fs.writeFileSync(schemaPath, schemaContent);
console.log('Patient relations fixed.');
