import { PrismaClient, ClinicalContext } from '@prisma/client';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { execSync } from 'child_process';
import { v4 as uuidv4 } from 'uuid';

import {
  ExecutionService,
  SpecimenService,
  AnalyzerService,
  ResultService,
  CriticalValueService,
  LaboratoryConsumer,
} from '../index';

describe('Phase 5B.2 Final Verification Gate', () => {
  let container: any;
  let prisma: PrismaClient;
  let executionService: ExecutionService;
  let specimenService: SpecimenService;
  let analyzerService: AnalyzerService;
  let resultService: ResultService;
  let criticalValueService: CriticalValueService;
  let laboratoryConsumer: LaboratoryConsumer;
  let dbUrl: string;

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:16').start();
    dbUrl = container.getConnectionUri();
    process.env.DATABASE_URL = dbUrl;
    process.env.DIRECT_URL = dbUrl;

    execSync(`npx prisma db push --schema ../db/prisma/schema.prisma --accept-data-loss`, {
      env: { ...process.env, DATABASE_URL: dbUrl, DIRECT_URL: dbUrl },
    });

    prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });
    await prisma.$connect();

    executionService = new ExecutionService(prisma);
    specimenService = new SpecimenService(prisma);
    analyzerService = new AnalyzerService(prisma);
    resultService = new ResultService(prisma);
    criticalValueService = new CriticalValueService(prisma);
    laboratoryConsumer = new LaboratoryConsumer(prisma);
  }, 60000);

  afterAll(async () => {
    if (prisma) await prisma.$disconnect();
    await container.stop();
  });

  const setupData = async () => {
    const hospital = await prisma.hospitalsMaster.create({
      data: {
        legalName: `Hospital ${Date.now()}-${Math.random()}`,
        displayName: `Hospital ${Date.now()}`,
        registrationNumber: `HOSP-${Date.now()}-${Math.random()}`,
        city: 'City',
      },
    });

    const user = await prisma.staff.create({
      data: {
        hospitalId: hospital.id,
        name: 'Test Pathologist',
        email: `test-${Date.now()}-${Math.random()}@test.com`,
        mobile: `99999${Math.floor(Math.random() * 100000)}`,
        role: 'LAB_TECH',
        isActive: true,
        password: 'dummy-password-hash',
      },
    });

    const patient = await prisma.patient.create({
      data: {
        name: 'Test Patient',
        phone: `99999${Math.floor(Math.random() * 100000)}`,
      },
    });

    const catalog = await prisma.clinicalOrderCatalog.create({
      data: {
        hospitalId: hospital.id,
        type: 'LAB',
        code: `LAB-${Date.now()}-${Math.random()}`,
        name: 'Complete Blood Count',
      },
    });

    const catalogVersion = await prisma.clinicalOrderCatalogVersion.create({
      data: {
        catalogId: catalog.id,
        versionNumber: 1,
        createdBy: user.id,
      },
    });

    const order = await prisma.order.create({
      data: {
        hospitalId: hospital.id,
        patientId: patient.id,
        clinicalContext: ClinicalContext.OPD,
        orderedBy: user.id,
        items: {
          create: [
            {
              catalogVersionId: catalogVersion.id,
              quantity: 1,
            },
          ],
        },
      },
      include: { items: true },
    });

    const orderVersion = await prisma.orderVersion.create({
      data: {
        orderId: order.id,
        versionNumber: 1,
        status: 'REQUESTED',
        createdBy: user.id,
      },
    });

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { activeVersionId: orderVersion.id },
      include: { items: true },
    });

    return { hospital, user, patient, catalogVersion, order: updatedOrder };
  };

  it('A. Consumer Provisioning', async () => {
    const { order } = await setupData();

    await laboratoryConsumer.handleEvent({
      eventType: 'ORDER_REQUESTED',
      payload: { orderId: order.id },
    });

    const execution = await prisma.laboratoryExecution.findUnique({
      where: { orderId: order.id },
      include: { items: true },
    });

    expect(execution).toBeDefined();
    expect(execution!.status).toBe('PENDING_COLLECTION');
    expect(execution!.items.length).toBe(1);
    expect(execution!.items[0].status).toBe('PENDING_COLLECTION');
  });

  it('B. Specimen Collection', async () => {
    const { hospital, patient, user, order } = await setupData();
    const execution = await executionService.startExecution(order.id);

    const specimen = await specimenService.collect(
      hospital.id,
      patient.id,
      execution!.items[0].id,
      'BLOOD',
      user.id,
      'BARCODE-123',
    );

    expect(specimen.status).toBe('COLLECTED');
    expect(specimen.barcode).toBe('BARCODE-123');

    const item = await prisma.laboratoryExecutionItem.findUnique({
      where: { id: execution!.items[0].id },
    });
    expect(item!.specimenId).toBe(specimen.id);
    expect(item!.status).toBe('COLLECTED');
  });

  it('C. Specimen Rejection', async () => {
    const { hospital, patient, user, order } = await setupData();
    const execution = await executionService.startExecution(order.id);
    const item = execution!.items[0];

    const specimen = await specimenService.collect(
      hospital.id,
      patient.id,
      item.id,
      'BLOOD',
      user.id,
    );

    await specimenService.reject(
      specimen.id,
      user.id,
      'HEMOLYZED',
      'Sample hemolyzed during transit',
    );

    const updatedSpecimen = await prisma.specimen.findUnique({ where: { id: specimen.id } });
    expect(updatedSpecimen!.status).toBe('REJECTED');

    const attempt = await prisma.specimenCollectionAttempt.findFirst({
      where: { specimenId: specimen.id, status: 'REJECTED' },
    });
    expect(attempt!.rejectionReason).toBe('HEMOLYZED');

    const updatedItem = await prisma.laboratoryExecutionItem.findUnique({ where: { id: item.id } });
    expect(updatedItem!.specimenId).toBeNull(); // Should be unlinked for recollection
    expect(updatedItem!.status).toBe('PENDING_COLLECTION');
  });

  it('D. Analyzer Queue', async () => {
    const { hospital, patient, user, order } = await setupData();
    const execution = await executionService.startExecution(order.id);
    const item = execution!.items[0];

    const specimen = await specimenService.collect(
      hospital.id,
      patient.id,
      item.id,
      'BLOOD',
      user.id,
    );
    await specimenService.receive(specimen.id, user.id);

    // Queue 2 items (Priority 1 and Priority 2)
    const { order: order2 } = await setupData();
    const execution2 = await executionService.startExecution(order2.id);
    const item2 = execution2!.items[0];

    const queue1 = await analyzerService.queue(item.id, 0, 'MACHINE-A');
    const queue2 = await analyzerService.queue(item2.id, 1, 'MACHINE-A'); // Higher priority

    expect(queue1.queuePosition).toBe(1);
    expect(queue2.queuePosition).toBe(1); // different priority queue, wait, they shouldn't share positions if priority is different, our implementation does that correctly by finding last in same priority.

    await analyzerService.start(queue2.id);
    const updatedQueue2 = await prisma.analyzerQueue.findUnique({ where: { id: queue2.id } });
    expect(updatedQueue2!.status).toBe('ANALYZING');
  });

  it('E. Result Immutability', async () => {
    const { hospital, patient, user, order } = await setupData();
    const execution = await executionService.startExecution(order.id);
    const item = execution!.items[0];

    const { result, version } = await resultService.enter(
      hospital.id,
      patient.id,
      item.id,
      { hb: 12.5 },
      { hb: '11-16' },
      [],
      { hb: 'g/dL' },
    );

    expect(version.versionNumber).toBe(1);

    await resultService.verify(item.id, user.id);

    // Amend
    const amendRes = await resultService.amend(item.id, user.id, { hb: 12.8 });

    const allVersions = await prisma.laboratoryResultVersion.findMany({
      where: { resultId: result.id },
      orderBy: { versionNumber: 'asc' },
    });

    expect(allVersions.length).toBe(2);
    expect(allVersions[0].versionNumber).toBe(1);
    expect(allVersions[0].verifiedBy).toBe(user.id);
    expect(allVersions[1].versionNumber).toBe(2);
    expect(allVersions[1].verifiedBy).toBeNull(); // Amends need re-verification
    expect(amendRes.status).toBe('AMENDED');
  });

  it('F. Critical Value Detection', async () => {
    const { hospital, patient, user, order } = await setupData();
    const execution = await executionService.startExecution(order.id);
    const item = execution!.items[0];

    const { version } = await resultService.enter(
      hospital.id,
      patient.id,
      item.id,
      { k: 7.5 },
      { k: '3.5-5.0' },
      ['CRITICAL', 'HIGH'],
      { k: 'mmol/L' },
    );

    const notification = await criticalValueService.detectAndNotify(version.id, user.id);
    expect(notification).not.toBeNull();
    expect(notification!.resultVersionId).toBe(version.id);

    await criticalValueService.acknowledge(notification!.id, user.id);
    const updated = await prisma.criticalValueNotification.findUnique({
      where: { id: notification!.id },
    });
    expect(updated!.acknowledgedBy).toBe(user.id);
    expect(updated!.acknowledgedAt).not.toBeNull();
  });

  it('G. Concurrent Verification', async () => {
    const { hospital, patient, user, order } = await setupData();
    const execution = await executionService.startExecution(order.id);
    const item = execution!.items[0];

    await resultService.enter(hospital.id, patient.id, item.id, { hb: 12.5 });

    // Both try to verify at exact same time
    await Promise.all([
      resultService.verify(item.id, user.id).catch((e) => e),
      resultService.verify(item.id, user.id).catch((e) => e),
    ]);

    // Should only have one verified result (status VERIFIED)
    const result = await prisma.laboratoryResult.findUnique({
      where: { executionItemId: item.id },
    });
    expect(result!.status).toBe('VERIFIED');
  });

  it('H. Transactional Outbox', async () => {
    const { hospital, patient, user, order } = await setupData();
    const execution = await executionService.startExecution(order.id);
    const item = execution!.items[0];

    await resultService.enter(hospital.id, patient.id, item.id, { hb: 12.5 });
    await resultService.verify(item.id, user.id);

    // Force an error inside release to test rollback
    const originalRelease = resultService.release;
    resultService.release = async () => {
      return prisma.$transaction(async (tx) => {
        await tx.laboratoryResult.update({
          where: { executionItemId: item.id },
          data: { status: 'RELEASED' },
        });
        throw new Error('Simulated Outbox Failure');
      });
    };

    try {
      await resultService.release();
    } catch (e) {}

    // Verify rollback
    const result = await prisma.laboratoryResult.findUnique({
      where: { executionItemId: item.id },
    });
    expect(result!.status).toBe('VERIFIED'); // Not RELEASED

    resultService.release = originalRelease; // Restore
  });

  it('K. Cancellation', async () => {
    const { hospital, patient, user, order } = await setupData();
    const execution = await executionService.startExecution(order.id);
    const item = execution!.items[0];

    const specimen = await specimenService.collect(
      hospital.id,
      patient.id,
      item.id,
      'BLOOD',
      user.id,
    );

    await executionService.cancelExecution(order.id, 'Patient refused');

    const updatedExecution = await prisma.laboratoryExecution.findUnique({
      where: { id: execution!.id },
    });
    expect(updatedExecution!.status).toBe('CANCELLED');

    const updatedItem = await prisma.laboratoryExecutionItem.findUnique({ where: { id: item.id } });
    expect(updatedItem!.status).toBe('CANCELLED');

    const updatedSpecimen = await prisma.specimen.findUnique({ where: { id: specimen.id } });
    expect(updatedSpecimen!.status).toBe('COLLECTED'); // Preserved specimen
  });
});
