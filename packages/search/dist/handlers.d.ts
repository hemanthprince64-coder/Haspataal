import { z } from 'zod';

import { SearchService } from './application/services/search-service';

/**
 * Payload schema for indexing a document.
 */
export declare const IndexDocumentPayloadSchema: z.ZodObject<
  {
    entityType: z.ZodString;
    entityId: z.ZodString;
    hospitalId: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    content: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
  },
  'strip',
  z.ZodTypeAny,
  {
    entityType: string;
    entityId: string;
    title: string;
    hospitalId?: string | undefined;
    content?: string | undefined;
    metadata?: Record<string, any> | undefined;
  },
  {
    entityType: string;
    entityId: string;
    title: string;
    hospitalId?: string | undefined;
    content?: string | undefined;
    metadata?: Record<string, any> | undefined;
  }
>;
export type IndexDocumentPayload = z.infer<typeof IndexDocumentPayloadSchema>;
/**
 * Payload schema for deleting a document.
 */
export declare const DeleteDocumentPayloadSchema: z.ZodObject<
  {
    entityType: z.ZodString;
    entityId: z.ZodString;
  },
  'strip',
  z.ZodTypeAny,
  {
    entityType: string;
    entityId: string;
  },
  {
    entityType: string;
    entityId: string;
  }
