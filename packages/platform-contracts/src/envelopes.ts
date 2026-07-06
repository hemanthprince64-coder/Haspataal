import { z } from 'zod';
import { TenantContextSchema, ActorContextSchema, AccessContextSchema } from './context';

export function createPlatformEventSchema<T extends z.ZodTypeAny>(payloadSchema: T) {
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

// Helper to infer the generic type
export type PlatformEvent<TPayload> = {
  eventId: string;
  eventName: string;
  eventVersion: number;
  occurredAt: Date;
  publishedAt: Date;
  producer: string;
  tenantContext: z.infer<typeof TenantContextSchema>;
  actorReference: z.infer<typeof ActorContextSchema>;
  subjectReference?: { type: string; id: string };
  correlationId: string;
  causationId: string;
  traceId: string;
  idempotencyKey: string;
  payload: TPayload;
  metadata: Record<string, string>;
};

export function createPlatformCommandSchema<T extends z.ZodTypeAny>(payloadSchema: T) {
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

export function createPlatformQuerySchema<T extends z.ZodTypeAny>(filtersSchema: T) {
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

export type PlatformQuery<TFilters> = {
  tenantScope: z.infer<typeof TenantContextSchema>;
  actorScope: z.infer<typeof ActorContextSchema>;
  resourceAuthorization: z.infer<typeof AccessContextSchema>;
  filters: TFilters;
  sorting?: { field: string; direction: 'asc' | 'desc' }[];
  pagination?: { cursor?: string; limit: number };
  projection?: string[];
  correlationId: string;
};
