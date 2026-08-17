import { z } from 'zod';
import { TenantContextSchema, ActorContextSchema } from './context';

export const ConfigurationRequestSchema = z.object({
  key: z.string(),
  tenantContext: TenantContextSchema,
  actorContext: ActorContextSchema.optional(),
});

export type ConfigurationRequest = z.infer<typeof ConfigurationRequestSchema>;

export function createResolvedConfigurationSchema<T extends z.ZodTypeAny>(valueSchema: T) {
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

export type ResolvedConfiguration<T> = {
  key: string;
  resolvedValue: T;
  sourceScope: 'PLATFORM' | 'GROUP' | 'HOSPITAL' | 'BRANCH' | 'DEPARTMENT' | 'USER';
  sourceIdentifier: string;
  version: number;
  resolvedAt: Date;
  expiry: Date;
  policyLock: boolean;
  fallbackUsed: boolean;
  lastKnownGoodStatus: boolean;
};
