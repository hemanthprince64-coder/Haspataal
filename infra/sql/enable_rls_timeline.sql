-- ============================================================
-- ENABLE ROW-LEVEL SECURITY: CLINICAL TIMELINE ENGINE
-- Apply this via Supabase SQL Editor (one-time)
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. timeline_events
-- ─────────────────────────────────────────────────────────────
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;

-- Service role bypass (ingestion worker)
CREATE POLICY "timeline_events_service_all"
  ON timeline_events FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Patient reads own events
CREATE POLICY "timeline_events_patient_select"
  ON timeline_events FOR SELECT
  TO authenticated
  USING (
    patient_id = auth.uid()
  );

-- Hospital staff reads events at their hospital
CREATE POLICY "timeline_events_hospital_select"
  ON timeline_events FOR SELECT
  TO authenticated
  USING (
    hospital_id = current_setting('app.hospital_id', true)
  );

-- ─────────────────────────────────────────────────────────────
-- 2. timeline_bookmarks
-- ─────────────────────────────────────────────────────────────
ALTER TABLE timeline_bookmarks ENABLE ROW LEVEL SECURITY;

-- Service role bypass
CREATE POLICY "timeline_bookmarks_service_all"
  ON timeline_bookmarks FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Users can only access their own bookmarks
CREATE POLICY "timeline_bookmarks_owner_all"
  ON timeline_bookmarks FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────
-- 3. timeline_attachments
-- ─────────────────────────────────────────────────────────────
ALTER TABLE timeline_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "timeline_attachments_service_all"
  ON timeline_attachments FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Access controlled via parent event ownership
CREATE POLICY "timeline_attachments_patient_select"
  ON timeline_attachments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM timeline_events te
      WHERE te.id = timeline_attachments.event_id
        AND te.patient_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────
-- 4. timeline_exports
-- ─────────────────────────────────────────────────────────────
ALTER TABLE timeline_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "timeline_exports_service_all"
  ON timeline_exports FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Users can only see their own export jobs
CREATE POLICY "timeline_exports_owner_select"
  ON timeline_exports FOR SELECT
  TO authenticated
  USING (requested_by = auth.uid() OR patient_id = auth.uid());

-- ─────────────────────────────────────────────────────────────
-- 5. timeline_audit
-- ─────────────────────────────────────────────────────────────
ALTER TABLE timeline_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "timeline_audit_service_all"
  ON timeline_audit FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Only SUPER_ADMIN can read audit logs (via app.user_role setting)
CREATE POLICY "timeline_audit_admin_select"
  ON timeline_audit FOR SELECT
  TO authenticated
  USING (
    current_setting('app.user_role', true) = 'SUPER_ADMIN'
  );

-- ─────────────────────────────────────────────────────────────
-- 6. timeline_versions
-- ─────────────────────────────────────────────────────────────
ALTER TABLE timeline_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "timeline_versions_service_all"
  ON timeline_versions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "timeline_versions_patient_select"
  ON timeline_versions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM timeline_events te
      WHERE te.id = timeline_versions.event_id
        AND te.patient_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────
-- 7. timeline_subscriptions
-- ─────────────────────────────────────────────────────────────
ALTER TABLE timeline_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "timeline_subscriptions_service_all"
  ON timeline_subscriptions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "timeline_subscriptions_owner_all"
  ON timeline_subscriptions FOR ALL
  TO authenticated
  USING (subscriber_id = auth.uid())
  WITH CHECK (subscriber_id = auth.uid());

-- ─────────────────────────────────────────────────────────────
-- 8. timeline_snapshots
-- ─────────────────────────────────────────────────────────────
ALTER TABLE timeline_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "timeline_snapshots_service_all"
  ON timeline_snapshots FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "timeline_snapshots_patient_select"
  ON timeline_snapshots FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid());

-- ─────────────────────────────────────────────────────────────
-- 9. timeline_tags
-- ─────────────────────────────────────────────────────────────
ALTER TABLE timeline_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "timeline_tags_service_all"
  ON timeline_tags FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "timeline_tags_patient_select"
  ON timeline_tags FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM timeline_events te
      WHERE te.id = timeline_tags.event_id
        AND te.patient_id = auth.uid()
    )
  );
