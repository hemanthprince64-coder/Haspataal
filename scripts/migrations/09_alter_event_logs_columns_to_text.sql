-- ================================================================
-- 09_ALTER_EVENT_LOG_COLUMNS_TO_TEXT.SQL
-- Ensure hospital_id and patient_id are TEXT to match Prisma String mappings
-- ================================================================

-- Convert columns to TEXT (safe even if already TEXT)
ALTER TABLE event_logs
    ALTER COLUMN hospital_id TYPE TEXT USING hospital_id::text,
    ALTER COLUMN patient_id TYPE TEXT USING patient_id::text;
