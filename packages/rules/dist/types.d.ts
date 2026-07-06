import { z } from 'zod';
export declare const ConditionSchema: z.ZodObject<{
    field: z.ZodString;
    operator: z.ZodEnum<["eq", "ne", "gt", "gte", "lt", "lte", "in", "not_in", "contains", "between"]>;
    value: z.ZodAny;
}, "strip", z.ZodTypeAny, {
    field?: string;
    operator?: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in" | "not_in" | "contains" | "between";
    value?: any;
}, {
    field?: string;
    operator?: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in" | "not_in" | "contains" | "between";
    value?: any;
}>;
export declare const ActionSchema: z.ZodObject<{
    type: z.ZodEnum<["create_timeline", "send_notification", "update_record", "call_api", "assign_task", "escalate", "complete_milestone", "update_journey_risk"]>;
    payload: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    type?: "create_timeline" | "send_notification" | "update_record" | "call_api" | "assign_task" | "escalate" | "complete_milestone" | "update_journey_risk";
    payload?: Record<string, unknown>;
}, {
    type?: "create_timeline" | "send_notification" | "update_record" | "call_api" | "assign_task" | "escalate" | "complete_milestone" | "update_journey_risk";
    payload?: Record<string, unknown>;
}>;
export declare const RuleSchema: z.ZodObject<{
    id: z.ZodString;
    hospitalId: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    category: z.ZodEnum<["CLINICAL", "BUSINESS", "NOTIFICATION", "RETENTION", "BILLING", "SECURITY", "VALIDATION"]>;
    triggerType: z.ZodEnum<["EVENT", "SCHEDULED", "MANUAL", "BATCH"]>;
    triggerEvent: z.ZodOptional<z.ZodString>;
    conditionJson: z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        operator: z.ZodEnum<["eq", "ne", "gt", "gte", "lt", "lte", "in", "not_in", "contains", "between"]>;
        value: z.ZodAny;
    }, "strip", z.ZodTypeAny, {
        field?: string;
        operator?: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in" | "not_in" | "contains" | "between";
        value?: any;
    }, {
        field?: string;
        operator?: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in" | "not_in" | "contains" | "between";
        value?: any;
    }>, "many">;
    actionJson: z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["create_timeline", "send_notification", "update_record", "call_api", "assign_task", "escalate", "complete_milestone", "update_journey_risk"]>;
        payload: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, "strip", z.ZodTypeAny, {
        type?: "create_timeline" | "send_notification" | "update_record" | "call_api" | "assign_task" | "escalate" | "complete_milestone" | "update_journey_risk";
        payload?: Record<string, unknown>;
    }, {
        type?: "create_timeline" | "send_notification" | "update_record" | "call_api" | "assign_task" | "escalate" | "complete_milestone" | "update_journey_risk";
        payload?: Record<string, unknown>;
    }>, "many">;
    isActive: z.ZodDefault<z.ZodBoolean>;
    priority: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    hospitalId?: string;
    name?: string;
    description?: string;
    category?: "CLINICAL" | "BUSINESS" | "NOTIFICATION" | "RETENTION" | "BILLING" | "SECURITY" | "VALIDATION";
    triggerType?: "EVENT" | "SCHEDULED" | "MANUAL" | "BATCH";
    triggerEvent?: string;
    conditionJson?: {
        field?: string;
        operator?: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in" | "not_in" | "contains" | "between";
        value?: any;
    }[];
    actionJson?: {
        type?: "create_timeline" | "send_notification" | "update_record" | "call_api" | "assign_task" | "escalate" | "complete_milestone" | "update_journey_risk";
        payload?: Record<string, unknown>;
    }[];
    isActive?: boolean;
    priority?: number;
}, {
    id?: string;
    hospitalId?: string;
    name?: string;
    description?: string;
    category?: "CLINICAL" | "BUSINESS" | "NOTIFICATION" | "RETENTION" | "BILLING" | "SECURITY" | "VALIDATION";
    triggerType?: "EVENT" | "SCHEDULED" | "MANUAL" | "BATCH";
    triggerEvent?: string;
    conditionJson?: {
        field?: string;
        operator?: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in" | "not_in" | "contains" | "between";
        value?: any;
    }[];
    actionJson?: {
        type?: "create_timeline" | "send_notification" | "update_record" | "call_api" | "assign_task" | "escalate" | "complete_milestone" | "update_journey_risk";
        payload?: Record<string, unknown>;
    }[];
    isActive?: boolean;
    priority?: number;
}>;
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
