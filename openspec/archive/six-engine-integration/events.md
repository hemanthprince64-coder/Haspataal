# Event Catalog

Events represent state changes that have already occurred. They are used for decoupled reaction across the platform.

| Event Name | Producer | Consumers | Payload (Key Data) | Partition Key | Notes |
|---|---|---|---|---|---|
| `PatientRegistered` | Core HMS | Timeline, Search, Journey | `patientId`, Demographics | `hospitalId` | - |
| `PatientDischarged` | Core HMS | Timeline, Rules, Notify | `admissionId`, `dischargeDate`| `hospitalId` | - |
| `AppointmentBooked` | Core HMS | Timeline, Rules, Notify, Search | `appointmentId`, `slot` | `hospitalId` | - |
| `AppointmentCancelled`| Core HMS | Timeline, Rules, Notify, Search | `appointmentId`, `reason` | `hospitalId` | - |
| `ConsultationCompleted`| Core HMS | Timeline, Journey, Rules | `appointmentId`, `diagnoses`| `hospitalId` | - |
| `RuleTriggered` | Rules Engine | Rules Engine (Action Dispatch) | `ruleId`, `intent` | `hospitalId` | Emits internal commands |
| `NotificationQueued`| Notify Engine | Notify Engine | `notificationId`, `channel` | `hospitalId` | - |
| `NotificationDelivered`| Notify Engine| Timeline | `notificationId`, `timestamp` | `hospitalId` | - |
| `NotificationFailed`| Notify Engine | Rules (Retry/Escalate) | `notificationId`, `error` | `hospitalId` | - |
| `JourneyStarted` | Journey Engine | Timeline | `journeyId`, `templateId` | `hospitalId` | - |
| `JourneyMilestoneMet` | Journey Engine| Rules, Notify | `journeyId`, `milestoneId` | `hospitalId` | - |
| `SearchIndexRebuilt`| Search Engine | Admin Portal | `entityType`, `count` | `hospitalId` | - |
| `ConfigUpdated` | Config Engine | All Engines | `key`, `version` | `platformId` | Triggers cache invalidation |
