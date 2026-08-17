-- Search Platform Tables

CREATE TABLE searchable_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  hospital_id UUID,
  patient_id UUID,
  title TEXT NOT NULL,
  content TEXT,
  metadata JSONB,
  search_vector TSVECTOR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_search_vector ON searchable_entities USING GIN(search_vector);
CREATE INDEX idx_search_entity_type ON searchable_entities(entity_type);
CREATE INDEX idx_search_hospital ON searchable_entities(hospital_id);

CREATE TABLE search_synonyms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term TEXT UNIQUE NOT NULL,
  synonyms TEXT[] NOT NULL,
  category TEXT,
  hospital_id UUID,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE search_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  hospital_id UUID,
  query TEXT,
  entity_types TEXT[],
  result_count INTEGER,
  latency_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_search_logs_hospital ON search_logs(hospital_id);
CREATE INDEX idx_search_logs_time ON search_logs(created_at);