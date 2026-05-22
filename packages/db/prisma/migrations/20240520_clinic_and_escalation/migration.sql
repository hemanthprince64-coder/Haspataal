-- 20240520_clinic_and_escalation.sql
-- Clinic Acquisition & HMS Growth Strategy + Escalation Alert Engine
-- Merged: clinic_tier + retention_followup_escalation

-- ==========================================================================
-- SECTION 1: NEW ENUMS (idempotent via DO blocks)
-- ==========================================================================

DO $$ BEGIN
    CREATE TYPE "FacilityType" AS ENUM ('HOSPITAL', 'CLINIC');
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Type "FacilityType" already exists, skipping.';
END $$;

DO $$ BEGIN
    CREATE TYPE "ClinicTier" AS ENUM ('SINGLE_DOCTOR', 'MULTI_SPECIALITY');
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Type "ClinicTier" already exists, skipping.';
END $$;

DO $$ BEGIN
    CREATE TYPE "PatientAcquisitionSource" AS ENUM (
        'DIRECT', 'SEO', 'WHATSAPP', 'REFERRAL_DOCTOR', 'REFERRAL_CLINIC',
        'REFERRAL_HOSPITAL', 'AGENT', 'SOCIAL_MEDIA', 'WALK_IN', 'OTHER'
    );
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Type "PatientAcquisitionSource" already exists, skipping.';
END $$;

DO $$ BEGIN
    CREATE TYPE "AIDocumentType" AS ENUM (
        'OPD_NOTE', 'DISCHARGE_SUMMARY', 'PRESCRIPTION_DRAFT',
        'FOLLOW_UP_SUMMARY', 'CLINICAL_SUMMARY'
    );
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Type "AIDocumentType" already exists, skipping.';
END $$;

DO $$ BEGIN
    CREATE TYPE "ReferralType" AS ENUM (
        'INTERNAL', 'EXTERNAL_HOSPITAL', 'EXTERNAL_CLINIC',
        'LAB', 'PHARMACY', 'AGENT'
    );
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Type "ReferralType" already exists, skipping.';
END $$;

-- ==========================================================================
-- SECTION 2: HOSPITALSMASTER — NEW SCALAR COLUMNS
-- ==========================================================================
ALTER TABLE "hospitals_master"
  ADD COLUMN IF NOT EXISTS "facility_type"    "FacilityType"    NOT NULL DEFAULT 'HOSPITAL',
  ADD COLUMN IF NOT EXISTS "gst_exempt"       BOOLEAN            NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "clinic_tier"      "ClinicTier",
  ADD COLUMN IF NOT EXISTS "operating_hours"  JSONB;  -- {"open":"09:00","close":"21:00"}

