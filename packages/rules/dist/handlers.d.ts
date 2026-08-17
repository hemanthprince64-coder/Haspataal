import { PlatformCommand } from '@haspataal/platform-contracts';
import { z } from 'zod';
import { Rule } from './types';
export declare const CreateRulePayloadSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    category: z.ZodEnum<["CLINICAL", "BUSINESS", "NOTIFICATION", "RETENTION", "BILLING", "SECURITY", "VALIDATION"]>;
    triggerType: z.ZodEnum<["EVENT", "SCHEDULED", "MANUAL", "BATCH"]>;
    triggerEvent: z.ZodOptional<z.ZodString>;
    conditionJson: z.ZodArray<z.ZodAny, "many">;
    actionJson: z.ZodArray<z.ZodAny, "many">;
    isActive: z.ZodDefault<z.ZodBoolean>;
    priority: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    description?: string;
    category?: "CLINICAL" | "BUSINESS" | "NOTIFICATION" | "RETENTION" | "BILLING" | "SECURITY" | "VALIDATION";
    triggerType?: "EVENT" | "SCHEDULED" | "MANUAL" | "BATCH";
    triggerEvent?: string;
    conditionJson?: any[];
    actionJson?: any[];
    isActive?: boolean;
    priority?: number;
}, {
    name?: string;
    description?: string;
    category?: "CLINICAL" | "BUSINESS" | "NOTIFICATION" | "RETENTION" | "BILLING" | "SECURITY" | "VALIDATION";
    triggerType?: "EVENT" | "SCHEDULED" | "MANUAL" | "BATCH";
    triggerEvent?: string;
    conditionJson?: any[];
    actionJson?: any[];
    isActive?: boolean;
    priority?: number;
}>;
export declare const ExecuteRulePayloadSchema: z.ZodObject<{
    ruleId: z.ZodString;
    event: z.ZodOptional<z.ZodAny>;
    patientId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    event?: any;
    patientId?: string;
    ruleId?: string;
}, {
    event?: any;
    patientId?: string;
    ruleId?: string;
}>;
export declare const CreateRuleCommandSchema: z.ZodObject<{
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
    correlationId: z.ZodString;
    causationId: z.ZodOptional<z.ZodString>;
    idempotencyKey: z.ZodString;
    timestamp: z.ZodDate;
    payload: any;
}, "strip", z.ZodTypeAny, {
    payload?: any;
    timestamp?: Date;
    commandId?: string;
    commandVersion?: number;
    target?: string;
    tenantContext?: {
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
    };
    correlationId?: string;
    causationId?: string;
    idempotencyKey?: string;
}, {
    payload?: any;
    timestamp?: Date;
    commandId?: string;
    commandVersion?: number;
    target?: string;
    tenantContext?: {
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
    };
    correlationId?: string;
    causationId?: string;
    idempotencyKey?: string;
}>;
export declare const ExecuteRuleCommandSchema: z.ZodObject<{
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
    correlationId: z.ZodString;
    causationId: z.ZodOptional<z.ZodString>;
    idempotencyKey: z.ZodString;
    timestamp: z.ZodDate;
    payload: any;
}, "strip", z.ZodTypeAny, {
    payload?: any;
    timestamp?: Date;
    commandId?: string;
    commandVersion?: number;
    target?: string;
    tenantContext?: {
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
    };
    correlationId?: string;
    causationId?: string;
    idempotencyKey?: string;
}, {
    payload?: any;
    timestamp?: Date;
    commandId?: string;
    commandVersion?: number;
    target?: string;
    tenantContext?: {
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
    };
    correlationId?: string;
    causationId?: string;
    idempotencyKey?: string;
}>;
export declare class RuleCommandHandler {
    static handleCreateRule(command: PlatformCommand<z.infer<typeof CreateRulePayloadSchema>>): Promise<Rule>;
    static handleExecuteRule(command: PlatformCommand<z.infer<typeof ExecuteRulePayloadSchema>>, options?: {
        tx?: any;
    }): Promise<import("./types").RuleResult>;
}
