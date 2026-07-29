-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('LAB', 'RADIOLOGY', 'PHARMACY', 'PROCEDURE', 'BLOOD_BANK', 'REFERRAL', 'PHYSIOTHERAPY', 'NUTRITION', 'DIALYSIS', 'CUSTOM');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('REQUESTED', 'ACCEPTED', 'SCHEDULED', 'IN_PROGRESS', 'PARTIALLY_COMPLETED', 'COMPLETED', 'CANCELLED', 'EXPIRED', 'REJECTED');

-- CreateEnum
CREATE TYPE "OrderPriority" AS ENUM ('ROUTINE', 'URGENT', 'STAT');

-- CreateEnum
CREATE TYPE "ClinicalContext" AS ENUM ('OPD', 'IPD', 'EMERGENCY', 'ICU', 'NICU', 'LABOUR_ROOM', 'TELEMEDICINE', 'HOME_CARE');

-- CreateEnum
CREATE TYPE "PharmacyExecutionStatus" AS ENUM ('PENDING_VERIFICATION', 'VERIFIED', 'STOCK_RESERVED', 'PARTIALLY_DISPENSED', 'FULLY_DISPENSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "StockReservationStatus" AS ENUM ('ACTIVE', 'CONSUMED', 'RELEASED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "InventoryBatchStatus" AS ENUM ('ACTIVE', 'RECALLED', 'DEPLETED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "InventoryTransactionType" AS ENUM ('RESERVE', 'UNRESERVE', 'DISPENSE', 'RETURN', 'PURCHASE', 'TRANSFER_IN', 'TRANSFER_OUT', 'ADJUSTMENT', 'EXPIRED', 'DAMAGED', 'DESTROYED');

-- CreateEnum
CREATE TYPE "MARAttemptStatus" AS ENUM ('ADMINISTERED', 'REFUSED', 'MISSED', 'OMITTED');

-- CreateEnum
CREATE TYPE "LaboratoryExecutionStatus" AS ENUM ('PENDING_COLLECTION', 'COLLECTION_IN_PROGRESS', 'COLLECTED', 'RECEIVED', 'IN_ANALYZER_QUEUE', 'ANALYZING', 'RESULT_ENTERED', 'RESULT_VERIFIED', 'RELEASED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SpecimenType" AS ENUM ('BLOOD', 'SERUM', 'PLASMA', 'URINE', 'STOOL', 'CSF', 'SPUTUM', 'SWAB', 'TISSUE', 'OTHER');

-- CreateEnum
CREATE TYPE "SpecimenStatus" AS ENUM ('EXPECTED', 'COLLECTED', 'RECEIVED', 'REJECTED', 'LOST', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ResultStatus" AS ENUM ('DRAFT', 'VERIFIED', 'RELEASED', 'AMENDED');

-- CreateEnum
CREATE TYPE "SpecimenRejectionReason" AS ENUM ('HEMOLYZED', 'CLOTTED', 'INSUFFICIENT', 'WRONG_CONTAINER', 'LABEL_MISMATCH', 'EXPIRED', 'OTHER');

-- CreateEnum
CREATE TYPE "RadiologyExecutionStatus" AS ENUM ('PENDING_SCHEDULING', 'SCHEDULED', 'ARRIVED', 'ACQUIRING', 'ACQUIRED', 'REPORTING', 'REPORT_VERIFIED', 'RELEASED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RadiologyReportStatus" AS ENUM ('DRAFT', 'PRELIMINARY', 'FINAL', 'AMENDED');

-- CreateEnum
CREATE TYPE "ModalityType" AS ENUM ('XRAY', 'CT', 'MRI', 'US', 'PET', 'NM', 'FLORO');

-- CreateEnum
CREATE TYPE "ContrastType" AS ENUM ('IODINE', 'BARIUM', 'GADOLINIUM', 'MICROBUBBLES', 'NONE');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'PATHOLOGIST';

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

-- CreateTable
CREATE TABLE "pharmacy_executions" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "status" "PharmacyExecutionStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pharmacy_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pharmacy_verifications" (
    "id" TEXT NOT NULL,
    "execution_id" TEXT NOT NULL,
    "verified_by" TEXT NOT NULL,
    "verified_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,
    "override" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,

    CONSTRAINT "pharmacy_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pharmacy_execution_items" (
    "id" TEXT NOT NULL,
    "execution_id" TEXT NOT NULL,
    "order_item_id" TEXT NOT NULL,
    "prescribed_quantity" INTEGER NOT NULL,
    "dispensed_quantity" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pharmacy_execution_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pharmacy_substitutions" (
    "id" TEXT NOT NULL,
    "execution_item_id" TEXT NOT NULL,
    "substituted_catalog_version_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "approved_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pharmacy_substitutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "catalog_version_id" TEXT NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_batches" (
    "id" TEXT NOT NULL,
    "inventory_item_id" TEXT NOT NULL,
    "batch_number" TEXT NOT NULL,
    "expiry_date" TIMESTAMP(3) NOT NULL,
    "physical_stock" INTEGER NOT NULL,
    "reserved_stock" INTEGER NOT NULL DEFAULT 0,
    "status" "InventoryBatchStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "inventory_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_transactions" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "type" "InventoryTransactionType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "balance_after" INTEGER NOT NULL,
    "reference_type" TEXT,
    "reference_id" TEXT,
    "actor_id" TEXT NOT NULL,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "correlation_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_reservations" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "execution_item_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" "StockReservationStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pharmacy_execution_dispenses" (
    "id" TEXT NOT NULL,
    "execution_id" TEXT NOT NULL,
    "dispensed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dispensed_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pharmacy_execution_dispenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pharmacy_execution_dispense_items" (
    "id" TEXT NOT NULL,
    "dispense_id" TEXT NOT NULL,
    "execution_item_id" TEXT NOT NULL,
    "reservation_id" TEXT,
    "quantity_dispensed" INTEGER NOT NULL,

    CONSTRAINT "pharmacy_execution_dispense_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medication_administration_attempts" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "order_item_id" TEXT NOT NULL,
    "dispense_item_id" TEXT,
    "scheduled_for" TIMESTAMP(3),
    "status" "MARAttemptStatus" NOT NULL DEFAULT 'ADMINISTERED',
    "attempted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attempted_by_id" TEXT NOT NULL,
    "clinical_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medication_administration_attempts_pkey" PRIMARY KEY ("id")
);

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
    "specimen_type" "SpecimenType" NOT NULL,
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
    "flags" JSONB,
    "instrument_flags" JSONB,
    "verification_notes" JSONB,
    "comments" JSONB,
    "verified_at" TIMESTAMP(3),
    "verified_by" TEXT,
    "released_at" TIMESTAMP(3),
    "released_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "laboratory_result_versions_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "radiology_executions" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "status" "RadiologyExecutionStatus" NOT NULL DEFAULT 'PENDING_SCHEDULING',
    "appointment_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "radiology_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "radiology_execution_items" (
    "id" TEXT NOT NULL,
    "execution_id" TEXT NOT NULL,
    "order_item_id" TEXT NOT NULL,
    "status" "RadiologyExecutionStatus" NOT NULL DEFAULT 'PENDING_SCHEDULING',
    "modality" "ModalityType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "radiology_execution_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "radiology_appointments" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "modality_id" TEXT NOT NULL,
    "status" "RadiologyExecutionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "radiology_appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modality_devices" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "modality" "ModalityType" NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "location" TEXT,
    "manufacturer" TEXT,
    "model" TEXT,
    "ae_title" TEXT,
    "supports_dicom" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "modality_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "radiology_acquisition_sessions" (
    "id" TEXT NOT NULL,
    "execution_id" TEXT NOT NULL,
    "modality_id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',

    CONSTRAINT "radiology_acquisition_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imaging_studies" (
    "id" TEXT NOT NULL,
    "study_instance_uid" TEXT NOT NULL,
    "accession_number" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "dicom_study_date" TEXT,
    "dicom_study_time" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "imaging_studies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imaging_series" (
    "id" TEXT NOT NULL,
    "series_instance_uid" TEXT NOT NULL,
    "study_id" TEXT NOT NULL,
    "series_number" INTEGER NOT NULL,
    "modality" "ModalityType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "imaging_series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imaging_instances" (
    "id" TEXT NOT NULL,
    "sop_instance_uid" TEXT NOT NULL,
    "series_id" TEXT NOT NULL,
    "instance_number" INTEGER NOT NULL,
    "storage_uri" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "checksum" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "imaging_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contrast_administrations" (
    "id" TEXT NOT NULL,
    "execution_item_id" TEXT NOT NULL,
    "contrast_type" "ContrastType" NOT NULL,
    "agent_name" TEXT NOT NULL,
    "lot_number" TEXT,
    "dose" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "reaction_observed" BOOLEAN NOT NULL DEFAULT false,
    "reaction_severity" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contrast_administrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "radiology_reports" (
    "id" TEXT NOT NULL,
    "execution_item_id" TEXT NOT NULL,
    "study_id" TEXT,
    "status" "RadiologyReportStatus" NOT NULL DEFAULT 'DRAFT',
    "active_version_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "radiology_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "radiology_report_versions" (
    "id" TEXT NOT NULL,
    "report_id" TEXT NOT NULL,
    "version_number" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "entered_by" TEXT NOT NULL,
    "verified_by" TEXT,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "radiology_report_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "radiology_critical_findings" (
    "id" TEXT NOT NULL,
    "report_id" TEXT NOT NULL,
    "finding" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "notified_doctor" TEXT,
    "notified_nurse" TEXT,
    "acknowledged_by" TEXT,
    "acknowledged_at" TIMESTAMP(3),
    "communication_log" TEXT,
    "communication_method" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "radiology_critical_findings_pkey" PRIMARY KEY ("id")
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

-- CreateIndex
CREATE UNIQUE INDEX "pharmacy_executions_order_id_key" ON "pharmacy_executions"("order_id");

-- CreateIndex
CREATE INDEX "pharmacy_executions_hospital_id_patient_id_idx" ON "pharmacy_executions"("hospital_id", "patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "pharmacy_execution_items_order_item_id_key" ON "pharmacy_execution_items"("order_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_items_hospital_id_catalog_version_id_key" ON "inventory_items"("hospital_id", "catalog_version_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_batches_inventory_item_id_batch_number_key" ON "inventory_batches"("inventory_item_id", "batch_number");

-- CreateIndex
CREATE INDEX "inventory_transactions_batch_id_idx" ON "inventory_transactions"("batch_id");

-- CreateIndex
CREATE INDEX "inventory_transactions_occurred_at_idx" ON "inventory_transactions"("occurred_at");

-- CreateIndex
CREATE INDEX "medication_administration_attempts_hospital_id_patient_id_idx" ON "medication_administration_attempts"("hospital_id", "patient_id");

-- CreateIndex
CREATE INDEX "medication_administration_attempts_order_item_id_idx" ON "medication_administration_attempts"("order_item_id");

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

-- CreateIndex
CREATE UNIQUE INDEX "radiology_executions_order_id_key" ON "radiology_executions"("order_id");

-- CreateIndex
CREATE INDEX "radiology_executions_hospital_id_patient_id_idx" ON "radiology_executions"("hospital_id", "patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "radiology_execution_items_order_item_id_key" ON "radiology_execution_items"("order_item_id");

-- CreateIndex
CREATE INDEX "radiology_execution_items_execution_id_idx" ON "radiology_execution_items"("execution_id");

-- CreateIndex
CREATE INDEX "radiology_appointments_modality_id_start_time_end_time_idx" ON "radiology_appointments"("modality_id", "start_time", "end_time");

-- CreateIndex
CREATE INDEX "radiology_acquisition_sessions_execution_id_idx" ON "radiology_acquisition_sessions"("execution_id");

-- CreateIndex
CREATE UNIQUE INDEX "imaging_studies_study_instance_uid_key" ON "imaging_studies"("study_instance_uid");

-- CreateIndex
CREATE UNIQUE INDEX "imaging_studies_accession_number_key" ON "imaging_studies"("accession_number");

-- CreateIndex
CREATE UNIQUE INDEX "imaging_series_series_instance_uid_key" ON "imaging_series"("series_instance_uid");

-- CreateIndex
CREATE UNIQUE INDEX "imaging_instances_sop_instance_uid_key" ON "imaging_instances"("sop_instance_uid");

-- CreateIndex
CREATE UNIQUE INDEX "contrast_administrations_execution_item_id_key" ON "contrast_administrations"("execution_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "radiology_reports_execution_item_id_key" ON "radiology_reports"("execution_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "radiology_reports_active_version_id_key" ON "radiology_reports"("active_version_id");

-- CreateIndex
CREATE INDEX "radiology_reports_execution_item_id_idx" ON "radiology_reports"("execution_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "radiology_report_versions_report_id_version_number_key" ON "radiology_report_versions"("report_id", "version_number");

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

-- AddForeignKey
ALTER TABLE "pharmacy_executions" ADD CONSTRAINT "pharmacy_executions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pharmacy_verifications" ADD CONSTRAINT "pharmacy_verifications_execution_id_fkey" FOREIGN KEY ("execution_id") REFERENCES "pharmacy_executions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pharmacy_execution_items" ADD CONSTRAINT "pharmacy_execution_items_execution_id_fkey" FOREIGN KEY ("execution_id") REFERENCES "pharmacy_executions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pharmacy_execution_items" ADD CONSTRAINT "pharmacy_execution_items_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pharmacy_substitutions" ADD CONSTRAINT "pharmacy_substitutions_execution_item_id_fkey" FOREIGN KEY ("execution_item_id") REFERENCES "pharmacy_execution_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pharmacy_substitutions" ADD CONSTRAINT "pharmacy_substitutions_substituted_catalog_version_id_fkey" FOREIGN KEY ("substituted_catalog_version_id") REFERENCES "clinical_order_catalog_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_catalog_version_id_fkey" FOREIGN KEY ("catalog_version_id") REFERENCES "clinical_order_catalog_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_batches" ADD CONSTRAINT "inventory_batches_inventory_item_id_fkey" FOREIGN KEY ("inventory_item_id") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "inventory_batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_reservations" ADD CONSTRAINT "stock_reservations_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "inventory_batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_reservations" ADD CONSTRAINT "stock_reservations_execution_item_id_fkey" FOREIGN KEY ("execution_item_id") REFERENCES "pharmacy_execution_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pharmacy_execution_dispenses" ADD CONSTRAINT "pharmacy_execution_dispenses_execution_id_fkey" FOREIGN KEY ("execution_id") REFERENCES "pharmacy_executions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pharmacy_execution_dispense_items" ADD CONSTRAINT "pharmacy_execution_dispense_items_dispense_id_fkey" FOREIGN KEY ("dispense_id") REFERENCES "pharmacy_execution_dispenses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pharmacy_execution_dispense_items" ADD CONSTRAINT "pharmacy_execution_dispense_items_execution_item_id_fkey" FOREIGN KEY ("execution_item_id") REFERENCES "pharmacy_execution_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pharmacy_execution_dispense_items" ADD CONSTRAINT "pharmacy_execution_dispense_items_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "stock_reservations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_administration_attempts" ADD CONSTRAINT "medication_administration_attempts_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_administration_attempts" ADD CONSTRAINT "medication_administration_attempts_dispense_item_id_fkey" FOREIGN KEY ("dispense_item_id") REFERENCES "pharmacy_execution_dispense_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE "analyzer_queues" ADD CONSTRAINT "analyzer_queues_analyzer_id_fkey" FOREIGN KEY ("analyzer_id") REFERENCES "analyzer_devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "laboratory_result_versions" ADD CONSTRAINT "laboratory_result_versions_result_id_fkey" FOREIGN KEY ("result_id") REFERENCES "laboratory_results"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "critical_value_notifications" ADD CONSTRAINT "critical_value_notifications_result_version_id_fkey" FOREIGN KEY ("result_version_id") REFERENCES "laboratory_result_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_executions" ADD CONSTRAINT "radiology_executions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_executions" ADD CONSTRAINT "radiology_executions_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "radiology_appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_execution_items" ADD CONSTRAINT "radiology_execution_items_execution_id_fkey" FOREIGN KEY ("execution_id") REFERENCES "radiology_executions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_execution_items" ADD CONSTRAINT "radiology_execution_items_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_appointments" ADD CONSTRAINT "radiology_appointments_modality_id_fkey" FOREIGN KEY ("modality_id") REFERENCES "modality_devices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_acquisition_sessions" ADD CONSTRAINT "radiology_acquisition_sessions_execution_id_fkey" FOREIGN KEY ("execution_id") REFERENCES "radiology_executions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_acquisition_sessions" ADD CONSTRAINT "radiology_acquisition_sessions_modality_id_fkey" FOREIGN KEY ("modality_id") REFERENCES "modality_devices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imaging_studies" ADD CONSTRAINT "imaging_studies_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "radiology_acquisition_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imaging_series" ADD CONSTRAINT "imaging_series_study_id_fkey" FOREIGN KEY ("study_id") REFERENCES "imaging_studies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imaging_instances" ADD CONSTRAINT "imaging_instances_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "imaging_series"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrast_administrations" ADD CONSTRAINT "contrast_administrations_execution_item_id_fkey" FOREIGN KEY ("execution_item_id") REFERENCES "radiology_execution_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_reports" ADD CONSTRAINT "radiology_reports_execution_item_id_fkey" FOREIGN KEY ("execution_item_id") REFERENCES "radiology_execution_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_reports" ADD CONSTRAINT "radiology_reports_study_id_fkey" FOREIGN KEY ("study_id") REFERENCES "imaging_studies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_reports" ADD CONSTRAINT "radiology_reports_active_version_id_fkey" FOREIGN KEY ("active_version_id") REFERENCES "radiology_report_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_report_versions" ADD CONSTRAINT "radiology_report_versions_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "radiology_reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_critical_findings" ADD CONSTRAINT "radiology_critical_findings_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "radiology_reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

