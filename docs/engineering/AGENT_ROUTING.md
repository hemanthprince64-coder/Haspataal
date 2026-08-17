# AGENT ROUTING RULE

1. Any instruction starting with `@AGENT_PREFIX` is exclusively assigned to that agent.
2. No other agent may execute or modify the task.
3. Every assigned task must generate:
   - `TASK_ID`
   - `Status` (Assigned / In Progress / Completed / Blocked)
   - `Category`
4. If no prefix is used, default to `CTO_AGENT` for classification.
5. No task may exist without ownership.
