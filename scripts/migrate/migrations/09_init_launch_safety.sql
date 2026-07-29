-- ================================================================
-- 09_INIT_LAUNCH_SAFETY.SQL
-- Consent Versioning, Override Logs, and Final Hardening
-- ================================================================

-- 1. Consent Versioning (Legal Gap 3 Fix)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patient_consents' AND column_name = 'version') THEN
        ALTER TABLE patient_consents ADD COLUMN version INTEGER DEFAULT 1;
    END IF;
    
    -- Change PRIMARY KEY to include version if tracking history
    -- ALTER TABLE patient_consents DROP CONSTRAINT patient_consents_pkey;
    -- ALTER TABLE patient_consents ADD PRIMARY KEY (id, version);
END $$;

-- 2. Manual Override Logging (Medical Gap 7 Fix)
CREATE TABLE IF NOT EXISTS override_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    executor_id UUID REFERENCES users(id),
    action_type VARCHAR(100) NOT NULL, -- e.g., 'EMERGENCY_FORCE_BOOK'
    target_entity VARCHAR(100),
    target_id UUID,
    reason TEXT NOT NULL,
    approved_by UUID REFERENCES users(id),
    old_state JSONB,
    new_state JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Waitlist Anti-Gaming (Safety Gap 2 Fix)
-- Ensure one patient can only be on the waitlist for the same doctor once
CREATE UNIQUE INDEX IF NOT EXISTS idx_waitlist_dedup 
ON waitlist_entries(patient_global_id, doctor_id) 
WHERE status = 'waiting';

-- Add identity verification requirement metadata
ALTER TABLE waitlist_entries ADD COLUMN identity_hash TEXT;
