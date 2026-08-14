-- Create Enum AlertSeverity
CREATE TYPE "AlertSeverity" AS ENUM ('INFO', 'WARNING', 'HIGH', 'CRITICAL');

-- Create Enum ClinicalEventType
CREATE TYPE "ClinicalEventType" AS ENUM ('ACUITY_CHANGE', 'LAB_RESULT', 'VITAL_SIGN', 'MANUAL_ESCALATION', 'MEDICATION', 'PROCEDURE');

-- CreateTable
CREATE TABLE "clinical_events" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "admission_id" TEXT,
    "event_type" "ClinicalEventType" NOT NULL,
    "payload" JSONB NOT NULL,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT,

    CONSTRAINT "clinical_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinical_alerts" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "severity" "AlertSeverity" NOT NULL DEFAULT 'INFO',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "source" TEXT,
    "is_acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "acknowledged_at" TIMESTAMP(3),
    "acknowledged_by" TEXT,
    "ack_note" TEXT,
    "resolved_at" TIMESTAMP(3),
    "resolved_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinical_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "clinical_alerts_hospital_id_is_acknowledged_idx" ON "clinical_alerts"("hospital_id", "is_acknowledged");

-- CreateIndex
CREATE INDEX "clinical_alerts_patient_id_resolved_at_idx" ON "clinical_alerts"("patient_id", "resolved_at");

-- AddForeignKey
ALTER TABLE "clinical_events" ADD CONSTRAINT "clinical_events_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_events" ADD CONSTRAINT "clinical_events_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_events" ADD CONSTRAINT "clinical_events_admission_id_fkey" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_alerts" ADD CONSTRAINT "clinical_alerts_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_alerts" ADD CONSTRAINT "clinical_alerts_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_alerts" ADD CONSTRAINT "clinical_alerts_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "clinical_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
