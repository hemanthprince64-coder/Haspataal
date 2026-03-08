-- =========================================================================
-- HASPATAAL CORE ENGINE - DATABASE PERFORMANCE INDEXES
-- =========================================================================
-- This script manually adds standard database indexes (B-Tree) to the foreign
-- keys of high-traffic Patient and Hospital tables. This optimization prevents
-- PostgreSQL from executing slow Full Table Scans when routing dashboard lists.

-- 1. Appointments Indexing
CREATE INDEX IF NOT EXISTS "appointments_patientId_idx" ON "appointments"("patient_id");
CREATE INDEX IF NOT EXISTS "appointments_doctorId_idx" ON "appointments"("doctor_id");

-- 2. Diagnostic Orders Indexing
CREATE INDEX IF NOT EXISTS "diagnostic_orders_hospitalId_idx" ON "diagnostic_orders"("hospital_id");
CREATE INDEX IF NOT EXISTS "diagnostic_orders_patientId_idx" ON "diagnostic_orders"("patient_id");
CREATE INDEX IF NOT EXISTS "diagnostic_orders_doctorId_idx" ON "diagnostic_orders"("doctor_id");

-- 3. Diagnostic Order Items Indexing
CREATE INDEX IF NOT EXISTS "diagnostic_order_items_orderId_idx" ON "diagnostic_order_items"("order_id");
CREATE INDEX IF NOT EXISTS "diagnostic_order_items_testId_idx" ON "diagnostic_order_items"("test_id");

-- 4. Visits Indexing
CREATE INDEX IF NOT EXISTS "visits_hospitalId_idx" ON "visits"("hospital_id");
CREATE INDEX IF NOT EXISTS "visits_appointmentId_idx" ON "visits"("appointment_id");

-- 5. Payments Indexing
CREATE INDEX IF NOT EXISTS "payments_appointmentId_idx" ON "payments"("appointment_id");

-- 6. Medical Records Indexing
CREATE INDEX IF NOT EXISTS "medical_records_patientId_idx" ON "medical_records"("patient_id");

-- END OF MIGRATION
