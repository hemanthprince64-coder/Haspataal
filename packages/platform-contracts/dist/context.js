"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessContextSchema = exports.ActorContextSchema = exports.TenantContextSchema = void 0;
const zod_1 = require("zod");
exports.TenantContextSchema = zod_1.z.object({
    platformId: zod_1.z.string().uuid(),
    hospitalGroupId: zod_1.z.string().uuid().optional(),
    hospitalId: zod_1.z.string().uuid(),
    branchId: zod_1.z.string().uuid().optional(),
    departmentId: zod_1.z.string().uuid().optional(),
    activeScope: zod_1.z.enum(['HOSPITAL', 'BRANCH', 'DEPARTMENT']),
    tenantMembershipId: zod_1.z.string().uuid().optional(),
});
exports.ActorContextSchema = zod_1.z.object({
    actorId: zod_1.z.string().uuid(),
    actorType: zod_1.z.enum(['SYSTEM', 'USER', 'PATIENT']),
    userId: zod_1.z.string().uuid().optional(),
    staffId: zod_1.z.string().uuid().optional(),
    doctorId: zod_1.z.string().uuid().optional(),
    patientId: zod_1.z.string().uuid().optional(),
    roleIds: zod_1.z.array(zod_1.z.string().uuid()),
    permissionIds: zod_1.z.array(zod_1.z.string()),
    sessionId: zod_1.z.string().uuid().optional(),
    deviceId: zod_1.z.string().optional(),
    authenticationStrength: zod_1.z.enum(['MFA', 'PASSWORD', 'OTP']),
    delegatedAccess: zod_1.z.boolean(),
    impersonationState: zod_1.z.object({
        originalActorId: zod_1.z.string().uuid(),
        reason: zod_1.z.string(),
    }).optional(),
});
exports.AccessContextSchema = zod_1.z.object({
    tenantScope: zod_1.z.string(),
    resourceScope: zod_1.z.string(),
    careRelationship: zod_1.z.string().optional(),
    patientOwnership: zod_1.z.boolean().optional(),
    familyDelegation: zod_1.z.boolean().optional(),
    consentGranted: zod_1.z.boolean(),
    purposeOfUse: zod_1.z.enum(['CLINICAL', 'ADMINISTRATIVE', 'BILLING', 'EMERGENCY']),
    emergencyOverride: zod_1.z.boolean(),
    breakGlassStatus: zod_1.z.boolean(),
    accessReason: zod_1.z.string().optional(),
});
