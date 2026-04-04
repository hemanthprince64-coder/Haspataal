-- =========================================================================
-- HASPATAAL CORE ENGINE - PHASE 4 - SECURITY HARDENING (v2)
-- =========================================================================

-- 1. ENABLE RLS ON ALL SENSITIVE TABLES
ALTER TABLE hospitals_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_hospital_affiliations ENABLE ROW LEVEL SECURITY;

-- CLEANUP OLD POLICIES (Idempotency)
DO $$ 
DECLARE 
    pol record;
BEGIN
    FOR pol IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- ==========================================
-- 2. HELPER FUNCTIONS (Optimized RBAC)
-- ==========================================
CREATE OR REPLACE FUNCTION get_auth_role() RETURNS text AS $$
    SELECT current_setting('request.jwt.claims', true)::json->>'role';
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION get_auth_id() RETURNS text AS $$
    SELECT current_setting('request.jwt.claims', true)::json->>'id';
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION get_auth_hospital_id() RETURNS text AS $$
    SELECT current_setting('request.jwt.claims', true)::json->>'hospitalId';
$$ LANGUAGE sql STABLE;

-- ==========================================
-- 3. HOSPITALS MASTER
-- ==========================================
CREATE POLICY "Admin Full Access" ON hospitals_master FOR ALL USING (get_auth_role() = 'PLATFORM_ADMIN');
CREATE POLICY "Hospital Admin Access Own" ON hospitals_master FOR ALL USING (get_auth_role() = 'HOSPITAL_ADMIN' AND id = get_auth_hospital_id());
CREATE POLICY "Public View Active" ON hospitals_master FOR SELECT USING (account_status = 'active');

-- ==========================================
-- 4. DOCTORS MASTER
-- ==========================================
CREATE POLICY "Admin Full Access Doctors" ON doctors_master FOR ALL USING (get_auth_role() = 'PLATFORM_ADMIN');
CREATE POLICY "Doctor Self Access" ON doctors_master FOR ALL USING (id = get_auth_id());
CREATE POLICY "Hospital Admin View Affiliated" ON doctors_master FOR SELECT 
    USING (get_auth_role() = 'HOSPITAL_ADMIN' AND id IN (SELECT doctor_id FROM doctor_hospital_affiliations WHERE hospital_id = get_auth_hospital_id()));
CREATE POLICY "Public View Verified Doctors" ON doctors_master FOR SELECT USING (account_status = 'ACTIVE');

-- ==========================================
-- 5. APPOINTMENTS (Strict Patient/Hospital Isolation)
-- ==========================================
CREATE POLICY "Patient Access Own Apps" ON appointments FOR ALL USING (patient_id = get_auth_id());
CREATE POLICY "Hospital Manage Apps" ON appointments FOR ALL 
    USING (get_auth_role() = 'HOSPITAL_ADMIN' AND doctor_id IN (SELECT doctor_id FROM doctor_hospital_affiliations WHERE hospital_id = get_auth_hospital_id()));
CREATE POLICY "Doctor Access Apps" ON appointments FOR ALL USING (doctor_id = get_auth_id());

-- ==========================================
-- 6. SLOTS (OPD Management)
-- ==========================================
CREATE POLICY "Public View Slots" ON slots FOR SELECT USING (true);
CREATE POLICY "Doctor Manage Slots" ON slots FOR ALL USING (doctor_id = get_auth_id());
CREATE POLICY "Hospital Manage Slots" ON slots FOR ALL 
    USING (get_auth_role() = 'HOSPITAL_ADMIN' AND doctor_id IN (SELECT doctor_id FROM doctor_hospital_affiliations WHERE hospital_id = get_auth_hospital_id()));

-- ==========================================
-- 7. VISITS & BILLING (True Tenancy)
-- ==========================================
CREATE POLICY "Hospital Isolation Visits" ON visits FOR ALL USING (hospital_id = get_auth_hospital_id());
CREATE POLICY "Patient Access Visits" ON visits FOR SELECT 
    USING (appointment_id IN (SELECT id FROM appointments WHERE patient_id = get_auth_id()));

-- ==========================================
-- 8. STAFF & ADMINS (Internal)
-- ==========================================
CREATE POLICY "Hospital Admin Manage Staff" ON staff FOR ALL USING (hospital_id = get_auth_hospital_id());
CREATE POLICY "Hospital Admin Manage own admins" ON hospital_admins FOR ALL USING (hospital_id = get_auth_hospital_id());

-- ==========================================
-- 9. REVIEWS
-- ==========================================
CREATE POLICY "Public View Reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Patient Manage Own Reviews" ON reviews FOR ALL USING (patient_id = get_auth_id());

-- ENSURE PERMISSIONS
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
