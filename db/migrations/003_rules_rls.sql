-- Enable RLS on rules tables
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE rule_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rule_schedules ENABLE ROW LEVEL SECURITY;

-- Rules: Hospital isolation (rules can be global or hospital-specific)
CREATE POLICY "rules_hospital_isolation" ON rules
  FOR ALL USING (
    hospital_id IS NULL OR
    hospital_id = current_setting('request.hospital_id')::uuid
  ) WITH CHECK (
    hospital_id IS NULL OR
    hospital_id = current_setting('request.hospital_id')::uuid
  );

-- Rule Executions: Hospital isolation  
CREATE POLICY "rule_executions_hospital_isolation" ON rule_executions
  FOR ALL USING (
    hospital_id IS NULL OR
    hospital_id = current_setting('request.hospital_id')::uuid
  ) WITH CHECK (
    hospital_id IS NULL OR
    hospital_id = current_setting('request.hospital_id')::uuid
  );

-- Rule Schedules: Hospital isolation
CREATE POLICY "rule_schedules_hospital_isolation" ON rule_schedules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM rules 
      WHERE rules.id = rule_schedules.rule_id 
      AND (rules.hospital_id IS NULL OR rules.hospital_id = current_setting('request.hospital_id')::uuid)
    )
  );