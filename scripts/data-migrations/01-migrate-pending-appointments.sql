-- =========================================================================
-- HASPATAAL DATA MIGRATION
-- Migration: 01-migrate-pending-appointments
-- Description: Migrates legacy 'PENDING' appointments to 'BOOKED' 
-- following the removal of BookingStatus.PENDING from the schema.
-- =========================================================================

BEGIN;

-- 1. Identify affected rows (for audit logging if needed)
-- SELECT id, patient_id, doctor_id, date, status FROM appointments WHERE status = 'PENDING';

-- 2. Execute migration
UPDATE appointments 
SET 
  status = 'BOOKED',
  updated_at = NOW()
WHERE status = 'PENDING';

-- 3. Output results
-- DO $$
-- BEGIN
--   RAISE NOTICE 'Migration completed successfully.';
-- END $$;

COMMIT;
