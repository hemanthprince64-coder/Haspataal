CREATE TYPE "BreakGlassStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'REVOKED');
CREATE TYPE "ReviewState" AS ENUM ('PENDING', 'REVIEWED', 'FLAGGED');

CREATE TABLE "break_glass_activations" (
    "id" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "episode_id" TEXT,
    "reason" TEXT NOT NULL,
    "activated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "status" "BreakGlassStatus" NOT NULL DEFAULT 'ACTIVE',
    "review_state" "ReviewState" NOT NULL DEFAULT 'PENDING',
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "break_glass_activations_pkey" PRIMARY KEY ("id")
);

CREATE TYPE "CareDepartureStatus" AS ENUM (
  'NONE',
  'DISCHARGE_CLINICALLY_DECIDED',
  'LAMA_INITIATED',
  'ABSCONDING_SUSPECTED',
  'PATIENT_PHYSICALLY_LEFT_STANDARD',
  'PATIENT_PHYSICALLY_LEFT_LAMA',
  'PATIENT_PHYSICALLY_LEFT_WITHOUT_NOTICE'
);

ALTER TABLE "doctor_patient_relationships" ADD COLUMN "departure_status" "CareDepartureStatus" NOT NULL DEFAULT 'NONE';
ALTER TABLE "care_responsibilities" ADD COLUMN "departure_status" "CareDepartureStatus" NOT NULL DEFAULT 'NONE';

