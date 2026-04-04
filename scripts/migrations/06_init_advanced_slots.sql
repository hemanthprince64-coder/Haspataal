-- ================================================================
-- 06_INIT_ADVANCED_SLOTS.SQL
-- Advanced Capacity, Emergency Blocks, and Safety Checks
-- ================================================================

-- 1. Upgrade doctor_slots with Capacity
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'doctor_slots' AND column_name = 'capacity') THEN
        ALTER TABLE doctor_slots ADD COLUMN capacity INTEGER DEFAULT 1;
    END IF;
    
    -- Remove the redundant 'is_booked' flag manually if deriving from appointments
    -- For now, keep it for legacy UI compatibility but deprecate it in logic
END $$;

-- 2. Emergency Doctor Blocks (Leave/Emergency)
CREATE TABLE IF NOT EXISTS doctor_slot_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
    block_start TIMESTAMP NOT NULL,
    block_end TIMESTAMP NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(doctor_id, block_start)
);

-- 3. Integrity Check: Ensure appointments never exceed capacity
-- Note: Practical enforcement is in the application transaction, 
-- but this is a fail-safe (if your DB supports deferred constraints)
-- For Supabase/Standard Postgres, we rely on the Transaction + UNIQUE Constraints.
