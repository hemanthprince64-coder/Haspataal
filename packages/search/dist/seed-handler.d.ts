import { z } from 'zod';

import { SearchService } from './application/services/search-service';

export declare const SeedCommandPayloadSchema: z.ZodObject<
  {
    action: z.ZodEnum<['seed-catalog', 'seed-all', 'index-medicine', 'index-investigation']>;
    drugId: z.ZodOptional<z.ZodString>;
    drugName: z.ZodOptional<z.ZodString>;
    genericName: z.ZodOptional<z.ZodString>;
    strength: z.ZodOptional<z.ZodString>;
    formulation: z.ZodOptional<z.ZodString>;
    testId: z.ZodOptional<z.ZodString>;
    testName: z.ZodOptional<z.ZodString>;
    testCode: z.ZodOptional<z.ZodString>;
    sampleType: z.ZodOptional<z.ZodString>;
    fastingRequired: z.ZodOptional<z.ZodBoolean>;
  },
  'strip',
  z.ZodTypeAny,
  {
    action: 'seed-catalog' | 'seed-all' | 'index-medicine' | 'index-investigation';
    drugId?: string | undefined;
    drugName?: string | undefined;
    genericName?: string | undefined;
    strength?: string | undefined;
    formulation?: string | undefined;
    testId?: string | undefined;
    testName?: string | undefined;
    testCode?: string | undefined;
    sampleType?: string | undefined;
    fastingRequired?: boolean | undefined;
  },
  {
    action: 'seed-catalog' | 'seed-all' | 'index-medicine' | 'index-investigation';
    drugId?: string | undefined;
    drugName?: string | undefined;
    genericName?: string | undefined;
    strength?: string | undefined;
    formulation?: string | undefined;
    testId?: string | undefined;
    testName?: string | undefined;
    testCode?: string | undefined;
    sampleType?: string | undefined;
    fastingRequired?: boolean | undefined;
  }
>;
export declare const SeedCommandSchema: z.ZodObject<
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
        action: z.ZodEnum<['seed-catalog', 'seed-all', 'index-medicine', 'index-investigation']>;
        drugId: z.ZodOptional<z.ZodString>;
        drugName: z.ZodOptional<z.ZodString>;
        genericName: z.ZodOptional<z.ZodString>;
        strength: z.ZodOptional<z.ZodString>;
        formulation: z.ZodOptional<z.ZodString>;
        testId: z.ZodOptional<z.ZodString>;
        testName: z.ZodOptional<z.ZodString>;
        testCode: z.ZodOptional<z.ZodString>;
        sampleType: z.ZodOptional<z.ZodString>;
        fastingRequired: z.ZodOptional<z.ZodBoolean>;
      },
      'strip',
      z.ZodTypeAny,
      {
        action: 'seed-catalog' | 'seed-all' | 'index-medicine' | 'index-investigation';
        drugId?: string | undefined;
        drugName?: string | undefined;
        genericName?: string | undefined;
        strength?: string | undefined;
        formulation?: string | undefined;
        testId?: string | undefined;
        testName?: string | undefined;
        testCode?: string | undefined;
        sampleType?: string | undefined;
        fastingRequired?: boolean | undefined;
      },
      {
        action: 'seed-catalog' | 'seed-all' | 'index-medicine' | 'index-investigation';
        drugId?: string | undefined;
        drugName?: string | undefined;
        genericName?: string | undefined;
        strength?: string | undefined;
        formulation?: string | undefined;
        testId?: string | undefined;
        testName?: string | undefined;
        testCode?: string | undefined;
        sampleType?: string | undefined;
        fastingRequired?: boolean | undefined;
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
      action: 'seed-catalog' | 'seed-all' | 'index-medicine' | 'index-investigation';
      drugId?: string | undefined;
      drugName?: string | undefined;
      genericName?: string | undefined;
      strength?: string | undefined;
      formulation?: string | undefined;
      testId?: string | undefined;
      testName?: string | undefined;
      testCode?: string | undefined;
      sampleType?: string | undefined;
      fastingRequired?: boolean | undefined;
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
      action: 'seed-catalog' | 'seed-all' | 'index-medicine' | 'index-investigation';
      drugId?: string | undefined;
      drugName?: string | undefined;
      genericName?: string | undefined;
      strength?: string | undefined;
      formulation?: string | undefined;
      testId?: string | undefined;
      testName?: string | undefined;
      testCode?: string | undefined;
      sampleType?: string | undefined;
      fastingRequired?: boolean | undefined;
    };
    causationId?: string | undefined;
  }
>;
export declare class SeedCommandHandler {
  private searchService;
  constructor(searchService: SearchService);
  handleSeedCommand(rawCommand: unknown): Promise<
    | {
        success: boolean;
        message: string;
      }
    | {
        success: boolean;
        message?: undefined;
      }
  >;
  private seedMedicineCatalog;
  private seedInvestigationCatalog;
  private seedPatients;
  private seedDoctors;
  private seedAppointments;
  private seedTimelineEvents;
  private seedInvoices;
  private seedLabOrders;
  private seedPrescriptions;
}
//# sourceMappingURL=seed-handler.d.ts.map
