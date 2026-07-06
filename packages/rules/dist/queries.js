import { createPlatformQuerySchema } from '@haspataal/platform-contracts';
import { z } from 'zod';
import { RuleRegistry } from './registry';
export const RuleFiltersSchema = z.object({
    category: z.string().optional(),
    eventType: z.string().optional(),
});
export const RuleQuerySchema = createPlatformQuerySchema(RuleFiltersSchema);
const registry = new RuleRegistry();
export class RuleQueryHandler {
    static async getRules(query) {
        const { hospitalId } = query.tenantScope;
        const { category, eventType } = query.filters;
        if (eventType) {
            return await registry.findByEvent(eventType, hospitalId);
        }
        return await registry.list(hospitalId, category);
    }
}
