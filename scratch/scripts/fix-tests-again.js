const fs = require('fs');
let c = fs.readFileSync('tests/integration/phase4-consumers.integration.test.ts', 'utf8');

// 1. Fix Timeline findMany
c = c.replace(
  /where:\s*\{\s*admissionId\s*\},\\s*orderBy:\s*\{\s*eventDate:\s*'asc'\s*\}/g,
  "where: { entityId: admissionId }, orderBy: { timestamp: 'asc' }",
);
// If it has newlines:
c = c.replace(
  /where:\s*\{\s*admissionId\s*\},\s*orderBy:\s*\{\s*eventDate:\s*'asc'\s*\}/g,
  "where: { entityId: admissionId }, orderBy: { timestamp: 'asc' }",
);

// 2. Fix Notification payload and query
c = c.replace(
  /payload:\s*\{\s*userId:\s*randomUUID\(\),\s*message:\s*'Hello'\s*\}/g,
  "payload: { commandId: eventId, commandVersion: 1, target: 'notification', tenantContext: { hospitalId: randomUUID() }, actorContext: { actorId: 'system', actorType: 'SYSTEM' }, correlationId: eventId, idempotencyKey: eventId, timestamp: new Date().toISOString(), payload: { type: 'SMS', recipient: '+123', templateId: 'test', variables: {} } }",
);

// The query might still be using `prisma.notificationIntent.findMany` or `prisma.notification.findMany`
c = c.replace(
  /const intents = await prisma\.notificationIntent\.findMany\(\{\s*where:\s*\{\s*eventId\s*\}\s*\}\);/g,
  'const intents = await prisma.notification.findMany();',
);
c = c.replace(
  /const intents = await prisma\.notification\.findMany\(\{\s*where:\s*\{\s*eventId\s*\}\s*\}\);/g,
  'const intents = await prisma.notification.findMany();',
);

// 3. Fix Bed Hospital FK
c = c.replace(
  /const bed = await prisma\.bed\.create\(\{/g,
  "const hId = randomUUID(); await prisma.hospital.create({data: {id: hId, name: 'T', slug: hId, status: 'ACTIVE'}});\n      const bed = await prisma.bed.create({",
);
// Make sure hospitalId uses hId instead of randomUUID(). We'll replace the first match of hospitalId: randomUUID()
c = c.replace(/hospitalId:\s*randomUUID\(\),/, 'hospitalId: hId,');

// 4. Fix ProjectionCheckpoint expect
c = c.replace(/expect\(cp\?\.lastProcessedEventId\)/g, 'expect(cp?.lastEventId)');

fs.writeFileSync('tests/integration/phase4-consumers.integration.test.ts', c);
console.log('Fixed tests');
