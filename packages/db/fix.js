const fs = require('fs');
const p = 'packages/db/prisma/schema.prisma';
let c = fs.readFileSync(p, 'utf-8');

c = c.replace(
  /  orderId String @unique @map\("order_id"\)\r?\n  order   Order  @relation\(fields: \[orderId\], references: \[id\]\)/g,
  '  clinicalOrderId String? @unique @map("clinical_order_id")\n  clinicalOrder   ClinicalOrder?  @relation(fields: [clinicalOrderId], references: [id])',
);

fs.writeFileSync(p, c);
