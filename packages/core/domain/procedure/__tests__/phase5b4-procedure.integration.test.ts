import {
  PrismaClient,
  ProcedureExecutionStatus,
  AppointmentStatus,
  ProcedureChecklistStatus,
  AnesthesiaType,
} from '@prisma/client';

import { AuthorizationService } from '../../authorization/service';
import { OutboxService } from '../../outbox/service';
import { AnesthesiaService } from '../AnesthesiaService';
import { ChecklistService } from '../ChecklistService';
import { CriticalIncidentService } from '../CriticalIncidentService';
import { ProcedureExecutionService } from '../ExecutionService';
import { ProcedureConsumer } from '../ProcedureConsumer';
import { ProcedureService } from '../ProcedureService';
import { ReportService } from '../ReportService';
import { SchedulingService } from '../SchedulingService';

const prisma = new PrismaClient();
const outbox = new OutboxService(prisma);
const auth = new AuthorizationService(prisma);

const executionService = new ProcedureExecutionService(prisma);
const schedulingService = new SchedulingService(prisma, outbox);
const checklistService = new ChecklistService(prisma, outbox);
const procedureService = new ProcedureService(prisma, outbox);
const anesthesiaService = new AnesthesiaService(prisma, outbox);
const reportService = new ReportService(prisma, outbox);
const incidentService = new CriticalIncidentService(prisma, outbox);
const consumer = new ProcedureConsumer(prisma);

