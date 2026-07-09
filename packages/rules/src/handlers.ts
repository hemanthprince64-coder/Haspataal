import { PlatformCommand, createPlatformCommandSchema } from '@haspataal/platform-contracts';
import { z } from 'zod';

import { ExecutionEngine } from './engine';
import { RuleRegistry } from './registry';
import { Rule } from './types';

export const CreateRulePayloadSchema = z.object({
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
  conditionJson: z.array(z.any()),
  actionJson: z.array(z.any()),
  isActive: z.boolean().default(true),
  priority: z.number().int().min(1).max(1000).default(100),
});

export const ExecuteRulePayloadSchema = z.object({
  ruleId: z.string().uuid(),
  event: z.any().optional(),
  patientId: z.string().uuid().optional(),
});

export const CreateRuleCommandSchema = createPlatformCommandSchema(CreateRulePayloadSchema as any);
export const ExecuteRuleCommandSchema = createPlatformCommandSchema(
  ExecuteRulePayloadSchema as any,
);

const registry = new RuleRegistry();
const engine = new ExecutionEngine();

export class RuleCommandHandler {
  static async handleCreateRule(
    command: PlatformCommand<z.infer<typeof CreateRulePayloadSchema>>,
  ): Promise<Rule> {
    const { hospitalId } = command.tenantContext;
    const payload = command.payload;

    return await registry.create({
      ...payload,
      hospitalId,
    });
  }

  static async handleExecuteRule(
    command: PlatformCommand<z.infer<typeof ExecuteRulePayloadSchema>>,
    options?: { tx?: any },
  ) {
    const { hospitalId } = command.tenantContext;
    const payload = command.payload;

    const rule = await registry.findById(payload.ruleId);
    if (!rule || !rule.isActive || (rule.hospitalId && rule.hospitalId !== hospitalId)) {
      throw new Error('Rule not found, inactive, or belongs to a different tenant');
    }

    const result = await engine.execute(
      rule,
      {
        event: payload.event,
        patientId: payload.patientId,
        hospitalId,
        timestamp: new Date(),
      },
      options?.tx,
    );

    return result;
  }
}
