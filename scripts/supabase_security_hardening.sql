-- ---------- BEGIN HARDENING SCRIPT ----------
-- HASPATAAL ZERO TRUST HARDENING (corrected)

REVOKE ALL ON SCHEMA public FROM PUBLIC;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    EXECUTE 'REVOKE ALL ON SCHEMA public FROM anon';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    EXECUTE 'REVOKE ALL ON SCHEMA public FROM authenticated';
  END IF;
END
$$ LANGUAGE plpgsql;

GRANT USAGE ON SCHEMA public TO authenticated;

DO $$
DECLARE
  r RECORD;
BEGIN
  PERFORM 1 FROM ( VALUES
      ('doctors_master'), ('doctor_identity_docs'), ('doctor_registration'), ('hospitals_master'), ('hospital_facilities'), ('hospital_services'), ('hospital_roles'), ('hospital_verification_logs'), ('doctor_hospital_affiliations'), ('doctor_roles'), ('doctor_flags'), ('staff'), ('patients_master'), ('agents'), ('appointments'), ('reviews'), ('slots'), ('visits'), ('medical_records'), ('audit_logs'), ('patient_records'), ('diagnostic_master_categories'), ('diagnostic_master_tests'), ('diagnostic_panels'), ('diagnostic_panel_tests'), ('hospital_diagnostic_pricing'), ('hospital_panel_pricing'), ('diagnostic_orders'), ('diagnostic_order_items'), ('diagnostic_results'), ('lab_quality_controls')
  ) AS t(tbl) WHERE EXISTS ( SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t.tbl );
  
  FOR r IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN (
    'doctors_master','doctor_identity_docs','doctor_registration','hospitals_master','hospital_facilities','hospital_services','hospital_roles','hospital_verification_logs','doctor_hospital_affiliations','doctor_roles','doctor_flags','staff','patients_master','agents','appointments','reviews','slots','visits','medical_records','audit_logs','patient_records','diagnostic_master_categories','diagnostic_master_tests','diagnostic_panels','diagnostic_panel_tests','hospital_diagnostic_pricing','hospital_panel_pricing','diagnostic_orders','diagnostic_order_items','diagnostic_results','lab_quality_controls'
  ) LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.table_name);
  END LOOP;
END
$$ LANGUAGE plpgsql;

CREATE SCHEMA IF NOT EXISTS auth;
CREATE OR REPLACE FUNCTION public._jwt_claim_text(claim_key text) RETURNS text LANGUAGE sql STABLE AS $$ SELECT NULLIF((current_setting('request.jwt.claims', true)::json ->> claim_key), ''); $$;
CREATE OR REPLACE FUNCTION public.get_user_role() RETURNS text LANGUAGE sql STABLE AS $$ SELECT public._jwt_claim_text('role'); $$ SECURITY DEFINER;
CREATE OR REPLACE FUNCTION public.get_user_hospital_id() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT (public._jwt_claim_text('hospitalId'))::uuid; $$ SECURITY DEFINER;
CREATE OR REPLACE FUNCTION public.get_user_id() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT (public._jwt_claim_text('sub'))::uuid; $$ SECURITY DEFINER;
REVOKE EXECUTE ON FUNCTION public._jwt_claim_text(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_user_role() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_user_hospital_id() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_user_id() FROM PUBLIC;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='hospitals_master' AND column_name='id') THEN EXECUTE 'CREATE INDEX IF NOT EXISTS idx_hospitals_master_id ON public.hospitals_master (id);'; END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='hospital_facilities' AND column_name='hospital_id') THEN EXECUTE 'CREATE INDEX IF NOT EXISTS idx_hospital_facilities_hospital_id ON public.hospital_facilities (hospital_id);'; END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='patients_master' AND column_name='id') THEN EXECUTE 'CREATE INDEX IF NOT EXISTS idx_patients_master_id ON public.patients_master (id);'; END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='appointments' AND column_name='patient_id') THEN EXECUTE 'CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments (patient_id);'; END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='appointments' AND column_name='doctor_id') THEN EXECUTE 'CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON public.appointments (doctor_id);'; END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='medical_records' AND column_name='patient_id') THEN EXECUTE 'CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON public.medical_records (patient_id);'; END IF;
END
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'platform_admin_full_access_hospitals' AND polrelid = 'public.hospitals_master'::regclass) THEN EXECUTE 'DROP POLICY platform_admin_full_access_hospitals ON public.hospitals_master'; END IF;
  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'hospital_admin_access_own_hospital' AND polrelid = 'public.hospitals_master'::regclass) THEN EXECUTE 'DROP POLICY hospital_admin_access_own_hospital ON public.hospitals_master'; END IF;
  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'public_read_active_hospitals' AND polrelid = 'public.hospitals_master'::regclass) THEN EXECUTE 'DROP POLICY public_read_active_hospitals ON public.hospitals_master'; END IF;
END
$$ LANGUAGE plpgsql;

