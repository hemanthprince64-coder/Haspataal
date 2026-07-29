## 1. Schema & Models
- [x] 1.1 Create Rule, RuleExecution, RuleSchedule models
- [x] 1.2 Add RuleFact, RuleVariable for dynamic data (deferred)
- [x] 1.3 Create migrations for rules tables (RLS via 003_rules_rls.sql)

## 2. Core Engine
- [x] 2.1 Create RuleRegistry with CRUD operations
- [x] 2.2 Create RuleCompiler for JSON→executable
- [ ] 2.3 Create RuleValidator with condition/action validation
- [x] 2.4 Create ExecutionEngine with fact evaluation

## 3. Actions
- [ ] 3.1 Notification action (SMS/WhatsApp/Email)
- [ ] 3.2 Timeline event creation
- [ ] 3.3 Follow-up scheduling
- [ ] 3.4 Appointment booking

## 4. Workers
- [x] 4.1 Create rules-worker.ts (real-time evaluation)
- [x] 4.2 Create rules-scheduler.ts (cron triggers)

## 5. API
- [ ] 5.1 POST /api/rules - Create rule
- [ ] 5.2 GET /api/rules - List rules
- [ ] 5.3 POST /api/rules/execute - Execute rule

## 6. Admin UI
- [ ] 6.1 Rule list page
- [ ] 6.2 Rule editor form
- [ ] 6.3 Simulation panel