-- Phase 6B: Performance Hardening — Missing Indexes Migration
-- Generated: 2026-07-15
-- Adds indexes for P0 workflow performance optimization

-- Patient search by name
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients (name);

-- Diagnostic orders worklist
CREATE INDEX IF NOT EXISTS idx_diagnostic_orders_hospital_patient ON diagnostic_orders (hospital_id, patient_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_orders_hospital_status ON diagnostic_orders (hospital_id, order_status);

-- Lab orders worklist
CREATE INDEX IF NOT EXISTS idx_lab_orders_hospital_patient_status ON lab_orders (hospital_id, patient_id, status);
CREATE INDEX IF NOT EXISTS idx_lab_orders_hospital_status ON lab_orders (hospital_id, status);

-- Pharmacy dispensing worklist
CREATE INDEX IF NOT EXISTS idx_pharmacy_dispenses_hospital_patient ON pharmacy_dispenses (hospital_id, patient_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_dispenses_hospital_status ON pharmacy_dispenses (hospital_id, status);
CREATE INDEX IF NOT EXISTS idx_pharmacy_dispenses_prescription_id ON pharmacy_dispenses (prescription_id);

-- Invoice and billing
CREATE INDEX IF NOT EXISTS idx_invoice_payments_hospital_status ON invoice_payments (hospital_id, status);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_hospital_paid_at ON invoice_payments (hospital_id, paid_at);
CREATE INDEX IF NOT EXISTS idx_invoices_hospital_patient ON invoices (hospital_id, patient_id);
CREATE INDEX IF NOT EXISTS idx_bills_hospital_status ON bills (hospital_id, status);

-- Patient prescription history
CREATE INDEX IF NOT EXISTS idx_patient_prescriptions_patient_created ON patient_prescriptions (patient_id, created_at);

-- Timeline query optimization (composite for common filter)
CREATE INDEX IF NOT EXISTS idx_timeline_events_hospital_patient_ts ON timeline_events (hospital_id, patient_id, timestamp DESC);

-- Lab sample status tracking
CREATE INDEX IF NOT EXISTS idx_lab_samples_status ON lab_samples (status);

-- Critical value notification lookup
CREATE INDEX IF NOT EXISTS idx_critical_value_notifications_recipient ON critical_value_notifications (recipient_id);

-- Radiology critical finding acknowledgment
CREATE INDEX IF NOT EXISTS idx_radiology_critical_findings_ack_by ON radiology_critical_findings (acknowledged_by);

-- Radiology appointment scheduling
CREATE INDEX IF NOT EXISTS idx_radiology_appointments_patient ON radiology_appointments (patient_id);

-- Procedure room scheduling
CREATE INDEX IF NOT EXISTS idx_procedure_appointments_room ON procedure_appointment (room_id);

-- Order execution tracking
CREATE INDEX IF NOT EXISTS idx_order_executions_created_at ON order_executions (created_at);

-- Lab order patient portal view
CREATE INDEX IF NOT EXISTS idx_lab_orders_patient_status ON lab_orders (patient_id, status);
