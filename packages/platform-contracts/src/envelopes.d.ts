import { z } from 'zod';
import { TenantContextSchema, ActorContextSchema, AccessContextSchema } from './context';
export declare function createPlatformEventSchema<T extends z.ZodTypeAny>(payloadSchema: T): z.ZodObject<{
    eventId: z.ZodString;
    eventName: z.ZodString;
    eventVersion: z.ZodNumber;
    occurredAt: z.ZodDate;
    publishedAt: z.ZodDate;
    producer: z.ZodString;
    tenantContext: z.ZodObject<{
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
    actorReference: z.ZodObject<{
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
    subjectReference: z.ZodOptional<z.ZodObject<{
        type: z.ZodString;
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type?: string;
        id?: string;
    }, {
        type?: string;
        id?: string;
    }>>;
    correlationId: z.ZodString;
    causationId: z.ZodString;
    traceId: z.ZodString;
    idempotencyKey: z.ZodString;
    payload: T;
    metadata: z.ZodRecord<z.ZodString, z.ZodString>;
}, "strip", z.ZodTypeAny, z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
    eventId: z.ZodString;
    eventName: z.ZodString;
    eventVersion: z.ZodNumber;
    occurredAt: z.ZodDate;
    publishedAt: z.ZodDate;
    producer: z.ZodString;
    tenantContext: z.ZodObject<{
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
    actorReference: z.ZodObject<{
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
    subjectReference: z.ZodOptional<z.ZodObject<{
        type: z.ZodString;
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type?: string;
        id?: string;
    }, {
        type?: string;
        id?: string;
    }>>;
    correlationId: z.ZodString;
    causationId: z.ZodString;
    traceId: z.ZodString;
    idempotencyKey: z.ZodString;
    payload: T;
    metadata: z.ZodRecord<z.ZodString, z.ZodString>;
}>, any> extends infer T_1 ? { [k in keyof T_1]: T_1[k]; } : never, z.baseObjectInputType<{
    eventId: z.ZodString;
    eventName: z.ZodString;
    eventVersion: z.ZodNumber;
    occurredAt: z.ZodDate;
    publishedAt: z.ZodDate;
    producer: z.ZodString;
    tenantContext: z.ZodObject<{
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
    actorReference: z.ZodObject<{
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
    subjectReference: z.ZodOptional<z.ZodObject<{
        type: z.ZodString;
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type?: string;
        id?: string;
    }, {
        type?: string;
        id?: string;
    }>>;
    correlationId: z.ZodString;
    causationId: z.ZodString;
    traceId: z.ZodString;
    idempotencyKey: z.ZodString;
    payload: T;
    metadata: z.ZodRecord<z.ZodString, z.ZodString>;
}> extends infer T_2 ? { [k_1 in keyof T_2]: T_2[k_1]; } : never>;
export type PlatformEvent<TPayload> = {
    eventId: string;
    eventName: string;
    eventVersion: number;
    occurredAt: Date;
    publishedAt: Date;
    producer: string;
    tenantContext: z.infer<typeof TenantContextSchema>;
    actorReference: z.infer<typeof ActorContextSchema>;
    subjectReference?: {
        type: string;
        id: string;
    };
    correlationId: string;
    causationId: string;
    traceId: string;
    idempotencyKey: string;
    payload: TPayload;
    metadata: Record<string, string>;
};
export declare function createPlatformCommandSchema<T extends z.ZodTypeAny>(payloadSchema: T): z.ZodObject<{
    commandId: z.ZodString;
    commandVersion: z.ZodNumber;
    target: z.ZodString;
    tenantContext: z.ZodObject<{
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
    actorContext: z.ZodObject<{
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
    correlationId: z.ZodString;
    causationId: z.ZodOptional<z.ZodString>;
    idempotencyKey: z.ZodString;
    timestamp: z.ZodDate;
    payload: T;
}, "strip", z.ZodTypeAny, z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
    commandId: z.ZodString;
    commandVersion: z.ZodNumber;
    target: z.ZodString;
    tenantContext: z.ZodObject<{
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
    actorContext: z.ZodObject<{
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
    correlationId: z.ZodString;
    causationId: z.ZodOptional<z.ZodString>;
    idempotencyKey: z.ZodString;
    timestamp: z.ZodDate;
    payload: T;
}>, any> extends infer T_1 ? { [k in keyof T_1]: T_1[k]; } : never, z.baseObjectInputType<{
    commandId: z.ZodString;
    commandVersion: z.ZodNumber;
    target: z.ZodString;
    tenantContext: z.ZodObject<{
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
    actorContext: z.ZodObject<{
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
    correlationId: z.ZodString;
    causationId: z.ZodOptional<z.ZodString>;
    idempotencyKey: z.ZodString;
    timestamp: z.ZodDate;
    payload: T;
}> extends infer T_2 ? { [k_1 in keyof T_2]: T_2[k_1]; } : never>;
export type PlatformCommand<TPayload> = {
    commandId: string;
    commandVersion: number;
    target: string;
    tenantContext: z.infer<typeof TenantContextSchema>;
    actorContext: z.infer<typeof ActorContextSchema>;
    correlationId: string;
    causationId?: string;
    idempotencyKey: string;
    timestamp: Date;
    payload: TPayload;
};
export declare function createPlatformQuerySchema<T extends z.ZodTypeAny>(filtersSchema: T): z.ZodObject<{
    tenantScope: z.ZodObject<{
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
    filters: T;
    sorting: z.ZodOptional<z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        direction: z.ZodEnum<["asc", "desc"]>;
    }, "strip", z.ZodTypeAny, {
        field?: string;
        direction?: "asc" | "desc";
    }, {
        field?: string;
        direction?: "asc" | "desc";
    }>, "many">>;
    pagination: z.ZodOptional<z.ZodObject<{
        cursor: z.ZodOptional<z.ZodString>;
        limit: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        limit?: number;
        cursor?: string;
    }, {
        limit?: number;
        cursor?: string;
    }>>;
    projection: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    correlationId: z.ZodString;
}, "strip", z.ZodTypeAny, z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
    tenantScope: z.ZodObject<{
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
    filters: T;
    sorting: z.ZodOptional<z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        direction: z.ZodEnum<["asc", "desc"]>;
    }, "strip", z.ZodTypeAny, {
        field?: string;
        direction?: "asc" | "desc";
    }, {
        field?: string;
        direction?: "asc" | "desc";
    }>, "many">>;
    pagination: z.ZodOptional<z.ZodObject<{
        cursor: z.ZodOptional<z.ZodString>;
        limit: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        limit?: number;
        cursor?: string;
    }, {
        limit?: number;
        cursor?: string;
    }>>;
    projection: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    correlationId: z.ZodString;
}>, any> extends infer T_1 ? { [k in keyof T_1]: T_1[k]; } : never, z.baseObjectInputType<{
    tenantScope: z.ZodObject<{
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
    filters: T;
    sorting: z.ZodOptional<z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        direction: z.ZodEnum<["asc", "desc"]>;
    }, "strip", z.ZodTypeAny, {
        field?: string;
        direction?: "asc" | "desc";
    }, {
        field?: string;
        direction?: "asc" | "desc";
    }>, "many">>;
    pagination: z.ZodOptional<z.ZodObject<{
        cursor: z.ZodOptional<z.ZodString>;
        limit: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        limit?: number;
        cursor?: string;
    }, {
        limit?: number;
        cursor?: string;
    }>>;
    projection: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    correlationId: z.ZodString;
}> extends infer T_2 ? { [k_1 in keyof T_2]: T_2[k_1]; } : never>;
export type PlatformQuery<TFilters> = {
    tenantScope: z.infer<typeof TenantContextSchema>;
    actorScope: z.infer<typeof ActorContextSchema>;
    resourceAuthorization: z.infer<typeof AccessContextSchema>;
    filters: TFilters;
    sorting?: {
        field: string;
        direction: 'asc' | 'desc';
    }[];
    pagination?: {
        cursor?: string;
        limit: number;
    };
    projection?: string[];
    correlationId: string;
};
