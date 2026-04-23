export interface AnalyticsDaily {
  hospital_id: string;
  date: string;
  revenue: number;
  patient_count: number;
  prescriptions_count: number;
  followups_scheduled: number;
  followups_completed: number;
  updated_at: Date;
}

export const ANALYTICS_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS "AnalyticsDaily" (
    hospital_id UUID NOT NULL REFERENCES "Hospital"(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    revenue DECIMAL(15, 2) DEFAULT 0,
    patient_count INTEGER DEFAULT 0,
    prescriptions_count INTEGER DEFAULT 0,
    followups_scheduled INTEGER DEFAULT 0,
    followups_completed INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (hospital_id, date)
);

CREATE INDEX IF NOT EXISTS idx_analytics_date ON "AnalyticsDaily" (date);
CREATE INDEX IF NOT EXISTS idx_analytics_hospital ON "AnalyticsDaily" (hospital_id);

-- Adoption Tracking per Doctor
CREATE TABLE IF NOT EXISTS "DoctorAdoption" (
    hospital_id UUID NOT NULL REFERENCES "Hospital"(id),
    doctor_id UUID NOT NULL REFERENCES "User"(id),
    date DATE NOT NULL,
    prescriptions_count INTEGER DEFAULT 0,
    PRIMARY KEY (hospital_id, doctor_id, date)
);

ALTER TABLE "AnalyticsDaily" ENABLE ROW LEVEL SECURITY;
CREATE POLICY analytics_tenant_isolation_policy ON "AnalyticsDaily"
    FOR ALL
    USING (hospital_id::text = current_setting('app.hospital_id', true));

ALTER TABLE "DoctorAdoption" ENABLE ROW LEVEL SECURITY;
CREATE POLICY adoption_tenant_isolation_policy ON "DoctorAdoption"
    FOR ALL
    USING (hospital_id::text = current_setting('app.hospital_id', true));
`;
