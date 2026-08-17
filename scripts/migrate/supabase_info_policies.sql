-- ---------- BEGIN INFO FIX SCRIPT ----------
-- Adds RLS Policies to the 21 tables flagged as 'RLS Enabled No Policy' (INFO)

DO $$
BEGIN
  -- 1) `agents`
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='agents') THEN
    EXECUTE 'DROP POLICY IF EXISTS platform_admin_manage_agents ON public.agents;';
    EXECUTE 'CREATE POLICY platform_admin_manage_agents ON public.agents FOR ALL TO authenticated USING (public.get_user_role() = ''PLATFORM_ADMIN'');';
    -- Agents view own data
    EXECUTE 'DROP POLICY IF EXISTS agents_own_data ON public.agents;';
    EXECUTE 'CREATE POLICY agents_own_data ON public.agents FOR SELECT TO authenticated USING (public.get_user_role() = ''AGENT'' AND id::text = public.get_user_id()::text);';
  END IF;

  -- 2) `diagnostic_master_tests`
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='diagnostic_master_tests') THEN
    EXECUTE 'DROP POLICY IF EXISTS public_read_tests ON public.diagnostic_master_tests;';
    EXECUTE 'CREATE POLICY public_read_tests ON public.diagnostic_master_tests FOR SELECT TO PUBLIC USING (true);';
  END IF;

  -- 3) `diagnostic_panels`
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='diagnostic_panels') THEN
    EXECUTE 'DROP POLICY IF EXISTS public_read_panels ON public.diagnostic_panels;';
    EXECUTE 'CREATE POLICY public_read_panels ON public.diagnostic_panels FOR SELECT TO PUBLIC USING (true);';
  END IF;

  -- 4) `diagnostic_panel_tests`
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='diagnostic_panel_tests') THEN
    EXECUTE 'DROP POLICY IF EXISTS public_read_panel_tests ON public.diagnostic_panel_tests;';
    EXECUTE 'CREATE POLICY public_read_panel_tests ON public.diagnostic_panel_tests FOR SELECT TO PUBLIC USING (true);';
  END IF;

  -- 5) `diagnostic_orders` (has hospital_id, patient_id, doctor_id)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='diagnostic_orders') THEN
    EXECUTE 'DROP POLICY IF EXISTS hospital_manage_orders ON public.diagnostic_orders;';
    EXECUTE 'CREATE POLICY hospital_manage_orders ON public.diagnostic_orders FOR ALL TO authenticated USING (public.get_user_role() = ''HOSPITAL_ADMIN'' AND hospital_id::text = public.get_user_hospital_id()::text);';
    EXECUTE 'DROP POLICY IF EXISTS patient_view_orders ON public.diagnostic_orders;';
    EXECUTE 'CREATE POLICY patient_view_orders ON public.diagnostic_orders FOR SELECT TO authenticated USING (public.get_user_role() = ''PATIENT'' AND patient_id::text = public.get_user_id()::text);';
    EXECUTE 'DROP POLICY IF EXISTS doctor_view_orders ON public.diagnostic_orders;';
    EXECUTE 'CREATE POLICY doctor_view_orders ON public.diagnostic_orders FOR SELECT TO authenticated USING (public.get_user_role() = ''DOCTOR'' AND doctor_id::text = public.get_user_id()::text);';
  END IF;

  -- 6) `diagnostic_order_items` (join on diagnostic_orders)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='diagnostic_order_items') THEN
    EXECUTE 'DROP POLICY IF EXISTS hospital_manage_order_items ON public.diagnostic_order_items;';
    EXECUTE 'CREATE POLICY hospital_manage_order_items ON public.diagnostic_order_items FOR ALL TO authenticated USING (public.get_user_role() = ''HOSPITAL_ADMIN'' AND order_id IN (SELECT id FROM public.diagnostic_orders WHERE hospital_id::text = public.get_user_hospital_id()::text));';
    EXECUTE 'DROP POLICY IF EXISTS patient_view_order_items ON public.diagnostic_order_items;';
    EXECUTE 'CREATE POLICY patient_view_order_items ON public.diagnostic_order_items FOR SELECT TO authenticated USING (public.get_user_role() = ''PATIENT'' AND order_id IN (SELECT id FROM public.diagnostic_orders WHERE patient_id::text = public.get_user_id()::text));';
    EXECUTE 'DROP POLICY IF EXISTS doctor_view_order_items ON public.diagnostic_order_items;';
    EXECUTE 'CREATE POLICY doctor_view_order_items ON public.diagnostic_order_items FOR SELECT TO authenticated USING (public.get_user_role() = ''DOCTOR'' AND order_id IN (SELECT id FROM public.diagnostic_orders WHERE doctor_id::text = public.get_user_id()::text));';
  END IF;

  -- 7) `diagnostic_results` (join on diagnostic_order_items -> diagnostic_orders)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='diagnostic_results') THEN
    EXECUTE 'DROP POLICY IF EXISTS hospital_manage_results ON public.diagnostic_results;';
    EXECUTE 'CREATE POLICY hospital_manage_results ON public.diagnostic_results FOR ALL TO authenticated USING (public.get_user_role() = ''HOSPITAL_ADMIN'' AND order_item_id IN (SELECT i.id FROM public.diagnostic_order_items i JOIN public.diagnostic_orders o ON i.order_id = o.id WHERE o.hospital_id::text = public.get_user_hospital_id()::text));';
    EXECUTE 'DROP POLICY IF EXISTS patient_view_results ON public.diagnostic_results;';
    EXECUTE 'CREATE POLICY patient_view_results ON public.diagnostic_results FOR SELECT TO authenticated USING (public.get_user_role() = ''PATIENT'' AND order_item_id IN (SELECT i.id FROM public.diagnostic_order_items i JOIN public.diagnostic_orders o ON i.order_id = o.id WHERE o.patient_id::text = public.get_user_id()::text));';
    EXECUTE 'DROP POLICY IF EXISTS doctor_view_results ON public.diagnostic_results;';
    EXECUTE 'CREATE POLICY doctor_view_results ON public.diagnostic_results FOR SELECT TO authenticated USING (public.get_user_role() = ''DOCTOR'' AND order_item_id IN (SELECT i.id FROM public.diagnostic_order_items i JOIN public.diagnostic_orders o ON i.order_id = o.id WHERE o.doctor_id::text = public.get_user_id()::text));';
  END IF;

  -- 8) `doctor_flags` (has doctor_id)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='doctor_flags') THEN
    EXECUTE 'DROP POLICY IF EXISTS platform_admin_flags ON public.doctor_flags;';
    EXECUTE 'CREATE POLICY platform_admin_flags ON public.doctor_flags FOR ALL TO authenticated USING (public.get_user_role() = ''PLATFORM_ADMIN'');';
  END IF;

  -- 9) `doctor_hospital_affiliations` (has doctor_id, hospital_id)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='doctor_hospital_affiliations') THEN
    EXECUTE 'DROP POLICY IF EXISTS hospital_manage_affiliations ON public.doctor_hospital_affiliations;';
    EXECUTE 'CREATE POLICY hospital_manage_affiliations ON public.doctor_hospital_affiliations FOR ALL TO authenticated USING (public.get_user_role() = ''HOSPITAL_ADMIN'' AND hospital_id::text = public.get_user_hospital_id()::text);';
    EXECUTE 'DROP POLICY IF EXISTS doctor_view_affiliations ON public.doctor_hospital_affiliations;';
    EXECUTE 'CREATE POLICY doctor_view_affiliations ON public.doctor_hospital_affiliations FOR SELECT TO authenticated USING (public.get_user_role() = ''DOCTOR'' AND doctor_id::text = public.get_user_id()::text);';
  END IF;

  -- 10) `doctor_identity_docs` (has doctor_id)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='doctor_identity_docs') THEN
    EXECUTE 'DROP POLICY IF EXISTS doctor_own_docs ON public.doctor_identity_docs;';
    EXECUTE 'CREATE POLICY doctor_own_docs ON public.doctor_identity_docs FOR ALL TO authenticated USING (public.get_user_role() = ''DOCTOR'' AND doctor_id::text = public.get_user_id()::text);';
    EXECUTE 'DROP POLICY IF EXISTS hospital_view_doctor_docs ON public.doctor_identity_docs;';
    EXECUTE 'CREATE POLICY hospital_view_doctor_docs ON public.doctor_identity_docs FOR SELECT TO authenticated USING (public.get_user_role() = ''HOSPITAL_ADMIN'' AND doctor_id IN (SELECT doctor_id FROM public.doctor_hospital_affiliations WHERE hospital_id::text = public.get_user_hospital_id()::text));';
  END IF;

  -- 11) `doctor_registration` (has doctor_id)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='doctor_registration') THEN
    EXECUTE 'DROP POLICY IF EXISTS doctor_own_registration ON public.doctor_registration;';
    EXECUTE 'CREATE POLICY doctor_own_registration ON public.doctor_registration FOR ALL TO authenticated USING (public.get_user_role() = ''DOCTOR'' AND doctor_id::text = public.get_user_id()::text);';
    EXECUTE 'DROP POLICY IF EXISTS public_view_registration ON public.doctor_registration;';
    EXECUTE 'CREATE POLICY public_view_registration ON public.doctor_registration FOR SELECT TO PUBLIC USING (true);';
  END IF;

  -- 12) `doctor_roles` (has doctor_id, hospital_id)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='doctor_roles') THEN
    EXECUTE 'DROP POLICY IF EXISTS hospital_manage_doctor_roles ON public.doctor_roles;';
    EXECUTE 'CREATE POLICY hospital_manage_doctor_roles ON public.doctor_roles FOR ALL TO authenticated USING (public.get_user_role() = ''HOSPITAL_ADMIN'' AND hospital_id::text = public.get_user_hospital_id()::text);';
    EXECUTE 'DROP POLICY IF EXISTS doctor_view_roles ON public.doctor_roles;';
    EXECUTE 'CREATE POLICY doctor_view_roles ON public.doctor_roles FOR SELECT TO authenticated USING (public.get_user_role() = ''DOCTOR'' AND doctor_id::text = public.get_user_id()::text);';
  END IF;

  -- 13) `doctors_master` (Global DB, only doctor sees all info, public sees limited profile via views/api)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='doctors_master') THEN
    EXECUTE 'DROP POLICY IF EXISTS doctor_own_profile ON public.doctors_master;';
    EXECUTE 'CREATE POLICY doctor_own_profile ON public.doctors_master FOR SELECT TO authenticated USING (id::text = public.get_user_id()::text);';
    EXECUTE 'DROP POLICY IF EXISTS hospital_view_doctor_master ON public.doctors_master;';
    EXECUTE 'CREATE POLICY hospital_view_doctor_master ON public.doctors_master FOR SELECT TO authenticated USING (public.get_user_role() = ''HOSPITAL_ADMIN'' AND id IN (SELECT doctor_id FROM public.doctor_hospital_affiliations WHERE hospital_id::text = public.get_user_hospital_id()::text));';
    EXECUTE 'DROP POLICY IF EXISTS public_view_active_doctors ON public.doctors_master;';
    EXECUTE 'CREATE POLICY public_view_active_doctors ON public.doctors_master FOR SELECT TO PUBLIC USING (account_status = ''ACTIVE'');';
  END IF;

  -- 14) `hospital_panel_pricing` (has hospital_id)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='hospital_panel_pricing') THEN
    EXECUTE 'DROP POLICY IF EXISTS hospital_manage_panel_pricing ON public.hospital_panel_pricing;';
    EXECUTE 'CREATE POLICY hospital_manage_panel_pricing ON public.hospital_panel_pricing FOR ALL TO authenticated USING (public.get_user_role() = ''HOSPITAL_ADMIN'' AND hospital_id::text = public.get_user_hospital_id()::text);';
    EXECUTE 'DROP POLICY IF EXISTS public_view_panel_pricing ON public.hospital_panel_pricing;';
    EXECUTE 'CREATE POLICY public_view_panel_pricing ON public.hospital_panel_pricing FOR SELECT TO PUBLIC USING (true);';
  END IF;

  -- 15) `hospital_roles` (has hospital_id)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='hospital_roles') THEN
    EXECUTE 'DROP POLICY IF EXISTS hospital_manage_roles ON public.hospital_roles;';
    EXECUTE 'CREATE POLICY hospital_manage_roles ON public.hospital_roles FOR ALL TO authenticated USING (public.get_user_role() = ''HOSPITAL_ADMIN'' AND hospital_id::text = public.get_user_hospital_id()::text);';
  END IF;

  -- 16) `hospital_verification_logs` (has hospital_id)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='hospital_verification_logs') THEN
    EXECUTE 'DROP POLICY IF EXISTS platform_admin_verification ON public.hospital_verification_logs;';
    EXECUTE 'CREATE POLICY platform_admin_verification ON public.hospital_verification_logs FOR ALL TO authenticated USING (public.get_user_role() = ''PLATFORM_ADMIN'');';
    EXECUTE 'DROP POLICY IF EXISTS hospital_view_verification ON public.hospital_verification_logs;';
    EXECUTE 'CREATE POLICY hospital_view_verification ON public.hospital_verification_logs FOR SELECT TO authenticated USING (public.get_user_role() = ''HOSPITAL_ADMIN'' AND hospital_id::text = public.get_user_hospital_id()::text);';
  END IF;

  -- 17) `lab_quality_controls` (has hospital_id)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='lab_quality_controls') THEN
    EXECUTE 'DROP POLICY IF EXISTS hospital_manage_qc ON public.lab_quality_controls;';
    EXECUTE 'CREATE POLICY hospital_manage_qc ON public.lab_quality_controls FOR ALL TO authenticated USING (public.get_user_role() = ''HOSPITAL_ADMIN'' AND hospital_id::text = public.get_user_hospital_id()::text);';
  END IF;

  -- 18) `patient_records` (has patient_id, doctor_id)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='patient_records') THEN
    EXECUTE 'DROP POLICY IF EXISTS patient_view_own_records ON public.patient_records;';
    EXECUTE 'CREATE POLICY patient_view_own_records ON public.patient_records FOR SELECT TO authenticated USING (public.get_user_role() = ''PATIENT'' AND patient_id::text = public.get_user_id()::text);';
    EXECUTE 'DROP POLICY IF EXISTS doctor_manage_patient_records ON public.patient_records;';
    EXECUTE 'CREATE POLICY doctor_manage_patient_records ON public.patient_records FOR ALL TO authenticated USING (public.get_user_role() = ''DOCTOR'' AND doctor_id::text = public.get_user_id()::text);';
  END IF;

  -- 19) `reviews` (has doctor_id, hospital_id, patient_id)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='reviews') THEN
    EXECUTE 'DROP POLICY IF EXISTS public_view_reviews ON public.reviews;';
    EXECUTE 'CREATE POLICY public_view_reviews ON public.reviews FOR SELECT TO PUBLIC USING (true);';
    EXECUTE 'DROP POLICY IF EXISTS patient_manage_reviews ON public.reviews;';
    EXECUTE 'CREATE POLICY patient_manage_reviews ON public.reviews FOR ALL TO authenticated USING (public.get_user_role() = ''PATIENT'' AND patient_id::text = public.get_user_id()::text);';
  END IF;

  -- 20) `slots` (has doctor_id)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='slots') THEN
    EXECUTE 'DROP POLICY IF EXISTS doctor_manage_slots ON public.slots;';
    EXECUTE 'CREATE POLICY doctor_manage_slots ON public.slots FOR ALL TO authenticated USING (public.get_user_role() = ''DOCTOR'' AND doctor_id::text = public.get_user_id()::text);';
    EXECUTE 'DROP POLICY IF EXISTS public_view_slots ON public.slots;';
    EXECUTE 'CREATE POLICY public_view_slots ON public.slots FOR SELECT TO PUBLIC USING (true);';
  END IF;

  -- 21) `staff` (has hospital_id)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='staff') THEN
    EXECUTE 'DROP POLICY IF EXISTS hospital_manage_staff ON public.staff;';
    EXECUTE 'CREATE POLICY hospital_manage_staff ON public.staff FOR ALL TO authenticated USING (public.get_user_role() = ''HOSPITAL_ADMIN'' AND hospital_id::text = public.get_user_hospital_id()::text);';
  END IF;

END
$$ LANGUAGE plpgsql;
-- ---------- END INFO FIX SCRIPT ----------
