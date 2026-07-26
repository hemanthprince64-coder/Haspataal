-- Migration: 08_immutable_audit_logs.sql
-- Description: Creates a trigger to prevent UPDATE or DELETE on audit_logs table, ensuring WORM (Write Once Read Many) compliance.

BEGIN;

CREATE OR REPLACE FUNCTION prevent_audit_log_mutation()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'audit_logs table is immutable (WORM compliance). Updates or deletes are strictly prohibited.';
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS enforce_immutable_audit_logs ON audit_logs;

-- Create the before update or delete trigger
CREATE TRIGGER enforce_immutable_audit_logs
    BEFORE UPDATE OR DELETE ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_log_mutation();

COMMIT;
