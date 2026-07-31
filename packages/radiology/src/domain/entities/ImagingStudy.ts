import { z } from 'zod';

export const ImagingStudySchema = z.object({
  id: z.string().uuid(),
  clinicalOrderId: z.string().uuid().nullable(),
  encounterId: z.string().uuid().nullable(),
  patientId: z.string().uuid().nullable(),
  hospitalId: z.string().uuid().nullable(),
  accessionNumber: z.string(),
  studyInstanceUID: z.string().nullable(),
  seriesCount: z.number().int().nullable(),
  imageCount: z.number().int().nullable(),
  modality: z.string().nullable(),
  status: z.enum([
    'ORDERED',
    'SCHEDULED',
    'ACCESSIONED',
    'IMAGE_ACQUIRED',
    'REPORT_DRAFTED',
    'REPORT_VERIFIED',
    'COMPLETED',
    'CANCELLED'
  ]),
  scheduledAt: z.date().nullable(),
  startedAt: z.date().nullable(),
  completedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ImagingStudy = z.infer<typeof ImagingStudySchema>;
