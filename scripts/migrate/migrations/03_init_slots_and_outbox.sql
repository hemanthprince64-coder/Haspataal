-- ================================================================
-- 03_INIT_SLOTS_AND_OUTBOX.SQL
-- Implement Slot Engine and Transactional Outbox
-- ================================================================

-- 1. Slot Management Table
CREATE TABLE IF NOT EXISTS doctor_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    is_booked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(doctor_id, start_time)
);

-- 2. Transactional Outbox Table
-- Ensures consistency between DB updates and Queue jobs
CREATE TABLE IF NOT EXISTS outbox_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL, -- e.g., 'APPOINTMENT_BOOKED', 'BILL_GENERATED'
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Index for polling pending events
CREATE INDEX IF NOT EXISTS idx_outbox_pending ON outbox_events(created_at) WHERE processed = FALSE;
