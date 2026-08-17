-- =========================================================================
-- HASPATAAL CORE ENGINE - PHASE 3 OPERATIONS RLS POLICIES
-- =========================================================================
-- Enable Row-Level Security (RLS) on newly added operations tables

ALTER TABLE nursing_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mars ENABLE ROW LEVEL SECURITY;
ALTER TABLE ot_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE icu_admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_claims ENABLE ROW LEVEL SECURITY;

-- Hospital Staff Policies (Full CRUD access mapped to their authenticated hospital_id)
CREATE POLICY "Hospital Manage Nursing Notes" ON nursing_notes FOR ALL USING (hospital_id = get_auth_hospital_id());
CREATE POLICY "Hospital Manage MAR" ON mars FOR ALL USING (hospital_id = get_auth_hospital_id());
CREATE POLICY "Hospital Manage OT Schedules" ON ot_schedules FOR ALL USING (hospital_id = get_auth_hospital_id());
CREATE POLICY "Hospital Manage ICU Admissions" ON icu_admissions FOR ALL USING (hospital_id = get_auth_hospital_id());
CREATE POLICY "Hospital Manage Insurance Verifications" ON insurance_verifications FOR ALL USING (hospital_id = get_auth_hospital_id());
CREATE POLICY "Hospital Manage Insurance Claims" ON insurance_claims FOR ALL USING (hospital_id = get_auth_hospital_id());

-- Patient Read Policies (Patients can view their own medical operations records)
CREATE POLICY "Patient View Own Nursing Notes" ON nursing_notes FOR SELECT USING (
  admission_id IN (SELECT id FROM admissions WHERE patient_id = get_auth_id())
);

CREATE POLICY "Patient View Own MAR" ON mars FOR SELECT USING (
  admission_id IN (SELECT id FROM admissions WHERE patient_id = get_auth_id())
);

CREATE POLICY "Patient View Own OT Schedules" ON ot_schedules FOR SELECT USING (
  patient_id = get_auth_id()
);

CREATE POLICY "Patient View Own ICU Admissions" ON icu_admissions FOR SELECT USING (
  admission_id IN (SELECT id FROM admissions WHERE patient_id = get_auth_id())
);

CREATE POLICY "Patient View Own Insurance Verifications" ON insurance_verifications FOR SELECT USING (
  patient_id = get_auth_id()
);

CREATE POLICY "Patient View Own Insurance Claims" ON insurance_claims FOR SELECT USING (
  patient_id = get_auth_id()
);
