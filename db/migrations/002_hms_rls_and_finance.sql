-- Production HMS tenant isolation and operational tables.
-- This complements Prisma migrations for environments that apply SQL directly.

ALTER TABLE hospitals_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_hospital_affiliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_dispenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_dispense_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE retention_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION app_claim(claim text) RETURNS text AS $$
  SELECT current_setting('request.jwt.claims', true)::json->>claim;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION app_hospital_id() RETURNS text AS $$
  SELECT app_claim('hospitalId');
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION app_role() RETURNS text AS $$
  SELECT app_claim('role');
$$ LANGUAGE sql STABLE;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'staff','role_permissions','departments','admissions','beds','bills','invoices',
    'service_catalog','drug_stocks','pharmacy_dispenses','diagnostic_orders',
    'lab_orders','notifications','follow_ups','retention_rules','audit_logs'
  ] LOOP
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I', t);
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON %I FOR ALL USING (hospital_id::text = app_hospital_id() OR app_role() = ''SUPER_ADMIN'') WITH CHECK (hospital_id::text = app_hospital_id() OR app_role() = ''SUPER_ADMIN'')',
      t
    );
  END LOOP;
END $$;

DROP POLICY IF EXISTS hospital_self_access ON hospitals_master;
CREATE POLICY hospital_self_access ON hospitals_master
  FOR ALL
  USING (id::text = app_hospital_id() OR app_role() = 'SUPER_ADMIN' OR account_status = 'active')
  WITH CHECK (id::text = app_hospital_id() OR app_role() = 'SUPER_ADMIN');

DROP POLICY IF EXISTS doctor_public_or_affiliated ON doctors_master;
CREATE POLICY doctor_public_or_affiliated ON doctors_master
  FOR SELECT
  USING (
    account_status = 'ACTIVE'
    OR app_role() = 'SUPER_ADMIN'
    OR id IN (
      SELECT doctor_id FROM doctor_hospital_affiliations
      WHERE hospital_id::text = app_hospital_id()
    )
  );

DROP POLICY IF EXISTS appointment_tenant_access ON appointments;
CREATE POLICY appointment_tenant_access ON appointments
  FOR ALL
  USING (
    hospital_id::text = app_hospital_id()
    OR app_role() = 'SUPER_ADMIN'
    OR patient_id::text = app_claim('id')
    OR doctor_id::text = app_claim('id')
  )
  WITH CHECK (
    hospital_id::text = app_hospital_id()
    OR app_role() = 'SUPER_ADMIN'
    OR patient_id::text = app_claim('id')
    OR doctor_id::text = app_claim('id')
  );

ALTER TABLE hospitals_master FORCE ROW LEVEL SECURITY;
ALTER TABLE staff FORCE ROW LEVEL SECURITY;
ALTER TABLE role_permissions FORCE ROW LEVEL SECURITY;
ALTER TABLE departments FORCE ROW LEVEL SECURITY;
ALTER TABLE admissions FORCE ROW LEVEL SECURITY;
ALTER TABLE beds FORCE ROW LEVEL SECURITY;
ALTER TABLE bills FORCE ROW LEVEL SECURITY;
ALTER TABLE invoices FORCE ROW LEVEL SECURITY;
ALTER TABLE service_catalog FORCE ROW LEVEL SECURITY;
ALTER TABLE drug_stocks FORCE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_orders FORCE ROW LEVEL SECURITY;
ALTER TABLE notifications FORCE ROW LEVEL SECURITY;
ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY;
