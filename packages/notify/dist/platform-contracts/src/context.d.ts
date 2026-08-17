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
    hospitalId: string;
    platformId: string;
    activeScope: "HOSPITAL" | "BRANCH" | "DEPARTMENT";
    hospitalGroupId?: string | undefined;
    branchId?: string | undefined;
    departmentId?: string | undefined;
    tenantMembershipId?: string | undefined;
}, {
    hospitalId: string;
    platformId: string;
    activeScope: "HOSPITAL" | "BRANCH" | "DEPARTMENT";
    hospitalGroupId?: string | undefined;
    branchId?: string | undefined;
    departmentId?: string | undefined;
    tenantMembershipId?: string | undefined;
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
        originalActorId: string;
        reason: string;
    }, {
        originalActorId: string;
        reason: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    actorId: string;
    actorType: "SYSTEM" | "USER" | "PATIENT";
    roleIds: string[];
    permissionIds: string[];
    authenticationStrength: "MFA" | "PASSWORD" | "OTP";
    delegatedAccess: boolean;
    patientId?: string | undefined;
    doctorId?: string | undefined;
    userId?: string | undefined;
    staffId?: string | undefined;
    sessionId?: string | undefined;
    deviceId?: string | undefined;
    impersonationState?: {
        originalActorId: string;
        reason: string;
    } | undefined;
}, {
    actorId: string;
    actorType: "SYSTEM" | "USER" | "PATIENT";
    roleIds: string[];
    permissionIds: string[];
    authenticationStrength: "MFA" | "PASSWORD" | "OTP";
    delegatedAccess: boolean;
    patientId?: string | undefined;
    doctorId?: string | undefined;
    userId?: string | undefined;
    staffId?: string | undefined;
    sessionId?: string | undefined;
    deviceId?: string | undefined;
    impersonationState?: {
        originalActorId: string;
        reason: string;
    } | undefined;
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
    tenantScope: string;
    resourceScope: string;
    consentGranted: boolean;
    purposeOfUse: "EMERGENCY" | "CLINICAL" | "ADMINISTRATIVE" | "BILLING";
    emergencyOverride: boolean;
    breakGlassStatus: boolean;
    careRelationship?: string | undefined;
    patientOwnership?: boolean | undefined;
    familyDelegation?: boolean | undefined;
    accessReason?: string | undefined;
}, {
    tenantScope: string;
    resourceScope: string;
    consentGranted: boolean;
    purposeOfUse: "EMERGENCY" | "CLINICAL" | "ADMINISTRATIVE" | "BILLING";
    emergencyOverride: boolean;
    breakGlassStatus: boolean;
    careRelationship?: string | undefined;
    patientOwnership?: boolean | undefined;
    familyDelegation?: boolean | undefined;
    accessReason?: string | undefined;
}>;
export type AccessContext = z.infer<typeof AccessContextSchema>;
