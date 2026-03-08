-- =========================================================================
-- HASPATAAL CORE ENGINE - PATIENT HEALTH MODULES RLS PATCH
-- =========================================================================
-- This script enables Row-Level Security (RLS) on all patient health tracking
-- tables to resolve Supabase security lint warnings (0013, 0023).

-- 1. Enable RLS on all related tables
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_medical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE vital_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccination_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE pregnancy_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 2. Create generic patient-access policies for each table
-- Patients can only SELECT, INSERT, UPDATE, DELETE data where patient_id matches their own ID.

-- Family Members
CREATE POLICY "Patient Access Own Family Members" ON family_members
    AS PERMISSIVE FOR ALL TO authenticated
    USING (
        current_setting('request.jwt.claims', true)::json->>'role' = 'PATIENT'
        AND patient_id = current_setting('request.jwt.claims', true)::json->>'id'
    );

-- Medical History
CREATE POLICY "Patient Access Own Medical History" ON patient_medical_history
    AS PERMISSIVE FOR ALL TO authenticated
    USING (
        current_setting('request.jwt.claims', true)::json->>'role' = 'PATIENT'
        AND patient_id = current_setting('request.jwt.claims', true)::json->>'id'
    );

-- Medications
CREATE POLICY "Patient Access Own Medications" ON patient_medications
    AS PERMISSIVE FOR ALL TO authenticated
    USING (
        current_setting('request.jwt.claims', true)::json->>'role' = 'PATIENT'
        AND patient_id = current_setting('request.jwt.claims', true)::json->>'id'
    );

-- Vital Records
CREATE POLICY "Patient Access Own Vital Records" ON vital_records
    AS PERMISSIVE FOR ALL TO authenticated
    USING (
        current_setting('request.jwt.claims', true)::json->>'role' = 'PATIENT'
        AND patient_id = current_setting('request.jwt.claims', true)::json->>'id'
    );

-- Vaccination Records
CREATE POLICY "Patient Access Own Vaccination Records" ON vaccination_records
    AS PERMISSIVE FOR ALL TO authenticated
    USING (
        current_setting('request.jwt.claims', true)::json->>'role' = 'PATIENT'
        AND patient_id = current_setting('request.jwt.claims', true)::json->>'id'
    );

-- Pregnancy Profiles
CREATE POLICY "Patient Access Own Pregnancy Profiles" ON pregnancy_profiles
    AS PERMISSIVE FOR ALL TO authenticated
    USING (
        current_setting('request.jwt.claims', true)::json->>'role' = 'PATIENT'
        AND patient_id = current_setting('request.jwt.claims', true)::json->>'id'
    );

-- Insurance Details
CREATE POLICY "Patient Access Own Insurance Details" ON insurance_details
    AS PERMISSIVE FOR ALL TO authenticated
    USING (
        current_setting('request.jwt.claims', true)::json->>'role' = 'PATIENT'
        AND patient_id = current_setting('request.jwt.claims', true)::json->>'id'
    );

-- User Profiles
CREATE POLICY "Patient Access Own User Profiles" ON user_profiles
    AS PERMISSIVE FOR ALL TO authenticated
    USING (
        current_setting('request.jwt.claims', true)::json->>'role' = 'PATIENT'
        AND patient_id = current_setting('request.jwt.claims', true)::json->>'id'
    );

-- 3. Platform Admin Fallbacks (optional but good practice)
-- Allow Platform Admins full access to assist with medical support/audits.

CREATE POLICY "Platform Admin Full Access Family Members" ON family_members AS PERMISSIVE FOR ALL TO authenticated USING (current_setting('request.jwt.claims', true)::json->>'role' = 'PLATFORM_ADMIN');
CREATE POLICY "Platform Admin Full Access Medical History" ON patient_medical_history AS PERMISSIVE FOR ALL TO authenticated USING (current_setting('request.jwt.claims', true)::json->>'role' = 'PLATFORM_ADMIN');
CREATE POLICY "Platform Admin Full Access Medications" ON patient_medications AS PERMISSIVE FOR ALL TO authenticated USING (current_setting('request.jwt.claims', true)::json->>'role' = 'PLATFORM_ADMIN');
CREATE POLICY "Platform Admin Full Access Vitals" ON vital_records AS PERMISSIVE FOR ALL TO authenticated USING (current_setting('request.jwt.claims', true)::json->>'role' = 'PLATFORM_ADMIN');
CREATE POLICY "Platform Admin Full Access Vaccinations" ON vaccination_records AS PERMISSIVE FOR ALL TO authenticated USING (current_setting('request.jwt.claims', true)::json->>'role' = 'PLATFORM_ADMIN');
CREATE POLICY "Platform Admin Full Access Pregnancy" ON pregnancy_profiles AS PERMISSIVE FOR ALL TO authenticated USING (current_setting('request.jwt.claims', true)::json->>'role' = 'PLATFORM_ADMIN');
CREATE POLICY "Platform Admin Full Access Insurance" ON insurance_details AS PERMISSIVE FOR ALL TO authenticated USING (current_setting('request.jwt.claims', true)::json->>'role' = 'PLATFORM_ADMIN');
CREATE POLICY "Platform Admin Full Access Profiles" ON user_profiles AS PERMISSIVE FOR ALL TO authenticated USING (current_setting('request.jwt.claims', true)::json->>'role' = 'PLATFORM_ADMIN');

-- END OF MIGRATION
