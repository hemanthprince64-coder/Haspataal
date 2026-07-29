const fs = require('fs');
let content = fs.readFileSync('packages/db/prisma/schema.prisma', 'utf8');

// Fix string defaults that lost quotes - use string replace with indexOf
const oldApptType =
  '  appointmentType      String                 @default(OUTPATIENT) @map("appointment_type")';
const newApptType =
  '  appointmentType      String                 @default("OUTPATIENT") @map("appointment_type")';
content = content.split(oldApptType).join(newApptType);

const oldStatus = '  status               String                 @default(SCHEDULED)';
const newStatus = '  status               String                 @default("SCHEDULED")';
content = content.split(oldStatus).join(newStatus);

fs.writeFileSync('packages/db/prisma/schema.prisma', content);
console.log('Fixed string defaults in ReferralAppointment');
