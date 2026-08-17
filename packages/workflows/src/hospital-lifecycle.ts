import { WorkflowDefinition, WorkflowEngine } from './engine';

export type HospitalState =
  | 'CREATED'
  | 'PROFILE_COMPLETION'
  | 'DOCUMENT_UPLOAD'
  | 'PENDING_VERIFICATION'
  | 'DOCUMENT_REVIEW'
  | 'LICENSE_VERIFICATION'
  | 'ABDM_VERIFICATION'
  | 'APPROVED'
  | 'SUBSCRIPTION_ASSIGNMENT'
  | 'CONFIGURATION'
  | 'PILOT'
  | 'LIVE'
  | 'SUSPENDED'
  | 'ARCHIVED';

export type HospitalAction =
  | 'START_PROFILE'
  | 'COMPLETE_PROFILE'
  | 'UPLOAD_DOCUMENTS'
  | 'SUBMIT_FOR_VERIFICATION'
  | 'START_DOCUMENT_REVIEW'
  | 'APPROVE_DOCUMENTS'
  | 'REJECT_DOCUMENTS'
  | 'VERIFY_LICENSE'
  | 'FAIL_LICENSE'
  | 'VERIFY_ABDM'
  | 'FAIL_ABDM'
  | 'APPROVE_HOSPITAL'
  | 'ASSIGN_SUBSCRIPTION'
  | 'COMPLETE_CONFIGURATION'
  | 'START_PILOT'
  | 'GO_LIVE'
  | 'SUSPEND'
  | 'REACTIVATE'
  | 'ARCHIVE';

export const hospitalLifecycleDefinition: WorkflowDefinition<HospitalState, HospitalAction> = {
  id: 'HospitalLifecycle',
  initialState: 'CREATED',
  transitions: [
    { from: 'CREATED', action: 'START_PROFILE', to: 'PROFILE_COMPLETION' },
    {
      from: 'PROFILE_COMPLETION',
      action: 'COMPLETE_PROFILE',
      to: 'DOCUMENT_UPLOAD',
      domainEvent: 'HospitalProfileCompleted',
    },
    {
      from: 'DOCUMENT_UPLOAD',
      action: 'UPLOAD_DOCUMENTS',
      to: 'PENDING_VERIFICATION',
      domainEvent: 'HospitalDocumentsUploaded',
    },

    // Verification Pipeline
    {
      from: 'PENDING_VERIFICATION',
      action: 'START_DOCUMENT_REVIEW',
      to: 'DOCUMENT_REVIEW',
      domainEvent: 'HospitalVerificationStarted',
    },
    { from: 'DOCUMENT_REVIEW', action: 'APPROVE_DOCUMENTS', to: 'LICENSE_VERIFICATION' },
    { from: 'DOCUMENT_REVIEW', action: 'REJECT_DOCUMENTS', to: 'DOCUMENT_UPLOAD' }, // back to upload

    { from: 'LICENSE_VERIFICATION', action: 'VERIFY_LICENSE', to: 'ABDM_VERIFICATION' },
    { from: 'LICENSE_VERIFICATION', action: 'FAIL_LICENSE', to: 'PENDING_VERIFICATION' }, // manual intervention

    {
      from: 'ABDM_VERIFICATION',
      action: 'VERIFY_ABDM',
      to: 'APPROVED',
      domainEvent: 'HospitalABDMLinked',
    },
    { from: 'ABDM_VERIFICATION', action: 'FAIL_ABDM', to: 'PENDING_VERIFICATION' },

    // Onboarding Pipeline
    {
      from: 'APPROVED',
      action: 'APPROVE_HOSPITAL',
      to: 'SUBSCRIPTION_ASSIGNMENT',
      domainEvent: 'HospitalApproved',
    },
    {
      from: 'SUBSCRIPTION_ASSIGNMENT',
      action: 'ASSIGN_SUBSCRIPTION',
      to: 'CONFIGURATION',
      domainEvent: 'HospitalSubscriptionAssigned',
    },
    { from: 'CONFIGURATION', action: 'COMPLETE_CONFIGURATION', to: 'PILOT' },

    // Rollout
    { from: 'PILOT', action: 'START_PILOT', to: 'PILOT', domainEvent: 'HospitalPilotStarted' }, // idempotent
    { from: 'PILOT', action: 'GO_LIVE', to: 'LIVE', domainEvent: 'HospitalLive' },
    { from: 'CONFIGURATION', action: 'GO_LIVE', to: 'LIVE', domainEvent: 'HospitalLive' }, // Skip pilot allowed

    // Admin Actions
    {
      from: ['LIVE', 'PILOT', 'APPROVED'],
      action: 'SUSPEND',
      to: 'SUSPENDED',
      domainEvent: 'HospitalSuspended',
    },
    { from: 'SUSPENDED', action: 'REACTIVATE', to: 'LIVE' },
    {
      from: ['LIVE', 'SUSPENDED'],
      action: 'ARCHIVE',
      to: 'ARCHIVED',
      domainEvent: 'HospitalArchived',
    },
  ],
};

export const HospitalWorkflow = new WorkflowEngine<HospitalState, HospitalAction>(
  hospitalLifecycleDefinition,
);
