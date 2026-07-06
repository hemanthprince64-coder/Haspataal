import { PrismaClient } from '@prisma/client';
import { Worker, Job } from 'bullmq';
import { createHash } from 'crypto';
import IORedis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { eventBus, DomainEvent } from '@haspataal/events';
import { TimelineCommandHandler } from '@haspataal/timeline';

// ─────────────────────────────────────────────────────────────
// SETUP
// ─────────────────────────────────────────────────────────────

const prisma = new PrismaClient();

const redis = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

const commandHandler = new TimelineCommandHandler(redis);

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface TransformedEvent {
  eventType: string;
  category: string;
  module: string;
  title: string;
  subtitle?: string;
  summary?: string;
  description?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  priority: number;
  entityType?: string;
  entityId?: string;
  fhirResourceType?: string;
  fhirMapping?: Record<string, unknown>;
  tags: string[];
}

type TransformerFn = (payload: Record<string, unknown>) => TransformedEvent;

// ─────────────────────────────────────────────────────────────
// TRANSFORMER MAP — one entry per event type
// ─────────────────────────────────────────────────────────────

const transformerMap: Record<string, TransformerFn> = {
  AppointmentBooked: (p) => ({
    eventType: 'APPOINTMENT_CREATED',
    category: 'APPOINTMENT',
    module: 'appointments',
    title: `Appointment with ${String(p.doctorName ?? 'Doctor')}`,
    subtitle: String(p.specialty ?? ''),
    severity: 'LOW',
    priority: 5,
    entityType: 'Appointment',
    entityId: String(p.appointmentId ?? ''),
    tags: ['appointment'],
  }),

  AppointmentCancelled: (p) => ({
    eventType: 'APPOINTMENT_CANCELLED',
    category: 'APPOINTMENT',
    module: 'appointments',
    title: `Appointment Cancelled`,
    subtitle: String(p.reason ?? ''),
    severity: 'LOW',
    priority: 4,
    entityType: 'Appointment',
    entityId: String(p.appointmentId ?? ''),
    tags: ['appointment', 'cancelled'],
  }),

  VisitCompleted: (p) => ({
    eventType: 'CONSULTATION_COMPLETED',
    category: 'CONSULTATION',
    module: 'consultations',
    title: `Consultation Completed`,
    subtitle: String(p.doctorName ?? ''),
    severity: 'LOW',
    priority: 5,
    fhirResourceType: 'Encounter',
    entityType: 'Visit',
    entityId: String(p.visitId ?? ''),
    tags: ['consultation'],
  }),

  PrescriptionCreated: (p) => ({
    eventType: 'PRESCRIPTION_CREATED',
    category: 'PRESCRIPTION',
    module: 'prescriptions',
    title: `Prescription Issued`,
    subtitle: String(p.doctorName ?? ''),
    summary: String(p.drugs ?? ''),
    severity: 'LOW',
    priority: 5,
    fhirResourceType: 'MedicationRequest',
    entityType: 'Prescription',
    entityId: String(p.prescriptionId ?? ''),
    tags: ['prescription', 'medication'],
  }),

  DrugDispensed: (p) => ({
    eventType: 'DRUG_DISPENSED',
    category: 'PRESCRIPTION',
    module: 'pharmacy',
    title: `Drug Dispensed: ${String(p.drugName ?? '')}`,
    subtitle: `Qty: ${String(p.quantity ?? '')}`,
    severity: 'LOW',
    priority: 5,
    fhirResourceType: 'MedicationDispense',
    entityType: 'DispenseRecord',
    entityId: String(p.dispenseId ?? ''),
    tags: ['pharmacy', 'dispense'],
  }),

  InvestigationOrdered: (p) => ({
    eventType: 'LAB_ORDERED',
    category: 'INVESTIGATION',
    module: 'laboratory',
    title: `Lab Ordered: ${String(p.testName ?? '')}`,
    severity: 'LOW',
    priority: 5,
    entityType: 'DiagnosticOrder',
    entityId: String(p.orderId ?? ''),
    tags: ['lab', 'investigation'],
  }),

  SampleCollected: (p) => ({
    eventType: 'SAMPLE_COLLECTED',
    category: 'INVESTIGATION',
    module: 'laboratory',
    title: `Sample Collected`,
    subtitle: String(p.sampleType ?? ''),
    severity: 'LOW',
    priority: 5,
    entityType: 'DiagnosticOrder',
    entityId: String(p.orderId ?? ''),
    tags: ['lab', 'sample'],
  }),

  LabCompleted: (p) => ({
    eventType: 'LAB_COMPLETED',
    category: 'INVESTIGATION',
    module: 'laboratory',
    title: `Lab Result: ${String(p.testName ?? '')}`,
    subtitle: p.isAbnormal ? '⚠ Abnormal Result' : 'Normal Result',
    summary: String(p.result ?? ''),
    severity: p.isAbnormal ? 'HIGH' : 'LOW',
    priority: p.isAbnormal ? 8 : 5,
    fhirResourceType: 'DiagnosticReport',
    entityType: 'DiagnosticResult',
    entityId: String(p.resultId ?? ''),
    tags: ['lab', 'result', ...(p.isAbnormal ? ['abnormal'] : [])],
  }),

  PatientAdmitted: (p) => ({
    eventType: 'PATIENT_ADMITTED',
    category: 'ADMISSION',
    module: 'ipd',
    title: `Patient Admitted`,
    subtitle: `Ward: ${String(p.wardName ?? '')}`,
    summary: String(p.admissionReason ?? ''),
    severity: 'MEDIUM',
    priority: 7,
    fhirResourceType: 'Encounter',
    entityType: 'Admission',
    entityId: String(p.admissionId ?? ''),
    tags: ['admission', 'ipd'],
  }),

  WardTransfer: (p) => ({
    eventType: 'WARD_TRANSFER',
    category: 'ADMISSION',
    module: 'ipd',
    title: `Ward Transfer`,
    subtitle: `To: ${String(p.toWard ?? '')}`,
    severity: 'LOW',
    priority: 5,
    entityType: 'Admission',
    entityId: String(p.admissionId ?? ''),
    tags: ['ward', 'transfer'],
  }),

  DischargeCompleted: (p) => ({
    eventType: 'DISCHARGE_COMPLETED',
    category: 'DISCHARGE',
    module: 'discharge',
    title: `Patient Discharged`,
    subtitle: String(p.dischargeType ?? ''),
    summary: String(p.dischargeSummary ?? ''),
    severity: 'LOW',
    priority: 6,
    fhirResourceType: 'Encounter',
    entityType: 'Discharge',
    entityId: String(p.dischargeId ?? ''),
    tags: ['discharge'],
  }),

  BillingCompleted: (p) => ({
    eventType: 'BILLING_COMPLETED',
    category: 'BILLING',
    module: 'billing',
    title: `Bill Generated: ₹${String(p.totalAmount ?? '')}`,
    subtitle: String(p.billType ?? ''),
    severity: 'LOW',
    priority: 4,
    entityType: 'Invoice',
    entityId: String(p.invoiceId ?? ''),
    tags: ['billing', 'payment'],
  }),

  InsuranceVerified: (p) => ({
    eventType: 'INSURANCE_VERIFIED',
    category: 'INSURANCE',
    module: 'insurance',
    title: `Insurance Verified`,
    subtitle: String(p.insurerName ?? ''),
    severity: 'LOW',
    priority: 4,
    entityType: 'InsuranceVerification',
    entityId: String(p.verificationId ?? ''),
    tags: ['insurance'],
  }),

  SurgeryScheduled: (p) => ({
    eventType: 'SURGERY_SCHEDULED',
    category: 'SURGERY',
    module: 'ot',
    title: `Surgery Scheduled: ${String(p.surgeryType ?? '')}`,
    subtitle: String(p.surgeonName ?? ''),
    severity: 'MEDIUM',
    priority: 8,
    fhirResourceType: 'Procedure',
    entityType: 'OtSchedule',
    entityId: String(p.scheduleId ?? ''),
    tags: ['surgery', 'ot'],
  }),

  SurgeryCompleted: (p) => ({
    eventType: 'SURGERY_COMPLETED',
    category: 'SURGERY',
    module: 'ot',
    title: `Surgery Completed: ${String(p.surgeryType ?? '')}`,
    subtitle: String(p.surgeonName ?? ''),
    summary: String(p.postOpNotes ?? ''),
    severity: 'MEDIUM',
    priority: 8,
    fhirResourceType: 'Procedure',
    entityType: 'OtSchedule',
    entityId: String(p.scheduleId ?? ''),
    tags: ['surgery', 'ot', 'completed'],
  }),

  NursingNoteCreated: (p) => ({
    eventType: 'NURSING_NOTE_CREATED',
    category: 'CLINICAL_NOTE',
    module: 'nursing',
    title: `Nursing Note Added`,
    subtitle: String(p.nurseId ?? ''),
    summary: String(p.note ?? '').substring(0, 200),
    severity: 'LOW',
    priority: 4,
    entityType: 'NursingNote',
    entityId: String(p.noteId ?? ''),
    tags: ['nursing', 'note'],
  }),

  MarAdministered: (p) => ({
    eventType: 'MAR_ADMINISTERED',
    category: 'PRESCRIPTION',
    module: 'nursing',
    title: `Medication Administered: ${String(p.medicationName ?? '')}`,
    subtitle: `Dose: ${String(p.dose ?? '')}`,
    severity: 'LOW',
    priority: 5,
    fhirResourceType: 'MedicationAdministration',
    entityType: 'MarRecord',
    entityId: String(p.marId ?? ''),
    tags: ['nursing', 'medication', 'mar'],
  }),

  IcuAdmitted: (p) => ({
    eventType: 'ICU_ADMITTED',
    category: 'ADMISSION',
    module: 'icu',
    title: `ICU Admission`,
    subtitle: String(p.reason ?? ''),
    severity: 'CRITICAL',
    priority: 10,
    fhirResourceType: 'Encounter',
    entityType: 'IcuAdmission',
    entityId: String(p.icuAdmissionId ?? ''),
    tags: ['icu', 'critical', 'admission'],
  }),

  IcuDischarged: (p) => ({
    eventType: 'ICU_DISCHARGED',
    category: 'DISCHARGE',
    module: 'icu',
    title: `ICU Discharge`,
    subtitle: String(p.outcome ?? ''),
    severity: 'MEDIUM',
    priority: 7,
    entityType: 'IcuAdmission',
    entityId: String(p.icuAdmissionId ?? ''),
    tags: ['icu', 'discharge'],
  }),

  VitalsRecorded: (p) => ({
    eventType: 'VITALS_RECORDED',
    category: 'VITALS',
    module: 'consultations',
    title: `Vitals Recorded`,
    severity: 'LOW',
    priority: 3,
    fhirResourceType: 'Observation',
    entityType: 'VitalSigns',
    entityId: String(p.vitalId ?? ''),
    tags: ['vitals'],
  }),
};

