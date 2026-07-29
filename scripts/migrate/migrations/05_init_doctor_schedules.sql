-- ================================================================
-- 05_INIT_DOCTOR_SCHEDULES.SQL
-- Implement Recurring Weekly Schedules for Slot Generation
-- ================================================================

CREATE TABLE IF NOT EXISTS doctor_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL, -- 0 (Sunday) to 6 (Saturday)
    start_time TIME NOT NULL, -- e.g., '09:00:00'
    end_time TIME NOT NULL,   -- e.g., '17:00:00'
    slot_duration_minutes INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(doctor_id, day_of_week, start_time)
);

-- Index for schedule lookup
CREATE INDEX IF NOT EXISTS idx_schedule_doctor ON doctor_schedules(doctor_id);
