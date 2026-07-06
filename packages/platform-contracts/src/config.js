import { z } from 'zod';
import { TenantContextSchema, ActorContextSchema } from './context';
export const ConfigurationRequestSchema = z.object({
    key: z.string(),
    tenantContext: TenantContextSchema,
    actorContext: ActorContextSchema.optional(),
});
export function createResolvedConfigurationSchema(valueSchema) {
    return z.object({
        key: z.string(),
        resolvedValue: valueSchema,
        sourceScope: z.enum(['PLATFORM', 'GROUP', 'HOSPITAL', 'BRANCH', 'DEPARTMENT', 'USER']),
        sourceIdentifier: z.string(),
        version: z.number().int().nonnegative(),
        resolvedAt: z.coerce.date(),
        expiry: z.coerce.date(),
        policyLock: z.boolean(),
        fallbackUsed: z.boolean(),
        lastKnownGoodStatus: z.boolean(),
    });
}
