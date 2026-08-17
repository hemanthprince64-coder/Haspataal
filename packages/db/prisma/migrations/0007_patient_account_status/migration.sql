-- Phase 7: Add account_status to patients table
-- Generated: 2026-07-27
-- Resolves: P1 finding #8 - No account status check in patient OTP

ALTER TABLE patients ADD COLUMN IF NOT EXISTS account_status VARCHAR(255) DEFAULT 'ACTIVE';

CREATE INDEX IF NOT EXISTS idx_patients_account_status ON patients (account_status);
