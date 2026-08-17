-- ================================================================
-- 04_INIT_CONSENT_AND_AUDIT_READ.SQL
-- Implement Healthcare Compliance (Consent & Advanced Auditing)
-- ================================================================

-- 1. Patient Consent Tracking
CREATE TABLE IF NOT EXISTS patient_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients_global(id) ON DELETE CASCADE,
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    consent_type VARCHAR(100) NOT NULL, -- e.g., 'DATA_SHARING', 'SMS_NOTIFICATION'
    granted BOOLEAN NOT NULL DEFAULT FALSE,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(patient_id, hospital_id, consent_type)
);

-- 2. Enhanced Audit Log for READ access
-- Existing audit_logs table is modified or extended
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'ip_address') THEN
        ALTER TABLE audit_logs ADD COLUMN ip_address VARCHAR(45);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'action_type') THEN
        ALTER TABLE audit_logs ADD COLUMN action_type VARCHAR(20); -- READ, WRITE, DELETE
    END IF;
END $$;

-- 3. Trigger or Application logic should ensure that any query to 
-- sensitive tables (prescriptions, reports, patient_global) inserts into audit_logs
