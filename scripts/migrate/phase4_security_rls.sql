-- ============================================================
-- HASPATAAL — Phase 4: Security & Compliance
-- Production RLS Policies + Audit Logging
-- Run this against your Supabase PostgreSQL database
-- ============================================================

-- ============================================================
-- SECTION 1: AUDIT LOG TABLE
-- Captures all sensitive mutations (INSERT/UPDATE/DELETE)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     TEXT,
    user_role   TEXT,
    hospital_id UUID,
    action      TEXT NOT NULL,                  -- 'INSERT' | 'UPDATE' | 'DELETE'
    entity      TEXT NOT NULL,                  -- table name
    entity_id   TEXT NOT NULL,                  -- row id
    old_data    JSONB,
    new_data    JSONB,
    ip_address  INET,
    performed_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
-- Only super_admin can read audit logs
CREATE POLICY "audit_logs_super_admin" ON audit_logs FOR SELECT
    USING (current_setting('app.user_role', true) = 'super_admin');

-- ============================================================
-- SECTION 2: APPOINTMENTS — Strict Multi-Tenant RLS
-- ============================================================
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "appointments_hospital_isolation" ON appointments;
CREATE POLICY "appointments_hospital_isolation" ON appointments
    FOR ALL
    USING (
        hospital_id::text = current_setting('app.hospital_id', true)
        OR current_setting('app.user_role', true) = 'super_admin'
    );

DROP POLICY IF EXISTS "appointments_doctors_own" ON appointments;
CREATE POLICY "appointments_doctors_own" ON appointments
    FOR SELECT
    USING (
        doctor_id::text = current_setting('app.user_id', true)
        OR current_setting('app.user_role', true) IN ('super_admin', 'hospital_admin')
    );

-- ============================================================
-- SECTION 3: PATIENTS — Strict Isolation
-- ============================================================
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patients_owner_select" ON patients;
CREATE POLICY "patients_owner_select" ON patients
    FOR SELECT
    USING (
        id::text = current_setting('app.user_id', true)
        OR current_setting('app.user_role', true) IN ('super_admin', 'hospital_admin', 'doctor')
    );

DROP POLICY IF EXISTS "patients_owner_update" ON patients;
CREATE POLICY "patients_owner_update" ON patients
    FOR UPDATE
    USING (id::text = current_setting('app.user_id', true));

-- ============================================================
-- SECTION 4: HOSPITALS — Admin & Agent Only
-- ============================================================
ALTER TABLE hospitals_master ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "hospitals_admin_manage" ON hospitals_master;
CREATE POLICY "hospitals_admin_manage" ON hospitals_master
    FOR ALL
    USING (current_setting('app.user_role', true) IN ('super_admin'));

DROP POLICY IF EXISTS "hospitals_own_read" ON hospitals_master;
CREATE POLICY "hospitals_own_read" ON hospitals_master
    FOR SELECT
    USING (
        id::text = current_setting('app.hospital_id', true)
        OR current_setting('app.user_role', true) = 'super_admin'
    );

-- ============================================================
-- SECTION 5: DOCTORS — Credential Isolation
-- ============================================================
ALTER TABLE doctors_master ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "doctors_own_update" ON doctors_master;
CREATE POLICY "doctors_own_update" ON doctors_master
    FOR UPDATE
    USING (id::text = current_setting('app.user_id', true));

DROP POLICY IF EXISTS "doctors_public_select" ON doctors_master;
CREATE POLICY "doctors_public_select" ON doctors_master
    FOR SELECT USING (true);   -- Publicly discoverable for SEO

-- ============================================================
-- SECTION 6: AUDIT TRIGGER
-- Auto-insert into audit_logs on sensitive table mutations
-- ============================================================
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO audit_logs (user_id, user_role, hospital_id, action, entity, entity_id, old_data, new_data)
    VALUES (
        current_setting('app.user_id', true),
        current_setting('app.user_role', true),
        current_setting('app.hospital_id', true)::UUID,
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id::TEXT, OLD.id::TEXT),
        CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE TRIGGER audit_appointments
    AFTER INSERT OR UPDATE OR DELETE ON appointments
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE OR REPLACE TRIGGER audit_patients
    AFTER UPDATE OR DELETE ON patients
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();
