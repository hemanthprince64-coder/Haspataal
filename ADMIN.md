# Platform Administration

## Overview
Platform administration console for Haspataal platform administrators to manage hospitals, doctors, patients, subscriptions, analytics, security, and system configuration.

## Platform Dashboards

### Admin Dashboard
- **Hospitals Overview**: List, search, and filter all registered hospitals
- **Doctors Overview**: Platform-wide doctor registry with verification status
- **Patients Overview**: Cross-hospital patient statistics
- **Revenue Dashboard**: Platform-wide revenue, commissions, and analytics
- **Usage Analytics**: Appointment volume, storage usage, API calls, AI token usage

## Hospital Management

### Hospital Registry
- View all hospitals with registration status (pending, verified, active, suspended)
- Search by name, registration number, city, state
- View onboarding progress and completion percentage
- Hospital verification workflow management

### Hospital Operations
- **Go-live Approvals**: Review and approve hospital setup completion
- **Feature Flags**: Enable/disable features per hospital (teleconsultation, lab services, etc.)
- **Subscription Management**: Track plan, quota usage, renewal dates, overage charges

## Doctor Verification

### Verification Workflow
```
PENDING → DOCUMENT_PENDING → UNDER_VERIFICATION → VERIFIED/REJECTED
```

### Admin Actions
- Review uploaded documents (MBBS, PG, registration, ID proofs)
- Verify credentials against medical council databases
- Reject with reason and request re-upload
- Suspend/reactivate doctor accounts
- Monitor credential expiry notifications

### Verification Queue
- List doctors pending verification
- Filter by status, hospital, document type
- Bulk verification actions
- Verification SLA tracking (48 hours target)

## Patient Management

### Platform-Level Access
- Search patients by mobile, ABHA ID, or global ID
- View aggregated statistics (registrations, appointments, retention)
- Emergency access with audit logging
- Consent history and management

## Master Data

### Medical Taxonomy
- **ICD-10 Codes**: Disease and condition classifications
- **Drug Masters**: Medicine database with formulations, dosages, contraindications
- **Lab Tests**: Diagnostic test catalog with reference ranges
- **Radiology**: Imaging procedure catalog
- **Specialties**: Medical specialties and super-specialties

### Master Data Versioning
- Version control for all master data
- Effective date tracking
- Rollback capability
- Audit trail for all changes

## Subscriptions

### Plan Management
| Feature | Basic | Pro | Enterprise |
|---------|-------|-----|------------|
| Doctors | 5 | 25 | Unlimited |
| Staff | 10 | 50 | Unlimited |
| Storage (GB) | 10 | 100 | 1000+ |
| API Rate Limit | 1000/hr | 10000/hr | Unlimited |
| AI Tokens | 10K/day | 100K/day | Custom |
| Support | Email | Chat | 24/7 |

### Usage Tracking
- Real-time quota monitoring
- Overage alerts
- Auto-invoice generation
- Usage analytics per tenant

## Analytics

### Business Intelligence
- **Revenue Metrics**: Daily/monthly revenue, ARPU, churn rate
- **Growth Metrics**: New hospitals, doctors, patients per period
- **Engagement**: Active users, retention rates, feature adoption
- **Clinical Metrics**: Appointment volume, lab orders, prescriptions
- **Search Metrics**: Search volume, conversion rate, top specialties, alternative suggestions used

## Doctor Discovery

### Discovery Analytics
- Search volume dashboard
- Top searched specialties
- Conversion rate tracking
- Geographic distribution
- Alternative suggestion effectiveness
- Profile completeness metrics

### Discovery Management
- Force re-index doctors
- Hide/show doctors from search
- Bulk verification for discovery
- Search index health monitoring

### Operational Analytics
- System health dashboards
- Error rates and incident tracking
- Performance metrics (response times, throughput)
- Resource utilization (CPU, memory, database connections)

## Reports

### Automated Reports
- Daily platform summary
- Weekly growth report
- Monthly revenue report
- Quarterly compliance report

### Custom Reports
- Filterable by date range, hospital, metric
- Export to CSV/PDF
- Scheduled delivery via email

## Security Center

### Audit & Compliance
- Full audit log viewer
- PHI access monitoring
- Security incident tracking
- DPDP compliance status

### Access Control
- Role management across all hospitals
- Permission matrix visualization
- MFA enforcement tracking
- Session management

## Notification Management

### Templates
- Email templates
- SMS templates
- WhatsApp templates

### Delivery Monitoring
- Sent/failed counts
- Provider analytics
- Retry queues

## Infrastructure Monitoring

### Health Checks
- Database connectivity
- Redis status
- Storage availability
- API endpoints status

### Logs & Metrics
- Centralized logging
- Error aggregation
- Performance tracing
- Alert configuration

## Feature Flags

### Configuration
- Runtime feature toggles
- Tenant-scoped flags
- Gradual rollout capability
- A/B testing support

## Scheduler Monitoring

### Jobs & Cron
- BullMQ queue status
- Failed job retries
- Cron job history
- Worker health

## Queue Monitoring

### Processing Queues
- Appointment confirmations
- Notifications
- Email/SMS delivery
- Report generation

## System Configuration

### Platform Settings
- Global configuration
- Branding defaults
- Email/SMS providers
- Payment gateway settings

### Integration Settings
- Meta WhatsApp Business API
- SMS providers
- Email providers
- Analytics providers

## Compliance

### DPDP Act Compliance
- Consent management
- Data portability tools
- Right to erasure workflows
- Privacy policy versioning

### Security Audits
- Pen test results
- Vulnerability scans
- Compliance checklist
- Certification tracking

## Operational Runbooks

### Incident Response
- Database failover
- API outage procedures
- Security breach protocol
- Data recovery steps

### Maintenance
- Database backup procedures
- System updates
- Migration runbooks
- Performance tuning

## Go-Live Checklist

### Hospital Onboarding
- [ ] Identity verification complete
- [ ] Staff accounts created
- [ ] Schedules configured
- [ ] Services/pricing set
- [ ] Lab/radiology configured
- [ ] Billing tested
- [ ] UAT completed
- [ ] Go-live approved

## Future Admin Roadmap

### Q3 2026
- Multi-language support
- Advanced analytics dashboards
- Custom report builder
- API marketplace

### Q4 2026
- AI-powered insights
- Predictive analytics
- Automated anomaly detection
- Enhanced compliance tools