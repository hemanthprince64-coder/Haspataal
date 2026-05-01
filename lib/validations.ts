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
