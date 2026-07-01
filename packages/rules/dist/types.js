import { z } from 'zod';

export const ConditionSchema = z.object({
  field: z.string(),
  operator: z.enum(['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'not_in', 'contains', 'between']),
  value: z.any(),
});
export const ActionSchema = z.object({
  type: z.enum([
    'create_timeline',
    'send_notification',
    'update_record',
    'call_api',
    'assign_task',
    'escalate',
  ]),
  payload: z.record(z.string(), z.unknown()),
});
export const RuleSchema = z.object({
  id: z.string().uuid(),
  hospitalId: z.string().uuid().optional(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  category: z.enum([
    'CLINICAL',
    'BUSINESS',
    'NOTIFICATION',
    'RETENTION',
    'BILLING',
    'SECURITY',
    'VALIDATION',
  ]),
  triggerType: z.enum(['EVENT', 'SCHEDULED', 'MANUAL', 'BATCH']),
  triggerEvent: z.string().optional(),
  conditionJson: z.array(ConditionSchema),
  actionJson: z.array(ActionSchema),
  isActive: z.boolean().default(true),
  priority: z.number().int().min(1).max(1000).default(100),
});
