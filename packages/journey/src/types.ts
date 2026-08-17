import { z } from 'zod';

export const JourneyCategory = z.enum([
  'MATERNAL',
  'CHRONIC_DIABETES',
  'CHRONIC_HYPERTENSION',
  'POST_OP',
  'CANCER',
  'ASTHMA',
  'COPD',
  'NICU',
  'PICU',
  'MENTAL_HEALTH',
]);
export type JourneyCategory = z.infer<typeof JourneyCategory>;

export const JourneyStatus = z.enum(['ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED']);
export type JourneyStatus = z.infer<typeof JourneyStatus>;

export const TaskStatus = z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED']);
export type TaskStatus = z.infer<typeof TaskStatus>;
