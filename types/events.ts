export type EventType =
  | 'hospital_registered'
  | 'hospital_verified'
  | 'hospital_activated'
  | 'patient_created'
  | 'patient_discharged'
  | 'bill_generated'
  | 'bill_paid'
  | 'doctor_prescribes'
  | 'followup_created'
  | 'notification_sent';

export interface EventPayload<T = Record<string, any>> {
  id: string; // UUID
  timestamp: string; // TIMESTAMPTZ
  hospital_id: string; // UUID
  patient_id?: string | null; // UUID
  event_type: EventType;
  metadata: T;
  idempotency_key: string;
}

export type CreateEventInput<T = Record<string, any>> = Omit<
  EventPayload<T>,
  'id' | 'timestamp' | 'idempotency_key'
>;
