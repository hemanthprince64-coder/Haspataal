import { z } from 'zod';

export declare const ConditionSchema: z.ZodObject<
  {
    field: z.ZodString;
    operator: z.ZodEnum<{
      eq: 'eq';
      ne: 'ne';
      gt: 'gt';
      gte: 'gte';
      lt: 'lt';
      lte: 'lte';
      in: 'in';
      not_in: 'not_in';
      contains: 'contains';
      between: 'between';
    }>;
    value: z.ZodAny;
  },
  z.core.$strip
>;
export declare const ActionSchema: z.ZodObject<
  {
    type: z.ZodEnum<{
      create_timeline: 'create_timeline';
      send_notification: 'send_notification';
      update_record: 'update_record';
      call_api: 'call_api';
      assign_task: 'assign_task';
      escalate: 'escalate';
    }>;
    payload: z.ZodRecord<z.ZodString, z.ZodUnknown>;
  },
  z.core.$strip
>;
export declare const RuleSchema: z.ZodObject<
  {
    id: z.ZodString;
    hospitalId: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    category: z.ZodEnum<{
      CLINICAL: 'CLINICAL';
      BUSINESS: 'BUSINESS';
      NOTIFICATION: 'NOTIFICATION';
      RETENTION: 'RETENTION';
      BILLING: 'BILLING';
      SECURITY: 'SECURITY';
      VALIDATION: 'VALIDATION';
    }>;
    triggerType: z.ZodEnum<{
      EVENT: 'EVENT';
      SCHEDULED: 'SCHEDULED';
      MANUAL: 'MANUAL';
      BATCH: 'BATCH';
    }>;
    triggerEvent: z.ZodOptional<z.ZodString>;
    conditionJson: z.ZodArray<
      z.ZodObject<
        {
          field: z.ZodString;
          operator: z.ZodEnum<{
            eq: 'eq';
            ne: 'ne';
            gt: 'gt';
            gte: 'gte';
            lt: 'lt';
            lte: 'lte';
            in: 'in';
            not_in: 'not_in';
            contains: 'contains';
            between: 'between';
          }>;
          value: z.ZodAny;
        },
        z.core.$strip
      >
    >;
    actionJson: z.ZodArray<
      z.ZodObject<
        {
          type: z.ZodEnum<{
            create_timeline: 'create_timeline';
            send_notification: 'send_notification';
            update_record: 'update_record';
            call_api: 'call_api';
            assign_task: 'assign_task';
            escalate: 'escalate';
          }>;
          payload: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        },
        z.core.$strip
      >
    >;
    isActive: z.ZodDefault<z.ZodBoolean>;
    priority: z.ZodDefault<z.ZodNumber>;
  },
  z.core.$strip
>;
export type Condition = z.infer<typeof ConditionSchema>;
export type Action = z.infer<typeof ActionSchema>;
export type Rule = z.infer<typeof RuleSchema>;
export interface RuleContext {
  event?: any;
  patientId?: string;
  hospitalId?: string;
  timestamp: Date;
}
export interface RuleResult {
  success: boolean;
  executedActions: Action[];
  skipped?: boolean;
  errors?: string[];
}
