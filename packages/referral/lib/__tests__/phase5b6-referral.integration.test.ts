import {
  PrismaClient,
  ReferralStatus,
  ReferralOutcome,
  CommunicationStatus,
  CareTransferStatus,
  RelationshipLevel,
  RelationshipStatus,
  CarePurpose,
  RelationshipTrigger,
} from '@prisma/client';
import { randomUUID } from 'crypto';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

import { AuthorizationService } from '@haspataal/authorization';
import { DomainAction } from '@haspataal/core/domain/authorization/types';
import { OutboxService } from '@haspataal/core/domain/outbox/service';
import { CareTransferService } from '../CareTransferService';
import { CommunicationService } from '../CommunicationService';
import { ConsultationService } from '../ConsultationService';
import { OutcomeService } from '../OutcomeService';
import { ReferralConsumer } from '../ReferralConsumer';
import { ReferralExecutionService } from '../ReferralExecutionService';
import { SchedulingService } from '../SchedulingService';
import { ReferralEventType } from '../types';

describe('Phase 5B.6 - Referral & Care Coordination Execution Engine', () => {
  let prisma: PrismaClient;
  let outbox: OutboxService;
  let authService: AuthorizationService;
  let consumer: ReferralConsumer;
  let executionService: ReferralExecutionService;
  let consultationService: ConsultationService;
  let schedulingService: SchedulingService;
  let careTransferService: CareTransferService;
  let communicationService: CommunicationService;
  let outcomeService: OutcomeService;

  let testHospitalId: string;
  let testPatientId: string;
  const primaryDoctorId: string = 'doc_primary';
  const consultingDoctorId: string = 'doc_consult';
  const externalDoctorId: string = 'doc_external';

  let testOrderId: string;
  let testExecutionId: string;
  let testExecutionItemId: string;
  let testCatalogVersionId: string;

  beforeAll(async () => {
    prisma = new PrismaClient();
    outbox = new OutboxService(prisma);
    authService = new AuthorizationService(prisma);
    consumer = new ReferralConsumer(prisma, outbox);
    executionService = new ReferralExecutionService(prisma, outbox);
    consultationService = new ConsultationService(prisma, outbox);
    schedulingService = new SchedulingService(prisma, outbox);
    careTransferService = new CareTransferService(prisma, outbox);
    communicationService = new CommunicationService(prisma, outbox);
    outcomeService = new OutcomeService(prisma, outbox);

    const hospital = await prisma.hospitalsMaster.create({
      data: {
        legalName: 'Referral Test Hospital',
        registrationNumber: `REF-${randomUUID()}`,
        stateRegistrationNumber: 'STATE-REF-123',
        addressLine1: 'Referral Street 1',
        officialEmail: `ref-${randomUUID()}@test.com`,
      },
    });
    testHospitalId = hospital.id;

    const patient = await prisma.patient.create({
      data: {
        name: 'Jane Doe Referral',
        dob: new Date('1990-01-01'),
        gender: 'FEMALE',
        phone: `${Math.floor(Math.random() * 10000000000)}`,
      },
    });
    testPatientId = patient.id;

    await prisma.doctorPatientRelationship.create({
      data: {
        patientId: testPatientId,
        doctorId: primaryDoctorId,
        level: RelationshipLevel.LONGITUDINAL,
        status: RelationshipStatus.ACTIVE,
        carePurpose: CarePurpose.PRIMARY_TREATMENT,
        sourceTrigger: RelationshipTrigger.ADMISSION,
        activatedAt: new Date(),
      },
    });

    const cat = await prisma.clinicalOrderCatalog.create({
      data: {
        hospitalId: testHospitalId,
        code: 'REF_CARDIO',
        name: 'Cardiology Referral',
        type: 'REFERRAL',
        versions: {
          create: [{ versionNumber: 1, createdBy: 'test' }],
        },
      },
      include: { versions: true },
    });
    testCatalogVersionId = cat.versions[0].id;

    const order = await prisma.order.create({
      data: {
        hospitalId: testHospitalId,
        patientId: testPatientId,
        clinicalContext: 'IPD',
        orderedBy: primaryDoctorId,
        items: {
          create: [
            {
              catalogVersionId: testCatalogVersionId,
              quantity: 1,
            },
          ],
        },
      },
      include: { items: true },
    });
    testOrderId = order.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('A. Consumer provisioning & D. Multiple recipients', async () => {
    const order = await prisma.order.findUniqueOrThrow({
      where: { id: testOrderId },
      include: { items: true },
    });

    const payload = {
      orderType: 'REFERRAL',
      orderId: order.id,
      hospitalId: testHospitalId,
      patientId: testPatientId,
      orderedBy: primaryDoctorId,
      items: [
        {
          orderItemId: order.items[0].id,
          referralType: 'INTERNAL_CROSS_DEPARTMENT',
          priority: 'URGENT',
          clinicalSummary: 'Patient complains of chest pain.',
          reasonForReferral: 'Evaluation for suspected angina.',
          recipients: [
            {
              recipientType: 'DEPARTMENT',
              recipientName: 'Cardiology Department',
            },
            {
              recipientType: 'DOCTOR',
              recipientId: consultingDoctorId,
              recipientName: 'Dr. Consult',
            },
          ],
        },
      ],
    };

    await consumer.handleOrderRequested(payload, testHospitalId, testPatientId);

    const execution = await prisma.referralExecution.findFirstOrThrow({
      where: { orderId: order.id },
      include: { items: { include: { recipients: true } } },
    });

    expect(execution.referralType).toBe('INTERNAL_CROSS_DEPARTMENT');
    expect(execution.priority).toBe('URGENT');
    expect(execution.status).toBe(ReferralStatus.DRAFT);
    expect(execution.items).toHaveLength(1);
    expect(execution.items[0].recipients).toHaveLength(2);

    testExecutionId = execution.id;
    testExecutionItemId = execution.items[0].id;

    const events = await prisma.outboxEvent.findMany({
      where: { aggregateId: testPatientId },
      orderBy: { createdAt: 'desc' },
    });
    console.log(
      'Outbox events:',
      events.map((e) => e.eventType),
    );
    expect(events.some((e) => e.eventType === ReferralEventType.REFERRAL_CREATED)).toBe(true);
  });

  it('B. Submit internal consultation & send communication', async () => {
    await executionService.submitReferral(testExecutionId, primaryDoctorId);

    const execution = await prisma.referralExecution.findUniqueOrThrow({
      where: { id: testExecutionId },
    });
    expect(execution.status).toBe(ReferralStatus.SENT);

    await communicationService.recordCommunication({
      executionId: testExecutionId,
      channel: 'IN_APP',
      recipientAddress: consultingDoctorId,
      subject: 'New Referral',
      body: 'Please review referral.',
      sentBy: primaryDoctorId,
    });

    const comms = await communicationService.getCommunicationHistory(testExecutionId);
    expect(comms).toHaveLength(1);
    expect(comms[0].status).toBe(CommunicationStatus.SENT);
  });

  it('E. Referral accepted (Advice Only)', async () => {
    await consultationService.acceptReferral(
      testExecutionItemId,
      consultingDoctorId,
      'Will review.',
      true,
    );

    const item = await prisma.referralExecutionItem.findUniqueOrThrow({
      where: { id: testExecutionItemId },
      include: { responses: true, execution: true },
    });

    expect(item.status).toBe(ReferralStatus.ACCEPTED);
    expect(item.execution.status).toBe(ReferralStatus.ACCEPTED);
    expect(item.responses[0].decision).toBe('ACCEPTED');
    expect(item.responses[0].isAdviceOnly).toBe(true);
  });

  it('G. Appointment scheduling', async () => {
    const scheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await schedulingService.scheduleAppointment(
      testExecutionItemId,
      'admin_user',
      scheduledAt,
      'Room 101',
    );

    const item = await prisma.referralExecutionItem.findUniqueOrThrow({
      where: { id: testExecutionItemId },
      include: { appointments: true },
    });

    expect(item.status).toBe(ReferralStatus.APPOINTMENT_SCHEDULED);
    expect(item.appointments).toHaveLength(1);
    expect(item.appointments[0].status).toBe('SCHEDULED');
  });

  it('H. Advice-only completion (NO transfer of care)', async () => {
    await consultationService.startConsultation(testExecutionId, consultingDoctorId);

    await outcomeService.recordOutcome(
      testExecutionItemId,
      ReferralOutcome.ADVICE_ONLY,
      consultingDoctorId,
      {
        clinicalFinding: 'Non-cardiac chest pain.',
        recommendationSummary: 'Reassure patient. No cardiac meds needed.',
      },
    );

    await consultationService.completeConsultation(testExecutionId, consultingDoctorId);

    const execution = await prisma.referralExecution.findUniqueOrThrow({
      where: { id: testExecutionId },
    });
    expect(execution.status).toBe(ReferralStatus.CONSULTATION_COMPLETED);

    const activeRels = await prisma.doctorPatientRelationship.findMany({
      where: { patientId: testPatientId, status: 'ACTIVE' },
    });
    expect(activeRels).toHaveLength(1);
    expect(activeRels[0].doctorId).toBe(primaryDoctorId);
  });

  it('I. Transfer request', async () => {
    const transfer = await careTransferService.requestTransfer(
      testExecutionId,
      primaryDoctorId,
      consultingDoctorId,
      testPatientId,
      primaryDoctorId,
      'Requires specialist longitudinal care.',
    );

    expect(transfer.status).toBe(CareTransferStatus.REQUESTED);

    const execution = await prisma.referralExecution.findUniqueOrThrow({
      where: { id: testExecutionId },
    });
    expect(execution.status).toBe(ReferralStatus.CARE_TRANSFER_REQUESTED);
  });

  it('J. Transfer accepted & L. Verify primary doctor changes ONLY after CareTransfer', async () => {
    const transfer = await prisma.careTransfer.findUniqueOrThrow({
      where: { executionId: testExecutionId },
    });

    await careTransferService.acceptTransfer(transfer.id, consultingDoctorId);
    const updatedTransfer = await prisma.careTransfer.findUniqueOrThrow({
      where: { id: transfer.id },
    });
    expect(updatedTransfer.status).toBe(CareTransferStatus.ACCEPTED);

    await careTransferService.executeTransfer(transfer.id, 'admin_user');

    const execution = await prisma.referralExecution.findUniqueOrThrow({
      where: { id: testExecutionId },
    });
    expect(execution.status).toBe(ReferralStatus.CARE_TRANSFER_COMPLETED);

    const activeRels = await prisma.doctorPatientRelationship.findMany({
      where: { patientId: testPatientId, status: 'ACTIVE' },
    });
    expect(activeRels).toHaveLength(1);
    expect(activeRels[0].doctorId).toBe(consultingDoctorId);

    const endedRels = await prisma.doctorPatientRelationship.findMany({
      where: { patientId: testPatientId, status: 'ENDED' },
    });
    expect(endedRels).toHaveLength(1);
    expect(endedRels[0].doctorId).toBe(primaryDoctorId);
  });

  it('O. Cancellation after completion is blocked', async () => {
    await executionService.completeReferral(testExecutionId, 'admin_user');

    await expect(
      executionService.cancelReferral(testExecutionId, primaryDoctorId, 'Oops'),
    ).rejects.toThrow(/Cannot cancel referral in terminal status/);
  });

  it('P. Replay reconstruction', async () => {
    const order = await prisma.order.findUniqueOrThrow({
      where: { id: testOrderId },
      include: { items: true },
    });

    const payload = {
      orderType: 'REFERRAL',
      orderId: order.id,
      hospitalId: testHospitalId,
      patientId: testPatientId,
      orderedBy: primaryDoctorId,
      items: [
        {
          orderItemId: order.items[0].id,
          referralType: 'INTERNAL_CROSS_DEPARTMENT',
        },
      ],
    };

    await consumer.handleOrderRequested(payload, testHospitalId, testPatientId);

    const executions = await prisma.referralExecution.findMany({
      where: { orderId: order.id },
    });
    expect(executions).toHaveLength(1);
  });

  it('R. Authorization matrix', async () => {
    const allowed = await authService.authorize({
      actor: { id: 'doc', role: 'DOCTOR' },
      action: DomainAction.REFERRAL_CREATE,
      resource: { patientId: testPatientId },
    });
    expect(allowed.decision).toBe('ALLOW');

    const denied = await authService.authorize({
      actor: { id: 'patient_user', role: 'PATIENT' },
      action: DomainAction.REFERRAL_CREATE,
      resource: { patientId: testPatientId },
    });
    expect(denied.decision).toBe('DENY');

    const nurseTransferDenied = await authService.authorize({
      actor: { id: 'nurse', role: 'NURSE' },
      action: DomainAction.CARE_TRANSFER_EXECUTE,
      resource: { patientId: testPatientId },
    });
    expect(nurseTransferDenied.decision).toBe('DENY');
  });

  it('K. Transfer rejected', async () => {
    const order2 = await prisma.order.create({
      data: {
        hospitalId: testHospitalId,
        patientId: testPatientId,
        clinicalContext: 'IPD',
        orderedBy: consultingDoctorId,
        items: {
          create: [{ catalogVersionId: testCatalogVersionId, quantity: 1 }],
        },
      },
      include: { items: true },
    });

    const res = await executionService.provisionExecution({
      orderId: order2.id,
      orderItemId: order2.items[0].id,
      hospitalId: testHospitalId,
      patientId: testPatientId,
      referralType: 'EXTERNAL_HOSPITAL',
      priority: 'ROUTINE',
      clinicalSummary: '...',
      reasonForReferral: '...',
      requestingDoctorId: consultingDoctorId,
      recipients: [{ recipientType: 'DOCTOR', recipientName: 'Dr. Reject' }],
    });

    const transfer = await careTransferService.requestTransfer(
      res.execution.id,
      consultingDoctorId,
      externalDoctorId,
      testPatientId,
      consultingDoctorId,
      'Transfer to external.',
    );

    await careTransferService.rejectTransfer(
      transfer.id,
      externalDoctorId,
      'Cannot accept patient right now.',
    );

    const updatedTransfer = await prisma.careTransfer.findUniqueOrThrow({
      where: { id: transfer.id },
    });
    expect(updatedTransfer.status).toBe(CareTransferStatus.REJECTED);
  });

  it('N. Cancellation before acceptance', async () => {
    const order3 = await prisma.order.create({
      data: {
        hospitalId: testHospitalId,
        patientId: testPatientId,
        clinicalContext: 'IPD',
        orderedBy: consultingDoctorId,
        items: {
          create: [{ catalogVersionId: testCatalogVersionId, quantity: 1 }],
        },
      },
      include: { items: true },
    });

    const res = await executionService.provisionExecution({
      orderId: order3.id,
      orderItemId: order3.items[0].id,
      hospitalId: testHospitalId,
      patientId: testPatientId,
      referralType: 'EXTERNAL_HOSPITAL',
      priority: 'ROUTINE',
      clinicalSummary: '...',
      reasonForReferral: '...',
      requestingDoctorId: consultingDoctorId,
      recipients: [{ recipientType: 'DOCTOR', recipientName: 'Dr. Slow' }],
    });

    await executionService.submitReferral(res.execution.id, consultingDoctorId);

    await executionService.cancelReferral(
      res.execution.id,
      consultingDoctorId,
      'Patient changed mind.',
    );

    const execution = await prisma.referralExecution.findUniqueOrThrow({
      where: { id: res.execution.id },
    });
    expect(execution.status).toBe(ReferralStatus.CANCELLED);
  });
});
