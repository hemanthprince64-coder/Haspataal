import { z } from 'zod';

export const RadiologyReportSchema = z.object({
  id: z.string().uuid(),
  studyId: z.string().uuid().nullable(),
  status: z.enum([
    'DRAFT',
    'VERIFIED',
    'AMENDED'
  ]),
  findings: z.string().nullable(),
  impression: z.string().nullable(),
  recommendation: z.string().nullable(),
  verifiedBy: z.string().nullable(),
  verifiedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type RadiologyReport = z.infer<typeof RadiologyReportSchema>;
