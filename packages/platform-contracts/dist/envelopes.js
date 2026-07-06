"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPlatformEventSchema = createPlatformEventSchema;
exports.createPlatformCommandSchema = createPlatformCommandSchema;
exports.createPlatformQuerySchema = createPlatformQuerySchema;
const zod_1 = require("zod");
const context_1 = require("./context");
function createPlatformEventSchema(payloadSchema) {
    return zod_1.z.object({
        eventId: zod_1.z.string().uuid(),
        eventName: zod_1.z.string(),
        eventVersion: zod_1.z.number().int().positive(),
        occurredAt: zod_1.z.coerce.date(),
        publishedAt: zod_1.z.coerce.date(),
        producer: zod_1.z.string(),
        tenantContext: context_1.TenantContextSchema,
        actorReference: context_1.ActorContextSchema,
        subjectReference: zod_1.z.object({
            type: zod_1.z.string(),
            id: zod_1.z.string(),
        }).optional(),
        correlationId: zod_1.z.string().uuid(),
        causationId: zod_1.z.string().uuid(),
        traceId: zod_1.z.string(),
        idempotencyKey: zod_1.z.string(),
        payload: payloadSchema,
        metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.string()), // NO PHI ALLOWED
    });
}
function createPlatformCommandSchema(payloadSchema) {
    return zod_1.z.object({
        commandId: zod_1.z.string().uuid(),
        commandVersion: zod_1.z.number().int().positive(),
        target: zod_1.z.string(),
        tenantContext: context_1.TenantContextSchema,
        actorContext: context_1.ActorContextSchema,
        correlationId: zod_1.z.string().uuid(),
        causationId: zod_1.z.string().uuid().optional(),
        idempotencyKey: zod_1.z.string(),
        timestamp: zod_1.z.coerce.date(),
        payload: payloadSchema,
    });
}
function createPlatformQuerySchema(filtersSchema) {
    return zod_1.z.object({
        tenantScope: context_1.TenantContextSchema,
        actorScope: context_1.ActorContextSchema,
        resourceAuthorization: context_1.AccessContextSchema,
        filters: filtersSchema,
        sorting: zod_1.z.array(zod_1.z.object({
            field: zod_1.z.string(),
            direction: zod_1.z.enum(['asc', 'desc']),
        })).optional(),
        pagination: zod_1.z.object({
            cursor: zod_1.z.string().optional(),
            limit: zod_1.z.number().int().positive(),
        }).optional(),
        projection: zod_1.z.array(zod_1.z.string()).optional(),
        correlationId: zod_1.z.string().uuid(),
    });
}
