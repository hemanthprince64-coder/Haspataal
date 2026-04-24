export type EventType =
  | 'hospital_registered'
  | 'hospital_verified'
  | 'hospital_activated'
  | 'hospital_approved'
  | 'hospital_rejected'
  | 'hospital_suspended'
  | 'patient_registered'
  | 'patient_created'
  | 'patient_admitted'
  | 'patient_discharged'
  | 'patient_visited'
  | 'visit_completed'
  | 'bill_generated'
  | 'bill_paid'
  | 'doctor_registered'
  | 'doctor_added'
  | 'doctor_removed'
  | 'doctor_approved'
  | 'doctor_rejected'
  | 'doctor_prescribes'
  | 'followup_created'
  | 'followup_completed'
  | 'followup_missed'
  | 'notification_sent'
  | 'reminder_sent'
  | 'lab_registered'
  | 'agent_registered';

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
