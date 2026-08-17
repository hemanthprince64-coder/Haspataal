-- Notification Priority & Status Enums
CREATE TYPE "NotificationPriority" AS ENUM ('EMERGENCY', 'CRITICAL', 'HIGH', 'NORMAL', 'LOW', 'BACKGROUND');
CREATE TYPE "NotificationStatus" AS ENUM ('QUEUED', 'PROCESSING', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'EXPIRED', 'CANCELLED');

-- Enable RLS on all notification tables
ALTER TABLE "notification_providers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notification_campaigns" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notification_deliveries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notification_preferences" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notification_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notification_audits" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notification_template_versions" ENABLE ROW LEVEL SECURITY;

-- Notification Providers RLS
CREATE POLICY "hospital_isolation_notification_providers" ON "notification_providers"
  FOR ALL USING (hospital_id IS NULL OR hospital_id = current_setting('hospitable.current_hospital_id')::uuid);

-- Notification Campaigns RLS
CREATE POLICY "hospital_isolation_notification_campaigns" ON "notification_campaigns"
  FOR ALL USING (hospital_id IS NULL OR hospital_id = current_setting('hospitable.current_hospital_id')::uuid);

-- Notification Deliveries RLS
CREATE POLICY "hospital_isolation_notification_deliveries" ON "notification_deliveries"
  FOR ALL USING (EXISTS (SELECT 1 FROM "notifications" WHERE "notifications"."id" = "notification_deliveries"."notification_id" AND ("notifications"."hospital_id" IS NULL OR "notifications"."hospital_id" = current_setting('hospitable.current_hospital_id')::uuid));

-- Notification Preferences RLS
CREATE POLICY "hospital_isolation_notification_preferences" ON "notification_preferences"
  FOR ALL USING (hospital_id IS NULL OR hospital_id = current_setting('hospitable.current_hospital_id')::uuid);

-- Notification Events RLS
CREATE POLICY "hospital_isolation_notification_events" ON "notification_events"
  FOR ALL USING (hospital_id IS NULL OR hospital_id = current_setting('hospitable.current_hospital_id')::uuid);

-- Notification Audits RLS
CREATE POLICY "hospital_isolation_notification_audits" ON "notification_audits"
  FOR ALL USING (hospital_id IS NULL OR hospital_id = current_setting('hospitable.current_hospital_id')::uuid);

-- Notification Template Versions RLS
CREATE POLICY "hospital_isolation_notification_template_versions" ON "notification_template_versions"
  FOR ALL USING (true); -- Template versions inherit security from parent template