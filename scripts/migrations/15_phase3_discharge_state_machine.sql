-- CreateEnum
CREATE TYPE "ClinicalStatus" AS ENUM ('ADMITTED', 'DISCHARGE_CLINICALLY_DECIDED');

-- CreateEnum
CREATE TYPE "DischargeProcessStatus" AS ENUM ('NOT_INITIATED', 'CLEARANCES_PENDING', 'READY_FOR_DEPARTURE');

-- CreateEnum
CREATE TYPE "PhysicalPresenceStatus" AS ENUM ('PRESENT', 'ABSENCE_SUSPECTED', 'DEPARTED_STANDARD', 'DEPARTED_LAMA', 'DEPARTED_WITHOUT_NOTICE');

-- CreateEnum
CREATE TYPE "LegacyDepartureClassification" AS ENUM ('NONE', 'LEGACY_DISCHARGED_WITHOUT_AUTHORITATIVE_DEPARTURE_EVIDENCE');

-- CreateEnum
CREATE TYPE "DeparturePathway" AS ENUM ('STANDARD', 'LAMA', 'WITHOUT_NOTICE', 'LEGACY_UNCLEAR');

-- CreateEnum
CREATE TYPE "EvidenceType" AS ENUM ('MANUAL_ENTRY', 'SYSTEM_OVERRIDE', 'SECURITY_GATE', 'LEGACY_BACKFILL');

-- CreateEnum
CREATE TYPE "LamaStatus" AS ENUM ('INITIATED', 'DOCUMENTATION_IN_PROGRESS', 'DOCUMENTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "AbsenceStatus" AS ENUM ('SUSPECTED', 'INVESTIGATION_IN_PROGRESS', 'RESOLVED_RETURNED', 'CONFIRMED_DEPARTED');

-- AlterTable
ALTER TABLE "admissions" ADD COLUMN     "clinical_status" "ClinicalStatus",
ADD COLUMN     "discharge_process_status" "DischargeProcessStatus",
ADD COLUMN     "legacy_departure_classification" "LegacyDepartureClassification",
ADD COLUMN     "physical_presence_status" "PhysicalPresenceStatus";

-- CreateTable
CREATE TABLE "lama_episodes" (
    "id" TEXT NOT NULL,
    "admission_id" TEXT NOT NULL,
    "status" "LamaStatus" NOT NULL,
    "initiated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "initiated_by" TEXT NOT NULL,
    "documented_at" TIMESTAMP(3),
    "withdrawn_at" TIMESTAMP(3),

    CONSTRAINT "lama_episodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "absence_episodes" (
    "id" TEXT NOT NULL,
    "admission_id" TEXT NOT NULL,
    "status" "AbsenceStatus" NOT NULL,
    "suspected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "absence_episodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "physical_departure_records" (
    "id" TEXT NOT NULL,
    "admission_id" TEXT NOT NULL,
    "pathway" "DeparturePathway" NOT NULL,
    "confirmed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmed_by_actor_id" TEXT NOT NULL,
    "confirmer_role" TEXT NOT NULL,
    "evidenceType" "EvidenceType" NOT NULL,
    "source_workflow" TEXT NOT NULL,
    "correlation_id" TEXT NOT NULL,

    CONSTRAINT "physical_departure_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "physical_departure_records_admission_id_key" ON "physical_departure_records"("admission_id");

-- CreateIndex
CREATE INDEX "physical_departure_records_pathway_idx" ON "physical_departure_records"("pathway");

-- AddForeignKey
ALTER TABLE "lama_episodes" ADD CONSTRAINT "lama_episodes_admission_id_fkey" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absence_episodes" ADD CONSTRAINT "absence_episodes_admission_id_fkey" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "physical_departure_records" ADD CONSTRAINT "physical_departure_records_admission_id_fkey" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

