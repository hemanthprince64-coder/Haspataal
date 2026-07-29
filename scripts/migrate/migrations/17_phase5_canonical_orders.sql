-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('LAB', 'RADIOLOGY', 'PHARMACY', 'PROCEDURE', 'BLOOD_BANK', 'REFERRAL', 'PHYSIOTHERAPY', 'NUTRITION', 'DIALYSIS', 'CUSTOM');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('REQUESTED', 'ACCEPTED', 'SCHEDULED', 'IN_PROGRESS', 'PARTIALLY_COMPLETED', 'COMPLETED', 'CANCELLED', 'EXPIRED', 'REJECTED');

-- CreateEnum
CREATE TYPE "OrderPriority" AS ENUM ('ROUTINE', 'URGENT', 'STAT');

-- CreateEnum
CREATE TYPE "ClinicalContext" AS ENUM ('OPD', 'IPD', 'EMERGENCY', 'ICU', 'NICU', 'LABOUR_ROOM', 'TELEMEDICINE', 'HOME_CARE');

-- DropIndex
DROP INDEX "event_logs_idempotency_key_key";

-- AlterTable
ALTER TABLE "care_responsibilities" DROP COLUMN "departure_status";

-- AlterTable
ALTER TABLE "consumer_idempotency_ledger" ALTER COLUMN "status" DROP DEFAULT;

-- AlterTable
ALTER TABLE "doctor_patient_relationships" DROP COLUMN "departure_status";

-- AlterTable
ALTER TABLE "event_logs" DROP COLUMN "idempotency_key",
DROP COLUMN "metadata";

-- AlterTable
ALTER TABLE "outbox_events" DROP COLUMN "locked_by",
DROP COLUMN "locked_until",
DROP COLUMN "next_retry_at";

-- DropTable
DROP TABLE "dead_letter_events";

-- CreateTable
CREATE TABLE "clinical_order_catalogs" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "type" "OrderType" NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinical_order_catalogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinical_order_catalog_versions" (
    "id" TEXT NOT NULL,
    "catalog_id" TEXT NOT NULL,
    "version_number" INTEGER NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "effective_from" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effective_until" TIMESTAMP(3),
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clinical_order_catalog_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_groups" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ordered_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "clinical_context" "ClinicalContext" NOT NULL,
    "context_id" TEXT,
    "group_id" TEXT,
    "ordered_by" TEXT NOT NULL,
    "active_version_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_versions" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "version_number" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'REQUESTED',
    "priority" "OrderPriority" NOT NULL DEFAULT 'ROUTINE',
    "clinical_notes" TEXT,
    "reason_for_change" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "catalog_version_id" TEXT NOT NULL,
    "department_id" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'REQUESTED',
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "schedule" JSONB,
    "clinical_notes" TEXT,
    "external_system" TEXT,
    "external_reference_id" TEXT,
    "sync_status" TEXT,
    "last_sync_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_dependencies" (
    "id" TEXT NOT NULL,
    "source_item_id" TEXT NOT NULL,
    "target_item_id" TEXT NOT NULL,
    "dependencyType" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_dependencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_executions" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "item_id" TEXT,
    "status" TEXT NOT NULL,
    "performed_by" TEXT NOT NULL,
    "department_id" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_cancellations" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "cancelled_by" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_cancellations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_audits" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "actor_role" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_audits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "clinical_order_catalogs_hospital_id_type_idx" ON "clinical_order_catalogs"("hospital_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "clinical_order_catalogs_hospital_id_type_code_key" ON "clinical_order_catalogs"("hospital_id", "type", "code");

-- CreateIndex
CREATE UNIQUE INDEX "clinical_order_catalog_versions_catalog_id_version_number_key" ON "clinical_order_catalog_versions"("catalog_id", "version_number");

-- CreateIndex
CREATE INDEX "order_groups_hospital_id_patient_id_idx" ON "order_groups"("hospital_id", "patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_active_version_id_key" ON "orders"("active_version_id");

-- CreateIndex
CREATE INDEX "orders_hospital_id_patient_id_idx" ON "orders"("hospital_id", "patient_id");

-- CreateIndex
CREATE INDEX "orders_ordered_by_idx" ON "orders"("ordered_by");

-- CreateIndex
CREATE UNIQUE INDEX "order_versions_order_id_version_number_key" ON "order_versions"("order_id", "version_number");

-- CreateIndex
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");

-- CreateIndex
CREATE INDEX "order_items_department_id_idx" ON "order_items"("department_id");

-- CreateIndex
CREATE UNIQUE INDEX "order_dependencies_source_item_id_target_item_id_key" ON "order_dependencies"("source_item_id", "target_item_id");

-- CreateIndex
CREATE INDEX "order_executions_order_id_idx" ON "order_executions"("order_id");

-- CreateIndex
CREATE INDEX "order_executions_department_id_idx" ON "order_executions"("department_id");

-- CreateIndex
CREATE UNIQUE INDEX "order_cancellations_order_id_key" ON "order_cancellations"("order_id");

-- CreateIndex
CREATE INDEX "order_audits_order_id_idx" ON "order_audits"("order_id");

-- AddForeignKey
ALTER TABLE "clinical_order_catalog_versions" ADD CONSTRAINT "clinical_order_catalog_versions_catalog_id_fkey" FOREIGN KEY ("catalog_id") REFERENCES "clinical_order_catalogs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "order_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_active_version_id_fkey" FOREIGN KEY ("active_version_id") REFERENCES "order_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_versions" ADD CONSTRAINT "order_versions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_catalog_version_id_fkey" FOREIGN KEY ("catalog_version_id") REFERENCES "clinical_order_catalog_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_dependencies" ADD CONSTRAINT "order_dependencies_source_item_id_fkey" FOREIGN KEY ("source_item_id") REFERENCES "order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_dependencies" ADD CONSTRAINT "order_dependencies_target_item_id_fkey" FOREIGN KEY ("target_item_id") REFERENCES "order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_executions" ADD CONSTRAINT "order_executions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_cancellations" ADD CONSTRAINT "order_cancellations_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_audits" ADD CONSTRAINT "order_audits_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

