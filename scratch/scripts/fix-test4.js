const fs = require('fs');
let content = fs.readFileSync(
  'packages/core/domain/referral/__tests__/phase5b6-referral.integration.test.ts',
  'utf8',
);

// Fix 2: relationshipType is not a valid field on DoctorPatientRelationship
content = content.replace(
  `const rels = await prisma.doctorPatientRelationship.findMany({
      where: { patientId: testPatientId, status: 'ACTIVE', relationshipType: 'PRIMARY' } as any, // any to bypass type check for relationshipType field we didn't add yet since the schema uses CarePurpose
    });`,
  `const rels = await prisma.doctorPatientRelationship.findMany({
      where: { patientId: testPatientId, status: 'ACTIVE', carePurpose: 'PRIMARY_TREATMENT' },
    });`,
);

// Fix 1: Check why outbox event wasn't found
content = content.replace(
  `const events = await prisma.outboxEvent.findMany({
      where: { aggregateId: testPatientId, eventType: ReferralEventType.REFERRAL_CREATED },
      orderBy: { createdAt: 'desc' },
    });
    expect(events.length).toBeGreaterThan(0);`,
  `const events = await prisma.outboxEvent.findMany({
      where: { aggregateId: testPatientId },
      orderBy: { createdAt: 'desc' },
    });
    console.log('Outbox events:', events.map(e => e.eventType));
    expect(events.some(e => e.eventType === ReferralEventType.REFERRAL_CREATED)).toBe(true);`,
);

fs.writeFileSync(
  'packages/core/domain/referral/__tests__/phase5b6-referral.integration.test.ts',
  content,
);
console.log('Fixed test errors');
