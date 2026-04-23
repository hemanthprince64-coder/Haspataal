export interface FollowUp {
  id: string; // UUID
  hospital_id: string; // UUID
  patient_id: string; // UUID
  doctor_id: string; // UUID
  due_date: Date;
  type: string; // 'pregnancy_checkin', 'vaccination', 'chronic_review', 'general_review'
  status: 'scheduled' | 'completed' | 'missed';
  care_pathway: string; // 'PREGNANCY', 'PEDIATRICS', 'CHRONIC_DISEASE', 'GENERAL'
  notes: string | null;
  created_at: Date;
}

export const FOLLOWUP_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS "FollowUp" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID NOT NULL REFERENCES "Hospital"(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES "Patient"(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES "User"(id),
    due_date DATE NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled',
    care_pathway TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    audit_trail JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_followup_date_status ON "FollowUp" (due_date, status);
CREATE INDEX IF NOT EXISTS idx_followup_hospital_patient ON "FollowUp" (hospital_id, patient_id);

ALTER TABLE "FollowUp" ENABLE ROW LEVEL SECURITY;
CREATE POLICY followup_tenant_isolation_policy ON "FollowUp"
    FOR ALL
    USING (hospital_id::text = current_setting('app.hospital_id', true));
ALTER TABLE "FollowUp" FORCE ROW LEVEL SECURITY;
`;
