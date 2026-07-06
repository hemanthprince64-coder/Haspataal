"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationRequestSchema = void 0;
exports.createResolvedConfigurationSchema = createResolvedConfigurationSchema;
const zod_1 = require("zod");
const context_1 = require("./context");
exports.ConfigurationRequestSchema = zod_1.z.object({
    key: zod_1.z.string(),
    tenantContext: context_1.TenantContextSchema,
    actorContext: context_1.ActorContextSchema.optional(),
});
function createResolvedConfigurationSchema(valueSchema) {
    return zod_1.z.object({
        key: zod_1.z.string(),
        resolvedValue: valueSchema,
        sourceScope: zod_1.z.enum(['PLATFORM', 'GROUP', 'HOSPITAL', 'BRANCH', 'DEPARTMENT', 'USER']),
        sourceIdentifier: zod_1.z.string(),
        version: zod_1.z.number().int().nonnegative(),
        resolvedAt: zod_1.z.coerce.date(),
        expiry: zod_1.z.coerce.date(),
        policyLock: zod_1.z.boolean(),
        fallbackUsed: zod_1.z.boolean(),
        lastKnownGoodStatus: zod_1.z.boolean(),
    });
}
