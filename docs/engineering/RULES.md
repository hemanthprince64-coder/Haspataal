# Clinical Rules Engine

## Overview
Centralized, configurable workflow automation for all clinical and business processes. No hardcoded workflows — everything is driven by rules.

## Models

### Rule
- `id` - UUID
- `hospitalId` - Optional multi-tenant isolation
- `name` - Rule identifier
- `description` - Human-readable description
- `category` - CLINICAL | BUSINESS | NOTIFICATION | RETENTION | BILLING | SECURITY | VALIDATION
- `triggerType` - EVENT | SCHEDULED | MANUAL | BATCH
- `triggerEvent` - EventType that fires this rule
- `conditionJson` - Array of conditions (field, operator, value)
- `actionJson` - Array of actions to execute
- `isActive` - Enable/disable flag
- `priority` - Execution order (1-1000)

### RuleExecution
- Tracks every rule execution
- Status: PENDING | SUCCESS | FAILED | SKIPPED
- Execution time tracking
- Error capture

### RuleSchedule
- Cron-based rule scheduling
- Timezone support (default Asia/Kolkata)
- Next/last run tracking

## Execution Flow

1. **Event Trigger** → Timeline event emitted
2. **Rule Matcher** → Find active rules with matching triggerEvent
3. **Condition Evaluator** → RuleCompiler evaluates all conditions
4. **Action Executor** → ExecutionEngine runs actions via BullMQ
5. **Audit** → RuleExecution logged

## Rule Templates

### Pregnancy Care
```json
{
  "triggerEvent": "ANC_VISIT_COMPLETED",
  "conditionJson": [
    {"field": "gestationalAge", "operator": "gte", "value": 36}
  ],
  "actionJson": [
    {"type": "create_timeline", "payload": {"event_type": "PREGNANCY_HIGH_RISK"}},
    {"type": "send_notification", "payload": {"to": "doctor", "template": "high_risk_anc"}}
  ]
}
```

### Diabetes Monitoring
```json
{
  "triggerEvent": "GLYCEMIC_READING",
  "conditionJson": [
    {"field": "glucose", "operator": "gt", "value": 300}
  ],
  "actionJson": [
    {"type": "escalate", "payload": {"level": "DOCTOR", "reason": "Hypoglycemia"}},
    {"type": "assign_task", "payload": {"to": "nurse", "task": "follow_up_call"}}
  ]
}
```

### Vaccination Scheduling
```json
{
  "triggerEvent": "PATIENT_REGISTERED",
  "conditionJson": [
    {"field": "age.months", "operator": "eq", "value": 12}
  ],
  "actionJson": [
    {"type": "create_timeline", "payload": {"event_type": "VACCINATION_DUE", "title": "DPT Booster Due"}},
    {"type": "send_notification", "payload": {"to": "parent", "template": "vaccination_reminder"}}
  ]
}
```

## RLS Policies (Apply in Supabase)

```sql
-- Enable RLS on rules tables
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE rule_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rule_schedules ENABLE ROW LEVEL SECURITY;

-- Hospital admins can only see their rules
CREATE POLICY "hospital_isolation_rules" ON rules
  FOR ALL USING (
    hospital_id IS NULL OR
    hospital_id = current_setting('request.hospital_id')::uuid
  );
```