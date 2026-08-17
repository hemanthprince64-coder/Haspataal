import { z } from 'zod';
export declare const ConfigurationRequestSchema: z.ZodObject<{
    key: z.ZodString;
    tenantContext: z.ZodObject<{
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
    actorContext: z.ZodOptional<z.ZodObject<{
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
    }>>;
}, "strip", z.ZodTypeAny, {
    key: string;
    tenantContext: {
        platformId: string;
        hospitalId: string;
        activeScope: "HOSPITAL" | "BRANCH" | "DEPARTMENT";
        hospitalGroupId?: string | undefined;
        branchId?: string | undefined;
        departmentId?: string | undefined;
        tenantMembershipId?: string | undefined;
    };
    actorContext?: {
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
    } | undefined;
}, {
    key: string;
    tenantContext: {
        platformId: string;
        hospitalId: string;
        activeScope: "HOSPITAL" | "BRANCH" | "DEPARTMENT";
        hospitalGroupId?: string | undefined;
        branchId?: string | undefined;
        departmentId?: string | undefined;
        tenantMembershipId?: string | undefined;
    };
    actorContext?: {
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
    } | undefined;
}>;
export type ConfigurationRequest = z.infer<typeof ConfigurationRequestSchema>;
export declare function createResolvedConfigurationSchema<T extends z.ZodTypeAny>(valueSchema: T): z.ZodObject<{
    key: z.ZodString;
    resolvedValue: T;
    sourceScope: z.ZodEnum<["PLATFORM", "GROUP", "HOSPITAL", "BRANCH", "DEPARTMENT", "USER"]>;
    sourceIdentifier: z.ZodString;
    version: z.ZodNumber;
    resolvedAt: z.ZodDate;
    expiry: z.ZodDate;
    policyLock: z.ZodBoolean;
    fallbackUsed: z.ZodBoolean;
    lastKnownGoodStatus: z.ZodBoolean;
}, "strip", z.ZodTypeAny, z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
    key: z.ZodString;
    resolvedValue: T;
    sourceScope: z.ZodEnum<["PLATFORM", "GROUP", "HOSPITAL", "BRANCH", "DEPARTMENT", "USER"]>;
    sourceIdentifier: z.ZodString;
    version: z.ZodNumber;
    resolvedAt: z.ZodDate;
    expiry: z.ZodDate;
    policyLock: z.ZodBoolean;
    fallbackUsed: z.ZodBoolean;
    lastKnownGoodStatus: z.ZodBoolean;
}>, any> extends infer T_1 ? { [k in keyof T_1]: T_1[k]; } : never, z.baseObjectInputType<{
    key: z.ZodString;
    resolvedValue: T;
    sourceScope: z.ZodEnum<["PLATFORM", "GROUP", "HOSPITAL", "BRANCH", "DEPARTMENT", "USER"]>;
    sourceIdentifier: z.ZodString;
    version: z.ZodNumber;
    resolvedAt: z.ZodDate;
    expiry: z.ZodDate;
    policyLock: z.ZodBoolean;
    fallbackUsed: z.ZodBoolean;
    lastKnownGoodStatus: z.ZodBoolean;
}> extends infer T_2 ? { [k_1 in keyof T_2]: T_2[k_1]; } : never>;
export type ResolvedConfiguration<T> = {
    key: string;
    resolvedValue: T;
    sourceScope: 'PLATFORM' | 'GROUP' | 'HOSPITAL' | 'BRANCH' | 'DEPARTMENT' | 'USER';
    sourceIdentifier: string;
    version: number;
    resolvedAt: Date;
    expiry: Date;
    policyLock: boolean;
    fallbackUsed: boolean;
    lastKnownGoodStatus: boolean;
};
//# sourceMappingURL=config.d.ts.map