const fs = require('fs');
const p = 'packages/db/prisma/schema.prisma';
let c = fs.readFileSync(p, 'utf-8');

c = c.replace(
  '  dispensedQuantity  Int @default(0) @map("dispensed_quantity")',
  `  dispensedQuantity  Int @default(0) @map("dispensed_quantity")
  version     Int     @default(1)
  verifiedBy  String? @map("verified_by")
  dispensedBy String? @map("dispensed_by")
  verifiedAt  DateTime? @map("verified_at")
  dispensedAt DateTime? @map("dispensed_at")`,
);

fs.writeFileSync(p, c);
