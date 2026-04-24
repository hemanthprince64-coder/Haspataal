-- ================================================================
-- 08_ADD_HOSPITAL_PATIENT_TO_EVENT_LOGS.SQL
-- Fix missing columns required by Prisma EventLog model
-- ================================================================

-- Add hospital_id and patient_id columns (nullable, TEXT to store UUID strings)
ALTER TABLE event_logs
    ADD COLUMN IF NOT EXISTS hospital_id TEXT,
    ADD COLUMN IF NOT EXISTS patient_id TEXT;

-- Create index for common query patterns (matches Prisma @@index)
CREATE INDEX IF NOT EXISTS idx_event_logs_hospital_event_created
    ON event_logs (hospital_id, event_type, created_at DESC);

-- Optional: Add foreign key constraints (commented out to avoid dependency on existing data)
-- ALTER TABLE event_logs
--     ADD CONSTRAINT fk_event_logs_hospital
--         FOREIGN KEY (hospital_id) REFERENCES hospitals_master(id) ON DELETE SET NULL,
--     ADD CONSTRAINT fk_event_logs_patient
--         FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL;
