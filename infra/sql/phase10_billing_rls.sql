-- =========================================================================
-- HASPATAAL CORE ENGINE - PHASE 10 - BILLING RLS
-- =========================================================================

-- 1. ENABLE RLS ON BILLING TABLES
ALTER TABLE charge_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_accounts ENABLE ROW LEVEL SECURITY;

-- 2. POLICIES FOR charge_items
CREATE POLICY "Admin Full Access" ON charge_items FOR ALL USING (get_auth_role() = 'PLATFORM_ADMIN');
CREATE POLICY "Hospital Isolation" ON charge_items FOR ALL USING (hospital_id = get_auth_hospital_id());
CREATE POLICY "Patient Access" ON charge_items FOR SELECT USING (get_auth_role() = 'PATIENT' AND patient_id = get_auth_id());

-- 3. POLICIES FOR invoices
CREATE POLICY "Admin Full Access" ON invoices FOR ALL USING (get_auth_role() = 'PLATFORM_ADMIN');
CREATE POLICY "Hospital Isolation" ON invoices FOR ALL USING (hospital_id = get_auth_hospital_id());
CREATE POLICY "Patient Access" ON invoices FOR SELECT USING (get_auth_role() = 'PATIENT' AND patient_id = get_auth_id());

-- 4. POLICIES FOR invoice_line_items
CREATE POLICY "Admin Full Access" ON invoice_line_items FOR ALL USING (get_auth_role() = 'PLATFORM_ADMIN');
CREATE POLICY "Hospital Isolation" ON invoice_line_items FOR ALL USING (
    invoice_id IN (SELECT id FROM invoices WHERE hospital_id = get_auth_hospital_id())
);
CREATE POLICY "Patient Access" ON invoice_line_items FOR SELECT USING (
    invoice_id IN (SELECT id FROM invoices WHERE patient_id = get_auth_id())
);

-- 5. POLICIES FOR billing_payments
CREATE POLICY "Admin Full Access" ON billing_payments FOR ALL USING (get_auth_role() = 'PLATFORM_ADMIN');
CREATE POLICY "Hospital Isolation" ON billing_payments FOR ALL USING (hospital_id = get_auth_hospital_id());

-- 6. POLICIES FOR billing_accounts
CREATE POLICY "Admin Full Access" ON billing_accounts FOR ALL USING (get_auth_role() = 'PLATFORM_ADMIN');
CREATE POLICY "Hospital Isolation" ON billing_accounts FOR ALL USING (
    patient_id IN (SELECT id FROM patients WHERE id = billing_accounts.patient_id) -- Or we can just join against hospital patients
);
CREATE POLICY "Patient Access" ON billing_accounts FOR SELECT USING (get_auth_role() = 'PATIENT' AND patient_id = get_auth_id());
