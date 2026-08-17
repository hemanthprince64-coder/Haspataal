import { z } from 'zod';

export const UpdateHospitalConfigSchema = z.object({
  // Identity & Branding
  logoUrl: z.string().url().optional().nullable(),
  faviconUrl: z.string().url().optional().nullable(),
  brandColor: z.string().optional().nullable(),
  stateRegistrationNumber: z.string().optional().nullable(),
  nabhCertUrl: z.string().url().optional().nullable(),
  nablCertUrl: z.string().url().optional().nullable(),

  // Operational
  timezone: z.string().optional(),
  workingDays: z.array(z.string()).optional(),
  openTime: z.string().optional().nullable(),
  closeTime: z.string().optional().nullable(),
  emergencyContact: z.string().optional().nullable(),
  isMultiBranch: z.boolean().optional(),
  invoicePrefix: z.string().optional(),
  nextInvoiceNumber: z.number().int().positive().optional(),
  gstInclusivePricing: z.boolean().optional(),

  // Branding Templates
  letterheadTemplate: z.string().optional().nullable(),
  prescriptionHeader: z.string().optional().nullable(),
  prescriptionFooter: z.string().optional().nullable(),

  // Marketplace
  isListedOnMarketplace: z.boolean().optional(),
  marketplaceTagline: z.string().optional().nullable(),
  marketplaceAbout: z.string().optional().nullable(),
  marketplaceFacilities: z.array(z.string()).optional(),
  showConsultationFees: z.boolean().optional(),
  showBedCharges: z.boolean().optional(),
  showPackagePrices: z.boolean().optional(),
  allowOnlineBooking: z.boolean().optional(),
  requiresApproval: z.boolean().optional(),
  cancellationPolicy: z.string().optional(),
  depositRequired: z.boolean().optional(),
  depositAmount: z.number().optional().nullable(),
  rankingScore: z.number().optional(),
  coverImageUrl: z.string().url().optional().nullable(),
  galleryUrls: z.array(z.string().url()).optional(),
  insurancePanels: z.array(z.string()).optional(),
  customCancellationTerms: z.string().optional().nullable(),
  allowsInstantBooking: z.boolean().optional(),
  specialities: z.array(z.string()).optional(),
});

export const UpdateOpdConfigSchema = z.object({
  tokenMode: z.string().optional(),
  tokenPrefix: z.string().optional(),
  resetDaily: z.boolean().optional(),
  displayQueueOnTV: z.boolean().optional(),
  allowWalkIn: z.boolean().optional(),
  allowOnline: z.boolean().optional(),
  avgConsultationMinutes: z.number().int().positive().optional(),
  notifyPatientSms: z.boolean().optional(),
  patientsAheadAlert: z.number().int().positive().optional(),
  allowOverbooking: z.boolean().optional(),
  maxOverbookingPercent: z.number().int().min(0).optional(),
  noShowPolicy: z.string().optional(),
  blockAfterNoShows: z.number().int().min(0).optional(),
  noShowCooldownDays: z.number().int().min(0).optional(),
  enableSmartSlots: z.boolean().optional(),
  slotBufferMinutes: z.number().int().min(0).optional(),
  dailySlotCap: z.number().int().min(0).optional().nullable(),
  lunchBreakStart: z.string().optional().nullable(),
  lunchBreakEnd: z.string().optional().nullable(),
  noShowFee: z.number().min(0).optional(),
});

export const UpdateBillingProfileSchema = z.object({
  bankAccountNumber: z.string().optional().nullable(),
  bankIfsc: z.string().optional().nullable(),
  gstApplicable: z.boolean().optional(),
  tdsApplicable: z.boolean().optional(),
  commissionPercentage: z.number().min(0).max(100).optional().nullable(),
  payoutCycle: z.string().optional().nullable(),
  invoiceLayout: z.string().optional().nullable(),
  headerText: z.string().optional().nullable(),
  footerText: z.string().optional().nullable(),
});
