import { z } from 'zod';

/**
 * Haspataal Shared Schemas
 * Strengthening: Ensuring all microservices speak the same "language".
 */

// 1. Patient Records Schema
export const PatientRecordSchema = z.object({
    id: z.string().uuid(),
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    dateOfBirth: z.string().datetime(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
    bloodGroup: z.enum(['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG']),
    medicalHistory: z.array(z.string()).optional(),
});

// 2. Appointment Slot Schema
export const AppointmentSlotSchema = z.object({
    doctorId: z.string().uuid(),
    hospitalId: z.string().uuid(),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    status: z.enum(['AVAILABLE', 'LOCKED', 'BOOKED']),
    consultationType: z.enum(['VIDEO', 'IN_PERSON']),
});

// 3. Billing Transaction Schema
export const BillingTransactionSchema = z.object({
    appointmentId: z.string().uuid(),
    patientId: z.string().uuid(),
    amount: z.number().positive(),
    currency: z.string().default('INR'),
    status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']),
    paymentMethod: z.enum(['UPI', 'CARD', 'NET_BANKING', 'CASH']),
});

export type PatientRecord = z.infer<typeof PatientRecordSchema>;
export type AppointmentSlot = z.infer<typeof AppointmentSlotSchema>;
export type BillingTransaction = z.infer<typeof BillingTransactionSchema>;