// ─────────────────────────────────────────────────────────────
// EVENT BUS SUBSCRIBER (Adapter -> CommandHandler)
// ─────────────────────────────────────────────────────────────

async function onDomainEvent(event: DomainEvent) {
  const transformer = transformerMap[event.type];
  if (!transformer) return; // Not a timeline-relevant event

  const rawPayload = event.payload as any;
  const payload = rawPayload.payload || rawPayload.eventPayload || rawPayload;
  
  const transformed = transformer(payload);
  
  const patientId = String(payload.patientId || '');
  if (!patientId) return;

  const command = {
    commandId: uuidv4(),
    commandVersion: 1,
    target: 'timeline',
    tenantContext: { hospitalId: event.hospitalId || 'system', branchId: 'default' },
    actorContext: { actorId: event.actorId || 'system', actorType: 'SYSTEM' },
    correlationId: event.correlationId || uuidv4(),
    idempotencyKey: `timeline-${event.id}`,
    timestamp: new Date().toISOString(),
    payload: {
      patientId,
      doctorId: payload.doctorId ? String(payload.doctorId) : undefined,
      ...transformed,
      metadata: payload,
    },
  };

  try {
    await commandHandler.handleAddToTimeline(command as any);
  } catch (error: any) {
    console.error(`[Timeline Adapter] Failed to map event ${event.type} to timeline command:`, error);
  }
}

