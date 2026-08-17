import { AnesthesiaType } from '@prisma/client';

export interface ProcedureExecutionProvisionInput {
  orderId: string;
  orderItemId: string;
  patientId: string;
  hospitalId: string;
  catalogVersionId: string;
}

export interface ScheduleProcedureInput {
  executionId: string;
  roomId: string;
  startTime: Date;
  endTime: Date;
}

export interface ArrivePatientInput {
  executionId: string;
}

export interface SignInChecklistInput {
  sessionId: string;
}

export interface TimeOutChecklistInput {
  sessionId: string;
}

export interface SignOutChecklistInput {
  sessionId: string;
}

export interface StartProcedureInput {
  sessionId: string;
}

export interface CompleteProcedureInput {
  sessionId: string;
  outcome: string;
}

export interface StartAnesthesiaInput {
  sessionId: string;
  anesthesiaType: AnesthesiaType;
}

export interface EndAnesthesiaInput {
  sessionId: string;
}

export interface LogImplantInput {
  sessionId: string;
  implantName: string;
  serialNumber?: string;
  lotNumber?: string;
  manufacturer?: string;
}

export interface CreateReportInput {
  executionId: string;
  text: string;
}

export interface VerifyReportInput {
  reportId: string;
}

export interface AmendReportInput {
  reportId: string;
  text: string;
  reason: string;
}

export interface RecordCriticalIncidentInput {
  sessionId: string;
  description: string;
}

export interface AcknowledgeCriticalIncidentInput {
  incidentId: string;
  resolution: string;
}

// Canonical Outbox Events
export enum ProcedureEventName {
  PROCEDURE_SCHEDULED = 'PROCEDURE_SCHEDULED',
  PATIENT_ENTERED_PROCEDURE_ROOM = 'PATIENT_ENTERED_PROCEDURE_ROOM',
  ANESTHESIA_STARTED = 'ANESTHESIA_STARTED',
  ANESTHESIA_ENDED = 'ANESTHESIA_ENDED',
  PROCEDURE_STARTED = 'PROCEDURE_STARTED',
  PROCEDURE_COMPLETED = 'PROCEDURE_COMPLETED',
  WHO_CHECKLIST_COMPLETED = 'WHO_CHECKLIST_COMPLETED',
  IMPLANT_USED = 'IMPLANT_USED',
  PROCEDURE_REPORT_CREATED = 'PROCEDURE_REPORT_CREATED',
  PROCEDURE_REPORT_FINAL = 'PROCEDURE_REPORT_FINAL',
  PROCEDURE_REPORT_AMENDED = 'PROCEDURE_REPORT_AMENDED',
  CRITICAL_INCIDENT_RECORDED = 'CRITICAL_INCIDENT_RECORDED',
  CRITICAL_INCIDENT_ACKNOWLEDGED = 'CRITICAL_INCIDENT_ACKNOWLEDGED',
  PROCEDURE_CANCELLED = 'PROCEDURE_CANCELLED',
}
