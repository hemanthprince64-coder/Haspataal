export enum DomainAction {
  PATIENT_SAFETY_SUMMARY_READ = 'PATIENT_SAFETY_SUMMARY_READ',
  PATIENT_LONGITUDINAL_HISTORY_READ = 'PATIENT_LONGITUDINAL_HISTORY_READ',
  CLINICAL_RECORD_CREATE = 'CLINICAL_RECORD_CREATE',
  CLINICAL_RECORD_AMEND = 'CLINICAL_RECORD_AMEND',
  CARE_TEAM_ASSIGN = 'CARE_TEAM_ASSIGN',
  CARE_TEAM_REMOVE = 'CARE_TEAM_REMOVE',
  CARE_TRANSFER_INITIATE = 'CARE_TRANSFER_INITIATE',
  CARE_TRANSFER_REVIEW = 'CARE_TRANSFER_REVIEW',
  CARE_TRANSFER_ACCEPT = 'CARE_TRANSFER_ACCEPT',
  BREAK_GLASS_ACTIVATE = 'BREAK_GLASS_ACTIVATE',
  IDENTITY_MERGE_REQUEST = 'IDENTITY_MERGE_REQUEST',
  IDENTITY_MERGE_REVIEW = 'IDENTITY_MERGE_REVIEW',
  IDENTITY_MERGE_APPROVE = 'IDENTITY_MERGE_APPROVE',
  IDENTITY_MERGE_EXECUTE = 'IDENTITY_MERGE_EXECUTE',

  // Phase 3 Actions
  CLINICAL_DISCHARGE_DECISION = 'CLINICAL_DISCHARGE_DECISION',
  DISCHARGE_PROCESS_MUTATION = 'DISCHARGE_PROCESS_MUTATION',
  LAMA_INITIATE = 'LAMA_INITIATE',
  LAMA_DOCUMENT = 'LAMA_DOCUMENT',
  LAMA_WITHDRAW = 'LAMA_WITHDRAW',
  ABSENCE_SUSPECT = 'ABSENCE_SUSPECT',
  ABSENCE_RESOLVE = 'ABSENCE_RESOLVE',
  DEPARTURE_CONFIRM_STANDARD = 'DEPARTURE_CONFIRM_STANDARD',
  DEPARTURE_CONFIRM_LAMA = 'DEPARTURE_CONFIRM_LAMA',
  DEPARTURE_CONFIRM_WITHOUT_NOTICE = 'DEPARTURE_CONFIRM_WITHOUT_NOTICE',

  // Phase 5 Actions
  ORDER_CREATE = 'ORDER_CREATE',
  ORDER_CANCEL = 'ORDER_CANCEL',
  ORDER_COMPLETE = 'ORDER_COMPLETE',
  ORDER_OVERRIDE_CDS = 'ORDER_OVERRIDE_CDS',
  ORDER_EXECUTION_UPDATE = 'ORDER_EXECUTION_UPDATE',

  // Phase 5B Actions
  LAB_RESULT_ENTRY = 'LAB_RESULT_ENTRY',
  LAB_RESULT_VERIFY = 'LAB_RESULT_VERIFY',
}

export interface ActorContext {
  id: string; // Doctor ID, Staff ID, or UserAccount ID
  hospitalId?: string; // Optional, as some actions are cross-hospital or platform-wide
  role: string; // e.g., 'DOCTOR', 'NURSE', 'SUPER_ADMIN'
  permissions?: string[]; // E.g., ['module:IDENTITY', 'action:EXECUTE']
}

export interface ResourceContext {
  patientId?: string;
  episodeId?: string; // Visit or Admission ID
  hospitalId?: string; // Originating hospital of the resource
  targetId?: string; // E.g. Record ID being amended, merge request ID
}

export interface AuthorizeRequest {
  actor: ActorContext;
  action: DomainAction;
  resource: ResourceContext;
}

export enum AuthorizationDecision {
  ALLOW = 'ALLOW',
  DENY = 'DENY',
  BREAK_GLASS = 'BREAK_GLASS', // Allowed due to active Break-Glass
}

export interface AuthorizationResult {
  decision: AuthorizationDecision;
  reason: string;
  auditLogId?: string;
}
