import {
  PrismaClient,
  BloodRequestStatus,
  CrossmatchStatus,
  BloodUnitStatus,
  TransfusionStatus,
  ReactionSeverity,
  TransfusionReactionOutcome,
  BloodComponentType,
} from '@prisma/client';
import { randomUUID } from 'crypto';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

import { OutboxService } from '../../outbox/service';
import { AllocationService } from '../AllocationService';
import { BloodBankConsumer } from '../BloodBankConsumer';
import { CrossmatchService } from '../CrossmatchService';
import { BloodBankExecutionService } from '../ExecutionService';
import { IssueService } from '../IssueService';
import { ReactionService } from '../ReactionService';
import { TransfusionService } from '../TransfusionService';

describe('Phase 5B.5 - Blood Bank & Transfusion Execution Engine', () => {
  let prisma: PrismaClient;
  let outbox: OutboxService;
  let consumer: BloodBankConsumer;
  let crossmatchService: CrossmatchService;
  let allocationService: AllocationService;
  let issueService: IssueService;
  let transfusionService: TransfusionService;
  let reactionService: ReactionService;
  let testHospitalId: string;
  let testPatientId: string;
  let testOrderId: string;
  let testExecutionItemId: string;
  let bloodUnitId1: string;
  let bloodUnitId2: string;
  let crossmatchId: string;
  let episodeId: string;
  let testCatalogVersionId: string;

  beforeAll(async () => {
    prisma = new PrismaClient();
    outbox = new OutboxService(prisma);
    consumer = new BloodBankConsumer(prisma, outbox);
    crossmatchService = new CrossmatchService(prisma, outbox);
    allocationService = new AllocationService(prisma, outbox);
    issueService = new IssueService(prisma, outbox);
    transfusionService = new TransfusionService(prisma, outbox);
    reactionService = new ReactionService(prisma, outbox);

    // Setup Test Data
    const hospital = await prisma.hospitalsMaster.create({
      data: {
        legalName: 'Blood Bank Test Hospital',
        registrationNumber: `BBD-${randomUUID()}`,
        stateRegistrationNumber: 'STATE-BBD-123',
        addressLine1: 'Test Street 1',
        officialEmail: `bbd-${randomUUID()}@test.com`,
      },
    });
    testHospitalId = hospital.id;

    const patient = await prisma.patient.create({
      data: {
        name: 'John Doe Transfusion',
        dob: new Date('1980-01-01'),
        gender: 'MALE',
        phone: `${Math.floor(Math.random() * 10000000000)}`,
      },
    });
    testPatientId = patient.id;

    // Create Catalog
    const cat = await prisma.clinicalOrderCatalog.create({
      data: {
        hospitalId: testHospitalId,
        code: 'PACKED_RBC',
        name: 'PRBC',
        type: 'BLOOD_BANK',
        versions: {
          create: [{ versionNumber: 1, createdBy: 'test', metadata: { volume: 300 } }],
        },
      },
      include: { versions: true },
    });
    testCatalogVersionId = cat.versions[0].id;

    // Create Blood Units
    const unit1 = await prisma.bloodUnit.create({
      data: {
        hospitalId: testHospitalId,
        isbt128DonationNumber: `W-${randomUUID()}`,
        componentCode: 'E0123',
        componentType: BloodComponentType.PACKED_RBC,
        bloodGroupABO: 'O',
        bloodGroupRh: 'NEG',
        collectionDate: new Date(),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        currentStatus: BloodUnitStatus.AVAILABLE,
      },
    });
    bloodUnitId1 = unit1.id;

    const unit2 = await prisma.bloodUnit.create({
      data: {
        hospitalId: testHospitalId,
        isbt128DonationNumber: `W-${randomUUID()}`,
        componentCode: 'E0123',
        componentType: BloodComponentType.PACKED_RBC,
        bloodGroupABO: 'A',
        bloodGroupRh: 'POS',
        collectionDate: new Date(),
        expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days
        currentStatus: BloodUnitStatus.AVAILABLE,
      },
    });
    bloodUnitId2 = unit2.id;
  });

  afterAll(async () => {
    // Clean up would happen here in a real scenario
    await prisma.$disconnect();
  });

  it('A. Consumer provisioning from ORDER_REQUESTED', async () => {
    const order = await prisma.order.create({
      data: {
        hospitalId: testHospitalId,
        patientId: testPatientId,
        clinicalContext: 'IPD',
        orderedBy: 'doc_1',
        items: {
          create: [{ catalogVersionId: testCatalogVersionId, quantity: 1, status: 'REQUESTED' }],
        },
      },
      include: { items: true },
    });
    testOrderId = order.id;

    await consumer.handleOrderRequested(
      {
        orderType: 'BLOOD_REQUEST',
        orderId: testOrderId,
        items: order.items.map((i: any) => ({ ...i, code: 'PACKED_RBC', volume: 300 })),
        orderedBy: 'doc_1',
      },
      testHospitalId,
      testPatientId,
    );

    const execution = await prisma.bloodBankExecution.findUnique({
      where: { orderId: testOrderId },
      include: { items: true },
    });

    expect(execution).toBeDefined();
    expect(execution?.status).toBe(BloodRequestStatus.REQUESTED);
    expect(execution?.items.length).toBe(1);

    testExecutionItemId = execution!.items[0].id;
  });

  it('B. Crossmatch success', async () => {
    const crossmatch = await crossmatchService.startCrossmatch(
      testExecutionItemId,
      bloodUnitId1,
      'tech_1',
    );
    expect(crossmatch.status).toBe(CrossmatchStatus.PENDING);
    crossmatchId = crossmatch.id;

    const completed = await crossmatchService.completeCrossmatch(
      crossmatchId,
      CrossmatchStatus.COMPATIBLE,
    );
    expect(completed.status).toBe(CrossmatchStatus.COMPATIBLE);
    expect(completed.expiryAt).toBeDefined();

    const item = await prisma.bloodBankExecutionItem.findUnique({
      where: { id: testExecutionItemId },
    });
    expect(item?.status).toBe(BloodRequestStatus.CROSSMATCH_COMPLETE);
  });

  it('E. FIFO blood allocation by expiry', async () => {
    const allocation = await allocationService.allocateUnit(
      testExecutionItemId,
      bloodUnitId1,
      'officer_1',
    );
    expect(allocation.active).toBe(true);

    const unit = await prisma.bloodUnit.findUnique({ where: { id: bloodUnitId1 } });
    expect(unit?.currentStatus).toBe(BloodUnitStatus.RESERVED);

    const item = await prisma.bloodBankExecutionItem.findUnique({
      where: { id: testExecutionItemId },
    });
    expect(item?.status).toBe(BloodRequestStatus.ALLOCATED);
  });

  it('F. Duplicate allocation prevention', async () => {
    await expect(
      allocationService.allocateUnit(testExecutionItemId, bloodUnitId1, 'officer_1'),
    ).rejects.toThrow('Blood unit is not available for allocation.');
  });

  it('G. Concurrent blood issue protection & Issue Success', async () => {
    const issue = await issueService.issueUnit(
      testExecutionItemId,
      bloodUnitId1,
      'officer_1',
      'ward_a',
    );
    expect(issue.active).toBe(true);

    const unit = await prisma.bloodUnit.findUnique({ where: { id: bloodUnitId1 } });
    expect(unit?.currentStatus).toBe(BloodUnitStatus.ISSUED);

    const item = await prisma.bloodBankExecutionItem.findUnique({
      where: { id: testExecutionItemId },
    });
    expect(item?.status).toBe(BloodRequestStatus.ISSUED);

    await expect(
      issueService.issueUnit(testExecutionItemId, bloodUnitId1, 'officer_1', 'ward_b'),
    ).rejects.toThrow('Unit is not allocated');
  });

  it('U. Bedside Verification', async () => {
    const episode = await transfusionService.prepareBedsideVerification(
      (await prisma.bloodIssue.findFirst({ where: { bloodUnitId: bloodUnitId1 } }))!.id,
      testPatientId,
    );
    episodeId = episode.id;

    // Try starting without verification
    await expect(transfusionService.startTransfusion(episodeId, 'nurse_1')).rejects.toThrow(
      'Bedside verification is incomplete',
    );

    const verification = await transfusionService.verifyBedside(
      episodeId,
      'nurse_1',
      true,
      true,
      true,
    );
    expect(verification.patientVerified).toBe(true);
  });

  it('H. Bedside transfusion workflow (Start)', async () => {
    const episode = await transfusionService.startTransfusion(episodeId, 'nurse_1');
    expect(episode.status).toBe(TransfusionStatus.STARTED);

    const item = await prisma.bloodBankExecutionItem.findUnique({
      where: { id: testExecutionItemId },
    });
    expect(item?.status).toBe(BloodRequestStatus.TRANSFUSION_STARTED);
  });

  it('I. Transfusion observation timeline', async () => {
    const obs = await transfusionService.recordObservation(episodeId, 'nurse_1', 'BASELINE', {
      temperature: 37.2,
      pulse: 80,
      bloodPressure: '120/80',
      respiratoryRate: 16,
      oxygenSaturation: 99,
    });
    expect(obs.temperature).toBe(37.2);
  });

  it('V. Reaction During Transfusion & J. Reaction recording', async () => {
    const reaction = await reactionService.recordReaction(
      episodeId,
      'doc_1',
      ReactionSeverity.MODERATE,
      'Fever and chills',
    );
    expect(reaction.severity).toBe(ReactionSeverity.MODERATE);

    const episode = await prisma.transfusionEpisode.findUnique({ where: { id: episodeId } });
    expect(episode?.status).toBe(TransfusionStatus.PAUSED);
  });

  it('K. Reaction acknowledgement', async () => {
    const reaction = await prisma.transfusionReaction.findUnique({ where: { episodeId } });
    const resolved = await reactionService.resolveReaction(
      reaction!.id,
      'doc_2',
      TransfusionReactionOutcome.RESOLVED,
      'Antihistamines given',
    );
    expect(resolved.outcome).toBe(TransfusionReactionOutcome.RESOLVED);
  });

  it('D. Emergency uncrossmatched blood & S. Emergency Override Audit', async () => {
    // New request for emergency override
    const order = await prisma.order.create({
      data: {
        hospitalId: testHospitalId,
        patientId: testPatientId,
        clinicalContext: 'IPD',
        orderedBy: 'doc_1',
        items: {
          create: [{ catalogVersionId: testCatalogVersionId, quantity: 1, status: 'REQUESTED' }],
        },
      },
      include: { items: true },
    });
    await consumer.handleOrderRequested(
      {
        orderType: 'BLOOD_REQUEST',
        orderId: order.id,
        items: order.items.map((i: any) => ({ ...i, code: 'PACKED_RBC', volume: 300 })),
        orderedBy: 'doc_1',
      },
      testHospitalId,
      testPatientId,
    );

    const execution = await prisma.bloodBankExecution.findUnique({
      where: { orderId: order.id },
      include: { items: true },
    });
    const emExecItemId = execution!.items[0].id;

    // Fail to issue without override or crossmatch
    await expect(
      allocationService.allocateUnit(emExecItemId, bloodUnitId2, 'officer_1'),
    ).rejects.toThrow('Allocation requires valid crossmatch or emergency override');

    // Create Override
    const override = await crossmatchService.authorizeEmergencyOverride(
      execution!.id,
      'doc_er',
      'Hemorrhage',
      'Life saving',
    );
    expect(override.reason).toBe('Hemorrhage');

    // Allocation should now succeed
    const allocation = await allocationService.allocateUnit(
      emExecItemId,
      bloodUnitId2,
      'officer_1',
    );
    expect(allocation.active).toBe(true);

    const issue = await issueService.issueUnit(emExecItemId, bloodUnitId2, 'officer_1', 'ER');
    expect(issue.active).toBe(true);
  });
});
