const fs = require('fs');
const content = fs.readFileSync('packages/db/prisma/schema.prisma', 'utf8');

const models = [];
const tables = [];
const enums = [];

content.split('\n').forEach(line => {
  const mMatch = line.match(/^model\s+(\w+)/);
  if (mMatch) models.push(mMatch[1]);
  const eMatch = line.match(/^enum\s+(\w+)/);
  if (eMatch) enums.push(eMatch[1]);
  const tMatch = line.match(/@@map\("([^"]+)"\)/);
  if (tMatch) tables.push(tMatch[1]);
});

console.log('Total Prisma Models:', models.length);
console.log('Total Prisma Enums:', enums.length);
console.log('Total Prisma Tables:', tables.length);

const testNames = ['roles', 'permissions', 'user_roles', 'role_permissions', 'procedure_room', 'procedure_execution', 'patients', 'admissions', 'clinical_events', 'clinical_alerts'];
testNames.forEach(t => {
  console.log(`Table "${t}": mapped = ${tables.includes(t)}, model = ${models.includes(t)}`);
});
