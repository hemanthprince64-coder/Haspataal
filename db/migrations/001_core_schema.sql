-- Migration: 001_core_schema
-- Description: Core Infrastructure for Haspataal with strict RLS and Event Engine

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: Hospital (Tenant Root)
CREATE TABLE IF NOT EXISTS "Hospital" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    verified_at TIMESTAMPTZ,
    plan_tier TEXT DEFAULT 'basic',
    onboarding_pct INTEGER DEFAULT 0,
    audit_trail JSONB DEFAULT '{}'::jsonb
);

-- Table: User
CREATE TABLE IF NOT EXISTS "User" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID NOT NULL REFERENCES "Hospital"(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    email TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    audit_trail JSONB DEFAULT '{}'::jsonb
);

-- Table: Patient
CREATE TABLE IF NOT EXISTS "Patient" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID NOT NULL REFERENCES "Hospital"(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    dob DATE,
    phone TEXT,
    abha_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    audit_trail JSONB DEFAULT '{}'::jsonb
);

-- Table: EventLog (Single Source of Truth)
CREATE TABLE IF NOT EXISTS "EventLog" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ DEFAULT now(),
    hospital_id UUID NOT NULL REFERENCES "Hospital"(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES "Patient"(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    idempotency_key TEXT UNIQUE,
    audit_trail JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_eventlog_hospital_type_timestamp ON "EventLog" (hospital_id, event_type, timestamp);

-- Enable Row Level Security (RLS)
ALTER TABLE "Hospital" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Patient" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EventLog" ENABLE ROW LEVEL SECURITY;

-- Create Policies using current_setting
-- For Hospital, they can only see their own row
CREATE POLICY hospital_tenant_isolation_policy ON "Hospital"
    FOR ALL
    USING (id::text = current_setting('app.hospital_id', true));

-- For other tables, they isolate based on hospital_id
CREATE POLICY user_tenant_isolation_policy ON "User"
    FOR ALL
    USING (hospital_id::text = current_setting('app.hospital_id', true));

CREATE POLICY patient_tenant_isolation_policy ON "Patient"
    FOR ALL
    USING (hospital_id::text = current_setting('app.hospital_id', true));

CREATE POLICY eventlog_tenant_isolation_policy ON "EventLog"
    FOR ALL
    USING (hospital_id::text = current_setting('app.hospital_id', true));

-- Force RLS for table owners (if necessary, though usually applies to app users)
ALTER TABLE "Hospital" FORCE ROW LEVEL SECURITY;
ALTER TABLE "User" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Patient" FORCE ROW LEVEL SECURITY;
ALTER TABLE "EventLog" FORCE ROW LEVEL SECURITY;