>;
export type DeleteDocumentPayload = z.infer<typeof DeleteDocumentPayloadSchema>;
export declare const IndexDocumentCommandSchema: z.ZodObject<
  {
    commandId: z.ZodString;
    commandVersion: z.ZodNumber;
    target: z.ZodString;
    tenantContext: z.ZodObject<
      {
        platformId: z.ZodString;
        hospitalGroupId: z.ZodOptional<z.ZodString>;
        hospitalId: z.ZodString;
        branchId: z.ZodOptional<z.ZodString>;
        departmentId: z.ZodOptional<z.ZodString>;
        activeScope: z.ZodEnum<['HOSPITAL', 'BRANCH', 'DEPARTMENT']>;
        tenantMembershipId: z.ZodOptional<z.ZodString>;
      },
      'strip',
      z.ZodTypeAny,
      {
        platformId: string;
        hospitalId: string;
        activeScope: 'HOSPITAL' | 'BRANCH' | 'DEPARTMENT';
        hospitalGroupId?: string | undefined;
        branchId?: string | undefined;
        departmentId?: string | undefined;
        tenantMembershipId?: string | undefined;
      },
      {
        platformId: string;
        hospitalId: string;
        activeScope: 'HOSPITAL' | 'BRANCH' | 'DEPARTMENT';
        hospitalGroupId?: string | undefined;
        branchId?: string | undefined;
        departmentId?: string | undefined;
        tenantMembershipId?: string | undefined;
      }
    >;
    actorContext: z.ZodObject<
      {
        actorId: z.ZodString;
        actorType: z.ZodEnum<['SYSTEM', 'USER', 'PATIENT']>;
        userId: z.ZodOptional<z.ZodString>;
        staffId: z.ZodOptional<z.ZodString>;
        doctorId: z.ZodOptional<z.ZodString>;
        patientId: z.ZodOptional<z.ZodString>;
        roleIds: z.ZodArray<z.ZodString, 'many'>;
        permissionIds: z.ZodArray<z.ZodString, 'many'>;
        sessionId: z.ZodOptional<z.ZodString>;
        deviceId: z.ZodOptional<z.ZodString>;
        authenticationStrength: z.ZodEnum<['MFA', 'PASSWORD', 'OTP']>;
        delegatedAccess: z.ZodBoolean;
        impersonationState: z.ZodOptional<
          z.ZodObject<
            {
              originalActorId: z.ZodString;
              reason: z.ZodString;
            },
            'strip',
            z.ZodTypeAny,
            {
              originalActorId: string;
              reason: string;
            },
            {
              originalActorId: string;
              reason: string;
            }
          >
        >;
      },
      'strip',
      z.ZodTypeAny,
      {
        actorId: string;
        actorType: 'SYSTEM' | 'USER' | 'PATIENT';
        roleIds: string[];
        permissionIds: string[];
        authenticationStrength: 'MFA' | 'PASSWORD' | 'OTP';
        delegatedAccess: boolean;
        userId?: string | undefined;
        staffId?: string | undefined;
        doctorId?: string | undefined;
        patientId?: string | undefined;
        sessionId?: string | undefined;
        deviceId?: string | undefined;
        impersonationState?:
          | {
              originalActorId: string;
              reason: string;
            }
          | undefined;
      },
      {
        actorId: string;
        actorType: 'SYSTEM' | 'USER' | 'PATIENT';
        roleIds: string[];
        permissionIds: string[];
        authenticationStrength: 'MFA' | 'PASSWORD' | 'OTP';
        delegatedAccess: boolean;
        userId?: string | undefined;
        staffId?: string | undefined;
        doctorId?: string | undefined;
        patientId?: string | undefined;
        sessionId?: string | undefined;
        deviceId?: string | undefined;
        impersonationState?:
          | {
              originalActorId: string;
              reason: string;
            }
          | undefined;
      }
    >;
    correlationId: z.ZodString;
    causationId: z.ZodOptional<z.ZodString>;
    idempotencyKey: z.ZodString;
    timestamp: z.ZodDate;
    payload: z.ZodObject<
      {
        entityType: z.ZodString;
        entityId: z.ZodString;
        hospitalId: z.ZodOptional<z.ZodString>;
        title: z.ZodString;
        content: z.ZodOptional<z.ZodString>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
      },
      'strip',
      z.ZodTypeAny,
      {
        entityType: string;
        entityId: string;
        title: string;
        hospitalId?: string | undefined;
        content?: string | undefined;
        metadata?: Record<string, any> | undefined;
      },
      {
        entityType: string;
        entityId: string;
        title: string;
        hospitalId?: string | undefined;
        content?: string | undefined;
        metadata?: Record<string, any> | undefined;
      }
    >;
  },
  'strip',
  z.ZodTypeAny,
  {
    commandId: string;
    commandVersion: number;
    target: string;
    tenantContext: {
      platformId: string;
      hospitalId: string;
      activeScope: 'HOSPITAL' | 'BRANCH' | 'DEPARTMENT';
      hospitalGroupId?: string | undefined;
      branchId?: string | undefined;
      departmentId?: string | undefined;
      tenantMembershipId?: string | undefined;
    };
    actorContext: {
      actorId: string;
      actorType: 'SYSTEM' | 'USER' | 'PATIENT';
      roleIds: string[];
      permissionIds: string[];
      authenticationStrength: 'MFA' | 'PASSWORD' | 'OTP';
      delegatedAccess: boolean;
      userId?: string | undefined;
      staffId?: string | undefined;
      doctorId?: string | undefined;
      patientId?: string | undefined;
      sessionId?: string | undefined;
      deviceId?: string | undefined;
      impersonationState?:
        | {
            originalActorId: string;
            reason: string;
          }
        | undefined;
    };
    correlationId: string;
    idempotencyKey: string;
    timestamp: Date;
    payload: {
      entityType: string;
      entityId: string;
      title: string;
      hospitalId?: string | undefined;
      content?: string | undefined;
      metadata?: Record<string, any> | undefined;
    };
    causationId?: string | undefined;
  },
  {
    commandId: string;
    commandVersion: number;
    target: string;
    tenantContext: {
      platformId: string;
      hospitalId: string;
      activeScope: 'HOSPITAL' | 'BRANCH' | 'DEPARTMENT';
      hospitalGroupId?: string | undefined;
      branchId?: string | undefined;
      departmentId?: string | undefined;
      tenantMembershipId?: string | undefined;
    };
    actorContext: {
      actorId: string;
      actorType: 'SYSTEM' | 'USER' | 'PATIENT';
      roleIds: string[];
      permissionIds: string[];
      authenticationStrength: 'MFA' | 'PASSWORD' | 'OTP';
      delegatedAccess: boolean;
      userId?: string | undefined;
      staffId?: string | undefined;
      doctorId?: string | undefined;
      patientId?: string | undefined;
      sessionId?: string | undefined;
      deviceId?: string | undefined;
      impersonationState?:
        | {
            originalActorId: string;
            reason: string;
          }
        | undefined;
    };
    correlationId: string;
    idempotencyKey: string;
    timestamp: Date;
    payload: {
      entityType: string;
      entityId: string;
      title: string;
      hospitalId?: string | undefined;
      content?: string | undefined;
      metadata?: Record<string, any> | undefined;
    };
    causationId?: string | undefined;
  }
