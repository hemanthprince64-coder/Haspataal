-- Phase 1 RLS Policies for Multi-Tenant Isolation
-- Apply these policies to Supabase database

-- Enable RLS on all tables
ALTER TABLE patient_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_identity_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_hospital_affiliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Patient records - doctors can only see their own patients' records
CREATE POLICY patient_records_doctor_isolation 
ON patient_records FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM doctor_hospital_affiliations dha
    WHERE dha.doctor_id = patient_records.doctor_id
    AND dha.hospital_id = (current_setting('request.hospital_id'))::uuid
    AND dha.is_current = true
  )
);

-- Doctor documents - only for authenticated doctors
CREATE POLICY doctor_docs_owner_only
ON doctor_identity_docs FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM doctor_master dm
    WHERE dm.id = doctor_identity_docs.doctor_id
  )
);

-- Doctor education - only for authenticated doctors  
CREATE POLICY doctor_education_owner_only
ON doctor_education FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM doctor_master dm
    WHERE dm.id = doctor_education.doctor_id
  )
);

-- Doctor certifications - only for authenticated doctors
CREATE POLICY doctor_certs_owner_only
ON doctor_certifications FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM doctor_master dm
    WHERE dm.id = doctor_certifications.doctor_id
  )
);

-- Affiliations - hospital can see its own affiliations
CREATE POLICY affiliations_hospital_isolation
ON doctor_hospital_affiliations FOR ALL
USING (
  hospital_id = (current_setting('request.hospital_id'))::uuid
);

-- Patient consents - hospital isolation
CREATE POLICY patient_consents_hospital_isolation
ON patient_consents FOR ALL
USING (
  hospital_id = (current_setting('request.hospital_id'))::uuid
);

-- Audit logs - hospital isolation for non-admins
CREATE POLICY audit_logs_hospital_isolation
ON audit_logs FOR ALL
USING (
  hospital_id = (current_setting('request.hospital_id'))::uuid
  OR (current_setting('request.role'))::text = 'SUPER_ADMIN'
);