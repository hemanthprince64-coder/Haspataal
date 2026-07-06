import { PlatformQuery } from '@haspataal/platform-contracts';
import { z } from 'zod';
import { SearchService } from './application/services/search-service';
export declare const SearchFiltersSchema: z.ZodObject<{
    query: z.ZodString;
    types: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    limit: z.ZodOptional<z.ZodNumber>;
    cursor: z.ZodOptional<z.ZodString>;
    from: z.ZodOptional<z.ZodString>;
    to: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    query: string;
    types?: string[] | undefined;
    limit?: number | undefined;
    cursor?: string | undefined;
    from?: string | undefined;
    to?: string | undefined;
}, {
    query: string;
    types?: string[] | undefined;
    limit?: number | undefined;
    cursor?: string | undefined;
    from?: string | undefined;
    to?: string | undefined;
}>;
export type SearchFilters = z.infer<typeof SearchFiltersSchema>;
export declare const AutocompleteFiltersSchema: z.ZodObject<{
    query: z.ZodString;
    types: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    limit: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    query: string;
    types?: string[] | undefined;
    limit?: number | undefined;
}, {
    query: string;
    types?: string[] | undefined;
    limit?: number | undefined;
}>;
export type AutocompleteFilters = z.infer<typeof AutocompleteFiltersSchema>;
export declare const SearchQuerySchema: z.ZodObject<{
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
    tenantScope: {
        platformId: string;
        hospitalId: string;
        activeScope: "HOSPITAL" | "BRANCH" | "DEPARTMENT";
        hospitalGroupId?: string | undefined;
        branchId?: string | undefined;
        departmentId?: string | undefined;
        tenantMembershipId?: string | undefined;
    };
    actorScope: {
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
    resourceAuthorization: {
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
    correlationId: string;
    filters?: any;
    sorting?: {
        field: string;
        direction: "asc" | "desc";
    }[] | undefined;
    pagination?: {
        limit: number;
        cursor?: string | undefined;
    } | undefined;
    projection?: string[] | undefined;
}, {
    tenantScope: {
        platformId: string;
        hospitalId: string;
        activeScope: "HOSPITAL" | "BRANCH" | "DEPARTMENT";
        hospitalGroupId?: string | undefined;
        branchId?: string | undefined;
        departmentId?: string | undefined;
        tenantMembershipId?: string | undefined;
    };
    actorScope: {
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
    resourceAuthorization: {
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
    correlationId: string;
    filters?: any;
    sorting?: {
        field: string;
        direction: "asc" | "desc";
    }[] | undefined;
    pagination?: {
        limit: number;
        cursor?: string | undefined;
    } | undefined;
    projection?: string[] | undefined;
}>;
export declare const AutocompleteQuerySchema: z.ZodObject<{
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
    tenantScope: {
        platformId: string;
        hospitalId: string;
        activeScope: "HOSPITAL" | "BRANCH" | "DEPARTMENT";
        hospitalGroupId?: string | undefined;
        branchId?: string | undefined;
        departmentId?: string | undefined;
        tenantMembershipId?: string | undefined;
    };
    actorScope: {
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
    resourceAuthorization: {
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
    correlationId: string;
    filters?: any;
    sorting?: {
        field: string;
        direction: "asc" | "desc";
    }[] | undefined;
    pagination?: {
        limit: number;
        cursor?: string | undefined;
    } | undefined;
    projection?: string[] | undefined;
}, {
    tenantScope: {
        platformId: string;
        hospitalId: string;
        activeScope: "HOSPITAL" | "BRANCH" | "DEPARTMENT";
        hospitalGroupId?: string | undefined;
        branchId?: string | undefined;
        departmentId?: string | undefined;
        tenantMembershipId?: string | undefined;
    };
    actorScope: {
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
    resourceAuthorization: {
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
    correlationId: string;
    filters?: any;
    sorting?: {
        field: string;
        direction: "asc" | "desc";
    }[] | undefined;
    pagination?: {
        limit: number;
        cursor?: string | undefined;
    } | undefined;
    projection?: string[] | undefined;
}>;
export declare class SearchQueryHandler {
    private searchService;
    constructor(searchService: SearchService);
    handleSearch(query: PlatformQuery<SearchFilters>): Promise<{
        results: {
            id: string;
            entityType: "patient" | "doctor" | "hospital" | "appointment" | "journey" | "prescription" | "lab" | "radiology" | "bill" | "medicine" | "investigation" | "notification" | "task" | "clinical" | "timeline";
            entityId: string;
            title: string;
            rank: number;
            createdAt: Date;
            updatedAt: Date;
            hospitalId?: string | undefined;
            content?: string | undefined;
            metadata?: Record<string, any> | undefined;
            highlight?: Record<string, string[]> | undefined;
        }[];
        total: number;
        tookMs: number;
        nextCursor?: string | undefined;
        facets?: Record<string, {
            value: string;
            count: number;
        }[]> | undefined;
    }>;
    handleAutocomplete(query: PlatformQuery<AutocompleteFilters>): Promise<import(".").AutocompleteResult>;
}
//# sourceMappingURL=queries.d.ts.map