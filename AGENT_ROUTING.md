# AGENT ROUTING RULES

This file defines the default routing behavior. Full governance and role definitions are in `AI_ORG_INITIALIZATION.md`.

1. Any instruction starting with `@AGENT_PREFIX` is exclusively assigned to that agent.
2. No other agent may execute or modify the assigned task without approval.
3. Every assigned task must generate:
   - `TASK_ID`
   - `Status` (Assigned / In Progress / Completed / Blocked)
   - `Category`
4. If no prefix is used, default owner is `CTO_AGENT` for classification.
5. No task may exist without ownership.
6. Multi-domain tasks must still have one primary owner and explicit secondary notification.
7. Architecture-impacting changes must be flagged in the task record.
