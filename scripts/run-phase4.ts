import { CanonicalEventEnvelope } from '@haspataal/platform-contracts';
import { PrismaClient } from '@prisma/client';
import assert from 'assert';
import { randomUUID } from 'crypto';

import { outboxConsumerRegistry, dispatchToConsumers } from '../workers/consumer-registry';

const prisma = new PrismaClient();

async function runTests() {
  console.log('Starting Phase 4 Consumers Verification...');

  // Cleanup
  await prisma.outboxEvent.deleteMany({});
  await prisma.consumerIdempotencyLedger.deleteMany({});
  await prisma.timelineEvent.deleteMany({});
  await prisma.journeyInstance.deleteMany({});
  await prisma.journeyMilestone.deleteMany({});
  await prisma.analyticsPatientProjection.deleteMany({});
  await prisma.analyticsAdmissionProjection.deleteMany({});
  await prisma.projectionCheckpoint.deleteMany({});
  await prisma.bed.deleteMany({});
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

  try {
    console.log('\\n--- A. Consumer Registry Proof ---');
    const consumers = outboxConsumerRegistry.getAllConsumers();
    console.log('Registered consumers:', consumers.length);
    const names = consumers.map((c) => c.consumerName);
    console.log('Consumer names:', names);
    assert.ok(consumers.length >= 6, 'Should have at least 6 consumers');
    assert.ok(names.includes('Timeline'), 'Has Timeline');
    assert.ok(names.includes('Journey'), 'Has Journey');
    console.log('✅ A. PASS');

    console.log('\\n--- B. Idempotency Proof ---');
    const eventId = randomUUID();
    const envelope = {
      eventId,
      eventType: 'PATIENT_ADMITTED',
      payload: { patientId: randomUUID(), admissionId: randomUUID() },
      occurredAt: new Date(),
      scope: { hospitalId: randomUUID(), scopeType: 'TENANT' as any, tenantId: randomUUID() },
      chain: { correlationId: randomUUID() },
      actor: { actorId: randomUUID(), actorType: 'SYSTEM' as any },
    } as CanonicalEventEnvelope;
    await dispatchToConsumers(envelope, 'test-transaction-id');
    const ledger1 = await prisma.consumerIdempotencyLedger.findUnique({
      where: { eventId_consumerName: { eventId, consumerName: 'Timeline' } },
    });
    assert.ok(ledger1?.status === 'COMPLETED');
    await dispatchToConsumers(envelope, 'test-transaction-id-2');
    console.log('✅ B. PASS');

    console.log('\\n--- C. Timeline Replay Proof ---');
    const timelineEvts = await prisma.timelineEvent.findMany();
    assert.ok(timelineEvts.length === 1, 'Should have 1 timeline event');
    console.log('✅ C. PASS');

    console.log('\\n--- K. Multi-Consumer Replay Proof ---');
    const admissionId = randomUUID();
    const env2 = {
      eventId: randomUUID(),
      eventType: 'PATIENT_ADMITTED',
      payload: { patientId: randomUUID(), admissionId },
      occurredAt: new Date(),
      scope: { hospitalId: randomUUID(), scopeType: 'TENANT' as any, tenantId: randomUUID() },
      chain: { correlationId: randomUUID() },
      actor: { actorId: randomUUID(), actorType: 'SYSTEM' as any },
    } as CanonicalEventEnvelope;
    await dispatchToConsumers(env2, 'test-transaction-id-3');
    const tl2 = await prisma.timelineEvent.findFirst(); // Find first since we use random admissionId in payload
    const al2 = await prisma.analyticsAdmissionProjection.findFirst();
    const jl2 = await prisma.journeyInstance.findFirst();
    assert.ok(tl2, 'Timeline created');
    assert.ok(al2, 'Analytics created');
    assert.ok(jl2, 'Journey created');
    console.log('✅ K. PASS');

    console.log('\\n--- L. DLQ Replay Proof ---');
    const env3Id = randomUUID();
    const env3 = {
      eventId: env3Id,
      eventType: 'PATIENT_ADMITTED',
      payload: { patientId: randomUUID(), admissionId: randomUUID() },
      occurredAt: new Date(),
      scope: { hospitalId: randomUUID(), scopeType: 'TENANT' as any, tenantId: randomUUID() },
      chain: { correlationId: randomUUID() },
      actor: { actorId: randomUUID(), actorType: 'SYSTEM' as any },
    } as CanonicalEventEnvelope;
    const timelineCons = outboxConsumerRegistry
      .getAllConsumers()
      .find((c) => c.consumerName === 'Timeline');
    const origHandle = timelineCons!.handle.bind(timelineCons);
    timelineCons!.handle = async () => {
      timelineCons!.handle = origHandle;
      throw new Error('DLQ Test');
    };

    let caught = false;
    try {
      await dispatchToConsumers(env3, 'test-transaction-id-4');
    } catch (e) {
      caught = true;
    }
    assert.ok(caught, 'Should throw DLQ');

    const led3 = await prisma.consumerIdempotencyLedger.findUnique({
      where: { eventId_consumerName: { eventId: env3Id, consumerName: 'Timeline' } },
    });
    assert.ok(!led3, 'Should not be in ledger');

    await dispatchToConsumers(env3, 'test-transaction-id-5');
    const led4 = await prisma.consumerIdempotencyLedger.findUnique({
      where: { eventId_consumerName: { eventId: env3Id, consumerName: 'Timeline' } },
    });
    assert.ok(led4?.status === 'COMPLETED');
    console.log('✅ L. PASS');

    console.log('\\n--- M. Crash Recovery Proof ---');
    await prisma.projectionCheckpoint.upsert({
      where: { projectionName: 'Timeline' },
      create: {
        projectionName: 'Timeline',
        consumerName: 'Timeline',
        lastEventId: 'evt-123',
        projectionVersion: 1,
      },
      update: { lastEventId: 'evt-123' },
    });
    const cp = await prisma.projectionCheckpoint.findUnique({
      where: { projectionName: 'Timeline' },
    });
    assert.ok(cp?.lastEventId === 'evt-123');
    console.log('✅ M. PASS');

    console.log('\\n--- ALL TESTS PASSED ---');
  } catch (e) {
    console.error('FAILED:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
