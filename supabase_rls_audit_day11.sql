-- =========================================================================
-- HASPATAAL CORE ENGINE - WEEK 2 - SUPABASE RLS SPRINT
-- =========================================================================
-- This script enables Row-Level Security (RLS) on core tables and creates
-- policies enforcing the strict tenant-isolation and RBAC definitions from Day 11.

-- Enable RLS on core tables
ALTER TABLE hospitals_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_orders ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 1. HOSPITALS MASTER
-- ==========================================
-- Platform Admins can do anything
CREATE POLICY "Platform Admin Full Access on Hospitals" ON hospitals_master
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (current_setting('request.jwt.claims', true)::json->>'role' = 'PLATFORM_ADMIN');

-- Hospital Admins can only view/edit their own hospital
CREATE POLICY "Hospital Admin Access Own Hospital" ON hospitals_master
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (
        current_setting('request.jwt.claims', true)::json->>'role' = 'HOSPITAL_ADMIN' 
        AND id = current_setting('request.jwt.claims', true)::json->>'hospitalId'
    );

-- Patients can view verified hospitals (Public read scope)
CREATE POLICY "Patients View Verified Hospitals" ON hospitals_master
    AS PERMISSIVE FOR SELECT
    TO authenticated
    USING (
        current_setting('request.jwt.claims', true)::json->>'role' = 'PATIENT'
        AND account_status = 'active'
    );

-- ==========================================
-- 2. APPOINTMENTS 
-- ==========================================
-- Platform Admin
CREATE POLICY "Platform Admin Full Access on Appointments" ON appointments
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (current_setting('request.jwt.claims', true)::json->>'role' = 'PLATFORM_ADMIN');

-- Patients can only access their own appointments
CREATE POLICY "Patient Access Own Appointments" ON appointments
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (
        current_setting('request.jwt.claims', true)::json->>'role' = 'PATIENT'
        AND patient_id = current_setting('request.jwt.claims', true)::json->>'id'
    );

-- Hospital Admin can manage appointments for their hospital's doctors
CREATE POLICY "Hospital Manage Affiliated Appointments" ON appointments
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (
        current_setting('request.jwt.claims', true)::json->>'role' = 'HOSPITAL_ADMIN'
        AND doctor_id IN (
            SELECT doctor_id FROM doctor_hospital_affiliations
            WHERE hospital_id = current_setting('request.jwt.claims', true)::json->>'hospitalId'
        )
    );

-- ==========================================
-- 3. VISITS & BILLING (Tenant Isolation)
-- ==========================================
-- Platform Admin
CREATE POLICY "Platform Admin Full Access on Visits" ON visits
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (current_setting('request.jwt.claims', true)::json->>'role' = 'PLATFORM_ADMIN');

-- Hospital Admin can only access visits linked to their hospital_id
CREATE POLICY "Hospital Strict Tenant Isolation visits" ON visits
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (
        current_setting('request.jwt.claims', true)::json->>'role' = 'HOSPITAL_ADMIN'
        AND hospital_id = current_setting('request.jwt.claims', true)::json->>'hospitalId'
    );

-- ==========================================
-- 4. DIAGNOSTIC ORDERS (Billing / OPD)
-- ==========================================
-- Hospital Admin isolation
CREATE POLICY "Hospital Strict Tenant Isolation orders" ON diagnostic_orders
    AS PERMISSIVE FOR ALL
    TO authenticated
    USING (
        current_setting('request.jwt.claims', true)::json->>'role' = 'HOSPITAL_ADMIN'
        AND hospital_id = current_setting('request.jwt.claims', true)::json->>'hospitalId'
    );

-- Patient can see their own orders
CREATE POLICY "Patient Own Orders" ON diagnostic_orders
    AS PERMISSIVE FOR SELECT
    TO authenticated
    USING (
        current_setting('request.jwt.claims', true)::json->>'role' = 'PATIENT'
        AND patient_id = current_setting('request.jwt.claims', true)::json->>'id'
    );

-- END OF MIGRATION
