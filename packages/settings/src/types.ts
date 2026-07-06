import { z } from 'zod';

// OPD Config Schema
export const OpdConfigSchema = z.object({
  tokenMode: z.string().default('AUTO'),
  tokenPrefix: z.string().default('OPD'),
  resetDaily: z.boolean().default(true),
  displayQueueOnTV: z.boolean().default(false),
  allowWalkIn: z.boolean().default(true),
  allowOnline: z.boolean().default(true),
  avgConsultationMinutes: z.number().int().default(15),
  notifyPatientSms: z.boolean().default(false),
  patientsAheadAlert: z.number().int().default(2),
  allowOverbooking: z.boolean().default(false),
  maxOverbookingPercent: z.number().int().default(10),
  noShowPolicy: z.string().default('WARN'),
  blockAfterNoShows: z.number().int().default(3),
  noShowCooldownDays: z.number().int().default(30),
  enableSmartSlots: z.boolean().default(true),
  slotBufferMinutes: z.number().int().default(5),
  dailySlotCap: z.number().int().nullable().optional(),
  lunchBreakStart: z.string().nullable().optional(),
  lunchBreakEnd: z.string().nullable().optional(),
  showEstimatedWait: z.boolean().default(true),
  allowPhone: z.boolean().default(true),
  allowReferral: z.boolean().default(true),
  smartSlotAlgorithm: z.string().default('FIFO'),
  emergencySlotReserve: z.number().int().default(5),
});
export type OpdConfigInput = z.infer<typeof OpdConfigSchema>;

// Integration Config Schema
export const IntegrationConfigSchema = z.object({
  provider: z.string(),
  isActive: z.boolean().default(false),
  isLive: z.boolean().default(false),
  testMode: z.boolean().default(true),
  webhookUrl: z.string().nullable().optional(),
  webhookSecret: z.string().nullable().optional(),
  scope: z.array(z.string()).default([]),
  encryptedConfig: z.any().optional(),
});
export type IntegrationConfigInput = z.infer<typeof IntegrationConfigSchema>;

// Hospital Billing Profile Schema
export const BillingProfileSchema = z.object({
  bankAccountNumber: z.string().nullable().optional(),
  bankIfsc: z.string().nullable().optional(),
  gstApplicable: z.boolean().default(false),
  tdsApplicable: z.boolean().default(true),
  payoutCycle: z.string().nullable().optional(),
  invoiceLayout: z.string().default('STANDARD'),
  headerText: z.string().nullable().optional(),
  footerText: z.string().nullable().optional(),
});
export type BillingProfileInput = z.infer<typeof BillingProfileSchema>;

// Hospital Facilities Schema
export const FacilitiesSchema = z.object({
  icuAvailable: z.boolean().default(false),
  nicuAvailable: z.boolean().default(false),
  otCount: z.number().int().default(0),
  emergency24x7: z.boolean().default(false),
  ambulanceAvailable: z.boolean().default(false),
  pharmacyAvailable: z.boolean().default(false),
  labAvailable: z.boolean().default(false),
});
export type FacilitiesInput = z.infer<typeof FacilitiesSchema>;
