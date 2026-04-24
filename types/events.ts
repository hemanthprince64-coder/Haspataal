export type EventType =
  // Hospital lifecycle
  | 'hospital_registered'
  | 'hospital_verified'
  | 'hospital_activated'
  | 'hospital_approved'
  | 'hospital_rejected'
  | 'hospital_suspended'
  // Patient journey
  | 'patient_registered'
  | 'patient_created'
  | 'patient_admitted'
  | 'patient_discharged'
  | 'patient_visited'
  // Clinical
  | 'visit_completed'
  | 'doctor_prescribes'
  | 'followup_created'
  | 'followup_completed'
  | 'followup_missed'
  // Billing & Payments
  | 'bill_generated'
  | 'bill_paid'
  // Doctor management
  | 'doctor_registered'
  | 'doctor_added'
  | 'doctor_removed'
  | 'doctor_approved'
  | 'doctor_rejected'
  // Notifications & Reminders
  | 'notification_sent'
  | 'notification_delivered'
  | 'notification_queued'
  | 'reminder_sent'
  // Labs & Diagnostics
  | 'lab_registered'
  | 'lab_result_ready'
  // Pharmacy
  | 'medicine_dispensed'
  // Onboarding & Migration
  | 'partial_setup_saved'
  | 'data_imported'
  // Agents
  | 'agent_registered'
  // Infrastructure & Operations
  | 'APPOINTMENT_BOOKED'
  | 'chronic_escalation_alert'
  | 'document_expiring_soon';

export interface EventPayload<T = Record<string, any>> {
  id: string;
  timestamp: string;
  hospital_id: string;
  patient_id?: string | null;
  event_type: EventType;
  metadata: T;
  idempotency_key: string;
}

export type CreateEventInput<T = Record<string, any>> = Omit<
  EventPayload<T>,
  'id' | 'timestamp' | 'idempotency_key'
>;