-- ==========================================================================
-- SECTION 3: CLINICPROFILE  (1:1 extension of HospitalsMaster)
-- ==========================================================================
CREATE TABLE IF NOT EXISTS "clinic_profiles" (
  "id"               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  "hospital_id"      UUID         NOT NULL UNIQUE,
  "tier"             "ClinicTier" NOT NULL,
  "doctor_in_charge" TEXT,
  "specialization"   TEXT,
  "num_doctors"      INTEGER,
  "has_pharmacy"     BOOLEAN      NOT NULL DEFAULT false,
  "has_own_lab"      BOOLEAN      NOT NULL DEFAULT false,
  "avg_daily_patients" INTEGER,
  "clinic_mode"      BOOLEAN      NOT NULL DEFAULT true,
  "allowed_features" TEXT[]       NOT NULL DEFAULT '{}',
  "created_at"       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  "updated_at"       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "clinic_profiles_hospital_id_idx"
  ON "clinic_profiles"("hospital_id");

-- ==========================================================================
-- SECTION 4: PATIENTACQUISITION  (referral & source tracking)
-- ==========================================================================
CREATE TABLE IF NOT EXISTS "patient_acquisitions" (
  "id"              UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  "hospital_id"     UUID              NOT NULL,
  "patient_id"      UUID              NOT NULL,
  "source"          "PatientAcquisitionSource" NOT NULL,
  "referrer_id"     UUID,
  "referrer_type"   TEXT,             -- DOCTOR | CLINIC | HOSPITAL | AGENT
  "specialty"       TEXT,
  "booked_appt_id"  UUID,
  "converted"       BOOLEAN           NOT NULL DEFAULT false,
  "revenue_at_cents" DECIMAL(12, 2),
  "created_at"      TIMESTAMPTZ       NOT NULL DEFAULT now(),
  FOREIGN KEY ("hospital_id")  REFERENCES "hospitals_master"("id") ON DELETE CASCADE,
  FOREIGN KEY ("patient_id")   REFERENCES "patients"("id")         ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "patient_acquisitions_hospital_id_idx"
  ON "patient_acquisitions"("hospital_id");
CREATE INDEX IF NOT EXISTS "patient_acquisitions_patient_id_idx"
  ON "patient_acquisitions"("patient_id");
CREATE INDEX IF NOT EXISTS "patient_acquisitions_source_idx"
  ON "patient_acquisitions"("source");

-- ==========================================================================
-- SECTION 5: AIDOCUMENT  (AI-assisted clinical documents with doctor approval)
-- ==========================================================================
CREATE TABLE IF NOT EXISTS "ai_documents" (
  "id"               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  "hospital_id"      UUID         NOT NULL,
  "patient_id"       UUID,
  "appt_id"          UUID,
  "doc_type"         "AIDocumentType" NOT NULL,
  "input_prompt"     TEXT,        -- raw user input (audit trail)
  "generated_text"   TEXT         NOT NULL,
  "is_assisted"      BOOLEAN      NOT NULL DEFAULT true,  -- false = fully AI-generated
  "is_doctor_approved" BOOLEAN    NOT NULL DEFAULT false,
  "approved_at"      TIMESTAMPTZ,
  "created_at"       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "ai_documents_hospital_id_idx"
  ON "ai_documents"("hospital_id");
CREATE INDEX IF NOT EXISTS "ai_documents_patient_id_idx"
  ON "ai_documents"("patient_id");
CREATE INDEX IF NOT EXISTS "ai_documents_appt_id_idx"
  ON "ai_documents"("appt_id");

-- ==========================================================================
-- SECTION 6: REFERRALTRACKING  (internal cross-specialty + external referrals)
-- ==========================================================================
CREATE TABLE IF NOT EXISTS "referral_trackings" (
  "id"             UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  "hospital_id"    UUID            NOT NULL,
  "from_doctor_id" UUID,
  "to_doctor_id"   UUID,
  "from_clinic_id" UUID,
  "patient_id"     UUID,
  "referral_type"  "ReferralType"  NOT NULL,
  "specialty"      TEXT,
  "appointment_id" UUID,
  "was_converted"  BOOLEAN         NOT NULL DEFAULT false,
  "converted_at"   TIMESTAMPTZ,
  "created_at"     TIMESTAMPTZ     NOT NULL DEFAULT now(),
  FOREIGN KEY ("hospital_id")  REFERENCES "hospitals_master"("id") ON DELETE CASCADE,
  FOREIGN KEY ("patient_id")   REFERENCES "patients"("id")         ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "referral_trackings_hospital_id_idx"
  ON "referral_trackings"("hospital_id");
CREATE INDEX IF NOT EXISTS "referral_trackings_from_doctor_id_idx"
  ON "referral_trackings"("from_doctor_id");
CREATE INDEX IF NOT EXISTS "referral_trackings_to_doctor_id_idx"
  ON "referral_trackings"("to_doctor_id");

-- ==========================================================================
-- SECTION 7: ESCALATIONALERT  (retention follow-up escalation)
-- ==========================================================================
CREATE TABLE IF NOT EXISTS "escalation_alerts" (
  "id"                 UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  "hospital_id"        UUID         NOT NULL,
  "patient_id"         UUID         NOT NULL,
  "doctor_id"          UUID         NOT NULL,
  "follow_up_id"       UUID         NOT NULL,            -- FK to follow_ups
  "appointment_id"     UUID         NOT NULL,            -- FK to appointments; UNIQUE per hospital
  "missed_count"       INTEGER      NOT NULL DEFAULT 2,   -- threshold needed to escalate
  "chronic_tag"        TEXT,                             -- DIABETES | CANCER | CARDIAC
  "is_acknowledged"    BOOLEAN      NOT NULL DEFAULT false,
  "acknowledged_at"    TIMESTAMPTZ,
  "notification_sent"  BOOLEAN      NOT NULL DEFAULT false,
  "sent_via"           TEXT,                             -- WHATSAPP | SMS | PENDING
  "sent_at"            TIMESTAMPTZ,
  "created_at"         TIMESTAMPTZ  NOT NULL DEFAULT now(),
  "updated_at"         TIMESTAMPTZ  NOT NULL DEFAULT now(),
  FOREIGN KEY ("hospital_id")  REFERENCES "hospitals_master"("id") ON DELETE CASCADE,
  FOREIGN KEY ("patient_id")   REFERENCES "patients"("id")           ON DELETE CASCADE,
  FOREIGN KEY ("doctor_id")    REFERENCES "doctors_master"("id")      ON DELETE SET NULL,
  FOREIGN KEY ("follow_up_id") REFERENCES "follow_ups"("id")          ON DELETE SET NULL
);

-- Unique constraint for idempotency
DO $$ BEGIN
    ALTER TABLE "escalation_alerts"
        ADD CONSTRAINT "esc_hospital_appt_key" UNIQUE ("appointment_id", "hospital_id");
EXCEPTION WHEN duplicate_table THEN
    RAISE NOTICE 'Constraint "esc_hospital_appt_key" already exists, skipping.';
END $$;

CREATE INDEX IF NOT EXISTS "esc_hospital_id_idx"   ON "escalation_alerts"("hospital_id");
CREATE INDEX IF NOT EXISTS "esc_patient_id_idx"    ON "escalation_alerts"("patient_id");
CREATE INDEX IF NOT EXISTS "esc_doctor_id_idx"     ON "escalation_alerts"("doctor_id");
CREATE INDEX IF NOT EXISTS "esc_acknowledged_idx"  ON "escalation_alerts"("is_acknowledged");

-- ==========================================================================
-- SECTION 8: CLINICFOLLOWUPCONFIG  (per-clinic retention interval tuning)
-- ==========================================================================
CREATE TABLE IF NOT EXISTS "clinic_follow_up_configs" (
  "id"              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  "hospital_id"     UUID         NOT NULL UNIQUE,
  "default_days_3"  BOOLEAN      NOT NULL DEFAULT true,
  "default_days_7"  BOOLEAN      NOT NULL DEFAULT true,
  "default_days_14" BOOLEAN      NOT NULL DEFAULT true,
  "vaccination_reminders" BOOLEAN NOT NULL DEFAULT true,
  "chronic_reminders"     BOOLEAN NOT NULL DEFAULT true,
  "created_at"      TIMESTAMPTZ  NOT NULL DEFAULT now(),
  "updated_at"      TIMESTAMPTZ  NOT NULL DEFAULT now(),
  FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "clinic_fuc_hospital_id_idx"
  ON "clinic_follow_up_configs"("hospital_id");

-- ==========================================================================
-- SECTION 9: ENABLE RLS ON ALL NEW TABLES
-- ==========================================================================
ALTER TABLE "clinic_profiles"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "patient_acquisitions"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ai_documents"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE "referral_trackings"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "escalation_alerts"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "clinic_follow_up_configs" ENABLE ROW LEVEL SECURITY;

-- Base RLS policy — same pattern as every other Haspataal table:
-- supervisor (postgres) must run `SET LOCAL app.hospital_id = '<uuid>'`
-- before every transaction; sees only their hospital's rows
CREATE POLICY IF NOT EXISTS "hospital_scope_clinic_profiles"
  ON "clinic_profiles" FOR ALL USING (
    current_setting('app.hospital_id', true)::uuid = "hospital_id"
  );
CREATE POLICY IF NOT EXISTS "hospital_scope_patient_acquisitions"
  ON "patient_acquisitions" FOR ALL USING (
    current_setting('app.hospital_id', true)::uuid = "hospital_id"
  );
CREATE POLICY IF NOT EXISTS "hospital_scope_ai_documents"
  ON "ai_documents" FOR ALL USING (
    current_setting('app.hospital_id', true)::uuid = "hospital_id"
  );
CREATE POLICY IF NOT EXISTS "hospital_scope_referral_trackings"
  ON "referral_trackings" FOR ALL USING (
    current_setting('app.hospital_id', true)::uuid = "hospital_id"
  );
CREATE POLICY IF NOT EXISTS "hospital_scope_escalation_alerts"
  ON "escalation_alerts" FOR ALL USING (
    current_setting('app.hospital_id', true)::uuid = "hospital_id"
  );
CREATE POLICY IF NOT EXISTS "hospital_scope_clinic_follow_up_configs"
  ON "clinic_follow_up_configs" FOR ALL USING (
    current_setting('app.hospital_id', true)::uuid = "hospital_id"
  );

-- Idempotent alert insert: atomically skip if escalation already exists for this
-- (hospital_id, appointment_id) pair, preventing duplicate alerts from re-runs.
INSERT INTO "escalation_alerts"
  ("hospital_id", "patient_id", "doctor_id", "follow_up_id", "appointment_id",
   "missed_count", "chronic_tag", "is_acknowledged", "created_at", "updated_at")
SELECT
  :hospitalId,
  :patientId,
  :doctorId,
  :followUpId,
  :appointmentId,
  :missedCount,
  :chronicTag,
  false,
  now(),
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM "escalation_alerts"
  WHERE "appointment_id" = :appointmentId
    AND "hospital_id"    = :hospitalId
    AND "is_acknowledged" = false
);
