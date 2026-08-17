import { z } from 'zod';
export declare const TenantContextSchema: z.ZodObject<{
    platformId: z.ZodString;
    hospitalGroupId: z.ZodOptional<z.ZodString>;
    hospitalId: z.ZodString;
    branchId: z.ZodOptional<z.ZodString>;
    departmentId: z.ZodOptional<z.ZodString>;
    activeScope: z.ZodEnum<["HOSPITAL", "BRANCH", "DEPARTMENT"]>;
    tenantMembershipId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    hospitalId?: string;
    platformId?: string;
    hospitalGroupId?: string;
    branchId?: string;
    departmentId?: string;
    activeScope?: "HOSPITAL" | "BRANCH" | "DEPARTMENT";
    tenantMembershipId?: string;
}, {
    hospitalId?: string;
    platformId?: string;
    hospitalGroupId?: string;
    branchId?: string;
    departmentId?: string;
    activeScope?: "HOSPITAL" | "BRANCH" | "DEPARTMENT";
    tenantMembershipId?: string;
}>;
export type TenantContext = z.infer<typeof TenantContextSchema>;
export declare const ActorContextSchema: z.ZodObject<{
    actorId: z.ZodString;
    actorType: z.ZodEnum<["SYSTEM", "USER", "PATIENT"]>;
    userId: z.ZodOptional<z.ZodString>;
    staffId: z.ZodOptional<z.ZodString>;
    doctorId: z.ZodOptional<z.ZodString>;
    patientId: z.ZodOptional<z.ZodString>;
    roleIds: z.ZodArray<z.ZodString, "many">;
    permissionIds: z.ZodArray<z.ZodString, "many">;
    sessionId: z.ZodOptional<z.ZodString>;
    deviceId: z.ZodOptional<z.ZodString>;
    authenticationStrength: z.ZodEnum<["MFA", "PASSWORD", "OTP"]>;
    delegatedAccess: z.ZodBoolean;
    impersonationState: z.ZodOptional<z.ZodObject<{
        originalActorId: z.ZodString;
        reason: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        originalActorId?: string;
        reason?: string;
    }, {
        originalActorId?: string;
        reason?: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    patientId?: string;
    doctorId?: string;
    userId?: string;
    actorId?: string;
    actorType?: "SYSTEM" | "USER" | "PATIENT";
    staffId?: string;
    roleIds?: string[];
    permissionIds?: string[];
    sessionId?: string;
    deviceId?: string;
    authenticationStrength?: "MFA" | "PASSWORD" | "OTP";
    delegatedAccess?: boolean;
    impersonationState?: {
        originalActorId?: string;
        reason?: string;
    };
}, {
    patientId?: string;
    doctorId?: string;
    userId?: string;
    actorId?: string;
    actorType?: "SYSTEM" | "USER" | "PATIENT";
    staffId?: string;
    roleIds?: string[];
    permissionIds?: string[];
    sessionId?: string;
    deviceId?: string;
    authenticationStrength?: "MFA" | "PASSWORD" | "OTP";
    delegatedAccess?: boolean;
    impersonationState?: {
        originalActorId?: string;
        reason?: string;
    };
}>;
export type ActorContext = z.infer<typeof ActorContextSchema>;
export declare const AccessContextSchema: z.ZodObject<{
    tenantScope: z.ZodString;
    resourceScope: z.ZodString;
    careRelationship: z.ZodOptional<z.ZodString>;
    patientOwnership: z.ZodOptional<z.ZodBoolean>;
    familyDelegation: z.ZodOptional<z.ZodBoolean>;
    consentGranted: z.ZodBoolean;
    purposeOfUse: z.ZodEnum<["CLINICAL", "ADMINISTRATIVE", "BILLING", "EMERGENCY"]>;
    emergencyOverride: z.ZodBoolean;
    breakGlassStatus: z.ZodBoolean;
    accessReason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    tenantScope?: string;
    resourceScope?: string;
    careRelationship?: string;
    patientOwnership?: boolean;
    familyDelegation?: boolean;
    consentGranted?: boolean;
    purposeOfUse?: "CLINICAL" | "BILLING" | "EMERGENCY" | "ADMINISTRATIVE";
    emergencyOverride?: boolean;
    breakGlassStatus?: boolean;
    accessReason?: string;
}, {
    tenantScope?: string;
    resourceScope?: string;
    careRelationship?: string;
    patientOwnership?: boolean;
    familyDelegation?: boolean;
    consentGranted?: boolean;
    purposeOfUse?: "CLINICAL" | "BILLING" | "EMERGENCY" | "ADMINISTRATIVE";
    emergencyOverride?: boolean;
    breakGlassStatus?: boolean;
    accessReason?: string;
}>;
export type AccessContext = z.infer<typeof AccessContextSchema>;
