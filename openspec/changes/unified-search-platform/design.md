# Unified Search & Discovery Platform - Design Document

## Business Requirements

### Core Value
- **Unified Discovery**: Single search interface across all healthcare entities
- **Clinical Efficiency**: Doctors find patients, records, medicines in <2 seconds
- **Patient Experience**: Patients find their records, appointments, bills instantly
- **Administrative Oversight**: Admins search bills, analytics, hospital data

### User Personas
| Persona | Primary Search Needs |
|---------|---------------------|
| Doctor | Patients by name/phone/ID, clinical records, prescriptions, lab results |
| Patient | My appointments, prescriptions, lab reports, bills |
| Admin | Hospital analytics, billing, staff, hospital-wide search |
| Pharmacist | Medicines, stock, prescriptions, alternatives |
| Lab Tech | Orders, results, patient samples, reference ranges |

### Business Rules
- Search respects hospital/tenant boundaries (RLS)
- Doctor searches only their hospital's patients
- Patients see only their own data
- Admin sees hospital-scoped data only
- Cross-hospital search only for authorized super-admins

## Functional Requirements

### Search Capabilities
1. **Global Search**: Single query across all entity types
2. **Typed Search**: Filter by entity type (patient, doctor, hospital, etc.)
3. **Faceted Search**: Filter by status, date range, department, specialty
4. **Autocomplete**: Real-time suggestions as user types
5. **Synonyms**: "HTN" → "Hypertension", "DM" → "Diabetes"
6. **Fuzzy Matching**: Typo tolerance (Levenshtein distance ≤2)
7. **Ranking**: Clinical relevance + recency + access frequency

### Entity Coverage
| Module | Searchable Entities |
|--------|---------------------|
| Patient Portal | Patient, Appointment, Prescription, Bill, Vaccination |
| Doctor Portal | Patient, EMR, Prescription, Lab Order, Radiology Order |
| Hospital HMS | Patient, Doctor, Staff, Appointment, Bill, Inventory |
| Lab | Lab Order, Result, Patient, Sample |
| Radiology | Radiology Order, Result, Patient |
| Pharmacy | Medicine, Prescription, Stock, Patient |
| Timeline | All clinical events |
| Care Journey | Journey, Milestone, Task, Risk |
| Notifications | Notification, Template, Campaign |
| Billing | Bill, Invoice, Payment, Insurance |

### Search APIs
- `GET /api/search?q={query}&types={types}&facets={facets}`
- `GET /api/search/autocomplete?q={query}&limit={limit}`
- `GET /api/search/suggestions?q={query}`
- `POST /api/search/index` - Trigger reindex
- `GET /api/search/health` - Index health status

## Non-Functional Requirements

### Performance
- **Latency**: p95 < 100ms for search, p95 < 50ms for autocomplete
- **Throughput**: 1000 searches/second per instance
- **Index Lag**: < 500ms from data change to searchable
- **Availability**: 99.9% uptime

### Scalability
- Horizontal scaling via read replicas
- Partition by hospital_id
- Connection pooling for PostgreSQL
- Redis caching for hot queries

### Security
- Row Level Security (RLS) on all searchable tables
- Hospital/tenant isolation enforced at query level
- Patient data access controlled by doctor-patient relationship
- Audit logging for all search queries
- No PHI in search logs (hash identifiers)

### Observability
- Search query metrics (latency, results count, zero-result queries)
- Index health (document count, index size, lag)
- Popular queries and zero-result analytics
- Failed searches and fallback behavior