describe('Phase 5B.4 - Procedure & Operating Theatre Execution Engine', () => {
  let hospitalId: string;
  let patientId: string;
  let doctorId: string;
  let roomId: string;
  let orderId: string;
  let executionId: string;
  let sessionId: string;
  let reportId: string;
  let incidentId: string;

  beforeAll(async () => {
    // 1. Setup Master Data
    const hospital = await prisma.hospitalsMaster.create({
      data: {
        legalName: 'Procedure Test Hospital',
        registrationNumber: 'REG-123',
        stateRegistrationNumber: 'REG-123',
        addressLine1: '123 Test St',
        officialEmail: 'test@example.com',
      },
    });
    hospitalId = hospital.id;

    const patient = await prisma.patient.create({
      data: {
        name: 'Proc Test',
        dob: new Date('1990-01-01'),
        gender: 'MALE',
        phone: '1234567890',
      },
    });
    patientId = patient.id;

    doctorId = 'doc_' + Date.now();

    const catalog = await prisma.clinicalOrderCatalog.create({
      data: {
        hospitalId,
        type: 'PROCEDURE',
        name: 'Standard Appendectomy',
        code: 'PROC-APP-01',
      },
    });

    const catalogVersion = await prisma.clinicalOrderCatalogVersion.create({
      data: {
        catalogId: catalog.id,
        versionNumber: 1,
        createdBy: doctorId,
      },
    });

    // Create Room
    const room = await prisma.procedureRoom.create({
      data: {
        hospitalId,
        name: 'OT-1',
        roomType: 'OT',
        status: 'AVAILABLE',
      },
    });
    roomId = room.id;

    // Create Order
    const order = await prisma.order.create({
      data: {
        hospitalId,
        patientId,
        clinicalContext: 'EMERGENCY',
        orderedBy: doctorId,
        items: {
          create: [
            {
              catalogVersionId: catalogVersion.id,
              status: 'REQUESTED',
            },
          ],
        },
      },
    });
    orderId = order.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.procedureCriticalIncident.deleteMany({
      where: { session: { execution: { hospitalId } } },
    });
    await prisma.procedureReportVersion.deleteMany({
      where: { report: { execution: { hospitalId } } },
    });
    await prisma.procedureReport.deleteMany({ where: { execution: { hospitalId } } });
    await prisma.implantUsage.deleteMany({ where: { session: { execution: { hospitalId } } } });
    await prisma.anesthesiaEpisode.deleteMany({
      where: { session: { execution: { hospitalId } } },
    });
    await prisma.procedureChecklist.deleteMany({
      where: { session: { execution: { hospitalId } } },
    });
    await prisma.procedureSession.deleteMany({ where: { execution: { hospitalId } } });
    await prisma.procedureAppointment.deleteMany({ where: { execution: { hospitalId } } });
    await prisma.procedureExecutionItem.deleteMany({ where: { execution: { hospitalId } } });
    await prisma.procedureExecution.deleteMany({ where: { hospitalId } });
    await prisma.procedureRoom.deleteMany({ where: { hospitalId } });

    await prisma.orderItem.deleteMany({ where: { order: { hospitalId } } });
    await prisma.order.deleteMany({ where: { hospitalId } });
    await prisma.clinicalOrderCatalogVersion.deleteMany({ where: { catalog: { hospitalId } } });
    await prisma.clinicalOrderCatalog.deleteMany({ where: { hospitalId } });
    await prisma.patient.deleteMany({ where: { id: patientId } });
    await prisma.hospitalsMaster.deleteMany({ where: { id: hospitalId } });

    await prisma.$disconnect();
  });

  it('1. Consumer Provisions ProcedureExecution on ORDER_REQUESTED', async () => {
    await consumer.handleOrderRequested({
      orderId,
      type: 'PROCEDURE',
    });

    const execution = await prisma.procedureExecution.findUnique({
      where: { orderId },
      include: { items: true },
    });

    expect(execution).toBeDefined();
    expect(execution?.status).toBe(ProcedureExecutionStatus.PENDING);
    expect(execution?.items.length).toBe(1);

    executionId = execution!.id;
  });

  it('2. Schedule Procedure', async () => {
    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 1);
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 2);

    await schedulingService.scheduleProcedure({
      executionId,
      roomId,
      startTime,
      endTime,
    });

    const execution = await prisma.procedureExecution.findUnique({
      where: { id: executionId },
      include: { appointment: true },
    });

    expect(execution?.status).toBe(ProcedureExecutionStatus.SCHEDULED);
    expect(execution?.appointment).toBeDefined();
    expect(execution?.appointment?.status).toBe(AppointmentStatus.BOOKED);
  });

  it('3. Arrive Patient & Create Session', async () => {
    await procedureService.arrivePatient({ executionId });

    const execution = await prisma.procedureExecution.findUnique({
      where: { id: executionId },
      include: { session: true },
    });

    expect(execution?.status).toBe(ProcedureExecutionStatus.PRE_OP);
    expect(execution?.session).toBeDefined();

    sessionId = execution!.session!.id;
  });

  it('4. Fail to Start Procedure before TIME_OUT Checklist', async () => {
    await expect(procedureService.startProcedure({ sessionId })).rejects.toThrow(/TIME_OUT/);
  });

  it('5. Complete SIGN_IN and TIME_OUT Checklists', async () => {
    await checklistService.signIn({ sessionId }, doctorId);
    let session = await prisma.procedureSession.findUnique({
      where: { id: sessionId },
      include: { checklist: true },
    });
    expect(session?.checklist?.status).toBe(ProcedureChecklistStatus.SIGN_IN_COMPLETE);

    await checklistService.timeOut({ sessionId }, doctorId);
    session = await prisma.procedureSession.findUnique({
      where: { id: sessionId },
      include: { checklist: true },
    });
    expect(session?.checklist?.status).toBe(ProcedureChecklistStatus.TIME_OUT_COMPLETE);
  });

  it('6. Start Procedure Successfully', async () => {
    await procedureService.startProcedure({ sessionId });

    const session = await prisma.procedureSession.findUnique({
      where: { id: sessionId },
      include: { execution: true },
    });

    expect(session?.procedureStartedAt).toBeDefined();
    expect(session?.execution.status).toBe(ProcedureExecutionStatus.IN_PROGRESS);
  });

  it('7. Manage Anesthesia Episode', async () => {
    await anesthesiaService.startAnesthesia(
      {
        sessionId,
        anesthesiaType: AnesthesiaType.GENERAL,
      },
      doctorId,
    );

    let session = await prisma.procedureSession.findUnique({
      where: { id: sessionId },
      include: { anesthesia: true },
    });

    expect(session?.anesthesia).toBeDefined();
    expect(session?.anesthesia?.anesthesiaType).toBe(AnesthesiaType.GENERAL);

    await anesthesiaService.endAnesthesia({ sessionId }, doctorId);

    session = await prisma.procedureSession.findUnique({
      where: { id: sessionId },
      include: { anesthesia: true },
    });

    expect(session?.anesthesia?.emergenceAt).toBeDefined();
  });

  it('8. Record and Acknowledge Critical Incident', async () => {
    await incidentService.recordIncident(
      {
        sessionId,
        description: 'Patient heart rate dropped',
      },
      doctorId,
    );

    const incidents = await prisma.procedureCriticalIncident.findMany({
      where: { sessionId },
    });

    expect(incidents.length).toBe(1);
    incidentId = incidents[0].id;

    await incidentService.acknowledgeIncident(
      {
        incidentId,
        resolution: 'Administered atropine',
      },
      doctorId,
    );

    const incident = await prisma.procedureCriticalIncident.findUnique({
      where: { id: incidentId },
    });

    expect(incident?.acknowledgedAt).toBeDefined();
    expect(incident?.resolution).toBe('Administered atropine');
  });

  it('9. Fail to Complete Procedure before SIGN_OUT Checklist', async () => {
    await expect(
      procedureService.completeProcedure({
        sessionId,
        outcome: 'SUCCESS',
      }),
    ).rejects.toThrow(/SIGN_OUT/);
  });

  it('10. Complete SIGN_OUT and Complete Procedure', async () => {
    await checklistService.signOut({ sessionId }, doctorId);

    await procedureService.completeProcedure({
      sessionId,
      outcome: 'SUCCESS',
    });

    const session = await prisma.procedureSession.findUnique({
      where: { id: sessionId },
      include: { execution: true, checklist: true },
    });

    expect(session?.checklist?.status).toBe(ProcedureChecklistStatus.SIGN_OUT_COMPLETE);
    expect(session?.procedureEndedAt).toBeDefined();
    expect(session?.execution.status).toBe(ProcedureExecutionStatus.COMPLETED);
  });

  it('11. Create and Amend Procedure Report', async () => {
    await reportService.createReport(
      {
        executionId,
        text: 'Draft appendectomy notes.',
      },
      doctorId,
    );

    const report = await prisma.procedureReport.findUnique({
      where: { executionId },
      include: { versions: true, activeVersion: true },
    });

    expect(report).toBeDefined();
    expect(report?.status).toBe('DRAFT');
    reportId = report!.id;

    await reportService.verifyReport({ reportId }, doctorId);

    let updatedReport = await prisma.procedureReport.findUnique({
      where: { id: reportId },
    });
    expect(updatedReport?.status).toBe('FINAL');

    await reportService.amendReport(
      {
        reportId,
        text: 'Final notes with amendments.',
        reason: 'Forgot to add details about closure.',
      },
      doctorId,
    );

    updatedReport = await prisma.procedureReport.findUnique({
      where: { id: reportId },
      include: { versions: true, activeVersion: true },
    });

    expect(updatedReport?.status).toBe('AMENDED');
    expect(updatedReport?.versions.length).toBe(2);
    expect(updatedReport?.activeVersion?.text).toBe('Final notes with amendments.');
  });
});
