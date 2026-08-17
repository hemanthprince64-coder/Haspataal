
-- Create partial unique index for primary contacts
CREATE UNIQUE INDEX "patient_contact_points_primary_idx" 
ON "patient_contact_points" ("patient_id", "type") 
WHERE "is_primary" = true AND "status" = 'ACTIVE';
