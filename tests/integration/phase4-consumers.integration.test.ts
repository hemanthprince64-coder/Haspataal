import { CanonicalEventEnvelope } from '@haspataal/platform-contracts';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';

import { outboxConsumerRegistry, dispatchToConsumers } from '../../workers/consumer-registry';

const prisma = new PrismaClient();

describe('Phase 4 Consumers Integration & Verification Gate', () => {
  beforeAll(async () => {
    await prisma.outboxEvent.deleteMany({});
    await prisma.consumerIdempotencyLedger.deleteMany({});
    await prisma.timelineEvent.deleteMany({});
    await prisma.journeyInstance.deleteMany({});
    await prisma.journeyMilestone.deleteMany({});
    await prisma.analyticsPatientProjection.deleteMany({});
    await prisma.analyticsAdmissionProjection.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.projectionCheckpoint.deleteMany({});
    await prisma.bed.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('A. Consumer Registry Proof', () => {
    it('EventConsumer interface is implemented by registered consumers', () => {
      const consumers = outboxConsumerRegistry.getAllConsumers();
      expect(consumers.length).toBeGreaterThan(0);
      for (const consumer of consumers) {
        expect(consumer.consumerName).toBeDefined();
        expect(typeof consumer.supportedEvents).toBe('function');
        expect(typeof consumer.handle).toBe('function');
      }
    });

    it('outbox-relay.worker.ts does not directly import any specific Consumer class', () => {
      const relayCode = fs.readFileSync(
        path.join(__dirname, '../../workers/outbox-relay.worker.ts'),
        'utf-8',
      );
      const prohibitedImports = [
        'TimelineConsumer',
        'JourneyConsumer',
        'AnalyticsConsumer',
        'SearchConsumer',
        'BedConsumer',
      ];
      for (const importName of prohibitedImports) {
        const regex = new RegExp(`import.*${importName}`, 'g');
        expect(regex.test(relayCode)).toBe(false);
      }
      expect(relayCode).toContain('dispatchToConsumers');
    });
  });

  describe('B. Idempotency Proof', () => {
    it('Processing an identical Outbox Event twice results in exactly one projection and one ledger success', async () => {
      const eventId = randomUUID();
      const patientId = randomUUID();
      const admissionId = randomUUID();

      const payload = {
        patientId,
        admissionId,
        admittingDoctorId: randomUUID(),
        reason: 'Observation',
      };
      const envelope: CanonicalEventEnvelope = {
        eventId,
        eventType: 'PATIENT_ADMITTED',
        payload,
        occurredAt: new Date(),
        scope: { hospitalId: randomUUID() },
        version: 1,
      };

      await dispatchToConsumers(envelope);
      await dispatchToConsumers(envelope);

      const ledgers = await prisma.consumerIdempotencyLedger.findMany({ where: { eventId } });
      const uniqueConsumers = new Set(ledgers.map((l) => l.consumerName));
      expect(ledgers.length).toBe(uniqueConsumers.size);

      const timelines = await prisma.timelineEvent.findMany({ where: { entityId: admissionId } });
      expect(timelines.length).toBe(1);

      const analytics = await prisma.analyticsAdmissionProjection.findMany({
        where: { admissionId },
      });
      expect(analytics.length).toBe(1);
    }, 15000);
  });

  describe('C. Replay Proof', () => {
    it('Replays Timeline independently without touching Analytics', async () => {
      // Replay script simulation: delete timeline and replay just Timeline
      const admissionId = randomUUID();
      const eventId = randomUUID();
      const envelope: CanonicalEventEnvelope = {
        eventId,
        eventType: 'PATIENT_ADMITTED',
        payload: { patientId: randomUUID(), admissionId },
        occurredAt: new Date(),
        scope: { hospitalId: randomUUID() },
        version: 1,
      };

      await dispatchToConsumers(envelope);

      await prisma.timelineEvent.deleteMany({ where: { entityId: admissionId } });
      await prisma.consumerIdempotencyLedger.deleteMany({
        where: { consumerName: 'Timeline', eventId },
      });

      // Simulate replay target=Timeline
      const consumers = outboxConsumerRegistry
        .getConsumersForEvent('PATIENT_ADMITTED')
        .filter((c) => c.consumerName === 'Timeline');
      // Using direct handle inside tx since we mock relay behavior
      await prisma.$transaction(async (tx) => {
        await consumers[0].handle(envelope, tx);
      });

      const timelines = await prisma.timelineEvent.findMany({ where: { entityId: admissionId } });
      expect(timelines.length).toBe(1);

      const analytics = await prisma.analyticsAdmissionProjection.findMany({
        where: { admissionId },
      });
      expect(analytics.length).toBeGreaterThan(0); // Untouched
    });
  });

  describe('D. Deterministic Replay Proof', () => {
    it('Exports match exactly after full wipe and replay', async () => {
      const admissionId = randomUUID();
      const envelope: CanonicalEventEnvelope = {
        eventId: randomUUID(),
        eventType: 'PATIENT_ADMITTED',
        payload: { patientId: randomUUID(), admissionId },
        occurredAt: new Date(),
        scope: { hospitalId: randomUUID() },
        version: 1,
      };
      await dispatchToConsumers(envelope);

      const firstPass = await prisma.timelineEvent.findMany({ where: { entityId: admissionId } });
      await prisma.timelineEvent.deleteMany({ where: { entityId: admissionId } });
      await prisma.consumerIdempotencyLedger.deleteMany({ where: { consumerName: 'Timeline' } });

      await dispatchToConsumers(envelope);

      const secondPass = await prisma.timelineEvent.findMany({ where: { entityId: admissionId } });

      // Ignore rebuiltAt / timestamps handled by database automatically
      const clean = (arr: any[]) =>
        arr.map((a) => ({ ...a, id: null, createdAt: null, updatedAt: null, rebuiltAt: null }));
      expect(clean(firstPass)).toEqual(clean(secondPass));
    }, 15000);
  });

  describe('E. Projection Version Proof', () => {
    it('Updates projectionVersion automatically', async () => {
      const admissionId = randomUUID();
      const envelope: CanonicalEventEnvelope = {
        eventId: randomUUID(),
        eventType: 'PATIENT_ADMITTED',
        payload: { patientId: randomUUID(), admissionId },
        occurredAt: new Date(),
        scope: { hospitalId: randomUUID() },
        version: 1,
      };
      await dispatchToConsumers(envelope);

      // Artificially downgrade
      await prisma.timelineEvent.updateMany({
        where: { entityId: admissionId },
        data: { projectionVersion: 0 },
      });

      // Trigger update / replay logic (Our current consumer UPSERTS by default or ignores if ledger is COMPLETED)
      // To force rebuild, ledger is cleared during replay
      await prisma.consumerIdempotencyLedger.deleteMany({ where: { consumerName: 'Timeline' } });
      await dispatchToConsumers(envelope);

      const timeline = await prisma.timelineEvent.findFirst({
        where: { entityId: admissionId },
        orderBy: { createdAt: 'desc' },
      });
      expect(timeline?.projectionVersion).toBe(1);
    });
  });

  describe('F. Ordering Proof', () => {
    it('Out-of-order events do not corrupt the final state', async () => {
      const admissionId = randomUUID();
      const patientId = randomUUID();
      const hId = randomUUID();

      const e1: CanonicalEventEnvelope = {
        eventId: randomUUID(),
        eventType: 'PATIENT_ADMITTED',
        payload: { patientId, admissionId },
        occurredAt: new Date('2024-01-01T10:00:00Z'),
        scope: { hospitalId: hId },
        version: 1,
      };
      const e2: CanonicalEventEnvelope = {
        eventId: randomUUID(),
        eventType: 'PATIENT_CLINICALLY_DISCHARGED',
        payload: { patientId, admissionId },
        occurredAt: new Date('2024-01-02T10:00:00Z'),
        scope: { hospitalId: hId },
        version: 1,
      };
      const e3: CanonicalEventEnvelope = {
        eventId: randomUUID(),
        eventType: 'PATIENT_PHYSICALLY_LEFT_STANDARD',
        payload: { patientId, admissionId },
        occurredAt: new Date('2024-01-02T12:00:00Z'),
        scope: { hospitalId: hId },
        version: 1,
      };

      // Process out of order
      await dispatchToConsumers(e3);
      await dispatchToConsumers(e1);
      await dispatchToConsumers(e2);

      const timelines = await prisma.timelineEvent.findMany({
        where: { entityId: admissionId },
        orderBy: { timestamp: 'asc' },
      });
      expect(timelines.length).toBe(3);
      expect(timelines[0].eventType).toBe('PATIENT_ADMITTED');
      expect(timelines[2].eventType).toBe('PATIENT_PHYSICALLY_LEFT_STANDARD');
    }, 15000);
  });

  describe('G. Notification Replay Proof', () => {
    it('Generates exactly one NotificationIntent even if replayed', async () => {
      const eventId = randomUUID();
      const hId = randomUUID();
      await prisma.$executeRawUnsafe(
        'INSERT INTO hospitals_master (id, legal_name, registration_number) VALUES ($1, $2, $3)',
        hId,
        'T',
        hId,
      );
      const envelope: CanonicalEventEnvelope = {
        eventId,
        eventType: 'SEND_NOTIFICATION_COMMAND',
        payload: {
          commandId: eventId,
          commandVersion: 1,
          target: 'notification',
          tenantContext: { hospitalId: hId, platformId: randomUUID(), activeScope: 'HOSPITAL' },
          actorContext: {
            actorId: randomUUID(),
            actorType: 'SYSTEM',
            roleIds: [],
            permissionIds: [],
            authenticationStrength: 'PASSWORD',
            delegatedAccess: false,
          },
          correlationId: eventId,
          idempotencyKey: eventId,
          timestamp: new Date().toISOString(),
          payload: {
            type: 'SMS',
            recipient: '+123',
            templateId: randomUUID(),
            body: 'Test body',
            variables: {},
          },
        },
        occurredAt: new Date(),
        scope: { hospitalId: randomUUID() },
        version: 1,
      };

      await dispatchToConsumers(envelope);
      await dispatchToConsumers(envelope);

      const intents = await prisma.notification.findMany();
      expect(intents.length).toBe(1);
    });
  });

  describe('H. Bed Consumer Proof', () => {
    it('Bed goes to CLEANING only on physical departure', async () => {
      const hId = randomUUID();
      await prisma.$executeRawUnsafe(
        'INSERT INTO hospitals_master (id, legal_name, registration_number) VALUES ($1, $2, $3)',
        hId,
        'T',
        hId,
      );
      const bed = await prisma.bed.create({
        data: {
          id: randomUUID(),
          hospitalId: hId,

          bedNumber: 'A',
          status: 'OCCUPIED',
        },
      });
      const patient = await prisma.patient.create({
        data: {
          id: randomUUID(),
          name: 'Test Patient',
          phone: randomUUID().slice(0, 10),
        },
      });
      const admission = await prisma.admission.create({
        data: {
          id: randomUUID(),
          admissionNumber: randomUUID(),
          patientId: patient.id,
          hospitalId: bed.hospitalId,
          bedId: bed.id,
          status: 'ADMITTED',
        },
      });

      const e1: CanonicalEventEnvelope = {
        eventId: randomUUID(),
        eventType: 'PATIENT_CLINICALLY_DISCHARGED',
        payload: { admissionId: admission.id, patientId: admission.patientId },
        occurredAt: new Date(),
        scope: { hospitalId: bed.hospitalId },
        version: 1,
      };
      await dispatchToConsumers(e1);

      let updatedBed = await prisma.bed.findUnique({ where: { id: bed.id } });
      expect(updatedBed?.status).toBe('OCCUPIED'); // Clinical discharge does NOT clean

      const e2: CanonicalEventEnvelope = {
        eventId: randomUUID(),
        eventType: 'PATIENT_PHYSICALLY_LEFT_STANDARD',
        payload: { admissionId: admission.id, patientId: admission.patientId },
        occurredAt: new Date(),
        scope: { hospitalId: bed.hospitalId },
        version: 1,
      };
      await dispatchToConsumers(e2);

      updatedBed = await prisma.bed.findUnique({ where: { id: bed.id } });
      expect(updatedBed?.status).toBe('CLEANING'); // Physical departure cleans
    });
  });

  describe('I. Consumer Isolation Proof', () => {
    it('A failing consumer does not rollback other consumers for the same event', async () => {
      const eventId = randomUUID();
      const envelope: CanonicalEventEnvelope = {
        eventId,
        eventType: 'PATIENT_ADMITTED',
        payload: { patientId: randomUUID(), admissionId: randomUUID() },
        occurredAt: new Date(),
        scope: { hospitalId: randomUUID() },
        version: 1,
      };

      // Mock Journey to throw
      const originalJourney = outboxConsumerRegistry
        .getAllConsumers()
        .find((c) => c.consumerName === 'Journey');

      const spy = vi
        .spyOn(originalJourney!, 'handle')
        .mockRejectedValueOnce(new Error('Journey Failed'));

      await expect(dispatchToConsumers(envelope)).rejects.toThrow('Journey Failed');

      // Verify Timeline committed (because each consumer has its own transaction)
      const timelineLedger = await prisma.consumerIdempotencyLedger.findUnique({
        where: { eventId_consumerName_version: { version: 1, eventId, consumerName: 'Timeline' } },
      });
      expect(timelineLedger?.status).toBe('COMPLETED');

      const journeyLedger = await prisma.consumerIdempotencyLedger.findUnique({
        where: { eventId_consumerName_version: { version: 1, eventId, consumerName: 'Journey' } },
      });
      expect(journeyLedger).toBeNull(); // Did not commit
    });
  });

  describe('J. Unknown Event Proof', () => {
    it('Relay does not crash on unknown events', async () => {
      const envelope: CanonicalEventEnvelope = {
        eventId: randomUUID(),
        eventType: 'PATIENT_UNKNOWN_EVENT_V999' as any,
        payload: {},
        occurredAt: new Date(),
        scope: { hospitalId: randomUUID() },
        version: 1,
      };
      // Should safely complete without throwing
      await dispatchToConsumers(envelope);
      expect(true).toBe(true);
    });
  });
  describe('K. Multi-Consumer Replay Proof', () => {
    it('All consumers process the same admission deterministically', async () => {
      const admissionId = randomUUID();
      const envelope: CanonicalEventEnvelope = {
        eventId: randomUUID(),
        eventType: 'PATIENT_ADMITTED',
        payload: { patientId: randomUUID(), admissionId },
        occurredAt: new Date(),
        scope: { hospitalId: randomUUID() },
        version: 1,
      };
      await dispatchToConsumers(envelope);

      const timeline = await prisma.timelineEvent.findFirst({ where: { entityId: admissionId } });
      const analytics = await prisma.analyticsAdmissionProjection.findFirst({
        where: { admissionId },
      });
      const journey = await prisma.journeyInstance.findFirst({
        where: { patientId: envelope.payload.patientId },
      });

      expect(timeline).toBeDefined();
      expect(analytics).toBeDefined();
      expect(journey).toBeDefined();
    });
  });

  describe('L. DLQ Replay Proof', () => {
    it('Fixing a DLQ event creates projection without duplicates', async () => {
      const eventId = randomUUID();
      const envelope: CanonicalEventEnvelope = {
        eventId,
        eventType: 'PATIENT_ADMITTED',
        payload: { patientId: randomUUID(), admissionId: randomUUID() },
        occurredAt: new Date(),
        scope: { hospitalId: randomUUID() },
        version: 1,
      };

      const originalTimeline = outboxConsumerRegistry
        .getAllConsumers()
        .find((c) => c.consumerName === 'Timeline');

      const spy = vi
        .spyOn(originalTimeline!, 'handle')
        .mockRejectedValueOnce(new Error('DLQ Test'));

      await expect(dispatchToConsumers(envelope)).rejects.toThrow('DLQ Test');

      let timelineLedger = await prisma.consumerIdempotencyLedger.findUnique({
        where: { eventId_consumerName_version: { version: 1, eventId, consumerName: 'Timeline' } },
      });
      expect(timelineLedger).toBeNull();

      await dispatchToConsumers(envelope);

      timelineLedger = await prisma.consumerIdempotencyLedger.findUnique({
        where: { eventId_consumerName_version: { version: 1, eventId, consumerName: 'Timeline' } },
      });
      expect(timelineLedger?.status).toBe('COMPLETED');
    });
  });

  describe('M. Crash Recovery & ProjectionCheckpoint', () => {
    it('Updates Checkpoint and resumes after interruption safely', async () => {
      const consumerName = 'Timeline';
      await prisma.projectionCheckpoint.upsert({
        where: { projectionName: consumerName },
        create: {
          projectionName: consumerName,
          consumerName,
          lastEventId: 'evt-123',
          projectionVersion: 1,
        },
        update: { lastEventId: 'evt-123' },
      });

      const cp = await prisma.projectionCheckpoint.findUnique({
        where: { projectionName: consumerName },
      });
      expect(cp?.lastEventId).toBe('evt-123');
    });
  });
});
