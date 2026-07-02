# Search Domain Model - Complete Specification

## Searchable Objects Classification

### Entity Categories

| Category | Entities | Priority | Ranking Weight |
|----------|----------|----------|--------------|
| CLINICAL | Patient, Doctor, Clinical Note, Prescription, Lab Result, Radiology Result | HIGH | 1.0 |
| FINANCIAL | Bill, Invoice, Payment, Insurance Claim | MEDIUM | 0.8 |
| OPERATIONAL | Appointment, Admission, Discharge, Staff, Department | MEDIUM | 0.7 |
| INVENTORY | Medicine, Drug Stock, Equipment, Supplier | LOW | 0.5 |
| ANALYTICS | Report, Audit Log, Analytics Event | LOW | 0.3 |
| SYSTEM | Notification, Template, Campaign, Journey | MEDIUM | 0.6 |

## Entity Definitions

### Patient Entity
```
Entity: Patient
Table: patients
Search Fields:
  - name (title, weight: 1.0)
  - phone (identity, weight: 0.9)
  - email (identity, weight: 0.8)
  - abha_address (identity, weight: 0.8)
  - address (content, weight: 0.6)
  - city (facet, weight: 0.5)

Metadata:
  - status: ACTIVE | INACTIVE
  - age_group: PEDIATRIC | ADULT | SENIOR
  - gender: MALE | FEMALE | OTHER
  - chronic_conditions: [string]
  - assigned_doctor: uuid (relationship)
  - last_visit: datetime
  - created_at: datetime

Relationships:
  - belongs_to: Patient → Hospital (via appointments)
  - treated_by: Patient → Doctor
  - parent_of: Patient → Child Patient
  - guardian_of: Guardian → Patient

Search Priority: 1 (highest)
Ranking Weight: 1.0
Tags: [clinical, demographic, demographic]
```

### Doctor Entity
```
Entity: Doctor
Table: doctors_master
Search Fields:
  - full_name (title, weight: 1.0)
  - mobile (identity, weight: 0.9)
  - email (identity, weight: 0.8)
  - department (facet, weight: 0.7)
  - specialization (facet, weight: 0.7)

Metadata:
  - status: ACTIVE | INACTIVE | SUSPENDED
  - experience_years: number
  - consultation_fee: number
  - rating_avg: number
  - hospital_affiliations: [uuid]

Relationships:
  - affiliated_with: Doctor → Hospital
  - treats: Doctor → Patient

Search Priority: 1
Ranking Weight: 1.0
Tags: [clinical, provider]
```

### Hospital Entity
```
Entity: Hospital
Table: hospitals_master
Search Fields:
  - legal_name (title, weight: 1.0)
  - display_name (title, weight: 0.8)
  - city (facet, weight: 0.7)
  - specialities (facet, weight: 0.6)

Metadata:
  - hospital_type: HOSPITAL | CLINIC
  - nabh_accredited: boolean
  - nabl_accredited: boolean
  - bed_strength: number
  - facility_type: enum

Relationships:
  - has_departments: Hospital → Department
  - has_doctors: Hospital → Doctor
  - has_patients: Hospital → Patient

Search Priority: 2
Ranking Weight: 0.7
Tags: [operational, facility]
```

### Appointment Entity
```
Entity: Appointment
Table: appointments
Search Fields:
  - slot (facet/date, weight: 1.0)
  - date (facet/date, weight: 0.9)
  - status (facet, weight: 0.8)
  - department (facet, weight: 0.7)

Metadata:
  - status: BOOKED | COMPLETED | CANCELLED
  - consultation_type: OPD | IPD | TELE
  - payment_status: PAID | PENDING
  - queue_number: string

Relationships:
  - belongs_to: Appointment → Patient
  - belongs_to: Appointment → Doctor
  - belongs_to: Appointment → Hospital

Search Priority: 3
Ranking Weight: 0.7
Tags: [operational, scheduling]
```

### Journey Entity
```
Entity: CareJourney
Table: care_journeys
Search Fields:
  - condition_simple (title, weight: 1.0)
  - explanation (content, weight: 0.8)
  - language (facet, weight: 0.5)

Metadata:
  - status: ACTIVE | PAUSED | COMPLETED
  - condition: string
  - condition_category: MATERNAL | CHRONIC | POST_OP
  - seriousness: string
  - pediatric_mode: boolean
  - safety_check: boolean

Relationships:
  - belongs_to: CareJourney → Patient (via visit)
  - belongs_to: CareJourney → Visit

Search Priority: 2
Ranking Weight: 0.6
Tags: [clinical, longitudinal]
```

### Clinical Note Entity
```
Entity: ClinicalNote
Table: visit_notes
Search Fields:
  - content (content, weight: 1.0)
  - type (facet, weight: 0.7)

Metadata:
  - type: CLINICAL_NOTE | PROCEDURE | OBSERVATION
  - created_at: datetime

Relationships:
  - belongs_to: ClinicalNote → Visit
  - belongs_to: Visit → Patient

Search Priority: 1
Ranking Weight: 0.9
Tags: [clinical, documentation]
```

### Prescription Entity
```
Entity: Prescription
Table: patient_prescriptions
Search Fields:
  - type (facet, weight: 1.0)
  - notes (content, weight: 0.8)

Metadata:
  - type: MEDICAL | LAB
  - created_at: datetime

Relationships:
  - belongs_to: Prescription → Patient
  - belongs_to: Prescription → Appointment
  - has_items: Prescription → PrescriptionItem

Search Priority: 1
Ranking Weight: 0.8
Tags: [clinical, medication]
```

