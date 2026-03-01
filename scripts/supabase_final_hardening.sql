-- ---------- BEGIN FINAL HARDENING SCRIPT ----------
-- Addresses the trailing 8 issues found in the Supabase Security Advisor

-- 1) Enable RLS on the remaining identified tables
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN (
    'payments', 'hospital_admins', 'hospital_departments', 'hospital_billing_profile', 
    'diagnostic_categories', 'doctor_professional_history', 'patients'
  ) LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.table_name);
  END LOOP;
END
$$ LANGUAGE plpgsql;

-- 2) Create missing policies for these tables

DO $$
BEGIN
  -- 2.1 payments
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='payments') THEN
    EXECUTE 'DROP POLICY IF EXISTS hospital_admin_isolation_payments ON public.payments;';
    EXECUTE 'CREATE POLICY hospital_admin_isolation_payments ON public.payments FOR ALL TO authenticated USING (public.get_user_role() = ''HOSPITAL_ADMIN'' AND appointment_id IN (SELECT id FROM public.appointments WHERE doctor_id IN (SELECT doctor_id FROM public.doctor_hospital_affiliations WHERE hospital_id::text = public.get_user_hospital_id()::text)));';
    EXECUTE 'DROP POLICY IF EXISTS patient_own_payments ON public.payments;';
    EXECUTE 'CREATE POLICY patient_own_payments ON public.payments FOR SELECT TO authenticated USING (public.get_user_role() = ''PATIENT'' AND appointment_id IN (SELECT id FROM public.appointments WHERE patient_id::text = public.get_user_id()::text));';
  END IF;

  -- 2.2 hospital_admins
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='hospital_admins') THEN
    EXECUTE 'DROP POLICY IF EXISTS hospital_admin_isolation_admins ON public.hospital_admins;';
    EXECUTE 'CREATE POLICY hospital_admin_isolation_admins ON public.hospital_admins FOR ALL TO authenticated USING (public.get_user_role() = ''HOSPITAL_ADMIN'' AND hospital_id::text = public.get_user_hospital_id()::text);';
  END IF;

  -- 2.3 hospital_departments
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='hospital_departments') THEN
    EXECUTE 'DROP POLICY IF EXISTS hospital_admin_isolation_departments ON public.hospital_departments;';
    EXECUTE 'CREATE POLICY hospital_admin_isolation_departments ON public.hospital_departments FOR ALL TO authenticated USING (public.get_user_role() = ''HOSPITAL_ADMIN'' AND hospital_id::text = public.get_user_hospital_id()::text);';
  END IF;

  -- 2.4 hospital_billing_profile
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='hospital_billing_profile') THEN
    EXECUTE 'DROP POLICY IF EXISTS hospital_admin_isolation_billing_profile ON public.hospital_billing_profile;';
    EXECUTE 'CREATE POLICY hospital_admin_isolation_billing_profile ON public.hospital_billing_profile FOR ALL TO authenticated USING (public.get_user_role() = ''HOSPITAL_ADMIN'' AND hospital_id::text = public.get_user_hospital_id()::text);';
  END IF;

  -- 2.5 diagnostic_categories (Allow public read for menus)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='diagnostic_categories') THEN
    EXECUTE 'DROP POLICY IF EXISTS public_read_diagnostic_categories ON public.diagnostic_categories;';
    EXECUTE 'CREATE POLICY public_read_diagnostic_categories ON public.diagnostic_categories FOR SELECT TO PUBLIC USING (true);';
  END IF;

  -- 2.6 doctor_professional_history
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='doctor_professional_history') THEN
    EXECUTE 'DROP POLICY IF EXISTS doctor_own_history ON public.doctor_professional_history;';
    EXECUTE 'CREATE POLICY doctor_own_history ON public.doctor_professional_history FOR ALL TO authenticated USING (public.get_user_role() = ''DOCTOR'' AND doctor_id::text = public.get_user_id()::text);';
    EXECUTE 'DROP POLICY IF EXISTS public_read_doctor_history ON public.doctor_professional_history;';
    EXECUTE 'CREATE POLICY public_read_doctor_history ON public.doctor_professional_history FOR SELECT TO PUBLIC USING (true);';
  END IF;

  -- 2.7 patients (Resolving both RLS Disabled and Sensitive Columns Expressed)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='patients') THEN
    EXECUTE 'DROP POLICY IF EXISTS patients_view_own_data ON public.patients;';
    EXECUTE 'DROP POLICY IF EXISTS hospital_view_own_patients ON public.patients;';
    
    -- Patient can see their own row
    EXECUTE 'CREATE POLICY patients_view_own_data ON public.patients FOR SELECT TO authenticated USING (id::text = public.get_user_id()::text);';
    
    -- Hospital can see their own patients via appointments
    EXECUTE 'CREATE POLICY hospital_view_own_patients ON public.patients FOR ALL TO authenticated USING (public.get_user_role() = ''HOSPITAL_ADMIN'' AND id IN (SELECT patient_id FROM public.appointments WHERE doctor_id IN (SELECT doctor_id FROM public.doctor_hospital_affiliations WHERE hospital_id::text = public.get_user_hospital_id()::text)));';
  END IF;

END
$$ LANGUAGE plpgsql;

-- 3) Mitigate `sensitive_columns_exposed` for patients.password
-- By enabling RLS above, we have restricted WHO can query the `patients` table.
-- Supabase PostgREST might still throw a warning if the column is physically selectable by Anon.
-- We already ran REVOKE ALL ON SCHEMA public FROM anon; in the previous script.
-- To be absolutely sure, we can hide the password column from PostgREST entirely:
-- (Note: Only do this if you don't use PostgREST for password auth updates on the client side, which you shouldn't).

-- Commented out the REVOKE column approach as RLS enablement is the recommended Supabase fix for this specific warning.
-- REVOKE SELECT (password) ON TABLE public.patients FROM public, anon, authenticated;

-- ---------- END FINAL HARDENING SCRIPT ----------
