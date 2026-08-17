# Haspataal Documentation Index

Welcome to the Haspataal Documentation. The documentation is organized by information lifecycle and audience.

## 📂 Directory Structure

### 1. `adr/`
Architecture Decision Records (ADRs). Immutable records of significant architectural and design choices.
- [APPROVED_DECISIONS_INVARIANT_REGISTER.md](./adr/APPROVED_DECISIONS_INVARIANT_REGISTER.md)
- [IDEMPOTENCY_TOPOLOGY_DECISION.md](./adr/IDEMPOTENCY_TOPOLOGY_DECISION.md)

### 2. `architecture/`
System design, topology maps, and database schemas.
- [System Architecture](./architecture/architecture.md)
- [API Reference](./api-reference.md)
- [Database Overview](./architecture/DATABASE.md)
- [Event Topology](./architecture/EVENT_TOPOLOGY_MAP.md)

### 3. `compliance/`
Security audits, DPDP (Data Protection) guidelines, Data Ownership, and RLS policies.
- [Security Architecture](./compliance/SECURITY.md)
- [Data Ownership Matrix](./compliance/DATA_OWNERSHIP_MATRIX.md)
- [Authorization Matrix](./compliance/AUTHORIZATION_MATRIX.md)

### 4. `engineering/`
Guides and rules for developers working on the repository.
- [Development Roadmap](./engineering/DEVELOPMENT_ROADMAP.md)
- [Contributing Guidelines](./engineering/CONTRIBUTING.md)
- [Rules & Guidelines](./engineering/RULES.md)
- [AI & Agents Routing](./engineering/AGENT_ROUTING.md)

#### `engineering/testing/`
QA guidelines and checklists.
- [QA Overview](./engineering/testing/QA.md)
- [Release Checklist](./engineering/testing/RELEASE_CHECKLIST.md)

### 5. `manuals/`
Role-based operational guides for different stakeholders.
- [Admin Manual](./manuals/ADMIN.md)
- [Hospital/HMS Manual](./manuals/HMS.md)
- [Doctor Manual](./manuals/DOCTOR.md)
- [Patient Manual](./manuals/PATIENT.md)

### 6. `operational/`
Runbooks and migration plans for production operations.
- [Deployment Runbook](./operational/runbooks/DEPLOYMENT.md)
- [Migration Plan](./operational/runbooks/MIGRATION_PLAN.md)

## 🔍 Internal References
All markdown files in this repository are verified using `lychee` to ensure no broken internal or external links exist.
