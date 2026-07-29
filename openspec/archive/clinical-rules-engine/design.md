## Architecture

### Layer Flow
HMS Modules → RuleRegistry → RuleCompiler → RuleValidator → ExecutionEngine → ActionDispatcher

### Database Schema (Prisma)
- Rule: main definition with JSON conditions/actions
- RuleVersion: immutable version history
- RuleExecution: execution tracking
- RuleAudit: approval workflow
- RuleSchedule: cron/event triggers

### Execution Patterns
- Real-time: Event-triggered via EventBus
- Scheduled: BullMQ cron workers
- Batch: Periodic evaluation jobs

### Security Model
- RLS on all tables (hospital_id scoped)
- Approval workflow for production rules
- Audit trail on every execution
