-- CreateEnum
CREATE TYPE "LaboratoryExecutionStatus" AS ENUM ('PENDING_COLLECTION', 'COLLECTION_IN_PROGRESS', 'COLLECTED', 'RECEIVED', 'IN_ANALYZER_QUEUE', 'ANALYZING', 'RESULT_ENTERED', 'RESULT_VERIFIED', 'RELEASED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SpecimenStatus" AS ENUM ('EXPECTED', 'COLLECTED', 'RECEIVED', 'REJECTED', 'LOST', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ResultStatus" AS ENUM ('DRAFT', 'VERIFIED', 'RELEASED', 'AMENDED');

-- CreateEnum
CREATE TYPE "SpecimenRejectionReason" AS ENUM ('HEMOLYZED', 'CLOTTED', 'INSUFFICIENT', 'WRONG_CONTAINER', 'LABEL_MISMATCH', 'EXPIRED', 'OTHER');

-- CreateTable
CREATE TABLE "laboratory_executions" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "order_version_id" TEXT NOT NULL,
    "status" "LaboratoryExecutionStatus" NOT NULL DEFAULT 'PENDING_COLLECTION',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "laboratory_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "laboratory_execution_items" (
    "id" TEXT NOT NULL,
    "execution_id" TEXT NOT NULL,
    "order_item_id" TEXT NOT NULL,
    "specimen_id" TEXT,
    "result_id" TEXT,
    "status" "LaboratoryExecutionStatus" NOT NULL DEFAULT 'PENDING_COLLECTION',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "laboratory_execution_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specimens" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "barcode" TEXT NOT NULL,
    "specimen_type" TEXT NOT NULL,
    "status" "SpecimenStatus" NOT NULL DEFAULT 'EXPECTED',
    "collection_time" TIMESTAMP(3),
    "collector_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "specimens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specimen_collection_attempts" (
    "id" TEXT NOT NULL,
    "specimen_id" TEXT NOT NULL,
    "status" "SpecimenStatus" NOT NULL,
    "attempted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attempted_by_id" TEXT NOT NULL,
    "rejection_reason" "SpecimenRejectionReason",
    "notes" TEXT,

    CONSTRAINT "specimen_collection_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analyzer_queues" (
    "id" TEXT NOT NULL,
    "execution_item_id" TEXT NOT NULL,
    "analyzer_id" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "queue_position" INTEGER NOT NULL DEFAULT 0,
    "status" "LaboratoryExecutionStatus" NOT NULL DEFAULT 'IN_ANALYZER_QUEUE',
    "retries" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analyzer_queues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "laboratory_results" (
    "id" TEXT NOT NULL,
    "execution_item_id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "status" "ResultStatus" NOT NULL DEFAULT 'DRAFT',
    "active_version_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "laboratory_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "laboratory_result_versions" (
    "id" TEXT NOT NULL,
    "result_id" TEXT NOT NULL,
    "version_number" INTEGER NOT NULL,
    "values" JSONB NOT NULL,
    "reference_ranges" JSONB,
    "abnormal_flags" JSONB,
    "units" JSONB,
    "verified_at" TIMESTAMP(3),
    "verified_by" TEXT,
    "released_at" TIMESTAMP(3),
    "released_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "laboratory_result_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "critical_value_notifications" (
    "id" TEXT NOT NULL,
    "result_version_id" TEXT NOT NULL,
    "recipient_id" TEXT NOT NULL,
    "acknowledged_at" TIMESTAMP(3),
    "acknowledged_by" TEXT,
    "escalated" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "critical_value_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "laboratory_executions_order_id_key" ON "laboratory_executions"("order_id");

-- CreateIndex
CREATE INDEX "laboratory_executions_hospital_id_patient_id_idx" ON "laboratory_executions"("hospital_id", "patient_id");

-- CreateIndex
CREATE INDEX "laboratory_executions_status_idx" ON "laboratory_executions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "laboratory_execution_items_order_item_id_key" ON "laboratory_execution_items"("order_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "specimens_barcode_key" ON "specimens"("barcode");

-- CreateIndex
CREATE INDEX "specimens_hospital_id_patient_id_idx" ON "specimens"("hospital_id", "patient_id");

-- CreateIndex
CREATE INDEX "analyzer_queues_analyzer_id_priority_idx" ON "analyzer_queues"("analyzer_id", "priority");

-- CreateIndex
CREATE UNIQUE INDEX "laboratory_results_execution_item_id_key" ON "laboratory_results"("execution_item_id");

-- CreateIndex
CREATE INDEX "laboratory_results_hospital_id_patient_id_idx" ON "laboratory_results"("hospital_id", "patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "laboratory_result_versions_result_id_version_number_key" ON "laboratory_result_versions"("result_id", "version_number");

-- AddForeignKey
ALTER TABLE "laboratory_executions" ADD CONSTRAINT "laboratory_executions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "laboratory_execution_items" ADD CONSTRAINT "laboratory_execution_items_execution_id_fkey" FOREIGN KEY ("execution_id") REFERENCES "laboratory_executions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "laboratory_execution_items" ADD CONSTRAINT "laboratory_execution_items_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "laboratory_execution_items" ADD CONSTRAINT "laboratory_execution_items_specimen_id_fkey" FOREIGN KEY ("specimen_id") REFERENCES "specimens"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "laboratory_execution_items" ADD CONSTRAINT "laboratory_execution_items_result_id_fkey" FOREIGN KEY ("result_id") REFERENCES "laboratory_results"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specimen_collection_attempts" ADD CONSTRAINT "specimen_collection_attempts_specimen_id_fkey" FOREIGN KEY ("specimen_id") REFERENCES "specimens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analyzer_queues" ADD CONSTRAINT "analyzer_queues_execution_item_id_fkey" FOREIGN KEY ("execution_item_id") REFERENCES "laboratory_execution_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "laboratory_result_versions" ADD CONSTRAINT "laboratory_result_versions_result_id_fkey" FOREIGN KEY ("result_id") REFERENCES "laboratory_results"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "critical_value_notifications" ADD CONSTRAINT "critical_value_notifications_result_version_id_fkey" FOREIGN KEY ("result_version_id") REFERENCES "laboratory_result_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

