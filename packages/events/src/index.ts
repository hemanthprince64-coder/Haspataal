// @haspataal/events - Event Bus Singleton (Redis Streams)
import { Queue } from 'bullmq';
import { EventEmitter } from 'events';

export interface DomainEvent {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  timestamp: Date;
  /** UUID for timeline de-duplication. All publishers SHOULD provide this. */
  correlationId?: string;
  /** Source application system (e.g., 'hospital-hms', 'patient-portal'). Required for timeline traceability. */
  sourceSystem?: string;
  hospitalId?: string;
  actorId?: string;
  actorType?: string;
}

export type EventCallback = (event: DomainEvent) => Promise<void> | void;

export class EventBus extends EventEmitter {
  private static instance: EventBus;
  private outboxQueue: Queue | null = null;

  private constructor() {
    super();
  }

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  async initialize(redisUrl?: string): Promise<void> {
    if (redisUrl && process.env.REDIS_URL) {
      this.outboxQueue = new Queue('outbox', {
        connection: {
          host: process.env.REDIS_HOST,
          port: parseInt(process.env.REDIS_PORT || '6379'),
        },
      });
    }
  }

  async publish(event: DomainEvent): Promise<void> {
    this.emit(event.type, event);

    if (this.outboxQueue) {
      await this.outboxQueue.add('event', {
        ...event,
        timestamp: event.timestamp.toISOString(),
      });
    }
  }

  subscribe(type: string, callback: EventCallback): void {
    this.on(type, callback);
  }

  unsubscribe(type: string, callback: EventCallback): void {
    this.off(type, callback);
  }
}

export const eventBus = EventBus.getInstance();

export const EVENT_TYPES = {
  // Patient
  PATIENT_REGISTERED: 'PatientRegistered',
  // Appointments
  APPOINTMENT_BOOKED: 'AppointmentBooked',
  APPOINTMENT_CANCELLED: 'AppointmentCancelled',
  // Visits / Consultation
  VISIT_STARTED: 'VisitStarted',
  VISIT_COMPLETED: 'VisitCompleted',
  // Clinical
  VITALS_RECORDED: 'VitalsRecorded',
  // Prescriptions
  PRESCRIPTION_CREATED: 'PrescriptionCreated',
  DRUG_DISPENSED: 'DrugDispensed',
  // Lab
  INVESTIGATION_ORDERED: 'InvestigationOrdered',
  SAMPLE_COLLECTED: 'SampleCollected',
  LAB_COMPLETED: 'LabCompleted',
  // Admission / Discharge
  PATIENT_ADMITTED: 'PatientAdmitted',
  WARD_TRANSFER: 'WardTransfer',
  DISCHARGE_COMPLETED: 'DischargeCompleted',
  // Billing & Insurance
  BILLING_COMPLETED: 'BillingCompleted',
  INSURANCE_VERIFIED: 'InsuranceVerified',
  INSURANCE_CLAIMED: 'InsuranceClaimed',
  // Care
  FOLLOW_UP_SCHEDULED: 'FollowUpScheduled',
  // Verification
  DOCTOR_VERIFIED: 'DoctorVerified',
  HOSPITAL_VERIFIED: 'HospitalVerified',
  // Phase 4 — Timeline Engine (new event types)
  SURGERY_SCHEDULED: 'SurgeryScheduled',
  SURGERY_COMPLETED: 'SurgeryCompleted',
  NURSING_NOTE_CREATED: 'NursingNoteCreated',
  MAR_ADMINISTERED: 'MarAdministered',
  ICU_ADMITTED: 'IcuAdmitted',
  ICU_DISCHARGED: 'IcuDischarged',
  // Platform Events
  HOSPITAL_CREATED: 'HospitalCreated',
  HOSPITAL_PROFILE_COMPLETED: 'HospitalProfileCompleted',
  HOSPITAL_DOCUMENTS_UPLOADED: 'HospitalDocumentsUploaded',
  HOSPITAL_VERIFICATION_STARTED: 'HospitalVerificationStarted',
  HOSPITAL_ABDM_LINKED: 'HospitalABDMLinked',
  HOSPITAL_APPROVED: 'HospitalApproved',
  HOSPITAL_SUBSCRIPTION_ASSIGNED: 'HospitalSubscriptionAssigned',
  HOSPITAL_PILOT_STARTED: 'HospitalPilotStarted',
  HOSPITAL_LIVE: 'HospitalLive',
  HOSPITAL_SUSPENDED: 'HospitalSuspended',
  HOSPITAL_ARCHIVED: 'HospitalArchived',
  HOSPITAL_MERGED: 'hospital_merged',
  FLAG_CHANGED: 'flag_changed',
  SUBSCRIPTION_CREATED: 'subscription_created',
  SUBSCRIPTION_RENEWED: 'subscription_renewed',
  SUBSCRIPTION_PAST_DUE: 'subscription_past_due',
  INVOICE_GENERATED: 'invoice_generated',
  INVOICE_PAID: 'invoice_paid',
  INVOICE_FAILED: 'invoice_failed',
  WEBHOOK_REGISTERED: 'webhook_registered',
  WEBHOOK_DELIVERY_FAILED: 'webhook_delivery_failed',
  WEBHOOK_SECRET_ROTATED: 'webhook_secret_rotated',
  PLATFORM_USER_INVITED: 'platform_user_invited',
  PLATFORM_USER_DISABLED: 'platform_user_disabled',
  CONSENT_GRANTED: 'consent_granted',
  CONSENT_REVOKED: 'consent_revoked',
  DATA_EXPORT_REQUESTED: 'data_export_requested',
  DATA_ERASED: 'data_erased',
  DEPLOY_STARTED: 'deploy_started',
  DEPLOY_COMPLETED: 'deploy_completed',
  DEPLOY_ROLLED_BACK: 'deploy_rolled_back',
  SECURITY_ALERT_RAISED: 'security_alert_raised',
  RATE_LIMIT_TRIGGERED: 'rate_limit_triggered',
  IP_BLOCKED: 'ip_blocked',
  BACKUP_COMPLETED: 'backup_completed',
  RESTORE_COMPLETED: 'restore_completed',
  DR_DRILL_EXECUTED: 'dr_drill_executed',
} as const;
