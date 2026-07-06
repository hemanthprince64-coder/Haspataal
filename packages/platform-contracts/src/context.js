import { z } from 'zod';
export const TenantContextSchema = z.object({
    platformId: z.string().uuid(),
    hospitalGroupId: z.string().uuid().optional(),
    hospitalId: z.string().uuid(),
    branchId: z.string().uuid().optional(),
    departmentId: z.string().uuid().optional(),
    activeScope: z.enum(['HOSPITAL', 'BRANCH', 'DEPARTMENT']),
    tenantMembershipId: z.string().uuid().optional(),
});
export const ActorContextSchema = z.object({
    actorId: z.string().uuid(),
    actorType: z.enum(['SYSTEM', 'USER', 'PATIENT']),
    userId: z.string().uuid().optional(),
    staffId: z.string().uuid().optional(),
    doctorId: z.string().uuid().optional(),
    patientId: z.string().uuid().optional(),
    roleIds: z.array(z.string().uuid()),
    permissionIds: z.array(z.string()),
    sessionId: z.string().uuid().optional(),
    deviceId: z.string().optional(),
    authenticationStrength: z.enum(['MFA', 'PASSWORD', 'OTP']),
    delegatedAccess: z.boolean(),
    impersonationState: z.object({
        originalActorId: z.string().uuid(),
        reason: z.string(),
    }).optional(),
});
export const AccessContextSchema = z.object({
    tenantScope: z.string(),
    resourceScope: z.string(),
    careRelationship: z.string().optional(),
    patientOwnership: z.boolean().optional(),
    familyDelegation: z.boolean().optional(),
    consentGranted: z.boolean(),
    purposeOfUse: z.enum(['CLINICAL', 'ADMINISTRATIVE', 'BILLING', 'EMERGENCY']),
    emergencyOverride: z.boolean(),
    breakGlassStatus: z.boolean(),
    accessReason: z.string().optional(),
});
