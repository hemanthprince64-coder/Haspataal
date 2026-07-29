-- CreateEnum
CREATE TYPE "SpecimenType" AS ENUM ('BLOOD', 'SERUM', 'PLASMA', 'URINE', 'STOOL', 'CSF', 'SPUTUM', 'SWAB', 'TISSUE', 'OTHER');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'PATHOLOGIST';

-- AlterTable
ALTER TABLE "laboratory_result_versions" ADD COLUMN     "comments" JSONB,
ADD COLUMN     "flags" JSONB,
ADD COLUMN     "instrument_flags" JSONB,
ADD COLUMN     "verification_notes" JSONB;

-- AlterTable
ALTER TABLE "specimens" DROP COLUMN "specimen_type",
ADD COLUMN     "specimen_type" "SpecimenType" NOT NULL;

-- CreateTable
CREATE TABLE "analyzer_devices" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "model" TEXT,
    "vendor" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "analyzer_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "critical_value_rules" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "test_code" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "threshold" DOUBLE PRECISION,
    "upper_threshold" DOUBLE PRECISION,
    "severity" TEXT NOT NULL,

    CONSTRAINT "critical_value_rules_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "analyzer_queues" ADD CONSTRAINT "analyzer_queues_analyzer_id_fkey" FOREIGN KEY ("analyzer_id") REFERENCES "analyzer_devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

