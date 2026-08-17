-- ================================================================
-- 02_INIT_TWO_LAYER_MODEL.SQL
-- Implement Platform vs Hospital layer data separation
-- ================================================================

-- 1. Global Platform Layer: Patients Global
CREATE TABLE IF NOT EXISTS patients_global (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mobile VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    gender VARCHAR(20),
    city VARCHAR(100),
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Platform Layer: Hospitals
CREATE TABLE IF NOT EXISTS hospitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Hospital Layer: Doctors
CREATE TABLE IF NOT EXISTS doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    speciality VARCHAR(100) NOT NULL,
    fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Mapping: Patient-Hospital Relationship (Local Context)
CREATE TABLE IF NOT EXISTS hospital_patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    patient_global_id UUID REFERENCES patients_global(id) ON DELETE CASCADE,
    local_patient_id VARCHAR(100), -- Internal Hospital PRN/MRN
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(hospital_id, patient_global_id)
);

-- 5. Transactions: Appointments (Cross-Layer)
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
    patient_global_id UUID REFERENCES patients_global(id) ON DELETE CASCADE,
    slot_time TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'booked', -- booked, cancelled, completed, no-show
    reason_for_visit TEXT,
    idempotency_key TEXT UNIQUE, -- Prevents duplicate bookings on retries
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(doctor_id, slot_time) -- DB-level truth: One doctor, one slot
);

-- 6. Transactions: Billing
CREATE TABLE IF NOT EXISTS bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    patient_global_id UUID REFERENCES patients_global(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, paid, partially_paid
    visit_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Governance: Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- Who performed the action
    action VARCHAR(255) NOT NULL, -- e.g., 'READ_PATIENT_RECORD', 'EDIT_BILL'
    entity VARCHAR(100) NOT NULL, -- e.g., 'patients_global', 'bills'
    entity_id UUID, -- ID of the record being acted upon
    changes JSONB, -- Previous and new values if applicable
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES for Performance
CREATE INDEX IF NOT EXISTS idx_appointments_slot ON appointments(slot_time);
CREATE INDEX IF NOT EXISTS idx_appointments_hosp_pt ON appointments(hospital_id, patient_global_id);
CREATE INDEX IF NOT EXISTS idx_bills_patient ON bills(patient_global_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
