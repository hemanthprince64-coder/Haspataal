-- ================================================================
-- 08_INIT_WAITLIST_AND_COMPLIANCE.SQL
-- Waitlist Engine, Hospital Policies, and Advanced RLS
-- ================================================================

-- 1. Waitlist System (Level 6: Real Hospital Behavior)
CREATE TABLE IF NOT EXISTS waitlist_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
    patient_global_id UUID REFERENCES patients_global(id) ON DELETE CASCADE,
    preferred_start_time TIMESTAMP,
    preferred_end_time TIMESTAMP,
    priority INTEGER DEFAULT 1, -- 1: Normal, 2: High, 3: Emergency
    status VARCHAR(50) DEFAULT 'waiting', -- waiting, notified, booked, expired
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Hospital Operation Policies (Gap 3 & 8 Fix)
CREATE TABLE IF NOT EXISTS hospital_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    no_show_auto_release BOOLEAN DEFAULT FALSE,
    grace_period_minutes INTEGER DEFAULT 15,
    allow_walk_ins BOOLEAN DEFAULT TRUE,
    max_overbooking_percent DECIMAL(5, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(hospital_id)
);

-- 3. Strict RLS Policy Enforcement (Gap 6 Fix)
-- Example script to enable RLS on sensitive tables
ALTER TABLE patients_global ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Policy: Only allow access if hospital_id matches session
-- Note: This requires 'SET app.current_hospital_id = ...' in every connection
-- CREATE POLICY hospital_isolation_policy ON appointments
-- FOR ALL USING (hospital_id = (current_setting('app.current_hospital_id')::uuid));
