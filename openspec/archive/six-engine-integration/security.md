# Shared Authorization Vocabulary & Permission Matrix

There is no central God Service for authorization. Instead, we use a shared vocabulary. Each engine enforces access to its own resources using `AccessContext`.

## Permission Vocabulary

| Permission Namespace | Description | Assigned Roles |
|---|---|---|
| `timeline.read.self` | Read own timeline | Patient |
| `timeline.read.assigned_patient` | Read timeline for patients under care | Doctor, Nurse |
| `timeline.read.break_glass` | Emergency override read access | Doctor |
| `timeline.read.tenant` | Read any timeline in tenant | Hospital Admin |
| `rule.manage.global` | Create/edit platform-wide rules | Platform Admin |
| `rule.activate.tenant` | Enable/configure rule for hospital | Hospital Admin |
| `notification.template.manage` | Edit notification templates | Hospital Admin |
| `journey.enroll` | Enroll a patient in a journey | Doctor, Nurse, System (Rule) |
| `journey.task.complete` | Complete a milestone/task | Doctor, Nurse, Patient |
| `search.patient.demographic` | Search basic patient profiles | Receptionist, Pharmacist |
| `search.patient.clinical` | Search full clinical profiles | Doctor, Hospital Admin |
| `configuration.manage.tenant` | Manage tenant configurations | Hospital Admin |

## Role Mapping

- **Patient**: `*.self`, `journey.task.complete`
- **Doctor**: `*.assigned_patient`, `journey.enroll`, `journey.task.complete`, `timeline.read.break_glass`, `search.patient.clinical`
- **Nurse**: `*.assigned_patient`, `journey.enroll`, `journey.task.complete`
- **Receptionist**: `search.patient.demographic`
- **Pharmacist**: `search.patient.demographic`, (Pharmacy read/write)
- **Hospital Admin**: `*.tenant`, `rule.activate.tenant`, `notification.template.manage`, `configuration.manage.tenant`
- **Platform Admin**: `*.global`

*Note: Frontend visibility is never sufficient security. Policies must be evaluated server-side.*