CREATE POLICY platform_admin_full_access_hospitals
  ON public.hospitals_master FOR ALL TO authenticated
  USING (public.get_user_role() = 'PLATFORM_ADMIN') WITH CHECK (public.get_user_role() = 'PLATFORM_ADMIN');

CREATE POLICY hospital_admin_access_own_hospital
  ON public.hospitals_master FOR ALL TO authenticated
  USING (public.get_user_role() = 'HOSPITAL_ADMIN' AND id::text = public.get_user_hospital_id()::text) WITH CHECK (public.get_user_role() = 'HOSPITAL_ADMIN' AND id::text = public.get_user_hospital_id()::text);

CREATE POLICY public_read_active_hospitals
  ON public.hospitals_master FOR SELECT TO PUBLIC USING (account_status = 'active');


DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='hospital_facilities') THEN
    EXECUTE 'DROP POLICY IF EXISTS hospital_admin_isolation_facilities ON public.hospital_facilities;';
    EXECUTE 'CREATE POLICY hospital_admin_isolation_facilities ON public.hospital_facilities FOR ALL TO authenticated USING (public.get_user_role() = ''HOSPITAL_ADMIN'' AND hospital_id::text = public.get_user_hospital_id()::text) WITH CHECK (public.get_user_role() = ''HOSPITAL_ADMIN'' AND hospital_id::text = public.get_user_hospital_id()::text);';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='hospital_services') THEN
    EXECUTE 'DROP POLICY IF EXISTS hospital_admin_isolation_services ON public.hospital_services;';
    EXECUTE 'CREATE POLICY hospital_admin_isolation_services ON public.hospital_services FOR ALL TO authenticated USING (public.get_user_role() = ''HOSPITAL_ADMIN'' AND hospital_id::text = public.get_user_hospital_id()::text) WITH CHECK (public.get_user_role() = ''HOSPITAL_ADMIN'' AND hospital_id::text = public.get_user_hospital_id()::text);';
    EXECUTE 'DROP POLICY IF EXISTS public_read_hospital_services ON public.hospital_services;';
    EXECUTE 'CREATE POLICY public_read_hospital_services ON public.hospital_services FOR SELECT TO PUBLIC USING (true);';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='hospital_diagnostic_pricing') THEN
    EXECUTE 'DROP POLICY IF EXISTS hospital_admin_isolation_pricing ON public.hospital_diagnostic_pricing;';
    EXECUTE 'CREATE POLICY hospital_admin_isolation_pricing ON public.hospital_diagnostic_pricing FOR ALL TO authenticated USING (public.get_user_role() = ''HOSPITAL_ADMIN'' AND hospital_id::text = public.get_user_hospital_id()::text) WITH CHECK (public.get_user_role() = ''HOSPITAL_ADMIN'' AND hospital_id::text = public.get_user_hospital_id()::text);';
    EXECUTE 'DROP POLICY IF EXISTS public_read_hospital_pricing ON public.hospital_diagnostic_pricing;';
    EXECUTE 'CREATE POLICY public_read_hospital_pricing ON public.hospital_diagnostic_pricing FOR SELECT TO PUBLIC USING (true);';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='patients_master') THEN
    EXECUTE 'DROP POLICY IF EXISTS patients_view_own_data ON public.patients_master;';
    EXECUTE 'DROP POLICY IF EXISTS hospital_view_own_patients ON public.patients_master;';
    EXECUTE 'CREATE POLICY patients_view_own_data ON public.patients_master FOR SELECT TO authenticated USING (id::text = public.get_user_id()::text OR first_source_hospital::text = public.get_user_hospital_id()::text);';
    EXECUTE 'CREATE POLICY hospital_view_own_patients ON public.patients_master FOR ALL TO authenticated USING (public.get_user_role() = ''HOSPITAL_ADMIN'' AND first_source_hospital::text = public.get_user_hospital_id()::text) WITH CHECK (public.get_user_role() = ''HOSPITAL_ADMIN'' AND first_source_hospital::text = public.get_user_hospital_id()::text);';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='medical_records') THEN
    EXECUTE 'DROP POLICY IF EXISTS patient_own_records ON public.medical_records;';
    EXECUTE 'DROP POLICY IF EXISTS doctor_access_patient_records ON public.medical_records;';
    EXECUTE 'CREATE POLICY patient_own_records ON public.medical_records FOR SELECT TO authenticated USING (patient_id::text = public.get_user_id()::text);';
    EXECUTE 'CREATE POLICY doctor_access_patient_records ON public.medical_records FOR SELECT TO authenticated USING (public.get_user_role() = ''DOCTOR'');';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='appointments') THEN
    EXECUTE 'DROP POLICY IF EXISTS patient_access_own_appointments ON public.appointments;';
    EXECUTE 'DROP POLICY IF EXISTS doctor_access_own_appointments ON public.appointments;';
    EXECUTE 'DROP POLICY IF EXISTS hospital_manage_appointments ON public.appointments;';
    EXECUTE 'CREATE POLICY patient_access_own_appointments ON public.appointments FOR ALL TO authenticated USING (public.get_user_role() = ''PATIENT'' AND patient_id::text = public.get_user_id()::text) WITH CHECK (public.get_user_role() = ''PATIENT'' AND patient_id::text = public.get_user_id()::text);';
    EXECUTE 'CREATE POLICY doctor_access_own_appointments ON public.appointments FOR ALL TO authenticated USING (public.get_user_role() = ''DOCTOR'' AND doctor_id::text = public.get_user_id()::text) WITH CHECK (public.get_user_role() = ''DOCTOR'' AND doctor_id::text = public.get_user_id()::text);';
    EXECUTE 'CREATE POLICY hospital_manage_appointments ON public.appointments FOR ALL TO authenticated USING (public.get_user_role() = ''HOSPITAL_ADMIN'' AND doctor_id IN (SELECT doctor_id FROM public.doctor_hospital_affiliations WHERE hospital_id::text = public.get_user_hospital_id()::text)) WITH CHECK (public.get_user_role() = ''HOSPITAL_ADMIN'' AND doctor_id IN (SELECT doctor_id FROM public.doctor_hospital_affiliations WHERE hospital_id::text = public.get_user_hospital_id()::text));';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='visits') THEN
    EXECUTE 'DROP POLICY IF EXISTS hospital_strict_tenant_isolation_visits ON public.visits;';
    EXECUTE 'DROP POLICY IF EXISTS patient_view_own_visits ON public.visits;';
    EXECUTE 'CREATE POLICY hospital_strict_tenant_isolation_visits ON public.visits FOR ALL TO authenticated USING (public.get_user_role() = ''HOSPITAL_ADMIN'' AND hospital_id::text = public.get_user_hospital_id()::text) WITH CHECK (public.get_user_role() = ''HOSPITAL_ADMIN'' AND hospital_id::text = public.get_user_hospital_id()::text);';
    EXECUTE 'CREATE POLICY patient_view_own_visits ON public.visits FOR SELECT TO authenticated USING (public.get_user_role() = ''PATIENT'' AND appointment_id::text IN (SELECT id::text FROM public.appointments WHERE patient_id::text = public.get_user_id()::text));';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='audit_logs') THEN
    EXECUTE 'DROP POLICY IF EXISTS insert_only_audit ON public.audit_logs;';
    EXECUTE 'DROP POLICY IF EXISTS platform_admin_read_audit ON public.audit_logs;';
    EXECUTE 'CREATE POLICY insert_only_audit ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);';
    EXECUTE 'CREATE POLICY platform_admin_read_audit ON public.audit_logs FOR SELECT TO authenticated USING (public.get_user_role() = ''PLATFORM_ADMIN'');';
  END IF;
