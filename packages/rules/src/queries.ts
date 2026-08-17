import { PlatformQuery, createPlatformQuerySchema } from '@haspataal/platform-contracts';
import { z } from 'zod';
import { RuleRegistry } from './registry';
import { Rule } from './types';

export const RuleFiltersSchema = z.object({
  category: z.string().optional(),
  eventType: z.string().optional(),
});
export type RuleFilters = z.infer<typeof RuleFiltersSchema>;

export const RuleQuerySchema = createPlatformQuerySchema(RuleFiltersSchema as any);
export type RuleQuery = z.infer<typeof RuleQuerySchema>;

const registry = new RuleRegistry();

export class RuleQueryHandler {
  static async getRules(query: PlatformQuery<RuleFilters>): Promise<Rule[]> {
    const { hospitalId } = query.tenantScope;
    const { category, eventType } = query.filters;

    if (eventType) {
      return await registry.findByEvent(eventType, hospitalId);
    }
    
    return await registry.list(hospitalId, category);
  }
}
