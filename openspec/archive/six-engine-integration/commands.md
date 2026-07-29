# Command Catalog

Commands represent an intent or request for an engine to perform an action. They can be dispatched asynchronously via the Event Bus or synchronously via internal queues.

| Command Name | Issuer (Source) | Target Engine | Payload (Key Data) | Failure Mode | Idempotency Key |
|---|---|---|---|---|---|
| `SendNotification` | Rules, Journey | Notify Engine | `templateId`, `recipient`, `vars` | Queue for Retry | `Hash(Template + Recipient + Correlation)` |
| `StartCareJourney` | Rules | Journey Engine | `patientId`, `templateId` | Queue for Retry | `Hash(Template + Patient + Correlation)` |
| `EvaluateRule` | Timeline, Journey| Rules Engine | `context`, `triggerEvent` | Queue for Retry | `EventID` |
| `RebuildSearchDoc` | Admin, Core HMS | Search Engine | `entityId`, `entityType` | Queue for Retry | `EntityID + Timestamp` |
| `InvalidateConfigCache`| Config Engine | All Engines | `configKey`, `version` | Log & Retry | `ConfigKey + Version` |
| `ArchiveTimeline` | Admin | Timeline Engine | `patientId`, `dateRange` | Fail Safe | `CommandUUID` |
