-- CreateEnum
CREATE TYPE "PharmacyExecutionStatus" AS ENUM ('PENDING_VERIFICATION', 'VERIFIED', 'STOCK_RESERVED', 'PARTIALLY_DISPENSED', 'FULLY_DISPENSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "StockReservationStatus" AS ENUM ('ACTIVE', 'RELEASED', 'CONSUMED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "MARAttemptStatus" AS ENUM ('ADMINISTERED', 'REFUSED', 'MISSED', 'OMITTED');

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
    "current_stock" INTEGER NOT NULL,

    CONSTRAINT "inventory_batches_pkey" PRIMARY KEY ("id")
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
CREATE INDEX "medication_administration_attempts_hospital_id_patient_id_idx" ON "medication_administration_attempts"("hospital_id", "patient_id");

-- CreateIndex
CREATE INDEX "medication_administration_attempts_order_item_id_idx" ON "medication_administration_attempts"("order_item_id");

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

