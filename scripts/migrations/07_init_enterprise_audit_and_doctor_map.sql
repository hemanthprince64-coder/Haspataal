-- ================================================================
-- 07_INIT_ENTERPRISE_AUDIT_AND_DOCTOR_MAP.SQL
-- Permanent Logs, Multi-Hospital Mapping, and Detailed Auditing
-- ================================================================

-- 1. Permanent Event Logs (For Regulatory Compliance)
CREATE TABLE IF NOT EXISTS event_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    executed_by UUID, -- user_id if applicable
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Multi-Hospital Doctor Mapping (Gap 8 Fix)
CREATE TABLE IF NOT EXISTS doctor_hospital_map (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(doctor_id, hospital_id)
);

-- 3. Upgrade Audit Logs with Old/New values (Gap 9 Fix)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'old_value') THEN
        ALTER TABLE audit_logs ADD COLUMN old_value JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'new_value') THEN
        ALTER TABLE audit_logs ADD COLUMN new_value JSONB;
    END IF;
END $$;
