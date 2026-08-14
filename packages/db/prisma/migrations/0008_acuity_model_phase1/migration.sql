-- Phase 1 Acuity Model Migration (Non-Destructive)

-- Create ENUM types
CREATE TYPE "AdmissionStatus" AS ENUM ('REGISTERED', 'ADMITTED', 'TRANSFERRED', 'DISCHARGED');
CREATE TYPE "PatientAcuity" AS ENUM ('STABLE', 'OBSERVATION', 'HIGH_RISK', 'CRITICAL', 'RECOVERING');

-- Add new columns with defaults
ALTER TABLE "admissions" ADD COLUMN "acuity" "PatientAcuity" NOT NULL DEFAULT 'STABLE';
ALTER TABLE "admissions" ADD COLUMN "acuity_updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- Migrate status from String to Enum gracefully
ALTER TABLE "admissions" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "admissions" ALTER COLUMN "status" TYPE "AdmissionStatus" USING "status"::"AdmissionStatus";
ALTER TABLE "admissions" ALTER COLUMN "status" SET DEFAULT 'ADMITTED';

-- Backfill acuity based on existing clinical_status
UPDATE "admissions"
SET "acuity" = 'RECOVERING'
WHERE "clinical_status"::text = 'DISCHARGE_CLINICALLY_DECIDED';
