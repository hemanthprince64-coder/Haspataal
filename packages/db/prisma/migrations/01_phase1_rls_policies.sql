-- ============================================================
-- Phase 1: Multi-Tenant RLS Policies
-- ============================================================

-- Enable RLS on all tables with hospital_id
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE vital_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbox_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_slot_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalation_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE chief_complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_examinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE investigation_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_attachments ENABLE ROW LEVEL SECURITY;

-- Platform-level tables (no hospital isolation, but admin-only access)
-- doctors_master has platform-wide identity, access controlled by auth

-- Create RLS policy function
CREATE OR REPLACE FUNCTION set_tenant_context(hospital_id uuid)
RETURNS void AS $$
BEGIN
  PERFORM set_config('hospital_id', hospital_id::text, true);
END;
$$ LANGUAGE plpgsql;

-- Generic hospital isolation policy (for tables with hospital_id)
CREATE POLICY hospital_isolation_policy ON patients
FOR ALL TO authenticated
USING (hospital_id = current_setting('hospital_id')::uuid);

CREATE POLICY hospital_isolation_policy ON appointments
FOR ALL TO authenticated
USING (hospital_id = current_setting('hospital_id')::uuid);

CREATE POLICY hospital_isolation_policy ON visits
FOR ALL TO authenticated
USING (hospital_id = current_setting('hospital_id')::uuid);

CREATE POLICY hospital_isolation_policy ON audit_logs
FOR ALL TO authenticated
USING (hospital_id = current_setting('hospital_id')::uuid);

CREATE POLICY hospital_isolation_policy ON bills
FOR ALL TO authenticated
USING (hospital_id = current_setting('hospital_id')::uuid);

CREATE POLICY hospital_isolation_policy ON medical_records
FOR ALL TO authenticated
USING (hospital_id = current_setting('hospital_id')::uuid);

-- Patient can only see their own records
CREATE POLICY patient_self_policy ON patients
FOR ALL TO authenticated
USING (id = current_setting('user_id')::uuid);

-- Allow service_role to bypass RLS for system operations
ALTER TABLE patients FORCE ROW LEVEL SECURITY;
ALTER TABLE appointments FORCE ROW LEVEL SECURITY;
-- ... (apply to all RLS-enabled tables)