import { z } from 'zod';

export const HospitalInsuranceSchema = z.object({
  insurerName: z.string().min(1, 'Insurer name is required.'),
  insurerType: z.enum(['GENERAL_INSURANCE', 'TPA', 'GOVERNMENT']),
  policyNumber: z.string().optional().nullable().or(z.literal('')),
  tieUpLetterFileUrl: z.string().optional().nullable().or(z.literal('')),
  validFrom: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid start date.' }),
  validTo: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid end date.' }),
  specialitiesCovered: z.array(z.string()).default([]),
  coPayPercentage: z.number().min(0).max(100).optional().nullable(),
  cashlessNetwork: z.boolean().default(true),
});

export const UpdateHospitalInsuranceSchema = HospitalInsuranceSchema.partial().extend({
  id: z.string().min(1),
});
