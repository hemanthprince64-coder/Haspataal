import { z } from 'zod';
import { TenantContextSchema, ActorContextSchema, AccessContextSchema } from './context';
export function createPlatformEventSchema(payloadSchema) {
    return z.object({
        eventId: z.string().uuid(),
        eventName: z.string(),
        eventVersion: z.number().int().positive(),
        occurredAt: z.coerce.date(),
        publishedAt: z.coerce.date(),
        producer: z.string(),
        tenantContext: TenantContextSchema,
        actorReference: ActorContextSchema,
        subjectReference: z.object({
            type: z.string(),
            id: z.string(),
        }).optional(),
        correlationId: z.string().uuid(),
        causationId: z.string().uuid(),
        traceId: z.string(),
        idempotencyKey: z.string(),
        payload: payloadSchema,
        metadata: z.record(z.string(), z.string()), // NO PHI ALLOWED
    });
}
export function createPlatformCommandSchema(payloadSchema) {
    return z.object({
        commandId: z.string().uuid(),
        commandVersion: z.number().int().positive(),
        target: z.string(),
        tenantContext: TenantContextSchema,
        actorContext: ActorContextSchema,
        correlationId: z.string().uuid(),
        causationId: z.string().uuid().optional(),
        idempotencyKey: z.string(),
        timestamp: z.coerce.date(),
        payload: payloadSchema,
    });
}
export function createPlatformQuerySchema(filtersSchema) {
    return z.object({
        tenantScope: TenantContextSchema,
        actorScope: ActorContextSchema,
        resourceAuthorization: AccessContextSchema,
        filters: filtersSchema,
        sorting: z.array(z.object({
            field: z.string(),
            direction: z.enum(['asc', 'desc']),
        })).optional(),
        pagination: z.object({
            cursor: z.string().optional(),
            limit: z.number().int().positive(),
        }).optional(),
        projection: z.array(z.string()).optional(),
        correlationId: z.string().uuid(),
    });
}
