-- AlterTable
ALTER TABLE "care_journeys" ADD COLUMN     "last_processed_event_id" TEXT,
ADD COLUMN     "last_processed_occurred_at" TIMESTAMP(3),
ADD COLUMN     "projection_version" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "rebuilt_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "timeline_events" ADD COLUMN     "last_processed_event_id" TEXT,
ADD COLUMN     "last_processed_occurred_at" TIMESTAMP(3),
ADD COLUMN     "projection_version" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "rebuilt_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "journey_milestones" ADD COLUMN     "last_processed_event_id" TEXT,
ADD COLUMN     "last_processed_occurred_at" TIMESTAMP(3),
ADD COLUMN     "projection_version" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "rebuilt_at" TIMESTAMP(3);



-- CreateTable
CREATE TABLE "projection_checkpoints" (
    "projection_name" TEXT NOT NULL,
    "consumer_name" TEXT NOT NULL,
    "last_event_id" TEXT,
    "last_occurred_at" TIMESTAMP(3),
    "replay_status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "replay_started_at" TIMESTAMP(3),
    "replay_completed_at" TIMESTAMP(3),
    "projection_version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "projection_checkpoints_pkey" PRIMARY KEY ("projection_name")
);

-- CreateTable
CREATE TABLE "analytics_patient_projections" (
    "patient_id" TEXT NOT NULL,
    "total_admissions" INTEGER NOT NULL DEFAULT 0,
    "total_outpatient_visits" INTEGER NOT NULL DEFAULT 0,
    "total_lamas" INTEGER NOT NULL DEFAULT 0,
    "first_visit_date" TIMESTAMP(3),
    "last_visit_date" TIMESTAMP(3),
    "projection_version" INTEGER NOT NULL DEFAULT 1,
    "last_processed_event_id" TEXT,
    "last_processed_occurred_at" TIMESTAMP(3),
    "rebuilt_at" TIMESTAMP(3),

    CONSTRAINT "analytics_patient_projections_pkey" PRIMARY KEY ("patient_id")
);

-- CreateTable
CREATE TABLE "analytics_admission_projections" (
    "admission_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "admission_date" TIMESTAMP(3) NOT NULL,
    "clinical_discharge_date" TIMESTAMP(3),
    "physical_departure_date" TIMESTAMP(3),
    "departure_type" TEXT,
    "length_of_stay_hours" DOUBLE PRECISION,
    "projection_version" INTEGER NOT NULL DEFAULT 1,
    "last_processed_event_id" TEXT,
    "last_processed_occurred_at" TIMESTAMP(3),
    "rebuilt_at" TIMESTAMP(3),

    CONSTRAINT "analytics_admission_projections_pkey" PRIMARY KEY ("admission_id")
);

-- CreateTable
CREATE TABLE "analytics_hospital_projections" (
    "hospital_id" TEXT NOT NULL,
    "active_admissions" INTEGER NOT NULL DEFAULT 0,
    "total_admissions" INTEGER NOT NULL DEFAULT 0,
    "total_discharges" INTEGER NOT NULL DEFAULT 0,
    "average_length_of_stay" DOUBLE PRECISION,
    "projection_version" INTEGER NOT NULL DEFAULT 1,
    "last_processed_event_id" TEXT,
    "last_processed_occurred_at" TIMESTAMP(3),
    "rebuilt_at" TIMESTAMP(3),

    CONSTRAINT "analytics_hospital_projections_pkey" PRIMARY KEY ("hospital_id")
);

-- CreateIndex
CREATE INDEX "analytics_admission_projections_hospital_id_idx" ON "analytics_admission_projections"("hospital_id");

