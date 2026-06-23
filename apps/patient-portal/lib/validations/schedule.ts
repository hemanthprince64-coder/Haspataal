import { z } from 'zod';

export const UpsertDoctorScheduleSchema = z.object({
  doctorId: z.string().min(1, 'Doctor ID is required.'),
  dayOfWeek: z.number().min(1).max(7, 'Day of week must be between 1 and 7.'),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be HH:MM.'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be HH:MM.'),
  isActive: z.boolean().default(true),
  slotDurationMinutes: z.number().default(30),
});

export const GenerateSlotsSchema = z.object({
  doctorId: z.string().min(1, 'Doctor ID is required.'),
  startDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid start date.' }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid end date.' }),
});

export const BlockSlotsSchema = z.object({
  doctorId: z.string().min(1, 'Doctor ID is required.'),
  blockStart: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid block start date.' }),
  blockEnd: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid block end date.' }),
  reason: z.string().optional().nullable(),
});
