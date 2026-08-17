import { z } from 'zod';

export const NotificationChannel = z.enum(['SMS', 'WHATSAPP', 'EMAIL', 'PUSH', 'IN_APP']);
export const NotificationPriority = z.enum([
  'EMERGENCY',
  'CRITICAL',
  'HIGH',
  'NORMAL',
  'LOW',
  'BACKGROUND',
]);
export const NotificationStatus = z.enum([
  'QUEUED',
  'PROCESSING',
  'SENT',
  'DELIVERED',
  'READ',
  'FAILED',
  'EXPIRED',
  'CANCELLED',
]);

export const NotificationInputSchema = z.object({
  hospitalId: z.string().uuid().optional(),
  patientId: z.string().uuid().optional(),
  doctorId: z.string().uuid().optional(),
  templateId: z.string().uuid().optional(),
  channel: NotificationChannel.optional(),
  priority: NotificationPriority.default('NORMAL'),
  recipient: z.string(),
  subject: z.string().optional(),
  body: z.string(),
  variables: z.record(z.string(), z.any()).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  scheduledAt: z.string().datetime().optional(),
});

export type NotificationInput = z.infer<typeof NotificationInputSchema>;
export type Channel = z.infer<typeof NotificationChannel>;
export type Priority = z.infer<typeof NotificationPriority>;
export type Status = z.infer<typeof NotificationStatus>;
