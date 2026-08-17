import { PlatformQuery } from '@haspataal/platform-contracts';
import { z } from 'zod';
import { Rule } from './types';
export declare const RuleFiltersSchema: z.ZodObject<{
    category: z.ZodOptional<z.ZodString>;
    eventType: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    category?: string;
    eventType?: string;
}, {
    category?: string;
    eventType?: string;
}>;
export type RuleFilters = z.infer<typeof RuleFiltersSchema>;
export declare const RuleQuerySchema: z.ZodObject<{
    tenantScope: z.ZodObject<{
        platformId: z.ZodString;
        hospitalGroupId: z.ZodOptional<z.ZodString>;
        hospitalId: z.ZodString;
        branchId: z.ZodOptional<z.ZodString>;
        departmentId: z.ZodOptional<z.ZodString>;
        activeScope: z.ZodEnum<["HOSPITAL", "BRANCH", "DEPARTMENT"]>;
        tenantMembershipId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        platformId: string;
        hospitalId: string;
        activeScope: "HOSPITAL" | "BRANCH" | "DEPARTMENT";
        hospitalGroupId?: string | undefined;
        branchId?: string | undefined;
        departmentId?: string | undefined;
        tenantMembershipId?: string | undefined;
    }, {
        platformId: string;
        hospitalId: string;
        activeScope: "HOSPITAL" | "BRANCH" | "DEPARTMENT";
        hospitalGroupId?: string | undefined;
        branchId?: string | undefined;
        departmentId?: string | undefined;
        tenantMembershipId?: string | undefined;
    }>;
    actorScope: z.ZodObject<{
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
        userId?: string | undefined;
        staffId?: string | undefined;
        doctorId?: string | undefined;
        patientId?: string | undefined;
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
        userId?: string | undefined;
        staffId?: string | undefined;
        doctorId?: string | undefined;
        patientId?: string | undefined;
        sessionId?: string | undefined;
        deviceId?: string | undefined;
        impersonationState?: {
            originalActorId: string;
            reason: string;
        } | undefined;
    }>;
    resourceAuthorization: z.ZodObject<{
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
        purposeOfUse: "CLINICAL" | "ADMINISTRATIVE" | "BILLING" | "EMERGENCY";
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
        purposeOfUse: "CLINICAL" | "ADMINISTRATIVE" | "BILLING" | "EMERGENCY";
        emergencyOverride: boolean;
        breakGlassStatus: boolean;
        careRelationship?: string | undefined;
        patientOwnership?: boolean | undefined;
        familyDelegation?: boolean | undefined;
        accessReason?: string | undefined;
    }>;
    filters: any;
    sorting: z.ZodOptional<z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        direction: z.ZodEnum<["asc", "desc"]>;
    }, "strip", z.ZodTypeAny, {
        field: string;
        direction: "asc" | "desc";
    }, {
        field: string;
        direction: "asc" | "desc";
    }>, "many">>;
    pagination: z.ZodOptional<z.ZodObject<{
        cursor: z.ZodOptional<z.ZodString>;
        limit: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        limit: number;
        cursor?: string | undefined;
    }, {
        limit: number;
        cursor?: string | undefined;
    }>>;
    projection: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    correlationId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    correlationId?: string;
    tenantScope?: {
        platformId: string;
        hospitalId: string;
        activeScope: "HOSPITAL" | "BRANCH" | "DEPARTMENT";
        hospitalGroupId?: string | undefined;
        branchId?: string | undefined;
        departmentId?: string | undefined;
        tenantMembershipId?: string | undefined;
    };
    actorScope?: {
        actorId: string;
        actorType: "SYSTEM" | "USER" | "PATIENT";
        roleIds: string[];
        permissionIds: string[];
        authenticationStrength: "MFA" | "PASSWORD" | "OTP";
        delegatedAccess: boolean;
        userId?: string | undefined;
        staffId?: string | undefined;
        doctorId?: string | undefined;
        patientId?: string | undefined;
        sessionId?: string | undefined;
        deviceId?: string | undefined;
        impersonationState?: {
            originalActorId: string;
            reason: string;
        } | undefined;
    };
    resourceAuthorization?: {
        tenantScope: string;
        resourceScope: string;
        consentGranted: boolean;
        purposeOfUse: "CLINICAL" | "ADMINISTRATIVE" | "BILLING" | "EMERGENCY";
        emergencyOverride: boolean;
        breakGlassStatus: boolean;
        careRelationship?: string | undefined;
        patientOwnership?: boolean | undefined;
        familyDelegation?: boolean | undefined;
        accessReason?: string | undefined;
    };
    filters?: any;
    sorting?: {
        field: string;
        direction: "asc" | "desc";
    }[];
    pagination?: {
        limit: number;
        cursor?: string | undefined;
    };
    projection?: string[];
}, {
    correlationId?: string;
    tenantScope?: {
        platformId: string;
        hospitalId: string;
        activeScope: "HOSPITAL" | "BRANCH" | "DEPARTMENT";
        hospitalGroupId?: string | undefined;
        branchId?: string | undefined;
        departmentId?: string | undefined;
        tenantMembershipId?: string | undefined;
    };
    actorScope?: {
        actorId: string;
        actorType: "SYSTEM" | "USER" | "PATIENT";
        roleIds: string[];
        permissionIds: string[];
        authenticationStrength: "MFA" | "PASSWORD" | "OTP";
        delegatedAccess: boolean;
        userId?: string | undefined;
        staffId?: string | undefined;
        doctorId?: string | undefined;
        patientId?: string | undefined;
        sessionId?: string | undefined;
        deviceId?: string | undefined;
        impersonationState?: {
            originalActorId: string;
            reason: string;
        } | undefined;
    };
    resourceAuthorization?: {
        tenantScope: string;
        resourceScope: string;
        consentGranted: boolean;
        purposeOfUse: "CLINICAL" | "ADMINISTRATIVE" | "BILLING" | "EMERGENCY";
        emergencyOverride: boolean;
        breakGlassStatus: boolean;
        careRelationship?: string | undefined;
        patientOwnership?: boolean | undefined;
        familyDelegation?: boolean | undefined;
        accessReason?: string | undefined;
    };
    filters?: any;
    sorting?: {
        field: string;
        direction: "asc" | "desc";
    }[];
    pagination?: {
        limit: number;
        cursor?: string | undefined;
    };
    projection?: string[];
}>;
export type RuleQuery = z.infer<typeof RuleQuerySchema>;
export declare class RuleQueryHandler {
    static getRules(query: PlatformQuery<RuleFilters>): Promise<Rule[]>;
}
