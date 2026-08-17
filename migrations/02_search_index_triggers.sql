-- Triggers for automatic search index updates
-- These run on INSERT/UPDATE to key tables

-- Function to refresh doctor search index
CREATE OR REPLACE FUNCTION refresh_doctor_search_index()
RETURNS TRIGGER AS $$
BEGIN
  -- Only publish event, actual refresh handled by worker
  PERFORM pg_notify('search_index_refresh', 
    json_build_object(
      'doctor_id', COALESCE(NEW.doctor_id, OLD.doctor_id),
      'hospital_id', COALESCE(NEW.hospital_id, OLD.hospital_id)
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on doctor verification updates
CREATE TRIGGER doctor_verification_changed
AFTER UPDATE OF status ON doctor_verification
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION refresh_doctor_search_index();

-- Trigger on affiliation status updates
CREATE TRIGGER doctor_affiliation_changed
AFTER UPDATE OF verification_status ON doctor_hospital_affiliations
FOR EACH ROW
WHEN (OLD.verification_status IS DISTINCT FROM NEW.verification_status)
EXECUTE FUNCTION refresh_doctor_search_index();

-- Trigger on doctor profile updates
CREATE TRIGGER doctor_profile_updated
AFTER UPDATE OF speciality, experience_years ON doctor_profile
FOR EACH ROW
EXECUTE FUNCTION refresh_doctor_search_index();