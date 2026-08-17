import { z } from 'zod';

export const PasswordSchema = z.string().min(6, 'Password must be at least 6 characters long.');
export const MobileSchema = z.string().min(10, 'Mobile number must be at least 10 digits.');

export const RegisterDoctorSchema = z.object({
  fullName: z.string().min(1, 'Full name is required.'),
  mobile: MobileSchema,
  email: z.string().email('Invalid email address.'),
  password: PasswordSchema,
  registrationNumber: z.string().min(1, 'Registration number is required.'),
  councilName: z.string().min(1, 'Council name is required.'),
});

export const LoginDoctorSchema = z.object({
  mobile: MobileSchema,
  password: PasswordSchema,
});

export const RegisterAgentSchema = z.object({
  fullName: z.string().min(1, 'Full name is required.'),
  mobile: MobileSchema,
  email: z.string().email('Invalid email address.'),
  password: PasswordSchema,
  area: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

export const RegisterHospitalSchema = z.object({
  hospitalName: z.string().min(1, 'Hospital name is required.'),
  city: z.string().min(1, 'City is required.'),
  adminName: z.string().min(1, 'Admin name is required.'),
  mobile: MobileSchema,
  password: PasswordSchema,
  facilityType: z.enum(['HOSPITAL', 'CLINIC']).default('HOSPITAL'),
  registrationNumber: z.string().min(1, 'Registration number is required.'),
  approvalDocumentUrl: z.string().min(1, 'Approval document is required.'),
  googleLocationUrl: z.string().optional(),
  medicalCouncilNumber: z.string().optional(),
  specialities: z.array(z.string()).optional().default([]),
});

export const RegisterLabSchema = z.object({
  labName: z.string().min(1, 'Lab name is required.'),
  city: z.string().min(1, 'City is required.'),
  adminName: z.string().min(1, 'Admin name is required.'),
  mobile: MobileSchema,
  password: PasswordSchema,
  registrationNumber: z.string().optional(),
});

export const BookAppointmentSchema = z.object({
  doctorId: z.string().min(1, 'Doctor is required.'),
  hospitalId: z.string().min(1, 'Hospital is required.'),
  date: z.string().min(1, 'Date is required.'),
  slot: z.string().min(1, 'Time slot is required.'),
  payWithWallet: z.boolean().optional().default(false),
});

// Clinic Operational profile Schema (Stage 2 Questionnaire)
export const ClinicOperationalProfileSchema = z.object({
  isSingleDoctor: z.boolean().default(true),
  hasConsultants: z.boolean().default(false),
  dailyStaffCount: z.number().int().nonnegative().default(1),
  hasReceptionist: z.boolean().default(false),
  hasNursingStaff: z.boolean().default(false),
  hasPharmacy: z.boolean().default(false),
  hasOwnLab: z.boolean().default(false),
  admitsPatients: z.boolean().default(false),
  avgDailyPatients: z.number().int().nonnegative().default(10),
  opdOnly: z.boolean().default(true),
  currentWorkflow: z
    .object({
      appointments: z.string().optional(),
      records: z.string().optional(),
      billing: z.string().optional(),
      followups: z.string().optional(),
      biggestProblem: z.string().optional(),
    })
    .optional(),
  digitalMaturity: z
    .object({
      prevSoftware: z.string().optional(),
      whyStopped: z.string().optional(),
      comfortLevel: z.string().optional(),
      preferredDevice: z.string().optional(),
      internetReliability: z.string().optional(),
    })
    .optional(),
  retentionLeaks: z
    .object({
      remindersMethod: z.string().optional(),
      chronicLost: z.string().optional(),
      whatsappOptIn: z.boolean().optional(),
    })
    .optional(),
  pharmacyConfig: z
    .object({
      stockManual: z.boolean().optional(),
      expiryTracked: z.boolean().optional(),
    })
    .optional(),
  labConfig: z
    .object({
      ownLab: z.boolean().optional(),
      digitalUpload: z.boolean().optional(),
    })
    .optional(),
  communicationPrefs: z
    .object({
      whatsappNumber: z.string().optional(),
      smsRequired: z.boolean().optional(),
      preferredLanguage: z.string().default('English'),
      onlineBooking: z.boolean().optional(),
    })
    .optional(),
});

// Internal Referral validation schema
export const InternalReferralSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required.'),
  fromDoctorId: z.string().min(1, 'Referring doctor is required.'),
  toDoctorId: z.string().min(1, 'Target specialist is required.'),
  reason: z.string().min(1, 'Reason for referral is required.'),
  priority: z.enum(['ROUTINE', 'URGENT', 'EMERGENCY']).default('ROUTINE'),
  notes: z.string().optional(),
});

// Consultant Settlement calculation schema
export const ConsultantSettlementSchema = z.object({
  doctorId: z.string().min(1, 'Doctor is required.'),
  settlementPeriodStart: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid start date.' }),
  settlementPeriodEnd: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid end date.' }),
});
