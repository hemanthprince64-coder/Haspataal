import { PrismaClient } from '@prisma/client';

import { dispatchToConsumers } from '../workers/consumer-registry';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting Phase 4 Scalability Profile (1,000 events)...');

  // 1. Cleanup
  await prisma.outboxEvent.deleteMany({});
  await prisma.consumerIdempotencyLedger.deleteMany({});
  await prisma.timelineEvent.deleteMany({});
  await prisma.journeyInstance.deleteMany({});
  await prisma.analyticsPatientProjection.deleteMany({});
  await prisma.projectionCheckpoint.deleteMany({});
  await prisma.journeyTemplate.deleteMany({ where: { id: 'generic-hospital-stay' } });

  await prisma.journeyTemplate.create({
    data: {
      id: 'generic-hospital-stay',
      name: 'Generic Hospital Stay',
      category: 'ADMISSION',
      isActive: true,
      stages: [],
    },
  });

  const eventsToGenerate = 1000;
  console.log(`Generating ${eventsToGenerate} events...`);

  const events = Array.from({ length: eventsToGenerate }).map((_, i) => ({
    eventType: 'PATIENT_ADMITTED',
    aggregateId: `ADM-SCALE-${i}`,
    aggregateType: 'ADMISSION',
    payload: {
      patientId: `PAT-SCALE-${i % 100}`,
      hospitalId: 'HOSP-TEST',
      reason: `Reason ${i}`,
    },
    deliveryStatus: 'PENDING',
    correlationId: `CORR-SCALE-${i}`,
    causationId: `CAUSE-SCALE-${i}`,
    actorId: 'ACTOR-1',
    actorType: 'SYSTEM',
    hospitalId: 'HOSP-TEST',
    occurredAt: new Date(),
  }));

  // Insert in batches
  await prisma.outboxEvent.createMany({
    data: events as any,
  });

  console.log('Events generated. Starting consumers dispatch...');

  const startTime = Date.now();
  let processedCount = 0;

  console.log('Dispatching...');
  for (let i = 0; i < eventsToGenerate; i++) {
    const ev = events[i];
    const envelope = {
      eventId: `EVT-SCALE-${i}`,
      eventType: ev.eventType,
      occurredAt: ev.occurredAt,
      aggregate: { id: ev.aggregateId, type: ev.aggregateType },
      scope: { hospitalId: ev.hospitalId, patientId: ev.payload.patientId, tenantId: undefined },
      actor: { actorId: ev.actorId, actorType: ev.actorType },
      chain: { correlationId: ev.correlationId, causationId: ev.causationId },
      intent: {},
      payload: ev.payload,
    } as any;

    await dispatchToConsumers(envelope, ev.payload);

    if (i % 100 === 0 && i > 0) {
      console.log(`Processed ${i} events...`);
    }
  }

  const endTime = Date.now();
  const durationMs = endTime - startTime;
  console.log(`\\n--- Results ---`);
  console.log(`Total Events: ${eventsToGenerate}`);
  console.log(`Total Time: ${durationMs}ms`);
  console.log(`Average Time per Event: ${(durationMs / eventsToGenerate).toFixed(2)}ms`);

  // Verify
  const timelineCount = await prisma.timelineEvent.count();
  const idempotencyCount = await prisma.consumerIdempotencyLedger.count();
  const patientProjCount = await prisma.analyticsPatientProjection.count();

  console.log(`Timeline Events Created: ${timelineCount}`);
  console.log(`Idempotency Records Created: ${idempotencyCount}`);
  console.log(`Patient Projections Created/Updated: ${patientProjCount} (Expected 100)`);

  if (timelineCount === eventsToGenerate) {
    console.log(`✅ SCALABILITY TEST PASS`);
  } else {
    console.log(`❌ SCALABILITY TEST FAIL`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