>;
export declare const DeleteDocumentCommandSchema: z.ZodObject<
  {
    commandId: z.ZodString;
    commandVersion: z.ZodNumber;
    target: z.ZodString;
    tenantContext: z.ZodObject<
      {
        platformId: z.ZodString;
        hospitalGroupId: z.ZodOptional<z.ZodString>;
        hospitalId: z.ZodString;
        branchId: z.ZodOptional<z.ZodString>;
        departmentId: z.ZodOptional<z.ZodString>;
        activeScope: z.ZodEnum<['HOSPITAL', 'BRANCH', 'DEPARTMENT']>;
        tenantMembershipId: z.ZodOptional<z.ZodString>;
      },
      'strip',
      z.ZodTypeAny,
      {
        platformId: string;
        hospitalId: string;
        activeScope: 'HOSPITAL' | 'BRANCH' | 'DEPARTMENT';
        hospitalGroupId?: string | undefined;
        branchId?: string | undefined;
        departmentId?: string | undefined;
        tenantMembershipId?: string | undefined;
      },
      {
        platformId: string;
        hospitalId: string;
        activeScope: 'HOSPITAL' | 'BRANCH' | 'DEPARTMENT';
        hospitalGroupId?: string | undefined;
        branchId?: string | undefined;
        departmentId?: string | undefined;
        tenantMembershipId?: string | undefined;
      }
    >;
    actorContext: z.ZodObject<
      {
        actorId: z.ZodString;
        actorType: z.ZodEnum<['SYSTEM', 'USER', 'PATIENT']>;
        userId: z.ZodOptional<z.ZodString>;
        staffId: z.ZodOptional<z.ZodString>;
        doctorId: z.ZodOptional<z.ZodString>;
        patientId: z.ZodOptional<z.ZodString>;
        roleIds: z.ZodArray<z.ZodString, 'many'>;
        permissionIds: z.ZodArray<z.ZodString, 'many'>;
        sessionId: z.ZodOptional<z.ZodString>;
        deviceId: z.ZodOptional<z.ZodString>;
        authenticationStrength: z.ZodEnum<['MFA', 'PASSWORD', 'OTP']>;
        delegatedAccess: z.ZodBoolean;
        impersonationState: z.ZodOptional<
          z.ZodObject<
            {
              originalActorId: z.ZodString;
              reason: z.ZodString;
            },
            'strip',
            z.ZodTypeAny,
            {
              originalActorId: string;
              reason: string;
            },
            {
              originalActorId: string;
              reason: string;
            }
          >
        >;
      },
      'strip',
      z.ZodTypeAny,
      {
        actorId: string;
        actorType: 'SYSTEM' | 'USER' | 'PATIENT';
        roleIds: string[];
        permissionIds: string[];
        authenticationStrength: 'MFA' | 'PASSWORD' | 'OTP';
        delegatedAccess: boolean;
        userId?: string | undefined;
        staffId?: string | undefined;
        doctorId?: string | undefined;
        patientId?: string | undefined;
        sessionId?: string | undefined;
        deviceId?: string | undefined;
        impersonationState?:
          | {
              originalActorId: string;
              reason: string;
            }
          | undefined;
      },
      {
        actorId: string;
        actorType: 'SYSTEM' | 'USER' | 'PATIENT';
        roleIds: string[];
        permissionIds: string[];
        authenticationStrength: 'MFA' | 'PASSWORD' | 'OTP';
        delegatedAccess: boolean;
        userId?: string | undefined;
        staffId?: string | undefined;
        doctorId?: string | undefined;
        patientId?: string | undefined;
        sessionId?: string | undefined;
        deviceId?: string | undefined;
        impersonationState?:
          | {
              originalActorId: string;
              reason: string;
            }
          | undefined;
      }
    >;
    correlationId: z.ZodString;
    causationId: z.ZodOptional<z.ZodString>;
    idempotencyKey: z.ZodString;
    timestamp: z.ZodDate;
    payload: z.ZodObject<
      {
        entityType: z.ZodString;
        entityId: z.ZodString;
      },
      'strip',
      z.ZodTypeAny,
      {
        entityType: string;
        entityId: string;
      },
      {
        entityType: string;
        entityId: string;
      }
    >;
  },
  'strip',
  z.ZodTypeAny,
  {
    commandId: string;
    commandVersion: number;
    target: string;
    tenantContext: {
      platformId: string;
      hospitalId: string;
      activeScope: 'HOSPITAL' | 'BRANCH' | 'DEPARTMENT';
      hospitalGroupId?: string | undefined;
      branchId?: string | undefined;
      departmentId?: string | undefined;
      tenantMembershipId?: string | undefined;
    };
    actorContext: {
      actorId: string;
      actorType: 'SYSTEM' | 'USER' | 'PATIENT';
      roleIds: string[];
      permissionIds: string[];
      authenticationStrength: 'MFA' | 'PASSWORD' | 'OTP';
      delegatedAccess: boolean;
      userId?: string | undefined;
      staffId?: string | undefined;
      doctorId?: string | undefined;
      patientId?: string | undefined;
      sessionId?: string | undefined;
      deviceId?: string | undefined;
      impersonationState?:
        | {
            originalActorId: string;
            reason: string;
          }
        | undefined;
    };
    correlationId: string;
    idempotencyKey: string;
    timestamp: Date;
    payload: {
      entityType: string;
      entityId: string;
    };
    causationId?: string | undefined;
  },
  {
    commandId: string;
    commandVersion: number;
    target: string;
    tenantContext: {
      platformId: string;
      hospitalId: string;
      activeScope: 'HOSPITAL' | 'BRANCH' | 'DEPARTMENT';
      hospitalGroupId?: string | undefined;
      branchId?: string | undefined;
      departmentId?: string | undefined;
      tenantMembershipId?: string | undefined;
    };
    actorContext: {
      actorId: string;
      actorType: 'SYSTEM' | 'USER' | 'PATIENT';
      roleIds: string[];
      permissionIds: string[];
      authenticationStrength: 'MFA' | 'PASSWORD' | 'OTP';
      delegatedAccess: boolean;
      userId?: string | undefined;
      staffId?: string | undefined;
      doctorId?: string | undefined;
      patientId?: string | undefined;
      sessionId?: string | undefined;
      deviceId?: string | undefined;
      impersonationState?:
        | {
            originalActorId: string;
            reason: string;
          }
        | undefined;
    };
    correlationId: string;
    idempotencyKey: string;
    timestamp: Date;
    payload: {
      entityType: string;
      entityId: string;
    };
    causationId?: string | undefined;
  }
>;
/**
 * Validates and routes incoming Search commands from the inbox/bus.
 */
export declare class SearchCommandHandler {
  private searchService;
  constructor(searchService: SearchService);
  handleIndexDocument(
    rawCommand: unknown,
    options?: {
      tx?: any;
    },
  ): Promise<void>;
  handleDeleteDocument(
    rawCommand: unknown,
    options?: {
      tx?: any;
    },
  ): Promise<void>;
}
//# sourceMappingURL=handlers.d.ts.map