END
$$ LANGUAGE plpgsql;


DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'medical-records') THEN UPDATE storage.buckets SET public = false WHERE name = 'medical-records'; END IF;
  IF EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'doctor-identity-docs') THEN UPDATE storage.buckets SET public = false WHERE name = 'doctor-identity-docs'; END IF;
  IF EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'patient-uploads') THEN UPDATE storage.buckets SET public = false WHERE name = 'patient-uploads'; END IF;
END
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='storage' AND table_name='objects') THEN
    EXECUTE 'DROP POLICY IF EXISTS restrict_storage_to_owners ON storage.objects;';
    EXECUTE 'DROP POLICY IF EXISTS allow_upload_to_own_folder ON storage.objects;';
    EXECUTE 'CREATE POLICY restrict_storage_to_owners ON storage.objects FOR SELECT TO authenticated USING (bucket_id = ''medical-records'' AND (CASE WHEN public.get_user_id() IS NULL THEN false ELSE (storage.foldername(name))[1] = public.get_user_id()::text END));';
    EXECUTE 'CREATE POLICY allow_upload_to_own_folder ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = ''medical-records'' AND (CASE WHEN public.get_user_id() IS NULL THEN false ELSE (storage.foldername(name))[1] = public.get_user_id()::text END));';
  END IF;
END
$$ LANGUAGE plpgsql;


DO $$
BEGIN
  BEGIN CREATE EXTENSION IF NOT EXISTS moddatetime; EXCEPTION WHEN others THEN RAISE NOTICE 'moddatetime extension not available or not permitted: %', SQLERRM; END;
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'moddatetime') THEN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='patients_master') THEN EXECUTE 'DROP TRIGGER IF EXISTS handle_updated_at ON public.patients_master; CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.patients_master FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at);'; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='hospitals_master') THEN EXECUTE 'DROP TRIGGER IF EXISTS handle_updated_at_hospitals ON public.hospitals_master; CREATE TRIGGER handle_updated_at_hospitals BEFORE UPDATE ON public.hospitals_master FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at);'; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='appointments') THEN EXECUTE 'DROP TRIGGER IF EXISTS handle_updated_at_appointments ON public.appointments; CREATE TRIGGER handle_updated_at_appointments BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at);'; END IF;
  END IF;
END
$$ LANGUAGE plpgsql;
