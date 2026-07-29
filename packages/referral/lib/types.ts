export enum ReferralEventType {
  REFERRAL_CREATED = 'REFERRAL_CREATED',
  REFERRAL_SENT = 'REFERRAL_SENT',
  REFERRAL_ACCEPTED = 'REFERRAL_ACCEPTED',
  REFERRAL_DECLINED = 'REFERRAL_DECLINED',
  REFERRAL_APPOINTMENT_SCHEDULED = 'REFERRAL_APPOINTMENT_SCHEDULED',
  CONSULTATION_STARTED = 'CONSULTATION_STARTED',
  CONSULTATION_COMPLETED = 'CONSULTATION_COMPLETED',
  CARE_TRANSFER_REQUESTED = 'CARE_TRANSFER_REQUESTED',
  CARE_TRANSFER_ACCEPTED = 'CARE_TRANSFER_ACCEPTED',
  CARE_TRANSFER_REJECTED = 'CARE_TRANSFER_REJECTED',
  CARE_TRANSFER_COMPLETED = 'CARE_TRANSFER_COMPLETED',
  REFERRAL_COMPLETED = 'REFERRAL_COMPLETED',
  REFERRAL_CANCELLED = 'REFERRAL_CANCELLED',
}

export interface ReferralEvent {
  eventId: string;
  eventType: ReferralEventType;
  executionId?: string;
  orderId?: string;
  itemId?: string;
  recipientId?: string;
  careTransferId?: string;
  hospitalId: string;
  patientId: string;
  timestamp: Date;
  payload: Record<string, unknown>;
}

export interface CreateReferralInput {
  orderId: string;
  orderItemId: string;
  hospitalId: string;
  patientId: string;
  referralType: string;
  priority: string;
  clinicalSummary: string;
  reasonForReferral: string;
  requestingDoctorId: string;
  recipients: RecipientInput[];
  specialtyCode?: string;
  departmentCode?: string;
  expiresAt?: Date;
}

export interface RecipientInput {
  recipientType: string;
  recipientId?: string;
  recipientName: string;
  recipientHospitalId?: string;
  recipientSpecialty?: string;
}
