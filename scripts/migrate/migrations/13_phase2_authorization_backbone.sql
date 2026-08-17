-- CreateEnum
CREATE TYPE "RelationshipLevel" AS ENUM ('LONGITUDINAL', 'EPISODIC', 'CONSULTATION');

-- CreateEnum
CREATE TYPE "RelationshipStatus" AS ENUM ('PRE_VISIT', 'ACTIVE', 'POST_CARE_FOLLOWUP', 'ENDED');

-- CreateEnum
CREATE TYPE "RelationshipTrigger" AS ENUM ('APPOINTMENT_BOOKED', 'CHECK_IN', 'ADMISSION', 'REFERRAL_ACCEPTED', 'BREAK_GLASS');

-- CreateEnum
CREATE TYPE "TerminationReason" AS ENUM ('DISCHARGE_COMPLETED', 'LAMA_COMPLETED', 'TRANSFER_ACCEPTED', 'EXPLICIT_REVOCATION', 'EXPIRED');

-- CreateEnum
CREATE TYPE "CarePurpose" AS ENUM ('TRIAGE', 'PRIMARY_TREATMENT', 'SECONDARY_CONSULT', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "CareTeamRole" AS ENUM ('PRIMARY', 'CO_TREATING', 'CONSULTING', 'NURSE', 'RESIDENT');

-- CreateEnum
CREATE TYPE "ResponsibilityStatus" AS ENUM ('ACTIVE', 'TRANSFERRED', 'ENDED');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('INITIATED', 'ACCEPTED', 'REJECTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "doctor_patient_relationships" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "hospital_id" TEXT,
    "episode_id" TEXT,
    "originating_event_id" TEXT,
    "level" "RelationshipLevel" NOT NULL DEFAULT 'EPISODIC',
    "status" "RelationshipStatus" NOT NULL DEFAULT 'ACTIVE',
    "carePurpose" "CarePurpose" NOT NULL,
    "sourceTrigger" "RelationshipTrigger" NOT NULL,
    "activated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),
    "ended_by" TEXT,
    "termination_reason" "TerminationReason",
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "doctor_patient_relationships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_responsibilities" (
    "id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "episode_id" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL,
    "status" "ResponsibilityStatus" NOT NULL DEFAULT 'ACTIVE',
    "activated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),
    "termination_reason" TEXT,

    CONSTRAINT "care_responsibilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfer_of_cares" (
    "id" TEXT NOT NULL,
    "initiating_doctor_id" TEXT NOT NULL,
    "receiving_doctor_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "episode_id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "status" "TransferStatus" NOT NULL DEFAULT 'INITIATED',
    "initiated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepted_at" TIMESTAMP(3),
    "rejected_at" TIMESTAMP(3),
    "reason" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "transfer_of_cares_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "doctor_patient_relationships_patient_id_doctor_id_status_idx" ON "doctor_patient_relationships"("patient_id", "doctor_id", "status");

-- CreateIndex
CREATE INDEX "doctor_patient_relationships_episode_id_idx" ON "doctor_patient_relationships"("episode_id");

-- Partial Unique Index to prevent duplicate active relationships for the same episode
CREATE UNIQUE INDEX "unique_active_relationship" ON "doctor_patient_relationships"("patient_id", "doctor_id", "episode_id") WHERE "status" = 'ACTIVE';

-- CreateIndex
CREATE INDEX "care_responsibilities_patient_id_episode_id_idx" ON "care_responsibilities"("patient_id", "episode_id");

-- Partial Unique Index to prevent two active primary responsibilities for the same episode
CREATE UNIQUE INDEX "unique_active_primary_care" ON "care_responsibilities"("patient_id", "episode_id") WHERE "is_primary" = true AND "status" = 'ACTIVE';
