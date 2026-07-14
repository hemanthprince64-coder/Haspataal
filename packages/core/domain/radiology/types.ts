export interface RadiologyExecutionProvisionInput {
  orderId: string;
  orderItemId: string;
  patientId: string;
  hospitalId: string;
  modality: string;
}

export interface ScheduleRadiologyInput {
  executionId: string;
  modalityId: string;
  startTime: Date;
  endTime: Date;
}

export interface ArrivePatientInput {
  executionId: string;
}

export interface AcquireImageInput {
  executionId: string;
  executionItemId: string;
  modalityId: string;
  studyInstanceUID: string;
  accessionNumber: string;
  series: {
    seriesInstanceUID: string;
    seriesNumber: number;
    modality: string;
    instances: {
      sopInstanceUID: string;
      instanceNumber: number;
      storageUri: string;
      mimeType: string;
    }[];
  }[];
  contrast?: {
    contrastType: string;
    agentName: string;
    lotNumber?: string;
    dose: number;
    unit: string;
    route: string;
    reactionObserved: boolean;
    reactionSeverity?: string;
  };
}

export interface CreateReportInput {
  executionItemId: string;
  studyId: string;
  text: string;
  isPreliminary?: boolean;
}

export interface VerifyReportInput {
  reportId: string;
}

export interface AmendReportInput {
  reportId: string;
  text: string;
  reason: string;
}

export interface DetectCriticalFindingInput {
  reportId: string;
  finding: string;
  severity: string;
  notifiedDoctor?: string;
  notifiedNurse?: string;
  communicationMethod?: string;
}

export interface AcknowledgeCriticalFindingInput {
  findingId: string;
  communicationLog: string;
}

// Canonical Outbox Events
export enum RadiologyEventName {
  RADIOLOGY_EXECUTION_CREATED = 'RADIOLOGY_EXECUTION_CREATED',
  RADIOLOGY_APPOINTMENT_SCHEDULED = 'RADIOLOGY_APPOINTMENT_SCHEDULED',
  PATIENT_ARRIVED_RADIOLOGY = 'PATIENT_ARRIVED_RADIOLOGY',
  IMAGE_ACQUISITION_STARTED = 'IMAGE_ACQUISITION_STARTED',
  IMAGE_ACQUIRED = 'IMAGE_ACQUIRED',
  CONTRAST_ADMINISTERED = 'CONTRAST_ADMINISTERED',
  RADIOLOGY_REPORT_CREATED = 'RADIOLOGY_REPORT_CREATED',
  RADIOLOGY_REPORT_PRELIMINARY = 'RADIOLOGY_REPORT_PRELIMINARY',
  RADIOLOGY_REPORT_FINAL = 'RADIOLOGY_REPORT_FINAL',
  RADIOLOGY_REPORT_AMENDED = 'RADIOLOGY_REPORT_AMENDED',
  CRITICAL_FINDING_DETECTED = 'CRITICAL_FINDING_DETECTED',
  CRITICAL_FINDING_ACKNOWLEDGED = 'CRITICAL_FINDING_ACKNOWLEDGED',
  RADIOLOGY_EXECUTION_CANCELLED = 'RADIOLOGY_EXECUTION_CANCELLED',
}
