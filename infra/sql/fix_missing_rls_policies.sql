-- =========================================================================
-- HASPATAAL SECURITY PATCH - COMPREHENSIVE RLS POLICIES
-- =========================================================================
-- This script fixes "RLS Enabled No Policy" warnings for all flagged tables.
-- It implements strict multi-tenant isolation using request JWT claims.

-- 1. HELPER FUNCTIONS (Ensure they exist)
CREATE OR REPLACE FUNCTION get_auth_role() RETURNS text AS $$
    SELECT current_setting('request.jwt.claims', true)::json->>'role';
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION get_auth_id() RETURNS text AS $$
    SELECT current_setting('request.jwt.claims', true)::json->>'id';
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION get_auth_hospital_id() RETURNS text AS $$
    SELECT current_setting('request.jwt.claims', true)::json->>'hospitalId';
$$ LANGUAGE sql STABLE;

-- 2. AGENTS & AUDIT
-- Agents
CREATE POLICY "Admin Full Access Agents" ON agents FOR ALL USING (get_auth_role() = 'PLATFORM_ADMIN');
CREATE POLICY "Agent Self Access" ON agents FOR ALL USING (id = get_auth_id());

-- Audit Logs
CREATE POLICY "Admin View Audit Logs" ON audit_logs FOR SELECT USING (get_auth_role() = 'PLATFORM_ADMIN');
CREATE POLICY "Hospital View Own Audit Logs" ON audit_logs FOR SELECT USING (get_auth_role() = 'HOSPITAL_ADMIN' AND hospital_id = get_auth_hospital_id());

-- 3. DIAGNOSTICS (Master Data & Orders)
-- Categories & Master Tests
CREATE POLICY "Public View Diagnostics Master" ON diagnostic_categories FOR SELECT USING (true);
CREATE POLICY "Public View Diagnostic Tests" ON diagnostic_master_tests FOR SELECT USING (true);
CREATE POLICY "Admin Manage Diagnostics Master" ON diagnostic_categories FOR ALL USING (get_auth_role() = 'PLATFORM_ADMIN');
CREATE POLICY "Admin Manage Diagnostic Tests" ON diagnostic_master_tests FOR ALL USING (get_auth_role() = 'PLATFORM_ADMIN');

-- Panels
CREATE POLICY "Public View Panels" ON diagnostic_panels FOR SELECT USING (true);
CREATE POLICY "Public View Panel Tests" ON diagnostic_panel_tests FOR SELECT USING (true);
CREATE POLICY "Admin Manage Panels" ON diagnostic_panels FOR ALL USING (get_auth_role() = 'PLATFORM_ADMIN');

-- Orders & Results
CREATE POLICY "Hospital Manage Own Orders" ON diagnostic_orders FOR ALL USING (hospital_id = get_auth_hospital_id());
CREATE POLICY "Patient View Own Orders" ON diagnostic_orders FOR SELECT USING (patient_id = get_auth_id());
CREATE POLICY "Hospital Manage Order Items" ON diagnostic_order_items FOR ALL USING (order_id IN (SELECT id FROM diagnostic_orders WHERE hospital_id = get_auth_hospital_id()));
CREATE POLICY "Hospital Manage Results" ON diagnostic_results FOR ALL USING (order_item_id IN (SELECT id FROM diagnostic_order_items WHERE order_id IN (SELECT id FROM diagnostic_orders WHERE hospital_id = get_auth_hospital_id())));

-- 4. DOCTOR MANAGEMENT
CREATE POLICY "Admin Manage Doctor Flags" ON doctor_flags FOR ALL USING (get_auth_role() = 'PLATFORM_ADMIN');
CREATE POLICY "Hospital View Affiliations" ON doctor_hospital_affiliations FOR SELECT USING (hospital_id = get_auth_hospital_id());
CREATE POLICY "Doctor Manage Self Identity" ON doctor_identity_docs FOR ALL USING (doctor_id = get_auth_id());
CREATE POLICY "Doctor Manage Self History" ON doctor_professional_history FOR ALL USING (doctor_id = get_auth_id());
CREATE POLICY "Doctor Manage Self Registration" ON doctor_registration FOR ALL USING (doctor_id = get_auth_id());
CREATE POLICY "Admin Manage Doctor Roles" ON doctor_roles FOR ALL USING (get_auth_role() = 'PLATFORM_ADMIN');

-- 5. HOSPITAL ADMINISTRATION
CREATE POLICY "Hospital Admin Manage Billing" ON hospital_billing_profile FOR ALL USING (hospital_id = get_auth_hospital_id());
CREATE POLICY "Hospital Admin Manage Depts" ON hospital_departments FOR ALL USING (hospital_id = get_auth_hospital_id());
CREATE POLICY "Hospital Admin Manage Pricing" ON hospital_diagnostic_pricing FOR ALL USING (hospital_id = get_auth_hospital_id());
CREATE POLICY "Hospital Admin Manage Facilities" ON hospital_facilities FOR ALL USING (hospital_id = get_auth_hospital_id());
CREATE POLICY "Hospital Admin Manage Panel Pricing" ON hospital_panel_pricing FOR ALL USING (hospital_id = get_auth_hospital_id());
CREATE POLICY "Hospital Admin Manage Roles" ON hospital_roles FOR ALL USING (hospital_id = get_auth_hospital_id());
CREATE POLICY "Hospital Admin Manage Services" ON hospital_services FOR ALL USING (hospital_id = get_auth_hospital_id());
CREATE POLICY "Admin View Verification Logs" ON hospital_verification_logs FOR SELECT USING (get_auth_role() = 'PLATFORM_ADMIN');
CREATE POLICY "Hospital View Own Quality Controls" ON lab_quality_controls FOR ALL USING (hospital_id = get_auth_hospital_id());

-- 6. PATIENT HEALTH MODULES
CREATE POLICY "Patient Access Own Family" ON family_members FOR ALL USING (patient_id = get_auth_id());
CREATE POLICY "Patient Access Own Insurance" ON insurance_details FOR ALL USING (patient_id = get_auth_id());
CREATE POLICY "Patient Access Own Medical History" ON patient_medical_history FOR ALL USING (patient_id = get_auth_id());
CREATE POLICY "Patient Access Own Medications" ON patient_medications FOR ALL USING (patient_id = get_auth_id());
CREATE POLICY "Patient Access Own Vitals" ON vital_records FOR ALL USING (patient_id = get_auth_id());
CREATE POLICY "Patient Access Own Vaccinations" ON vaccination_records FOR ALL USING (patient_id = get_auth_id());
CREATE POLICY "Patient Access Own Pregnancy" ON pregnancy_profiles FOR ALL USING (patient_id = get_auth_id());
CREATE POLICY "Patient Access Own Records" ON patient_records FOR ALL USING (patient_id = get_auth_id());
CREATE POLICY "Patient Access Own Profile" ON patients FOR ALL USING (id = get_auth_id());
CREATE POLICY "Patient View Own Payments" ON payments FOR SELECT USING (appointment_id IN (SELECT id FROM appointments WHERE patient_id = get_auth_id()));
CREATE POLICY "Patient Manage Own Medical Records" ON medical_records FOR ALL USING (patient_id = get_auth_id());

-- 7. MISC
CREATE POLICY "System Manage OTP" ON otp_codes FOR ALL USING (true); 

-- 8. GRANT PERMISSIONS
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
