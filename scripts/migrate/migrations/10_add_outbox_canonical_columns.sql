-- ================================================================
-- 10_ADD_OUTBOX_CANONICAL_COLUMNS.SQL
-- Phase 0A: backward-compatible canonical event-envelope foundation.
-- All new columns are NULLABLE. No destructive rename. No NOT NULL
-- constraints on fields legacy producers cannot supply. Existing
-- rows remain valid and continue to process.
-- ================================================================

-- ---------- OutboxEvent: canonical envelope columns ----------
ALTER TABLE outbox_events
    ADD COLUMN IF NOT EXISTS event_version        INTEGER,
    ADD COLUMN IF NOT EXISTS aggregate_type        TEXT,
    ADD COLUMN IF NOT EXISTS aggregate_id          TEXT,
    ADD COLUMN IF NOT EXISTS scope_type            TEXT,
    ADD COLUMN IF NOT EXISTS hospital_id           TEXT,
    ADD COLUMN IF NOT EXISTS tenant_id             TEXT,
    ADD COLUMN IF NOT EXISTS actor_id              TEXT,
    ADD COLUMN IF NOT EXISTS actor_type            TEXT,
    ADD COLUMN IF NOT EXISTS actor_role            TEXT,
    ADD COLUMN IF NOT EXISTS correlation_id         TEXT,
    ADD COLUMN IF NOT EXISTS causation_id          TEXT,
    ADD COLUMN IF NOT EXISTS depth                 INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS occurred_at           TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS delivery_status       TEXT DEFAULT 'PENDING';

-- Tracing / observability indexes (all on already-nullable columns).
CREATE INDEX IF NOT EXISTS idx_outbox_correlation_id  ON outbox_events (correlation_id);
CREATE INDEX IF NOT EXISTS idx_outbox_aggregate_id    ON outbox_events (aggregate_id);
CREATE INDEX IF NOT EXISTS idx_outbox_delivery_status ON outbox_events (delivery_status);

-- ---------- EventLog repair (services/event.service.ts mismatch) ----------
-- The service writes idempotency_key + metadata; these columns were missing.
ALTER TABLE event_logs
    ADD COLUMN IF NOT EXISTS idempotency_key TEXT,
    ADD COLUMN IF NOT EXISTS metadata       JSONB;

-- Partial unique index supports ON CONFLICT (idempotency_key) DO NOTHING
-- without forcing every legacy row to have a key.
CREATE UNIQUE INDEX IF NOT EXISTS uq_event_logs_idempotency_key
    ON event_logs (idempotency_key)
    WHERE idempotency_key IS NOT NULL;

-- ---------- Dead-letter repository (Phase 0A failure-model foundation) ----------
-- Exhausted events are NOT silently dropped; they are persisted here so a
-- later Phase 0B worker / admin alert can act on them.
CREATE TABLE IF NOT EXISTS dead_letter_events (
    id                  TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    original_outbox_id  TEXT NOT NULL,
    event_type          TEXT NOT NULL,
    payload             JSONB NOT NULL,
    last_error          TEXT,
    error_count         INTEGER,
    dead_lettered_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dead_letter_event_type ON dead_letter_events (event_type);
CREATE INDEX IF NOT EXISTS idx_dead_letter_created    ON dead_letter_events (dead_lettered_at);
