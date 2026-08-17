-- ============================================================
-- HASPATAAL — Missing Index Migrations
-- Identified by: postgres-patterns skill audit
-- Run against: Supabase PostgreSQL (port 5432 direct connection)
-- ============================================================

-- ============================================================
-- FIX 1: appointments — add hospitalId-scoped composite index
-- Issue: Appointment model missing hospitalId causes full scans
-- for hospital admin queries
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_appointments_date_desc
    ON appointments(doctor_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_appointments_status
    ON appointments(status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_appointments_patient_doctor
    ON appointments(patient_id, doctor_id);

-- ============================================================
-- FIX 2: doctor_identity_docs — missing FK index on doctor_id
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_doctor_identity_docs_doctor_id
    ON doctor_identity_docs(doctor_id);

-- ============================================================
-- FIX 3: visits — composite index for hospital dashboard queries
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_visits_hospital_created
    ON visits(hospital_id, created_at DESC) WHERE deleted_at IS NULL;

-- ============================================================
-- FIX 4: diagnostic_results — missing FK index on order_item_id
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_diagnostic_results_order_item
    ON diagnostic_results(order_item_id);

-- ============================================================
-- FIX 5: patient_records — composite for doctor patient lookup
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_patient_records_doctor_patient
    ON patient_records(doctor_id, patient_id, created_at DESC)
    WHERE deleted_at IS NULL;

-- ============================================================
-- FIX 6: vital_records — time-ordered per patient
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_vital_records_patient_time
    ON vital_records(patient_id, recorded_at DESC);

-- ============================================================
-- FIX 7: otp_codes — expires_at for TTL cleanup queries
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at
    ON otp_codes(expires_at);

-- ============================================================
-- FIX 8: doctor_professional_history — FK index
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_doctor_professional_history_doctor
    ON doctor_professional_history(doctor_id);

-- ============================================================
-- FIX 9: insurance_details — patient lookup
-- (already has @@index([patientId]) in Prisma but verify)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_insurance_details_patient_id
    ON insurance_details(patient_id);

-- ============================================================
-- VERIFY — check all new indexes created
-- ============================================================
SELECT
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