### Lab Order Entity
```
Entity: LabOrder
Table: diagnostic_orders
Search Fields:
  - order_status (facet, weight: 1.0)
  - total_amount (facet/num, weight: 0.6)

Metadata:
  - order_status: PENDING | COMPLETED
  - total_amount: decimal
  - created_at: datetime

Relationships:
  - belongs_to: LabOrder → Patient
  - belongs_to: LabOrder → Hospital
  - has_items: LabOrder → LabOrderItem

Search Priority: 3
Ranking Weight: 0.6
Tags: [clinical, diagnostic]
```

### Bill Entity
```
Entity: Bill
Table: bills
Search Fields:
  - total_amount (facet/num, weight: 1.0)
  - status (facet, weight: 0.8)

Metadata:
  - status: PENDING | PAID | CANCELLED
  - payment_status: PAID | PARTIAL | DUE
  - created_at: datetime
  - due_date: datetime

Relationships:
  - belongs_to: Bill → Patient
  - belongs_to: Bill → Hospital

Search Priority: 4
Ranking Weight: 0.5
Tags: [financial]
```

### Notification Entity
```
Entity: Notification
Table: notifications (extended)
Search Fields:
  - recipient (facet, weight: 1.0)
  - body (content, weight: 0.8)

Metadata:
  - status: QUEUED | SENT | DELIVERED | FAILED
  - channel: SMS | WHATSAPP | EMAIL | PUSH | IN_APP
  - priority: EMERGENCY | CRITICAL | HIGH | NORMAL | LOW
  - created_at: datetime

Relationships:
  - belongs_to: Notification → Hospital
  - belongs_to: Notification → Patient

Search Priority: 5
Ranking Weight: 0.4
Tags: [system, communication]
```

### Medicine Entity
```
Entity: Medicine
Table: drug_stocks
Search Fields:
  - drug_name (title, weight: 1.0)
  - batch_number (facet, weight: 0.8)

Metadata:
  - status: IN_STOCK | LOW_STOCK | OUT_OF_STOCK
  - expiry_date: date
  - quantity: number
  - price: decimal

Relationships:
  - belongs_to: DrugStock → Hospital

Search Priority: 6
Ranking Weight: 0.5
Tags: [inventory]
```

## Search Categories

| Category | Description | Used For |
|----------|-------------|---------|
| CLINICAL | Patient care related entities | Doctor/Patient search |
| FINANCIAL | Billing and payment entities | Admin/Billing |
| OPERATIONAL | Scheduling and logistics | Admin/Staff |
| INVENTORY | Medicines and equipment | Pharmacy/Lab |
| ANALYTICS | Reports and logs | Admin/Analytics |
| SYSTEM | Notifications and templates | Admin/System |

## Search Facets

### Common Facets
- `hospital_id` - Hospital scope
- `status` - Entity status
- `created_at` - Creation date range
- `type` - Entity type filter

### Clinical Facets
- `department` - Department name
- `specialty` - Doctor specialty
- `condition` - Health condition
- `priority` - Care priority

### Operational Facets
- `date_range` - Appointment dates
- `assigned_to` - Task assignee
- `staff_role` - Staff role filter

### Financial Facets
- `payment_status` - Paid/Pending
- `amount_range` - Bill amount range
- `insurance` - Insurance panel

## Search Index Strategy

### PostgreSQL Full-Text Search (Launch)
- **tsvector column**: `search_vector` on `searchable_entities`
- **GIN index**: Fast full-text search
- **Columns indexed**: title, content, metadata JSONB searchable fields
- **Features**: Phrase search, prefix matching, ranking

### Document Structure
```sql
CREATE TABLE searchable_entities (
  id UUID PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  hospital_id UUID,
  patient_id UUID,
  title TEXT NOT NULL,
  content TEXT,
  metadata JSONB,
  search_vector TSVECTOR,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE INDEX idx_search ON searchable_entities USING GIN(search_vector);
```

### Indexing Approach
- **Event-driven**: Prisma middleware or triggers
- **Batch size**: 100 documents per transaction
- **Update strategy**: UPSERT on entity changes
- **Delete strategy**: Soft delete via visibility flag

## Permissions Model

### Search Access Control
| Role | Patient Search | Doctor Search | Hospital Search | Bill Search |
|------|---------------|---------------|-----------------|-----------|
| Super Admin | All | All | All | All |
| Hospital Admin | Hospital scope | Hospital scope | Own hospital | Own hospital |
| Doctor | Assigned patients | All | Own hospital | None |
| Patient | Self only | None | None | Self only |
| Staff | Assigned scope | Department scope | Department | None |

### RLS Implementation
```sql
CREATE POLICY search_access ON searchable_entities
  FOR ALL
  USING (
    hospital_id = current_setting('hospitable.current_hospital_id')::uuid
    OR patient_id IN (
      SELECT id FROM patients 
      WHERE id = current_setting('hospitable.current_patient_id')::uuid
    )
  );
```

## Visibility Model

| Entity | Visibility Rule |
|--------|----------------|
| Patient | Doctor can see assigned, Patient can see self |
| Doctor | Hospital staff only |
| Hospital | Public for basic info |
| Bill | Patient self, Admin scope |
| Journey | Doctor assigned, Patient self |
| Lab Order | Assigned staff, Patient self |
| Prescription | Assigned doctor, Patient self |

## Index Strategy per Entity

| Entity | Index Frequency | Full Reindex | Real-time Updates |
|--------|-----------------|--------------|-----------------|
| Patient | Real-time | Weekly | On create/update/delete |
| Doctor | Real-time | Weekly | On create/update/delete |
| Appointment | Real-time | Daily | On create/update/delete |
| Journey | Real-time | Daily | On status change |
| Bill | Real-time | Daily | On payment status change |
| Lab Order | Real-time | Daily | On result update |
| Notification | Real-time | Never | On create/update |
| Medicine | Real-time | Daily | On stock change |