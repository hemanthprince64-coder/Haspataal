-- ================================================================
-- 11_PHASE0B_IDEMPOTENCY_DLQ.SQL
-- Phase 0B: Durable Idempotency and DLQ transitions.
-- ================================================================

-- ---------- OutboxEvent leases and backoff ----------
ALTER TABLE outbox_events
    ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS locked_until  TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS locked_by     TEXT;

-- ---------- Consumer Idempotency Ledger ----------
CREATE TABLE IF NOT EXISTS consumer_idempotency_ledger (
    event_id        TEXT NOT NULL,
    consumer_name   TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'COMPLETED',
    processed_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (event_id, consumer_name)
);

-- Note: dead_letter_events table was already created in migration 10.
-- We do not recreate it here.
