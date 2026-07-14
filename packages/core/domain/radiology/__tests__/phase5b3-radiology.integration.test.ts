import { PrismaClient } from '@prisma/client';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

import { AuthorizationService } from '../../authorization/service';
import { OutboxService } from '../../outbox/service';
import { AcquisitionService } from '../AcquisitionService';
import { CriticalFindingService } from '../CriticalFindingService';
import { ExecutionService } from '../ExecutionService';
import { RadiologyConsumer } from '../RadiologyConsumer';
import { ReportService } from '../ReportService';
import { SchedulingService } from '../SchedulingService';

const prisma = new PrismaClient();
const outbox = new OutboxService();

const executionService = new ExecutionService(prisma);
const schedulingService = new SchedulingService(prisma, outbox);
const acquisitionService = new AcquisitionService(prisma, outbox);
const reportService = new ReportService(prisma, outbox);
const findingService = new CriticalFindingService(prisma, outbox);
const consumer = new RadiologyConsumer(prisma);
const authService = new AuthorizationService(prisma);

describe('Phase 5B.3 - Radiology Execution Engine', () => {
  let hospitalId: string;
  let patientId: string;
  let orderId: string;
  let radiologyItemId: string;
  let modalityId: string;
  let executionId: string;
  let executionItemId: string;
  let studyInstanceUID: string;
  let sopInstanceUID: string;
  let catalogVersion: any;

  beforeAll(async () => {
    // 1. Setup Data
    hospitalId = 'hosp_rad_1';
    patientId = 'pat_rad_1';
    studyInstanceUID = `1.2.840.113619.2.55.3.2831168128.530.1420790184.${Date.now()}`;
    sopInstanceUID = `1.2.840.113619.2.55.3.2831168128.530.1420790184.2.${Date.now()}`;

    // Create Modality
    const modality = await prisma.modalityDevice.create({
      data: {
        hospitalId,
        name: 'Main CT Scanner',
        modality: 'CT',
        status: 'ACTIVE',
        supportsDicom: true,
      },
    });
    modalityId = modality.id;

    // Create Order and Item
    catalogVersion = await prisma.clinicalOrderCatalogVersion.create({
      data: {
        versionNumber: 1,
        createdBy: 'admin_1',
        catalog: {
          create: {
            hospitalId,
            type: 'RADIOLOGY',
            code: `CT-HEAD-${Date.now()}`,
            name: 'CT Head W/O Contrast',
          },
        },
      },
    });

    const order = await prisma.order.create({
      data: {
        hospitalId,
        patientId,
        orderedBy: 'doc_1',
        clinicalContext: 'OPD',
        items: {
          create: {
            catalogVersionId: catalogVersion.id,
            status: 'REQUESTED',
          },
        },
      },
      include: { items: true },
    });

    orderId = order.id;
    radiologyItemId = order.items[0].id;
  });

  afterAll(async () => {
    await prisma.radiologyCriticalFinding.deleteMany();
    await prisma.radiologyReportVersion.deleteMany();
    await prisma.radiologyReport.deleteMany();
    await prisma.contrastAdministration.deleteMany();
    await prisma.imagingInstance.deleteMany();
    await prisma.imagingSeries.deleteMany();
    await prisma.imagingStudy.deleteMany();
    await prisma.acquisitionSession.deleteMany();
    await prisma.radiologyExecutionItem.deleteMany();
    await prisma.radiologyExecution.deleteMany();
    await prisma.radiologyAppointment.deleteMany();
    await prisma.modalityDevice.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.clinicalOrderCatalogVersion.deleteMany();
    await prisma.clinicalOrderCatalog.deleteMany();
    await prisma.$disconnect();
  });

  it('Scenario 1: Consumer provisioning from ORDER_REQUESTED', async () => {
    // Fire the event
    await consumer.handleEvent({
      eventType: 'ORDER_REQUESTED',
      payload: { orderId },
    });

    const execution = await prisma.radiologyExecution.findUnique({
      where: { orderId },
      include: { items: true },
    });

    expect(execution).toBeDefined();
    expect(execution?.status).toBe('PENDING_SCHEDULING');
    expect(execution?.items.length).toBe(1);

    executionId = execution!.id;
    executionItemId = execution!.items[0].id;
  });

  it('Scenario 2 & 4: Appointment scheduling & Concurrent Booking Conflict', async () => {
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 30 * 60000); // 30 mins

    await schedulingService.scheduleAppointment({
      executionId,
      modalityId,
      startTime,
      endTime,
    });

    const execution = await prisma.radiologyExecution.findUnique({
      where: { id: executionId },
      include: { appointment: true },
    });

    expect(execution?.status).toBe('SCHEDULED');
    expect(execution?.appointmentId).toBeDefined();

    // Concurrent Booking Test (Scenario 4)
    const overlappingStartTime = new Date(startTime.getTime() + 15 * 60000);
    const overlappingEndTime = new Date(overlappingStartTime.getTime() + 30 * 60000);

    // Create another execution to test conflict
    const dummyOrder1 = await prisma.order.create({
      data: {
        hospitalId,
        patientId,
        orderedBy: 'doc_1',
        clinicalContext: 'OPD',
        items: { create: { catalogVersionId: catalogVersion.id, status: 'REQUESTED' } },
      },
    });
    const dummyExec = await prisma.radiologyExecution.create({
      data: {
        hospitalId,
        patientId,
        orderId: dummyOrder1.id,
        status: 'PENDING_SCHEDULING',
      },
    });

    await expect(
      schedulingService.scheduleAppointment({
        executionId: dummyExec.id,
        modalityId,
        startTime: overlappingStartTime,
        endTime: overlappingEndTime,
      }),
    ).rejects.toThrow('Appointment time conflict with existing booking');
  });

  it('Scenario 5 & 19: Concurrent Arrival & Arrival', async () => {
    await schedulingService.arrivePatient({ executionId });

    const execution = await prisma.radiologyExecution.findUnique({
      where: { id: executionId },
    });

    expect(execution?.status).toBe('ARRIVED');

    // Scenario 19: Concurrent Arrival - double arrival throws
    await expect(schedulingService.arrivePatient({ executionId })).rejects.toThrow(
      'Patient already arrived',
    );
  });

  it('Scenario 3: Walk-in Acquisition', async () => {
    const dummyOrder2 = await prisma.order.create({
      data: {
        hospitalId,
        patientId,
        orderedBy: 'doc_1',
        clinicalContext: 'OPD',
        items: { create: { catalogVersionId: catalogVersion.id, status: 'REQUESTED' } },
      },
      include: { items: true },
    });
    const dummyExec = await prisma.radiologyExecution.create({
      data: {
        hospitalId,
        patientId,
        orderId: dummyOrder2.id,
        status: 'PENDING_SCHEDULING',
        items: {
          create: {
            orderItemId: dummyOrder2.items[0].id,
            status: 'PENDING_SCHEDULING',
            modality: 'XRAY',
          },
        },
      },
      include: { items: true },
    });

    // Walk-in - Arrive directly without scheduling
    await schedulingService.arrivePatient({ executionId: dummyExec.id });

    const exec = await prisma.radiologyExecution.findUnique({ where: { id: dummyExec.id } });
    expect(exec?.status).toBe('ARRIVED');
  });

  it('Scenario 6 & 8: Image Acquisition & AcquisitionSession', async () => {
    await acquisitionService.acquireImages({
      executionId,
      executionItemId,
      modalityId,
      studyInstanceUID,
      accessionNumber: `ACC-${Date.now()}`,
      series: [
        {
          seriesInstanceUID: `${studyInstanceUID}.1`,
          seriesNumber: 1,
          modality: 'CT',
          instances: [
            {
              sopInstanceUID,
              instanceNumber: 1,
              storageUri: 's3://dicom/1.dcm',
              mimeType: 'application/dicom',
            },
          ],
        },
      ],
      contrast: {
        contrastType: 'IODINE',
        agentName: 'Omnipaque',
        dose: 100,
        unit: 'ml',
        route: 'IV',
        reactionObserved: false,
      },
    });

    const execution = await prisma.radiologyExecution.findUnique({
      where: { id: executionId },
      include: { items: true, sessions: true },
    });

    expect(execution?.status).toBe('ACQUIRED');
    expect(execution?.sessions.length).toBe(1);

    const study = await prisma.imagingStudy.findUnique({
      where: { studyInstanceUID },
      include: { series: { include: { instances: true } } },
    });

    expect(study).toBeDefined();
    expect(study?.series[0].instances[0].sopInstanceUID).toBe(sopInstanceUID);
  });

  it('Scenario 7: Duplicate StudyInstanceUID / SOPInstanceUID', async () => {
    // Scenario 7: Duplicate StudyInstanceUID
    await expect(
      acquisitionService.acquireImages({
        executionId,
        executionItemId,
        modalityId,
        studyInstanceUID, // reusing same UID
        accessionNumber: `ACC-${Date.now()}_2`,
        series: [],
      }),
    ).rejects.toThrow(); // Prisma P2002 Unique constraint failed
  });

  it('Scenario 10: Report immutable versioning & Amendment History', async () => {
    // DRAFT -> PRELIMINARY
    await reportService.createReport(
      {
        executionItemId,
        studyId: (await prisma.imagingStudy.findUnique({ where: { studyInstanceUID } }))!.id,
        text: 'No acute intracranial hemorrhage.',
        isPreliminary: true,
      },
      'dr_rad_1',
    );

    const execution = await prisma.radiologyExecution.findUnique({
      where: { id: executionId },
    });
    expect(execution?.status).toBe('REPORTING');

    const report = await prisma.radiologyReport.findUnique({
      where: { executionItemId },
      include: { versions: true, activeVersion: true },
    });

    expect(report?.status).toBe('PRELIMINARY');
    expect(report?.versions.length).toBe(1);

    // PRELIMINARY -> FINAL
    await reportService.verifyReport({ reportId: report!.id }, 'dr_rad_senior_1');

    const verifiedReport = await prisma.radiologyReport.findUnique({
      where: { id: report!.id },
    });
    expect(verifiedReport?.status).toBe('FINAL');

    // FINAL -> AMENDED
    await reportService.amendReport(
      {
        reportId: report!.id,
        text: 'No acute intracranial hemorrhage. Incidental tiny meningioma noted.',
        reason: 'Missed finding on preliminary review',
      },
      'dr_rad_senior_1',
    );

    const amendedReport = await prisma.radiologyReport.findUnique({
      where: { id: report!.id },
      include: { versions: { orderBy: { versionNumber: 'asc' } }, activeVersion: true },
    });

    expect(amendedReport?.status).toBe('AMENDED');
    expect(amendedReport?.versions.length).toBe(2);
    expect(amendedReport?.activeVersion?.versionNumber).toBe(2);
    expect(amendedReport?.versions[0].text).toBe('No acute intracranial hemorrhage.');
  }, 15000);

  it('Scenario 11: Duplicate report verification prevention', async () => {
    const report = await prisma.radiologyReport.findUnique({
      where: { executionItemId },
    });

    // Report is AMENDED (which is a terminal verified-like state or needs re-verification).
    // Let's try verifying an already verified/amended report
    await expect(
      reportService.verifyReport({ reportId: report!.id }, 'dr_rad_senior_1'),
    ).rejects.toThrow('Report cannot be verified in status AMENDED');
  });

  it('Scenario 12: Critical finding notification', async () => {
    const report = await prisma.radiologyReport.findUnique({
      where: { executionItemId },
    });

    await findingService.detectCriticalFinding({
      reportId: report!.id,
      finding: 'Subarachnoid Hemorrhage',
      severity: 'CRITICAL',
    });

    const finding = await prisma.radiologyCriticalFinding.findFirst({
      where: { reportId: report!.id },
    });

    expect(finding).toBeDefined();
    expect(finding?.acknowledgedBy).toBeNull();

    await findingService.acknowledgeFinding(
      {
        findingId: finding!.id,
        communicationLog: 'Called ED doc, handed over patient',
      },
      'dr_rad_senior_1',
    );

    const acked = await prisma.radiologyCriticalFinding.findUnique({
      where: { id: finding!.id },
    });

    expect(acked?.acknowledgedBy).toBe('dr_rad_senior_1');
    expect(acked?.communicationLog).toBe('Called ED doc, handed over patient');
  });

  it('Scenario 13: Authorization (Technician vs Radiologist)', async () => {
    // Use the auth service
    const techActor = { id: 'tech_1', role: 'RADIOLOGY_TECH' };
    const radActor = { id: 'rad_1', role: 'RADIOLOGIST' };

    // Tech can acquire
    const acquireAuth = await authService.authorize({
      actor: techActor,
      action: 'RADIOLOGY_ACQUIRE' as any,
      resource: {},
    });
    expect(acquireAuth.decision).toBe('ALLOW');

    // Tech CANNOT verify
    const verifyAuthTech = await authService.authorize({
      actor: techActor,
      action: 'RADIOLOGY_REPORT_FINAL' as any,
      resource: {},
    });
    expect(verifyAuthTech.decision).toBe('DENY');

    // Rad CAN verify
    const verifyAuthRad = await authService.authorize({
      actor: radActor,
      action: 'RADIOLOGY_REPORT_FINAL' as any,
      resource: {},
    });
    expect(verifyAuthRad.decision).toBe('ALLOW');
  });

  it('Scenario 17: Cancellation before & after acquisition', async () => {
    // Before acquisition
    const orderBefore = await prisma.order.create({
      data: {
        hospitalId,
        patientId,
        orderedBy: 'doc_1',
        clinicalContext: 'OPD',
        items: {
          create: {
            catalogVersionId: catalogVersion.id,
            status: 'REQUESTED',
          },
        },
      },
      include: { items: true },
    });

    await consumer.handleEvent({
      eventType: 'ORDER_REQUESTED',
      payload: { orderId: orderBefore.id },
    });

    await executionService.cancelExecution(orderBefore.id, 'Patient refused');
    const execBefore = await prisma.radiologyExecution.findUnique({
      where: { orderId: orderBefore.id },
    });
    expect(execBefore?.status).toBe('CANCELLED');

    // After acquisition (Current executionId)
    await expect(executionService.cancelExecution(orderId, 'Too late')).rejects.toThrow(
      'Cannot cancel execution in state REPORT_VERIFIED',
    );
    // status actually might be REPORTING or REPORT_VERIFIED depending on how we treat AMENDED
    // our code maps to REPORT_VERIFIED usually.
  });
});
