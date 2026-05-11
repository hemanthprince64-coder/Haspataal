# Haspataal - Backend Schema & Database Design

## Table of Contents
1. [Schema Overview](#1-schema-overview)
2. [Entity Relationship Diagram (ERD)](#2-entity-relationship-diagram-erd)
3. [Table Definitions](#3-table-definitions)
4. [Indexes & Performance](#4-indexes--performance)
5. [Row-Level Security (RLS)](#5-row-level-security-rls)
6. [Migrations Strategy](#6-migrations-strategy)
7. [Sample Data & Seeds](#7-sample-data--seeds)

---

## 1. Schema Overview

**Database:** PostgreSQL (via Supabase)  
**ORM:** Prisma  
**Total Tables:** 12 core tables + system tables  
**Multi-tenancy:** Row-level security (RLS) policies  
**Backup Strategy:** Daily full backups + WAL archiving

### Core Entities

```
patients
hospitals
└── doctors (belongs to hospital)
    └── appointments (by patient + doctor)
        ├── care_journeys (for patient)
        │   └── care_journey_milestones
        ├── prescriptions (future)
        └── medical_records (future)
            
users (future - unified auth)
notifications
otp_codes
hospital_staff (future - non-doctor roles)
```

---

## 2. Entity Relationship Diagram (ERD)

```
┌─────────────────┐       ┌─────────────────┐
│   patients      │       │   hospitals     │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ name            │       │ name            │
│ phone (U)       │       │ address         │
│ email (U)       │       │ phone (U)       │
│ date_of_birth   │       │ email (U)       │
│ gender          │       │ admin_id        │
│ blood_group     │       │ created_at      │
│ pincode         │       │ status          │
│ created_at      │       └─────────────────┘
│ status          │              │
│ blocked         │              │ 1
└─────────────────┘              │  *
         │                       │
         │ *                     │
         │                       │
         ▼                       ▼
┌─────────────────┐       ┌─────────────────┐
│   appointments  │       │    doctors      │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ patient_id (FK) │◄──────┤ hospital_id(FK) │
│ doctor_id (FK)  │       │ name            │
│ hospital_id(FK) │       │ phone (U)       │
│ appointment_date│       │ email (U)       │
│ time_slot       │       │ specialization  │
│ status          │       │ exp             │
│ reason          │       │ fees            │
│ notes           │       │ created_at      │
│ created_at      │       │ status          │
│ updated_at      │       │ blocked         │
└─────────────────┘       └─────────────────┘
         │                        │
         │ *                      │ 1
         │                        │
         ▼                        ▼
┌─────────────────┐       ┌─────────────────┐
│ care_journeys   │       │ care_journey_   │
├─────────────────┤       │ milestones      │
│ id (PK)         │       ├─────────────────┤
│ patient_id (FK) │       │ id (PK)         │
│ hospital_id(FK) │       │ journey_id(FK)  │
│ doctor_id (FK)  │       │ title           │
│ title           │       │ description     │
│ description     │       │ due_date        │
│ start_date      │       │ status          │
│ end_date        │       │ created_at      │
│ status          │       └─────────────────┘
│ priority        │
│ created_at      │
│ updated_at      │
└─────────────────┘

```

**Legend:**
- `1` = one-to-many relationship
- `(PK)` = Primary Key
- `(FK)` = Foreign Key
- `(U)` = Unique constraint

---

## 3. Table Definitions

### 3.1 `patients`

**Purpose:** Store patient demographic and account information

```sql
CREATE TABLE patients (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(15) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  date_of_birth DATE NOT NULL,
  age INT GENERATED ALWAYS AS (EXTRACT(YEAR FROM AGE(date_of_birth))) STORED,
  password_hash VARCHAR(255) NOT NULL, -- bcrypt hash
  gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  blood_group VARCHAR(10) CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  pincode INT,
  address TEXT,
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(15),
  allergies TEXT[], -- PostgreSQL array
  existing_conditions TEXT[], -- PostgreSQL array
  profile_image_url TEXT, -- Supabase storage URL
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  blocked BOOLEAN NOT NULL DEFAULT FALSE,
  
  CONSTRAINT valid_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_patients_phone ON patients(phone);
CREATE INDEX idx_patients_email ON patients(email);
CREATE INDEX idx_patients_created_at ON patients(created_at DESC);
```

**RLS Policies:**
- Patients can read/update their own record only
- Hospital users can read patients assigned to their hospital via appointments/care_journeys
- Admins can read all patients

---

### 3.2 `hospitals`

**Purpose:** Store hospital information and credentials

```sql
CREATE TABLE hospitals (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  phone VARCHAR(15) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255), -- for hospital admin login
  admin_id BIGINT REFERENCES patients(id) ON DELETE SET NULL, -- future unified users
  license_number VARCHAR(100) UNIQUE, -- medical license
  website VARCHAR(500),
  logo_url TEXT, -- Supabase storage URL
  established_year INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'rejected')),
  blocked BOOLEAN NOT NULL DEFAULT FALSE,
  working_hours JSONB DEFAULT '{"monday":"09:00-17:00","tuesday":"09:00-17:00","wednesday":"09:00-17:00","thursday":"09:00-17:00","friday":"09:00-17:00","saturday":"09:00-13:00","sunday":"closed"}'::jsonb
);

CREATE INDEX idx_hospitals_email ON hospitals(email);
CREATE INDEX idx_hospitals_phone ON hospitals(phone);
CREATE INDEX idx_hospitals_status ON hospitals(status);
```

**RLS Policies:**
- Hospital staff can read/write their own hospital record
- Admins can read all hospitals and update status
- Public read for active hospitals only

---

### 3.3 `doctors`

**Purpose:** Store doctor profiles affiliated with hospitals

```sql
CREATE TABLE doctors (
  id BIGSERIAL PRIMARY KEY,
  hospital_id BIGINT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(15) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255), -- optional, for doctor portal
  specialization VARCHAR(100) NOT NULL,
  exp INT NOT NULL DEFAULT 0 CHECK (exp >= 0), -- years of experience
  fees INT NOT NULL DEFAULT 500 CHECK (fees >= 0), -- consultation fee in INR
  qualification TEXT,
  bio TEXT,
  profile_image_url TEXT,
  available_days TEXT[] DEFAULT '{monday,tuesday,wednesday,thursday,friday,saturday}',
  time_slots JSONB DEFAULT '[]'::jsonb, -- e.g., [{"slot":"10:00 AM","available":true},...]
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'on_leave', 'inactive')),
  blocked BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_doctors_hospital ON doctors(hospital_id);
CREATE INDEX idx_doctors_specialization ON doctors(specialization);
CREATE INDEX idx_doctors_status ON doctors(status);
CREATE INDEX idx_doctors_phone ON doctors(phone);
```

**RLS Policies:**
- Hospital staff can manage doctors in their hospital
- Public can read active doctors
- Doctor can read/update own profile (if portal exists)

---

### 3.4 `appointments`

**Purpose:** Manage patient-doctor appointment bookings

```sql
CREATE TYPE appointment_status AS ENUM (
  'pending',      -- booking submitted, awaiting confirmation
  'confirmed',    -- doctor/hospital confirmed
  'completed',    -- appointment held
  'cancelled',    -- cancelled by patient or hospital
  'no_show'       -- patient didn't show up
);

CREATE TABLE appointments (
  id BIGSERIAL PRIMARY KEY,
  patient_id BIGINT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id BIGINT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  hospital_id BIGINT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  time_slot VARCHAR(20) NOT NULL, -- e.g., "10:00 AM", "10:00-10:30"
  status appointment_status NOT NULL DEFAULT 'pending',
  reason TEXT NOT NULL, -- patient's reason for visit
  symptoms TEXT,
  notes TEXT, -- doctor's notes after appointment
  diagnosis TEXT, -- future: diagnosis
  prescription TEXT, -- future: prescription
  follow_up_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_patient_doctor_slot UNIQUE (doctor_id, appointment_date, time_slot),
  CONSTRAINT valid_appointment_time CHECK (time_slot ~ '^\d{1,2}:\d{2}\s?(AM|PM)$')
);

CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_hospital ON appointments(hospital_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_created_at ON appointments(created_at DESC);
```

**RLS Policies:**
- Patients: read/write own appointments only
- Hospital staff: read/write appointments for their hospital
- Doctors: read own appointments (future)
- Admins: read all

---

### 3.5 `care_journeys`

**Purpose:** Structured care plans for patients across conditions

```sql
CREATE TYPE journey_status AS ENUM ('planned', 'active', 'on_hold', 'completed', 'cancelled');
CREATE TYPE journey_priority AS ENUM ('low', 'medium', 'high', 'urgent');

CREATE TABLE care_journeys (
  id BIGSERIAL PRIMARY KEY,
  patient_id BIGINT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  hospital_id BIGINT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  doctor_id BIGINT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL, -- e.g., "Diabetes Management"
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  status journey_status NOT NULL DEFAULT 'active',
  priority journey_priority NOT NULL DEFAULT 'medium',
  goals TEXT[], -- PostgreSQL array of goals
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  CONSTRAINT valid_date_range CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE INDEX idx_care_journeys_patient ON care_journeys(patient_id);
CREATE INDEX idx_care_journeys_hospital ON care_journeys(hospital_id);
CREATE INDEX idx_care_journeys_doctor ON care_journeys(doctor_id);
CREATE INDEX idx_care_journeys_status ON care_journeys(status);
```

**RLS Policies:**
- Patient: read own care journeys
- Hospital staff: read/write journeys at their hospital
- Assigned doctor: read/write (future)

---

### 3.6 `care_journey_milestones`

**Purpose:** Individual checkpoints within a care journey

```sql
CREATE TYPE milestone_status AS ENUM ('pending', 'in_progress', 'completed', 'skipped');

CREATE TABLE care_journey_milestones (
  id BIGSERIAL PRIMARY KEY,
  journey_id BIGINT NOT NULL REFERENCES care_journeys(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  status milestone_status NOT NULL DEFAULT 'pending',
  order_index INT NOT NULL DEFAULT 0, -- for sorting
  completed_at TIMESTAMPTZ,
  notes TEXT, -- doctor/patient notes
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_milestones_journey ON care_journey_milestones(journey_id);
CREATE INDEX idx_milestones_status ON care_journey_milestones(status);
CREATE INDEX idx_milestones_due_date ON care_journey_milestones(due_date);
```

---

### 3.7 `notifications`

**Purpose:** In-app, SMS, email notifications for users

```sql
CREATE TYPE notification_type AS ENUM (
  'appointment_confirmed',
  'appointment_reminder',
  'appointment_cancelled',
  'care_journey_update',
  'new_message',
  'system_alert',
  'doctor_invite'
);

CREATE TYPE notification_channel AS ENUM ('in_app', 'sms', 'email', 'push');

CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,
  recipient_id BIGINT NOT NULL, -- could be patient, hospital admin, doctor
  recipient_type VARCHAR(50) NOT NULL, -- 'patient', 'hospital', 'doctor', 'admin'
  type notification_type NOT NULL,
  channel notification_channel NOT NULL DEFAULT 'in_app',
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB, -- additional context (appointment_id, etc.)
  read_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT valid_recipient CHECK (recipient_type IN ('patient', 'hospital', 'doctor', 'admin'))
);

CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, recipient_type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(recipient_id) WHERE read_at IS NULL;
```

---

### 3.8 `otp_codes`

**Purpose:** Store OTPs for phone verification

```sql
CREATE TABLE otp_codes (
  id BIGSERIAL PRIMARY KEY,
  phone VARCHAR(15) NOT NULL,
  otp_hash VARCHAR(255) NOT NULL, -- bcrypt hash of OTP
  purpose VARCHAR(50) NOT NULL, -- 'login', 'register', 'password_reset'
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  used_at TIMESTAMPTZ
);

CREATE INDEX idx_otp_codes_phone ON otp_codes(phone);
CREATE INDEX idx_otp_codes_expires ON otp_codes(expires_at);

-- Auto-cleanup: Delete expired OTPs after 10 minutes
-- (implement via cron job or database TTL)
```

**Security Note:** OTP hashed with bcrypt, not stored plaintext.

---

### 3.9 `sessions` (optional - Redis for production)

**Purpose:** Manage user sessions (Redis recommended for TTL)

```sql
-- If using DB-backed sessions (not recommended for production)
CREATE TABLE sessions (
  id VARCHAR(128) PRIMARY KEY, -- session ID
  user_id BIGINT NOT NULL,
  user_type VARCHAR(50) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_access TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_user ON sessions(user_id, user_type);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
```

**Better approach:** Use Redis with `EXPIRE` for automatic TTL cleanup.

---

### 4.0 `audit_logs` (future)

**Purpose:** Track all PHI access and modifications (compliance)

```sql
CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT,
  user_type VARCHAR(50),
  action VARCHAR(100) NOT NULL, -- 'patient.record.view', 'appointment.update'
  resource_type VARCHAR(50), -- 'patient', 'appointment'
  resource_id BIGINT,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Partition by month for performance
```

---

## 4. Indexes & Performance

### Essential Indexes per Table

| Table | Index | Purpose |
|-------|-------|---------|
| `patients` | `phone` | Login lookup |
| `patients` | `email` | Email-based lookup |
| `hospitals` | `status` | Filter active/pending |
| `doctors` | `(hospital_id, specialization)` | Find doctors by specialty in hospital |
| `doctors` | `(specialization, fees)` | Search + sort |
| `appointments` | `(doctor_id, appointment_date)` | Doctor's daily schedule lookup |
| `appointments` | `(patient_id, appointment_date DESC)` | Patient history |
| `appointments` | `(hospital_id, appointment_date)` | Hospital daily view |
| `care_journeys` | `(patient_id, status)` | Active journeys per patient |
| `notifications` | `(recipient_id, read_at)` | Unread notifications |

### Partial Indexes (Optional, for query optimization)

```sql
-- Only active patients queried frequently
CREATE INDEX idx_patients_active ON patients(id) WHERE status = 'active';

-- Only upcoming appointments
CREATE INDEX idx_appointments_upcoming ON appointments(doctor_id, appointment_date) 
WHERE status IN ('pending', 'confirmed') AND appointment_date >= CURRENT_DATE;

-- Unread notifications only
CREATE INDEX idx_notifications_unread ON notifications(recipient_id) 
WHERE read_at IS NULL;
```

---

## 5. Row-Level Security (RLS)

### Why RLS?
- Multi-tenant data isolation without application-layer checks
- Defense in depth - even if app logic bypassed, DB enforces access
- Compliant with healthcare data segregation requirements

### RLS Policies

#### `patients` Table
```sql
-- Patients can access own record
CREATE POLICY patients_own ON patients 
  FOR ALL USING (auth.uid() = id AND auth.role() = 'patient');

-- Hospital staff can READ patients with appointments at their hospital
CREATE POLICY patients_hospital_read ON patients 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM appointments 
      WHERE appointments.patient_id = patients.id 
        AND appointments.hospital_id = auth.hospital_id()
    )
  );

-- Admins full access
CREATE POLICY patients_admin_all ON patients 
  FOR ALL USING (auth.role() = 'admin');
```

#### `appointments` Table
```sql
-- Patient: own appointments only
CREATE POLICY appointments_patient_own ON appointments 
  FOR ALL USING (patient_id = auth.uid());

-- Hospital staff: appointments at their hospital
CREATE POLICY appointments_hospital_read ON appointments 
  FOR SELECT USING (hospital_id = auth.hospital_id());

-- Hospital staff: can INSERT/UPDATE appointments for their hospital
CREATE POLICY appointments_hospital_write ON appointments 
  FOR ALL USING (hospital_id = auth.hospital_id());

-- Doctors: read own appointments only
CREATE POLICY appointments_doctor_read ON appointments 
  FOR SELECT USING (doctor_id = auth.uid());
```

#### `doctors` Table
```sql
-- Public read for active doctors
CREATE POLICY doctors_public_read ON doctors 
  FOR SELECT USING (status = 'active');

-- Hospital staff: manage doctors at their hospital
CREATE POLICY doctors_hospital_manage ON doctors 
  FOR ALL USING (hospital_id = auth.hospital_id());
```

**Note:** `auth.uid()`, `auth.role()`, `auth.hospital_id()` are Supabase session functions mapping JWT claims.

---

## 6. Migrations Strategy

### Using Prisma Migrate

```bash
# Create new migration
npx prisma migrate dev --name add_care_journeys

# Apply to staging/production
npx prisma migrate deploy

# Reset local DB (dev only)
npx prisma migrate reset
```

### Migration Files Location
```
prisma/
├── schema.prisma       # Source of truth
├── migrations/         # Auto-generated migration folders
│   ├── 20250512000000_init/
│   ├── 20250513000000_add_care_journeys/
│   └── ...
└── seed.ts             # Development seed data
```

### Seeding Development Database

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create sample hospital
  const hospital = await prisma.hospitals.create({
    data: {
      name: 'Apollo Hospitals',
      address: '21, Greams Road, Thousand Lights',
      phone: '044-2829-0200',
      email: 'contact@apollo.com',
      status: 'active',
    },
  });

  // Create sample doctors
  await prisma.doctors.createMany({
    data: [
      {
        hospital_id: hospital.id,
        name: 'Dr. Rajesh Kumar',
        phone: '9876543210',
        email: 'rajesh@apollo.com',
        specialization: 'Cardiology',
        exp: 15,
        fees: 1500,
      },
      // ... more doctors
    ],
  });

  // Create sample patient
  await prisma.patients.create({
    data: {
      name: 'Test Patient',
      phone: '9999999999',
      email: 'patient@test.com',
      date_of_birth: new Date('1990-01-01'),
      gender: 'male',
      blood_group: 'O+',
      pincode: 600001,
      password_hash: '$2b$12$...',
    },
  });

  console.log('Seeded successfully');
}

main();
```

Run with:
```bash
npx prisma db seed
```

---

## 7. Sample Data & Seeds

### Seed Categories
1. **Hospitals** (5-10 diverse examples)
2. **Specialties** (Cardiology, Dermatology, Orthopedics, Neurology, General Medicine, Pediatrics)
3. **Doctors** (3-5 per hospital, varied experience)
4. **Patients** (20-50 realistic profiles)
5. **Appointments** (past 30 days + upcoming 30 days)
6. **Care Journeys** (10-20 examples)

### Seed Data Sources
- Use `@faker-js/faker` for realistic Indian names/addresses
- Use unsplash source for placeholder images
- Create realistic date ranges (not all today's date)

### Example: Faker-based seeding
```typescript
import { fakerIN } from '@faker-js/faker';

const patientName = fakerIN.person.fullName();
const phone = fakerIN.phone.number();
const pincode = fakerIN.location.zipCode();
const dateOfBirth = fakerIN.date.birthdate({ min: 18, max: 80 });
```

---

## 8. Database Health Checks

### Essential Queries

**Count active entities:**
```sql
SELECT 
  (SELECT COUNT(*) FROM patients WHERE status = 'active') as active_patients,
  (SELECT COUNT(*) FROM hospitals WHERE status = 'active') as active_hospitals,
  (SELECT COUNT(*) FROM doctors WHERE status = 'active') as active_doctors,
  (SELECT COUNT(*) FROM appointments 
   WHERE appointment_date = CURRENT_DATE 
     AND status IN ('pending', 'confirmed')) as today_appointments;
```

**Find orphaned records:**
```sql
SELECT * FROM appointments a
LEFT JOIN patients p ON a.patient_id = p.id
WHERE p.id IS NULL;
```

**Check upcoming appointments:**
```sql
SELECT p.name, d.name as doctor, a.appointment_date, a.time_slot, a.status
FROM appointments a
JOIN patients p ON a.patient_id = p.id
JOIN doctors d ON a.doctor_id = d.id
WHERE a.appointment_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
ORDER BY a.appointment_date, a.time_slot;
```

---

## 9. Backup & Recovery

### Daily Backups
- Supabase automatic daily backups
- Retained for 30 days
- Point-in-time recovery available

### Manual Export (for critical data)
```bash
# Export specific tables
npx supabase db dump --onlypatients,appointments --file backup.sql

# Or via Prisma
npx prisma db push --accept-data-loss  # NOT for production!
```

### Recovery Procedure
1. Access Supabase dashboard
2. Navigate to Database → Restore
3. Select backup point-in-time
4. Confirm restore (downtime expected ~5-10 min)

---

## 10. Future Schema Changes

### Planned Tables (Phase 2)
- `prescriptions` - Medication prescriptions linked to appointments
- ` medical_records` - Comprehensive medical history
- `lab_tests` - Lab test orders and results
- `insurance_claims` - Insurance integration
- `messages` - In-app messaging system
- `reviews_ratings` - Patient feedback on doctors
- `abha_links` - ABDM integration records
- `consents` - Patient consent records
- `inventory` - Hospital inventory (future)
- `billing_invoices` - Invoicing system (future)

---

**Document Version**: 1.0  
**Last Updated**: 2026-05-12  
**Owner**: Haspataal Database & Backend Team  
**Files:** `prisma/schema.prisma`, `migrations/`, `scripts/seed.ts`
