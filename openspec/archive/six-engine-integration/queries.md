# Query Catalog

Queries represent requests for data where an immediate, synchronous answer is required. Engines expose Read Models for this purpose.

| Query Name | Issuer | Target Read Model | Data Requested | Fallback / Failure Mode |
|---|---|---|---|---|
| `GetPatientTimeline` | Journey Engine | Timeline Projection | Recent clinical events for patient | Fail Closed (Suspend journey eval) |
| `GetActiveJourneys` | Core HMS / Rules | Journey Projection | List of active care journeys | Degrade Gracefully (Return empty) |
| `SearchPatients` | Core HMS | Search Index | Patient demographics matching query | Fail Safe (Fallback to direct DB query if allowed) |
| `GetConfigValue` | Any Engine | Config Cache / Resolver | Resolved configuration value | Last-Known-Good or Default |
| `GetDeliveryStatus` | Journey Engine | Notify Projection | Status of a specific notification | Queue for Retry later |