// Subscribe to all known timeline events
Object.keys(transformerMap).forEach((eventType) => {
  eventBus.subscribe(eventType, onDomainEvent);
});

console.log('[Timeline Adapter] Subscribed to EventBus for clinical events.');

// ─────────────────────────────────────────────────────────────
// INTEGRITY HASH
// ─────────────────────────────────────────────────────────────

function computeIntegrityHash(
  patientId: string,
  eventType: string,
  timestamp: string,
  metadata: unknown,
): string {
  const payload = JSON.stringify({ patientId, eventType, timestamp, metadata });
  return createHash('sha256').update(payload).digest('hex');
}

// ─────────────────────────────────────────────────────────────
// REDIS CACHE INVALIDATION
// ─────────────────────────────────────────────────────────────

async function invalidatePatientCache(patientId: string): Promise<void> {
  const pattern = `timeline:patient:${patientId}:*`;
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

// ─────────────────────────────────────────────────────────────
// WORKER PROCESSOR (Processes TimelineEventInput)
// ─────────────────────────────────────────────────────────────

async function processTimelineJob(job: Job): Promise<void> {
  const data = job.data as Record<string, unknown>; // Now directly matches TimelineEventInput
  
  const patientId = String(data.patientId ?? '');
  const correlationId = data.correlationId ? String(data.correlationId) : uuidv4();
  const timestamp = data.timestamp ? String(data.timestamp) : new Date().toISOString();

  // 2. De-duplication: check if correlationId already exists
  const existing = await prisma.timelineEvent.findUnique({
    where: { correlationId },
    select: { id: true },
  });

  if (existing) {
    console.log(`[Timeline Worker] Duplicate event skipped (correlationId: ${correlationId})`);
    return;
  }

  // 4. Compute integrity hash
  const integrityHash = computeIntegrityHash(patientId, String(data.eventType), timestamp, data.metadata);

  // 5. Insert TimelineEvent
  const event = await prisma.timelineEvent.create({
    data: {
      patientId,
      hospitalId: data.hospitalId ? String(data.hospitalId) : undefined,
      doctorId: data.doctorId ? String(data.doctorId) : undefined,
      module: String(data.module),
      entityType: data.entityType ? String(data.entityType) : undefined,
      entityId: data.entityId ? String(data.entityId) : undefined,
      eventType: String(data.eventType),
      category: String(data.category),
      title: String(data.title),
      subtitle: data.subtitle ? String(data.subtitle) : undefined,
      summary: data.summary ? String(data.summary) : undefined,
      description: data.description ? String(data.description) : undefined,
      timestamp: new Date(timestamp),
      severity: String(data.severity),
      priority: Number(data.priority),
      tags: data.tags as string[],
      fhirResourceType: data.fhirResourceType ? String(data.fhirResourceType) : undefined,
      fhirMapping: data.fhirMapping as any,
      correlationId,
      sourceSystem: data.sourceSystem ? String(data.sourceSystem) : undefined,
      integrityHash,
      actorType: data.actorType ? String(data.actorType) : undefined,
      actorId: data.actorId ? String(data.actorId) : undefined,
      metadata: data.metadata as any,
    },
  });

  // 6. Update PostgreSQL full-text search vector
  await prisma.$executeRaw`
    UPDATE timeline_events
    SET search_vector = to_tsvector(
      'english',
      ${event.title} || ' ' ||
      COALESCE(${event.subtitle ?? ''}, '') || ' ' ||
      COALESCE(${event.summary ?? ''}, '') || ' ' ||
      COALESCE(array_to_string(${event.tags}::text[], ' '), '')
    )
    WHERE id = ${event.id}
  `;

  // 7. Invalidate Redis patient cache
  await invalidatePatientCache(patientId);

  console.log(
    `[Timeline Worker] ✓ Ingested ${event.eventType} for patient ${patientId.substring(0, 8)}... (id: ${event.id})`,
  );
}

// ─────────────────────────────────────────────────────────────
// WORKER — main export
// ─────────────────────────────────────────────────────────────

export const timelineWorker = new Worker('timeline-ingestion', processTimelineJob, {
  connection: redis,
  concurrency: 10,
});

// ─────────────────────────────────────────────────────────────
// DEAD-LETTER HANDLER
// ─────────────────────────────────────────────────────────────

timelineWorker.on('failed', async (job, err) => {
  if (!job) return;

  // Only handle permanently failed jobs (exhausted all retries)
  if ((job.attemptsMade ?? 0) < (job.opts?.attempts ?? 3)) return;

  const data = job.data as Record<string, unknown>;
  const patientId = data.patientId ? String(data.patientId) : null;

  // PHI-redacted payload for audit log
  const redactedPayload = {
    ...data,
    patientId: patientId ? patientId.substring(0, 4) + '****' : null,
    title: '[REDACTED]',
    summary: '[REDACTED]',
  };

  try {
    await prisma.timelineAudit.create({
      data: {
        action: 'INGESTION_FAILED',
        payload: {
          jobId: job.id,
          eventType: job.name,
          error: err.message,
          attemptsMade: job.attemptsMade,
          ...redactedPayload,
        },
      },
    });
  } catch (auditErr) {
    console.error('[Timeline Worker] Failed to write audit log for DLQ event:', auditErr);
  }

  console.error(
    `[Timeline Worker] ✗ Job ${job.id} permanently failed after ${job.attemptsMade} attempts:`,
    err.message,
  );
});

timelineWorker.on('ready', () => {
  console.log('[Timeline Worker] Ready — listening on queue: timeline-ingestion');
});
